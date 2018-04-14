<?php
namespace App\Controller;

use Valitron\Validator;
use Psr\HttpMessage\ServerRequestInterface as Request;
use Psr\HttpMessage\ResponseInterface as Response;

require_once(realpath(dirname(__FILE__)."/../general/myfuncs.php"));

//Files
class FileController
{
    protected $container;

    public function __construct($c)
    {
        $this->container = $c;
    }



    //Get titles of file by lang prefix
    public function getTitleLngFields($dataIN)
    {
        $keys=array_keys($dataIN);
        $arrOut=['titles'=>array()];
        for ($i=0; $i<count($keys); $i++) {
            $cnt=preg_match_all(
                '/(title_[a-z]{2})/',
                $keys[$i],
                $matches
            );
            if ($cnt>0) {
                array_push($arrOut['titles'], $keys[$i]);
            }
        }
        return $arrOut;
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
        $sql="SELECT ".$tableNames["users"].".* from ".$tableNames["users"];
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



    //Add file
    public function fAdd($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $file_id="";
        $fnam="";
        $dt="";
        $pth="";
        $db=$this->container['db'];

        //Check user access rights
        if (!chkUserPrivileges($request, $db, [
            'ADMIN_PAGE_ACCESS',
            'MANAGE_FILES'
        ])) {
            return $response->withJson([
                'status'        => 0,
                'err'           => 'Access denied',
            ]);
        }

        try {
            $parsedBody = $request->getParsedBody();
            //Get titles of file
            $arr=$this->getTitleLngFields($parsedBody);

            //Titles is not set
            if (count($arr['titles'])==0) {
                return $response->withJson([
                    'status' => 0,
                    'err' => "Titles is not set",
                ]);
            }

            $tableNames=$this->container['tableNames'];
            $file_id="";

            //Add file into DB
            $sql="INSERT INTO ".$tableNames['files'];
            $sql.=" (usrid, pth, fnam, dt, szw, szh ";
            $sql.=", ".implode(", ", $arr['titles']);
            $sql.=") VALUES (:usrid, :pth, :fnam, :dt, :szw, :szh  ";
            if (count($arr['titles'])>0) {
                $sql.=", :".implode(" ,:", $arr['titles']);
            }
            $sql.=")";
            $stmt=$db->prepare($sql);
            ini_set("date.timezone", "Europe/Moscow");
            $pth=date('d.m.Y');

            //Upload file
            $directory = __DIR__.'/../../public/uploads/'.$pth;
            if (!is_dir($directory)) {
                mkdir($directory);
                chmod($directory, 0777);
            }
            $uploadedFiles = $request->getUploadedFiles();
            $fil=$uploadedFiles['fil'];

            //File uploaded
            if ($fil->getError() === UPLOAD_ERR_OK) {
                $fnam = moveUploadedFile($directory, $fil);
                chmod($directory."/".$fnam, 0777);

                //Get user by token
                $usrid=1;
                $res=$request->getHeader('Authorization');
                if (isset($res) && count($res)>0) {
                    $user=$this->getUserByToken(substr($res[0], 7));
                    $usrid=$user["id"];
                }

                $dt=date('Y-m-d H:i:s');
                $stmt->bindParam(':usrid', $usrid);
                $stmt->bindParam(':pth', $pth);
                $stmt->bindParam(':fnam', $fnam);
                $stmt->bindParam(':dt', $dt);
                $stmt->bindParam(':szw', $parsedBody["szw"]);
                $stmt->bindParam(':szh', $parsedBody["szh"]);
                $arrTitles=$arr['titles'];
                for ($i=0; $i<count($arrTitles); $i++) {
                    $stmt->bindParam(
                        ':'.$arrTitles[$i],
                        $parsedBody[$arrTitles[$i]]
                    );
                }
                $stmt->execute();
                $file_id=$db->lastInsertId();
            } else {
                $status=0;
                $err="File upload error";
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'    => $status,
            'err'       => $err,
            'file'      => [
                'id'        => $file_id,
                'fnam'      => $fnam,
                'dt'        => $dt,
                'pth'       => $pth
            ],
        ]);
    }



    //Delete old files
    public function deleteOldFiles($ids)
    {
        $db=$this->container['db'];
        $tableNames=$this->container['tableNames'];
        
        //Get files by ids
        $sql="SELECT fnam, pth FROM ".$tableNames['files']." WHERE ";
        for ($i=0; $i<count($ids); $i++) {
            $sql.=" id=:id".$i." OR ";
        }
        if (count($ids)>0) {
            $sql=substr($sql, 0, -4);
        }
        $stmt=$db->prepare($sql);
        for ($i=0; $i<count($ids); $i++) {
            $stmt->bindParam(':id'.$i, $ids[$i]);
        }
        $stmt->execute();

        //Remove files
        $basepath=__DIR__.'/../../public/uploads/';
        while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
            $fil = $basepath.$row['pth']."/".$row['fnam'];
            if (file_exists($fil)) {
                unlink($fil);
            }
        }
    }



    //Update files
    public function fUpdate($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        try {
            $db=$this->container['db'];
            //Check user access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS',
                'MANAGE_FILES'
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }

            $parsedBody = $request->getParsedBody();
            //Get file titles
            $arr=$this->getTitleLngFields($parsedBody);

            //Titles is not set
            if (count($arr['titles'])==0) {
                return $response->withJson([
                    'status' => 0,
                    'err' => "Titles is not set",
                ]);
            }

            //Update files titles
            $file_id="";
            $tableNames=$this->container['tableNames'];
            $sql="UPDATE ".$tableNames['files']." SET ";
            $arrTitles=$arr['titles'];
            for ($i=0; $i<count($arrTitles); $i++) {
                $sql.=$arrTitles[$i]."=:title".$i.",";
            }
            if (count($arrTitles)>0) {
                $sql=substr($sql, 0, -1);
            }
            $sql.=" WHERE id=:id";
            $stmt=$db->prepare($sql);
            $id=$parsedBody['id'];
            $stmt->bindParam(':id', $id);
            for ($i=0; $i<count($arrTitles); $i++) {
                $stmt->bindParam(':title'.$i, $parsedBody[$arrTitles[$i]]);
            }
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



    //Validate file Delete
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



    //Delete selected files
    public function fDeleteSelected($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $parsedBody = $request->getParsedBody();
        $db=$this->container['db'];

        try {
            
            //Check user access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS',
                'MANAGE_FILES'
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
            //Delete old files
            $this->deleteOldFiles($ids);
            $tableNames=$this->container['tableNames'];

            //Delete files from DB
            $sql="DELETE FROM ".$tableNames['files']." WHERE ";
            for ($i=0; $i<count($ids); $i++) {
                $sql.="id=:id".$i." OR ";
            }
            if (count($ids)>0) {
                $sql=substr($sql, 0, -4);
            }
            $stmt=$db->prepare($sql);
            for ($i=0; $i<count($ids); $i++) {
                $stmt->bindParam(':id'.$i, $ids[$i]);
            }
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


    
    //Validate change num
    public function validateChangeNum($dataIN)
    {
        $v = new \Valitron\Validator($dataIN);

        $v->rule('required', 'id1')->message('{field} must be set');
        $v->rule('required', 'num1')->message('{field} must be set');
        $v->rule('required', 'id2')->message('{field} must be set');
        $v->rule('required', 'num2')->message('{field} must be set');

        $err="";
        $status=1;
        if (!$v->validate()) {
            $err=$v->errors();
            $status=0;
        }
        return [
            "err" => $err,
            "status" => $status
        ];
    }



    //Get All files
    public function fGetAll($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $arr=array();
        $db=$this->container['db'];

        try {

            //Check user access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS',
                'MANAGE_FILES'
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }

            //Get files from DB
            $tableNames=$this->container['tableNames'];
            $sql="SELECT * FROM ".$tableNames['files'];
            $stmt=$db->prepare($sql);
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
            'files'     => $arr
        ]);
    }
}
