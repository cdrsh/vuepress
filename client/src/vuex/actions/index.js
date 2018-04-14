import * as consts from "../constants";
import Vue from "vue";
import * as conf from "../../config";
import VueNotifications from "vue-notifications";
import * as langs from "../../langs";
let localStorage = require("store");

export default {
    //Logout
    logout({ commit }, obj) {
        let ro = {
            url: conf.LOGOUT,
            method: "post",
            params: {},
            env: {},
            r: obj.r,
            headers: {
                headers: { Authorization: "Bearer " + localStorage.get("at") }
            },
            commit: function() {},

            init: function(commit, obj, env) {
                this.params = obj;
                this.commit = commit;
                this.env = env;
            },

            onSuccess: function(response) {
                //Server error
                if (response.data.status == 0) throw response.data.err;

                if (response.data.status == 1) {
                    //Login success - remember user
                    this.commit(consts.LOGOUT_SUCCESS);

                    this.r.push("/auth");
                } else throw "Error";
            },

            onError: function(err) {
                let er = conf.getErrorType(err);

                switch (er.typ) {
                    //No server connection
                    case 1:
                        VueNotifications.error({
                            message: this.env.getters.tr(
                                "Server_is_not_connected"
                            )
                        });
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_logout") +
                                ": " +
                                er.message
                        });
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_logout")
                        });
                        break;
                }
                obj.r.push("/auth");
            }
        };

        let user = localStorage.get("user");
        let id = user !== undefined && user.id != undefined ? user.id : -1;
        ro.init(commit, { usrid: id }, this);
        Vue.http
            .post(ro.url, ro.params, ro.headers)
            .then(
                response => {
                    ro.onSuccess(response);
                },
                err => {
                    throw err;
                }
            )
            .catch(error => {
                ro.onError(error);
            });
    },

    //Enter by local storage
    loginByToken({ commit }, obj) {
        commit(consts.LOGIN_SUCCESS, obj);
    },

    //Login
    login({ commit }, obj) {
        //Set move indicator
        commit(consts.LOGIN_INDICATOR, true);

        Vue.http
            .post(conf.LOGIN, obj.user)
            .then(
                response => {
                    //Server error
                    if (response.data.status == 0) throw response.data.err;

                    if (response.data.status == 1) {
                        //Вход успешен запомнить юзера
                        commit(consts.LOGIN_SUCCESS, response.data);

                        //Сбросить индикатор входа
                        commit(consts.LOGIN_INDICATOR, false);

                        obj.r.push("/");
                    } else throw "Error";
                },

                //Server error technical
                err => {
                    throw err;
                }
            )
            .catch(
                //Errors collect
                err => {
                    let er = conf.getErrorType(err);

                    switch (er.typ) {
                        //No server connection
                        case 1:
                            VueNotifications.error({
                                message: this.getters.tr(
                                    "Server_is_not_connected"
                                )
                            });
                            //Сбросить индикатор входа
                            commit(consts.LOGIN_INDICATOR, false);
                            break;

                        //string
                        case 0:
                        //Server validator error
                        case 2:
                        //Slim error
                        case 4:
                            VueNotifications.error({
                                message:
                                    this.getters.tr("Error_login") +
                                    ": " +
                                    er.message
                            });
                            //Сбросить индикатор входа
                            commit(consts.LOGIN_INDICATOR, false);
                            break;

                        //Unknown error
                        default:
                            VueNotifications.error({
                                message: this.getters.tr("Error_login")
                            });
                            //Сбросить индикатор входа
                            commit(consts.LOGIN_INDICATOR, false);
                            break;
                    }
                }
            );
    },

    //Load settings
    loadSettings({ commit }, obj) {
        return new Promise((resolve, reject) => {
            if (this.getters.getSettingsLoaded) resolve();
            Vue.http
                .get(conf.SETTINGS_GET_CLIENT)
                .then(
                    response => {
                        //Server error
                        if (response.data.status == 0) throw response.data.err;

                        //Success loaded
                        if (response.data.status == 1) {
                            //Save settings
                            this.commit(
                                consts.SETTING_LOAD_SUCCESS,
                                response.data.settings
                            );
                            resolve();
                        } else throw "Error";
                    },
                    err => {
                        throw err;
                    }
                )
                .catch(err => {
                    let er = conf.getErrorType(err);

                    switch (er.typ) {
                        //No server connection
                        case 1:
                            VueNotifications.error({
                                message: this.getters.tr(
                                    "Server_is_not_connected"
                                )
                            });
                            break;

                        //string
                        case 0:
                        //Server validator error
                        case 2:
                        //Slim error
                        case 4:
                            VueNotifications.error({
                                message:
                                    this.getters.tr("Error_load_settings") +
                                    ": " +
                                    er.message
                            });
                            break;

                        //Unknown error
                        default:
                            VueNotifications.error({
                                message: this.getters.tr("Error_load_settings")
                            });
                            break;
                    }

                    resolve();
                });
        });
    },

    //Load language from localStorage
    setCurrentLangAction({ commit }, code) {
        commit(consts.SET_CURRENT_LANG, code);
    },

    //Set Access Token
    setAToken({ commit }, obj) {
        commit(consts.SET_TOKEN_SUCCESS, obj);
    },

    //Reset password
    resetPasswordAction({ commit }, obj) {
        //Set users block indicator
        commit(consts.RESET_INDICATOR, true);

        Vue.http
            .post(conf.RESET_PASSWORD, { email: obj.email })
            .then(
                response => {
                    //Server error
                    if (response.data.status == 0) throw response.data.err;

                    //Responce success
                    if (response.data.status == 1) {
                        //Reset load indicator
                        commit(consts.RESET_INDICATOR, false);
                        VueNotifications.success({
                            message: this.env.getters.tr("Reset_pass_link_sent")
                        });
                        obj.r.push("/auth");
                    } else throw "Error";
                },

                //Server error technical
                err => {
                    throw err;
                }
            )
            .catch(
                //Errors collect
                err => {
                    let er = conf.getErrorType(err);

                    switch (er.typ) {
                        //No server connection
                        case 1:
                            VueNotifications.error({
                                message: this.env.getters.tr(
                                    "Server_is_not_connected"
                                )
                            });
                            //Reset load indicator RSS
                            this.commit(consts.RESET_INDICATOR, false);
                            break;

                        //string
                        case 0:
                        //Server validator error
                        case 2:
                        //Slim error
                        case 4:
                            VueNotifications.error({
                                message:
                                    this.env.getters.tr("Error_load_graphs") +
                                    ": " +
                                    er.message
                            });
                            //Reset load indicator RSS
                            this.commit(consts.RESET_INDICATOR, false);
                            break;

                        //Token expired
                        case 3:
                            this.env.dispatch("refreshAccessToken", ro);
                            break;

                        //Unknown error
                        default:
                            VueNotifications.error({
                                message: this.env.getters.tr(
                                    "Error_load_graphs"
                                )
                            });
                            //Reset load indicator RSS
                            this.commit(consts.RESET_INDICATOR, false);
                            break;
                    }
                }
            );
    },

    //Registration
    register({ commit }, obj) {
        //Set users block indicator
        commit(consts.REGISTRATION_INDICATOR, true);
        obj.addUser.devid =
            navigator.userAgent !== undefined
                ? navigator.userAgent
                : "Unknown device";

        //Add user to Server
        Vue.http
            .post(conf.REGISTER, obj.addUser)
            .then(
                response => {
                    //Server error
                    if (response.data.status == 0) throw response.data.err;

                    //Registration success
                    if (response.data.status == 1) {
                        //Reset load indicator
                        commit(consts.REGISTRATION_INDICATOR, false);

                        obj.r.push("/regaccept");
                    } else throw "Error";
                },

                //Server error technical
                err => {
                    throw err;
                }
            )
            .catch(
                //Errors collect
                err => {
                    let er = conf.getErrorType(err);

                    switch (er.typ) {
                        //No server connection
                        case 1:
                            VueNotifications.error({
                                message: this.getters.tr(
                                    "Server_is_not_connected"
                                )
                            });
                            //Reset load indicator
                            commit(consts.REGISTRATION_INDICATOR, false);
                            break;

                        //string
                        case 0:
                        //Server validator error
                        case 2:
                        //Slim error
                        case 4:
                            VueNotifications.error({
                                message:
                                    this.getters.tr("Error_registration") +
                                    ": " +
                                    er.message
                            });
                            //Reset load indicator
                            commit(consts.REGISTRATION_INDICATOR, false);
                            break;

                        //Unknown error
                        default:
                            VueNotifications.error({
                                message: this.getters.tr("Error_registration")
                            });
                            //Reset load indicator
                            commit(consts.REGISTRATION_INDICATOR, false);
                            break;
                    }
                }
            );
    },

    //Refresh access token by refresh token
    refreshAccessToken({ commit }, obj) {
        let rt = localStorage.get("rt");

        //Get new token
        Vue.http
            .post("/api/token", { rt: rt })
            .then(response => {
                if (response.data.status == 0) {
                    VueNotifications.success({
                        message: obj.env.getters.tr("Please_login_again")
                    });
                    this.dispatch("logout", { r: obj.r });
                }

                //Token update success, repeat request
                if (response.data.status == 1) {
                    localStorage.set("at", response.data.at);

                    //Set new Access token
                    obj.headers = {
                        headers: {
                            Authorization: "Bearer " + response.data.at
                        }
                    };

                    //Repeat post
                    if (obj.method == "post") {
                        Vue.http
                            .post(obj.url, obj.params, obj.headers)
                            .then(
                                response => {
                                    obj.onSuccess(response);
                                },
                                //Server error technical
                                err => {
                                    throw err;
                                }
                            )
                            .catch(error => {
                                obj.onError(error);
                            });
                    }

                    //Repeat get
                    if (obj.method == "get") {
                        Vue.http
                            .get(obj.url, {
                                params: obj.params,
                                headers: obj.headers.headers
                            })
                            .then(
                                response => {
                                    obj.onSuccess(response);
                                },
                                //Server error technical
                                err => {
                                    throw err;
                                }
                            )
                            .catch(error => {
                                obj.onError(error);
                            });
                    }
                }
            })
            .catch(error => {
                VueNotifications.success({
                    message: obj.env.getters.tr("Please_login_again")
                });
                this.dispatch("logout", { r: obj.r });
            });
    }
};
