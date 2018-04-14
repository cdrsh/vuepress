<?php
namespace App\Controller;

use Valitron\Validator;
use Psr\HttpMessage\ServerRequestInterface as Request;
use Psr\HttpMessage\ResponseInterface as Response;
use \Firebase\JWT\JWT;

require_once(realpath(dirname(__FILE__)."/../general/myfuncs.php"));

//Users
class UserController
{
    protected $container;

    public function __construct($c)
    {
        $this->container = $c;
    }


 
    //Validate user Add
    public function validateAdd($dataIN)
    {
        $v = new \Valitron\Validator($dataIN);

        $v->rule('required', 'email')->message('{field} must be set');
        $v->rule('email', 'email')->message('{field} must be an e-mail format');
        $v->rule('lengthMin', 'email', 1)->message('{field} min length 1');
        $v->rule('lengthMax', 'email', 255)->message('{field} max length 255');

        $v->rule('required', 'fname')->message('{field} must be set');
        $v->rule('lengthMin', 'fname', 1)->message('{field} min length 1');
        $v->rule('lengthMax', 'fname', 255)->message('{field} max length 255');

        $v->rule('lengthMax', 'mname', 255)->message('{field} max length 255');

        $v->rule('lengthMax', 'lname', 255)->message('{field} max length 255');

        $v->rule('lengthMax', 'nick', 25)->message('{field} max length 25');

        $v->rule('lengthMin', 'phone', 4)->message('{field} min length 1');
        $v->rule('lengthMax', 'phone', 255)->message('{field} max length 255');
       
        $v->rule('required', 'pass')->message('{field} must be set');
        $v->rule('lengthMin', 'pass', 8)->message('{field} min length 8');
        $v->rule('lengthMax', 'pass', 30)->message('{field} max length 30');

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



    //User Add
    public function uAdd($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $usrid="-1";
        $token="";
        $db=$this->container['db'];
        $parsedBody = $request->getParsedBody();
        $tableNames=$this->container['tableNames'];

        //Check user access rights
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
            $res=$this->validateAdd($parsedBody);
            if ($res['status']==0) {
                return $response->withJson($res);
            }

            //Add user into DB
            $sql="INSERT INTO ".$tableNames['users'];
            $sql.=" (email,pass,fname,mname,lname,nick,phone,urlacpt,acptd,";
            $sql.="icon,site,dt,privlgs)";
            $sql.=" VALUES (:email,:pass,:fname,:mname,:lname,:nick,";
            $sql.=":phone,:urlacpt,:acptd,:icon,:site,:dt,:privlgs)";
            $stmt=$db->prepare($sql);
            $email      = $parsedBody["email"];
            $pass       = md5($parsedBody["pass"]);
            $privlgs    = $parsedBody["privs"];
            $fname      = $parsedBody["fname"];
            $mname      = $parsedBody["mname"];
            $lname      = $parsedBody["lname"];
            $nick       = ($parsedBody["nick"]=="")?"noname":$parsedBody["nick"];
            $phone      = $parsedBody["phone"];
            $urlacpt    = genID(16, 32);
            $acptd      = 0;
            $icon       = ($parsedBody["icon"]=="")?"fa-user":$parsedBody["icon"];
            $site       = $parsedBody["site"];
            ini_set("date.timezone", "Europe/Moscow");
            $dt         = date('Y-m-d H:i:s');
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':pass', $pass);
            $stmt->bindParam(':fname', $fname);
            $stmt->bindParam(':mname', $mname);
            $stmt->bindParam(':lname', $lname);
            $stmt->bindParam(':nick', $nick);
            $stmt->bindParam(':phone', $phone);
            $stmt->bindParam(':urlacpt', $urlacpt);
            $stmt->bindParam(':acptd', $acptd);
            $stmt->bindParam(':icon', $icon);
            $stmt->bindParam(':site', $site);
            $stmt->bindParam(':dt', $dt);
            $stmt->bindParam(':privlgs', $privlgs);
            $stmt->execute();
            $usrid=$db->lastInsertId();
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status' => $status,
            'err' => $err,
            'usrid' => $usrid,
            'token' => $token
        ]);
    }



    //Validate user update
    public function validateUpdate($dataIN)
    {
        $v = new \Valitron\Validator($dataIN);

        $v->rule('required', 'id')->message('{field} must be set');
        $v->rule('required', 'email')->message('{field} must be set');
        $v->rule('email', 'email')->message('{field} must be an e-mail format');
        $v->rule('lengthMin', 'email', 1)->message('{field} min length 1');
        $v->rule('lengthMax', 'email', 255)->message('{field} max length 255');

        $v->rule('required', 'fname')->message('{field} must be set');
        $v->rule('lengthMin', 'fname', 1)->message('{field} min length 1');
        $v->rule('lengthMax', 'fname', 255)->message('{field} max length 255');

        $v->rule('lengthMax', 'mname', 255)->message('{field} max length 255');

        $v->rule('lengthMax', 'lname', 255)->message('{field} max length 255');

        $v->rule('lengthMax', 'nick', 25)->message('{field} max length 25');

        $v->rule('lengthMin', 'phone', 4)->message('{field} min length 1');
        $v->rule('lengthMax', 'phone', 255)->message('{field} max length 255');

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


    
    //User update
    public function uUpdate($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $usrId="-1";
        $token="";
        $db=$this->container['db'];
        $parsedBody = $request->getParsedBody();
        $tableNames=$this->container['tableNames'];

        //Check user access rights
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
            $res=$this->validateUpdate($parsedBody);
            if ($res["status"]==0) {
                return $response->withJson($res);
            }
            
            //Update user in DB
            $pass=isset($parsedBody["pass"])?", pass=:pass ":"";
            $sql="UPDATE ".$tableNames['users']." SET ";
            $sql.="email=:email, fname=:fname, mname=:mname, lname=:lname, ";
            $sql.="nick=:nick, phone=:phone, icon=:icon, site=:site, ";
            $sql.="privlgs=:privlgs ".$pass." WHERE id=:id";
            $stmt=$db->prepare($sql);
            $id         = $parsedBody["id"];
            $email      = $parsedBody["email"];
            $fname      = $parsedBody["fname"];
            $mname      = $parsedBody["mname"];
            $lname      = $parsedBody["lname"];
            $nick       = ($parsedBody["nick"]=="")?"noname":$parsedBody["nick"];
            $phone      = $parsedBody["phone"];
            $icon       = ($parsedBody["icon"]=="")?"fa-user":$parsedBody["icon"];
            $site       = $parsedBody["site"];
            $privlgs    = $parsedBody["privs"];
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':fname', $fname);
            $stmt->bindParam(':mname', $mname);
            $stmt->bindParam(':lname', $lname);
            $stmt->bindParam(':nick', $nick);
            $stmt->bindParam(':phone', $phone);
            $stmt->bindParam(':icon', $icon);
            $stmt->bindParam(':site', $site);
            $stmt->bindParam(':privlgs', $privlgs);
            if ($pass!="") {
                $pass=md5($parsedBody["pass"]);
                $stmt->bindParam(':pass', $pass);
            }
            $stmt->execute();
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status' => $status,
            'err' => $err,
            'usrid' => $id,
            'token' => $token,
        ]);
    }
  


    //Validate priveleges Set
    public function validateSetPrivlgs($dataIN)
    {
        $v = new \Valitron\Validator($dataIN);

        $v->rule('required', 'priv')->message('{field} must be set');
        $v->rule('required', 'ids')->message('{field} must be set');
        $v->rule('min', 'priv', 0)->message('{field} min 0');
        //$v->rule('max', 'priv', 255)->message('{field} max 255');

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



    //Set user priveleges
    public function uPrivelege($request, $response, $args) {
        $err="";
        $status=1;//1-ok 0-error
        $post_id="-1";
        $token="";
        $db=$this->container['db'];
        $parsedBody = $request->getParsedBody();
        $tableNames=$this->container['tableNames'];

        //Check user access rights
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
            $res=$this->validateSetPrivlgs($parsedBody);
            if ($res["status"]==0) {
                return $response->withJson($res);
            }

            $ids = $parsedBody["ids"];
            $priv = $parsedBody["priv"];
            $where="";
            for($i=0;$i<count($ids);$i++) 
                $where.=" id=:id".$i." OR ";
            if(count($ids)>0)
                $where=" WHERE ".substr($where,0,-4);
            $sql="UPDATE ".$tableNames['users']." SET privlgs=:privlgs ".$where;
            $stmt=$db->prepare($sql);
            for($i=0;$i<count($ids);$i++) 
                $stmt->bindParam(':id'.$i, $ids[$i]);
            $stmt->bindParam(':privlgs', $priv);
            $stmt->execute();
        }
        catch(Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status' => $status,
            'err' => $err
        ]);
    }



    //Get users by page num
    public function uGet($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $arr=array();
        $itemsCount=0;
        $db=$this->container['db'];
        $tableNames=$this->container['tableNames'];

        //Check user access rights
        if (!chkUserPrivileges($request, $db, [
            'ADMIN_PAGE_ACCESS',
            'READ_USERS'
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
            $findNum=$request->getQueryParam("findNum", -1);
            if ($itemsPerPage==0) {
                $itemsPerPage=10;
            }
            $where="";
            $limit="";
            $offset="";
            $fldsFindNumAr=[
                0=>'email',
                1=>'fname',
                2=>'mname',
                3=>'lname',
                4=>'nick',
                5=>'phone',
                6=>'site',
                7=>'privlgs'
            ];

            if ($itemsPerPage>0 && $pgNum>0) {

                //Get all user count
                if ($findNum>=0 && $findTxt!="" && $findNum<7) {
                    $where=" WHERE ".$fldsFindNumAr[$findNum]." LIKE :fld ";
                    $findTxt="%".$findTxt."%";
                }
                if ($findNum>=0 && $findTxt!="" && $findNum==7) {
                    $where=" WHERE privlgs=privlgs & :privlgs ";
                }
                $sql="SELECT COUNT(".$tableNames["users"].".id) AS cnt FROM ";
                $sql.=$tableNames["users"]." ".$where;
                $stmt=$db->prepare($sql);
                if ($findNum>=0 && $findTxt!="") {
                    $stmt->bindParam(":fld", $findTxt);
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

                //Get users from DB
                $limit=" LIMIT ".$itemsPerPage;
                $offset=" OFFSET ".(($pgNum-1)*10);
                $sql="SELECT id,email,fname,mname,lname,nick,phone,site,";
                $sql.="icon,dt,privlgs FROM ".$tableNames["users"];
                $sql.=$where.$limit.$offset;
                $stmt=$db->prepare($sql);
                if ($findNum>=0 && $findTxt!="") {
                    $stmt->bindParam(":fld", $findTxt);
                }
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
            'status'   => $status,
            'err'      => $err,
            'users' => $arr,
            'pgNum' => $pgNum,
            'itemsCount' => $itemsCount,
        ]);
    }


    
    //Validate user Block
    public function validateBlock($dataIN)
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
    public function uBlock($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        try {
            $db=$this->container['db'];
            $parsedBody = $request->getParsedBody();

            //Check user access rights
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
            $res=$this->validateBlock($parsedBody);
            if ($res['status']==0) {
                return $response->withJson($res);
            }

            $tableNames=$this->container['tableNames'];
            $ids = $parsedBody["ids"];

            //Set priveleges in DB
            $where="";
            for ($i=0;$i<count($ids);$i++) {
                $where.=$ids[$i];
            }
            if (count($ids)>0) {
                $where=" WHERE ".$where;
            }
            $sql="UPDATE ".$tableNames['users']." SET privlgs=4^privlgs ".$where;
            $stmt=$db->prepare($sql);
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



    //Validate users Delete
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



    //Users Delete
    public function uDeleteSelected($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $parsedBody = $request->getParsedBody();
        $db=$this->container['db'];

        //Check user access rights
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
            $res=$this->validateDelete($parsedBody);
            if ($res['status']==0) {
                return $response->withJson($res);
            }

            $tableNames=$this->container['tableNames'];
            $ids=$parsedBody['ids'];

            //Delete users from DB
            $sql="DELETE FROM ".$tableNames['users']." WHERE ";
            for ($i=0; $i<count($ids); $i++) {
                $sql.="id=:id".$i." OR ";
            }
            if (count($ids)>0) {
                $sql=substr($sql, 0, -4);
            }
            $stmt=$db->prepare($sql);
            for ($i=0; $i<count($ids); $i++) {
                $stmt->bindParam(":id".$i, $ids[$i]);
            }
            $stmt->execute();
            
            //Update comments author as removed usrid=-1
            $sql="UPDATE ".$tableNames['comments']." SET usrid=-1 WHERE ";
            for ($i=0; $i<count($ids); $i++) {
                $sql.="id=:id".$i." OR ";
            }
            if (count($ids)>0) {
                $sql=substr($sql, 0, -4);
            }
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
            'status' => $status,
            'err' => $err,
        ]);
    }
}
