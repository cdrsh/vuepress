<?php

use Slim\Http\Request;
use Slim\Http\Response;
use Slim\Http\UploadedFile;
use Dflydev\FigCookies\Cookie;
use Dflydev\FigCookies\FigRequestCookies;
use Dflydev\FigCookies\SetCookie;
use Dflydev\FigCookies\FigResponseCookies;

use \Firebase\JWT\JWT;
use \Tuupola\Base62;
use App\Controller;

//===AuthController===
//Вход
$app->post('/api/login', 'AuthController:login');

//Регистрация
$app->post('/api/register', 'AuthController:register');

//Выход
$app->post('/api/logout', 'AuthController:logout');

//Обновить токен
$app->post('/api/token', 'AuthController:token');

//Сброс пароля - отправка на email
$app->post('/api/resetpass', 'AuthController:resetpass');

//Формы чисто на бекенде
//Подтверждение регистраци по ссылке
$app->get('/linkaccpt', 'AuthController:linkaccpt');

//Форма ввода нового пароля
$app->get('/newpass', 'AuthController:newpass');

//Принять новый пароль
$app->post('/savepass', 'AuthController:savepass');
//===AuthController===



//===Settings===
//Get All
$app->get('/api/settings/getall', 'SettingsController:sSettingsGetAll');

//Add
$app->post('/api/settings/set', 'SettingsController:sSettingsSet');

//Update
$app->get('/settings/get', 'SettingsController:sSettingsGet');

//Set All
$app->post('/api/settings/setall', 'SettingsController:sSettingsSetAll');

//===Settings===



//===DiagramController===
//Get DiagramController
$app->get('/api/diagram/load', 'DiagramController:getDiagramData');
//===DiagramController===



//===RSS===
//GET RSS
$app->get('/api/rss/load', 'RSSController:rLoad');

//DELETE RSS
$app->post('/api/rss/delete', 'RSSController:rDelete');

//ADD RSS
$app->post('/api/rss/add', 'RSSController:rAdd');

//UPDATE RSS
$app->post('/api/rss/update', 'RSSController:rUpdate');

//===RSS===



//===Category===
//Add
$app->post('/api/category/add', 'CategoryController:cAdd');

//Update
$app->post('/api/category/update', 'CategoryController:cUpdate');

//Delete selected
$app->post('/api/category/deleteselected', 'CategoryController:cDeleteSelected');

//Get
$app->get('/api/category/get', 'CategoryController:cGet');

//Move
$app->post('/api/category/move', 'CategoryController:cMove');
//===Category===



//===Comments===
//BlockUsers
$app->post('/api/comments/blockusers', 'CommentsController:cBlockUsers');

//Update
$app->post('/api/comments/update', 'CommentsController:cUpdate');

//Delete selected
$app->post('/api/comments/deleteselected', 'CommentsController:cDeleteSelected');

//+++All Comments+++
//All Comments
$app->get('/api/comments/allcomments', 'CommentsController:cGetAllComments');

//Find All Comment
$app->get('/api/comments/findallcomments', 'CommentsController:cFindAllComment');
//---All Comments---

//+++ByUsers+++
//Get ByUsers
$app->get('/api/comments/byusers', 'CommentsController:cGetByUsers');

//byusers Delete
$app->post('/api/comments/byusersdelete', 'CommentsController:cByUsersDelete');

//byusers Block
$app->post('/api/comments/byusersblock', 'CommentsController:cByUsersBlock');

//byusers Load of one user
$app->get('/api/comments/byusersloadofoneuser', 'CommentsController:cByUsersLoadOfOneUser');

//byusers Remove selected comments of one user
$app->post('/api/comments/byusersremoveofoneuser', 'CommentsController:cByUsersRemoveOfOneUser');
//---ByUsers---

//+++ByPosts+++
//load posts for comments
$app->get('/api/comments/bypostsget', 'CommentsController:cByPostsGet');

//remove comments of selected posts
$app->post('/api/comments/bypostsremove', 'CommentsController:cByPostsRemove');

//block comments of selected posts
$app->post('/api/comments/bypostsblock', 'CommentsController:cByPostsBlock');

//by Post One Load
$app->get('/api/comments/byonepostget', 'CommentsController:cByPostOneGet');

//by Post One Remove
$app->post('/api/comments/byonepostremove', 'CommentsController:cDeleteSelected');

//by Post One Block
$app->post('/api/comments/byonepostblock', 'CommentsController:cByPostOneBlockUser');

//by Post One Find
$app->get('/api/comments/byonepostfind', 'CommentsController:cByPostOneFind');
//---ByPosts---

//+++ByCategories+++
//Load categories
$app->get('/api/comments/bycategoriesget', 'CommentsController:cByCategoriesGet');

//Remove comments of categories
$app->post('/api/comments/bycategoriesremove', 'CommentsController:cByCategoriesRemove');

//Enter category
$app->get('/api/comments/bycategoriesoneloadcomments', 'CommentsController:cByCategoriesEnterCategory');

//Remove comments of one category
$app->post('/api/comments/bycategoryoneremove', 'CommentsController:cByCategoryOneRemove');


//Remove comments user block one category
$app->post('/api/comments/bycategoryoneblockuser', 'CommentsController:cByCategoryOneBlockUser');
//---ByCategories---

//===Comments===



//===User===
//Get
$app->get('/api/user/get', 'UserController:uGet');

//Add
$app->post('/api/user/add', 'UserController:uAdd');

//Update
$app->post('/api/user/update', 'UserController:uUpdate');

//Delete selected
$app->post('/api/user/deleteselected', 'UserController:uDeleteSelected');

//Заблокировать пользователей
$app->post('/api/user/block', 'UserController:uBlock');

//Установить привелегии пользователям
$app->post('/api/user/privelege', 'UserController:uPrivelege');
//===User===



//===Files===
//GetAll
$app->get('/api/files/getall', 'FileController:fGetAll');

//Add
$app->post('/api/files/add', 'FileController:fAdd');

//Update
$app->post('/api/files/update', 'FileController:fUpdate');

//Delete selected
$app->post('/api/files/deleteselected', 'FileController:fDeleteSelected');
//===Files===




//===Post===
//GetAll
$app->get('/api/post/get', 'PostController:pGet');

//GetAll
$app->get('/api/post/find', 'PostController:pFind');

//Add
$app->post('/api/post/add', 'PostController:pAdd');

//Update
$app->post('/api/post/update', 'PostController:pUpdate');

//Delete selected
$app->post('/api/post/deleteselected', 'PostController:pDeleteSelected');

//Paginator data
$app->get('/api/post/paginator', 'PostController:pGetPaginator');

//Load One Post
$app->get('/api/post/editload', 'PostController:pGetOnePost');

//===Post===



//===Langs===
//Get
$app->get('/langs/get', 'LangsController:lGet');

//Add
$app->post('/api/langs/add', 'LangsController:lAdd');

//Delete
$app->post('/api/langs/delete', 'LangsController:lDelete');
//===Langs===



//===Home Client===
//Show main page
$app->get('/', 'HomeController:homeClient');
$app->get('/auth', 'HomeController:homeClient');

//Show admin main page
$app->get('/admin[/{subpath:.*}]', 'HomeController:adminMainPage');


//Show main page with keywords for robot from the different categories
$app->get('/category/{catid}/{postid}', 'HomeController:homeClientRediret');
$app->get('/category/{catid}', 'HomeController:homeClientRediret');
//===Home Client===



//Demo data fill DB
$app->get('/filldemo', 'DemoController:filldemobylink');









//+++Client+++

//Category
$app->get('/api-noauth/category/client-get', 'CategoryController:cClientGet');
$app->get('/api/category/client-get', 'CategoryController:cClientGet');


//Langs
$app->get('/api-noauth/langs/get', 'LangsController:lGet');

//Settings
$app->get('/api-noauth/settings/client-get', 'SettingsController:sSettingsClientGetAll');

//Rss
$app->get('/rss/content[/{subpath:.*}]', 'RSSController:rGet');

//Posts
$app->get('/api/posts/client-get', 'PostController:pClientGet');
$app->get('/api-noauth/posts/client-get', 'PostController:pClientGet');

//Post one
$app->get('/api/posts/client-one-get', 'PostController:pClientOneGet');
$app->get('/api-noauth/posts/client-one-get', 'PostController:pClientOneGet');

//комменты могут оставлять только зареганные пользователи
//для незареганных кнопки скрыть
//Client comments load
$app->get('/api/comments/client-get', 'CommentsController:cClientCommentsLoad');
$app->get('/api-noauth/comments/client-get', 'CommentsController:cClientCommentsLoad');

//Comments answer
$app->post('/api/comments/answer', 'CommentsController:cClientCommentAnswer');
//$app->post('/api-noauth/comments/answer','CommentsController:cClientCommentAnswer');

//Comment Add
$app->post('/api/comments/add', 'CommentsController:cClientCommentAdd');
//$app->post('/api-noauth/comments/add','CommentsController:cClientCommentAdd');


//---Client---



//Install
$app->get('/install', 'DemoController:Install');

//Install again
$app->get('/installredirect', 'DemoController:InstallAgain');

//Mysql Err
$app->get('/mysqlerr', 'DemoController:mysqlerr');

