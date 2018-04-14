import * as consts from "./constants";
import Vue from "vue";
import VueNotifications from "vue-notifications";
import * as conf from "../../../config";
var localStorage = require("store");

//Convert object to plain array
let ObjectToPlainArray = objErrors => {
    let strOut = "";
    for (let itm in objErrors) {
        let arrVals = objErrors[itm];
        for (let j = 0; j < arrVals.length; j++) strOut += arrVals[j] + "<br>";
    }
    return strOut;
};

export default {
    //Set current UI language
    setCurrentLang({ commit, rootState }, code) {
        commit(consts.SET_CURRENT_LANG_ACTIVE, {
            code: code,
            rootState: rootState
        });
    },

    //Load all languages
    loadLangs({ commit, rootState }) {
        return new Promise((resolve, reject) => {
            //Set load languages indicator
            commit(consts.LANGS_LOADING_INDICATOR, true);

            Vue.http
                .get(conf.LANGS_GET)
                .then(
                    response => {
                        //Reset load languages indicator
                        commit(consts.LANGS_LOADING_INDICATOR, false);

                        //Server error technical
                        if (response.data.status == 0)
                            return Promise.reject(response.data.err);

                        //Languages load success
                        if (response.data.status == 1) {
                            //Save languages list
                            commit(consts.LANGS_LOAD_SUCCESS, {
                                langs: response.data.langs,
                                rootState: rootState
                            });

                            return Promise.resolve();
                        } else return Promise.reject();
                    },

                    //Server error technial
                    err => Promise.reject(err)
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
                                break;

                            //string
                            case 0:
                            //Server validator error
                            case 2:
                            //Slim error
                            case 4:
                                VueNotifications.error({
                                    message:
                                        this.getters.tr("Error_load_langs") +
                                        ": " +
                                        er.message
                                });
                                break;

                            //Unknown error
                            default:
                                VueNotifications.error({
                                    message: this.getters.tr("Error_load_langs")
                                });
                                break;
                        }
                        //Reset load languages indicator
                        commit(consts.LANGS_LOADING_INDICATOR, false);
                        resolve(true);
                    }
                );

            resolve(true);
        });
    },

    //Remove language
    removeLang({ commit }, obj) {
        let ro = {
            url: conf.LANGS_DELETE,
            method: "post",
            params: {},
            env: {},
            r: obj.r,
            headers: {
                headers: { Authorization: "Bearer " + localStorage.get("at") }
            },
            commit: function() {},

            init: function(commit, obj, env) {
                this.commit = commit;
                this.env = env;
                this.params = obj;

                //Set languages remove indicator
                this.commit(consts.LANGS_REMOVE_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Languages remove success
                if (response.data.status == 1) {
                    //Reset languages remove indicator
                    this.commit(consts.LANGS_REMOVE_INDICATOR, false);

                    //Remove languages in store
                    this.commit(consts.LANGS_REMOVE, obj.lng);

                    VueNotifications.success({
                        message: this.env.getters.tr("Language_delete_success")
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
                        //Reset languages remove indicator
                        this.commit(consts.LANGS_REMOVE_INDICATOR, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_remove_lang") +
                                ": " +
                                er.message
                        });
                        //Reset languages remove indicator
                        this.commit(consts.LANGS_REMOVE_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_remove_lang")
                        });
                        //Reset languages remove indicator
                        this.commit(consts.LANGS_REMOVE_INDICATOR, false);
                        break;
                }
            }
        };

        ro.init(commit, obj.lng, this);
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

    //Add language
    addLang({ commit }, obj) {
        let ro = {
            url: conf.LANGS_ADD,
            method: "post",
            params: {},
            env: {},
            r: obj.r,
            headers: {
                headers: { Authorization: "Bearer " + localStorage.get("at") }
            },
            commit: function() {},

            init: function(commit, obj, env) {
                this.commit = commit;
                this.env = env;
                this.params = obj;

                //Set languages add indicator
                commit(consts.LANGS_ADD_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Reset languages add indicator
                this.commit(consts.LANGS_ADD_INDICATOR, false);

                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Language add success
                if (response.data.status == 1) {
                    //Add languages in store
                    this.commit(consts.LANGS_ADD, this.params);

                    VueNotifications.success({
                        message: this.env.getters.tr("Language_added_success")
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
                        //Reset languages add indicator
                        this.commit(consts.LANGS_ADD_INDICATOR, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_add_lang") +
                                ": " +
                                er.message
                        });
                        //Reset languages add indicator
                        this.commit(consts.LANGS_ADD_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_add_lang")
                        });
                        //Reset languages add indicator
                        this.commit(consts.LANGS_ADD_INDICATOR, false);
                        break;
                }
            }
        };

        ro.init(commit, obj.lng, this);
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

    //Set switcher setting show/hide language switcher on client
    setBShowContentLang({ commit }, obj) {
        let ro = {
            url: conf.SETTINGS_SET,
            method: "post",
            params: {},
            env: {},
            r: obj.r,
            headers: {
                headers: { Authorization: "Bearer " + localStorage.get("at") }
            },
            commit: function() {},

            init: function(commit, obj, env) {
                this.commit = commit;
                this.env = env;
                this.params = obj;
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Setting set success
                if (response.data.status == 1) {
                    //Set setting in store
                    this.commit(consts.SET_B_SHOW_CONTENT_LANG, this.params);
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

        ro.init(commit, { kee: conf.LANGS_SHOW_SWITCHER, vaa: obj.val }, this);
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

    //Content language change
    setContentLang({ commit }, objCat) {
        commit(consts.SET_CONTENT_LANG, objCat);
    }
};
