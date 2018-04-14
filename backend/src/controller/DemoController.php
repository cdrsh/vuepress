<?php
namespace App\Controller;

use Psr\HttpMessage\ServerRequestInterface as Request;
use Psr\HttpMessage\ResponseInterface as Response;

require_once(realpath(dirname(__FILE__)."/../general/myfuncs.php"));
use \Firebase\JWT\JWT;
use \PDO;

class DemoController
{
    protected $container;
    public function __construct($c)
    {
        $this->container = $c;
    }


    //Create tables
    public function filldemobylink($request, $response, $args)
    {
        $this->filldemo();
    }

    public function filldemo($db=null)
    {
        $err="";
        $status=1;//1-ok 0-error
        if($db==null)
            $db=$this->container['db'];
    
        $tableNames=$this->container['tableNames'];

        //Fill demo
        try {
            //===tokens===
            $sql="DROP TABLE IF EXISTS ".$tableNames['tokens'];
            $db->prepare($sql)->execute();

            $sql="CREATE TABLE ".$tableNames['tokens'];
            $sql.=" (
                id INT NOT NULL AUTO_INCREMENT,
                usrid INT(11),
                at TEXT,
                rt TEXT,
                devid TEXT,
                at_dt INT(16),
                rt_dt INT(16),
                PRIMARY KEY (id)
            )";
            $db->prepare($sql)->execute();


            //===cat_post_sv===
            $sql="DROP TABLE IF EXISTS ".$tableNames['cat_post_sv'];
            $db->prepare($sql)->execute();

            $sql="CREATE TABLE ".$tableNames['cat_post_sv'];
            $sql.=" (
                id INT NOT NULL AUTO_INCREMENT,
                catid INT,
                postid INT,
                num INT,
                dt DATETIME,
                ufldids TEXT NULL DEFAULT '',
                ufldvls TEXT NULL DEFAULT '',
                vws INT,
                PRIMARY KEY (id)
            )";
            $db->prepare($sql)->execute();

            //===category====
            $sql="DROP TABLE IF EXISTS ".$tableNames['category'];
            $db->prepare($sql)->execute();

            $sql="CREATE TABLE ".$tableNames['category'];
            $sql.=" (
                id INT NOT NULL AUTO_INCREMENT,
                pid INT,
                idleaf INT,
                name_en CHAR(255) NOT NULL,
                kwrds TEXT,
                kwrdson INT(1),
                auto_numerate INT(1),
                orderby INT(1),
                num INT(1),
                user_fields_on INT(1),
                dt DATETIME,
                vws INT,
                PRIMARY KEY (id)
            )";
            $db->prepare($sql)->execute();

            //===cat_usrflds====
            $sql="DROP TABLE IF EXISTS ".$tableNames['cat_usrflds'];
            $db->prepare($sql)->execute();

            $sql="CREATE TABLE ".$tableNames['cat_usrflds'];
            $sql.=" (
                id INT NOT NULL AUTO_INCREMENT,
                catid INT,
                namef CHAR(255) NOT NULL,
                PRIMARY KEY (id)
            )";
            $db->prepare($sql)->execute();

            //===posts====
            $sql="DROP TABLE IF EXISTS ".$tableNames['posts'];
            $db->prepare($sql)->execute();

            $sql="CREATE TABLE ".$tableNames['posts'];
            $sql.=" (
                id INT NOT NULL AUTO_INCREMENT,
                dt DATETIME,
                ispub INT(2),
                usrid INT(11),
                title_en TEXT,
                txt_en MEDIUMTEXT,
                PRIMARY KEY (id)
            )";
            $db->prepare($sql)->execute();

            //===users===
            //privlgs
            //9-Admin page access
            //8-Manage files
            //7-Write categories
            //6-Read categories - 0-hide categories
            //5-Write users
            //4-Read users - 0-hide users
            //3-blocked user
            //2-Write post
            //1-Read post - 0-hide posts
            //Low part

            $sql="DROP TABLE IF EXISTS ".$tableNames['users'];
            $db->prepare($sql)->execute();

            $sql="CREATE TABLE ".$tableNames['users'];
            $sql.=" (
                id INT NOT NULL AUTO_INCREMENT,
                email CHAR(255),
                pass CHAR(255),
                fname CHAR(255),
                mname CHAR(255),
                lname CHAR(255),
                nick CHAR(25),
                phone CHAR(255),
                urlacpt CHAR(255),
                acptd INT(1),
                icon CHAR(20),
                site CHAR(255),
                dt DATETIME,
                privlgs INT(8),
                resetacpt CHAR(255),
                resetid CHAR(255),
                PRIMARY KEY (id)
            )";
            $db->prepare($sql)->execute();

            //===lang===
            $sql="DROP TABLE IF EXISTS ".$tableNames['lang'];
            $db->prepare($sql)->execute();

            $sql="CREATE TABLE ".$tableNames['lang'];
            $sql.=" (
                id INT NOT NULL AUTO_INCREMENT,
                code CHAR(2),
                used INT(1),
                name CHAR(255),
                PRIMARY KEY (id)
            )";
            $db->prepare($sql)->execute();

            $sql="INSERT INTO ".$tableNames['lang'];
            $sql.=" (
                code,
                used,
                name
            ) VALUES ";
            $sql.="(";
            $sql.="'zh',";
            $sql.="0,";
            $sql.="'Chinese'";
            $sql.="),";

            $sql.="(";
            $sql.="'ru',";
            $sql.="0,";
            $sql.="'Russian'";
            $sql.="),";

            $sql.="(";
            $sql.="'de',";
            $sql.="0,";
            $sql.="'German'";
            $sql.="),";

            $sql.="(";
            $sql.="'en',";
            $sql.="1,";
            $sql.="'English'";
            $sql.=")";
            $db->prepare($sql)->execute();

            //===files===
            $sql="DROP TABLE IF EXISTS ".$tableNames['files'];
            $db->prepare($sql)->execute();

            $sql="CREATE TABLE ".$tableNames['files'];
            $sql.=" (
                id INT NOT NULL AUTO_INCREMENT,
                usrid INT,
                pth TEXT NULL DEFAULT '',
                fnam TEXT NULL DEFAULT '',
                dt DATETIME,
                title_en TEXT NULL DEFAULT '',
                szw INT,
                szh INT,
                PRIMARY KEY (id)
            )";
            $db->prepare($sql)->execute();

            //===settings===
            $sql="DROP TABLE IF EXISTS ".$tableNames['settings'];
            $db->prepare($sql)->execute();

            $sql="CREATE TABLE ".$tableNames['settings'];
            $sql.=" (
                kee CHAR(50),
                vaa TEXT
            )";
            $db->prepare($sql)->execute();

            //Fill
            $sql="INSERT INTO ".$tableNames['settings'];
            $sql.=" (
                kee,
                vaa
            ) VALUES ";
            $sql.="('SITE_TITLE','Vuepress blog'),";
            $sql.="('KEYWORDS','vuepress learn vue.js cms blog'),";
            $sql.="('DESCRIPTION','Learn Vue.js'),";
            $sql.="('LANGS_SHOW_SWITCHER','true'),";
            $sql.="('LOGIN_SWITCHER','true'),";
            $sql.="('ANONYMOUS_ACCESS','true'),";
            $sql.="('SHOW_POST_DATE','false'),";
            $sql.="('REGISTRATION_SWITCHER','true'),";
            $sql.="('COMMENTS_ENABLE','true'),";
            $sql.="('ANONYMOUS_COMMENTS','true'),";
            $sql.="('RECAPCHA_COMMENTS','false'),";
            $sql.="('CATEGORIES_ENABLE','true'),";
            $sql.="('CATEGORIES_TREE_LPANEL','true'),";
            $sql.="('RSS_ENABLE','true'),";
            
            //Google recapcha keys
            $sql.="('RECAPCHA_PUBLIC_KEY','6LfEFEoUAAAAAEHGZgaM91GDzfci7eRwdjE4hbex'),";
            $sql.="('RECAPCHA_PRIVATE_KEY','6LfEFEoUAAAAACJeWjVJe2o5Qs9DutEjuMto3De4'),";

            //Admin users
            $sql.="('DEF_PRIVLGS','511')";
            //client users
            //$sql.="('DEF_PRIVLGS','297')";
            $db->prepare($sql)->execute();

            //===rss===
            $sql="DROP TABLE IF EXISTS ".$tableNames['rss'];
            $db->prepare($sql)->execute();

            $sql="CREATE TABLE ".$tableNames['rss'];
            $sql.=" (
                id INT NOT NULL AUTO_INCREMENT,
                title TEXT,
                description TEXT,
                link TEXT,
                language CHAR(10),
                copyright TEXT,
                mngeditor TEXT,
                pubdate DATETIME,
                lastbuilddt DATETIME,
                category TEXT,
                image TEXT,
                PRIMARY KEY (id)
            )";
            $db->prepare($sql)->execute();

            //===comments===
            $sql="DROP TABLE IF EXISTS ".$tableNames['comments'];
            $db->prepare($sql)->execute();

            $sql="CREATE TABLE ".$tableNames['comments'];
            $sql.=" (
                id INT NOT NULL AUTO_INCREMENT,
                pid INT,
                leafid INT,
                postid INT,
                usrid INT,
                num INT,
                txt TEXT,
                dt DATETIME,
                PRIMARY KEY (id)
            )";
            $db->prepare($sql)->execute();

        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        /*
        return $response->withJson([
            'status' => $status,
            'err' => $err,
        ]);
        */
    }



    //Install - fill .env file
    public function Install($request, $response, $args)
    {
        $db=$this->container['db'];
        if(file_exists(dirname(__FILE__)."/../../.env")) {
            $body = $response->getBody();
            $body->write("Vuepress is already installed.");
            return $response;
        }
        else {
           
            $errors="";

            $http_backend=$request->getQueryParam("http_backend", "");
            $host_backend=$request->getQueryParam("host_backend", "");
            $port_backend=$request->getQueryParam("port_backend", "");

            $db_host=$request->getQueryParam("db_host", "");
            $db_name=$request->getQueryParam("db_name", "");
            $db_user=$request->getQueryParam("db_user", "");
            $db_password=$request->getQueryParam("db_password", "");

            $mail_host=$request->getQueryParam("mail_host", "");
            $mail_port=$request->getQueryParam("mail_port", "");
            $mail_secure=$request->getQueryParam("mail_secure", "");
            $mail_auth=$request->getQueryParam("mail_auth", "");
            $mail_username=$request->getQueryParam("mail_username", "");
            $mail_password=$request->getQueryParam("mail_password", "");
            $mail_charset=$request->getQueryParam("mail_charset", "");
            $mail_ishtml=$request->getQueryParam("mail_ishtml", "");

            $http_client=$request->getQueryParam("http_client", "");
            $host_client=$request->getQueryParam("host_client", "");
            $port_client=$request->getQueryParam("port_client", "");
            $http_admin_client=$request->getQueryParam("http_admin_client", "");
            $host_admin_client=$request->getQueryParam("host_admin_client", "");
            $port_admin_client=$request->getQueryParam("port_admin_client", "");

            $jwt_server_key=$request->getQueryParam("jwt_server_key", "");
            
            $isShowErrors=
                $http_backend=="" ||
                $host_backend=="" ||
                $port_backend=="" ||
                $db_host=="" ||
                $db_name=="" ||
                $db_user=="" ||
                $db_password=="" ||
                $mail_host=="" ||
                $mail_port=="" ||
                $mail_secure=="" ||
                $mail_auth=="" ||
                $mail_username=="" ||
                $mail_password=="" ||
                $mail_charset=="" ||
                $mail_ishtml=="" ||
                $http_client=="" ||
                $host_client=="" ||
                $port_client=="" ||
                $http_admin_client=="" ||
                $host_admin_client=="" ||
                $port_admin_client=="" ||
                $jwt_server_key=="";

            //first load
            $firstLoad=false;
            if(
                $http_backend=="" &&
                $host_backend=="" &&
                $port_backend=="" &&
                $db_host=="" &&
                $db_name=="" &&
                $db_user=="" &&
                $db_password=="" &&
                $mail_host=="" &&
                $mail_port=="" &&
                $mail_secure=="" &&
                $mail_auth=="" &&
                $mail_username=="" &&
                $mail_password=="" &&
                $mail_charset=="" &&
                $mail_ishtml=="" &&
                $http_client=="" &&
                $host_client=="" &&
                $port_client=="" &&
                $http_admin_client=="" &&
                $host_admin_client=="" &&
                $port_admin_client=="" && 
                $jwt_server_key==""
            )
            {
                $firstLoad=true;
                $isShowErrors=false;
            }

            if($firstLoad) {
                $http_backend="http";
                $port_backend="80";
                $db_host="localhost";
                $mail_port="465";
                $mail_secure="ssl";
                $mail_charset="UTF-8";
    
                $http_client="http";
                $host_client="localhost";
                $port_client="8080";
                $http_admin_client="http";
                $host_admin_client="localhost";
                $port_admin_client="8081";
                $jwt_server_key="supersecretkeyyoushouldnotcommittogithub";
            }

            $trArr=tr($db,[
                "Install_Vuepress",

                "HOSTING_SETTINGS",
                "Http_Protocol",
                "Host",
                "Port",
                
                "Http_Protocol_is_not_set",
                "Host_is_not_set",
                "Port_is_not_set",
    
                "MYSQL_SETTINGS",
                "DB_Host",
                "DB_Name",
                "DB_User",
                "DB_Password",
    
                "DB_Host_is_not_set",
                "DB_Name_is_not_set",
                "DB_User_is_not_set",
                "DB_Pass_or_is_not_set",
    
                "MAIL_SETTINGS",
                "SMTP_Host",
                "SMTP_Port",
                "SMTP_Secure",
                "SMTP_Auth",
                "SMTP_Username",
                "SMTP_Password",
                "SMTP_Charset",
                "HTML_Format",
    
                "SMTP_Host_is_not_set",
                "SMTP_Port_is_not_set",
                "SMTP_Secure_is_not_set",
    
                "SMTP_Username_is_not_set",
                "SMTP_Password_is_not_set",
                "SMTP_Charset_is_not_set",
                "HTML_Format_is_not_set",
                
                "For_Developers_Nodejs_settings",
    
                "CLIENT_SETTINGS",
                "Host",
                "Port",
    
                "HTTP_Protocol_is_not_set",
                "Host_is_not_set",
                "Post_is_not_set",
                
                "ADMIN_PANEL_SETTINGS",
    
                "Install",

                "Jwt_server_key"
            ],true);

            if(!$firstLoad && !$isShowErrors) {
                $envContent="";
                $envContent.="ISPRESSLOADED=\"true\""."\n";
                
                $envContent.="HTTP_BACKEND=\"".$http_backend."\"\n";
                $envContent.="HOST_BACKEND=\"".$host_backend."\"\n";
                $envContent.="PORT_BACKEND=\"".$port_backend."\"\n";

                $envContent.="DB_DRIVER=\"mysql\"\n";
                $envContent.="DB_HOST=\"".$db_host."\"\n";
                $envContent.="DB_NAME=\"".$db_name."\"\n";
                $envContent.="DB_USER=\"".$db_user."\"\n";
                $envContent.="DB_PASSWORD=\"".$db_password."\"\n";
                
                $envContent.="MAIL_HOST=\"".$mail_host."\"\n";
                $envContent.="MAIL_SMTP_PORT=\"".$mail_port."\"\n";
                $envContent.="MAIL_SMTP_AUTH=\"".$mail_auth."\"\n";
                $envContent.="MAIL_SMTP_SECURE=\"".$mail_secure."\"\n";
                $envContent.="MAIL_SMTP_USERNAME=\"".$mail_username."\"\n";
                $envContent.="MAIL_SMTP_PASSWORD=\"".$mail_password."\"\n";
                $envContent.="MAIL_SMTP_PASSWORD=\"".$mail_password."\"\n";
                $envContent.="MAIL_CHARSET=\"".$mail_charset."\"\n";
                $envContent.="MAIL_IS_HTML=\"".$mail_ishtml."\"\n";

                $envContent.="HTTP_CLIENT=\"".$http_client."\"\n";
                $envContent.="HOST_CLIENT=\"".$host_client."\"\n";
                $envContent.="PORT_CLIENT=\"".$port_client."\"\n";

                $envContent.="HTTP_ADMIN_CLIENT=\"".$http_admin_client."\"\n";
                $envContent.="HOST_ADMIN_CLIENT=\"".$host_admin_client."\"\n";
                $envContent.="PORT_ADMIN_CLIENT=\"".$port_admin_client."\"\n";

                $envContent.="JWT_SERVER_KEY=\"".$jwt_server_key."\"\n";
                
                
                $fp=fopen(dirname(__FILE__)."/../../.env","w");
                fwrite($fp,$envContent);
                fclose($fp);
                getDotEnv();

                $pdo=null;
                try {
                    $pdo = new \PDO(
                        "mysql:host=".$db_host.";dbname=".$db_name,
                        $db_user,
                        $db_password
                    );
                    $pdo->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );  
                }
                catch (\Exception $er) {
                    if (file_exists(dirname(__FILE__)."/../../.env")) {
                        unlink(dirname(__FILE__)."/../../.env");
                    }
                    return $response->withRedirect("/mysqlerr");
                }

                $this->filldemo($pdo);

                return $this->container["renderer"]->render($response, 'installed.phtml', $args);
            }

            if ($isShowErrors) {
                $errors.=($http_backend=="")?$trArr["Http_Protocol_is_not_set"]."<br>":"";
                $errors.=($host_backend=="")?$trArr["Host_is_not_set"]."<br>":"";
                $errors.=($port_backend=="")?$trArr["Port_is_not_set"]."<br>":"";
                
                $errors.=($db_host=="")?$trArr["DB_Host_is_not_set"]."<br>":"";
                $errors.=($db_name=="")?$trArr["DB_Name_is_not_set"]."<br>":"";
                $errors.=($db_user=="")?$trArr["DB_User_is_not_set"]."<br>":"";
                $errors.=($db_password=="")?$trArr["DB_Pass_or_is_not_set"]."<br>":"";
                
                $errors.=($mail_host=="")?$trArr["SMTP_Host_is_not_set"]."<br>":"";
                $errors.=($mail_port=="")?$trArr["SMTP_Port_is_not_set"]."<br>":"";
                $errors.=($mail_secure=="")?$trArr["SMTP_Secure_is_not_set"]."<br>":"";
                $errors.=($mail_username=="")?$trArr["SMTP_Username_is_not_set"]."<br>":"";
                $errors.=($mail_password=="")?$trArr["SMTP_Password_is_not_set"]."<br>":"";
                $errors.=($mail_charset=="")?$trArr["SMTP_Charset_is_not_set"]."<br>":"";
                
                $errors.=($http_client=="")?$trArr["Http_Protocol_is_not_set"]."<br>":"";
                $errors.=($host_client=="")?$trArr["Host_is_not_set"]."<br>":"";
                $errors.=($port_client=="")?$trArr["Port_is_not_set"]."<br>":"";
                
                $errors.=($http_admin_client=="")?$trArr["Http_Protocol_is_not_set"]."<br>":"";
                $errors.=($host_admin_client=="")?$trArr["Host_is_not_set"]."<br>":"";
                $errors.=($port_admin_client=="")?$trArr["Port_is_not_set"]."<br>":"";

                $errors.=($jwt_server_key=="")?$trArr["Jwt_server_key_is_not_set"]."<br>":"";

                $errors="<div style='color:red;'>".$errors."</div>";
            }

            $args=[
                "errors"=>$errors,
                "isShowErrors"=>$isShowErrors,
                "http_backend"=>$http_backend,
                "host_backend"=>$host_backend,
                "port_backend"=>$port_backend,
                "db_host"=>$db_host,
                "db_name"=>$db_name,
                "db_user"=>$db_user,
                "db_password"=>$db_password,
                "mail_host"=>$mail_host,
                "mail_port"=>$mail_port,
                "mail_secure"=>$mail_secure,
                "mail_auth"=>($mail_auth=="on")?"true":"false",
                "mail_username"=>$mail_username,
                "mail_password"=>$mail_password,
                "mail_charset"=>$mail_charset,
                "mail_ishtml"=>($mail_ishtml=="on")?"true":"false",
                "http_client"=>$http_client,
                "host_client"=>$host_client,
                "port_client"=>$port_client,
                "http_admin_client"=>$http_admin_client,
                "host_admin_client"=>$host_admin_client,
                "port_admin_client"=>$port_admin_client,
                "jwt_server_key"=>$jwt_server_key
            ];

            $args=array_merge($args,$trArr);

            return $this->container["renderer"]->render($response, 'install.phtml', $args);
        }

    }    



    
    //Install save to .env
    public function InstallAgain($request, $response, $args)
    {
        if (file_exists(dirname(__FILE__)."/../../.env")) {
            unlink(dirname(__FILE__)."/../../.env");
        }
        return $response->withRedirect("/install");
    }



    
    //mysqlerr
    public function mysqlerr($request, $response, $args)
    {
        return $this->container["renderer"]->render($response, 'mysqlerr.phtml', []);
    }
}
