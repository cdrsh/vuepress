import * as consts from "./constants";
import Vue from "vue";
import VueNotifications from "vue-notifications";
import * as conf from "../../../config";
var localStorage = require("store");

export default {
    //Rss reset actions
    rssActionsReset({ commit }) {
        commit(consts.RSS_RESET_INDICATOR);
    },

    //Load RSS
    loadRSS({ commit }, obj) {
        let ro = {
            url: conf.RSS_LOAD,
            method: "get",
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

                //Set loading rss indicator
                commit(consts.RSS_LOAD_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Rss load success
                if (response.data.status == 1) {
                    //Convert categories ids to names
                    let lng = this.env.getters.getContentLang;
                    response.data.rss.map(itm => {
                        itm.category = itm.category.split(";");
                        itm.categoryNames = [];
                        itm.category.map(catItm => {
                            let catsFound = this.env.getters.getCategoryById(
                                catItm
                            );
                            if (catsFound.length > 0)
                                itm.categoryNames.push(
                                    catsFound[0]["name_" + lng]
                                );
                        });
                        itm.categoryNames = itm.categoryNames.join(", ");
                    });

                    //Rss load success
                    this.commit(consts.RSS_LOAD_SUCCESS, response.data);

                    //Reset loading rss indicator
                    this.commit(consts.RSS_LOAD_INDICATOR, false);
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
                        //Reset loading rss indicator
                        this.commit(consts.RSS_LOAD_INDICATOR, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_load_rss") +
                                ": " +
                                er.message
                        });
                        //Reset loading rss indicator
                        this.commit(consts.RSS_LOAD_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_load_rss")
                        });
                        //Reset loading rss indicator
                        this.commit(consts.RSS_LOAD_INDICATOR, false);
                        break;
                }
            }
        };

        ro.init(commit, obj.data, this);
        Vue.http
            .get(ro.url, { params: ro.params, ...ro.headers })
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

    //Remove RSS
    removeRSS({ commit }, obj) {
        let ro = {
            url: conf.RSS_REMOVE,
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
                this.params = { ids: obj };

                //Set removing rss indicator
                this.commit(consts.RSS_REMOVE_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Rss remove success
                if (response.data.status == 1) {
                    //Reload rss list
                    this.env.dispatch("loadRSS", {
                        data: {
                            pgNum: this.env.getters.getRssPgNum,
                            itemsPerPage: this.env.getters.getRssItemsPerPage,
                            findTxt: this.env.getters.getRssFindTxt
                        },
                        r: this.r
                    });

                    VueNotifications.success({
                        message: this.env.getters.tr("Rss_delete_success")
                    });

                    //Reset removing rss indicator
                    this.commit(consts.RSS_REMOVE_INDICATOR, false);
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
                        //Reset removing rss indicator
                        this.commit(consts.RSS_REMOVE_INDICATOR, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_remove_rss") +
                                ": " +
                                er.message
                        });
                        //Reset removing rss indicator
                        this.commit(consts.RSS_REMOVE_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_remove_rss")
                        });
                        //Reset removing rss indicator
                        this.commit(consts.RSS_REMOVE_INDICATOR, false);
                        break;
                }
            }
        };

        ro.init(commit, obj.ids, this);
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

    //Add RSS
    addRSS({ commit }, obj) {
        let ro = {
            url: conf.RSS_ADD,
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

                //Set adding rss indicator
                this.commit(consts.RSS_ADD_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Rss added success
                if (response.data.status == 1) {
                    //Reload rss list
                    this.env.dispatch("loadRSS", {
                        data: {
                            pgNum: this.env.getters.getRssPgNum,
                            itemsPerPage: this.env.getters.getRssItemsPerPage,
                            findTxt: this.env.getters.getRssFindTxt
                        },
                        r: this.r
                    });

                    VueNotifications.success({
                        message: this.env.getters.tr("Rss_added_success")
                    });

                    //Reset adding rss indicator
                    this.commit(consts.RSS_ADD_INDICATOR, false);
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
                        //Reset adding rss indicator
                        this.commit(consts.RSS_ADD_INDICATOR, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_add_rss") +
                                ": " +
                                er.message
                        });
                        //Reset adding rss indicator
                        this.commit(consts.RSS_ADD_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_add_rss")
                        });
                        //Reset adding rss indicator
                        this.commit(consts.RSS_ADD_INDICATOR, false);
                        break;
                }
            }
        };

        ro.init(commit, obj.addObj, this);
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

    //Save RSS
    saveRSS({ commit }, obj) {
        let ro = {
            url: conf.RSS_UPDATE,
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

                //Set saving rss indicator
                this.commit(consts.RSS_UPDATE_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Save RSS success
                if (response.data.status == 1) {
                    //Reload rss list
                    this.env.dispatch("loadRSS", {
                        data: {
                            pgNum: this.env.getters.getRssPgNum,
                            itemsPerPage: this.env.getters.getRssItemsPerPage,
                            findTxt: this.env.getters.getRssFindTxt
                        },
                        r: this.r
                    });

                    VueNotifications.success({
                        message: this.env.getters.tr("Rss_saved_success")
                    });

                    //Reset saving rss indicator
                    this.commit(consts.RSS_UPDATE_INDICATOR, false);
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
                        //Reset saving rss indicator
                        this.commit(consts.RSS_UPDATE_INDICATOR, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_save_rss") +
                                ": " +
                                er.message
                        });
                        //Reset saving rss indicator
                        this.commit(consts.RSS_UPDATE_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_save_rss")
                        });
                        //Reset saving rss indicator
                        this.commit(consts.RSS_UPDATE_INDICATOR, false);
                        break;
                }
            }
        };

        ro.init(commit, obj.editObj, this);
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
    }
};
