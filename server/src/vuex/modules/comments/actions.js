import * as consts from "./constants";
import Vue from "vue";
import VueNotifications from "vue-notifications";
import * as conf from "../../../config";
var localStorage = require("store");

//Sort function by num
let compare = function(a, b) {
    if (parseInt(a.num) < parseInt(b.num)) return -1;
    if (parseInt(a.num) > parseInt(b.num)) return 1;
    return 0;
};

//Convert array to tree
let parseComentsToTree = (arr, arrTree) => {
    arrTree.map(itm => {
        for (let i = 0; i < arr.length; i++)
            if (arr[i].pid == itm.id) {
                arr[i].lvl = itm.lvl + 1;
                if (arr[i].lvl > 10) arr[i].lvl = 10;
                itm.children.push(arr[i]);
            }
        if (itm.children.length > 0) parseComentsToTree(arr, itm.children);
        itm.children = itm.children.sort(compare);
    });
};

//Convert tree to array
let parseComentsToArr = (commentsAsArr, commentsAsTree) => {
    for (let i = 0; i < commentsAsTree.length; i++) {
        commentsAsArr.push(commentsAsTree[i]);
        if (commentsAsTree[i].children.length > 0)
            parseComentsToArr(commentsAsArr, commentsAsTree[i].children);
    }
};

export default {
    //Load all comments unfiltered
    loadAllComments({ commit }, obj) {
        let ro = {
            url: conf.ALL_COMMENTS_GET,
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

                if (obj.pgNum == 0) obj.pgNum = 1;
                //Don't load same page twice
                if (
                    this.env.getters.getAllCommentsLoaded &&
                    this.env.getters.getAllCommentsPgNum == obj.pgNum
                )
                    return false;

                //Set all comments load indicator
                this.commit(consts.COMMENTS_LOAD_INDICATOR, true);
                obj.itemsPerPage = this.env.getters.getAllCommentsItemsPerPage;
                this.params = obj;
                return true;
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //All comments load success
                if (response.data.status == 1) {
                    response.data.comments.map(itm => {
                        itm.itmChk = false;
                        itm.lvl = 0;
                        if (itm.usrid != -1)
                            itm.uname =
                                itm.nick != ""
                                    ? itm.nick
                                    : itm.fname != ""
                                        ? itm.fname
                                        : itm.mname != ""
                                            ? itm.mname
                                            : itm.lname != ""
                                                ? itm.lname
                                                : "noname";
                        else itm.uname = "User removed";
                        delete itm.nick;
                        delete itm.fname;
                        delete itm.mname;
                        delete itm.lname;

                        itm.isBlocked = conf.isBlocked(itm.privlgs);
                    });

                    let commentsAsTree = [];
                    response.data.comments.map(itm => {
                        if (itm.pid == -1) commentsAsTree.push(itm);
                        itm.children = [];
                    });
                    commentsAsTree = commentsAsTree.sort(compare);
                    parseComentsToTree(response.data.comments, commentsAsTree);

                    let commentsAsArr = [];
                    parseComentsToArr(commentsAsArr, commentsAsTree);

                    commentsAsArr.map(itm => {
                        delete itm.children;
                    });

                    this.commit(consts.COMMENTS_LOAD_SUCCESS, {
                        comments: commentsAsArr,
                        pgNum: parseInt(response.data.pgNum),
                        itemsCount: response.data.itemsCount
                    });

                    //Reset load indicator
                    this.commit(consts.COMMENTS_LOAD_INDICATOR, false);
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
                        this.commit(consts.COMMENTS_LOAD_INDICATOR, false);
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
                        this.commit(consts.COMMENTS_LOAD_INDICATOR, false);
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
                        this.commit(consts.COMMENTS_LOAD_INDICATOR, false);
                        break;
                }
            }
        };

        if (!ro.init(commit, { pgNum: obj.pgNum }, this)) return;

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

    //Block authors of checked all comments
    blockUsersCheckedComment({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_BLOCK_USERS,
            method: "post",
            params: {},
            commentIds: [],
            env: {},
            r: obj.r,
            headers: {
                headers: { Authorization: "Bearer " + localStorage.get("at") }
            },
            commit: function() {},

            init: function(commit, obj, env) {
                this.commit = commit;
                this.env = env;

                //Установить индикатор блокировки пользователей
                //Set users blocking indicator
                this.commit(consts.COMMENTS_BLOCKUSERS_INDICATOR, true);

                this.commentIds = obj.ids;
                let usrIds = [];
                obj.ids.map(cmntId => {
                    this.env.getters.getAllComments.map(itm => {
                        if (itm.id == cmntId) usrIds.push(itm.usrid);
                    });
                });

                this.params = { ids: usrIds };
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Users blocked success
                if (response.data.status == 1) {
                    this.commit(
                        consts.COMMENTS_BLOCKUSERS_SUCCESS,
                        this.params.ids
                    );

                    //Reset users blocking indicator
                    this.commit(consts.COMMENTS_BLOCKUSERS_INDICATOR, false);

                    VueNotifications.success({
                        message: this.env.getters.tr("Users_block_success")
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
                        //Reset users blocking indicator
                        this.commit(
                            consts.COMMENTS_BLOCKUSERS_INDICATOR,
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
                                this.env.getters.tr("Error_block_users") +
                                ": " +
                                er.message
                        });
                        //Reset users blocking indicator
                        this.commit(
                            consts.COMMENTS_BLOCKUSERS_INDICATOR,
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
                            message: this.env.getters.tr("Error_block_users")
                        });
                        //Reset users blocking indicator
                        this.commit(
                            consts.COMMENTS_BLOCKUSERS_INDICATOR,
                            false
                        );
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

    //Remove comments
    removeComments({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_DELETE_SELECTED,
            method: "post",
            params: {},
            commentIds: [],
            env: {},
            r: obj.r,
            headers: {
                headers: { Authorization: "Bearer " + localStorage.get("at") }
            },
            commit: function() {},

            init: function(commit, obj, env) {
                this.commit = commit;
                this.env = env;

                //Set comments removing indicator
                this.commit(consts.COMMENTS_REMOVE_INDICATOR, true);

                let ids = [];
                let comments = this.env.getters.getAllComments;
                obj.commentIds.map(cmntIds => {
                    for (let i = 0; i < comments.length; i++) {
                        if (cmntIds == comments[i].id) {
                            ids.push({
                                id: cmntIds,
                                leafid: comments[i].leafid
                            });
                            break;
                        }
                    }
                });
                this.params = { ids: ids };
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Comments removed success
                if (response.data.status == 1) {
                    //Accept reload comments page
                    this.commit(consts.COMMENTS_REMOVE_SUCCESS);

                    //Reset comments removing indicator
                    this.commit(consts.COMMENTS_REMOVE_INDICATOR, false);

                    //Reload comments pages
                    this.env.dispatch("loadAllComments", {
                        pgNum: this.env.getters.getAllCommentsPgNum
                    });

                    VueNotifications.success({
                        message: this.env.getters.tr("Comments_delete_success")
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
                        //Reset comments removing indicator
                        this.commit(consts.COMMENTS_REMOVE_INDICATOR, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_remove_comments") +
                                ": " +
                                er.message
                        });
                        //Reset comments removing indicator
                        this.commit(consts.COMMENTS_REMOVE_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr(
                                "Error_remove_comments"
                            )
                        });
                        //Reset comments removing indicator
                        this.commit(consts.COMMENTS_REMOVE_INDICATOR, false);
                        break;
                }
            }
        };

        ro.init(commit, { commentIds: obj.ids }, this);
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

    //Prepare comment to edit
    prepareEditComment({ commit }, id) {
        commit(consts.COMMENTS_PREPARE_EDIT, id);
    },

    //Prepare filtered comment to edit
    prepareEditCommentFiltered({ commit }, id) {
        commit(consts.COMMENTS_PREPARE_EDIT_FILTERED, id);
    },

    //Save comment
    saveComment({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_UPDATE,
            method: "post",
            params: {},
            commentIds: [],
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

                //Set comment save indicator
                this.commit(consts.COMMENTS_SAVE_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Comment saved success
                if (response.data.status == 1) {
                    this.commit(consts.COMMENTS_SAVE_SUCCESS, this.params);

                    //Reset comment save indicator
                    this.commit(consts.COMMENTS_SAVE_INDICATOR, false);

                    VueNotifications.success({
                        message: this.env.getters.tr("Comments_save_success")
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
                        //Reset comment save indicator
                        this.commit(consts.COMMENTS_SAVE_INDICATOR, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_save_comments") +
                                ": " +
                                er.message
                        });
                        //Reset comment save indicator
                        this.commit(consts.COMMENTS_SAVE_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_save_comments")
                        });
                        //Reset comment save indicator
                        this.commit(consts.COMMENTS_SAVE_INDICATOR, false);
                        break;
                }
            }
        };

        ro.init(commit, obj.comment, this);
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

    //Find all comments
    findAllComments({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_ALL_FIND,
            method: "get",
            params: {},
            commentIds: [],
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

                //Set find comments load indicator
                this.commit(consts.COMMENTS_FIND_INDICATOR, true);

                //Prepage query params
                let params = {
                    itemsPerPage: this.env.getters.getAllCommentsItemsPerPage,
                    pgNum: obj.pgNum
                };
                if (obj.findTxt != "")
                    (params["findTxt"] = obj.findTxt), (this.params = params);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Comments found success
                if (response.data.status == 1) {
                    response.data.comments.map(itm => {
                        itm.itmChk = false;
                        itm.lvl = 0;
                        if (itm.usrid != -1)
                            itm.uname =
                                itm.nick != ""
                                    ? itm.nick
                                    : itm.fname != ""
                                        ? itm.fname
                                        : itm.mname != ""
                                            ? itm.mname
                                            : itm.lname != ""
                                                ? itm.lname
                                                : "noname";
                        else itm.uname = "User removed";
                        delete itm.nick;
                        delete itm.fname;
                        delete itm.mname;
                        delete itm.lname;

                        itm.privlgs = parseInt(itm.privlgs);
                        itm.isBlocked = conf.isBlocked(itm.privlgs);
                    });

                    //Save comments in store
                    this.commit(consts.COMMENTS_FIND_SUCCESS, {
                        comments: response.data.comments,
                        pgNum: parseInt(response.data.pgNum),
                        itemsCount: response.data.itemsCount,
                        findTxt: this.params.findTxt
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
                        //Reset find comments load indicator
                        this.commit(consts.COMMENTS_FIND_INDICATOR, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_find_comments") +
                                ": " +
                                er.message
                        });
                        //Reset find comments load indicator
                        this.commit(consts.COMMENTS_FIND_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_find_comments")
                        });
                        //Reset find comments load indicator
                        this.commit(consts.COMMENTS_FIND_INDICATOR, false);
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

    //Remove comments in found
    removeCommentsFound({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_DELETE_SELECTED,
            method: "post",
            params: {},
            commentIds: [],
            env: {},
            r: obj.r,
            headers: {
                headers: { Authorization: "Bearer " + localStorage.get("at") }
            },
            commit: function() {},

            init: function(commit, obj, env) {
                this.commit = commit;
                this.env = env;

                //Set remove comments in found indicator
                this.commit(consts.COMMENTS_REMOVE_INDICATOR, true);

                let ids = [];
                let comments = this.env.getters.getAllCommentsFound;
                obj.ids.map(cmntIds => {
                    for (let i = 0; i < comments.length; i++)
                        if (cmntIds == comments[i].id) {
                            ids.push({
                                id: cmntIds,
                                leafid: comments[i].leafid
                            });
                            break;
                        }
                });

                if (ids.length == 0) {
                    VueNotifications.error({
                        message: this.env.getters.tr("Comments_not_selected")
                    });
                    return false;
                }

                this.params = { ids: ids };
                return true;
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Comments removed success
                if (response.data.status == 1) {
                    //Requery page of found comments
                    this.env.dispatch("findAllComments", {
                        findTxt: this.env.getters.getFindTxt,
                        pgNum: this.env.getters.getAllCommentsFoundPgNum
                    });

                    //Reset remove comments in found indicator
                    this.commit(consts.COMMENTS_REMOVE_INDICATOR, false);

                    VueNotifications.success({
                        message: this.env.getters.tr("Comments_delete_success")
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
                        //Reset remove comments in found indicator
                        this.commit(consts.COMMENTS_REMOVE_INDICATOR, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_remove_comments") +
                                ": " +
                                er.message
                        });
                        //Reset remove comments in found indicator
                        this.commit(consts.COMMENTS_REMOVE_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr(
                                "Error_remove_comments"
                            )
                        });
                        //Reset remove comments in found indicator
                        this.commit(consts.COMMENTS_REMOVE_INDICATOR, false);
                        break;
                }
            }
        };

        if (!ro.init(commit, { ids: obj.ids }, this)) return;

        Vue.http
            .post(conf.COMMENTS_DELETE_SELECTED, ro.params, ro.headers)
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

    //Load users and comments count
    //byUsers view
    loadbyUsers({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_BYUSERS_GET,
            method: "get",
            params: {},
            commentIds: [],
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

                //Set users load indicator
                this.commit(consts.COMMENTS_USERSLOAD_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Users loaded success
                if (response.data.status == 1) {
                    response.data.users.map(itm => {
                        itm.itmChk = false;
                        itm.uname =
                            itm.nick != ""
                                ? itm.nick
                                : itm.fname != ""
                                    ? itm.fname
                                    : itm.mname != ""
                                        ? itm.mname
                                        : itm.lname != ""
                                            ? itm.lname
                                            : "noname";
                        itm.uname = itm.uname.substr(0, 1).toUpperCase();
                        itm.isBlocked = conf.isBlocked(itm.privlgs);
                    });

                    //Save users in store
                    this.commit(consts.COMMENTS_USERSLOAD_SUCCESS, {
                        users: response.data.users,
                        pgNum: response.data.pgNum,
                        itemsCount: response.data.itemsCount
                    });

                    //Reset users load indicator
                    this.commit(consts.COMMENTS_USERSLOAD_INDICATOR, false);
                }
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
                        //Reset users load indicator
                        this.commit(consts.COMMENTS_USERSLOAD_INDICATOR, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_load_users") +
                                ": " +
                                er.message
                        });
                        //Reset users load indicator
                        this.commit(consts.COMMENTS_USERSLOAD_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_load_users")
                        });
                        //Reset users load indicator
                        this.commit(consts.COMMENTS_USERSLOAD_INDICATOR, false);
                        break;
                }
            }
        };

        let params = { pgNum: obj.pgNum };
        if (obj.findTxt != undefined) params.findTxt = obj.findTxt;

        ro.init(commit, params, this);
        Vue.http
            .get(ro.url, {
                ...ro.headers,
                params: ro.params
            })
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

    //Remove comments of users
    removeCommentsOfUsers({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_OF_USER_DELETE,
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

                //Set remove comments indicator
                this.commit(consts.COMMENTS_REMOVE_OF_USERS_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Comments removed success
                if (response.data.status == 1) {
                    this.commit(
                        consts.COMMENTS_REMOVE_OF_USERS_SUCCESS,
                        this.params.ids
                    );

                    //Reset remove comments indicator
                    this.commit(
                        consts.COMMENTS_REMOVE_OF_USERS_INDICATOR,
                        false
                    );

                    VueNotifications.success({
                        message: this.env.getters.tr("Comments_delete_success")
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
                        //Reset remove comments indicator
                        this.commit(
                            consts.COMMENTS_REMOVE_OF_USERS_INDICATOR,
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
                                this.env.getters.tr("Error_remove_comments") +
                                ": " +
                                er.message
                        });
                        //Reset remove comments indicator
                        this.commit(
                            consts.COMMENTS_REMOVE_OF_USERS_INDICATOR,
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
                                "Error_remove_comments"
                            )
                        });
                        //Reset remove comments indicator
                        this.commit(
                            consts.COMMENTS_REMOVE_OF_USERS_INDICATOR,
                            false
                        );
                        break;
                }
            }
        };

        if (obj.ids.length == 0) return;
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

    //Block authors comments
    //by Users view
    blockUsersOfComments({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_OF_USER_BLOCK,
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

                //Set blocking authors comments indicator
                this.commit(consts.COMMENTS_BLOCK_OF_USERS_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Authors blocked success
                if (response.data.status == 1) {
                    this.commit(
                        consts.COMMENTS_BLOCK_OF_USERS_SUCCESS,
                        this.params.ids
                    );

                    //Reset blocking authors comments indicator
                    this.commit(
                        consts.COMMENTS_BLOCK_OF_USERS_INDICATOR,
                        false
                    );

                    VueNotifications.success({
                        message: this.env.getters.tr("Users_block_success")
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
                        //Reset blocking authors comments indicator
                        this.commit(
                            consts.COMMENTS_BLOCK_OF_USERS_INDICATOR,
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
                                this.env.getters.tr("Error_block_users") +
                                ": " +
                                er.message
                        });
                        //Reset blocking authors comments indicator
                        this.commit(
                            consts.COMMENTS_BLOCK_OF_USERS_INDICATOR,
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
                            message: this.env.getters.tr("Error_block_users")
                        });
                        //Reset blocking authors comments indicator
                        this.commit(
                            consts.COMMENTS_BLOCK_OF_USERS_INDICATOR,
                            false
                        );
                        break;
                }
            }
        };

        if (obj.ids.length == 0) return;
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

    //Load comments of one user
    //by users view
    loadCommentsOfOneUser({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_LOAD_OF_ONE_USER,
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
                this.params.itemsPerPage = this.env.getters.getAllCommentsItemsPerPage;

                //Set load comments indicator
                this.commit(consts.COMMENTS_LOAD_OF_ONE_USER_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Comments loaded success
                if (response.data.status == 1) {
                    response.data.comments.map(itm => {
                        itm.itmChk = false;
                        itm.lvl = 0;
                        itm.uname =
                            itm.nick != ""
                                ? itm.nick
                                : itm.fname != ""
                                    ? itm.fname
                                    : itm.mname != ""
                                        ? itm.mname
                                        : itm.lname != ""
                                            ? itm.lname
                                            : "noname";
                        delete itm.nick;
                        delete itm.fname;
                        delete itm.mname;
                        delete itm.lname;

                        itm.isBlocked = conf.isBlocked(itm.privlgs);
                    });

                    this.commit(
                        consts.COMMENTS_LOAD_OF_ONE_USER_SUCCESS,
                        response.data
                    );

                    //Reset load comments indicator
                    this.commit(
                        consts.COMMENTS_LOAD_OF_ONE_USER_INDICATOR,
                        false
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
                        //Reset load comments indicator
                        this.commit(
                            consts.COMMENTS_LOAD_OF_ONE_USER_INDICATOR,
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
                                this.env.getters.tr("Error_load_comments") +
                                ": " +
                                er.message
                        });
                        //Reset load comments indicator
                        this.commit(
                            consts.COMMENTS_LOAD_OF_ONE_USER_INDICATOR,
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
                            message: this.env.getters.tr("Error_load_comments")
                        });
                        //Reset load comments indicator
                        this.commit(
                            consts.COMMENTS_LOAD_OF_ONE_USER_INDICATOR,
                            false
                        );
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

    //Remove comments of one user
    removeCommentsOfOneUser({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_REMOVE_OF_ONE_USER,
            method: "post",
            params: {},
            env: {},
            r: obj.r,
            usrid: 0,
            headers: {
                headers: { Authorization: "Bearer " + localStorage.get("at") }
            },
            commit: function() {},

            init: function(commit, obj, env) {
                this.commit = commit;
                this.env = env;

                //Set remove comments indicator
                this.commit(consts.COMMENTS_REMOVE_OF_ONE_USER_INDICATOR, true);

                //Prepare array with id,leafid comment
                let ids = [];
                let comments = this.env.getters.getByUsersOneComment;
                obj.ids.map(cmntIds => {
                    for (let i = 0; i < comments.length; i++) {
                        if (cmntIds == comments[i].id) {
                            ids.push({
                                id: cmntIds,
                                leafid: comments[i].leafid
                            });
                            break;
                        }
                    }
                });
                this.params = { ids: ids };
                this.usrid = obj.usrid;
                this.findTxt = obj.findTxt;
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Comments removed success
                if (response.data.status == 1) {
                    //Remove commnets in store
                    this.commit(consts.COMMENTS_REMOVE_OF_ONE_USER_SUCCESS, {
                        cnt: this.params.ids.length,
                        usrid: this.usrid
                    });

                    //Reload comments page
                    this.env.dispatch("loadCommentsOfOneUser", {
                        data: {
                            pgNum: 1,
                            usrid: this.usrid,
                            findTxt: this.findTxt
                        },
                        r: this.r
                    });

                    //Reset remove comments indicator
                    this.commit(
                        consts.COMMENTS_REMOVE_OF_ONE_USER_INDICATOR,
                        false
                    );

                    VueNotifications.success({
                        message: this.env.getters.tr("Comments_delete_success")
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
                        //Reset remove comments indicator
                        this.commit(
                            consts.COMMENTS_REMOVE_OF_ONE_USER_INDICATOR,
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
                                this.env.getters.tr("Error_remove_comments") +
                                ": " +
                                er.message
                        });
                        //Reset remove comments indicator
                        this.commit(
                            consts.COMMENTS_REMOVE_OF_ONE_USER_INDICATOR,
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
                                "Error_remove_comments"
                            )
                        });
                        //Reset remove comments indicator
                        this.commit(
                            consts.COMMENTS_REMOVE_OF_ONE_USER_INDICATOR,
                            false
                        );
                        break;
                }
            }
        };

        if (obj.ids.length == 0) return;
        ro.init(commit, obj, this);
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

    //Begin edit comment of one user
    //By user view
    prepareEditCommentOfUser({ commit }, id) {
        commit(consts.COMMENTS_PREPARE_EDIT_OF_USER, id);
    },

    //Save comment of one user
    //By user view
    saveCommentOfUser({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_UPDATE,
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

                //Set comment save indicator
                this.commit(consts.COMMENTS_SAVE_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Comment save success
                if (response.data.status == 1) {
                    this.commit(
                        consts.COMMENTS_SAVE_SUCCESS_OF_USER,
                        this.params
                    );

                    //Reset comment save indicator
                    this.commit(consts.COMMENTS_SAVE_INDICATOR, false);

                    VueNotifications.success({
                        message: this.env.getters.tr("Comments_save_success")
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
                        //Reset comment save indicator
                        this.commit(consts.COMMENTS_SAVE_INDICATOR, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_save_comments") +
                                ": " +
                                er.message
                        });
                        //Reset comment save indicator
                        this.commit(consts.COMMENTS_SAVE_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_save_comments")
                        });
                        //Reset comment save indicator
                        this.commit(consts.COMMENTS_SAVE_INDICATOR, false);
                        break;
                }
            }
        };

        ro.init(commit, obj, this);
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

    //Find comments of one post
    //by Posts view
    findCommentsOfOnePost({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_BY_ONEPOST_FIND,
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

                //Set load comments indicator
                this.commit(
                    consts.COMMENTS_BY_POSTS_GET_ONEPOST_INDICATOR,
                    true
                );
                obj.itemsPerPage = this.env.getters.getByPostsItemsPerPage;
                this.params = obj;
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Comments loaded success
                if (response.data.status == 1) {
                    response.data.comments.map(itm => {
                        itm.itmChk = false;
                        itm.lvl = 0;
                        itm.uname =
                            itm.nick != ""
                                ? itm.nick
                                : itm.fname != ""
                                    ? itm.fname
                                    : itm.mname != ""
                                        ? itm.mname
                                        : itm.lname != ""
                                            ? itm.lname
                                            : "noname";
                        delete itm.nick;
                        delete itm.fname;
                        delete itm.mname;
                        delete itm.lname;

                        itm.isBlocked = conf.isBlocked(itm.privlgs);
                    });

                    //Save comments in store
                    this.commit(consts.COMMENTS_BY_POSTS_FIND_ONEPOST_SUCCESS, {
                        comments: response.data.comments,
                        pgNum: parseInt(response.data.pgNum),
                        itemsCount: parseInt(response.data.itemsCount),
                        findTxt: this.params.findTxt
                    });

                    //Reset load comments indicator
                    this.commit(
                        consts.COMMENTS_BY_POSTS_GET_ONEPOST_INDICATOR,
                        false
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
                        //Reset load comments indicator
                        this.commit(
                            consts.COMMENTS_BY_POSTS_GET_ONEPOST_INDICATOR,
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
                                this.env.getters.tr("Error_find_comments") +
                                ": " +
                                er.message
                        });
                        //Reset load comments indicator
                        this.commit(
                            consts.COMMENTS_BY_POSTS_GET_ONEPOST_INDICATOR,
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
                            message: this.env.getters.tr("Error_find_comments")
                        });
                        //Reset load comments indicator
                        this.commit(
                            consts.COMMENTS_BY_POSTS_GET_ONEPOST_INDICATOR,
                            false
                        );
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

    //Remove comments of one post
    //By post view
    removeCommentsOfOnePostFound({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_REMOVE_OF_ONE_POST,
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

                //Set remove comments indicator
                this.commit(consts.COMMENTS_REMOVE_OF_ONE_POST_INDICATOR, true);

                let ids = [];
                let comments = this.env.getters.getByOnePostCommentsFound;
                obj.ids.map(cmntIds => {
                    for (let i = 0; i < comments.length; i++)
                        if (cmntIds == comments[i].id) {
                            ids.push({
                                id: cmntIds,
                                leafid: comments[i].leafid
                            });
                            break;
                        }
                });

                this.params = { ids: ids, postid: obj.postid };
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Comments removed success
                if (response.data.status == 1) {
                    //Remove commnets in store
                    this.commit(consts.COMMENTS_REMOVE_OF_ONE_POST_SUCCESS, {
                        cnt: response.data.deleted,
                        postid: this.params.postid
                    });

                    //Find comments of one post
                    this.env.dispatch("findCommentsOfOnePost", {
                        data: {
                            pgNum: this.env.getters
                                .getByUsersOneCommentPgNumFound,
                            postid: this.params.postid,
                            findTxt: this.env.getters.getByOnePostFindTxt
                        },
                        r: this.r
                    });

                    //Reset remove comments indicator
                    this.commit(
                        consts.COMMENTS_REMOVE_OF_ONE_POST_INDICATOR,
                        false
                    );

                    VueNotifications.success({
                        message: this.env.getters.tr("Comments_delete_success")
                    });
                }
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
                        //Reset remove comments indicator
                        this.commit(
                            consts.COMMENTS_REMOVE_OF_ONE_POST_INDICATOR,
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
                                this.env.getters.tr("Error_remove_comments") +
                                ": " +
                                er.message
                        });
                        //Reset remove comments indicator
                        this.commit(
                            consts.COMMENTS_REMOVE_OF_ONE_POST_INDICATOR,
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
                                "Error_remove_comments"
                            )
                        });
                        //Reset remove comments indicator
                        this.commit(
                            consts.COMMENTS_REMOVE_OF_ONE_POST_INDICATOR,
                            false
                        );
                        break;
                }
            }
        };

        if (obj.ids.length == 0) return;
        ro.init(commit, obj.data, this);
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

    //Block users commented of one post found
    blockCommentsOfOnePostFound({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_OF_ONEPOST_BLOCK,
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

                //Set blocking authors indicator
                commit(consts.COMMENTS_BLOCK_OF_ONEPOST_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Authors blocked success
                if (response.data.status == 1) {
                    //Mark users blocked in store
                    this.commit(
                        consts.COMMENTS_BLOCK_OF_ONEPOST_FIND_SUCCESS,
                        this.params
                    );

                    //Reset blocking authors indicator
                    this.commit(
                        consts.COMMENTS_BLOCK_OF_ONEPOST_INDICATOR,
                        false
                    );

                    VueNotifications.success({
                        message: this.env.getters.tr("Users_block_success")
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
                        //Reset blocking authors indicator
                        this.commit(
                            consts.COMMENTS_BLOCK_OF_ONEPOST_INDICATOR,
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
                                this.env.getters.tr("Error_block_users") +
                                ": " +
                                er.message
                        });
                        //Reset blocking authors indicator
                        this.commit(
                            consts.COMMENTS_BLOCK_OF_ONEPOST_INDICATOR,
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
                            message: this.env.getters.tr("Error_block_users")
                        });
                        //Reset blocking authors indicator
                        this.commit(
                            consts.COMMENTS_BLOCK_OF_ONEPOST_INDICATOR,
                            false
                        );
                        break;
                }
            }
        };

        if (obj.ids.length == 0) return;
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

    //Clear comments list by one post found
    //By post view
    clearCommentsOfOnePost({ commit }) {
        commit(consts.COMMENTS_CLEAR_FIND_OF_ONEPOST);
    },

    //Load comments of one post
    //By post view
    loadCommentsOfOnePost({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_BY_ONEPOST_GET,
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

                //Set load comments indicator
                this.commit(
                    consts.COMMENTS_BY_POSTS_GET_ONEPOST_INDICATOR,
                    true
                );
                obj.itemsPerPage = this.env.getters.getByPostsItemsPerPage;
                this.params = obj;
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Comments loaded success
                if (response.data.status == 1) {
                    response.data.comments.map(itm => {
                        itm.itmChk = false;
                        itm.lvl = 0;
                        itm.uname =
                            itm.nick != ""
                                ? itm.nick
                                : itm.fname != ""
                                    ? itm.fname
                                    : itm.mname != ""
                                        ? itm.mname
                                        : itm.lname != ""
                                            ? itm.lname
                                            : "noname";
                        delete itm.nick;
                        delete itm.fname;
                        delete itm.mname;
                        delete itm.lname;

                        itm.isBlocked = conf.isBlocked(itm.privlgs);
                    });

                    let commentsAsTree = [];
                    response.data.comments.map(itm => {
                        if (itm.pid == -1) commentsAsTree.push(itm);
                        itm.children = [];
                    });
                    commentsAsTree = commentsAsTree.sort(compare);
                    parseComentsToTree(response.data.comments, commentsAsTree);

                    let commentsAsArr = [];
                    parseComentsToArr(commentsAsArr, commentsAsTree);

                    commentsAsArr.map(itm => {
                        delete itm.children;
                    });

                    //Save comments in store
                    this.commit(consts.COMMENTS_BY_POSTS_GET_ONEPOST_SUCCESS, {
                        comments: commentsAsArr,
                        pgNum: parseInt(response.data.pgNum),
                        itemsCount: parseInt(response.data.itemsCount)
                    });

                    //Reset load comments indicator
                    this.commit(
                        consts.COMMENTS_BY_POSTS_GET_ONEPOST_INDICATOR,
                        false
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
                        //Reset load comments indicator
                        this.commit(
                            consts.COMMENTS_BY_POSTS_GET_ONEPOST_INDICATOR,
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
                                this.env.getters.tr("Error_load_comments") +
                                ": " +
                                er.message
                        });
                        //Reset load comments indicator
                        this.commit(
                            consts.COMMENTS_BY_POSTS_GET_ONEPOST_INDICATOR,
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
                            message: this.env.getters.tr("Error_load_comments")
                        });
                        //Reset load comments indicator
                        this.commit(
                            consts.COMMENTS_BY_POSTS_GET_ONEPOST_INDICATOR,
                            false
                        );
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

    //Remove comments of one post
    //by post view
    removeCommentsOfOnePost({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_REMOVE_OF_ONE_POST,
            method: "post",
            params: {},
            env: {},
            r: obj.r,
            postid: 0,
            findTxt: "",
            headers: {
                headers: { Authorization: "Bearer " + localStorage.get("at") }
            },
            commit: function() {},

            init: function(commit, obj, env) {
                this.commit = commit;
                this.env = env;

                //Set remove comments indicator
                this.commit(consts.COMMENTS_REMOVE_OF_ONE_POST_INDICATOR, true);

                let ids = [];
                let comments = this.env.getters.getByOnePostComments;
                obj.ids.map(cmntIds => {
                    for (let i = 0; i < comments.length; i++)
                        if (cmntIds == comments[i].id) {
                            ids.push({
                                id: cmntIds,
                                leafid: comments[i].leafid
                            });
                            break;
                        }
                });
                this.findTxt = obj.findTxt;
                this.postid = obj.postid;
                this.params = { ids: ids };
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Comments removed success
                if (response.data.status == 1) {
                    //Remove comments in store
                    this.commit(consts.COMMENTS_REMOVE_OF_ONE_POST_SUCCESS, {
                        cnt: response.data.deleted,
                        postid: this.postid
                    });

                    //Load comments by one post
                    this.env.dispatch("loadCommentsOfOnePost", {
                        data: {
                            pgNum: this.env.getters.getByUsersOneCommentPgNum,
                            postid: this.postid,
                            findTxt: this.findTxt
                        },
                        r: this.r
                    });

                    //Reset remove comments indicator
                    this.commit(
                        consts.COMMENTS_REMOVE_OF_ONE_POST_INDICATOR,
                        false
                    );

                    VueNotifications.success({
                        message: this.env.getters.tr("Comments_delete_success")
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
                        //Reset remove comments indicator
                        this.commit(
                            consts.COMMENTS_REMOVE_OF_ONE_POST_INDICATOR,
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
                                this.env.getters.tr("Error_remove_comments") +
                                ": " +
                                er.message
                        });
                        //Reset remove comments indicator
                        this.commit(
                            consts.COMMENTS_REMOVE_OF_ONE_POST_INDICATOR,
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
                                "Error_remove_comments"
                            )
                        });
                        //Reset remove comments indicator
                        this.commit(
                            consts.COMMENTS_REMOVE_OF_ONE_POST_INDICATOR,
                            false
                        );
                        break;
                }
            }
        };

        if (obj.ids.length == 0) return;
        ro.init(commit, obj.data, this);
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

    //Block users commented in one post
    //by post view
    blockCommentsOfOnePost({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_OF_ONEPOST_BLOCK,
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

                //Set users blocking indicator
                commit(consts.COMMENTS_BLOCK_OF_ONEPOST_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Users blocked success
                if (response.data.status == 1) {
                    //Mark users blocked in store
                    this.commit(
                        consts.COMMENTS_BLOCK_OF_ONEPOST_SUCCESS,
                        this.params.ids
                    );

                    //Reset users blocking indicator
                    this.commit(
                        consts.COMMENTS_BLOCK_OF_ONEPOST_INDICATOR,
                        false
                    );

                    VueNotifications.success({
                        message: this.env.getters.tr("Users_block_success")
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
                        //Reset users blocking indicator
                        this.commit(
                            consts.COMMENTS_BLOCK_OF_ONEPOST_INDICATOR,
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
                                this.env.getters.tr("Error_block_users") +
                                ": " +
                                er.message
                        });
                        //Reset users blocking indicator
                        this.commit(
                            consts.COMMENTS_BLOCK_OF_ONEPOST_INDICATOR,
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
                            message: this.env.getters.tr("Error_block_users")
                        });
                        //Reset users blocking indicator
                        this.commit(
                            consts.COMMENTS_BLOCK_OF_ONEPOST_INDICATOR,
                            false
                        );
                        break;
                }
            }
        };

        if (obj.ids.length == 0) return;
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

    //Prepare edit comment of post
    //by post view
    prepareEditCommentOfPost({ commit }, id) {
        commit(consts.COMMENTS_PREPARE_EDIT_OF_POSTONE, id);
    },

    //Comment saved
    saveCommentOfPostOne({ commit }, id) {
        commit(consts.COMMENTS_SAVE_OF_POSTONE, id);
    },

    //Load posts and comments counts
    loadbyPosts({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_BY_POSTS_GET,
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

                //Set load posts indicator
                this.commit(consts.COMMENTS_BY_POSTS_GET_INDICATOR, true);
                this.params.itemsPerPage = this.env.getters.getByPostsItemsPerPage;
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Posts loaded success
                if (response.data.status == 1) {
                    response.data.posts.map(itm => {
                        itm.uname =
                            itm.nick != ""
                                ? itm.nick
                                : itm.fname != ""
                                    ? itm.fname
                                    : itm.mname != ""
                                        ? itm.mname
                                        : itm.lname != ""
                                            ? itm.lname
                                            : "noname";
                        delete itm.nick;
                        delete itm.fname;
                        delete itm.mname;
                        delete itm.lname;

                        itm.isBlocked = conf.isBlocked(itm.privlgs);
                    });

                    response.data.findTxt = obj.findTxt;
                    this.commit(
                        consts.COMMENTS_BY_POSTS_GET_SUCCESS,
                        response.data
                    );

                    //Set posts load indicator
                    this.commit(consts.COMMENTS_BY_POSTS_GET_INDICATOR, false);
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
                        //Reset posts load indicator
                        this.commit(
                            consts.COMMENTS_BY_POSTS_GET_INDICATOR,
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
                                this.env.getters.tr("Error_load_comments") +
                                ": " +
                                er.message
                        });
                        //Reset posts load indicator
                        this.commit(
                            consts.COMMENTS_BY_POSTS_GET_INDICATOR,
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
                            message: this.env.getters.tr("Error_load_comments")
                        });
                        //Reset posts load indicator
                        this.commit(
                            consts.COMMENTS_BY_POSTS_GET_INDICATOR,
                            false
                        );
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

    //Remove comments of post
    removeCommentsOfPost({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_REMOVE_OF_POST,
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

                //Set remove comments indicator
                commit(consts.COMMENTS_REMOVE_OF_POST_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Comments removed success
                if (response.data.status == 1) {
                    this.commit(
                        consts.COMMENTS_REMOVE_OF_POST_SUCCESS,
                        this.params.ids
                    );

                    //Reset remove comments indicator
                    this.commit(
                        consts.COMMENTS_REMOVE_OF_POST_INDICATOR,
                        false
                    );

                    VueNotifications.success({
                        message: this.env.getters.tr("Comments_delete_success")
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
                        //Reset remove comments indicator
                        this.commit(
                            consts.COMMENTS_REMOVE_OF_POST_INDICATOR,
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
                                this.env.getters.tr("Error_remove_comments") +
                                ": " +
                                er.message
                        });
                        //Reset remove comments indicator
                        this.commit(
                            consts.COMMENTS_REMOVE_OF_POST_INDICATOR,
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
                                "Error_remove_comments"
                            )
                        });
                        //Reset remove comments indicator
                        this.commit(
                            consts.COMMENTS_REMOVE_OF_POST_INDICATOR,
                            false
                        );
                        break;
                }
            }
        };

        if (obj.ids.length == 0) return;
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

    //Block authors of post commented
    //By posts view
    blockCommentsOfPost({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_BLOCK_OF_POST,
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

                //Set blocking users indicator
                this.commit(consts.COMMENTS_BLOCK_OF_POST_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Users blocked success
                if (response.data.status == 1) {
                    //Mark blocked users
                    this.commit(
                        consts.COMMENTS_BLOCK_OF_POST_SUCCESS,
                        this.params.ids
                    );

                    //Reset blocking users indicator
                    this.commit(consts.COMMENTS_BLOCK_OF_POST_INDICATOR, false);

                    VueNotifications.success({
                        message: this.env.getters.tr("Users_block_success")
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
                        //Reset blocking users indicator
                        this.commit(
                            consts.COMMENTS_BLOCK_OF_POST_INDICATOR,
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
                                this.env.getters.tr("Error_block_users") +
                                ": " +
                                er.message
                        });
                        //Reset blocking users indicator
                        this.commit(
                            consts.COMMENTS_BLOCK_OF_POST_INDICATOR,
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
                            message: this.env.getters.tr("Error_block_users")
                        });
                        //Reset blocking users indicator
                        this.commit(
                            consts.COMMENTS_BLOCK_OF_POST_INDICATOR,
                            false
                        );
                        break;
                }
            }
        };

        if (obj.ids.length == 0) return;
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

    //Load categories and comments counts
    //By Categories view
    loadbyCategories({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_BY_CATEGORIES_GET,
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

                //Set load categories indicator
                this.commit(consts.COMMENTS_BY_CATEGORIES_GET_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Categories loaded success
                if (response.data.status == 1) {
                    this.commit(
                        consts.COMMENTS_BY_CATEGORIES_GET_SUCCESS,
                        response.data.categories
                    );

                    //Reset load categories indicator
                    this.commit(
                        consts.COMMENTS_BY_CATEGORIES_GET_INDICATOR,
                        false
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
                        //Reset load categories indicator
                        this.commit(
                            consts.COMMENTS_BY_CATEGORIES_GET_INDICATOR,
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
                                this.env.getters.tr("Error_load_comments") +
                                ": " +
                                er.message
                        });
                        //Reset load categories indicator
                        this.commit(
                            consts.COMMENTS_BY_CATEGORIES_GET_INDICATOR,
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
                            message: this.env.getters.tr("Error_load_comments")
                        });
                        //Reset load categories indicator
                        this.commit(
                            consts.COMMENTS_BY_CATEGORIES_GET_INDICATOR,
                            false
                        );
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

    //Change page of category
    //By category view
    setPgNumByCategories({ commit }, pgNum) {
        commit(consts.COMMENTS_BY_CATEGORIES_SET_PGNUM, pgNum);
    },

    //Remove comments of category
    removeCommentsOfCategory({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_REMOVE_OF_CATEGORY,
            method: "post",
            params: {},
            env: {},
            r: obj.r,
            findTxt: "",
            headers: {
                headers: { Authorization: "Bearer " + localStorage.get("at") }
            },
            commit: function() {},

            init: function(commit, obj, env) {
                this.commit = commit;
                this.env = env;
                this.params = { ids: obj };
                this.findTxt = obj.findTxt;

                //Set remove comments indicator
                this.commit(consts.COMMENTS_REMOVE_OF_CATEGORY_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Comments removed success
                if (response.data.status == 1) {
                    this.env.dispatch("loadbyCategories", {
                        findTxt: this.findTxt,
                        r: this.r
                    });

                    //Reset remove comments indicator
                    this.commit(
                        consts.COMMENTS_REMOVE_OF_CATEGORY_INDICATOR,
                        false
                    );

                    VueNotifications.success({
                        message: this.env.getters.tr("Comments_delete_success")
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
                        //Reset remove comments indicator
                        this.commit(
                            consts.COMMENTS_REMOVE_OF_CATEGORY_INDICATOR,
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
                                this.env.getters.tr("Error_remove_comments") +
                                ": " +
                                er.message
                        });
                        //Reset remove comments indicator
                        this.commit(
                            consts.COMMENTS_REMOVE_OF_CATEGORY_INDICATOR,
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
                                "Error_remove_comments"
                            )
                        });
                        //Reset remove comments indicator
                        this.commit(
                            consts.COMMENTS_REMOVE_OF_CATEGORY_INDICATOR,
                            false
                        );
                        break;
                }
            }
        };

        if (obj.ids.length == 0) return;
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

    //Load comments of one category
    //By category view
    loadCommentsCategory({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_LOAD_COMMENTS_CATEGORY,
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

                //Set comments load indicator
                this.commit(consts.COMMENTS_LOAD_CATEGORY_INDICATOR, true);

                this.params.itemsPerPage = this.env.getters.getByCategoriesOneItemsPerPage;
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Comments loaded success
                if (response.data.status == 1) {
                    response.data.arr.map(itm => {
                        itm.uname =
                            itm.nick != ""
                                ? itm.nick
                                : itm.fname != ""
                                    ? itm.fname
                                    : itm.mname != ""
                                        ? itm.mname
                                        : itm.lname != ""
                                            ? itm.lname
                                            : "noname";
                        delete itm.nick;
                        delete itm.fname;
                        delete itm.mname;
                        delete itm.lname;
                        itm.isBlocked = conf.isBlocked(itm.privlgs);
                    });

                    this.commit(
                        consts.COMMENTS_LOAD_COMMENTS_CATEGORY_SUCCESS,
                        response.data
                    );

                    //Reset comments load indicator
                    this.commit(consts.COMMENTS_LOAD_CATEGORY_INDICATOR, false);
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
                        //Reset comments load indicator
                        this.commit(
                            consts.COMMENTS_LOAD_CATEGORY_INDICATOR,
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
                                this.env.getters.tr("Error_load_comments") +
                                ": " +
                                er.message
                        });
                        //Reset comments load indicator
                        this.commit(
                            consts.COMMENTS_LOAD_CATEGORY_INDICATOR,
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
                            message: this.env.getters.tr("Error_load_comments")
                        });
                        //Reset comments load indicator
                        this.commit(
                            consts.COMMENTS_LOAD_CATEGORY_INDICATOR,
                            false
                        );
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

    //Remove comments of one category
    removeCommentsOfCategoryOne({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_REMOVE_CATEGORY_ONE,
            method: "post",
            params: {},
            env: {},
            r: obj.r,
            findTxt: "",
            headers: {
                headers: { Authorization: "Bearer " + localStorage.get("at") }
            },
            commit: function() {},

            init: function(commit, obj, env) {
                this.commit = commit;
                this.env = env;
                this.params = obj;

                //Set remove comments indicator
                this.commit(
                    consts.COMMENTS_REMOVE_CATEGORY_ONE_INDICATOR,
                    true
                );
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Comments loaded success
                if (response.data.status == 1) {
                    //Comments removed success
                    this.commit(consts.COMMENTS_REMOVE_CATEGORY_ONE_SUCCESS, {
                        ids: this.params.ids.length,
                        catid: this.params.catid
                    });

                    //Load comments category
                    this.env.dispatch("loadCommentsCategory", {
                        data: {
                            catid: this.params.catid,
                            pgNum: this.env.getters.getByCategoriesOnePgNum,
                            findTxt: this.env.getters.getByCategoriesOneFindTxt
                        },
                        r: this.r
                    });

                    //Reset remove comments indicator
                    this.commit(
                        consts.COMMENTS_REMOVE_CATEGORY_ONE_INDICATOR,
                        false
                    );

                    VueNotifications.success({
                        message: this.env.getters.tr("Comments_delete_success")
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
                        //Reset remove comments indicator
                        this.commit(
                            consts.COMMENTS_REMOVE_CATEGORY_ONE_INDICATOR,
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
                                this.env.getters.tr("Error_remove_comments") +
                                ": " +
                                er.message
                        });
                        //Reset remove comments indicator
                        this.commit(
                            consts.COMMENTS_REMOVE_CATEGORY_ONE_INDICATOR,
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
                                "Error_remove_comments"
                            )
                        });
                        //Reset remove comments indicator
                        this.commit(
                            consts.COMMENTS_REMOVE_CATEGORY_ONE_INDICATOR,
                            false
                        );
                        break;
                }
            }
        };

        if (obj.data.ids.length == 0) return;

        let data = [];
        let cmnts = this.getters.getAllComments;
        obj.data.ids.map(itm => {
            let found = cmnts.filter(el => el.id == itm);
            if (found.length > 0) {
                data.push({
                    id: found[0].id,
                    pid: found[0].pid,
                    leafid: found[0].leafid
                });
            }
        });

        ro.init(commit, { ids: data, catid: obj.data.catid }, this);
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

    //Block users commented in category one
    blockUserCategoryOne({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_BLOCK_USER_CATEGORY_ONE,
            method: "post",
            params: {},
            env: {},
            r: obj.r,
            findTxt: "",
            headers: {
                headers: { Authorization: "Bearer " + localStorage.get("at") }
            },
            commit: function() {},

            init: function(commit, obj, env) {
                this.commit = commit;
                this.env = env;
                this.params = { ids: obj };

                //Set blocked users indicator
                this.commit(
                    consts.COMMENTS_BLOCK_USER_CATEGORY_ONE_INDICATOR,
                    true
                );
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Users blocked success
                if (response.data.status == 1) {
                    //Mark users in store
                    this.commit(
                        consts.COMMENTS_BLOCK_USER_CATEGORY_ONE_SUCCESS,
                        this.params.ids
                    );

                    //Reset blocked users indicator
                    this.commit(
                        consts.COMMENTS_BLOCK_USER_CATEGORY_ONE_INDICATOR,
                        false
                    );

                    VueNotifications.success({
                        message: this.env.getters.tr("Users_block_success")
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
                        //Reset blocked users indicator
                        this.commit(
                            consts.COMMENTS_BLOCK_USER_CATEGORY_ONE_INDICATOR,
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
                                this.env.getters.tr("Error_block_users") +
                                ": " +
                                er.message
                        });
                        //Reset blocked users indicator
                        this.commit(
                            consts.COMMENTS_BLOCK_USER_CATEGORY_ONE_INDICATOR,
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
                            message: this.env.getters.tr("Error_block_users")
                        });
                        //Reset blocked users indicator
                        this.commit(
                            consts.COMMENTS_BLOCK_USER_CATEGORY_ONE_INDICATOR,
                            false
                        );
                        break;
                }
            }
        };

        if (obj.ids.length == 0) return;
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

    //Save comment
    //by category view
    saveCommentCategoryOne({ commit }, obj) {
        let ro = {
            url: conf.COMMENTS_UPDATE,
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
                this.params = { comment: obj };

                //Set comment save indicator
                commit(consts.COMMENTS_SAVE_CATEGORY_ONE_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Comment save success
                if (response.data.status == 1) {
                    //Comment save in store
                    this.commit(
                        consts.COMMENTS_SAVE_CATEGORY_ONE_SUCCESS,
                        this.params.comment
                    );

                    //Reset comment save indicator
                    this.commit(
                        consts.COMMENTS_SAVE_CATEGORY_ONE_INDICATOR,
                        false
                    );

                    VueNotifications.success({
                        message: this.env.getters.tr("Comments_save_success")
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
                        //Reset comment save indicator
                        this.commit(
                            consts.COMMENTS_SAVE_CATEGORY_ONE_INDICATOR,
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
                                this.env.getters.tr("Error_save_comments") +
                                ": " +
                                er.message
                        });
                        //Reset comment save indicator
                        this.commit(
                            consts.COMMENTS_SAVE_CATEGORY_ONE_INDICATOR,
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
                            message: this.env.getters.tr("Error_save_comments")
                        });
                        //Reset comment save indicator
                        this.commit(
                            consts.COMMENTS_SAVE_CATEGORY_ONE_INDICATOR,
                            false
                        );
                        break;
                }
            }
        };

        ro.init(commit, obj.comment, this);
        Vue.http
            .post(ro.url, ro.params.comment, ro.headers)
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

    //Reset comments actions
    commentsActionsReset({ commit }) {
        commit(consts.COMMENTS_INDICATOR_RESET);
    }
};
