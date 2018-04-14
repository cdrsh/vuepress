<?php
namespace App\Controller;

use Valitron\Validator;
use Psr\HttpMessage\ServerRequestInterface as Request;
use Psr\HttpMessage\ResponseInterface as Response;

//Posts
class PostController
{
    protected $container;

    public function __construct($c)
    {
        $this->container = $c;
    }



    //Get array of titles and textx of the post by lang prefix
    public function getTitleLngFields($dataIN)
    {
        $keys=array_keys($dataIN);
        $arrOut=[
            'titles'=>array(),
            'txts'=>array()
        ];
        for ($i=0; $i<count($keys); $i++) {
            $cnt=preg_match_all(
                '/(title_[a-z]{2})/',
                $keys[$i],
                $matches
            );
            if ($cnt>0) {
                array_push($arrOut['titles'], $keys[$i]);
            }

            $cnt=preg_match_all(
                '/(txt_[a-z]{2})/',
                $keys[$i],
                $matches
            );
            if ($cnt>0) {
                array_push($arrOut['txts'], $keys[$i]);
            }
        }
        return $arrOut;
    }



    //Post Add
    public function pAdd($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        ini_set("date.timezone", "Europe/Moscow");
        $dt=date('Y-m-d H:i:s');
        $user=0;
        $post_id=-1;
        $db=$this->container['db'];

        //Check user access rights
        if (!chkUserPrivileges($request, $db, [
            'ADMIN_PAGE_ACCESS',
            'WRITE_POST'
        ])) {
            return $response->withJson([
                'status'        => 0,
                'err'           => 'Access denied',
            ]);
        }

        try {
            $parsedBody = $request->getParsedBody();
            $tableNames=$this->container['tableNames'];

            //Get content languages
            $lngsArr=array();
            $sql="SELECT code FROM ".$tableNames['lang']." WHERE used=1";
            $stmt=$db->prepare($sql);
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($lngsArr, $row['code']);
            }

            //Validate input data
            $bValid=true;
            for ($i=0;$i<count($lngsArr);$i++) {
                if (!isset($parsedBody["title_".$lngsArr[$i]]) ||
                    !isset($parsedBody["txt_".$lngsArr[$i]])) {
                    $bValid=false;
                    break;
                }
            }
            if (!$bValid) {
                return $response->withJson([
                    'status' => 0,
                    'err' => "Not all data set"
                ]);
            }

            //Get user by Token
            $usrid=-1;
            $token=substr($request->getHeaders()["HTTP_AUTHORIZATION"][0], 7);
            $sql="SELECT usrid FROM ".$tableNames['tokens']." WHERE at=:at";
            $stmt=$db->prepare($sql);
            $stmt->bindParam(':at', $token);
            $stmt->execute();
            if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $usrid=$row['usrid'];
            }

            //Add post into DB
            $txts="";
            $txtsFlds="";
            for ($i=0;$i<count($lngsArr);$i++) {
                $txts.=":title_".$i.", :txt_".$i.",";
                $txtsFlds.="title_".$lngsArr[$i].", txt_".$lngsArr[$i].",";
            }
            if (count($lngsArr)>0) {
                $txts=substr($txts, 0, -1);
                $txtsFlds=substr($txtsFlds, 0, -1);
            }
            $sql="INSERT INTO ".$tableNames['posts'];
            $sql.="( usrid, dt, ispub, ".$txtsFlds.") VALUES (:usrid, :dt, :ispub,";
            $sql.=$txts.")";
            $stmt=$db->prepare($sql);
            $stmt->bindParam(':ispub', $parsedBody["ispub"]);
            $stmt->bindParam(':dt', $dt);
            $stmt->bindParam(':usrid', $usrid);
            for ($i=0;$i<count($lngsArr);$i++) {
                $stmt->bindParam(':title_'.$i, $parsedBody["title_".$lngsArr[$i]]);
                $stmt->bindParam(':txt_'.$i, $parsedBody["txt_".$lngsArr[$i]]);
            }
            $stmt->execute();
            $post_id=$db->lastInsertId();

            //Prepare input categories as array
            //with catid keys and user fields values
            $catsIn=$parsedBody['categories'];
            $catIds="";
            $catIdsArr=array();
            for ($i=0;$i<count($catsIn);$i++) {
                $catIds.="catid=".$catsIn[$i]["id"]." OR ";
                $ufldids="";
                $ufldvls="";
                if (isset($catsIn[$i]["ufldsArr"])) {
                    $ufldsArr=$catsIn[$i]["ufldsArr"];
                    for ($j=0;$j<count($ufldsArr);$j++) {
                        $ufldids.=":".$ufldsArr[$j]['fldid'];
                        $ufldvls.=":!:".$ufldsArr[$j]['valf'];
                    }
                }
                $catIdsArr[$catsIn[$i]["id"]]=[
                    'num'=>1,
                    'ufldids'=>$ufldids,
                    'ufldvls'=>$ufldvls
                ];
            }

            //If categories has come - add links to post
            if (count($catsIn)>0) {

                //Get numbers of selected categories
                $catIds=substr($catIds, 0, -4);
                $sql=" SELECT MAX(num)+1 AS mxnum, catid ";
                $sql.=" FROM ".$tableNames["cat_post_sv"];
                $sql.=" WHERE ".$catIds." GROUP BY catid";
                $stmt=$db->prepare($sql);
                $stmt->execute();
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    foreach ($catIdsArr as $key => $value) {
                        if ($key==$row["catid"]) {
                            $catIdsArr[$key]['num']=intval($row["mxnum"]);
                            break;
                        }
                    }
                }

                //Add link category-post-userfields
                $sql="INSERT INTO ".$tableNames['cat_post_sv'];
                $sql.=" (catid, postid, num, dt, ufldids, ufldvls,vws) VALUES ";
                $stmt=$db->prepare($sql);
                $catsIn=$parsedBody['categories'];
                $catIds=array();
                for ($i=0;$i<count($catsIn);$i++) {
                    if (!array_key_exists($catsIn[$i]["id"], $catIdsArr)) {
                        break;
                    }
                    $oneCatArr=$catIdsArr[$catsIn[$i]["id"]];
                    $catIds[] = '('.
                    intval($catsIn[$i]["id"]).','.
                    intval($post_id).','.
                    intval($oneCatArr['num']).','.
                    $db->quote($dt).','.
                    $db->quote($oneCatArr['ufldids']).','.
                    $db->quote($oneCatArr['ufldvls']).',0)';
                }
                $sql.=implode(',', $catIds);
                $stmt=$db->prepare($sql);
                $stmt->execute();
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status' => $status,
            'err' => $err,
            'dt'=>$dt,
            'postid'=>$post_id,
        ]);
    }



    //Validate delete selected
    public function validateDeleteSelected($dataIN)
    {
        $v = new \Valitron\Validator($dataIN);

        $v->rule('required', "ids")->message('{field} must be set');

        $err="";
        $status=1;
        if (!$v->validate()) {
            $err=$v->errors();
            $err["validatorErr"]=1;
            $status=0;
        }
        return [
            "err" => $err,
            "status" => $status
        ];
    }



    //Posts Delete
    public function pDeleteSelected($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error

        try {
            $db=$this->container['db'];
            $parsedBody = $request->getParsedBody();
            $tableNames=$this->container['tableNames'];

            //Check user access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS',
                'WRITE_POST'
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }

            //Validate input data
            $res=$this->validateDeleteSelected($parsedBody);
            if ($res["status"]==0) {
                return $response->withJson($res);
            }

            $ids=$parsedBody['ids'];

            //Delete posts from DB
            $sql="DELETE FROM ".$tableNames['posts']." WHERE ";
            $sqlPostSv="";
            for ($i=0; $i<count($ids); $i++) {
                $sql.="id=:id".$i." OR ";
                $sqlPostSv.=" postid=:postid".$i." OR ";
            }
            if (count($ids)>0) {
                $sql=substr($sql, 0, -4);
                $sqlPostSv=substr($sqlPostSv, 0, -4);
            }
            $stmt=$db->prepare($sql);
            for ($i=0; $i<count($ids); $i++) {
                $stmt->bindParam(":id".$i, $ids[$i]);
            }
            $stmt->execute();

            //Delete links with categories
            $sql="DELETE FROM ".$tableNames["cat_post_sv"]." WHERE ".$sqlPostSv;
            $stmt=$db->prepare($sql);
            for ($i=0; $i<count($ids); $i++) {
                $stmt->bindParam(":postid".$i, $ids[$i]);
            }
            $stmt->execute();
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status' => $status,
            'err' => $err,
        ]);
    }



    //Get posts by page num
    public function pGet($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $arr=array();
        $usersArr=array();
        $db=$this->container['db'];
        $tableNames=$this->container['tableNames'];

        try {
            
            //Check user access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS',
                'READ_POST'
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }

            $page=$request->getQueryParam("page", 0);
            $itms=$request->getQueryParam("itms", 0);
            $catid=$request->getQueryParam("catid", -1);

            //Get posts by page num limited and grouped
            $limit="";
            $offset="";
            $catIdStr="";
            if ($catid!=-1) {
                $catIdStr=" WHERE ".$tableNames["cat_post_sv"].".catid=:catid ";
            }
            $orderBy=" ORDER BY ".$tableNames["cat_post_sv"].".num ";
            if ($catid==-1) {
                $orderBy=" ORDER BY ".$tableNames["posts"].".dt,";
                $orderBy.=$tableNames["posts"].".id ";
            }
            $groupBy="";
            if ($catid==-1) {
                $groupBy=" GROUP BY ".$tableNames["posts"].".id";
            }
            if ($itms>0 && $page>0) {
                $limit=" LIMIT ".$itms;
                $offset=" OFFSET ".(($page-1)*10);
                $sql="SELECT ".$tableNames['posts'].".* FROM ".$tableNames['posts'];
                $sql.=" LEFT JOIN ".$tableNames["cat_post_sv"]." ON ";
                $sql.=$tableNames["cat_post_sv"].".postid=";
                $sql.=$tableNames['posts'].".id ";
                $sql.=$catIdStr.$groupBy.$orderBy.$limit.$offset;
                $stmt=$db->prepare($sql);
                if ($catid!=-1) {
                    $stmt->bindParam(":catid", $catid);
                }
                $stmt->execute();
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    $row["user"]=-1;
                    array_push($arr, $row);
                }
            }

            //Get authors of posts
            $usridStr="";
            for ($i=0;$i<count($arr);$i++) {
                $usridStr.=" id=:id".$i." OR ";
            }
            if (count($arr)>0) {
                $usridStr=" WHERE ".substr($usridStr, 0, -4);
            }
            $sql="SELECT * FROM ".$tableNames['users'].$usridStr;
            $stmt=$db->prepare($sql);
            for ($i=0;$i<count($arr);$i++) {
                $stmt->bindParam(":id".$i, $arr[$i]["usrid"]);
            }
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($usersArr, $row);
            }
            for ($i=0;$i<count($arr);$i++) {
                for ($j=0;$j<count($usersArr);$j++) {
                    if ($arr[$i]["usrid"]==$usersArr[$j]["id"]) {
                        $arr[$i]["user"]=$usersArr[$j];
                    }
                }
            }

            //Get language codes
            $postIds="";
            for ($i=0; $i<count($arr); $i++) {
                $postIds.=$tableNames['posts'].".id=".$arr[$i]["id"]." OR ";
            }
            if (strlen($postIds)>4) {
                $postIds=" WHERE ".substr($postIds, 0, -4);
            }
            $sql="SELECT code FROM ".$tableNames['lang']." WHERE used=1";
            $stmt=$db->prepare($sql);
            $stmt->execute();
            $codesStr="";
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $codesStr.=$tableNames['category'].".name_".$row['code'].",";
            }
            if (strlen($codesStr)>0) {
                $codesStr=substr($codesStr, 0, -1);
            }

            //Get categories by post ids
            $sql="SELECT ".$tableNames['cat_post_sv'].".postid, ";
            $sql.=$tableNames['category'].".id, ";
            $sql.=$codesStr." FROM ".$tableNames['category']." ";
            $sql.=" LEFT JOIN ".$tableNames['cat_post_sv']." ";
            $sql.=" ON ".$tableNames['cat_post_sv'].".catid=";
            $sql.=$tableNames['category'].".id ";
            $sql.=" WHERE ".$tableNames['cat_post_sv'].".postid ";
            $sql.=" IN (SELECT ".$tableNames['posts'].".id FROM ";
            $sql.=$tableNames['posts']." ".$postIds.") ";
            $stmt=$db->prepare($sql);
            $stmt->execute();
            $categories=array();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($categories, $row);
            }

            //Map categories to posts by post id
            for ($i=0; $i<count($arr); $i++) {
                $arr[$i]["categories"]=array();
                for ($j=0; $j<count($categories); $j++) {
                    if ($arr[$i]["id"]==$categories[$j]["postid"]) {
                        array_push($arr[$i]["categories"], $categories[$j]);
                    }
                }
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }

        return $response->withJson([
            'status'    => $status,
            'err'       => $err,
            'posts'     => $arr,
            'categoies'=>$categories,
        ]);
    }



    //Find post
    public function pFind($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $arr=array();
        $itemsCount=0;
        $usersArr=array();
        $db=$this->container['db'];

        //Check user access rights
        if (!chkUserPrivileges($request, $db, [
            'ADMIN_PAGE_ACCESS',
            'READ_POST'
        ])) {
            return $response->withJson([
                'status'        => 0,
                'err'           => 'Access denied',
            ]);
        }

        try {
            $findTxt=$request->getQueryParam("findTxt", "");
            $findBy=$request->getQueryParam("findBy", "v1");
            $pgNum=$request->getQueryParam("pgNum", 1);
            $itemsPerPage=$request->getQueryParam("itemsPerPage", 10);
            $langCode=$request->getQueryParam("langCode", "en");
            $tableNames=$this->container['tableNames'];
            
            $limit="";
            $offset="";
            $where="";
            if ($findBy=="v1") {
                $where=" WHERE ".$tableNames["posts"].".title_".$langCode;
                $where.=" LIKE ".$db->quote("%".$findTxt."%")." ";
            }
            if ($findBy=="v2") {
                $where=" WHERE ".$tableNames["posts"].".txt_".$langCode;
                $where.=" LIKE ".$db->quote("%".$findTxt."%")." ";
            }
            $orderBy=" ORDER BY ".$tableNames["cat_post_sv"].".num ";
            $groupBy=" GROUP BY ".$tableNames["posts"].".id ";

            if (intval($itemsPerPage)>0 && intval($pgNum)>0) {

                //Get posts by page num
                $limit=" LIMIT ".$itemsPerPage;
                $offset=" OFFSET ".(($pgNum-1)*$itemsPerPage);
                $sql="SELECT ".$tableNames['posts'].".* FROM ".$tableNames['posts'];
                $sql.=" LEFT JOIN ".$tableNames["cat_post_sv"]." ON ";
                $sql.=$tableNames["cat_post_sv"].".postid=";
                $sql.=$tableNames['posts'].".id";
                $sql.=$where.$groupBy.$orderBy.$limit.$offset;
                $stmt=$db->prepare($sql);
                $stmt->execute();
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    $row["user"]=-1;
                    array_push($arr, $row);
                }

                //Get count of posts
                $sql="SELECT COUNT(tbl1.id) AS cnt FROM ";
                $sql.="( SELECT ".$tableNames['posts'].".id FROM ".$tableNames['posts'];
                $sql.=" LEFT JOIN ".$tableNames["cat_post_sv"]." ON ";
                $sql.=$tableNames["cat_post_sv"].".postid=";
                $sql.=$tableNames["posts"].".id";
                $sql.=$where.$groupBy.") AS tbl1";
                $stmt=$db->prepare($sql);
                $stmt->execute();
                if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    $itemsCount=$row["cnt"];
                }
            }

            //Get authors of posts
            $usridStr="";
            for ($i=0;$i<count($arr);$i++) {
                $usridStr.=" id=:id".$i." OR ";
            }
            if (count($arr)>0) {
                $usridStr=" WHERE ".substr($usridStr, 0, -4);
            }
            $sql="SELECT * FROM ".$tableNames['users'].$usridStr;
            $stmt=$db->prepare($sql);
            for ($i=0;$i<count($arr);$i++) {
                $stmt->bindParam(":id".$i, $arr[$i]["usrid"]);
            }
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($usersArr, $row);
            }
            for ($i=0;$i<count($arr);$i++) {
                for ($j=0;$j<count($usersArr);$j++) {
                    if ($arr[$i]["usrid"]==$usersArr[$j]["id"]) {
                        $arr[$i]["user"]=$usersArr[$j];
                    }
                }
            }

            $postIds="";
            for ($i=0; $i<count($arr); $i++) {
                $postIds.=$tableNames['posts'].".id=".$arr[$i]["id"]." OR ";
            }
            if (strlen($postIds)>4) {
                $postIds=" WHERE ".substr($postIds, 0, -4);
            }

            //Get language codes
            $sql="SELECT code FROM ".$tableNames['lang']." WHERE used=1";
            $stmt=$db->prepare($sql);
            $stmt->execute();
            $codesStr="";
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $codesStr.=$tableNames['category'].".name_".$row['code'].",";
            }
            if (strlen($codesStr)>0) {
                $codesStr=substr($codesStr, 0, -1);
            }

            //Get categories of posts
            $sql="SELECT ".$tableNames['cat_post_sv'].".postid, ";
            $sql.=$tableNames['category'].".id, ".$codesStr;
            $sql.=" FROM ".$tableNames['category']." ";
            $sql.=" LEFT JOIN ".$tableNames['cat_post_sv']." ";
            $sql.=" ON ".$tableNames['cat_post_sv'].".catid=";
            $sql.=$tableNames['category'].".id ";
            $sql.=" WHERE ".$tableNames['cat_post_sv'].".postid ";
            $sql.=" IN (SELECT ".$tableNames['posts'].".id FROM ";
            $sql.=$tableNames['posts']." ".$postIds.") ";
            $sql.=" GROUP BY ".$tableNames['category'].".id";
            $stmt=$db->prepare($sql);
            $stmt->execute();
            $categories=array();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($categories, $row);
            }

            //Map categories to posts
            for ($i=0; $i<count($arr); $i++) {
                $arr[$i]["categories"]=array();
                for ($j=0; $j<count($categories); $j++) {
                    if ($arr[$i]["id"]==$categories[$j]["postid"]) {
                        array_push($arr[$i]["categories"], $categories[$j]);
                    }
                }
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'    =>  $status,
            'err'       =>  $err,
            'posts'     =>  $arr,
            'itemsCount'=>  $itemsCount
        ]);
    }



    //Get posts paginator
    public function pGetPaginator($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $cnt=0;
        $db=$this->container['db'];
        $tableNames=$this->container['tableNames'];

        try {

            //Check user access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS',
                'READ_POST'
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }

            $catid=$request->getQueryParam("catid", -1);

            //Get count of posts
            $sql="SELECT COUNT(".$tableNames['posts'].".id) AS cnt FROM ";
            $sql.=$tableNames['posts'];
            if ($catid!=-1) {
                $sql.=" LEFT JOIN ".$tableNames['cat_post_sv'];
                $sql.=" ON ".$tableNames['cat_post_sv'].".postid=".$tableNames['posts'].".id ";
                $sql.=" WHERE ".$tableNames['cat_post_sv'].".catid=:catid";
            }
            $stmt=$db->prepare($sql);
            if ($catid!=-1) {
                $stmt->bindParam(":catid", $catid);
            }
            $stmt->execute();
            if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $cnt=$row['cnt'];
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'    => $status,
            'err'       => $err,
            'cnt'       => $cnt
        ]);
    }



    //Get one post data
    public function pGetOnePost($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $arr=array();
        $arrCategories=array();
        $arrUsrFldNames=array();
        $arrUsrFldData=array();
        $db=$this->container['db'];
        $tableNames=$this->container['tableNames'];

        //Check user access rights
        if (!chkUserPrivileges($request, $db, [
            'ADMIN_PAGE_ACCESS',
            'READ_POST'
        ])) {
            return $response->withJson([
                'status'        => 0,
                'err'           => 'Access denied',
            ]);
        }

        try {
            $id=$request->getQueryParam("id", 0);

            //Get post by id
            $sql="SELECT * FROM ".$tableNames['posts'];
            $sql.=" WHERE id=:id";
            $stmt=$db->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($arr, $row);
            }

            //Get categories of post
            $sql="  SELECT ".$tableNames["category"].".*, ";
            $sql.=$tableNames["cat_post_sv"].".ufldids, ";
            $sql.=$tableNames["cat_post_sv"].".ufldvls ";
            $sql.=" FROM ".$tableNames["category"]." LEFT JOIN ";
            $sql.=$tableNames["cat_post_sv"];
            $sql.=" ON ".$tableNames["category"].".id=";
            $sql.=$tableNames["cat_post_sv"].".catid ";
            $sql.=" LEFT JOIN ".$tableNames["posts"];
            $sql.=" ON ".$tableNames["cat_post_sv"];
            $sql.=".postid=".$tableNames["posts"].".id ";
            $sql.=" WHERE ".$tableNames["posts"].".id=:id ";
            $stmt=$db->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($arrCategories, $row);
            }

            //Get user fileds by post id
            $sql="SELECT ".$tableNames["cat_usrflds"].".* FROM ";
            $sql.=$tableNames["cat_usrflds"];
            $sql.=" LEFT JOIN ".$tableNames["cat_post_sv"];
            $sql.=" ON ".$tableNames["cat_post_sv"].".catid=";
            $sql.=$tableNames["cat_usrflds"].".catid";
            $sql.=" WHERE ".$tableNames["cat_post_sv"].".postid=:id";
            $stmt=$db->prepare($sql);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($arrUsrFldNames, $row);
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'                => $status,
            'err'                   => $err,
            'arr'                   => $arr,
            'arr_categories'        => $arrCategories,
            'arr_usr_fld_names'     => $arrUsrFldNames,
        ]);
    }



    //Validate post Delete
    public function validateUpdate($dataIN)
    {
        $v = new \Valitron\Validator($dataIN);

        $v->rule('required', "id")->message('{field} must be set');

        $err="";
        $status=1;
        if (!$v->validate()) {
            $err=$v->errors();
            $err["validatorErr"]=1;
            $status=0;
        }
        return [
            "err" => $err,
            "status" => $status
        ];
    }



    //Post update
    public function pUpdate($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $existCatIds="";
        $existFields="";
        $db=$this->container['db'];
        $parsedBody = $request->getParsedBody();
        $tableNames=$this->container['tableNames'];

        //Check user access rights
        if (!chkUserPrivileges($request, $db, [
            'ADMIN_PAGE_ACCESS',
            'WRITE_POST'
        ])) {
            return $response->withJson([
                'status'        => 0,
                'err'           => 'Access denied',
            ]);
        }

        try {
            
            //Validate input data
            $res=$this->validateUpdate($parsedBody);
            if ($res['status']==0) {
                return $response->withJson($res);
            }

            //Get content languages
            $lngsArr=array();
            $sql="SELECT code FROM ".$tableNames['lang']." WHERE used=1";
            $stmt=$db->prepare($sql);
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($lngsArr, $row['code']);
            }

            //Validate input titles and texts
            $bValid=true;
            for ($i=0;$i<count($lngsArr);$i++) {
                if (!isset($parsedBody["title_".$lngsArr[$i]]) ||
                    !isset($parsedBody["txt_".$lngsArr[$i]])) {
                    $bValid=false;
                    break;
                }
            }
            if (!$bValid) {
                return $response->withJson([
                    'status' => 0,
                    'err' => "Not all data set"
                ]);
            }

            //Update post data
            $txts="";
            for ($i=0;$i<count($lngsArr);$i++) {
                $txts.="title_".$lngsArr[$i]."=:title_".$i.",";
                $txts.="txt_".$lngsArr[$i]."=:txt_".$i.",";
            }
            if (strlen($txts)>1) {
                $txts=substr($txts, 0, -1);
            }
            $sql="UPDATE ".$tableNames['posts'];
            $sql.=" SET ispub=:ispub, ".$txts;
            $sql.=" WHERE id=:id";
            $stmt=$db->prepare($sql);
            //bindParams
            $stmt->bindParam(':ispub', $parsedBody["ispub"]);
            $stmt->bindParam(':id', $parsedBody["id"]);
            for ($i=0;$i<count($lngsArr);$i++) {
                $stmt->bindParam(':title_'.$i, $parsedBody["title_".$lngsArr[$i]]);
                $stmt->bindParam(':txt_'.$i, $parsedBody["txt_".$lngsArr[$i]]);
            }
            $stmt->execute();

            //Get old categories by post id
            $oldCatIds=array();
            $sql="SELECT ".$tableNames["cat_post_sv"].".catid FROM ";
            $sql.=$tableNames["cat_post_sv"]."";
            $sql.=" WHERE ".$tableNames["cat_post_sv"].".postid=:id";
            $stmt=$db->prepare($sql);
            $stmt->bindParam(':id', $parsedBody["id"]);
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($oldCatIds, $row['catid']);
            }

            $deletedCatIds=array();
            $existCatIds=array();
            $catsIn=$parsedBody["categories"];

            //Find deleted categories ids
            for ($j=0; $j<count($oldCatIds); $j++) {
                $bFound=false;
                for ($i=0; $i<count($catsIn); $i++) {
                    if ($oldCatIds[$j]==$catsIn[$i]["id"]) {
                        $bFound=true;
                        break;
                    }
                }
                if (!$bFound) {
                    array_push($deletedCatIds, $oldCatIds[$j]);
                } else {
                    array_push($existCatIds, $catsIn[$i]);
                }
            }

            //Find added categories ids
            $addedCatIds=array();
            for ($i=0; $i<count($catsIn); $i++) {
                $bFound=false;
                for ($j=0; $j<count($oldCatIds); $j++) {
                    if ($oldCatIds[$j]==$catsIn[$i]["id"]) {
                        $bFound=true;
                        break;
                    }
                }
                if (!$bFound) {
                    array_push($addedCatIds, $catsIn[$i]["id"]);
                }
            }

            //Remove categories links to post
            if (count($deletedCatIds)>0) {
                $wheres="";
                for ($i=0; $i<count($deletedCatIds); $i++) {
                    $wheres.=" catid=:catid".$i." OR ";
                }
                $wheres=substr($wheres, 0, -4);

                $sql="DELETE FROM ".$tableNames["cat_post_sv"];
                $sql.=" WHERE (".$wheres.") AND postid=:postid";
                $stmt=$db->prepare($sql);
                $stmt->bindParam(":postid", $parsedBody["id"]);
                for ($i=0; $i<count($deletedCatIds); $i++) {
                    $stmt->bindParam(":catid".$i, $deletedCatIds[$i]);
                }
                $stmt->execute();
            }

            //Update user fields of old categories
            if (count($existCatIds)>0) {

                //Get user fields names and values from unchanged categories to update
                $existFields=array();
                for ($k=0; $k<count($existCatIds); $k++) {
                    if (isset($existCatIds[$k]["ufldsArr"]) &&
                        is_array($existCatIds[$k]["ufldsArr"])) {
                        $ufldsArr=$existCatIds[$k]["ufldsArr"];
                        for ($j=0; $j<count($ufldsArr); $j++) {
                            array_push($existFields, [
                                "catid"=>$existCatIds[$k]["id"],
                                "namef"=>$ufldsArr[$j]["namef"],
                                "valf"=>$ufldsArr[$j]["valf"],
                                "fldid"=>"-1"
                            ]);
                        }
                    }
                }

                //Add fldid to user fields array
                $where="";
                for ($k=0; $k<count($existCatIds); $k++) {
                    $where.="catid=:catid".$k." OR ";
                }
                $where=substr($where, 0, -4);
                $sql="SELECT * FROM ".$tableNames["cat_usrflds"]." WHERE ".$where;
                $stmt=$db->prepare($sql);
                for ($k=0; $k<count($existCatIds); $k++) {
                    $stmt->bindParam(":catid".$k, $existCatIds[$k]["id"]);
                }
                $stmt->execute();
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    for ($i=0; $i<count($existFields); $i++) {
                        if (
                            $existFields[$i]["catid"]==$row["catid"] &&
                            $existFields[$i]["namef"]==$row["namef"]
                        ) {
                            $existFields[$i]["fldid"]=$row["id"];
                        }
                    }
                }

                //Batch update user fields
                $ufldids="";
                $ufldvls="";
                for ($j=0; $j<count($existCatIds); $j++) {
                    $ufldidsTmp="";
                    $ufldvlsTmp="";
                    for ($k=0; $k<count($existFields); $k++) {
                        if ($existCatIds[$j]["id"]==$existFields[$k]["catid"]) {
                            $ufldidsTmp.=":".$existFields[$k]["fldid"];
                            $ufldvlsTmp.=":!:".$existFields[$k]["valf"];
                        }
                    }
                    $ufldids.=" WHEN ".$existCatIds[$j]["id"]." THEN '".$ufldidsTmp."' ";
                    $ufldvls.=" WHEN ".$existCatIds[$j]["id"]." THEN '".$ufldvlsTmp."' ";
                }
                $sql="UPDATE ".$tableNames["cat_post_sv"]." SET ";
                $sql.=" ufldids=( CASE catid ".$ufldids." ELSE '' END), ";
                $sql.=" ufldvls=( CASE catid ".$ufldvls." ELSE '' END) ";
                $sql.=" WHERE postid=:postid";
                $stmt=$db->prepare($sql);
                $stmt->bindParam(":postid", $parsedBody["id"]);
                $stmt->execute();
            }

            //Add links for the new added categories
            if (count($addedCatIds)>0) {

                //Get fldids user fields of the added categories
                $catIdsStr="";
                for ($i=0; $i<count($addedCatIds); $i++) {
                    $catIdsStr.="catid=".$addedCatIds[$i]." OR ";
                }
                $catIdsStr=substr($catIdsStr, 0, -4);
                $sql="SELECT id AS fldid,catid,namef FROM ".$tableNames["cat_usrflds"];
                $sql.=" WHERE ".$catIdsStr;
                $stmt=$db->prepare($sql);
                $stmt->execute();
                $arrUsrFlds=array();
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    array_push(
                        $arrUsrFlds,
                        [
                            'catid'=>$row["catid"],
                            'fldid'=>$row["fldid"],
                            'namef'=>$row["namef"],
                            'valf'=> ''
                        ]
                    );
                }

                //Get values of user fields from added categories
                for ($j=0; $j<count($arrUsrFlds); $j++) {
                    for ($i=0; $i<count($catsIn); $i++) {
                        $cat=$catsIn[$i];
                        if (
                            $arrUsrFlds[$j]["catid"]==$cat["id"] &&
                            isset($cat["ufldsArr"]) &&
                            is_array($cat["ufldsArr"])
                        ) {
                            for ($k=0;$k<count($cat["ufldsArr"]);$k++) {
                                if ($arrUsrFlds[$j]["namef"]==$cat["ufldsArr"][$k]["namef"]) {
                                    $arrUsrFlds[$j]["valf"]=$cat["ufldsArr"][$k]["valf"];
                                }
                            }
                        }
                    }
                }

                //Associate added categories to post
                for ($i=0;$i<count($addedCatIds);$i++) {

                    //Get post number of order in added categories
                    $num=1;
                    $sql="SELECT MAX(num)+1 AS mxnum FROM ".$tableNames["cat_post_sv"];
                    $sql.=" WHERE catid=:catid GROUP BY catid";
                    $stmt=$db->prepare($sql);
                    $stmt->bindParam(":catid", $addedCatIds[$i]);
                    $stmt->execute();
                    if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                        $num=intval($row["mxnum"]);
                    }

                    //Add link categories with post
                    $ufldids="";
                    $ufldvls="";
                    for ($j=0; $j<count($arrUsrFlds); $j++) {
                        if ($arrUsrFlds[$j]["catid"]==$addedCatIds[$i]) {
                            $ufldids.=":".$arrUsrFlds[$j]["fldid"];
                            $ufldvls.=":!:".$arrUsrFlds[$j]["valf"];
                        }
                    }
                    $sql="INSERT INTO ".$tableNames["cat_post_sv"];
                    $sql.=" (catid,postid,num,ufldids,ufldvls,dt,vws)";
                    $sql.=" VALUES (:catid, :postid,:num, :ufldids, :ufldvls, NOW(),0)";
                    $stmt=$db->prepare($sql);
                    $stmt->bindParam(":catid", $addedCatIds[$i]);
                    $stmt->bindParam(":postid", $parsedBody["id"]);
                    $stmt->bindParam(":num", $num);
                    $ufldids="";
                    $ufldvls="";
                    for ($j=0; $j<count($arrUsrFlds); $j++) {
                        if ($arrUsrFlds[$j]["catid"]==$addedCatIds[$i]) {
                            $ufldids.=":".$arrUsrFlds[$j]["fldid"];
                            $ufldvls.=":!:".$arrUsrFlds[$j]["valf"];
                        }
                    }
                    $stmt->bindParam(":ufldids", $ufldids);
                    $stmt->bindParam(":ufldvls", $ufldvls);
                    $stmt->execute();
                }
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status' => $status,
            'err' => $err,
            'existCatIds'=>$existCatIds,
            'addedCatIds'=>$addedCatIds,
        ]);
    }

    

    //Get posts list to client
    public function pClientGet($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $arr=array();
        $usersArr=array();
        $db=$this->container['db'];
        $tableNames=$this->container['tableNames'];

        try {

            //Check access rights for the NOT logged in users
            if (strpos($request->getUri()->getPath(), "-noauth")>0) {
                if (!getSettings(['ANONYMOUS_ACCESS'], $db)['ANONYMOUS_ACCESS']) {
                    return $response->withJson([
                        'status'        => 0,
                        'err'           => 'Access denied',
                    ]);
                }
            }

            $count=$request->getQueryParam("count", 0);
            $itemsPerPage=$request->getQueryParam("itemsPerPage", 10);
            $catId=$request->getQueryParam("catId", -1);
            $lng=$request->getQueryParam("lng", "en");
            $findText=$request->getQueryParam("findText", "");
            $clearBefore=$request->getQueryParam("clearBefore", false);
            $clearBefore=($clearBefore=="true")?true:false;

            //Update views of catid
            if ($catId!=-1 && $clearBefore) {
                $sql=" UPDATE ".$tableNames["category"]." SET vws=vws+1 ";
                $sql.=" WHERE id=:catid";
                $stmt=$db->prepare($sql);
                $stmt->bindParam(":catid", $catId);
                $stmt->execute();
            }

            $limit="";
            $offset="";
            $catIdStr="";
            if ($catId!=-1) {
                $catIdStr=" AND ".$tableNames["cat_post_sv"].".catid=:catid ";
            }
            $autoNumerate=0;
            $orderByPar=1;

            //Get auto_numerate, orderby if category set
            if ($catId!=-1) {
                $sql="SELECT auto_numerate,orderby FROM ";
                $sql.=$tableNames['category']." WHERE id=:id";
                $stmt=$db->prepare($sql);
                $stmt->bindParam(":id", $catId);
                $stmt->execute();
                if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    $autoNumerate=$row["auto_numerate"];
                    $orderByPar=$row["orderby"];
                }
            }

            $orderBy=" ORDER BY ".$tableNames["posts"].".dt,";
            $orderBy.=$tableNames["posts"].".id ";
            if ($catId!=-1) {
                //Order by num auth or by hand direction forward
                if ($autoNumerate==1 || ($autoNumerate==0 && $orderByPar==3)) {
                    $orderBy=" ORDER BY ".$tableNames["cat_post_sv"].".num ";
                }
                //Order by num by hand direction backward
                elseif ($autoNumerate==0 && $orderByPar==4) {
                    $orderBy=" ORDER BY ".$tableNames["cat_post_sv"].".num DESC";
                }
                //By date forward
                elseif ($orderByPar==1) {
                    $orderBy=" ORDER BY ".$tableNames["cat_post_sv"].".dt";
                }
                //By date backward
                elseif ($orderByPar==2) {
                    $orderBy=" ORDER BY ".$tableNames["cat_post_sv"].".dt DESC";
                }
            }

            $groupBy="";
            if ($catId==-1) {
                $groupBy=" GROUP BY ".$tableNames["posts"].".id";
            }

            $where=" WHERE ".$tableNames["posts"].".ispub=1 ";
            if ($findText!="") {
                $where.=" AND title_".$lng." LIKE :findText ";
            }

            //Get posts list
            $limit=" LIMIT ".$itemsPerPage;
            $offset=" OFFSET ".$count;
            $sql="  SELECT ";
            $sql.=$tableNames['posts'].".id, ";
            if ($catId==-1) {
                $sql.=$tableNames['posts'].".dt, ";
            } else {
                $sql.=$tableNames['cat_post_sv'].".dt, ";
            }
            $sql.=$tableNames['posts'].".usrid, ";
            $sql.=$tableNames['posts'].".title_".$lng.", ";
            $sql.=$tableNames['cat_post_sv'].".ufldids,";
            $sql.=$tableNames['cat_post_sv'].".ufldvls";
            
            $sql.=" FROM ".$tableNames['posts'];
            $sql.=" LEFT JOIN ".$tableNames["cat_post_sv"]." ON ";
            $sql.=$tableNames["cat_post_sv"].".postid=".$tableNames["posts"].".id";
            $sql.=$where.$catIdStr.$groupBy.$orderBy.$limit.$offset;
            $stmt=$db->prepare($sql);
            if ($catId!=-1) {
                $stmt->bindParam(":catid", $catId);
            }
            if ($findText!="") {
                $findText="%".$findText."%";
                $stmt->bindParam(":findText", $findText);
            }
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $row["user"]=-1;
                array_push($arr, $row);
            }

            //Get authors and map to posts
            $usridStr="";
            for ($i=0;$i<count($arr);$i++) {
                $usridStr.=" id=:id".$i." OR ";
            }
            if (count($arr)>0) {
                $usridStr=" WHERE ".substr($usridStr, 0, -4);
            }
            $sql="SELECT id,fname,mname,lname,nick";
            $sql.=" FROM ".$tableNames['users'].$usridStr;
            $stmt=$db->prepare($sql);
            for ($i=0;$i<count($arr);$i++) {
                $stmt->bindParam(":id".$i, $arr[$i]["usrid"]);
            }
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($usersArr, $row);
            }
            for ($i=0;$i<count($arr);$i++) {
                for ($j=0;$j<count($usersArr);$j++) {
                    if ($arr[$i]["usrid"]==$usersArr[$j]["id"]) {
                        $arr[$i]["user"]=$usersArr[$j];
                    }
                }
            }

            $postIds="";
            for ($i=0; $i<count($arr); $i++) {
                $postIds.="posts.id=".$arr[$i]["id"]." OR ";
            }
            if (strlen($postIds)>4) {
                $postIds=" WHERE ".substr($postIds, 0, -4);
            }

            //Get language codes
            $sql="SELECT code FROM ".$tableNames['lang']." WHERE used=1";
            $stmt=$db->prepare($sql);
            $stmt->execute();
            $codesStr="";
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $codesStr.=$tableNames["category"].".name_".$row['code'].",";
            }
            if (strlen($codesStr)>0) {
                $codesStr=substr($codesStr, 0, -1);
            }

            //Get categories by post ids
            $sql="SELECT ".$tableNames["cat_post_sv"].".postid, ";
            $sql.=$tableNames["category"].".id, ";
            $sql.=$codesStr." FROM ".$tableNames["category"]." ";
            $sql.=" LEFT JOIN ".$tableNames["cat_post_sv"]." ";
            $sql.=" ON ".$tableNames["cat_post_sv"].".catid=";
            $sql.=$tableNames["category"].".id ";
            $sql.=" WHERE ".$tableNames["cat_post_sv"].".postid ";
            $sql.=" IN (SELECT ".$tableNames["posts"].".id FROM ";
            $sql.=$tableNames["posts"]." ".$postIds.") ";
            $stmt=$db->prepare($sql);
            $stmt->execute();
            $categories=array();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($categories, $row);
            }

            //Map categories to posts
            for ($i=0; $i<count($arr); $i++) {
                $arr[$i]["categories"]=array();
                for ($j=0; $j<count($categories); $j++) {
                    if ($arr[$i]["id"]==$categories[$j]["postid"]) {
                        array_push($arr[$i]["categories"], $categories[$j]);
                    }
                }
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'    => $status,
            'err'       => $err,
            'posts'     => $arr,
            'clearBefore'=>$clearBefore,
            'postIds'=>$postIds
        ]);
    }



    //Get one post
    public function pClientOneGet($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $post=0;
        $db=$this->container['db'];
        $tableNames=$this->container['tableNames'];

        try {

            //Check access rights for the NOT logged in users
            if (strpos($request->getUri()->getPath(), "-noauth")>0) {
                if (!getSettings(['ANONYMOUS_ACCESS'], $db)['ANONYMOUS_ACCESS']) {
                    return $response->withJson([
                        'status'        => 0,
                        'err'           => 'Access denied',
                    ]);
                }
            }

            $postid=$request->getQueryParam("id", -1);
            $catId=$request->getQueryParam("catId", -1);
            $lng=$request->getQueryParam("lng", "en");

            //Update views of categories
            if ($catId!=-1) {
                $sql=" UPDATE ".$tableNames["cat_post_sv"]." SET vws=vws+1 ";
                $sql.=" WHERE postid=:postid AND catid=:catid";
                $stmt=$db->prepare($sql);
                $stmt->bindParam(":postid", $postid);
                $stmt->bindParam(":catid", $catId);
                $stmt->execute();
            }

            //Get post data by id
            $sql="  SELECT id, dt, usrid, title_".$lng.",txt_".$lng;
            $sql.=" FROM ".$tableNames["posts"]." WHERE ispub=1 AND id=:postid";
            $stmt=$db->prepare($sql);
            $stmt->bindParam(":postid", $postid);
            $stmt->execute();
            if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $post=$row;
                $post["user"]=-1;
            }

            //Get author by usrid
            $sql="SELECT * FROM ".$tableNames["users"]." WHERE id=:id";
            $stmt=$db->prepare($sql);
            $stmt->bindParam(":id", $post["usrid"]);
            $stmt->execute();
            if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $post["user"]=$row;
            }

            //Get categories
            $sql="  SELECT ".$tableNames["cat_post_sv"].".postid, ";
            $sql.=$tableNames["category"].".id, ";
            $sql.=$tableNames["category"].".name_".$lng;
            $sql.=" FROM ".$tableNames["category"];
            $sql.=" LEFT JOIN ".$tableNames["cat_post_sv"];
            $sql.=" ON ".$tableNames["cat_post_sv"].".catid=";
            $sql.=$tableNames["category"].".id ";
            $sql.=" WHERE ".$tableNames["cat_post_sv"].".postid=:postid";
            $sql.=" GROUP BY ".$tableNames["category"].".id";
            $stmt=$db->prepare($sql);
            $stmt->bindParam(":postid", $postid);
            $stmt->execute();
            $categories=array();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($categories, $row);
            }

            //Map categories to posts
            $post["categories"]=array();
            for ($j=0; $j<count($categories); $j++) {
                if ($postid==$categories[$j]["postid"]) {
                    array_push($post["categories"], $categories[$j]);
                }
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'    => $status,
            'err'       => $err,
            'post'     => $post,
        ]);
    }
}
