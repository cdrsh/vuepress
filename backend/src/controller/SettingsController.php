<?php

namespace App\Controller;

use Valitron\Validator;
use Psr\HttpMessage\ServerRequestInterface as Request;
use Psr\HttpMessage\ResponseInterface as Response;

require_once(realpath(dirname(__FILE__)."/../general/myfuncs.php"));

//Settings
class SettingsController
{
    protected $container;

    public function __construct($c)
    {
        $this->container = $c;
    }



    //Validate settings set
    public function validateSettingsSet($dataIN)
    {
        $v = new \Valitron\Validator($dataIN);

        $v->rule('required', "kee")->message('{field} must be set');
        $v->rule('required', "vaa")->message('{field} must be set');

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



    //Settings params set
    public function sSettingsSet($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        try {
            $db=$this->container['db'];

            //Check user access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS'
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }

            $parsedBody = $request->getParsedBody();

            //Validate input data
            $res=$this->validateSettingsSet($parsedBody);
            if ($res['status']==0) {
                return $response->withJson($res);
            }

            //Update settings
            $tableNames=$this->container['tableNames'];
            $sql="UPDATE ".$tableNames['settings']." SET vaa=:vaa WHERE kee=:kee";
            $stmt=$db->prepare($sql);
            $stmt->bindParam(':kee', $parsedBody["kee"]);
            $stmt->bindParam(':vaa', $parsedBody["vaa"]);
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



    //Get settings
    public function sSettingsGet($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $vaa="";
        try {

            //Validate input data
            $kee=$request->getQueryParam("kee", "empty");
            if ($kee=="empty") {
                return $response->withJson([
                    'status'    => 0,
                    'err'       => "Kee is not set"
                ]);
            }

            $db=$this->container['db'];
            $tableNames=$this->container['tableNames'];
            $sql="SELECT vaa FROM ".$tableNames['settings'];
            $sql.=" WHERE kee=:kee LIMIT 1";
            $stmt=$db->prepare($sql);
            $stmt->bindParam(':kee', $kee);
            $stmt->execute();
            if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $vaa=$row['vaa'];
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'    => $status,
            'err'       => $err,
            'vaa'       => $vaa
        ]);
    }



    //Get all settings
    public function sSettingsGetAll($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $arr=array();
        try {
            $parsedBody = $request->getParsedBody();

            $db=$this->container['db'];
            $tableNames=$this->container['tableNames'];
            $sql="SELECT * FROM ".$tableNames['settings'];
            $stmt=$db->prepare($sql);
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $arr[$row["kee"]]=$row["vaa"];
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'   => $status,
            'err'      => $err,
            'settings' => (object)$arr
        ]);
    }



    //Validate settings set all
    public function validateSettingsSetAll($dataIN)
    {
        $v = new \Valitron\Validator($dataIN);

        $v->rule('required', "settings")->message('{field} must be set');
        $v->rule('required', "reset")->message('{field} must be set');

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



    //Set settings all
    public function sSettingsSetAll($request, $response, $args)
    {
        $err="No settings found";
        $status=0;//1-ok 0-error
        $sql="";
        try {
            $db=$this->container['db'];

            //Check user access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS'
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }

            $parsedBody = $request->getParsedBody();

            //Validate input data
            $res=$this->validateSettingsSetAll($parsedBody);
            if ($res['status']==0) {
                return $response->withJson($res);
            }

            $tableNames=$this->container['tableNames'];
            $settings=$parsedBody["settings"];
            if (count($settings)>0) {
                $sql="UPDATE ".$tableNames['settings'];
                $sql.=" SET vaa = (CASE kee ";
                foreach ($settings as $key => $value) {
                    $sql.="WHEN ".$db->quote($key)." THEN ".$db->quote(
                        (is_bool($value))?($value?'true':'false'):$value
                    )." ";
                }
                $sql.="END)";
                $stmt=$db->prepare($sql);
                $stmt->execute();
                $status=1;
                $err="";
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'    => $status,
            'err'       => $err,
            'settings'  => $settings,
        ]);
    }


   
    //Get all settings client
    public function sSettingsClientGetAll($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $arr=array();
        try {
            $db=$this->container['db'];
            $tableNames=$this->container['tableNames'];
            $sql="SELECT * FROM ".$tableNames['settings'];
            $stmt=$db->prepare($sql);
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                if($row["kee"]!="RECAPCHA_PRIVATE_KEY")
                    $arr[$row["kee"]]=$row["vaa"];
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'   => $status,
            'err'      => $err,
            'settings' => (object)$arr
        ]);
    }
}
