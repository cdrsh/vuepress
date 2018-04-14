<?php
use \Firebase\JWT\JWT;

// Application middleware
// e.g: $app->add(new \Slim\Csrf\Guard);

$container = $app->getContainer();

$container["jwt"] = function ($container) {
    return new StdClass;
};

$container["key"]="supersecretkeyyoushouldnotcommittogithub";

if(!isset($_ENV["ISPRESSLOADED"])) {
    if(file_exists(dirname(__FILE__)."/../.env")) {
        $dotenv = new \Dotenv\Dotenv(__DIR__."/..");
        $dotenv->load();
        if(isset($_ENV["JWT_SERVER_KEY"]))
            $container["key"]=$_ENV["JWT_SERVER_KEY"];
    }
}


$app->add(new \Slim\Middleware\JwtAuthentication([
    "path" => ["/api"],
    //"logger" => $container['logger'],
    "secret" => $container["key"],
    "secure" => false,//localhost no https (ssl) accept
    "rules" => [
        new \Slim\Middleware\JwtAuthentication\RequestPathRule([
            "path" => "/api",
            "passthrough" => [
                "/api/token",
                "/not-secure",
                "/home",
                "/api/login",
                "/api/register",
                "/api/resetpass",
                "/api/logout",
                "/api-noauth"
            ],
        ]),
        new \Slim\Middleware\JwtAuthentication\RequestMethodRule([
            "passthrough" => ["OPTIONS"]
        ]),
    ],
    "callback" => function ($request, $response, $arguments) use ($container) {
        $container["jwt"] = $arguments["decoded"];
        //$container['logger']->addInfo(dmp( $container["db"]));
    },
    "error" => function ($request, $response, $arguments) use ($container) {
        $status=$arguments["message"]=="Expired token"?3:0;//3-expired 0-error
        $data = array(
            'status' => $status,
            'err' => $arguments["message"],
        );
        return $response->withJson($data);
    }
]));
