<?php
namespace App\Controller;

use Valitron\Validator;
use Psr\HttpMessage\ServerRequestInterface as Request;
use Psr\HttpMessage\ResponseInterface as Response;

require_once(realpath(dirname(__FILE__)."/../general/myfuncs.php"));

//Diagrams
class DiagramController
{
    protected $container;

    public function __construct($c)
    {
        $this->container = $c;
    }


    //Get Diagram data
    public function getDiagramData($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error
        $postsCnts=array();
        $posts=array();
        $categoriesCnts=array();
        $categories=array();
        $comments=array();
        $commentsCnts=array();
        $usersCnts=array();
        $users=array();

        try {
            $db=$this->container['db'];
            $tableNames=$this->container['tableNames'];

            //Check access rights
            if (!chkUserPrivileges($request, $db, [
                'ADMIN_PAGE_ACCESS',
            ])) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }

            //Get posts by months
            $sql="SELECT MONTH(dt) AS month1, COUNT(id) AS cnt ";
            $sql.=" FROM ".$tableNames["posts"]." WHERE YEAR(dt)=YEAR(NOW()) GROUP BY month1";
            $stmt=$db->prepare($sql);
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($postsCnts, $row);
            }

            //Get last 3 posts
            $sql="SELECT * FROM ".$tableNames["posts"]." WHERE ";
            $sql.=" YEAR(dt)=YEAR(NOW()) ORDER BY dt DESC LIMIT 3";
            $stmt=$db->prepare($sql);
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($posts, $row);
            }

            //Get categories by months
            $sql="SELECT MONTH(dt) AS month1, COUNT(id) AS cnt ";
            $sql.=" FROM ".$tableNames["category"];
            $sql.=" WHERE YEAR(dt)=YEAR(NOW()) GROUP BY month1";
            $stmt=$db->prepare($sql);
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($categoriesCnts, $row);
            }

            //Get last 3 added categories
            $sql="SELECT * FROM ".$tableNames["category"]." WHERE ";
            $sql.=" YEAR(dt)=YEAR(NOW()) ORDER BY dt DESC LIMIT 3";
            $stmt=$db->prepare($sql);
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($categories, $row);
            }
            
            //Get comments by months
            $sql="SELECT MONTH(dt) AS month1, COUNT(id) AS cnt ";
            $sql.=" FROM ".$tableNames["comments"];
            $sql.=" WHERE YEAR(dt)=YEAR(NOW()) GROUP BY month1";
            $stmt=$db->prepare($sql);
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($commentsCnts, $row);
            }

            //Get last 3 added comments
            $sql="SELECT * FROM ".$tableNames["comments"]." WHERE ";
            $sql.=" YEAR(dt)=YEAR(NOW()) ORDER BY dt DESC LIMIT 3";
            $stmt=$db->prepare($sql);
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($comments, $row);
            }
            
            //Get registered users by months
            $sql="SELECT MONTH(dt) AS month1, COUNT(id) AS cnt ";
            $sql.=" FROM ".$tableNames["users"];
            $sql.=" WHERE YEAR(dt)=YEAR(NOW()) GROUP BY month1";
            $stmt=$db->prepare($sql);
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($usersCnts, $row);
            }

            //Get last 3 users
            $sql="SELECT * FROM ".$tableNames["users"]." WHERE ";
            $sql.=" YEAR(dt)=YEAR(NOW()) ORDER BY dt DESC LIMIT 3";
            $stmt=$db->prepare($sql);
            $stmt->execute();
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                array_push($users, $row);
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status'        => $status,
            'err'           => $err,
            
            'postsCnts'     => $postsCnts,
            'posts'         => $posts,

            'categoriesCnts'=> $categoriesCnts,
            'categories'    => $categories,
            
            'commentsCnts'  => $commentsCnts,
            'comments'      => $comments,

            'usersCnts'     => $usersCnts,
            'users'         => $users
        ]);
    }
}
