import * as consts from "./constants";
import Vue from "vue";
import VueNotifications from "vue-notifications";
import * as conf from "../../../config";
var localStorage = require("store");

export default {
    //Set current content language
    setCurrentLang({ commit, rootState }, code) {
        commit(consts.SET_CURRENT_LANG_ACTIVE, {
            code: code,
            rootState: rootState
        });
    },

    //Load all languages
    loadLangs({ commit, rootState }) {
        return new Promise((resolve, reject) => {
            //Set load indicator
            commit(consts.LANGS_LOADING_INDICATOR, true);

            Vue.http
                .get(conf.LANGS_GET)
                .then(
                    response => {
                        //Reset load indicator
                        commit(consts.LANGS_LOADING_INDICATOR, false);

                        //Server error
                        if (response.data.status == 0)
                            return Promise.reject(response.data.err);

                        //Languages load success
                        if (response.data.status == 1) {
                            //Read languages from localStorage
                            let curclientlng = localStorage.get("curclientlng");
                            if (curclientlng == undefined) {
                                curclientlng = this.getters.getBrowserLang;
                                localStorage.set("curclientlng", curclientlng);
                            }

                            //Save loaded data
                            commit(consts.LANGS_LOAD_SUCCESS, {
                                langs: response.data.langs,
                                curclientlng: curclientlng,
                                rootState: rootState
                            });
                            return Promise.resolve();
                        } else return Promise.reject();
                    },

                    //Server error technical
                    err => Promise.reject(err)
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

                            //Reset load indicator
                            commit(consts.LANGS_LOADING_INDICATOR, false);
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

                            //Reset load indicator
                            commit(consts.LANGS_LOADING_INDICATOR, false);
                            break;

                        //Unknown error
                        default:
                            VueNotifications.error({
                                message: this.getters.tr("Error_load_langs")
                            });

                            //Reset load indicator
                            commit(consts.LANGS_LOADING_INDICATOR, false);
                            break;
                    }

                    Promise.resolve();
                });

            resolve(true);
        });
    },

    //Content language changed
    setContentLang({ commit }, code) {
        localStorage.set("curclientlng", code);
        commit(consts.SET_CONTENT_LANG, code);
    }
};
