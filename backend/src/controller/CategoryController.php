<?php
namespace App\Controller;

use Valitron\Validator;
use Psr\HttpMessage\ServerRequestInterface as Request;
use Psr\HttpMessage\ResponseInterface as Response;

require_once(realpath(dirname(__FILE__)."/../general/myfuncs.php"));

//Categories
class CategoryController
{
    protected $container;

    public function __construct($c)
    {
        $this->container = $c;
    }



    //Get categories names with lang prefix
    public function getNameLngFields($dataIN)
    {
        $keys=array_keys($dataIN);
        $arrOut=array();
        for ($i=0; $i<count($keys); $i++) {
            $cnt=preg_match_all(
                '/(name_[a-z]{2})/',
                $keys[$i],
                $matches
            );
            if ($cnt>0) {
                array_push($arrOut, $keys[$i]);
            }
        }
        return $arrOut;
    }



    //Get all categories
    public function cGet($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $arr=array();
        $uflds=array();
        try {
            $db=$this->container['db'];

            //Check access rights for the NOT logged in users
            if (strpos($request->getUri()->getPath(), "-noauth")>0) {
                if (!getSettings(['ANONYMOUS_ACCESS'], $db)['ANONYMOUS_ACCESS']) {
                    return $response->withJson([
                        'status'        => 0,
                        'err'           => 'Access denied',
                    ]);
                }
            }
            
            //Check access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS',
                'READ_CATEGORIES'
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }

            //Select all categories from DB
            $tableNames=$this->container['tableNames'];
            $sql="SELECT * FROM ".$tableNames['category'];
            $stmt=$db->prepare($sql);
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($arr, $row);
            }

            //Select all user fields from DB
            $sql="SELECT * FROM ".$tableNames['cat_usrflds'];
            $stmt=$db->prepare($sql);
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($uflds, $row);
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'        => $status,
            'err'           => $err,
            'categories'    => $arr,
            'uflds'         => $uflds,
        ]);
    }



    //Get category number to Add
    public function getNextNumCat($pid)
    {
        $db=$this->container['db'];
        $tableNames=$this->container['tableNames'];
        $num=0;

        //Get max num category
        $sql="SELECT MAX(num) AS numx FROM ".$tableNames['category'];
        $sql.=" WHERE pid=:pid";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':pid', $pid);
        $stmt->execute();
        if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
            $num=intval($row['numx']);
        }
        return $num+1;
    }



    //Validate add category
    public function validateAdd($dataIN)
    {
        $v = new \Valitron\Validator($dataIN);
        $v->rule('required', "pid")->message('{field} must be set');
        $v->rule('required', "keyWords.keyWordsSelfOn")->message('{field} must be set');
        $v->rule('required', "order.autoNumerate")->message('{field} must be set');
        $v->rule('required', "userFields.userFieldsOn")->message('{field} must be set');
        $v->rule('required', "names")->message('{field} must be set');
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



    //Add category
    public function cAdd($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $idleaf=-1;
        $dt="";
        $id="";
        $num=0;
        $uflds=[];
        $sqlLast="";

        try {
            $db=$this->container['db'];
            $parsedBody = $request->getParsedBody();
            $tableNames=$this->container['tableNames'];

            //Check user access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS',
                'WRITE_CATEGORIES'
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }

            //Validate input data
            $res=$this->validateAdd($parsedBody);
            if ($res['status']==0) {
                return $response->withJson($res);
            }

            //Add category
            $sql="INSERT INTO ".$tableNames['category'];
            $sql.=" (pid, idleaf, kwrds, kwrdson, auto_numerate, orderby, num, ";
            $sql.=" user_fields_on, dt,vws,";
            foreach ($parsedBody["names"] as $key=>$item) {
                $sql.="name_".$key.",";
            }
            $sql=substr($sql, 0, -1).") VALUES (";
            $sql.=" :pid, :idleaf, :kwrds, :kwrdson, :auto_numerate, :orderby,";
            $sql.=" :num, :user_fields_on, :dt,0,";
            foreach ($parsedBody["names"] as $key=>$item) {
                $sql.=":name_".$key.",";
            }
            $sql=substr($sql, 0, -1).")";
            $stmt=$db->prepare($sql);
            $keyWordsSelfOn=$parsedBody["keyWords"]["keyWordsSelfOn"]?1:0;
            $autoNumerate=$parsedBody["order"]["autoNumerate"]?1:0;
            $userFieldsOn=$parsedBody["userFields"]["userFieldsOn"]?1:0;
            $stmt->bindParam(':pid', $parsedBody["pid"]);
            if ($parsedBody["idleaf"]==-1) {
                $idleaf=mt_rand(10, 999999);
            } else {
                $idleaf=$parsedBody["idleaf"];
            }
            $stmt->bindParam(':idleaf', $idleaf);
            $parsedBody["keyWords"]["keyWords"]=
                str_replace(";", ",", $parsedBody["keyWords"]["keyWords"]);
            $stmt->bindParam(':kwrds', $parsedBody["keyWords"]["keyWords"]);
            $stmt->bindParam(':kwrdson', $keyWordsSelfOn);
            $stmt->bindValue(':auto_numerate', $autoNumerate);
            $stmt->bindValue(':orderby', $parsedBody["order"]["orderby"]);
            $num=$this->getNextNumCat($parsedBody["pid"]);
            $stmt->bindValue(':num', $num);
            $stmt->bindValue(':user_fields_on', $userFieldsOn);
            date_default_timezone_set('Europe/Moscow');
            $dt = date('Y-m-d H:i:s');
            $stmt->bindValue(':dt', $dt);
            foreach ($parsedBody["names"] as $key=>$item) {
                $stmt->bindParam(':name_'.$key, $item["name"]);
            }
            $stmt->execute();
            $id=$db->lastInsertId();

            //if user fields on
            if ($userFieldsOn==1) {

                //Add user fields into DB
                $uflds=explode(";", $parsedBody["userFields"]["userFields"]);
                $sqlAr = array();
                for ($i=0; $i<count($uflds); $i++) {
                    $sqlAr[] = '('.$id.', '.$db->quote($uflds[$i]).')';
                }
                $sql="INSERT INTO ".$tableNames['cat_usrflds'];
                $sql.=" (catid,namef) VALUES ".implode(',', $sqlAr);
                $stmt=$db->prepare($sql);
                $stmt->execute();

                //Get ids of the inserted userfields
                $uflds=[];
                $sql = "SELECT id,namef FROM ".$tableNames['cat_usrflds'];
                $sql.= " WHERE catid=".$id;
                $stmt = $db->prepare($sql);
                $stmt->execute();
                while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    array_push($uflds, [
                        'fldid' => $row['id'],
                        'namef' => $row['namef']
                    ]);
                }
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'    => $status,
            'err'       => $err,
            'id'        => $id,
            'idleaf'    => $idleaf,
            'dt'        => $dt,
            'num'       => $num,
            'uflds'     => $uflds,
        ]);
    }



    //Validate category Move
    public function validateMove($dataIN)
    {
        $v = new \Valitron\Validator($dataIN);

        $v->rule('required', "id1")->message('{field} must be set');
        $v->rule('required', "id2")->message('{field} must be set');
        $v->rule('required', "num1")->message('{field} must be set');
        $v->rule('required', "num2")->message('{field} must be set');

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
     


    //Move category up/down
    public function cMove($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        try {
            $parsedBody = $request->getParsedBody();
            $db=$this->container['db'];
            $tableNames=$this->container['tableNames'];

            //Check user rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS',
                'WRITE_CATEGORIES'
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }

            //Validate input data
            $res=$this->validateMove($parsedBody);
            if ($res['status']==0) {
                return $response->withJson($res);
            }

            $id1=$parsedBody["id1"];
            $id1=$parsedBody["num1"];
            $id2=$parsedBody["id2"];
            $id1=$parsedBody["num2"];

            //UPDATE categories
            $sql="UPDATE ".$tableNames['category']." SET num=:num WHERE id=:id";
            $stmt=$db->prepare($sql);
            $stmt->bindParam(':id', $parsedBody["id1"]);
            $stmt->bindParam(':num', $parsedBody["num1"]);
            $stmt->execute();
            $stmt=$db->prepare($sql);
            $stmt->bindParam(':id', $parsedBody["id2"]);
            $stmt->bindParam(':num', $parsedBody["num2"]);
            $stmt->execute();
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status' => $status,
            'err' => $err
        ]);
    }



    //Validate category Delete
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
     


    //Delete selected categories
    public function cDeleteSelected($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        try {
            $db=$this->container['db'];
            $parsedBody = $request->getParsedBody();

            //Check user access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS',
                'WRITE_CATEGORIES'
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
            $ids=$parsedBody["ids"];

            //Delete categories
            $ids_str1="";
            $ids_str2="";
            for ($i=0;$i<count($ids);$i++) {
                $ids_str1.="id=".$ids[$i]." OR ";
                $ids_str2.="catid=".$ids[$i]." OR ";
            }
            $ids_str1=substr($ids_str1, 0, -4);
            $ids_str2=substr($ids_str2, 0, -4);
            $sql="DELETE FROM ".$tableNames['category']." WHERE ".$ids_str1;
            $db->prepare($sql)->execute();

            //Delete categories links to post
            $sql="DELETE FROM ".$tableNames['cat_post_sv']." WHERE ".$ids_str2;
            $db->prepare($sql)->execute();

            //Delete categories links to user fields
            $sql="DELETE FROM ".$tableNames['cat_usrflds']." WHERE ".$ids_str2;
            $db->prepare($sql)->execute();
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status' => $status,
            'err' => $err
        ]);
    }

  

    //Validate category Update
    public function validateUpdate($dataIN)
    {
        $v = new \Valitron\Validator($dataIN);

        $v->rule('required', "id")->message('{field} must be set');
        $v->rule('required', "pid")->message('{field} must be set');
        $v->rule('required', "idleaf")->message('{field} must be set');
        $v->rule('required', "auto_numerate")->message('{field} must be set');
        $v->rule('required', "kwrdson")->message('{field} must be set');
        $v->rule('required', "orderby")->message('{field} must be set');
        $v->rule('required', "user_fields_on")->message('{field} must be set');

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



    //Update category
    public function cUpdate($request, $response, $args)
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
                'WRITE_CATEGORIES'
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

            //Get categories names
            $names=$this->getNameLngFields($parsedBody);

            //Get old state user_fields_on
            $user_fields_on_old = -1;
            $sql = "SELECT user_fields_on FROM ".$tableNames['category'];
            $sql .= " WHERE id=".$parsedBody["id"];
            $stmt = $db->prepare($sql);
            $stmt->execute();
            if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $user_fields_on_old=$row['user_fields_on'];
            }

            //Get user fields ids by category id
            $sql = "SELECT id,namef FROM ".$tableNames['cat_usrflds'];
            $sql .= " WHERE catid=".$parsedBody["id"];
            $stmt = $db->prepare($sql);
            $stmt->execute();
            $cat_usrflds_ids = array();
            $cat_usrflds_namefs = array();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($cat_usrflds_ids, $row['id']);
                array_push($cat_usrflds_namefs, $row['namef']);
            }

            //Get post ids of the current category
            $sql = "SELECT postid FROM ".$tableNames['cat_post_sv'];
            $sql .= " WHERE catid=".$parsedBody["id"];
            $stmt = $db->prepare($sql);
            $stmt->execute();
            $post_ids = array();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($post_ids, $row['postid']);
            }

            //Update category in DB
            $sql="UPDATE ".$tableNames['category']." SET ";
            $sql.="kwrds=:kwrds,";
            $sql.="kwrdson=:kwrdson,";
            $sql.="auto_numerate=:auto_numerate,";
            $sql.="orderby=:orderby,";
            $sql.="user_fields_on=:user_fields_on";
            for ($i=0; $i<count($names); $i++) {
                $sql.=",".$names[$i]."=:".$names[$i];
            }
            $sql.=" WHERE id=:id";
            $stmt=$db->prepare($sql);
            $kwrdson=($parsedBody["kwrdson"])?1:0;
            $kwrds=implode(",", $parsedBody["kwrds"]);
            $user_fields_on=$parsedBody["user_fields_on"]?1:0;
            $stmt->bindParam(':id', $parsedBody["id"]);
            $kwrds=str_replace(";", ",", $kwrds);
            $stmt->bindParam(':kwrds', $kwrds);
            $stmt->bindParam(':kwrdson', $kwrdson);
            $auto_numerate=$parsedBody["auto_numerate"]?1:0;
            $stmt->bindParam(':auto_numerate', $auto_numerate);
            $stmt->bindParam(':orderby', $parsedBody["orderby"]);
            $stmt->bindParam(':user_fields_on', $user_fields_on);
            for ($i=0;$i<count($names);$i++) {
                $stmt->bindParam(':'.$names[$i], $parsedBody[$names[$i]]);
            }
            $stmt->execute();

            //User fields was off - now on
            if ($user_fields_on==1 && $user_fields_on_old==0) {
                
                //Add all incoming user fields
                $uflds=explode(",", $parsedBody["uflds"]);
                $sqlAr = array();
                for ($i=0; $i<count($uflds); $i++) {
                    $sqlAr[] = '('.intval($parsedBody["id"]).', '.$db->quote($uflds[$i]).')';
                }
                $sql="INSERT INTO ".$tableNames['cat_usrflds'];
                $sql.=" (catid,namef) VALUES ".implode(',', $sqlAr);
                $stmt=$db->prepare($sql);
                $stmt->execute();
            }

            //User fields was on - now off
            elseif ($user_fields_on==0 && $user_fields_on_old==1) {
                
                //Remove user fields of the current category
                $sql="DELETE FROM ".$tableNames['cat_usrflds'];
                $sql.=" WHERE catid=:catid";
                $stmt=$db->prepare($sql);
                $stmt->bindParam(':catid', $parsedBody["id"]);
                $stmt->execute();
            }

            //User fields on not changed - update user fields
            if ($user_fields_on==1 && $user_fields_on_old==1) {

                //extract incoming user fields
                $uflds=explode(",", $parsedBody["uflds"]);

                //Compare incoming user fields and old user fields from DB
                $addFldNames=array_diff($uflds, $cat_usrflds_namefs);

                //Detect removed user fields names
                $removeFldNames=array_diff($cat_usrflds_namefs, $uflds);
                if (count($removeFldNames)>0) {

                    //Remove detected user fields
                    $removeFldNames_str="";
                    foreach ($removeFldNames as $nam) {
                        $removeFldNames_str.=
                            "cat_usrflds.namef=".$db->quote($nam)." OR ";
                    }
                    $removeFldNames_str=substr($removeFldNames_str, 0, -4);
                    $sql="DELETE FROM ".$tableNames['cat_usrflds'];
                    $sql.=" WHERE (".$removeFldNames_str.") AND ";
                    $sql.=" cat_usrflds.catid=:catid";
                    $stmt=$db->prepare($sql);
                    $stmt->bindParam(':catid', $parsedBody["id"]);
                    $stmt->execute();
                }

                //Add new user fields
                if (count($addFldNames)>0) {
                    $sqlAr = array();
                    foreach ($addFldNames as $nam) {
                        $sqlAr[] = '('.intval($parsedBody["id"]).', '.$db->quote($nam).')';
                    }
                    $sql="INSERT INTO ".$tableNames['cat_usrflds'];
                    $sql.=" (catid,namef) VALUES ".implode(',', $sqlAr);
                    $stmt=$db->prepare($sql);
                    $stmt->execute();
                }
            }

            //Get user fields of the current category
            $ufldsArr=array();
            $sql = "SELECT id,namef FROM ".$tableNames['cat_usrflds'];
            $sql .= " WHERE catid=:catid";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':catid', $parsedBody["id"]);
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($ufldsArr, [
                    "fldid" => $row["id"],
                    "namef" => $row["namef"]
                ]);
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status' => $status,
            'err' => $err,
            'ufldsArr' => $ufldsArr
        ]);
    }



    //Получение списка категорий
    public function cClientGet($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $arr=array();
        $uflds=array();
        $db=$this->container['db'];

        try {

            //Check access for NOT registered users by url
            if (strpos($request->getUri()->getPath(), "-noauth")>0) {
                if (!getSettings(['ANONYMOUS_ACCESS'],$db)['ANONYMOUS_ACCESS']) {
                    return $response->withJson([
                        'status'        => 0,
                        'err'           => 'Access denied',
                    ]);
                }
            }
            
            //Get all categories
            $tableNames=$this->container['tableNames'];
            $sql="SELECT * FROM ".$tableNames['category'];
            $stmt=$db->prepare($sql);
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $row["is_rss"]=-1;
                array_push($arr, $row);
            }

            //Get all rss links
            $rssarr=[];
            $sql=" SELECT id,title,link,category FROM ".$tableNames["rss"];
            $stmt=$db->prepare($sql);
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $row["category"]=explode(";", $row["category"]);
                array_push($rssarr, $row);
            }
            
            //Get all user fields
            $sql="SELECT * FROM ".$tableNames['cat_usrflds'];
            $stmt=$db->prepare($sql);
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($uflds, $row);
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'        => $status,
            'err'           => $err,
            'categories'    => $arr,
            'uflds'         => $uflds,
            'rss'           => $rssarr
        ]);
    }
}
