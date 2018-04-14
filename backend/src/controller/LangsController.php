<?php
namespace App\Controller;

use Valitron\Validator;
use Psr\HttpMessage\ServerRequestInterface as Request;
use Psr\HttpMessage\ResponseInterface as Response;

//Content Languages
class LangsController
{
    protected $container;

    public function __construct($c)
    {
        $this->container = $c;
    }


    
    //Get languages list
    public function lGet($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $arr=array();

        try {
            $db=$this->container['db'];
            $tableNames=$this->container['tableNames'];

            //Get languages
            $sql="SELECT * FROM ".$tableNames['lang'];
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
            'status'   => $status,
            'err'      => $err,
            'langs'    => $arr
        ]);
    }



    //Add language
    public function lAdd($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error

        try {
            $db=$this->container['db'];
            $parsedBody = $request->getParsedBody();

            //Check user access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS'
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }

            //Language codes is not set
            if (count($parsedBody)==0) {
                $status=0;
                $err="Languages is not selected";
            } else {

                //Mark codes as active languages
                $codes="";
                for ($i=0;$i<count($parsedBody);$i++) {
                    $codes.=" code=:code".$i." OR ";
                }
                if (strlen($codes)>4) {
                    $codes=substr($codes, 0, -4);
                }
                $tableNames=$this->container['tableNames'];
                $sql="UPDATE ".$tableNames['lang']." SET used=1 WHERE ".$codes;
                $stmt=$db->prepare($sql);
                for ($i=0;$i<count($parsedBody);$i++) {
                    $stmt->bindParam(':code'.$i, $parsedBody[$i]);
                }
                $stmt->execute();

                //Add lang code prefix to categories
                $filds="";
                for ($i=0;$i<count($parsedBody);$i++) {
                    $filds.=" name_".$parsedBody[$i]." CHAR(255) DEFAULT ' ',";
                }
                if (strlen($filds)>1) {
                    $filds=substr($filds, 0, -1);
                }
                $sql="ALTER TABLE ".$tableNames['category']." ADD (".$filds.")";
                $db->prepare($sql)->execute();

                //Add lang code prefix to posts
                $filds="";
                for ($i=0;$i<count($parsedBody);$i++) {
                    $filds.=" title_".$parsedBody[$i].
                        " TEXT NULL DEFAULT '', txt_".
                        $parsedBody[$i]." MEDIUMTEXT NULL DEFAULT '',";
                }
                if (strlen($filds)>1) {
                    $filds=substr($filds, 0, -1);
                }
                $sql="ALTER TABLE ".$tableNames['posts']." ADD (".$filds.")";
                $db->prepare($sql)->execute();

                //Add lang code prefix to files
                $filds="";
                for ($i=0;$i<count($parsedBody);$i++) {
                    $filds.=" title_".$parsedBody[$i]." TEXT NULL DEFAULT '',";
                }
                if (strlen($filds)>1) {
                    $filds=substr($filds, 0, -1);
                }
                $sql="ALTER TABLE ".$tableNames['files']." ADD (".$filds.")";
                $db->prepare($sql)->execute();
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'    => $status,
            'err'       => $err,
        ]);
    }



    //Delete language
    public function lDelete($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error

        try {
            $db=$this->container['db'];
            $tableNames=$this->container['tableNames'];
            $parsedBody = $request->getParsedBody();

            //Check user access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS'
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }

            //Check language as last
            $sql="SELECT COUNT(code) AS cnt FROM ";
            $sql.=$tableNames['lang']." WHERE used=1";
            $stmt = $db->prepare($sql);
            $stmt->execute();
            $cnt=0;
            if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $cnt=$row['cnt'];
            }

            //Language codes is not set
            if (count($parsedBody)==0) {
                $status=0;
                $err="Languages is not selected";
            }
            //Deleted language last one
            if ($cnt<2 || ($cnt-count($parsedBody))<1) {
                $status=0;
                $err="At least one language must stay";
            } else {

                //Mark delete languages as inactive
                $codes="";
                for ($i=0;$i<count($parsedBody);$i++) {
                    $codes.=" code=:code".$i." OR ";
                }
                if (strlen($codes)>4) {
                    $codes=substr($codes, 0, -4);
                }
                $sql="UPDATE ".$tableNames['lang']." SET used=0 WHERE ".$codes;
                $stmt=$db->prepare($sql);
                for ($i=0;$i<count($parsedBody);$i++) {
                    $stmt->bindParam(':code'.$i, $parsedBody[$i]);
                }
                $stmt->execute();

                //Delete fields with deleted language codes from tables
                for ($i=0;$i<count($parsedBody);$i++) {
                    //Categories
                    $sql="ALTER TABLE ".$tableNames['category'];
                    $sql.=" DROP name_".$parsedBody[$i];
                    $db->prepare($sql)->execute();
                    //Posts
                    $sql="ALTER TABLE ".$tableNames['posts'];
                    $sql.=" DROP title_".$parsedBody[$i];
                    $db->prepare($sql)->execute();
                    $sql="ALTER TABLE ".$tableNames['posts'];
                    $sql.=" DROP txt_".$parsedBody[$i];
                    $db->prepare($sql)->execute();
                    //Files
                    $sql="ALTER TABLE ".$tableNames['files'];
                    $sql.=" DROP title_".$parsedBody[$i];
                    $db->prepare($sql)->execute();
                }
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'    => $status,
            'err'       => $err,
        ]);
    }
}
