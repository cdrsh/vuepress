<?php
namespace App\Controller;

use Valitron\Validator;
use Psr\HttpMessage\ServerRequestInterface as Request;
use Psr\HttpMessage\ResponseInterface as Response;

require_once(realpath(dirname(__FILE__)."/../general/myfuncs.php"));

//Comments
class CommentsController
{
    protected $container;

    public function __construct($c)
    {
        $this->container = $c;
    }



    //Validate comment Update
    public function validateUpdate($dataIN)
    {
        $v = new \Valitron\Validator($dataIN);

        $v->rule('required', "id")->message('{field} must be set');
        $v->rule('required', "txt")->message('{field} must be set');

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


    
    //Comment Update
    public function cUpdate($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        try {
            $db=$this->container['db'];
            $parsedBody = $request->getParsedBody();
            
            //Check access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS'
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }

            //Validate input data
            $res=$this->validateUpdate($parsedBody);
            if ($res['status']==0) {
                return $response->withJson($res);
            }
            
            //Update comment in DB
            $tableNames=$this->container['tableNames'];
            $sql="UPDATE ".$tableNames['comments']." SET ";
            $sql.=" txt=:txt WHERE id=:id";
            $stmt=$db->prepare($sql);
            $stmt->bindParam(':id', $parsedBody["id"]);
            $stmt->bindParam(':txt', $parsedBody["txt"]);
            $stmt->execute();
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'    => $status,
            'err'       => $err
        ]);
    }



    //Validate users Block
    public function validateBlockUsers($dataIN)
    {
        $v = new \Valitron\Validator($dataIN);

        $v->rule('required', 'ids')->message('{field} must be set');

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



    //Users block
    public function cBlockUsers($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $arr=array();
        try {
            $db=$this->container['db'];
            $parsedBody = $request->getParsedBody();

            //Check access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS',
                'WRITE_USERS'
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }

            //Validate input data
            $res=$this->validateBlockUsers($parsedBody);
            if ($res['status']==0) {
                return $response->withJson($res);
            }

            $tableNames=$this->container['tableNames'];
            $ids=$parsedBody['ids'];
            $idsStr="";
            for ($i=0;$i<count($ids);$i++) {
                $idsStr.=" id=:id".$i." OR ";
            }
            if (count($ids)>0) {
                $idsStr=substr($idsStr, 0, -4);

                //Block/Unblock users in DB
                $sql="UPDATE ".$tableNames["users"]." SET privlgs=4^privlgs ";
                $sql.="WHERE ".$idsStr;
                $stmt=$db->prepare($sql);
                for ($i=0;$i<count($ids);$i++) {
                    $stmt->bindParam(':id'.$i, $ids[$i]);
                }
                $stmt->execute();
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'        => $status,
            'err'           => $err
        ]);
    }



    //Recursive build array of id comments to remove it
    public function parseIds($id, $allIds)
    {
        $arr=array();
        for ($i=0; $i<count($allIds); $i++) {
            if ($allIds[$i]['pid']==$id["id"]) {
                $arrTmp=$this->parseIds($allIds[$i], $allIds);
                if (count($arrTmp)>0) {
                    $arr=array_merge($arr, $arrTmp);
                }
            }
        }
        array_push($arr, $id["id"]);
        return $arr;
    }




    //Validate comment Delete
    public function validateDelete($dataIN)
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
    

    
    //Delete selected comments
    //by Post One View Remove
    public function cDeleteSelected($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $arrChldrn=array();
        try {
            $db=$this->container['db'];
            $parsedBody = $request->getParsedBody();

            //Check access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS'
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }
            
            //Validate input data
            $res=$this->validateDelete($parsedBody);
            if ($res['status']==0) {
                return $response->withJson($res);
            }

            $tableNames=$this->container['tableNames'];
            $ids=$parsedBody['ids'];

            //Filter unique leaf ids of comments
            $arrLeafs=array();
            for ($i=0;$i<count($ids);$i++) {
                array_push($arrLeafs, $ids[$i]["leafid"]);
            }
            $arrLeafs=array_unique($arrLeafs);
            $arrLeafsStr="";
            for ($i=0; $i<count($arrLeafs); $i++) {
                $arrLeafsStr.="leafid=:leafid".$i." OR ";
            }
            if (count($arrLeafs)>0) {
                $arrLeafsStr=substr($arrLeafsStr, 0, -4);
            }

            //Get all comments of filtered leaf ids
            $arrAllIdsOfAllLeafs=array();
            $sql="SELECT id, pid, leafid FROM ".$tableNames['comments'];
            $sql.=" WHERE ".$arrLeafsStr;
            $stmt=$db->prepare($sql);
            for ($i=0; $i<count($arrLeafs); $i++) {
                $stmt->bindParam(':leafid'.$i, $arrLeafs[$i]);
            }
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($arrAllIdsOfAllLeafs, [
                    'id'    =>$row['id'],
                    'pid'   =>$row['pid'],
                ]);
            }
            
            //For each deleted comment id generate array of nested comments ids
            //to remove commet as leaf with nested nodes (comments answers)
            for ($i=0;$i<count($ids);$i++) {
                $arrChldrn=array_merge(
                    $arrChldrn,
                    $this->parseIds($ids[$i], $arrAllIdsOfAllLeafs)
                );
            }
            $arrChldrn=array_unique($arrChldrn);
            $arrChldrnStr="";
            foreach ($arrChldrn as $key => $value) {
                $arrChldrnStr.="id=".$value." OR ";
            }
            if (count($arrChldrn)>0) {
                $arrChldrnStr=substr($arrChldrnStr, 0, -4);
            }
            $sql="DELETE FROM ".$tableNames['comments']." WHERE ".$arrChldrnStr;
            $stmt=$db->prepare($sql);
            $stmt->execute();
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'    => $status,
            'err'       => $err,
            'deleted'   => count($arrChldrn),
            'ids'       => $arrChldrn,
        ]);
    }
    
 

    //Get comments by page
    //All comments view
    public function cGetAllComments($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $arr=array();
        $itemsCount=0;
        $db=$this->container['db'];
        $tableNames=$this->container['tableNames'];
        $limit="";
        $offset="";
        $leafids="";

        //Check access rights
        if (!chkUserPrivileges($request, $db, [
            'ADMIN_PAGE_ACCESS'
        ])) {
            return $response->withJson([
                'status'        => 0,
                'err'           => 'Access denied',
            ]);
        }

        $pgNum=intval($request->getQueryParam("pgNum", 1));
        $itemsPerPage=$request->getQueryParam("itemsPerPage", 10);

        try {
            if ($itemsPerPage>0 && $pgNum>0) {

                //Calculate Upper level comments with pid=-1
                $sql="SELECT COUNT(leafid) AS cnt FROM ".$tableNames['comments'];
                $sql.=" WHERE pid=-1";
                $stmt=$db->prepare($sql);
                $stmt->execute();
                if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    $itemsCount=$row["cnt"];
                }

                //Calc real pages count
                $maxPgNum=($itemsCount%$itemsPerPage==0)
                    ?$itemsCount/$itemsPerPage
                    :intval($itemsCount/$itemsPerPage)+1;

                //Fix pgNum if it goes out from limit
                if ($pgNum>$maxPgNum && $maxPgNum>0) {
                    $pgNum=$maxPgNum;
                }
                if ($pgNum<1) {
                    $pgNum=1;
                }
                
                //Select leaf ids of upper level limited by pgNum and itemsPerPage
                $limit=" LIMIT ".$itemsPerPage;
                $offset=" OFFSET ".(($pgNum-1)*$itemsPerPage);
                $sql="SELECT leafid FROM ".$tableNames['comments'];
                $sql.=" WHERE pid=-1 ".$limit.$offset;
                $stmt=$db->prepare($sql);
                $stmt->execute();
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    $leafids.=" comments.leafid=".$row['leafid']." OR ";
                }
                if (strlen($leafids)>0) {

                    //Select comments leafs by root leaf ids
                    $leafids=" WHERE ".substr($leafids, 0, -4);
                    $sql="SELECT ".$tableNames['comments'].".*, ";
                    $sql.=$tableNames['users'].".fname, ";
                    $sql.=$tableNames['users'].".mname, ";
                    $sql.=$tableNames['users'].".lname, ";
                    $sql.=$tableNames['users'].".nick, ";
                    $sql.=$tableNames['users'].".privlgs FROM ";
                    $sql.=$tableNames['comments'];
                    $sql.=" LEFT JOIN ".$tableNames['users']." ON ";
                    $sql.=$tableNames['users'].".id=";
                    $sql.=$tableNames['comments'].".usrid ";
                    $sql.=$leafids." ORDER BY ".$tableNames['comments'].".leafid, ";
                    $sql.=$tableNames['comments'].".num";
                    $stmt=$db->prepare($sql);
                    $stmt->execute();
                    while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                        array_push($arr, $row);
                    }
                }
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'        => $status,
            'err'           => $err,
            'comments'      => $arr,
            'itemsCount'    => $itemsCount,
            'pgNum'         => $pgNum,
        ]);
    }

    

    //Find comments by page
    //All comments view
    public function cFindAllComment($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $arr=array();
        $itemsCount=0;
        $cnt=0;
        $db=$this->container['db'];

        //Check access rights
        if (!chkUserPrivileges($request, $db, [
            'ADMIN_PAGE_ACCESS'
        ])) {
            return $response->withJson([
                'status'        => 0,
                'err'           => 'Access denied',
            ]);
        }

        $pgNum=$request->getQueryParam("pgNum", 1);
        $itemsPerPage=$request->getQueryParam("itemsPerPage", 10);
        $findTxt=$request->getQueryParam("findTxt", "");
        $maxPgNum=0;
        $tableNames=$this->container['tableNames'];
        $limit="";
        $offset="";

        try {
            if ($itemsPerPage>0 && $pgNum>0) {

                //Calculate items count with found text
                $sql="SELECT COUNT(id) AS cnt ";
                $sql.=" FROM ".$tableNames["comments"];
                $sql.=" WHERE txt LIKE ".$db->quote("%".$findTxt."%")." ";
                $sql.=" ORDER BY leafid, num";
                $stmt=$db->prepare($sql);
                $stmt->execute();
                if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    $cnt=$row["cnt"];
                }

                //Calc real pages count
                $maxPgNum=($cnt%$itemsPerPage==0)
                    ?$cnt/$itemsPerPage
                    :intval($cnt/$itemsPerPage)+1;
                
                //Fix pgNum if it goes out from limit
                if ($pgNum>$maxPgNum && $maxPgNum>0) {
                    $pgNum=$maxPgNum;
                }

                //Select comments with found text by page num
                $limit=" LIMIT ".$itemsPerPage;
                $offset=" OFFSET ".(($pgNum-1)*$itemsPerPage);
                $findTxt1=$findTxt;
                if ($findTxt1!="") {
                    $findTxt1=" WHERE ".$tableNames["comments"].".txt LIKE ";
                    $findTxt1.=$db->quote("%".$findTxt."%");
                }
                $sql="SELECT ".$tableNames["comments"].".*, ";
                $sql.=$tableNames["users"].".fname,";
                $sql.=$tableNames["users"].".mname,";
                $sql.=$tableNames["users"].".lname,";
                $sql.=$tableNames["users"].".nick,";
                $sql.=$tableNames["users"].".privlgs ";
                $sql.=" FROM ".$tableNames["comments"]." LEFT JOIN ";
                $sql.=$tableNames["users"]." ON ".$tableNames["users"].".id=";
                $sql.=$tableNames["comments"].".usrid ";
                $sql.=$findTxt1." ORDER BY ".$tableNames["comments"].".leafid, ";
                $sql.=$tableNames["comments"].".num ".$limit.$offset;
                $stmt=$db->prepare($sql);
                $stmt->execute();
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    array_push($arr, $row);
                }

                $itemsCount=$cnt;
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'        => $status,
            'err'           => $err,
            'comments'      => $arr,
            'itemsCount'    => $itemsCount,
            'pgNum'         => $pgNum,
            'sql'=> $sql
        ]);
    }
    


    //Get comments by users
    public function cGetByUsers($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $users=array();
        $itemsCount=0;
        $db=$this->container['db'];
        $tableNames=$this->container['tableNames'];
        $limit="";
        $offset="";
        $leafids="";

        //Check access rights
        if (!chkUserPrivileges($request, $db, [
            'ADMIN_PAGE_ACCESS'
        ])) {
            return $response->withJson([
                'status'        => 0,
                'err'           => 'Access denied',
            ]);
        }

        $pgNum=$request->getQueryParam("pgNum", 1);
        $itemsPerPage=$request->getQueryParam("itemsPerPage", 10);
        $where=$request->getQueryParam("findTxt", "");

        try {
            if ($itemsPerPage>0 && $pgNum>0) {

                //Get items count all found comments
                $limit=" LIMIT ".$itemsPerPage;
                $offset=" OFFSET ".(($pgNum-1)*$itemsPerPage);
                if ($where!="") {
                    $where=" WHERE ".$tableNames["comments"].".txt LIKE ";
                    $where.=$db->quote("%".$where."%")." ";
                }
                $sql="SELECT COUNT(*) AS cnt FROM (";
                $sql.="SELECT COUNT(".$tableNames["comments"].".usrid) AS cnt ";
                $sql.=" FROM ".$tableNames["users"]." LEFT JOIN ";
                $sql.=$tableNames["comments"]." ON ";
                $sql.=$tableNames["comments"].".usrid=";
                $sql.=$tableNames["users"].".id ";
                $sql.=$where;
                $sql.=" GROUP BY ".$tableNames["users"].".id ";
                $sql.=" ORDER BY ".$tableNames["users"].".id ";
                $sql.=" ) AS subquery";
                $stmt=$db->prepare($sql);
                $stmt->execute();
                if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    $itemsCount=$row["cnt"];
                }

                //Calc real pages count
                $maxPgNum=($itemsCount%$itemsPerPage==0)
                    ?$itemsCount/$itemsPerPage
                    :intval($itemsCount/$itemsPerPage)+1;
                
                //Select users and comments count
                $offset=" OFFSET ".(($pgNum-1)*$itemsPerPage);
                $sql="SELECT COUNT(".$tableNames["comments"].".usrid) AS cnt, ";
                $sql.=$tableNames["users"].".* ";
                $sql.=" FROM ".$tableNames["users"];
                $sql.=" LEFT JOIN ".$tableNames["comments"];
                $sql.=" ON ".$tableNames["comments"].".usrid=";
                $sql.=$tableNames["users"].".id ";
                $sql.=$where;
                $sql.=" GROUP BY ".$tableNames["users"].".id ";
                $sql.=" ORDER BY ".$tableNames["users"].".id ";
                $sql.=$limit.$offset;
                $stmt=$db->prepare($sql);
                $stmt->execute();
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    array_push($users, $row);
                }
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'        => $status,
            'err'           => $err,
            'users'         => $users,
            'itemsCount'    => $itemsCount,
            'pgNum'         => $pgNum
        ]);
    }



    //Validate comment Delete
    public function validateByUsersDelete($dataIN)
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


    
    //Delete comments
    //By users view
    public function cByUsersDelete($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error

        try {
            $db=$this->container['db'];
            $parsedBody = $request->getParsedBody();
            $tableNames=$this->container['tableNames'];

            //Check access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS'
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }

            //Validate input data
            $res=$this->validateByUsersDelete($parsedBody);
            if ($res['status']==0) {
                return $response->withJson($res);
            }

            $usrids=$parsedBody['ids'];

            //Get leafid by usrid
            $usridsStr="";
            for ($i=0; $i<count($usrids); $i++) {
                $usridsStr.=" usrid=:usrid".$i." OR ";
            }
            if (count($usrids)>0) {
                $usridsStr=substr($usridsStr, 0, -4);
            }
            $sql="SELECT DISTINCT id,pid,leafid FROM ";
            $sql.=$tableNames['comments']." WHERE ".$usridsStr;
            $stmt=$db->prepare($sql);
            for ($i=0; $i<count($usrids); $i++) {
                $stmt->bindParam(':usrid'.$i, $usrids[$i]);
            }
            $stmt->execute();
            $arrLeafsUniq=array();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($arrLeafsUniq, [
                    'leafid'    => $row['leafid'],
                    'id'        => $row['id'],
                    'pid'       => $row['pid'],
                ]);
            }

            $ids=array();
            $arrLeafsUniqStr="";
            if (count($arrLeafsUniq)>0) {
                for ($i=0;$i<count($arrLeafsUniq);$i++) {
                    $arrLeafsUniqStr.=" leafid=:leafid".$i." OR ";
                }
                if (count($arrLeafsUniq)>0) {
                    $arrLeafsUniqStr=substr($arrLeafsUniqStr, 0, -4);
                }
                //Get all leafs with nested comments by leafid
                $sql="SELECT DISTINCT id,pid,leafid FROM ";
                $sql.=$tableNames['comments']." WHERE ".$arrLeafsUniqStr;
                $stmt=$db->prepare($sql);
                for ($i=0; $i<count($arrLeafsUniq); $i++) {
                    $stmt->bindParam(':leafid'.$i, $arrLeafsUniq[$i]['leafid']);
                }
                $sqLast=$sql;
                $stmt->execute();
                $arrAllIdsOfAllLeafs=array();
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    array_push($arrAllIdsOfAllLeafs, [
                        'id'    =>$row['id'],
                        'pid'   =>$row['pid'],
                        'leafid'=>$row['leafid'],
                    ]);
                }
                
                //For each comment id find the leaf of children nodes to remove all leaf
                $arrChldrn=array();
                for ($i=0;$i<count($arrLeafsUniq);$i++) {
                    $arrChldrn=array_merge(
                        $arrChldrn,
                        $this->parseIds($arrLeafsUniq[$i], $arrAllIdsOfAllLeafs)
                    );
                }
                
                //removing all duplicates ids and make one array of unique ids to delete
                $arrChldrn=array_unique($arrChldrn);
                
                //Delete comments from DB
                if (count($arrChldrn)) {
                    $arrChldrnStr="";
                    $i=0;
                    foreach ($arrChldrn as $value) {
                        $arrChldrnStr.="id=:id".$i." OR ";
                        $i++;
                    }
                    if ($i>0) {
                        $arrChldrnStr=substr($arrChldrnStr, 0, -4);
                    }
                    $sql="DELETE FROM ".$tableNames['comments']." WHERE ";
                    $sql.=$arrChldrnStr;
                    $stmt=$db->prepare($sql);
                    $i=0;
                    foreach ($arrChldrn as $value) {
                        $stmt->bindParam(':id'.$i, $value);
                        $i++;
                    }
                    $stmt->execute();
                }
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'        => $status,
            'err'           => $err,
        ]);
    }



    //Validate users block
    public function validateByUsersBlock($dataIN)
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



    //Block users
    //By users view
    public function cByUsersBlock($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error

        try {
            $db=$this->container['db'];
            $parsedBody = $request->getParsedBody();

            //Check access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS',
                'WRITE_USERS'
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }

            //Validate input data
            $res=$this->validateByUsersBlock($parsedBody);
            if ($res['status']==0) {
                return $response->withJson($res);
            }

            $tableNames=$this->container['tableNames'];
            $ids=$parsedBody['ids'];

            //Update priveleges
            $where="";
            for ($i=0; $i<count($ids); $i++) {
                $where.=" id=:id".$i." OR ";
            }
            if (count($ids)>0) {
                $where=" WHERE ".substr($where, 0, -4);
            }
            $sql="UPDATE ".$tableNames["users"]." SET privlgs=4^privlgs ".$where;
            $stmt=$db->prepare($sql);
            for ($i=0; $i<count($ids); $i++) {
                $stmt->bindParam(":id".$i, $ids[$i]);
            }
            $stmt->execute();
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'        => $status,
            'err'           => $err,
        ]);
    }



    //Get comments of One user
    //One user view
    public function cByUsersLoadOfOneUser($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $arr=array();
        $itemsCount=0;
        $db=$this->container['db'];

        //Check access rights
        if (!chkUserPrivileges($request, $db, [
            'ADMIN_PAGE_ACCESS'
        ])) {
            return $response->withJson([
                'status'        => 0,
                'err'           => 'Access denied',
            ]);
        }

        $usrid=$request->getQueryParam("usrid", -1);
        $pgNum=$request->getQueryParam("pgNum", 1);
        $itemsPerPage=$request->getQueryParam("itemsPerPage", 10);
        $findTxt=$request->getQueryParam("findTxt", "");
        $tableNames=$this->container['tableNames'];
        $limit="";
        $offset="";
        $where="";

        try {
            if ($itemsPerPage>0 && $pgNum>0) {

                //Get all items count by user
                $sql="SELECT COUNT(".$tableNames["comments"].".id) AS cnt ";
                $sql.=" FROM ".$tableNames["comments"];
                $sql.=" LEFT JOIN ".$tableNames["users"]." ON ";
                $sql.=$tableNames["users"].".id=";
                $sql.=$tableNames["comments"].".usrid ";
                $where.=" WHERE ".$tableNames["comments"].".usrid=:usrid ";
                if ($findTxt!="") {
                    $where.=" AND ".$tableNames["comments"].".txt LIKE ";
                    $where.=$db->quote("%".$findTxt."%")." ";
                }
                $sql.=$where;
                $sql.=" ORDER BY ".$tableNames["comments"].".leafid, ";
                $sql.=$tableNames["comments"].".num";
                $stmt=$db->prepare($sql);
                $stmt->bindValue(':usrid', $usrid);
                $stmt->execute();
                if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    $itemsCount=$row["cnt"];
                }

                //Calc real pages count
                $maxPgNum=($itemsCount%$itemsPerPage==0)
                    ?$itemsCount/$itemsPerPage
                    :intval($itemsCount/$itemsPerPage)+1;
                
                //Fix pgNum if it goes out from limit
                if ($pgNum>$maxPgNum && $maxPgNum>0) {
                    $pgNum=$maxPgNum;
                }

                //Get comments by page num
                $limit=" LIMIT ".$itemsPerPage;
                $offset=" OFFSET ".(($pgNum-1)*$itemsPerPage);
                $sql="SELECT ".$tableNames["comments"].".*, ";
                $sql.=$tableNames["users"].".fname,";
                $sql.=$tableNames["users"].".mname,";
                $sql.=$tableNames["users"].".lname,";
                $sql.=$tableNames["users"].".nick,";
                $sql.=$tableNames["users"].".privlgs ";
                $sql.=" FROM ".$tableNames["comments"];
                $sql.=" LEFT JOIN ".$tableNames["users"]." ON ";
                $sql.=$tableNames["users"].".id=";
                $sql.=$tableNames["comments"].".usrid ";
                $sql.=$where." ORDER BY ".$tableNames["comments"].".leafid, ";
                $sql.=$tableNames["comments"].".num ".$limit.$offset;
                $stmt=$db->prepare($sql);
                $stmt->bindValue(':usrid', $usrid);
                $stmt->execute();
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    array_push($arr, $row);
                }
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'        => $status,
            'err'           => $err,
            'comments'      => $arr,
            'itemsCount'    => $itemsCount,
            'pgNum'         => $pgNum,
        ]);
    }



    //Validate delete comments
    //by one user view
    public function validateByUsersRemoveOfOneUser($dataIN)
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



    //Delete comments
    //By one user view
    public function cByUsersRemoveOfOneUser($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $arrChldrn=array();
        $db=$this->container['db'];
        $parsedBody = $request->getParsedBody();
        $tableNames=$this->container['tableNames'];

        try {
        
            //Check access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS'
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }
                       
            //Validate input data
            $res=$this->validateByUsersRemoveOfOneUser($parsedBody);
            if ($res['status']==0) {
                return $response->withJson($res);
            }
            
            $ids=$parsedBody['ids'];

            //Get unique leaf ids
            $arrLeafs=array();
            for ($i=0;$i<count($ids);$i++) {
                array_push($arrLeafs, $ids[$i]["leafid"]);
            }
            $arrLeafs=array_unique($arrLeafs);
            $arrLeafsStr="";
            $i=0;
            foreach ($arrLeafs as $val) {
                $arrLeafsStr.="leafid=:leafid".$i." OR ";
                $i++;
            }
            if ($i>0) {
                $arrLeafsStr=substr($arrLeafsStr, 0, -4);
            }

            //Select all comments of filtered leafs
            $arrAllIdsOfAllLeafs=array();
            $sql="SELECT id, pid, leafid FROM ".$tableNames['comments'];
            $sql.=" WHERE ".$arrLeafsStr;
            $stmt=$db->prepare($sql);
            for ($i=0; $i<count($arrLeafs); $i++) {
                $stmt->bindParam(':leafid'.$i, $arrLeafs[$i]);
            }
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($arrAllIdsOfAllLeafs, [
                    'id'    =>$row['id'],
                    'pid'   =>$row['pid'],
                ]);
            }
            
            //For each deleted comment id generate array of nested comments ids
            //to remove commet as leaf with nested nodes (comments answers)
            for ($i=0;$i<count($ids);$i++) {
                $arrChldrn=array_merge(
                    $arrChldrn,
                    $this->parseIds($ids[$i], $arrAllIdsOfAllLeafs)
                );
            }
            $arrChldrn=array_unique($arrChldrn);

            //Delete comments
            $arrChldrnStr="";
            $i=0;
            foreach ($arrChldrn as $val) {
                $arrChldrnStr.="id=:id".$i." OR ";
                $i++;
            }
            if ($i>0) {
                $arrChldrnStr=substr($arrChldrnStr, 0, -4);
            }
            $sql="DELETE FROM ".$tableNames['comments']." WHERE ".$arrChldrnStr;
            $stmt=$db->prepare($sql);
            $i=0;
            foreach ($arrChldrn as $val) {
                $stmt->bindParam(':id'.$i, $val);
                $i++;
            }
            $stmt->execute();
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'            => $status,
            'err'               => $err,
            'removedRealCount'  => count($arrChldrn)
        ]);
    }



    //Get posts with comments count by page num
    public function cByPostsGet($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $posts=array();
        $itemsCount=0;
        $db=$this->container['db'];
        $tableNames=$this->container['tableNames'];
        $limit="";
        $offset="";
        $catIdStr="";

        //Check access rights
        if (!chkUserPrivileges($request, $db, [
            'ADMIN_PAGE_ACCESS'
        ])) {
            return $response->withJson([
                'status'        => 0,
                'err'           => 'Access denied',
            ]);
        }

        try {
            $pgNum=$request->getQueryParam("pgNum", 1);
            $itemsPerPage=$request->getQueryParam("itemsPerPage", 10);
            $findTxt=$request->getQueryParam("findTxt", "");

            if ($itemsPerPage>0 && $pgNum>0) {

                //Get counts of comments grouped by posts
                $sql="  SELECT COUNT(cntin) AS cnt FROM ( ";
                $sql.=" SELECT COUNT(".$tableNames["posts"].".id) AS cntin FROM ";
                $sql.=$tableNames["posts"]." ";
                $sql.=" LEFT JOIN ".$tableNames["comments"]." ON ";
                $sql.=$tableNames["comments"].".postid=".$tableNames["posts"].".id ";
                if ($findTxt!="") {
                    $sql.=" WHERE ".$tableNames["comments"].".txt LIKE ";
                    $sql.=$db->quote("%".$findTxt."%");
                }
                $sql.=" GROUP BY ".$tableNames["posts"].".id ";
                $sql.=" ) AS cntsel";
                $stmt=$db->prepare($sql);
                $stmt->execute();
                if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    $itemsCount=$row["cnt"];
                }

                //Calc real pages count
                $maxPgNum=($itemsCount%$itemsPerPage==0)
                    ?$itemsCount/$itemsPerPage
                    :intval($itemsCount/$itemsPerPage)+1;

                //Fix pgNum if it goes out from limit
                if ($pgNum>$maxPgNum && $maxPgNum>0) {
                    $pgNum=$maxPgNum;
                }

                //Get posts with comments counts
                if ($findTxt!="") {
                    $findTxt=" ".$tableNames["comments"].".txt LIKE ";
                    $findTxt.=$db->quote("%".$findTxt."%")." ";
                }
                $limit=" LIMIT ".$itemsPerPage;
                $offset=" OFFSET ".(($pgNum-1)*10);
                $sql="SELECT ".$tableNames["posts"].".*, COUNT(";
                $sql.=$tableNames["comments"].".id) AS cnt, ";
                $sql.=" ".$tableNames["users"].".fname,".$tableNames["users"];
                $sql.=".mname,".$tableNames["users"].".lname,";
                $sql.=$tableNames["users"].".nick,";
                $sql.=$tableNames["users"].".privlgs ";
                $sql.=" FROM ".$tableNames["posts"]." ";
                $sql.=" LEFT JOIN ".$tableNames["comments"]." ";
                $sql.=" ON ".$tableNames["comments"];
                $sql.=".postid=".$tableNames["posts"].".id ";
                $sql.=" LEFT JOIN ".$tableNames["users"]." ";
                $sql.=" ON ".$tableNames["users"].".id=";
                $sql.=$tableNames["comments"].".usrid ";
                if ($findTxt!="") {
                    $sql.=" WHERE ".$findTxt." ";
                }
                $sql.=" GROUP BY ".$tableNames["posts"].".id ".$limit.$offset;
                $sqlLast1=$sql;
                $stmt=$db->prepare($sql);
                $stmt->execute();
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    array_push($posts, $row);
                }
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'    => $status,
            'err'       => $err,
            'posts'     => $posts,
            'itemsCount'=> $itemsCount,
            'pgNum'     => $pgNum,
        ]);
    }


    
    //Validate comments Delete
    //By one post view
    public function validateByPostsRemove($dataIN)
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


    
    //Delete comments by post
    public function cByPostsRemove($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error

        $db=$this->container['db'];
        $parsedBody = $request->getParsedBody();
        $tableNames=$this->container['tableNames'];

        //Check access rights
        if (!chkUserPrivileges($request, $db, [
            'ADMIN_PAGE_ACCESS'
        ])) {
            return $response->withJson([
                'status'        => 0,
                'err'           => 'Access denied',
            ]);
        }

        try {

            //Validate input data
            $res=$this->validateByPostsRemove($parsedBody);
            if ($res['status']==0) {
                return $response->withJson($res);
            }

            $post_ids=$parsedBody['ids'];

            //Delete all comments of posts by id posts
            $where="";
            for ($i=0; $i<count($post_ids); $i++) {
                $where.=" postid=:id".$i." OR ";
            }
            if (count($post_ids)>0) {
                $where=" WHERE ".substr($where, 0, -4);
            }
            
            $sql="DELETE FROM comments ".$where;
            $stmt=$db->prepare($sql);
            for ($i=0; $i<count($post_ids); $i++) {
                $stmt->bindParam(":id".$i, $post_ids[$i]);
            }
            $stmt->execute();
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'        => $status,
            'err'           => $err
        ]);
    }



    //Validate comments Delete
    //By one post view
    public function validateByPostsBlock($dataIN)
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



    //Block users by post ids
    //by posts view
    public function cByPostsBlock($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error

        try {
            $db=$this->container['db'];
            $parsedBody = $request->getParsedBody();
            $tableNames=$this->container['tableNames'];

            //Check access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS',
                'WRITE_USERS'
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }

            //Validate input data
            $res=$this->validateByPostsBlock($parsedBody);
            if ($res['status']==0) {
                return $response->withJson($res);
            }
            
            $ids=$parsedBody['ids'];

            //Update priveleges in DB
            $where="";
            for ($i=0; $i<count($ids); $i++) {
                $where.=$tableNames["comments"].".postid=:id".$i." OR ";
            }
            if (count($ids)>0) {
                $where=" ".substr($where, 0, -4);
            }
            $sql="  UPDATE ".$tableNames["users"]." SET ".$tableNames["users"];
            $sql.=".privlgs=4^".$tableNames["users"].".privlgs WHERE ";
            $sql.=$tableNames["users"].".id ";
            $sql.=" IN ( SELECT usrid FROM ( ";
            $sql.=" SELECT ".$tableNames["comments"].".usrid FROM ";
            $sql.=$tableNames["comments"];
            $sql.=" WHERE ".$where." ";
            $sql.=" GROUP BY ".$tableNames["comments"].".usrid ";
            $sql.=" ) ";
            $sql.=" AS subq)";
            $stmt=$db->prepare($sql);
            for ($i=0; $i<count($ids); $i++) {
                $stmt->bindParam(":id".$i, $ids[$i]);
            }
            $stmt->execute();
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'        => $status,
            'err'           => $err
        ]);
    }



    //Get categories and comments count by page num
    //By categories view
    public function cByCategoriesGet($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $arr=array();
        $uflds=array();

        try {
            $db=$this->container['db'];
            $tableNames=$this->container['tableNames'];
            $findTxt=$request->getQueryParam("findTxt", "");

            //Check access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS'
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }

            //Get counts of comments by categories
            $sql="  SELECT ".$tableNames["category"].".id, COUNT(";
            $sql.=$tableNames["comments"].".id) AS cnt FROM ";
            $sql.=$tableNames["category"];
            $sql.=" LEFT JOIN ".$tableNames["cat_post_sv"]."  ON ";
            $sql.=$tableNames["cat_post_sv"].".catid=";
            $sql.=$tableNames["category"].".id ";
            $sql.=" LEFT JOIN ".$tableNames["comments"]."  ON ";
            $sql.=$tableNames["comments"].".postid=";
            $sql.=$tableNames["cat_post_sv"].".postid ";
            $sql.=" GROUP BY ".$tableNames["category"].".id ";
            $stmt=$db->prepare($sql);
            $stmt->execute();
            $arrCnts=array();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($arrCnts, $row);
            }

            //Get categories by page
            $sql="  SELECT ".$tableNames["category"].".*, COUNT(";
            $sql.=$tableNames["comments"].".id) AS cnt FROM ";
            $sql.=$tableNames["category"]." ";
            $sql.=" LEFT JOIN ".$tableNames["cat_post_sv"]." ";
            $sql.=" ON ".$tableNames["cat_post_sv"].".catid=";
            $sql.=$tableNames["category"].".id ";
            $sql.=" LEFT JOIN ".$tableNames["comments"]." ";
            $sql.=" ON ".$tableNames["comments"].".postid=";
            $sql.=$tableNames["cat_post_sv"].".postid ";
            if ($findTxt!="") {
                $sql.=" WHERE ".$tableNames["comments"].".txt LIKE ";
                $sql.=$db->quote("%".$findTxt."%")." ";
            }
            $sql.=" GROUP BY ".$tableNames["category"].".id ";
            $stmt=$db->prepare($sql);
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($arr, $row);
            }
            
            //Map counts to categories
            for ($i=0;$i<count($arr);$i++) {
                for ($j=0;$j<count($arrCnts);$j++) {
                    if ($arrCnts[$j]["id"]==$arr[$i]["id"]) {
                        $arr[$i]["cnt"]=$arrCnts[$j]["cnt"];
                    }
                }
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'        => $status,
            'err'           => $err,
            'categories'    => $arr,
        ]);
    }



    //Validate comments Delete
    public function validateByCategoriesRemove($dataIN)
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
    


    //Comments Delete
    //By categories view
    public function cByCategoriesRemove($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error

        try {
            $db=$this->container['db'];
            $parsedBody = $request->getParsedBody();
            $tableNames=$this->container['tableNames'];

            //Check access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS'
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }

            //Validate input data
            $res=$this->validateByCategoriesRemove($parsedBody);
            if ($res['status']==0) {
                return $response->withJson($res);
            }

            //catids
            $ids=$parsedBody['ids'];
            
            //Delete comments linked with posts of selected categories
            $idsStr="";
            for ($i=0;$i<count($ids);$i++) {
                $idsStr.=$tableNames["cat_post_sv"].".catid=:id".$i." OR ";
            }
            if (count($ids)>0) {
                $idsStr=" WHERE ".substr($idsStr, 0, -4);
            }
            $sql="  DELETE FROM ".$tableNames["comments"]." WHERE ";
            $sql.=$tableNames["comments"].".id IN ( ";
            $sql.=" SELECT id FROM ( ";
            $sql.=" SELECT ".$tableNames["comments"].".id FROM ";
            $sql.=$tableNames["comments"]." ";
            $sql.=" LEFT JOIN ".$tableNames["cat_post_sv"]." ";
            $sql.=" ON ".$tableNames["cat_post_sv"].".postid=";
            $sql.=$tableNames["comments"].".postid ";
            $sql.= $idsStr;
            $sql.=" GROUP BY ".$tableNames["comments"].".id) AS subq ";
            $sql.=" ) ";
            $stmt=$db->prepare($sql);
            for ($i=0;$i<count($ids);$i++) {
                $stmt->bindParam(":id".$i, $ids[$i]);
            }
            $stmt->execute();
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'        => $status,
            'err'           => $err,
        ]);
    }


    //Get list comments of entered category
    public function cByCategoriesEnterCategory($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $arr=array();
        $maxPgNum=0;
        $itemsCount=0;
        $db=$this->container['db'];

        try {
            
            //Check access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS'
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }

            $tableNames=$this->container['tableNames'];
            $catid=intval($request->getQueryParam("catid", 1));
            $pgNum=intval($request->getQueryParam("pgNum", 1));
            $itemsPerPage=intval($request->getQueryParam("itemsPerPage", 10));
            $findTxt=$request->getQueryParam("findTxt", "");

            //Get items count of comments
            if ($itemsPerPage==0) {
                $itemsPerPage=1;
            }
            $idsStr="";
            if ($catid>0) {
                $idsStr=" WHERE ".$tableNames["cat_post_sv"].".catid=:catid ";
            }
            if ($findTxt!="") {
                $findTxt=" AND ".$tableNames["comments"].".txt LIKE ";
                $findTxt.=$db->quote("%".$findTxt."%")." ";
            }
            $sql="  SELECT COUNT(".$tableNames["comments"].".id) AS cnt FROM ";
            $sql.=$tableNames["comments"];
            $sql.=" LEFT JOIN ".$tableNames["cat_post_sv"];
            $sql.=" ON ".$tableNames["cat_post_sv"].".postid=";
            $sql.=$tableNames["comments"].".postid ";
            $sql.=  $idsStr.$findTxt;
            $stmt=$db->prepare($sql);
            if ($catid>0) {
                $stmt->bindParam(":catid", $catid);
            }
            $stmt->execute();
            if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $itemsCount=$row["cnt"];
            }
            
            //Calc real pages count
            $maxPgNum=($itemsCount%$itemsPerPage==0)
                ?$itemsCount/$itemsPerPage
                :intval($itemsCount/$itemsPerPage)+1;
            
            //Fix pgNum if it goes out from limit
            if ($pgNum>$maxPgNum && $maxPgNum>0) {
                $pgNum=$maxPgNum;
            }

            //Select comments of One category by page num
            $limit=" LIMIT ".$itemsPerPage;
            $offset=" OFFSET ".(($pgNum-1)*$itemsPerPage);
            $sql="  SELECT ".$tableNames["comments"].".*,".$tableNames["users"];
            $sql.=".fname,".$tableNames["users"].".mname,".$tableNames["users"];
            $sql.=".lname,".$tableNames["users"].".nick,".$tableNames["users"];
            $sql.=".privlgs FROM ".$tableNames["comments"];
            $sql.=" LEFT JOIN cat_post_sv ";
            $sql.=" ON cat_post_sv.postid=".$tableNames["comments"].".postid ";
            $sql.=" LEFT JOIN ".$tableNames["users"]." ";
            $sql.=" ON ".$tableNames["users"].".id=";
            $sql.=$tableNames["comments"].".usrid ";
            $sql.=  $idsStr.$findTxt;
            $sql.=" GROUP BY ".$tableNames["comments"].".id ".$limit.$offset;
            $stmt=$db->prepare($sql);
            if ($catid!="") {
                $stmt->bindParam(":catid", $catid);
            }
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($arr, $row);
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'    => $status,
            'err'       => $err,
            'arr'       => $arr,
            'pgNum'     => $pgNum,
            'itemsCount'=> $itemsCount,
        ]);
    }



    //Validate comments Delete
    //By one category view
    public function validateByCategoryOneRemove($dataIN)
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


    
    //Delete comments
    //By one category view
    public function cByCategoryOneRemove($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $arrChldrn=array();
        $db=$this->container['db'];
        $parsedBody = $request->getParsedBody();
        $tableNames=$this->container['tableNames'];

        try {
            
            //Check access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS'
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }

            //Validate input data
            $res=$this->validateDelete($parsedBody);
            if ($res['status']==0) {
                return $response->withJson($res);
            }
            
            $ids=$parsedBody['ids'];

            //Filter unique leaf ids of comments
            $arrLeafs=array();
            for ($i=0;$i<count($ids);$i++) {
                array_push($arrLeafs, $ids[$i]["leafid"]);
            }
            $arrLeafs=array_unique($arrLeafs);
            $arrLeafsStr="";
            $i=0;
            foreach ($arrLeafs as $val) {
                $arrLeafsStr.="leafid=:leafid".$i." OR ";
                $i++;
            }
            if ($i>0) {
                $arrLeafsStr=substr($arrLeafsStr, 0, -4);
            }

            //get all comments of unique leafs
            $arrAllIdsOfAllLeafs=array();
            $sql="SELECT id, pid, leafid FROM ";
            $sql.=$tableNames['comments']." WHERE ".$arrLeafsStr;
            $stmt=$db->prepare($sql);
            for ($i=0; $i<count($arrLeafs); $i++) {
                $stmt->bindParam(':leafid'.$i, $arrLeafs[$i]);
            }
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($arrAllIdsOfAllLeafs, [
                    'id'    =>$row['id'],
                    'pid'   =>$row['pid'],
                ]);
            }
            
            //Generate nested leafs into plain array of ids to delete
            for ($i=0;$i<count($ids);$i++) {
                $arrChldrn=array_merge(
                    $arrChldrn,
                    $this->parseIds($ids[$i], $arrAllIdsOfAllLeafs)
                );
            }
            
            //Delete comments
            $arrChldrn=array_unique($arrChldrn);
            $arrChldrnStr="";
            foreach ($arrChldrn as $key => $value) {
                $arrChldrnStr.="id=".$value." OR ";
            }
            if (count($arrChldrn)>0) {
                $arrChldrnStr=substr($arrChldrnStr, 0, -4);
            }
            $sql="DELETE FROM ".$tableNames['comments']." WHERE ".$arrChldrnStr;
            $stmt=$db->prepare($sql);
            $stmt->execute();
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'    => $status,
            'err'       => $err,
            'deleted'   => count($arrChldrn),
            'ids'       => $arrChldrn,
        ]);
    }



    //Validate users Block
    //By Category One view
    public function validateByCategoryOneBlockUser($dataIN)
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



    //Users Block
    //By Category One view
    public function cByCategoryOneBlockUser($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error

        $db=$this->container['db'];
        $parsedBody = $request->getParsedBody();
        $tableNames=$this->container['tableNames'];

        //Check access rights
        if (!chkUserPrivileges($request, $db, [
            'ADMIN_PAGE_ACCESS',
            'WRITE_USERS'
        ])) {
            return $response->withJson([
                'status'        => 0,
                'err'           => 'Access denied',
            ]);
        }

        try {
            
            //Validate input data
            $res=$this->validateByCategoryOneBlockUser($parsedBody);
            if ($res['status']==0) {
                return $response->withJson($res);
            }
                       
            $ids=$parsedBody['ids'];

            //Block users in DB
            $idsStr="";
            for ($i=0;$i<count($ids);$i++) {
                $idsStr.=" id=:id".$i." OR ";
            }
            if (count($ids)>0) {
                $idsStr=" WHERE ".substr($idsStr, 0, -4);
            }
            $sql=" UPDATE ".$tableNames["users"]." SET ".$tableNames["users"];
            $sql.=".privlgs=4^".$tableNames["users"].".privlgs ";
            $sql.=" WHERE ".$tableNames["users"].".id IN ( ";
            $sql.=" SELECT usrid FROM ";
            $sql.=" (SELECT ".$tableNames["comments"].".usrid FROM ";
            $sql.=$tableNames["comments"]." ";
            $sql.=$idsStr;
            $sql.=" GROUP BY ".$tableNames["comments"].".usrid	) AS subq)";
            $stmt=$db->prepare($sql);
            for ($i=0;$i<count($ids);$i++) {
                $stmt->bindParam(":id".$i, $ids[$i]);
            }
            $stmt->execute();
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'        => $status,
            'err'           => $err,
        ]);
    }



    //Get comments by one post
    public function cByPostOneGet($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $arr=array();
        $itemsCount=0;
        $db=$this->container['db'];
        $tableNames=$this->container['tableNames'];
        $limit="";
        $offset="";
        $leafids="";

        //Check access rights
        if (!chkUserPrivileges($request, $db, [
            'ADMIN_PAGE_ACCESS',
        ])) {
            return $response->withJson([
                'status'        => 0,
                'err'           => 'Access denied',
            ]);
        }

        $pgNum=intval($request->getQueryParam("pgNum", 1));
        $postid=$request->getQueryParam("postid", -1);
        $itemsPerPage=$request->getQueryParam("itemsPerPage", 10);
        if ($itemsPerPage==0) {
            $itemsPerPage=1;
        }

        try {
            if ($itemsPerPage>0 && $pgNum>0) {
                //Get comments count by post id
                $sql="SELECT COUNT(leafid) AS cnt FROM ".$tableNames['comments'];
                $sql.=" WHERE pid=-1 AND postid=:postid ";
                $stmt=$db->prepare($sql);
                $stmt->bindParam(":postid", $postid);
                $stmt->execute();
                if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    $itemsCount=$row["cnt"];
                }

                //Calc real pages count
                $maxPgNum=($itemsCount%$itemsPerPage==0)
                    ?$itemsCount/$itemsPerPage
                    :intval($itemsCount/$itemsPerPage)+1;

                //Fix pgNum if it goes out from limit
                if ($pgNum>$maxPgNum && $maxPgNum>0) {
                    $pgNum=$maxPgNum;
                }
                if ($pgNum<1) {
                    $pgNum=1;
                }
                
                //Get leaf ids root comments by post id and page num
                $limit=" LIMIT ".$itemsPerPage;
                $offset=" OFFSET ".(($pgNum-1)*$itemsPerPage);
                $sql="SELECT leafid FROM ".$tableNames['comments'];
                $sql.=" WHERE pid=-1 AND postid=:postid ";
                $sql.=$limit.$offset;
                $stmt=$db->prepare($sql);
                $stmt->bindParam(":postid", $postid);
                $stmt->execute();
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    $leafids.=$tableNames['comments'].".leafid=".$row['leafid']." OR ";
                }
                
                if (strlen($leafids)>0) {
                    
                    //Get comments leafs by leafid
                    $leafids=" WHERE ".substr($leafids, 0, -4);
                    $sql="SELECT ".$tableNames['comments'].".*, ";
                    $sql.=$tableNames['users'].".fname,".$tableNames['users'];
                    $sql.=".mname,".$tableNames['users'].".lname,";
                    $sql.=$tableNames['users'].".nick,".$tableNames['users'];
                    $sql.=".privlgs FROM ".$tableNames['comments']." ";
                    $sql.=" LEFT JOIN ".$tableNames['users']." ON ";
                    $sql.=$tableNames['users'].".id=";
                    $sql.=$tableNames['comments'].".usrid ";
                    $sql.=$leafids." ORDER BY ".$tableNames['comments'].".leafid, ";
                    $sql.=$tableNames['comments'].".num";
                    $stmt=$db->prepare($sql);
                    $stmt->execute();
                    while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                        array_push($arr, $row);
                    }
                }
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'        => $status,
            'err'           => $err,
            'comments'      => $arr,
            'itemsCount'    => $itemsCount,
            'pgNum'         => $pgNum,
        ]);
    }



    //Validate comments Block
    //By Post one view
    public function validateByPostOneBlockUser($dataIN)
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



    //By post One block
    public function cByPostOneBlockUser($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        try {
            $db=$this->container['db'];
            $parsedBody = $request->getParsedBody();
            $tableNames=$this->container['tableNames'];

            //Check access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS',
                'WRITE_USERS'
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }

            //Validate input data
            $res=$this->validateByCategoryOneBlockUser($parsedBody);
            if ($res['status']==0) {
                return $response->withJson($res);
            }
            
            $ids=$parsedBody['ids'];

            //Update user priveleges
            $idsStr="";
            for ($i=0;$i<count($ids);$i++) {
                $idsStr.=" id=:id".$i." OR ";
            }
            if (count($ids)>0) {
                $idsStr=" WHERE ".substr($idsStr, 0, -4);
            }
            $sql=" UPDATE ".$tableNames["users"]." SET ";
            $sql.=$tableNames["users"].".privlgs=4^";
            $sql.=$tableNames["users"].".privlgs ";
            $sql.=" WHERE ".$tableNames["users"].".id IN ( ";
            $sql.=" SELECT usrid FROM ";
            $sql.=" (SELECT DISTINCT ".$tableNames["comments"].".usrid FROM ";
            $sql.=$tableNames["comments"]." ";
            $sql.=$idsStr;
            $sql.=" GROUP BY ".$tableNames["comments"].".id	) AS subq)";
            $stmt=$db->prepare($sql);
            for ($i=0;$i<count($ids);$i++) {
                $stmt->bindParam(":id".$i, $ids[$i]);
            }
            $stmt->execute();
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'        => $status,
            'err'           => $err,
        ]);
    }



    //Find comments
    //By one post view
    public function cByPostOneFind($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $arr=array();
        $itemsCount=0;
        $tableNames=$this->container['tableNames'];
        $limit="";
        $offset="";
        $leafids="";
        $db=$this->container['db'];

        //Check access rights
        if (!chkUserPrivileges($request, $db, [
            'ADMIN_PAGE_ACCESS',
        ])) {
            return $response->withJson([
                'status'        => 0,
                'err'           => 'Access denied',
            ]);
        }

        $pgNum=intval($request->getQueryParam("pgNum", 1));
        $postid=$request->getQueryParam("postid", -1);
        $findTxt=$request->getQueryParam("findTxt", "");
        $itemsPerPage=$request->getQueryParam("itemsPerPage", 10);
        if ($itemsPerPage==0) {
            $itemsPerPage=1;
        }

        try {
            if ($itemsPerPage>0 && $pgNum>0) {

                //Get count root comments by post id
                $sql="SELECT COUNT(leafid) AS cnt FROM ".$tableNames['comments'];
                $sql.=" WHERE pid=-1 AND postid=:postid ";
                if ($findTxt!="") {
                    $sql.=" AND txt LIKE :findTxt ";
                }
                $stmt=$db->prepare($sql);
                $stmt->bindParam(":postid", $postid);
                if ($findTxt!="") {
                    $findTxt="%".$findTxt."%";
                    $stmt->bindParam(":findTxt", $findTxt);
                }
                $stmt->execute();
                if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    $itemsCount=$row["cnt"];
                }

                //Calc real pages count
                $maxPgNum=($itemsCount%$itemsPerPage==0)
                    ?$itemsCount/$itemsPerPage
                    :intval($itemsCount/$itemsPerPage)+1;

                //Fix pgNum if it goes out from limit
                if ($pgNum>$maxPgNum && $maxPgNum>0) {
                    $pgNum=$maxPgNum;
                }
                if ($pgNum<1) {
                    $pgNum=1;
                }
                
                //Get root comments by post id
                $limit=" LIMIT ".$itemsPerPage;
                $offset=" OFFSET ".(($pgNum-1)*$itemsPerPage);
                $sql="SELECT leafid FROM ".$tableNames['comments'];
                $sql.=" WHERE pid=-1 AND postid=:postid ";
                if ($findTxt!="") {
                    $sql.=" AND txt LIKE :findTxt ";
                }
                $sql.=$limit.$offset;
                $stmt=$db->prepare($sql);
                $stmt->bindParam(":postid", $postid);
                if ($findTxt!="") {
                    $findTxt="%".$findTxt."%";
                    $stmt->bindParam(":findTxt", $findTxt);
                }
                $stmt->execute();
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    $leafids.=$tableNames["comments"].".leafid=".$row['leafid']." OR ";
                }

                if (strlen($leafids)>0) {
                    //Get comments by leaf ids
                    $leafids=" WHERE ".substr($leafids, 0, -4);
                    $sql="SELECT ".$tableNames["comments"].".*, ";
                    $sql.=$tableNames["users"].".fname,";
                    $sql.=$tableNames["users"].".mname,";
                    $sql.=$tableNames["users"].".lname,";
                    $sql.=$tableNames["users"].".nick,";
                    $sql.=$tableNames["users"].".privlgs FROM ";
                    $sql.=$tableNames["comments"];
                    $sql.=" LEFT JOIN ".$tableNames["users"]." ON ";
                    $sql.=$tableNames["users"].".id=";
                    $sql.=$tableNames["comments"].".usrid ";
                    $sql.=$leafids." ORDER BY ".$tableNames["comments"].".leafid, ";
                    $sql.=$tableNames["comments"].".num";
                    $stmt=$db->prepare($sql);
                    $stmt->execute();
                    while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                        array_push($arr, $row);
                    }
                }
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'        => $status,
            'err'           => $err,
            'comments'      => $arr,
            'itemsCount'    => $itemsCount,
            'pgNum'         => $pgNum,
        ]);
    }

    

    //Get client comments by page
    public function cClientCommentsLoad($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $arr=array();
        $itemsCount=0;
        $db=$this->container['db'];

        $pgNum=intval($request->getQueryParam("pgNum", 1));
        $itemsPerPage=$request->getQueryParam("itemsPerPage", 10);
        $postid=$request->getQueryParam("postid", -1);
        $tableNames=$this->container['tableNames'];

        $limit="";
        $offset="";
        $leafids="";
        
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

            if ($itemsPerPage>0 && $pgNum>0) {
                
                //Get leafs count by post id
                $sql="SELECT COUNT(leafid) AS cnt FROM ";
                $sql.=$tableNames['comments']." WHERE pid=-1 AND postid=:postid";
                $stmt=$db->prepare($sql);
                $stmt->bindParam(":postid", $postid);
                $stmt->execute();
                if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    $itemsCount=$row["cnt"];
                }

                //Calc real pages count
                $maxPgNum=($itemsCount%$itemsPerPage==0)
                    ?$itemsCount/$itemsPerPage
                    :intval($itemsCount/$itemsPerPage)+1;

                //Fix pgNum if it goes out from limit
                if ($pgNum>$maxPgNum && $maxPgNum>0) {
                    $pgNum=$maxPgNum;
                }
                if ($pgNum<1) {
                    $pgNum=1;
                }
                
                //Get leaf ids by post id
                $limit=" LIMIT ".$itemsPerPage;
                $offset=" OFFSET ".(($pgNum-1)*$itemsPerPage);
                $sql="SELECT leafid FROM ".$tableNames['comments'];
                $sql.=" WHERE pid=-1 AND postid=:postid ".$limit.$offset;
                $stmt=$db->prepare($sql);
                $stmt->bindParam(":postid", $postid);
                $stmt->execute();
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    $leafids.=$tableNames['comments'].".leafid=".$row['leafid']." OR ";
                }

                if (strlen($leafids)>0) {

                    //Get comments by leaf ids
                    $leafids=" WHERE postid=:postid AND (".substr($leafids, 0, -4).")";
                    $sql="SELECT ".$tableNames['comments'].".*, ";
                    $sql.=$tableNames['users'].".fname,";
                    $sql.=$tableNames['users'].".mname,";
                    $sql.=$tableNames['users'].".lname,";
                    $sql.=$tableNames['users'].".nick,";
                    $sql.=$tableNames['users'].".privlgs FROM ";
                    $sql.=$tableNames['comments'];
                    $sql.=" LEFT JOIN ".$tableNames['users']." ON ";
                    $sql.=$tableNames['users'].".id=";
                    $sql.=$tableNames['comments'].".usrid ";
                    $sql.=$leafids." ORDER BY ".$tableNames['comments'].".leafid, ";
                    $sql.=$tableNames['comments'].".num";
                    $stmt=$db->prepare($sql);
                    $stmt->bindParam(":postid", $postid);
                    $stmt->execute();
                    while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                        array_push($arr, $row);
                    }
                }
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'        => $status,
            'err'           => $err,
            'comments'      => $arr,
            'itemsCount'    => $itemsCount,
            'pgNum'         => $pgNum,
            "leafids"=>$leafids
        ]);
    }

  

    //Get user by Token
    public function getUserByToken($at)
    {
        $res=[
            "id"      => -1,
            "fname"   => "",
            "mname"   => "",
            "lname"   => "",
            "nick"    => "",
        ];

        $db=$this->container['db'];
        $tableNames=$this->container['tableNames'];
        $sql="  SELECT ".$tableNames["users"].".* FROM ".$tableNames["users"];
        $sql.=" LEFT JOIN ".$tableNames["tokens"];
        $sql.=" ON ".$tableNames["tokens"].".usrid=".$tableNames["users"].".id ";
        $sql.=" WHERE ".$tableNames["tokens"].".at=:atoken";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':atoken', $at);
        $stmt->execute();
        if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
            $res=[
                "id"      => $row["id"],
                "fname"   => $row["fname"],
                "mname"   => $row["mname"],
                "lname"   => $row["lname"],
                "nick"    => $row["nick"],
            ];
        }
        return $res;
    }



    //Validate comment answer
    public function validateClientCommentAnswer($dataIN)
    {
        $v = new \Valitron\Validator($dataIN);

        $v->rule('required', "id")->message('{field} must be set');
        $v->rule('required', "leafid")->message('{field} must be set');
        $v->rule('required', "usrid")->message('{field} must be set');
        $v->rule('required', "postid")->message('{field} must be set');
        $v->rule('required', "mycmnt")->message('{field} must be set');

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



    //Comment answer
    public function cClientCommentAnswer($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $comentId=-1;
        $parsedBody = $request->getParsedBody();
        $db=$this->container['db'];
        $tableNames=$this->container['tableNames'];
        
        //Validate input data
        $res=$this->validateClientCommentAnswer($parsedBody);
        if ($res['status']==0) {
            return $response->withJson($res);
        }

        $leafid=intval($parsedBody['leafid']);
        $pid=intval($parsedBody['id']);
        $usrid=intval($parsedBody['usrid']);
        $postid=intval($parsedBody['postid']);
        $txt=$parsedBody['mycmnt'];
        $capcha=$parsedBody['capcha'];
        $dt="";

        //Check access rights for the NOT logged in users
        if (strpos($request->getUri()->getPath(), "-noauth")>0) {
            if (!getSettings(['ANONYMOUS_ACCESS'], $db)['ANONYMOUS_ACCESS']) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }
        }

        //Get author by Token
        $user=[
            "id"      => -1,
            "fname"   => "",
            "mname"   => "",
            "lname"   => "",
            "nick"    => "",
        ];
        if ($usrid!=-1) {
            $res=$request->getHeader('Authorization');
            if (isset($res) && count($res)>0) {
                $user=$this->getUserByToken(substr($res[0], 7));
                $usrid=$user["id"];
            }
        }

        //Get capcha settings enable
        $isCapchaOn=getSettings(['RECAPCHA_COMMENTS'], $db)['RECAPCHA_COMMENTS'];
        $resCapcha=false;
        
        //Check capcha on google
        if ($isCapchaOn) {
            $resCapcha=chkCapcha(
                $capcha,
                getSettings(['RECAPCHA_PRIVATE_KEY'], $db)['RECAPCHA_PRIVATE_KEY']
            );
        }
        try {

            //Capcha enabled and empty
            if (!$resCapcha && $isCapchaOn) {
                $status=0;
                $err="Capcha is not correct";
            } else {
                //Add comment to DB
                $sql="INSERT INTO ".$tableNames['comments'];
                $sql.=" (pid,leafid,postid,usrid,txt,dt) ";
                $sql.=" VALUES(:pid,:leafid,:postid,:usrid,:txt,:dt)";
                $stmt=$db->prepare($sql);
                $stmt->bindParam(":pid", $pid);
                $stmt->bindParam(":leafid", $leafid);
                $stmt->bindParam(":postid", $postid);
                $stmt->bindParam(":usrid", $usrid);
                $stmt->bindParam(":txt", $txt);
                ini_set("date.timezone", "Europe/Moscow");
                $dt=date('Y-m-d H:i:s');
                $stmt->bindParam(":dt", $dt);
                $stmt->execute();
                $comentId=$db->lastInsertId();
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'        => $status,
            'err'           => $err,
            'id'            => $comentId,
            'dt'            => $dt,
            'user'          => $user
        ]);
    }



    //Validator comment Add
    public function validateCommentAdd($dataIN)
    {
        $v = new \Valitron\Validator($dataIN);

        $v->rule('required', 'usrid')->message('{field} must be set');
        $v->rule('required', 'postid')->message('{field} must be set');
        $v->rule('required', 'mycmnt')->message('{field} must be set');
        $v->rule('lengthMin', 'mycmnt', 1)->message('{field} min length 1');

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

    
    
    //Add comment on client
    public function cClientCommentAdd($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $comentId=-1;
        $parsedBody = $request->getParsedBody();
        $leafid=-1;
        $pid=-1;
        $db=$this->container['db'];
        $tableNames=$this->container['tableNames'];

        //Validate comment add
        $res=$this->validateCommentAdd($parsedBody);
        if ($res['status']==0) {
            return $response->withJson($res);
        }

        $usrid=intval($parsedBody['usrid']);
        $postid=intval($parsedBody['postid']);
        $txt=$parsedBody['mycmnt'];
        $capcha=$parsedBody['capcha'];
        $dt="";

        //Check access rights for the NOT logged in users
        if (strpos($request->getUri()->getPath(), "-noauth")>0) {
            if (!getSettings(['ANONYMOUS_ACCESS'], $db)['ANONYMOUS_ACCESS']) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }
        }

        //Check capcha on google
        $isCapchaOn=getSettings(['RECAPCHA_COMMENTS'], $db)['RECAPCHA_COMMENTS'];
        $resCapcha=false;
        
        //Check capcha on google
        if ($isCapchaOn) {
            $resCapcha=chkCapcha($capcha,
                getSettings(
                    ['RECAPCHA_PRIVATE_KEY'], 
                    $db
                )['RECAPCHA_PRIVATE_KEY']
            );
        }

        //Get author by Token
        $user=[
            "id"      => -1,
            "fname"   => "",
            "mname"   => "",
            "lname"   => "",
            "nick"    => "",
        ];
        if ($usrid!=-1) {
            $res=$request->getHeader('Authorization');
            if (isset($res) && count($res)>0) {
                $user=$this->getUserByToken(substr($res[0], 7));
                $usrid=$user["id"];
            }
        }

        try {

            //Capcha enabled and empty
            if (!$resCapcha && $isCapchaOn) {
                $status=0;
                $err="Capcha is not correct";
            } else {
                //Add comment
                $sql="INSERT INTO ".$tableNames['comments'];
                $sql.=" (pid,leafid,postid,usrid,txt,dt) ";
                $sql.=" VALUES(:pid,:leafid,:postid,:usrid,:txt,:dt)";
                $stmt=$db->prepare($sql);
                $stmt->bindParam(":pid", $pid);
                $stmt->bindParam(":leafid", $leafid);
                $stmt->bindParam(":postid", $postid);
                $stmt->bindParam(":usrid", $usrid);
                $stmt->bindParam(":txt", $txt);
                ini_set("date.timezone", "Europe/Moscow");
                $dt=date('Y-m-d H:i:s');
                $stmt->bindParam(":dt", $dt);
                $stmt->execute();
                $comentId=$db->lastInsertId();
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'        => $status,
            'err'           => $err,
            'id'            => $comentId,
            'dt'            => $dt,
            'user'          => $user
        ]);
    }
}
