import * as consts from "./constants";
import Vue from "vue";
import VueNotifications from "vue-notifications";
import * as conf from "../../../config";
var localStorage = require("store");

export default {
    //Load posts by page num
    loadPosts({ commit }, obj) {
        let ro = {
            url: this.getters.API + conf.POST_CLIENT_GET,
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

                //Set load indicator
                this.commit(consts.POSTS_INDICATOR_LOADING, true);
            },

            onSuccess: function(response) {
                //Server error
                if (response.data.status == 0) throw response.data.err;

                //Posts load success
                if (response.data.status == 1) {
                    //Save posts
                    this.commit(consts.POSTS_LOAD_SUCCESS, response.data.posts);

                    //Reset load indicator
                    this.commit(consts.POSTS_INDICATOR_LOADING, false);
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

                        //Reset load indicator
                        this.commit(consts.POSTS_INDICATOR_LOADING, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_load_posts") +
                                ": " +
                                er.message
                        });
                        //Reset load indicator
                        this.commit(consts.POSTS_INDICATOR_LOADING, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_load_posts")
                        });
                        //Reset load indicator
                        this.commit(consts.POSTS_INDICATOR_LOADING, false);
                        break;
                }
            }
        };

        let pars = this.getters.getPostParams;

        if (obj.catId !== undefined) this.dispatch("setCatId", obj.catId);

        if (obj.clearBefore !== undefined && obj.clearBefore) {
            pars.count = 0;
            this.commit(consts.POSTS_CLEAR);
        }

        if (this.getters.getFullLoaded && obj.clearBefore == undefined) return;

        let params = {
            count: pars.count,
            itemsPerPage: pars.itemsPerPage,
            catId: obj.catId == undefined ? pars.catId : obj.catId,
            clearBefore: obj.clearBefore == undefined ? false : true,
            lng: this.getters.getContentLang,
            findText: obj.findText || ""
        };

        ro.init(commit, params, this);
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

    //Save find text
    setPostFindText({ commit }, findText) {
        this.commit(consts.SET_POST_FIND_TEXT, findText);
    },

    //Get active one post
    setPostActive({ commit }, obj) {
        //let post = this.getters.getPostActiveById(obj.id);
        let post = -1;

        //If post not loaded
        if (post == -1) {
            let ro = {
                url: this.getters.API + conf.POSTONE_CLIENT_GET,
                method: "get",
                params: {},
                env: {},
                r: obj.r,
                headers: {
                    headers: {
                        Authorization: "Bearer " + localStorage.get("at")
                    }
                },
                commit: function() {},

                init: function(commit, obj, env) {
                    this.commit = commit;
                    this.env = env;
                    this.params = obj;

                    //Set load indicator
                    this.commit(consts.POSTONE_INDICATOR_LOADING, true);
                },

                onSuccess: function(response) {
                    //Server error
                    if (response.data.status == 0) throw response.data.err;

                    //One post load success
                    if (response.data.status == 1) {
                        //Save post
                        this.commit(
                            consts.POSTONE_LOAD_SUCCESS,
                            response.data.post
                        );

                        //Reset load indicator
                        this.commit(consts.POSTONE_INDICATOR_LOADING, false);
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
                            //Reset load indicator
                            this.commit(
                                consts.POSTONE_INDICATOR_LOADING,
                                false
                            );
                            break;

                        //string
                        case 0:
                        //Server validator error
                        case 2:
                        //Slim error
                        case 4:
                            VueNotifications.error({
                                message:
                                    this.env.getters.tr("Error_load_onepost") +
                                    ": " +
                                    er.message
                            });
                            //Reset load indicator
                            this.commit(
                                consts.POSTONE_INDICATOR_LOADING,
                                false
                            );
                            break;

                        //Token expired
                        case 3:
                            this.env.dispatch("refreshAccessToken", ro);
                            break;

                        //Unknown error
                        default:
                            VueNotifications.error({
                                message: this.env.getters.tr(
                                    "Error_load_onepost"
                                )
                            });
                            //Reset load indicator
                            this.commit(
                                consts.POSTONE_INDICATOR_LOADING,
                                false
                            );
                            break;
                    }
                }
            };

            let catId = this.getters.getCatId;
            if (obj.catid !== catId) catId = obj.catid;
            ro.init(
                commit,
                {
                    id: obj.id,
                    catId: catId,
                    lng: this.getters.getContentLang
                },
                this
            );
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
        } else
            //Post already loaded
            this.commit(consts.POSTONE_LOAD_SUCCESS, post);
    },

    //Load posts paginator
    loadPaginatorData({ commit }, obj) {
        return new Promise((resolve, reject) => {
            let ro = {
                url: this.getters.API + conf.POST_GET_PAGINATOR_DATA,
                method: "get",
                params: {},
                env: {},
                r: obj.r,
                headers: {
                    headers: {
                        Authorization: "Bearer " + localStorage.get("at")
                    }
                },
                commit: function() {},

                init: function(commit, obj, env) {
                    this.commit = commit;
                    this.env = env;
                    this.params = { catid: obj };
                },

                onSuccess: function(response) {
                    //Server error
                    if (response.data.status == 0)
                        return Promise.reject(response.data.err);

                    //Paginator data load success
                    if (response.data.status == 1) {
                        this.commit(
                            consts.POST_GET_PAGINATOR_DATA,
                            response.data.cnt
                        );
                        return Promise.resolve();
                    } else return Promise.reject();
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
                                    this.env.getters.tr("Error_load_onepost") +
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
                                message: this.env.getters.tr(
                                    "Error_load_onepost"
                                )
                            });
                            break;
                    }
                    resolve(true);
                }
            };

            ro.init(commit, this.getters.getCatParentPostId, this);
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
        });
    },

    //Переключить панель поиска записей
    toggleSearchPanel({ commit }, par) {
        this.commit(consts.TOGGLE_SEARCH_PANEL, par);
    }
};
