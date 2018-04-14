<?php
namespace App\Controller;

use Valitron\Validator;
use Psr\HttpMessage\ServerRequestInterface as Request;
use Psr\HttpMessage\ResponseInterface as Response;

require_once(realpath(dirname(__FILE__)."/../general/myfuncs.php"));

//Rss
class RSSController
{
    protected $container;

    public function __construct($c)
    {
        $this->container = $c;
    }



    //Get RSS by page num
    public function rLoad($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $arr=array();
        $itemsCount=0;
        $db=$this->container['db'];

        try {
            
            //Check user access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS'
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }

            $tableNames=$this->container['tableNames'];
            $pgNum=intval($request->getQueryParam("pgNum", 1));
            $itemsPerPage=intval($request->getQueryParam("itemsPerPage", 10));
            $findTxt=$request->getQueryParam("findTxt", "");
            if ($itemsPerPage==0) {
                $itemsPerPage=1;
            }

            //Get all rss count
            $limit=" LIMIT ".$itemsPerPage;
            $offset=" OFFSET ".(($pgNum-1)*$itemsPerPage);
            if ($findTxt!="") {
                $findTxt=" WHERE ".$tableNames["rss"].".title LIKE ";
                $findTxt.=$db->quote("%".$findTxt."%")." ";
            }
            $sql="SELECT COUNT(id) AS cnt FROM ".$tableNames['rss'].$findTxt;
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

            //Get rss by page num
            $sql="SELECT * FROM ".$tableNames['rss'].$findTxt;
            $sql.=$limit.$offset;
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
            'rss'       => $arr,
            'pgNum'     => $pgNum,
            'itemsCount'=> $itemsCount
        ]);
    }



    //Validate RSS Delete
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



    //Delete RSS
    public function rDelete($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $where="";
        $db=$this->container['db'];
        $parsedBody = $request->getParsedBody();
        $tableNames=$this->container['tableNames'];

        try {
            
            //Check user access rights
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

            //Delete rss by ids
            for ($i=0;$i<count($ids);$i++) {
                $where.=" id=:id".$i." OR ";
            }
            if (count($ids)>0) {
                $where=" WHERE ".substr($where, 0, -4);
            }
            $sql="DELETE FROM ".$tableNames['rss'].$where;
            $sqlLast=$sql;
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
            'status'    => $status,
            'err'       => $err
        ]);
    }



    //Validate Rss ADD
    public function validateAdd($dataIN)
    {
        $v = new \Valitron\Validator($dataIN);

        $v->rule('required', "title")->message('{field} must be set');
        $v->rule('required', "category")->message('{field} must be set');

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



    //Add RSS
    public function rAdd($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $where="";
        $db=$this->container['db'];
        $parsedBody = $request->getParsedBody();
        $tableNames=$this->container['tableNames'];

        try {
            
            //Check user access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS'
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
            
            $title=$parsedBody['title'];
            $description=$parsedBody['description'];
            $link=$parsedBody['link'];
            $category=$parsedBody['category'];
            $language=$parsedBody['language'];

            //Add rss to DB
            $sql="INSERT INTO ".$tableNames['rss']." (
                title,
                description,
                link,
                language,
                copyright,
                mngeditor,
                pubdate,
                lastbuilddt,
                category,
                image
            ) VALUES (";
            $sql.=":title,";
            $sql.=":description,";
            $sql.=":link,";
            $sql.=":language,";
            $sql.=":copyright,";
            $sql.=":mngeditor,";
            $sql.="NOW(),";
            $sql.="NOW(),";
            $sql.=":category,";
            $sql.=":image";
            $sql.=")";
            $stmt=$db->prepare($sql);

            $copyright="";
            $mngeditor="";
            $image="";

            $stmt->bindParam(":title", $title);
            $stmt->bindParam(":description", $description);
            $stmt->bindParam(":link", $link);
            $stmt->bindParam(":category", $category);
            $stmt->bindParam(":language", $language);
            $stmt->bindParam(":copyright", $copyright);
            $stmt->bindParam(":mngeditor", $mngeditor);
            $stmt->bindParam(":image", $image);
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



    //Validate post update
    public function validateUpdate($dataIN)
    {
        $v = new \Valitron\Validator($dataIN);

        $v->rule('required', "id")->message('{field} must be set');
        $v->rule('required', "title")->message('{field} must be set');
        $v->rule('required', "category")->message('{field} must be set');

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


    
    //Update rss
    public function rUpdate($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $where="";
        $db=$this->container['db'];
        $parsedBody = $request->getParsedBody();
        $tableNames=$this->container['tableNames'];

        try {
            
            //Check user access rights
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

            $id=$parsedBody['id'];
            $title=$parsedBody['title'];
            $description=$parsedBody['description'];
            $link=$parsedBody['link'];
            $category=implode(";", $parsedBody['category']);
            $language=$parsedBody['language'];

            //Update rss
            $sql="UPDATE ".$tableNames['rss']." SET ";
            $sql.="title=:title,";
            $sql.="description=:description,";
            $sql.="link=:link,";
            $sql.="language=:language,";
            $sql.="category=:category";
            $sql.=" WHERE id=:id ";
            $stmt=$db->prepare($sql);
            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":title", $title);
            $stmt->bindParam(":description", $description);
            $stmt->bindParam(":link", $link);
            $stmt->bindParam(":category", $category);
            $stmt->bindParam(":language", $language);
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


    
    //Get rss by page num
    public function rGet($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $where="";
        $lang = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2);
        $params=[
            "title"=>"",
            "link"=>"",
            "description"=>"",
            "pubDate"=>"",
            'items' => []
        ];
        $items=[];
        $db=$this->container['db'];
        $tableNames=$this->container['tableNames'];

        try {
            $subpath = explode('/', $args['subpath']);
            if (count($subpath)>0) {
                $id=$subpath[0];
                $rss=0;

                //Get Rss by id
                $sql="SELECT * FROM ".$tableNames['rss']." WHERE id=:id";
                $stmt=$db->prepare($sql);
                $stmt->bindParam(":id", $id);
                $stmt->execute();
                if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    $rss=$row;
                }
                if ($rss!=0) {

                    //Get category
                    $category=$rss["category"];
                    $category=explode(";", $category);
                    if (count($category)>0) {
                        if ($lang!="") {
                            //Get lang codes
                            $lngsArr=array();
                            $sql="SELECT code FROM ".$tableNames['lang']." WHERE used=1";
                            $stmt=$db->prepare($sql);
                            $stmt->execute();
                            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                                array_push($lngsArr, $row['code']);
                            }
                            $bFound=false;
                            for ($i=0;$i<count($lngsArr);$i++) {
                                if ($lngsArr[$i]==$lang) {
                                    $bFound=true;
                                    break;
                                }
                            }
                            if (!$bFound && count($lngsArr)>0) {
                                $lang=$lngsArr[0];
                            }
                        } else {
                            $lang="en";
                        }

                        //Get posts
                        $where="";
                        for ($i=0;$i<count($category);$i++) {
                            $where.=" cat_post_sv.catid=:id".$i." OR ";
                        }
                        if (count($category)>0) {
                            $where=substr($where, 0, -4);
                        }
                        $sql="  SELECT * FROM ".$tableNames["posts"];
                        $sql.=" LEFT JOIN ".$tableNames["cat_post_sv"];
                        $sql.=" ON ".$tableNames["cat_post_sv"].".postid=";
                        $sql.=$tableNames["posts"].".id ";
                        $sql.=" WHERE ".$where." ORDER BY ";
                        $sql.=$tableNames["cat_post_sv"].".dt DESC LIMIT 30";
                        $stmt=$db->prepare($sql);
                        for ($i=0;$i<count($category);$i++) {
                            $stmt->bindParam(":id".$i, $category[$i]);
                        }
                        $stmt->execute();
                        while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                            array_push($items, [
                                "title" => $row["title_".$lang],
                                "description" => 
                                    str_replace(
                                        "&nbsp;"," ",
                                        strip_tags($row["txt_".$lang])
                                    ),
                                "pubDate" => date(DATE_RSS, strtotime($row["dt"])),
                            ]);
                        }

                        //Make params to template
                        $params=[
                            "title"=>$rss["title"],
                            "link"=>$rss["link"],
                            "description"=>$rss["description"],
                            "pubDate"=>date(DATE_RSS, strtotime($rss["pubdate"])),
                            'items' => $items
                        ];
                    }
                }
            }
            $response->withHeader("Content-Type", 'application/xml');
            return $this->container->renderer->render($response, 'index.xml', $params);
        } catch (Exception $e) {
            $err=$e->getMessage();
            $body = $response->getBody();
            $body->write('Error:'.$err);
        }
        return $response;
    }
}
