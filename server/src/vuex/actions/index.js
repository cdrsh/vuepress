import * as consts from "../constants";
import Vue from "vue";
import * as conf from "../../config";
import VueNotifications from "vue-notifications";
import * as langs from "../../langs";
var localStorage = require("store");

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
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                if (response.data.status == 1) {
                    //Logout success
                    this.commit(consts.LOGOUT_SUCCESS);

                    this.r.push("/admin/auth");
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
                obj.r.push("/admin/auth");
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

    //Login by token from localStorage
    loginByToken({ commit }, obj) {
        commit(consts.LOGIN_SUCCESS, obj);
    },

    //Login
    login({ commit }, obj) {
        //Set move indicator
        commit(consts.LOGIN_INDICATOR, true);

        obj.user.isadmin = 1;
        Vue.http
            .post(conf.LOGIN, obj.user)
            .then(
                response => {
                    //Server error technical
                    if (response.data.status == 0) throw response.data.err;

                    if (response.data.status == 1) {
                        //Login success
                        commit(consts.LOGIN_SUCCESS, response.data);

                        //Reset login indicator
                        commit(consts.LOGIN_INDICATOR, false);

                        obj.r.push("/admin/dashboard");
                    } else throw "Error";
                },

                //Server error technial
                err => {
                    throw err;
                }
            )
            .catch(
                //Error collect
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
                            //Reset login indicator
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
                            //Reset login indicator
                            commit(consts.LOGIN_INDICATOR, false);
                            break;

                        //Token expired
                        case 3:
                            this.env.dispatch("refreshAccessToken", ro);
                            break;

                        //Unknown error
                        default:
                            VueNotifications.error({
                                message: this.getters.tr("Error_login")
                            });
                            //Reset login indicator
                            commit(consts.LOGIN_INDICATOR, false);
                            break;
                    }
                }
            );
    },

    //Save settings
    saveSettings({ commit }, obj) {
        let ro = {
            url: conf.SETTINGS_SETALL,
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
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Setting save success
                if (response.data.status == 1) {
                    //Save settings in store
                    commit(consts.SETTING_LOAD_SUCCESS, this.params.settings);
                    if (this.params.reset)
                        VueNotifications.success({
                            message: this.env.getters.tr(
                                "Setting_reset_success"
                            )
                        });
                    else
                        VueNotifications.success({
                            message: this.env.getters.tr("Setting_save_success")
                        });
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
                                this.env.getters.tr("Error_save_settings") +
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
                            message: this.env.getters.tr("Error_save_settings")
                        });
                        break;
                }
            }
        };

        ro.init(commit, { settings: obj.settings, reset: obj.reset }, this);
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

    //Load settings
    loadSettings({ commit }, obj) {
        if (this.getters.getSettingsLoaded) return;

        let ro = {
            url: conf.SETTINGS_GETALL,
            method: "get",
            params: {},
            env: {},
            r: obj.r,
            headers: {
                Authorization: "Bearer " + localStorage.get("at")
            },
            commit: function() {},

            init: function(commit, obj, env) {
                this.params = obj;
                this.commit = commit;
                this.env = env;
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Settings load success
                if (response.data.status == 1) {
                    //Save settings in store
                    this.commit(
                        consts.SETTING_LOAD_SUCCESS,
                        response.data.settings
                    );
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
                                this.env.getters.tr("Error_load_settings") +
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
                            message: this.env.getters.tr("Error_load_settings")
                        });
                        break;
                }
            }
        };

        ro.init(commit, {}, this);
        Vue.http
            .get(ro.url, { headers: ro.headers })
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

    //Load language from localstorage
    setCurrentLangAction({ commit }, code) {
        commit(consts.SET_CURRENT_LANG, code);
    },

    //Set token
    setAToken({ commit }, obj) {
        commit(consts.SET_TOKEN_SUCCESS, obj);
    },

    //Reset password
    resetPasswordAction({ commit }, obj) {
        //Set reset indicator
        commit(consts.RESET_INDICATOR, true);

        Vue.http
            .post(conf.RESET_PASSWORD, { email: obj.email })
            .then(
                response => {
                    //Server error technical
                    if (response.data.status == 0) throw response.data.err;

                    if (response.data.status == 1) {
                        //Reset - reset indicator
                        commit(consts.RESET_INDICATOR, false);

                        VueNotifications.success({
                            message: this.getters.tr("To_reset_pass_lnk_sent")
                        });

                        obj.r.push("/admin/auth");
                    } else throw "Error";
                },

                //Server error technial
                err => {
                    throw err;
                }
            )
            .catch(
                //Error collect
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
                            //Reset - reset indicator
                            commit(consts.RESET_INDICATOR, false);
                            break;

                        //string
                        case 0:
                        //Server validator error
                        case 2:
                        //Slim error
                        case 4:
                            VueNotifications.error({
                                message:
                                    this.getters.tr("Error_reset_password") +
                                    ": " +
                                    er.message
                            });
                            //Reset - reset indicator
                            commit(consts.RESET_INDICATOR, false);
                            break;

                        //Token expired
                        case 3:
                            this.env.dispatch("refreshAccessToken", ro);
                            break;

                        //Unknown error
                        default:
                            VueNotifications.error({
                                message: this.getters.tr("Error_reset_password")
                            });
                            //Reset - reset indicator
                            commit(consts.RESET_INDICATOR, false);
                            break;
                    }
                }
            );
    },

    //Registration
    register({ commit }, obj) {
        //Set registration indicator
        commit(consts.REGISTRATION_INDICATOR, true);
        obj.addUser.devid =
            navigator.userAgent !== undefined
                ? navigator.userAgent
                : "Unknown device";

        Vue.http
            .post(conf.REGISTER, obj.addUser)
            .then(
                response => {
                    //Server error technical
                    if (response.data.status == 0) throw response.data.err;

                    //Registration success
                    if (response.data.status == 1) {
                        //Reset registration indicator
                        commit(consts.REGISTRATION_INDICATOR, false);

                        obj.r.push("/regaccept");
                    } else throw "Error";
                },

                //Server error technial
                err => {
                    throw err;
                }
            )
            .catch(
                //Error collect
                err => {
                    console.log(err);
                    let er = conf.getErrorType(err);

                    switch (er.typ) {
                        //No server connection
                        case 1:
                            VueNotifications.error({
                                message: this.getters.tr(
                                    "Server_is_not_connected"
                                )
                            });

                            //Reset registration indicator
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

                            //Reset registration indicator
                            commit(consts.REGISTRATION_INDICATOR, false);
                            break;

                        //Unknown error
                        default:
                            VueNotifications.error({
                                message: this.getters.tr("Error_registration")
                            });

                            //Reset registration indicator
                            commit(consts.REGISTRATION_INDICATOR, false);
                            break;
                    }
                }
            );
    },

    //Update access token
    refreshAccessToken({ commit }, obj) {
        let rt = localStorage.get("rt");

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

                    obj.headers = {
                        headers: {
                            Authorization: "Bearer " + response.data.at
                        }
                    };

                    if (obj.method == "post") {
                        Vue.http
                            .post(obj.url, obj.params, obj.headers)
                            .then(
                                response => {
                                    obj.onSuccess(response);
                                },

                                //Server error technial
                                err => {
                                    throw err;
                                }
                            )
                            .catch(error => {
                                obj.onError(error);
                            });
                    }
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
                                //Server error technial
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
