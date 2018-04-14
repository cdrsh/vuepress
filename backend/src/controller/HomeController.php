<?php
namespace App\Controller;

use Valitron\Validator;
use Psr\HttpMessage\ServerRequestInterface as Request;
use Psr\HttpMessage\ResponseInterface as Response;
use \Firebase\JWT\JWT;

//Home page
class HomeController
{
    protected $container;

    public function __construct($c)
    {
        $this->container = $c;
    }


    
    //Home page
    public function homeClient($request, $response, $args)
    {
        $catid=$request->getQueryParam("c", "");
        $db=$this->container['db'];

        if($db==NULL)
            return $response->withRedirect("/install");
        
        if(gettype($db)=="integer" && $db==-1) {
            return $this->container["renderer"]->render(
                $response,'mysqlerr.phtml',[]
            );
        }

        //Get Keywords and Description
        $arr=getSettings(['KEYWORDS','DESCRIPTION'], $db);
        $keywords=$arr['KEYWORDS'];
        $description=$arr['DESCRIPTION'];

        try {
            if ($catid!="") {
                //Get keywords from DB
                $sql="SELECT kwrds,kwrdson FROM ";
                $sql.=$tableNames['category']." WHERE id=:catid";
                $stmt=$db->prepare($sql);
                $stmt->bindParam(':catid', $catid);
                $stmt->execute();
                if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                    if ($row["kwrdson"]==1) {
                        $keywords=($keywords!=="")
                        ?$keywords.",".$row["kwrds"]
                        :$row["kwrds"];
                    }
                }
            }
        }
        catch(Exception $err) {

        }

        $this->container["renderer"]->render(
            $response,
            'index.phtml',
            [
                "keywords"=>$keywords,
                "description"=>$description,
            ]
        );
    }


    
    //Admin main page
    public function adminMainPage($request, $response, $args)
    {
        $this->container["renderer"]->render(
            $response,'admin.phtml',[]
        );
    }



    //Redirect to home page
    public function homeClientRediret($request, $response, $args)
    {
        $catid = $request->getAttribute('catid');
        $pars="";
        /*
        if ($catid!="") {
            $pars="?c=".$catid;
        }
        */
        return $response->withRedirect("/".$pars);
    }
}
