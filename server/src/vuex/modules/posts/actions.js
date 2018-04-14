import * as consts from "./constants";
import Vue from "vue";
import VueNotifications from "vue-notifications";
import * as conf from "../../../config";
var localStorage = require("store");

export default {
    //Reset post indicators
    resetPostIndicators({ commit }) {
        return new Promise(resolve => {
            commit(consts.POSTS_INDICATOR_LOADING, false);
            commit(consts.POSTS_INDICATOR_REMOVING, false);
            commit(consts.POST_EDIT_LOAD_INDICATOR, false);
            commit(consts.POST_INDICATOR_SAVING, false);
            commit(consts.POST_INDICATOR_ADDING, false);
            commit(consts.POST_INDICATOR_FINDING, false);
            commit(consts.SHOW_EDIT_POST, false);
            commit(consts.SHOW_ADD_POST, false);
            resolve();
        });
    },

    //+++Posts navigation+++

    //Load paginator data
    loadPaginatorData({ commit }, obj) {
        return new Promise((resolve, reject) => {
            let ro = {
                url: conf.POST_GET_PAGINATOR_DATA,
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
                    //Server error technical
                    if (response.data.status == 0)
                        return Promise.reject(response.data.err);

                    //Posts list load success
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
                                    this.env.getters.tr(
                                        "Error_load_paginator_data"
                                    ) +
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
                                    "Error_load_paginator_data"
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

    //Load posts
    loadPosts({ commit }, obj) {
        let ro = {
            url: conf.POST_GET,
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
                this.params = {
                    itms: this.env.getters.getItemsPostPerPage,
                    page: obj.pgNum,
                    catid: this.env.getters.getCatParentPostId
                };

                //Set load posts indicator
                this.commit(consts.POSTS_INDICATOR_LOADING, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Posts load success
                if (response.data.status == 1) {
                    //Add checkbox
                    response.data.posts.map(itm => {
                        itm.chkd = false;
                    });

                    //Save posts in store
                    this.commit(consts.POSTS_LOAD, response.data.posts);

                    //Set current page number
                    this.commit(consts.SET_POSTLIST_PGNUM, this.params.page);

                    //Reset load posts indicator
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
                        //Reset load posts indicator
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
                        //Reset load posts indicator
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
                        //Reset load posts indicator
                        this.commit(consts.POSTS_INDICATOR_LOADING, false);
                        break;
                }
            }
        };

        ro.init(commit, obj, this);
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

    //Show edit post
    showEditPost({ commit }, vis) {
        commit(consts.SHOW_EDIT_POST, vis);
    },

    //Show add post dialog
    showAddPost({ commit }, vis) {
        commit(consts.SHOW_ADD_POST, vis);
    },

    //Remove post
    removePost({ commit }, obj) {
        let ro = {
            url: conf.POST_DELETESELECTED,
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
                this.params = { ids: obj.ids };

                //Set remove post indicator
                this.commit(consts.POSTS_INDICATOR_REMOVING, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Post removed success
                if (response.data.status == 1) {
                    this.commit(consts.REMOVE_POSTS, this.params.ids);

                    //Reload paginator data
                    this.env.dispatch("loadPaginatorData", { r: this.r });

                    //Reset remove post indicator
                    this.commit(consts.POSTS_INDICATOR_REMOVING, false);

                    //Reload posts list by page number
                    this.env.dispatch("loadPosts", {
                        pgNum: 1,
                        r: this.r
                    });

                    //Reload find posts by page number
                    let pgData = this.env.getters.getPostPaginatorData;
                    this.env.dispatch("findPost", {
                        data: {
                            findTxt: pgData.postFindTxt,
                            findBy: pgData.postFindBy,
                            pgNum: pgData.postListFoundPgNum
                        },
                        r: this.r
                    });

                    VueNotifications.success({
                        message: this.env.getters.tr("Posts_remove_success")
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
                        //Reset remove post indicator
                        this.commit(consts.POSTS_INDICATOR_REMOVING, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_remove_posts") +
                                ": " +
                                er.message
                        });
                        //Reset remove post indicator
                        this.commit(consts.POSTS_INDICATOR_REMOVING, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_remove_posts")
                        });
                        //Reset remove post indicator
                        this.commit(consts.POSTS_INDICATOR_REMOVING, false);
                        break;
                }
            }
        };

        ro.init(commit, { ids: obj.ids }, this);
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

    //Remove posts
    removePosts({ commit }, obj) {
        let posts = this.getters.getPostList;
        let ids = [];
        for (let i = 0; i < posts.length; i++)
            if (posts[i].chkd) ids.push(posts[i].id);
        if (ids.length > 0)
            this.dispatch("removePost", {
                ids: ids,
                r: obj.r
            });
        else
            VueNotifications.error({
                message: this.getters.tr("Posts_not_selected_to_delete")
            });
    },

    //Enter category on post dialogs
    enterPostCategory({ commit }, catObj) {
        commit(consts.POST_CATEGORY_ENTER, catObj);
    },

    //Set categories page number on post dialogs
    setPostCategoriesPageNum({ commit }, PageNum) {
        commit(consts.SET_POST_CATEGORIES_PAGE_NUM, PageNum);
    },

    //Category of post selected
    selectPostCategory({ commit }, obj) {
        commit(consts.SELECT_POST_CATEGORY, obj.id);

        //Reload paginator data
        this.dispatch("loadPaginatorData", { r: obj.r });

        //Reload post list
        this.dispatch("loadPosts", { pgNum: 1, r: obj.r });
    },
    //---Posts navigation---

    //+++Edit post+++
    //Prepare to Edit post
    editPost({ commit }, obj) {
        let ro = {
            url: conf.POST_EDIT_LOAD,
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
                this.params = { id: obj.id };

                //Set load post data to edit indicator
                commit(consts.POST_EDIT_LOAD_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Posts list load success
                if (response.data.status == 1) {
                    if (response.data.arr.length > 0) {
                        let obj = response.data.arr[0];
                        let lngsArr = this.env.getters.getLangsContentSelected;
                        for (let i = 0; i < lngsArr.length; i++) {
                            if (obj["title_" + lngsArr[i].code] == null)
                                obj["title_" + lngsArr[i].code] = "";
                            if (obj["txt_" + lngsArr[i].code] == null)
                                obj["txt_" + lngsArr[i].code] = "";
                        }
                        obj.categories = response.data.arr_categories;

                        for (let i = 0; i < obj.categories.length; i++) {
                            let ufldsArr = [];
                            let names = response.data.arr_usr_fld_names.filter(
                                itm => itm.catid == obj.categories[i].id
                            );
                            obj.categories[i].ufldids =
                                obj.categories[i].ufldids == ""
                                    ? []
                                    : obj.categories[i].ufldids.split(":");
                            if (obj.categories[i].ufldids.length > 0)
                                obj.categories[i].ufldids.splice(0, 1);
                            obj.categories[i].ufldvls =
                                obj.categories[i].ufldvls == ""
                                    ? []
                                    : obj.categories[i].ufldvls.split(":!:");
                            if (obj.categories[i].ufldvls.length > 0)
                                obj.categories[i].ufldvls.splice(0, 1);
                            if (names.length > 0) {
                                for (
                                    let j = 0;
                                    j < obj.categories[i].ufldids.length;
                                    j++
                                ) {
                                    let oneName = names.filter(
                                        itm =>
                                            itm.id ==
                                            obj.categories[i].ufldids[j]
                                    );
                                    if (oneName.length > 0) {
                                        ufldsArr.push({
                                            namef: oneName[0].namef,
                                            catid: oneName[0].catid,
                                            fldid: oneName[0].id,
                                            valf: obj.categories[i].ufldvls[j]
                                        });
                                    }
                                }
                                obj.categories[i].ufldsArr = Vue._.uniqBy(
                                    ufldsArr,
                                    "fldid"
                                );
                                delete obj.categories[i].ufldids;
                                delete obj.categories[i].ufldvls;
                            }
                        }

                        this.commit(consts.POST_PREPARE_EDIT, obj);
                        this.env.dispatch("showEditPost", true);
                    }

                    //Reset load post data to edit indicator
                    this.commit(consts.POST_EDIT_LOAD_INDICATOR, false);
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
                        //Reset load post data to edit indicator
                        this.commit(consts.POST_EDIT_LOAD_INDICATOR, false);
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
                        //Reset load post data to edit indicator
                        this.commit(consts.POST_EDIT_LOAD_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_load_onepost")
                        });
                        //Reset load post data to edit indicator
                        this.commit(consts.POST_EDIT_LOAD_INDICATOR, false);
                        break;
                }
            }
        };

        ro.init(commit, { id: obj.id }, this);
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

    //Set category select dialog show/hide
    setEdPostSelCatVis({ commit }, vis) {
        commit(consts.SET_VIS_ED_POST_SEL_CAT_VIS, vis);
    },

    //Categories selected to edit post
    selectCategoryPostEdit({ commit }, categories) {
        commit(consts.SELECT_CATEGORY_POST_EDIT, categories);
    },

    //Save/Publish post
    savePost({ commit }, obj) {
        let ro = {
            url: conf.POST_UPDATE,
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
                this.params = obj.postEdit;

                //Set post saving indicator
                commit(consts.POST_INDICATOR_SAVING, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Post list load success
                if (response.data.status == 1) {
                    //Load paginator data
                    this.env.dispatch("loadPaginatorData", { r: this.r });

                    //Load posts
                    this.env.dispatch("loadPosts", {
                        pgNum: this.env.getters.getPostListPgNum,
                        r: this.r
                    });

                    //Load find posts
                    let pgData = this.env.getters.getPostPaginatorData;
                    this.env.dispatch("findPost", {
                        data: {
                            findTxt: pgData.postFindTxt,
                            findBy: pgData.postFindBy,
                            pgNum: pgData.postListFoundPgNum
                        },
                        r: this.r
                    });

                    if (this.params.ispub == 1)
                        VueNotifications.success({
                            message: this.env.getters.tr("Post_publish_success")
                        });
                    else
                        VueNotifications.success({
                            message: this.env.getters.tr("Post_save_success")
                        });

                    //Сбросить индикатор сохранения
                    this.commit(consts.POST_INDICATOR_SAVING, false);
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
                        //Reset post saving indicator
                        this.commit(consts.POST_INDICATOR_SAVING, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_save_onepost") +
                                ": " +
                                er.message
                        });
                        //Reset post saving indicator
                        this.commit(consts.POST_INDICATOR_SAVING, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_save_onepost")
                        });
                        //Reset post saving indicator
                        this.commit(consts.POST_INDICATOR_SAVING, false);
                        break;
                }
            }
        };

        ro.init(commit, { postEdit: obj.postEdit }, this);
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
    //---Edit post---

    //+++Add post
    addPost({ commit }, obj) {
        let ro = {
            url: conf.POST_ADD,
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

                //Set post adding indicator
                this.commit(consts.POST_INDICATOR_ADDING, true);

                obj.user = localStorage.get("user");
                this.params = obj;
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Post added success
                if (response.data.status == 1) {
                    //Load post paginator data
                    this.env.dispatch("loadPaginatorData", { r: this.r });

                    //Load posts
                    this.env.dispatch("loadPosts", {
                        pgNum: this.env.getters.getPostListPgNum,
                        r: this.r
                    });

                    if (this.params.ispub == 1)
                        VueNotifications.success({
                            message: this.env.getters.tr("Post_publish_success")
                        });
                    else
                        VueNotifications.success({
                            message: this.env.getters.tr("Post_save_success")
                        });

                    //Reset post adding indicator
                    this.commit(consts.POST_INDICATOR_ADDING, false);
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
                        //Reset post adding indicator
                        this.commit(consts.POST_INDICATOR_ADDING, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_add_post") +
                                ": " +
                                er.message
                        });
                        //Reset post adding indicator
                        this.commit(consts.POST_INDICATOR_ADDING, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_add_post")
                        });
                        //Reset post adding indicator
                        this.commit(consts.POST_INDICATOR_ADDING, false);
                        break;
                }
            }
        };

        ro.init(commit, obj.postAdd, this);
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

    //Find posts
    findPost({ commit }, obj) {
        let ro = {
            url: conf.POST_FIND,
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

                this.params.langCode = this.env.getters.getContentLang;
                this.params.itemsPerPage = this.env.getters.getPostPaginatorData.postItemsPerPageFound;

                //Set find post indicator
                this.commit(consts.POST_INDICATOR_FINDING, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Posts found success
                if (response.data.status == 1) {
                    //Save posts in store
                    this.commit(consts.SET_FIND_TEXT_POST, {
                        postListFound: response.data.posts,
                        postListFoundPgnum: this.params.pgNum,
                        itemsCount: response.data.itemsCount,
                        findTxt: this.params.findTxt,
                        findBy: this.params.findBy
                    });

                    //Reset find post indicator
                    this.commit(consts.POST_INDICATOR_FINDING, false);
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
                        //Reset find post indicator
                        this.commit(consts.POST_INDICATOR_FINDING, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_find_posts") +
                                ": " +
                                er.message
                        });
                        //Reset find post indicator
                        this.commit(consts.POST_INDICATOR_FINDING, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_find_posts")
                        });
                        //Reset find post indicator
                        this.commit(consts.POST_INDICATOR_FINDING, false);
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
    }
};
