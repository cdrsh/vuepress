<?php

use \Firebase\JWT\JWT;

//Log output
function toFile($par)
{
    ob_start();
    var_dump($par);
    $output = ob_get_clean();
    file_put_contents(realpath(dirname(__FILE__)."/../../logs/app.log"), $output);
}

//Generate id
function genID($min, $max)
{
    $arr="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    $len=rand($min, $max);
    $lenstr=strlen($arr)-1;
    $out="";
    for ($i=0; $i<$len; $i++) {
        $out.=$arr[rand(0, $lenstr)];
    }
    return $out;
}



//Get Access Token
function genAToken($id)
{
    ini_set("date.timezone", "Europe/Moscow");
    $key =  (!isset($_ENV["JWT_SERVER_KEY"]))
            ?"supersecretkeyyoushouldnotcommittogithub"
            :$_ENV["JWT_SERVER_KEY"];
    $now = time();
    $exp=time()+5*60*60;//5 min
    //$exp=time()+10;//2 sec
    $token = array(
        "id"=>$id,
        "iat"=>$now,
        "exp"=>$exp,
    );
    return [
        'token'=>JWT::encode($token, $key),
        "exp"=>$exp,
    ];
}



//Get Refresh token
function genRToken($usrid, $id)
{
    ini_set("date.timezone", "Europe/Moscow");
    $key =  (!isset($_ENV["JWT_SERVER_KEY"]))
            ?"supersecretkeyyoushouldnotcommittogithub"
            :$_ENV["JWT_SERVER_KEY"];

    $now = time();
    $exp=time()+(60*60*24);//5 min
    //$exp=time()+20;//20 sec
    $token = array(
        "id"=>$id,
        "usrid"=>$usrid,
        "iat"=>$now,
        "exp"=>$exp,
    );
    return [
        'token'=>JWT::encode($token, $key),
        "exp"=>$exp,
    ];
}



//Check google recapcha
function chkCapcha($capcha,$privKey)
{
    $postdata = http_build_query(array(
        'secret' => $privKey,
        'response'  => $capcha
    ));

    $opts = array('http' =>array(
        'method'  => 'POST',
        'header'  => 'Content-type: application/x-www-form-urlencoded',
        'content' => $postdata
    ));
    $context  = stream_context_create($opts);
    $result = file_get_contents(
        'https://www.google.com/recaptcha/api/siteverify',
        false,
        $context
    );
    $check = json_decode($result);
    return $check->success;
}



//Move uploaded file from tmp folder to uploaded
function moveUploadedFile($directory, $uploadedFile)
{
    $extension = pathinfo($uploadedFile->getClientFilename(), PATHINFO_EXTENSION);
    $basename = bin2hex(random_bytes(8));
    $filename = sprintf('%s.%0.8s', $basename, $extension);
    $uploadedFile->moveTo($directory . DIRECTORY_SEPARATOR . $filename);
    return $filename;
}



//Get dump of object
function dmp($par)
{
    ob_start();
    var_dump($par);
    return ob_get_clean();
}



//Get formatted random date
function getDt()
{
    $year=rand(2017, 2018);
    $month=rand(1, 12);
    $day=rand(1, 28);
    $hour=rand(1, 23);
    $minutes=rand(1, 59);
    $second=rand(1, 59);
    $month=strlen($month)==1?"0".$month:$month;
    $day=strlen($day)==1?"0".$day:$day;
    $hour=strlen($hour)==1?"0".$hour:$hour;
    $minutes=strlen($minutes)==1?"0".$minutes:$minutes;
    $second=strlen($second)==1?"0".$second:$second;
    $dt=$year."-".$month."-".$day." ".$hour.":".$minutes.":".$second;
    return $dt;
}



//Get access token from request
function getAt($request)
{
    $res=$request->getHeader('Authorization');
    if (isset($res) && count($res)>0) {
        return substr($res[0], 7);
    }
    return "-1";
}



//Check user priveleges by array privlgs
function chkUserPrivileges($request, $db, $privlgs, $resType="AS_ONE")
{
    $PRIV_ARR=[
        'ADMIN_PAGE_ACCESS' =>0x100,//9bit
        'MANAGE_FILES'      =>0x80, //8bit
        'WRITE_CATEGORIES'  =>0x40, //7bit
        'READ_CATEGORIES'   =>0x20, //6bit
        'WRITE_USERS'       =>0x10, //5bit
        'READ_USERS'        =>0x8,  //4bit
        'BLOCK_USERS'       =>0x4,  //3bit
        'WRITE_POST'        =>0x2,  //2bit
        'READ_POST'         =>0x1,  //1bit
    ];
    
    //High part
    //9-Admin page access
    //8-Manage files
    //7-Write categories
    //6-Read categories - 0-hide categories
    //5-Write users
    //4-Read users - 0-hide users
    //3-blocked user
    //2-Write post
    //1-Read post - 0-hide posts

    $privs=0;

    //Get access token
    $at=getAt($request);

    //No token
    if ($at=="-1" && $resType=="AS_ONE") {
        return false;
    }
    if ($at=="-1" && $resType!="AS_ONE") {
        $arrOut=[];
        for ($i=0;$i<count($privlgs);$i++) {
            $arrOut[$privlgs[$i]]=false;
        }
        return $arrOut;
    }
    
    //Check token in DB
    $sql=" SELECT COUNT(tokens.id) AS cnt FROM tokens ";
    $sql.=" WHERE tokens.at=:at";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(":at", $at);
    $stmt->execute();
    if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
        if (intval($row["cnt"])==0) {
            if ($resType=="AS_ONE") {
                return false;
            }
            if ($resType!="AS_ONE") {
                $arrOut=[];
                for ($i=0;$i<count($privlgs);$i++) {
                    $arrOut[$privlgs[$i]]=false;
                }
                return $arrOut;
            }
        }
    }

    //Get privelegs from DB
    $sql=" SELECT users.privlgs FROM users ";
    $sql.=" LEFT JOIN tokens ";
    $sql.=" ON tokens.usrid=users.id ";
    $sql.=" WHERE tokens.at=:atoken";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(":atoken", $at);
    $stmt->execute();
    if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
        $privs=intval($row['privlgs']);
    }

    //AS_ONE result
    if ($resType=="AS_ONE") {
        $res=true;
        for ($i=0;$i<count($privlgs);$i++) {
            if (($privs&$PRIV_ARR[$privlgs[$i]])==0) {
                $res=false;
                break;
            }
        }
        return $res;
    }

    //AS_ARRAY result
    $arrOut=[];
    for ($i=0;$i<count($privlgs);$i++) {
        $arrOut[$privlgs[$i]]=($privs&$PRIV_ARR[$privlgs[$i]])?true:false;
    }
    return $arrOut;
}



//get Settings array by array of keys
function getSettings($keysArr, $db)
{
    $outArr=[];
    if($db==NULL)
        return $outArr;
    $where="";
    if (isset($keysArr)) {
        for ($i=0;$i<count($keysArr);$i++) {
            $where.="kee=:kee".$i." OR ";
        }
        if (count($keysArr)>0) {
            $where=" WHERE ".substr($where, 0, -4);
        }
    }
    $sql="SELECT * FROM settings ".$where;
    $stmt = $db->prepare($sql);
    for ($i=0;$i<count($keysArr);$i++) {
        $stmt->bindParam(':kee'.$i, $keysArr[$i]);
    }
    $stmt->execute();
    while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
        if ($row['vaa']=='true' || $row['vaa']=='false') {
            $outArr[$row['kee']]=$row['vaa']=='true'?true:false;
        } else {
            $outArr[$row['kee']]=$row['vaa'];
        }
    }
    return $outArr;
}

//Get .env settings
function getDotEnv()
{
    if (!isset($_ENV['ISPRESSLOADED'])) {
        if (file_exists(dirname(__FILE__)."/../../.env")) {
            $dotenv = new \Dotenv\Dotenv(__DIR__."/../..");
            $dotenv->load();
        }
    }
}

//Reload env
function reloadEnv()
{
    $dotenv = new \Dotenv\Dotenv(__DIR__."/../..");
    $dotenv->load();
}

//Translate function
function tr($db,$arr,$noDb=false) {
    $lang = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2);
    if (!$noDb) {
        if ($lang!="") {
            //Get lang codes
            $lngsArr=array();
            $sql="SELECT code FROM lang WHERE used=1";
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
    }
    
    //Languages
    $strs=[
        "en"=>[
            "To_reset_password_go_to_link_please"=>"To reset password go to link please",
            "Reset_password"=>"Reset password",
            "Email_is_not_registered"=>"Email is not registered",
            "Current_email_is_already_used"=>"Current email is already used",
            "Registration_disabled"=>"Registration disabled",
            "Account_is_not_accepted_by_email"=>"Account is not accepted by email",
            "Login_or_password_is_not_accepted"=>"Login or password is not accepted",
            "To_finish_registration_process_go_to_the_accept_link_please"=>
                "To finish registration process go to the accept link please",
            "Accept_registration"=>"Accept registration",
            
            "Enter_new_password"=>"Enter new password",
            "Error"=>"Error",
            "Password"=>"Password",
            "Repeat_password"=>"Repeat password",
            "Save"=>"Save",

            "Password_set_success"=>"Password set success",
            "now_you_can_login_with_you_email_and_password"=>
                "now you can login with you email and password",
            "Link_is_not_active"=>"Link is not active",
            "Login"=>"Login",

            "Registration_accepted_success"=>"Registration accepted success",
            "Accept_link_already_used"=>"Accept link already used",
            

            
            "Install_Vuepress"=>"Install Vuepress",

            "HOSTING_SETTINGS"=>"HOSTING SETTINGS",
            "Http_Protocol"=>"Http Protocol",
            "Host"=>"Host",
            "Port"=>"Port",
            
            "Http_Protocol_is_not_set"=>"Http Protocol is not set",
            "Host_is_not_set"=>"Host is not set",
            "Port_is_not_set"=>"Port is not set",

            "MYSQL_SETTINGS"=>"MYSQL SETTINGS",
            "DB_Host"=>"DB Host",
            "DB_Name"=>"DB Name",
            "DB_User"=>"DB User",
            "DB_Password"=>"DB Password",

            "DB_Host_is_not_set"=>"DB Host is not set",
            "DB_Name_is_not_set"=>"DB Name is not set",
            "DB_User_is_not_set"=>"DB User is not set",
            "DB_Pass_or_is_not_set"=>"DB Pass or is not set",

            "MAIL_SETTINGS"=>"MAIL SETTINGS",
            "SMTP_Host"=>"SMTP Host",
            "SMTP_Port"=>"SMTP Port",
            "SMTP_Secure"=>"SMTP Secure",
            "SMTP_Auth"=>"SMTP Auth",
            "SMTP_Username"=>"SMTP Username",
            "SMTP_Password"=>"SMTP Password",
            "SMTP_Charset"=>"SMTP Charset",
            "HTML_Format"=>"HTML Format",

            "SMTP_Host_is_not_set"=>"SMTP Host is not set",
            "SMTP_Port_is_not_set"=>"SMTP Port is not set",
            "SMTP_Secure_is_not_set"=>"SMTP Secure is not set",

            "SMTP_Username_is_not_set"=>"SMTP Username is not set",
            "SMTP_Password_is_not_set"=>"SMTP Password is not set",
            "SMTP_Charset_is_not_set"=>"SMTP Charset is not set",
            "HTML_Format_is_not_set"=>"HTML Format is not set",
            
            "For_Developers_Nodejs_settings"=>"For Developers Nodejs settings",

            "CLIENT_SETTINGS"=>"CLIENT SETTINGS",
            "Host"=>"Host",
            "Port"=>"Port",

            "HTTP_Protocol_is_not_set"=>"HTTP Protocol is not set",
            "Host_is_not_set"=>"Host is not set",
            "Post_is_not_set"=>"Post is not set",
            
            "ADMIN_PANEL_SETTINGS"=>"ADMIN PANEL SETTINGS",
            "Install"=>"Install",
            "Jwt_server_key"=>"JWT SERVER KEY",
            "Jwt_server_key_is_not_set"=>"JWT SERVER KEY is not set",

        ],

        "ru"=>[
            "To_reset_password_go_to_link_please"=>"Для сброса пароля пожалуйста пройдите по ссылке",
            "Reset_password"=>"Сброс пароля",
            "Email_is_not_registered"=>"Email не зарегистрирован",
            "Current_email_is_already_used"=>"Данный email уже используется",
            "Registration_disabled"=>"Регистрация отключена",
            "Account_is_not_accepted_by_email"=>"Регистрация данного аккаунта не подтверждена по email",
            "Login_or_password_is_not_accepted"=>"Логин или пароль не действительны",
            "To_finish_registration_process_go_to_the_accept_link_please"=>
                "Для завершения процесса регистрации пройдите пожалуйста по ссылке",
            "Accept_registration"=>"Подтверждение регистрации",

            "Enter_new_password"=>"Ввести новый пароль",
            "Error"=>"Ошибка",
            "Password"=>"Пароль",
            "Repeat_password"=>"Повторить пароль",
            "Save"=>"Сохранить",

            "Password_set_success"=>"Пароль успешно установлен",
            "now_you_can_login_with_you_email_and_password"=>
                "теперь Вы можете войти используя свои email и пароль",
            "Link_is_not_active"=>"Ссылка не активна",
            "Login"=>"Войти",

            "Registration_accepted_success"=>"Регистрация прошла успешно",
            "Accept_link_already_used"=>"Ссылка подтверждения уже использована",



            "Install_Vuepress"=>"Установить Vuepress",

            "HOSTING_SETTINGS"=>"Настройки бекенда",
            "Http_Protocol"=>"Http протокол",
            "Host"=>"Хост",
            "Port"=>"Порт",
            
            "Http_Protocol_is_not_set"=>"Http протокол не задан",
            "Host_is_not_set"=>"Хост не задан",
            "Port_is_not_set"=>"Порт не задан",

            "MYSQL_SETTINGS"=>"MYSQL настройки",
            "DB_Host"=>"Хост БД",
            "DB_Name"=>"Имя БД",
            "DB_User"=>"Имя пользователя",
            "DB_Password"=>"Пароль пользователя",

            "DB_Host_is_not_set"=>"Хост БД не задан",
            "DB_Name_is_not_set"=>"Имя БД не задан",
            "DB_User_is_not_set"=>"Имя пользователя не задан",
            "DB_Pass_or_is_not_set"=>"Пароль пользователя не задан",

            "MAIL_SETTINGS"=>"Настройки почты SMTP",
            "SMTP_Host"=>"Хост",
            "SMTP_Port"=>"Порт",
            "SMTP_Secure"=>"Протокол",
            "SMTP_Auth"=>"Аутентификация",
            "SMTP_Username"=>"Имя пользователя",
            "SMTP_Password"=>"Пароль",
            "SMTP_Charset"=>"Кодировка",
            "HTML_Format"=>"HTML-формат",

            "SMTP_Host_is_not_set"=>"Хост не задан",
            "SMTP_Port_is_not_set"=>"Порт не задан",
            "SMTP_Secure_is_not_set"=>"Протокол не задан",

            "SMTP_Username_is_not_set"=>"Имя пользователя не задано",
            "SMTP_Password_is_not_set"=>"Пароль не задан",
            "SMTP_Charset_is_not_set"=>"Кодировка не задана",
            "HTML_Format_is_not_set"=>"HTML формат не задан",
            
            "For_Developers_Nodejs_settings"=>"Для разработчиков Nodejs настройки",

            "CLIENT_SETTINGS"=>"Настройки клиента",
            "Host"=>"Хост",
            "Port"=>"Порт",

            "HTTP_Protocol_is_not_set"=>"HTTP протокол не задан",
            "Host_is_not_set"=>"Хост не задан",
            "Post_is_not_set"=>"Порт не задан",
            
            "ADMIN_PANEL_SETTINGS"=>"Настройки панели администрирования",

            "Install"=>"Установить",
            "Jwt_server_key"=>"JWT Серверный ключ",
            "Jwt_server_key_is_not_set"=>"JWT Серверный ключ не задан",
        ],

        "de"=>[
            "To_reset_password_go_to_link_please"=>"Um Ihr Passwort zurückzusetzen, folgen Sie bitte dem Link",
            "Reset_password"=>"Setzen Sie Ihr Passwort zurück",
            "Email_is_not_registered"=>"E-Mail nicht registriert",
            "Current_email_is_already_used"=>"Diese E-Mail wird bereits verwendet",
            "Registration_disabled"=>"Die Registrierung ist deaktiviert",
            "Account_is_not_accepted_by_email"=>"Die Registrierung dieses Kontos wurde nicht per E-Mail bestätigt",
            "Login_or_password_is_not_accepted"=>"Login oder Passwort sind nicht gültig",
            "To_finish_registration_process_go_to_the_accept_link_please"=>
                "Um den Registrierungsprozess abzuschließen, gehen Sie bitte auf den Link",
            "Accept_registration"=>"Bestätigung der Registrierung",

            "Enter_new_password"=>"Geben Sie ein neues Passwort ein",
            "Error"=>"Fehler",
            "Password"=>"Passwort",
            "Repeat_password"=>"Passwort erneut eingeben",
            "Save"=>"Speichern",

            "Password_set_success"=>"Das Passwort wurde erfolgreich installiert",
            "now_you_can_login_with_you_email_and_password"=>
                "Jetzt können Sie sich mit Ihrer E-Mail-Adresse und Ihrem Passwort anmelden",
            "Link_is_not_active"=>"Link nicht aktiv",
            "Login"=>"Anmeldung",

            "Registration_accepted_success"=>"Die Registrierung war erfolgreich",
            "Accept_link_already_used"=>"Bestätigungslink bereits verwendet",



            "Install_Vuepress"=>"Installieren Vuepress",

            "HOSTING_SETTINGS"=>"Back-End-Einstellungen",
            "Http_Protocol"=>"HTTP-Protokoll",
            "Host"=>"Gastgeber",
            "Port"=>"Hafen",
            
            "Http_Protocol_is_not_set"=>"HTTP-Protokoll nicht angegeben",
            "Host_is_not_set"=>"Kein Host angegeben",
            "Port_is_not_set"=>"Port nicht angegeben",

            "MYSQL_SETTINGS"=>"MySQL-Einstellungen",
            "DB_Host"=>"Datenbank-Host",
            "DB_Name"=>"Datenbankname",
            "DB_User"=>"Benutzername",
            "DB_Password"=>"Benutzerkennwort",

            "DB_Host_is_not_set"=>"Kein Datenbankhost angegeben",
            "DB_Name_is_not_set"=>"Datenbankname nicht angegeben",
            "DB_User_is_not_set"=>"Benutzername nicht angegeben",
            "DB_Pass_or_is_not_set"=>"Benutzerpasswort nicht gesetzt",
           
            "MAIL_SETTINGS"=>"SMTP-Maileinstellungen",
            "SMTP_Host"=>"Gastgeber",
            "SMTP_Port"=>"Hafen",
            "SMTP_Secure"=>"Protokoll",
            "SMTP_Auth"=>"Authentifizierung",
            "SMTP_Username"=>"Benutzername",
            "SMTP_Password"=>"Passwort",
            "SMTP_Charset"=>"Codierung",
            "HTML_Format"=>"HTML-Format",
            
            "SMTP_Host_is_not_set"=>"Kein Host angegeben",
            "SMTP_Port_is_not_set"=>"Port nicht angegeben",
            "SMTP_Secure_is_not_set"=>"Kein Protokoll angegeben",

            "SMTP_Username_is_not_set"=>"Benutzername nicht angegeben",
            "SMTP_Password_is_not_set"=>"Passwort nicht gesetzt",
            "SMTP_Charset_is_not_set"=>"Keine Codierung angegeben",
            "HTML_Format_is_not_set"=>"Kein HTML-Format angegeben",
            
            "For_Developers_Nodejs_settings"=>"Für Entwickler, Nodejs Einstellungen",

            "CLIENT_SETTINGS"=>"Clienteinstellungen",
            "Host"=>"Gastgeber",
            "Port"=>"Hafen",

            "HTTP_Protocol_is_not_set"=>"HTTP-Protokoll nicht festgelegt",
            "Host_is_not_set"=>"Kein Host angegeben",
            "Post_is_not_set"=>"Port nicht angegeben",
            
            "ADMIN_PANEL_SETTINGS"=>"Admin-Bedienfeldeinstellungen",

            "Install"=>"Installieren",
            "Jwt_server_key"=>"JWT Serverschlüssel",
            "Jwt_server_key_is_not_set"=>"Der JWT Serverschlüssel ist nicht festgelegt",
        ],

        "zh"=>[
            "To_reset_password_go_to_link_please"=>"要重置密码，请点击链接",
            "Reset_password"=>"重置您的密码",
            "Email_is_not_registered"=>"电子邮件未注册",
            "Current_email_is_already_used"=>"此电子邮件已被使用",
            "Registration_disabled"=>"注册已禁用",
            "Account_is_not_accepted_by_email"=>"此帐户的注册尚未通过电子邮件确认",
            "Login_or_password_is_not_accepted"=>"登录或密码无效",
            "To_finish_registration_process_go_to_the_accept_link_please"=>
                "要完成注册过程，请转到链接",
            "Accept_registration"=>"注册确认",

            "Enter_new_password"=>"输入新密码",
            "Error"=>"错误",
            "Password"=>"密码",
            "Repeat_password"=>"重新输入密码",
            "Save"=>"保留",

            "Password_set_success"=>"密码成功安装",
            "now_you_can_login_with_you_email_and_password"=>
                "现在您可以使用您的电子邮件和密码登录",
            "Link_is_not_active"=>"链接不活跃",
            "Login"=>"登录",

            "Registration_accepted_success"=>"注册成功",
            "Accept_link_already_used"=>"确认链接已被使用",



            "Install_Vuepress"=>"建立 Vuepress",

            "HOSTING_SETTINGS"=>"后端设置",
            "Http_Protocol"=>"Http 协议",
            "Host"=>"主持人",
            "Port"=>"端口",
            
            "Http_Protocol_is_not_set"=>"Http 协议没有指定",
            "Host_is_not_set"=>"没有指定主机",
            "Port_is_not_set"=>"未指定端口",

            "MYSQL_SETTINGS"=>"MYSQL 设置",
            "DB_Host"=>"数据库主机",
            "DB_Name"=>"数据库名称",
            "DB_User"=>"用户名",
            "DB_Password"=>"用户密码",

            "DB_Host_is_not_set"=>"没有指定数据库主机",
            "DB_Name_is_not_set"=>"数据库名称未指定",
            "DB_User_is_not_set"=>"用户名未指定",
            "DB_Pass_or_is_not_set"=>"用户密码未设置",
            
            "MAIL_SETTINGS"=>"SMTP 邮件设置",
            "SMTP_Host"=>"主持人",
            "SMTP_Port"=>"端口",
            "SMTP_Secure"=>"协议",
            "SMTP_Auth"=>"认证",
            "SMTP_Username"=>"用户名",
            "SMTP_Password"=>"密码",
            "SMTP_Charset"=>"编码",
            "HTML_Format"=>"HTML格式",

            "SMTP_Host_is_not_set"=>"没有指定主机",
            "SMTP_Port_is_not_set"=>"未指定端口",
            "SMTP_Secure_is_not_set"=>"没有指定协议",

            "SMTP_Username_is_not_set"=>"用户名未指定",
            "SMTP_Password_is_not_set"=>"密码未设置",
            "SMTP_Charset_is_not_set"=>"没有指定编码",
            "HTML_Format_is_not_set"=>"没有指定HTML格式",
            
            "For_Developers_Nodejs_settings"=>"对于开发人员，Nodejs 设置",

            "CLIENT_SETTINGS"=>"客户端设置",
            "Host"=>"主持人",
            "Port"=>"端口",

            "HTTP_Protocol_is_not_set"=>"HTTP 协议未设置",
            "Host_is_not_set"=>"没有指定主机",
            "Post_is_not_set"=>"未指定端口",
            
            "ADMIN_PANEL_SETTINGS"=>"管理面板设置",

            "Install"=>"安装",
            "Jwt_server_key"=>"JWT 服务器密钥",
            "Jwt_server_key_is_not_set"=>"JWT 服务器密钥未设置",
        ]
    ];

    $arrOut=[];
    for($i=0;$i<count($arr);$i++) {
        if(array_key_exists($arr[$i],$strs[$lang]))
            $arrOut[$arr[$i]]=$strs[$lang][$arr[$i]];
        else
            $arrOut[$arr[$i]]="";
    }

    return $arrOut;
}