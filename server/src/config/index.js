import Vue from "vue";

import * as consts from "../../config/env";
export const API_HOST = consts.API_HOST;

export const API_PREFIX = "/api-noauth";
export const API = "/api";

//===auth===
export const LOGIN = API + "/login";
export const LOGOUT = API + "/logout";
export const REGISTER = API + "/register";
export const RESET_PASSWORD = API + "/resetpass";
//===auth===

//Получение категории
export const CATEGORY_GET = API + "/category/get";
//Добавить категорию
export const CATEGORY_ADD = API + "/category/add";
//Обновить категорию
export const CATEGORY_UPDATE = API + "/category/update";
//Удалить выделенную категорию
export const CATEGORY_DELETESELECTED = API + "/category/deleteselected";
//Очистить выделенную категорию
export const CATEGORY_CLEAR = API_PREFIX + "/category/clear";
//Переместить категорию вниз вверх
export const CATEGORY_MOVE = API + "/category/move";

//===Settings===
//Get All
export const SETTINGS_GETALL = API + "/settings/getall";
//Set All
export const SETTINGS_SETALL = API + "/settings/setall";
//Add
export const SETTINGS_SET = API + "/settings/set";

//===Graphs===
//Get graphs
export const LOAD_GRAPHS = API + "/diagram/load";
//===Graphs===

//===User===
//Get
export const USER_GET = API + "/user/get";
//Add
export const USER_ADD = API + "/user/add";
//Update
export const USER_UPDATE = API + "/user/update";
//Delete selected
export const USER_DELETESELECTED = API + "/user/deleteselected";
//users block
export const USER_BLOCK = API + "/user/block";
//users privelege
export const USERS_PRIVELEGE = API + "/user/privelege";

//===Comments===
//Update
export const COMMENTS_UPDATE = API + "/comments/update";
//Delete selected
export const COMMENTS_DELETE_SELECTED = API + "/comments/deleteselected";
//All Comments
export const ALL_COMMENTS_GET = API + "/comments/allcomments";
//Block Users
export const COMMENTS_BLOCK_USERS = API + "/comments/blockusers";
//Find All Comments
export const COMMENTS_ALL_FIND = API + "/comments/findallcomments";
//by Users
export const COMMENTS_BYUSERS_GET = API + "/comments/byusers";
//by Users delete comments
export const COMMENTS_OF_USER_DELETE = API + "/comments/byusersdelete";
//by Users block comments
export const COMMENTS_OF_USER_BLOCK = API + "/comments/byusersblock";
//by Users one comment
export const COMMENTS_LOAD_OF_ONE_USER = API + "/comments/byusersloadofoneuser";
//by Users remove comment of one user
export const COMMENTS_REMOVE_OF_ONE_USER =
    API + "/comments/byusersremoveofoneuser";
//by Posts
export const COMMENTS_BY_POSTS_GET = API + "/comments/bypostsget";
//by Posts remove comments
export const COMMENTS_REMOVE_OF_POST = API + "/comments/bypostsremove";
//by Posts block comments
export const COMMENTS_BLOCK_OF_POST = API + "/comments/bypostsblock";

//by Post One Load
export const COMMENTS_BY_ONEPOST_GET = API + "/comments/byonepostget";
//by Post One Remove
export const COMMENTS_REMOVE_OF_ONE_POST = API + "/comments/byonepostremove";
//by Post One Block
export const COMMENTS_OF_ONEPOST_BLOCK = API + "/comments/byonepostblock";
//by Post One Find
export const COMMENTS_BY_ONEPOST_FIND = API + "/comments/byonepostfind";

//by Categories load
export const COMMENTS_BY_CATEGORIES_GET = API + "/comments/bycategoriesget";
//by Categories remove
export const COMMENTS_REMOVE_OF_CATEGORY = API + "/comments/bycategoriesremove";
//by Categories enter category
export const COMMENTS_LOAD_COMMENTS_CATEGORY =
    API + "/comments/bycategoriesoneloadcomments";
//by Category one remove comments
export const COMMENTS_REMOVE_CATEGORY_ONE =
    API + "/comments/bycategoryoneremove";
//by Category one block user
export const COMMENTS_BLOCK_USER_CATEGORY_ONE =
    API + "/comments/bycategoryoneblockuser";

//===Files===
//GetAll
export const FILES_GETALL = API + "/files/getall";
//Add
export const FILES_ADD = API + "/files/add";
//Update
export const FILES_UPDATE = API + "/files/update";
//Delete selected
export const FILES_DELETESELECTED = API + "/files/deleteselected";

//===Post===
//GetAll
export const POST_GET = API + "/post/get";
//Add
export const POST_ADD = API + "/post/add";
//Update
export const POST_UPDATE = API + "/post/update";
//Delete selected
export const POST_DELETESELECTED = API + "/post/deleteselected";
//Данные пагинатора
export const POST_GET_PAGINATOR_DATA = API + "/post/paginator";
//Загрузить запись для правки
export const POST_EDIT_LOAD = API + "/post/editload";
//Вполнить поиск записи
export const POST_FIND = API + "/post/find";

//===Langs===
//Get
export const LANGS_GET = API_PREFIX + "/langs/get";
//Add
export const LANGS_ADD = API + "/langs/add";
//Delete
export const LANGS_DELETE = API + "/langs/delete";

//===RSS===
//Get
export const RSS_LOAD = API + "/rss/load";
//Delete
export const RSS_REMOVE = API + "/rss/delete";
//Add Rss
export const RSS_ADD = API + "/rss/add";
//Update Rss
export const RSS_UPDATE = API + "/rss/update";

//Настройки константы
export const LANGS_SHOW_SWITCHER = "LANGS_SHOW_SWITCHER";

//+++Проверка привелегий
//9-admin access
//8-Manage files
//7-Write categories
//6-Read categories - 0-hide categories
//5-Write users
//4-Read users - 0-hide users
//3-blocked user
//2-Write post
//1-Read post - 0-hide posts

//Read
//9bit Admin access
export function isAdminAccess(privlgs) {
    return privlgs & 0x100 ? true : false;
}
//Write
//9bit Admin access
export function setAdminAccess(privlgs, val) {
    return val ? 0x100 ^ privlgs : 0xff & privlgs;
}

//Read
//8bit Разрешены оперции с файлами
export function isFilesManagement(privlgs) {
    return privlgs & 0x80 ? true : false;
}
//Write
//8bit Разрешены оперции с файлами
export function setFilesManagement(privlgs, val) {
    //return val?0x80^privlgs:0x7F&privlgs;
    return val ? 0x80 ^ privlgs : 0x17f & privlgs;
}

//Read
//7bit Разрешена запись категорий
export function isWriteCategories(privlgs) {
    return privlgs & 0x40 ? true : false;
}
//Write
//7bit Разрешена запись категорий
export function setWriteCategories(privlgs, val) {
    return val ? 0x40 ^ privlgs : 0x1bf & privlgs;
}

//Read
//6bit Разрешено чтение категорий
export function isReadCategories(privlgs) {
    return privlgs & 0x20 ? true : false;
}
//Write
//6bit Разрешено чтение категорий
export function setReadCategories(privlgs, val) {
    return val ? 0x20 ^ privlgs : 0x1df & privlgs;
}

//Read
//5bit Разрешена запись пользователей
export function isWriteUsers(privlgs) {
    return privlgs & 0x10 ? true : false;
}
//Write
//5bit Разрешена запись пользователей
export function setWriteUsers(privlgs, val) {
    return val ? 0x10 ^ privlgs : 0x1ef & privlgs;
}

//Read
//4bit Разрешено чтение пользователей
export function isReadUsers(privlgs) {
    return privlgs & 0x8 ? true : false;
}
//Write
//4bit Разрешено чтение пользователей
export function setReadUsers(privlgs, val) {
    return val ? 0x8 ^ privlgs : 0x1f7 & privlgs;
}

//Read
//3bit Заблокирован пользователь
export function isBlocked(privlgs) {
    return privlgs & 0x4 ? true : false;
}
//Write
//3bit Заблокирован пользователь
export function setBlocked(privlgs, val) {
    return val ? 0x4 ^ privlgs : 0x1fb & privlgs;
}

//Read
//2bit Разрешена запись записей
export function isWritePost(privlgs) {
    return privlgs & 0x2 ? true : false;
}
//Write
//2bit Разрешена запись записей
export function setWritePost(privlgs, val) {
    return val ? 0x2 ^ privlgs : 0x1fd & privlgs;
}

//Read
//1bit Разрешено чтение записей
export function isReadPost(privlgs) {
    return privlgs & 0x1 ? true : false;
}
//Write
//1bit Разрешено чтение записей
export function setReadPost(privlgs, val) {
    return val ? 0x1 ^ privlgs : 0x1fe & privlgs;
}

//Объект к плоскому массиву
export function ObjectToPlainArray(objErrors) {
    let strOut = "";
    for (let itm in objErrors) {
        let arrVals = objErrors[itm];
        for (let j = 0; j < arrVals.length; j++)
            strOut += itm + ": " + arrVals[j] + "<br>";
    }
    return strOut;
}

//Выдать форматированную ошибку
export function getErrorType(err) {
    //Unknown error
    let er = {
        typ: -1,
        message: err
    };

    //string
    if (typeof err == "string")
        er = {
            typ: 0,
            message: err
        };

    if (typeof err == "object") {
        //Slim error
        let msgs = Vue._.get(err, "body.error", -1);
        if (msgs != -1 && msgs.hasOwnProperty("length")) {
            let msgsStr = "";
            msgs.map(itm => {
                if (itm.hasOwnProperty("message"))
                    msgsStr += itm.message + "\n";
                if (itm.hasOwnProperty("line"))
                    msgsStr += " - line:" + itm.line + "\n";
            });
            er = {
                typ: 4,
                message: msgsStr
            };
        }

        //No server connection
        if (msgs == -1 && err.hasOwnProperty("ok") && !err.ok) {
            er = {
                typ: 1,
                message: "Server_is_not_connected"
            };
        }

        //Server validator error
        if (err.hasOwnProperty("validatorErr")) {
            let msgStr = "";
            for (let itm in err)
                if (itm != "validatorErr" && itm.hasOwnProperty("length")) {
                    let itmOne = err[itm];
                    itmOne.map(el => {
                        msgStr += "<br>" + itm + ":" + el;
                    });
                }
            er = {
                typ: 2,
                message: msgStr
            };
        }

        //Token expired
        let status = Vue._.get(err, "body.status", -1);
        if (status != -1)
            er = {
                typ: 3,
                message: "refreshAccessToken"
            };
    }

    return er;
}
