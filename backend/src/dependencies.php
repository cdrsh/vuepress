<?php
use App\Controller;

$container = $app->getContainer();
require_once(realpath(dirname(__FILE__)."/general/myfuncs.php"));

// view renderer
$container['renderer'] = function ($c) {
    $settings = $c->get('settings')['renderer'];
    return new Slim\Views\PhpRenderer($settings['template_path']);
};

// monolog
$container['logger'] = function ($c) {
    $settings = $c->get('settings')['logger'];
    $logger = new Monolog\Logger($settings['name']);
    $logger->pushProcessor(new Monolog\Processor\UidProcessor());
    $logger->pushHandler(
        new Monolog\Handler\StreamHandler(
            $settings['path'], 
            $settings['level']
        )
    );
    return $logger;
};



$container['db'] = function ($c) {
   
    //Disable db to /install path
    if($c["request"]->getUri()->getPath()=="/install") 
        return null;

    if(!isset($_ENV["ISPRESSLOADED"])) {
        if(!file_exists(dirname(__FILE__)."/../.env"))
            return null;
        getDotEnv();
    }

    $dbDriver=isset($_ENV["DB_DRIVER"])?$_ENV["DB_DRIVER"]:"mysql";
    $dbHost=isset($_ENV["DB_HOST"])?$_ENV["DB_HOST"]:"localhost";
    $dbName=isset($_ENV["DB_NAME"])?$_ENV["DB_NAME"]:"";
    $dbUser=isset($_ENV["DB_USER"])?$_ENV["DB_USER"]:"";
    $dbPassword=isset($_ENV["DB_PASSWORD"])?$_ENV["DB_PASSWORD"]:"";

    try {
        $pdo = new PDO(
            $dbDriver.":host=".$dbHost.";dbname=".$dbName.";charset=utf8",
            $dbUser,
            $dbPassword
        );
        $pdo->exec("set names utf8");
    }
    catch(Exception $err) {
        return -1;
    }
    /*
    $db = $c['settings']['db'];
    $pdo = new PDO(
        $db['driver'].":host=".$db['host'].";dbname=".$db['database'],
        $db['username'],
        $db['password']
    );
    */
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    return $pdo;
};


$container['HomeController'] = function ($c) {
    return new App\Controller\HomeController($c);
};

$container['CategoryController'] = function ($c) {
    return new App\Controller\CategoryController($c);
};

$container['PostController'] = function ($c) {
    return new App\Controller\PostController($c);
};

$container['DemoController'] = function ($c) {
    return new App\Controller\DemoController($c);
};

$container['UserController'] = function ($c) {
    return new App\Controller\UserController($c);
};

$container['LangsController'] = function ($c) {
    return new App\Controller\LangsController($c);
};

$container['FileController'] = function ($c) {
    return new App\Controller\FileController($c);
};

$container['SettingsController'] = function ($c) {
    return new App\Controller\SettingsController($c);
};

$container['CommentsController'] = function ($c) {
    return new App\Controller\CommentsController($c);
};

$container['RSSController'] = function ($c) {
    return new App\Controller\RSSController($c);
};

$container['DiagramController'] = function ($c) {
    return new App\Controller\DiagramController($c);
};

$container['AuthController'] = function ($c) {
    return new App\Controller\AuthController($c);
};



$container['tableNames'] = function ($c) {
    return [
    "category"=>"category",
    "posts"=>"posts",
    "pages"=>"pages",
    "users"=>"users",
    "lang"=>"lang",
    "files"=>"files",
    "settings"=>"settings",
    "rss"=>"rss",
    "comments"=>"comments",
    "dashboard"=>"dashboard",
    "tokens"=>"tokens",
    "cat_usrflds"=>"cat_usrflds",
    "cat_post_sv"=>"cat_post_sv",
    ];
};



$container['langNames'] = function ($c) {
    return [
    "EN"=>"English",
    "RU"=>"Russian",
    "DE"=>"German",
    "ZH"=>"Chinese"
    ];
};
