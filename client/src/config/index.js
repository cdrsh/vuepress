import Vue from "vue";

import * as consts from "../../config/env";
export const HOST = consts.HOST;

//===auth===
export const LOGIN = "/api/login";
export const LOGOUT = "/api/logout";
export const REGISTER = "/api/register";
export const RESET_PASSWORD = "/api/resetpass";
//===auth===

//Получение категории
export const CATEGORY_GET = "/category/client-get";

//Получение записей
export const POST_CLIENT_GET = "/posts/client-get";

//Получение одной записи
export const POSTONE_CLIENT_GET = "/posts/client-one-get";

//Получение комментов
export const GET_COMMENTS_CLIENT = "/comments/client-get";

//Ответ на коммент
export const ANSWER_COMMENT_CLIENT = "/comments/answer";

//Добавление коммента
export const ADD_COMMENT_CLIENT = "/comments/add";

//Загрузка настроек
export const SETTINGS_GET_CLIENT = "/api-noauth/settings/client-get";

//===Langs===
//Get
export const LANGS_GET = "/api-noauth/langs/get";

//+++Проверка привелегий

//8-Manage files
//7-Write categories
//6-Read categories - 0-hide categories
//5-Write users
//4-Read users - 0-hide users
//3-blocked user
//2-Write post
//1-Read post - 0-hide posts

//Read
//8bit Разрешены оперции с файлами
export function isFilesManagement(privlgs) {
    return privlgs & 0x80 ? true : false;
}
//Write
//8bit Разрешены оперции с файлами
export function setFilesManagement(privlgs, val) {
    return val ? 0x80 ^ privlgs : 0x7f & privlgs;
}

//Read
//7bit Разрешена запись категорий
export function isWriteCategories(privlgs) {
    return privlgs & 0x40 ? true : false;
}
//Write
//7bit Разрешена запись категорий
export function setWriteCategories(privlgs, val) {
    return val ? 0x40 ^ privlgs : 0xbf & privlgs;
}

//Read
//6bit Разрешено чтение категорий
export function isReadCategories(privlgs) {
    return privlgs & 0x20 ? true : false;
}
//Write
//6bit Разрешено чтение категорий
export function setReadCategories(privlgs, val) {
    return val ? 0x20 ^ privlgs : 0xdf & privlgs;
}

//Read
//5bit Разрешена запись пользователей
export function isWriteUsers(privlgs) {
    return privlgs & 0x10 ? true : false;
}
//Write
//5bit Разрешена запись пользователей
export function setWriteUsers(privlgs, val) {
    return val ? 0x10 ^ privlgs : 0xef & privlgs;
}

//Read
//4bit Разрешено чтение пользователей
export function isReadUsers(privlgs) {
    return privlgs & 0x8 ? true : false;
}
//Write
//4bit Разрешено чтение пользователей
export function setReadUsers(privlgs, val) {
    return val ? 0x8 ^ privlgs : 0xf7 & privlgs;
}

//Read
//3bit Заблокирован пользователь
export function isBlocked(privlgs) {
    return privlgs & 0x4 ? true : false;
}
//Write
//3bit Заблокирован пользователь
export function setBlocked(privlgs, val) {
    return val ? 0x4 ^ privlgs : 0xfb & privlgs;
}

//Read
//2bit Разрешена запись записей
export function isWritePost(privlgs) {
    return privlgs & 0x2 ? true : false;
}
//Write
//2bit Разрешена запись записей
export function setWritePost(privlgs, val) {
    return val ? 0x2 ^ privlgs : 0xfd & privlgs;
}

//Read
//1bit Разрешено чтение записей
export function isReadPost(privlgs) {
    return privlgs & 0x1 ? true : false;
}
//Write
//1bit Разрешено чтение записей
export function setReadPost(privlgs, val) {
    return val ? 0x1 ^ privlgs : 0xfe & privlgs;
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
