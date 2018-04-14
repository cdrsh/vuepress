<?php
namespace App\Controller;

use Valitron\Validator;
use Psr\HttpMessage\ServerRequestInterface as Request;
use Psr\HttpMessage\ResponseInterface as Response;
use \Firebase\JWT\JWT;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once(realpath(dirname(__FILE__)."/../general/myfuncs.php"));



//Authentication / Registration
class AuthController
{
    protected $container;
    public function __construct($c)
    {
        $this->container = $c;
    }



    //logout
    public function logout($request, $response, $args)
    {
        $db=$this->container['db'];
        $tableNames=$this->container['tableNames'];
        $parsedBody = $request->getParsedBody();
        
        $usrid=$parsedBody["usrid"];

        //Delete all tokens from DB
        $sql="DELETE FROM ".$tableNames['tokens'];
        $sql.=" WHERE usrid=:usrid";
        $stmt=$db->prepare($sql);
        $stmt->bindValue(':usrid', $usrid);
        $stmt->execute();
        $status=1;
        $err="";

        return $response->withJson([
            'status' => $status,
            'err' => $err,
        ]);
    }



    //validator login
    public function validateLogin($dataIN)
    {
        $v = new \Valitron\Validator($dataIN);

        $v->rule('required', 'email')->message('{field} must be set');
        $v->rule('email', 'email')->message('{field} must be in email format');
        $v->rule('required', 'password')->message('{field} must be set');

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



    //login for accepted users
    public function login($request, $response, $args)
    {
        $at="";
        $rt="";
        $user=0;

        $db=$this->container['db'];
        $tableNames=$this->container['tableNames'];
        $parsedBody = $request->getParsedBody();
        
        //Validate incoming data
        $res=$this->validateLogin($parsedBody);
        if ($res['status']==0) {
            return $response->withJson($res);
        }
       
        $email=$parsedBody["email"];
        $pass=$parsedBody["password"];

        //Check user in DB by email
        $sql="SELECT id,email,fname,mname,lname,nick,phone,site,icon,dt,acptd,";
        $sql.=" privlgs FROM ". $tableNames["users"];
        $sql.=" WHERE email=".$db->quote($email);
        $sql.=" AND pass=".$db->quote(md5($pass));
        $stmt = $db->prepare($sql);
        $stmt->execute();

        $trArr=tr($db,[
            "Login_or_password_is_not_accepted",
            "Account_is_not_accepted_by_email",
        ]);
        $status=0;
        $err=$trArr["Login_or_password_is_not_accepted"];

        //user found
        if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
            
            //user not accepted
            if ($row["acptd"]!=1) {
                return $response->withJson([
                    'status' => 0,
                    'err' => $trArr["Account_is_not_accepted_by_email"],
                ]);
            }

            //Check user for admin access rights
            $privlgs=intval($row["privlgs"]);
            if (isset($parsedBody['isadmin']) && (($privlgs&0x100)==0)) {
                return $response->withJson([
                    'status' => 0,
                    'err' => 'Authorization disabled',
                ]);
            }

            //Check client users blocked
            $isAnonymousAccess=getSettings(['ANONYMOUS_ACCESS'], $db)['ANONYMOUS_ACCESS'];
            if (
                !isset($parsedBody['isadmin']) &&
                !$isAnonymousAccess &&
                ($privlgs&0x4)
            ) {
                return $response->withJson([
                    'status'        => 0,
                    'err'           => 'Access denied',
                ]);
            }
            
            $status=1;
            unset($row["acptd"]);
            unset($row["privlgs"]);
            $user=$row;

            //Delete old tokens by email
            $rtOld=$rt;
            $sql="  DELETE FROM ".$tableNames['tokens'];
            $sql.=" WHERE usrid IN (SELECT ".$tableNames["users"].".id ";
            $sql.=" FROM ".$tableNames["users"]." WHERE email=:email)";
            $stmt=$db->prepare($sql);
            $stmt->bindValue(':email', $email);
            $stmt->execute();

            //Add new user into DB
            $sql="INSERT INTO ".$tableNames['tokens']." (";
            $sql.="usrid,at,rt,at_dt,rt_dt";
            $sql.=") VALUES(";
            $sql.=":usrid,:at,:rt,:at_dt,:rt_dt";
            $sql.=")";
            $stmt=$db->prepare($sql);
            $atObj = genAToken(genID(16, 32));
            $atDt= $atObj['exp'];
            $at= $atObj['token'];
            $usrid=$user["id"];
            $rtObj = genRToken($usrid, genID(16, 32));
            $rtDt= $rtObj['exp'];
            $rt= $rtObj['token'];
            $stmt->bindValue(':usrid', $user["id"]);
            $stmt->bindValue(':at', $at);
            $stmt->bindValue(':rt', $rt);
            $stmt->bindValue(':at_dt', $atDt);
            $stmt->bindValue(':rt_dt', $rtDt);
            $stmt->execute();

            $status=1;
            $err="";
        }
        return $response->withJson([
            'status' => $status,
            'err' => $err,
            'user' => $user,
            'at' => $at,
            'rt' => $rt
        ]);
    }



    //validator token
    public function validateToken($dataIN)
    {
        $v = new \Valitron\Validator($dataIN);
        $v->rule('required', 'rt')->message('{field} must be set');
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


    
    //Get access token by refresh token
    public function token($request, $response, $args)
    {
        $db=$this->container['db'];
        $tableNames=$this->container['tableNames'];
        $parsedBody = $request->getParsedBody();
     
        //Validate input data
        $res=$this->validateToken($parsedBody);
        if ($res['status']==0) {
            return $response->withJson($res);
        }

        $rt=$parsedBody["rt"];

        //Select user and expire date rt by refresh token
        $sql="SELECT usrid, rt_dt FROM ".$tableNames['tokens']." WHERE rt=:rt";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':rt', $rt);
        $stmt->execute();

        $status=0;
        $err="Token not found, login please";

        //User found
        if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {

            //Check expire date
            $rt_dt=intval($row["rt_dt"]);
            ini_set("date.timezone", "Europe/Moscow");
            if ($rt_dt<time()) {
                return $response->withJson([
                    'status' => 0,
                    'err' => 'Please Relogin',
                    'at' => ''
                ]);
            }

            //Update tokens in DB
            $sql="UPDATE ".$tableNames['tokens']." SET ";
            $sql.=" at=:at, at_dt=:at_dt ";
            $sql.=" WHERE rt=:rtold";
            $stmt=$db->prepare($sql);
            $rtOld=$rt;
            $atObj = genAToken(genID(16, 32));
            $atDt= $atObj['exp'];
            $at= $atObj['token'];
            $usrid=$row["usrid"];
            $stmt->bindValue(':at', $at);
            $stmt->bindValue(':at_dt', $atDt);
            $stmt->bindValue(':rtold', $rtOld);
            $stmt->execute();

            $status=1;
            $err="";

            return $response->withJson([
                'status' => $status,
                'err' => $err,
                'at' => $at,
            ]);
        }
        return $response->withJson([
            'status' => $status,
            'err' => $err,
            'at' => '',
        ]);
    }



    //validator registration
    public function validateRegistration($dataIN)
    {
        $v = new \Valitron\Validator($dataIN);

        $v->rule('required', 'email')->message('{field} must be set');
        $v->rule('email', 'email')->message('{field} must be in email format');
        $v->rule('required', 'pass')->message('{field} must be set');
        $v->rule('lengthMin', 'pass', 8)->message('{field} min length 8');
        $v->rule('lengthMax', 'pass', 50)->message('{field} max length 50');
        $v->rule('required', 'fname')->message('{field} must be set');
        $v->rule('lengthMin', 'fname', 1)->message('{field} min length 1');
        $v->rule('lengthMin', 'mname', 1)->message('{field} min length 1');
        $v->rule('lengthMin', 'lname', 1)->message('{field} min length 1');
        $v->rule('required', 'nick')->message('{field} must be set');
        $v->rule('lengthMin', 'nick', 1)->message('{field} min length 1');
        $v->rule('lengthMin', 'icon', 1)->message('{field} min length 1');
        $v->rule('lengthMin', 'site', 5)->message('{field} min length 5');

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



    //Registration
    public function register($request, $response, $args)
    {
        $err="";
        $status=1;//1-ok 0-error

        $usrid="-1";
        $token="";
        $at="";
        $rt="";
        $url="";

        try {
            $parsedBody = $request->getParsedBody();

            //validate input data
            $res=$this->validateRegistration($parsedBody);
            if ($res['status']==0) {
                return $response->withJson($res);
            }
            
            $db=$this->container['db'];
            $tableNames=$this->container['tableNames'];
            $email      = $parsedBody["email"];
            $pass       = md5($parsedBody["pass"]);

            $trArr=tr($db,[
                "Registration_disabled",
                "Current_email_is_already_used",
                "To_finish_registration_process_go_to_the_accept_link_please",
                "Accept_registration",
            ]);

            //Check registration on
            $isRegOn=getSettings(['REGISTRATION_SWITCHER'], $db)['REGISTRATION_SWITCHER'];
            if (!$isRegOn) {
                return $response->withJson([
                    'status' => 0,
                    'err' => $trArr["Registration_disabled"],
                ]);
            }

            //Check email exists in DB
            $sql = " SELECT COUNT(email) AS cnt FROM ".$tableNames['users'];
            $sql .=" WHERE email=:email";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':email', $email);
            $stmt->execute();
            if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                if ($row['cnt']>0) {
                    return $response->withJson([
                        'status' => 0,
                        'err' => [
                            "email"=>[$trArr["Current_email_is_already_used"]],
                            "validatorErr"=>1
                        ],
                    ]);
                }
            }

            //Add user to DB
            $sql="INSERT INTO ".$tableNames['users'];
            $sql.=" (email,pass,fname,mname,lname,nick,phone,";
            $sql.=" urlacpt,acptd,icon,site,dt,privlgs)";
            $sql.=" VALUES (:email,:pass,:fname,:mname,:lname,:nick,";
            $sql.=":phone,:urlacpt,:acptd,:icon,:site,:dt,:privlgs)";
            $stmt=$db->prepare($sql);
            $privlgs=intval(getSettings(['DEF_PRIVLGS'], $db)['DEF_PRIVLGS']);
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

            getDotEnv();
            $http=isset($_ENV["HTTP_BACKEND"])?$_ENV["HTTP_BACKEND"]:"http";
            $host=isset($_ENV["HOST_BACKEND"])?$_ENV["HOST_BACKEND"]:"localhost";
            $port=isset($_ENV["PORT_BACKEND"])?$_ENV["PORT_BACKEND"]:"80";
            if($port=="80")
                $port="";
            else
                $port=":".$port;
            $mailCharset=isset($_ENV["MAIL_CHARSET"])?$_ENV["MAIL_CHARSET"]:"UTF-8";
            $mailHost=isset($_ENV["MAIL_HOST"])?$_ENV["MAIL_HOST"]:"smtp.mail.ru";
            $mailSmtpAuth=((isset($_ENV["MAIL_SMTP_AUTH"])?$_ENV["MAIL_SMTP_AUTH"]:"true")=="true")?true:false;
            $mailSmtpUsername=isset($_ENV["MAIL_SMTP_USERNAME"])?$_ENV["MAIL_SMTP_USERNAME"]:"";
            $mailSmtpPassword=isset($_ENV["MAIL_SMTP_PASSWORD"])?$_ENV["MAIL_SMTP_PASSWORD"]:"";
            $mailSmtpSecure=isset($_ENV["MAIL_SMTP_SECURE"])?$_ENV["MAIL_SMTP_SECURE"]:"ssl";
            $mailSmtpPort=intval(isset($_ENV["MAIL_SMTP_PORT"])?$_ENV["MAIL_SMTP_PORT"]:"465");
            $mailIsHTML=isset($_ENV["MAIL_IS_HTML"])?$_ENV["MAIL_IS_HTML"]:"true";

            //Send email to accept registration
            $messageTxt=$trArr["To_finish_registration_process_go_to_the_accept_link_please"];
            $messageTxt.=": ".$http."://".$host.$port."/linkaccpt?id=".$urlacpt;
            $message	="<h4>".$trArr["To_finish_registration_process_go_to_the_accept_link_please"].":</h4><br><br>";
            $message	.="<h3><a href='".$http."://".$host.$port."/linkaccpt?id=".$urlacpt."'>";
            $message    .=" ".$trArr["Accept_registration"]." ";
            $message    .=$http."://".$host.$port."/linkaccpt?id=".$urlacpt."</a></h3>";
            $headers	= 'MIME-Version: 1.0' . "\r\n";
            $headers	.= "Content-type: text/html;\r\n charset=utf-8\r\n";
            $headers	.= "Content-Transfer-Encoding: 8bit\r\n";
            $mail = new PHPMailer(true);
            try {
                //$mail->SMTPDebug = 2;
                $mail->isSMTP();
                $mail->CharSet = $mailCharset;
                $mail->Host = $mailHost;
                $mail->SMTPAuth = $mailSmtpAuth;
                $mail->Username = $mailSmtpUsername;
                $mail->Password = $mailSmtpPassword;
                $mail->SMTPSecure = $mailSmtpSecure;
                $mail->Port = $mailSmtpPort;
                $mail->setFrom($email, $host);
                $mail->addAddress($email, 'Admin');
                //$mail->addReplyTo($email, 'Information');
                $mail->addCC($email);
                $mail->addBCC($email);
                $mail->isHTML(true);
                $mail->Subject = $trArr["Accept_registration"];
                $mail->Body    = $message;
                $mail->AltBody = $messageTxt;
                $mail->send();
            } catch (Exception $e) {
                //echo 'Message could not be sent. Mailer Error: ', $mail->ErrorInfo;
            }
        } catch (Exception $e) {
            $status=0;
            $err=$e->getMessage();
        }
        return $response->withJson([
            'status' => $status,
            'err' => $err,
            'url' => $url
        ]);
    }



    //Accept link and registration finish
    public function linkaccpt($request, $response, $args)
    {
        $db=$this->container['db'];
        $tableNames=$this->container['tableNames'];
        $id=$request->getQueryParam("id", "");
        $status=0;

        //Check user if accepted
        $sql=" SELECT COUNT(id) AS cnt FROM ".$tableNames["users"];
        $sql.=" WHERE urlacpt=:urlacpt";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':urlacpt', $id);
        $stmt->execute();

        //User accepted
        if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
            if (intval($row["cnt"])>0) {
                $sql="  UPDATE ".$tableNames["users"]." SET urlacpt='',acptd=1";
                $sql.=" WHERE urlacpt=:urlacpt";
                $stmt = $db->prepare($sql);
                $stmt->bindParam(':urlacpt', $id);
                $stmt->execute();
                $status=1;
            }
        }
        getDotEnv();
        $http=isset($_ENV["HTTP_BACKEND"])?$_ENV["HTTP_BACKEND"]:"http";
        $host=isset($_ENV["HOST_BACKEND"])?$_ENV["HOST_BACKEND"]:"vuepress.com";
        $port=isset($_ENV["PORT_BACKEND"])?$_ENV["PORT_BACKEND"]:"80";

        $trArr=tr($db,[
            "Registration_accepted_success",
            "Accept_link_already_used",
            "now_you_can_login_with_you_email_and_password",
            "Login",
        ]);


        if($port=="80")
            $port="";
        else
            $port=":".$port;
        $args=[
            "status"=>$status,
            "http"=>$http,
            "host"=>$host,
            "port"=>$port,
            "Registration_accepted_success"=>$trArr["Registration_accepted_success"],
            "Accept_link_already_used"=>$trArr["Accept_link_already_used"],
            "now_you_can_login_with_you_email_and_password"=>
                $trArr["now_you_can_login_with_you_email_and_password"],
            "Login"=>$trArr["Login"]
        ];
        $this->container["renderer"]->render($response, 'linkaccpt.phtml', $args);
    }



    //validator reset password
    public function validateResetpass($dataIN)
    {
        $v = new \Valitron\Validator($dataIN);

        $v->rule('required', 'email')->message('{field} must be set');
        $v->rule('email', 'email')->message('{field} must be in email format');

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



    //Reset password
    public function resetpass($request, $response, $args)
    {
        $db=$this->container['db'];
        $tableNames=$this->container['tableNames'];
        $parsedBody = $request->getParsedBody();

        //Validate input data
        $res=$this->validateResetpass(['email'=>$parsedBody["email"]]);
        if ($res['status']==0) {
            return $response->withJson($res);
        }

        $email=$parsedBody["email"];
        $resetacpt=genID(16, 32);

        //Check user in DB
        $sql="SELECT COUNT(id) AS cnt FROM ".$tableNames["users"];
        $sql.=" WHERE email=:email";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        $trArr=tr($db,[
            "Email_is_not_registered", 
            "Reset_password",
            "To_reset_password_go_to_link_please",
        ]);
        $err=$trArr["Email_is_not_registered"];
        
        $status=0;

        //User found
        if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
            if (intval($row["cnt"])>0) {
                $sql="  UPDATE ".$tableNames["users"]." SET resetacpt=:resetacpt,";
                $sql.=" resetid=:resetid WHERE email=:email";
                $stmt = $db->prepare($sql);
                $stmt->bindParam(':resetacpt', $resetacpt);
                $resetid=genID(16, 32);
                $stmt->bindParam(':email', $email);
                $stmt->bindParam(':resetid', $resetid);
                $stmt->execute();
                $status=1;
                $err="";

                getDotEnv();
                $http=isset($_ENV["HTTP_BACKEND"])?$_ENV["HTTP_BACKEND"]:"http";
                $host=isset($_ENV["HOST_BACKEND"])?$_ENV["HOST_BACKEND"]:"vuepress.com";
                $port=isset($_ENV["PORT_BACKEND"])?$_ENV["PORT_BACKEND"]:"80";

                if($port=="80")
                    $port="";
                else
                    $port=":".$port;
                $mailCharset=isset($_ENV["MAIL_CHARSET"])?$_ENV["MAIL_CHARSET"]:"UTF-8";
                $mailHost=isset($_ENV["MAIL_HOST"])?$_ENV["MAIL_HOST"]:"smtp.mail.ru";
                $mailSmtpAuth=((isset($_ENV["MAIL_SMTP_AUTH"])?$_ENV["MAIL_SMTP_AUTH"]:"true")=="true")?true:false;
                $mailSmtpUsername=isset($_ENV["MAIL_SMTP_USERNAME"])?$_ENV["MAIL_SMTP_USERNAME"]:"";
                $mailSmtpPassword=isset($_ENV["MAIL_SMTP_PASSWORD"])?$_ENV["MAIL_SMTP_PASSWORD"]:"";
                $mailSmtpSecure=isset($_ENV["MAIL_SMTP_SECURE"])?$_ENV["MAIL_SMTP_SECURE"]:"ssl";
                $mailSmtpPort=intval(isset($_ENV["MAIL_SMTP_PORT"])?$_ENV["MAIL_SMTP_PORT"]:"465");
                $mailIsHTML=isset($_ENV["MAIL_IS_HTML"])?$_ENV["MAIL_IS_HTML"]:"true";
    
                $messageTxt=$trArr["To_reset_password_go_to_link_please"];
                $messageTxt=": ".$http."://".$host.$port."/newpass?id=".$resetacpt;
                $message	="<h4>".$trArr["To_reset_password_go_to_link_please"].":</h4><br><br>";
                $message	.="<h3><a href='".$http."://".$host.$port."/newpass?id=".$resetacpt."'>";
                $message	.=" ".$trArr["Reset_password"]." ".$http."://".$host.$port."/newpass?id=".$resetacpt."</a></h3>";
                $headers	= 'MIME-Version: 1.0' . "\r\n";
                $headers	.= "Content-type: text/html;\r\n charset=utf-8\r\n";
                $headers	.= "Content-Transfer-Encoding: 8bit\r\n";
                $mail = new PHPMailer(true);
                try {
                    //$mail->SMTPDebug = 2;
                    $mail->isSMTP();
                    $mail->CharSet = $mailCharset;
                    $mail->Host = $mailHost;
                    $mail->SMTPAuth = $mailSmtpAuth;
                    $mail->Username = $mailSmtpUsername;
                    $mail->Password = $mailSmtpPassword;
                    $mail->SMTPSecure = $mailSmtpSecure;
                    $mail->Port = $mailSmtpPort;
                    $mail->setFrom($email, $host);
                    $mail->addAddress($email, 'Admin');
                    //$mail->addReplyTo($email, 'Information');
                    $mail->addCC($email);
                    $mail->addBCC($email);
                    $mail->isHTML($mailIsHTML);
                    $mail->Subject = $trArr["Reset_password"];
                    $mail->Body    = $message;
                    $mail->AltBody = $messageTxt;
                    $mail->send();
                } catch (Exception $e) {
                    //echo 'Message could not be sent. Mailer Error: ', $mail->ErrorInfo;
                }
            }
        }
        return $response->withJson([
            'status' => $status,
            'err' => $err,
            'email' => $email
        ]);
    }



    //Set new pass
    public function newpass($request, $response, $args)
    {
        $db=$this->container['db'];
        $tableNames=$this->container['tableNames'];

        $id=$request->getQueryParam("id", "");
        $resetid="";
        $status=0;

        //Get one-time id to change pass by resetacpt id from url-get
        $sql="  SELECT resetid FROM ".$tableNames["users"];
        $sql.=" WHERE resetacpt=:resetacpt";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':resetacpt', $id);
        $stmt->execute();

        //resetid found
        if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {

            //Empty resetacpt id
            $resetid=$row["resetid"];
            $sql="  UPDATE ".$tableNames["users"]." SET resetacpt=''";
            $sql.=" WHERE resetacpt=:resetacpt";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':resetacpt', $id);
            $stmt->execute();

            $status=1;
        }

        $trArr=tr($db,[
            "Enter_new_password",
            "Error",
            "Password",
            "Repeat_password",
            "Save",
        ]);

        $args=[
            "status"=>$status, //1-success/0-error
            "resetid"=>$resetid,
            "Enter_new_password"=>$trArr["Enter_new_password"],
            "Error"=>$trArr["Error"],
            "Password"=>$trArr["Password"],
            "Repeat_password"=>$trArr["Repeat_password"],
            "Save"=>$trArr["Save"],
        ]; 
        $this->container["renderer"]->render($response, 'newpass.phtml', $args);
    }



    //Password saved
    public function savepass($request, $response, $args)
    {
        $db=$this->container['db'];
        $tableNames=$this->container['tableNames'];
        $parsedBody = $request->getParsedBody();

        $id=$parsedBody["id"];
        $pass1=$parsedBody["pass1"];
        $pass2=$parsedBody["pass2"];
        $pass=md5($pass1);
        $status=0;
        //Check passwords set
        if ($id!="" && $pass1!="" && $pass2!="" && $pass1==$pass2) {

            //Check resetid in DB
            $sql="SELECT COUNT(resetid) AS cnt FROM ";
            $sql.=$tableNames["users"]." WHERE resetid=:resetid";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':resetid', $id);
            $stmt->execute();

            //resetid found
            if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                if (intval($row["cnt"])>0) {

                    //Set new password as md5
                    $sql="UPDATE ".$tableNames["users"]." SET resetid='',";
                    $sql.=" pass=:pass WHERE resetid=:resetid";
                    $stmt = $db->prepare($sql);
                    $stmt->bindParam(':resetid', $id);
                    $stmt->bindParam(':pass', $pass);
                    $stmt->execute();
                    
                    $status=1;
                }
            }

            getDotEnv();
            $http=isset($_ENV["HTTP_BACKEND"])?$_ENV["HTTP_BACKEND"]:"http";
            $host=isset($_ENV["HOST_BACKEND"])?$_ENV["HOST_BACKEND"]:"vuepress.com";
            $port=isset($_ENV["PORT_BACKEND"])?$_ENV["PORT_BACKEND"]:"80";
            if($port=="80")
                $port="";
            else
                $port=":".$port;

            $trArr=tr($db,[
                "Password_set_success",
                "now_you_can_login_with_you_email_and_password",
                "Link_is_not_active",
                "Login",
                "Error"
            ]);

            $args=[
                "status"=>$status,
                "http"=>$http,
                "host"=>$host,
                "port"=>$port,
                "Password_set_success"=>$trArr["Password_set_success"],
                "now_you_can_login_with_you_email_and_password"=>
                    $trArr["now_you_can_login_with_you_email_and_password"],
                "Link_is_not_active"=>$trArr["Link_is_not_active"],
                "Login"=>$trArr["Login"],
                "Error"=>$trArr["Error"],
            ];
            $this->container["renderer"]->render($response, 'savepass.phtml', $args);
        } else {
            $response->withRedirect('/', 301);
        }
    }
}
