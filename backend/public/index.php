<?php
if (PHP_SAPI == 'cli-server') {
    // To help the built-in PHP dev server, check if the request was actually for
    // something which should probably be served as a static file
    $url  = parse_url($_SERVER['REQUEST_URI']);
    $file = __DIR__ . $url['path'];
    if (is_file($file)) {
        return false;
    }
}

require __DIR__ . '/../vendor/autoload.php';

session_start();

// Instantiate the app
$settings = require __DIR__ . '/../src/settings.php';
$app = new \Slim\App($settings);

// Set up controllers
require __DIR__ . '/../src/controller/AuthController.php';
require __DIR__ . '/../src/controller/HomeController.php';
require __DIR__ . '/../src/controller/DiagramController.php';
require __DIR__ . '/../src/controller/CategoryController.php';
require __DIR__ . '/../src/controller/PostController.php';
require __DIR__ . '/../src/controller/UserController.php';
require __DIR__ . '/../src/controller/LangsController.php';
require __DIR__ . '/../src/controller/DemoController.php';
require __DIR__ . '/../src/controller/FileController.php';
require __DIR__ . '/../src/controller/SettingsController.php';
require __DIR__ . '/../src/controller/CommentsController.php';
require __DIR__ . '/../src/controller/RSSController.php';



// Set up dependencies
require __DIR__ . '/../src/dependencies.php';

// Register middleware
require __DIR__ . '/../src/middleware.php';

// Register routes
require __DIR__ . '/../src/routes.php';

// Run app
$app->run();
