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

//Convert comments Array to Tree
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

//Convert comments Tree to Array
let parseComentsToArr = (commentsAsArr, commentsAsTree) => {
    for (let i = 0; i < commentsAsTree.length; i++) {
        commentsAsArr.push(commentsAsTree[i]);
        if (commentsAsTree[i].children.length > 0)
            parseComentsToArr(commentsAsArr, commentsAsTree[i].children);
    }
};

export default {
    //Get comments by page num
    loadComments({ commit }, obj) {
        let ro = {
            url: this.getters.API + conf.GET_COMMENTS_CLIENT,
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

                //Set load indicator
                this.commit(consts.COMMENTS_LOAD_INDICATOR, true);
                obj.itemsPerPage = this.env.getters.getCommentsItemsPerPage;
                this.params = obj;
            },

            onSuccess: function(response) {
                //Server error
                if (response.data.status == 0) throw response.data.err;

                //Comments load success
                if (response.data.status == 1) {
                    response.data.comments.map(itm => {
                        itm.itmChk = false;
                        itm.lvl = 0;
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

                    //Save comments
                    this.commit(consts.COMMENTS_LOAD_SUCCESS, {
                        comments: commentsAsArr,
                        pgNum: parseInt(response.data.pgNum),
                        itemsCount: parseInt(response.data.itemsCount)
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
                                this.env.getters.tr("Error_load_comments") +
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
                            message: this.env.getters.tr("Error_load_comments")
                        });
                        //Reset load indicator
                        this.commit(consts.COMMENTS_LOAD_INDICATOR, false);
                        break;
                }
            }
        };

        ro.init(commit, { pgNum: obj.pgNum, postid: obj.postid }, this);
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

    //Comment answer
    answerComment({ commit }, obj) {
        let ro = {
            url: "/api" + conf.ANSWER_COMMENT_CLIENT,
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
                this.params = obj.cmnt;

                //Set answer indicator
                this.commit(consts.COMMENT_ANSWER_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error
                if (response.data.status == 0) throw response.data.err;

                //Comment answer success
                if (response.data.status == 1) {
                    this.params.pid = this.params.id;
                    this.params.id = response.data.id;
                    this.params.dt = response.data.dt;
                    this.params.txt = this.params.mycmnt;
                    this.params.lvl = this.params.lvl + 1;
                    if (response.data.user.id != -1) {
                        this.params.usrid = response.data.user.id;
                        this.params.fname = response.data.user.fname;
                        this.params.mname = response.data.user.mname;
                        this.params.lname = response.data.user.lname;
                        this.params.nick = response.data.user.nick;
                    } else {
                        this.params.usrid = -1;
                        this.params.fname = "";
                        this.params.mname = "";
                        this.params.lname = "";
                        this.params.nick = "";
                    }

                    //Answer comment on client
                    this.commit(consts.COMMENT_ANSWER_SUCCESS, this.params);

                    //Reset answer indicator
                    this.commit(consts.COMMENT_ANSWER_INDICATOR, false);
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
                        //Reset answer indicator
                        this.commit(consts.COMMENT_ANSWER_INDICATOR, false);
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
                        //Reset answer indicator
                        this.commit(consts.COMMENT_ANSWER_INDICATOR, false);
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
                        //Reset answer indicator
                        this.commit(consts.COMMENT_ANSWER_INDICATOR, false);
                        break;
                }
            }
        };

        obj.cmnt.usrid = -1;
        let usr = localStorage.get("user");
        if (usr != undefined && usr.hasOwnProperty("id"))
            obj.cmnt.usrid = usr.id;

        ro.init(commit, { cmnt: obj.cmnt }, this);
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

    //Add comment
    addComment({ commit }, obj) {
        let ro = {
            url: "/api" + conf.ADD_COMMENT_CLIENT,
            method: "post",
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
                this.params = obj.cmnt;

                //Set add comment indicator
                this.commit(consts.COMMENT_ADD_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error
                if (response.data.status == 0) throw response.data.err;

                //Add comment success
                if (response.data.status == 1) {
                    this.params.pid = -1;
                    this.params.id = response.data.id;
                    this.params.dt = response.data.dt;
                    this.params.txt = this.params.mycmnt;
                    this.params.lvl = 0;
                    this.params.leafid = -1;
                    if (response.data.user.id != -1) {
                        this.params.usrid = response.data.user.id;
                        this.params.fname = response.data.user.fname;
                        this.params.mname = response.data.user.mname;
                        this.params.lname = response.data.user.lname;
                        this.params.nick = response.data.user.nick;
                    } else {
                        this.params.usrid = -1;
                        this.params.fname = "";
                        this.params.mname = "";
                        this.params.lname = "";
                        this.params.nick = "";
                    }

                    //Add comment on client
                    this.commit(consts.COMMENT_ADD_SUCCESS, this.params);

                    //Reset add comment indicator
                    this.commit(consts.COMMENT_ADD_INDICATOR, false);
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
                        //Reset add comment indicator
                        this.commit(consts.COMMENT_ADD_INDICATOR, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_comment") +
                                ": " +
                                er.message
                        });
                        //Reset add comment indicator
                        this.commit(consts.COMMENT_ADD_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_comment")
                        });
                        //Reset add comment indicator
                        this.commit(consts.COMMENT_ADD_INDICATOR, false);
                        break;
                }
            }
        };

        obj.cmnt.usrid = -1;
        let usr = localStorage.get("user");
        if (usr != undefined && usr.hasOwnProperty("id"))
            obj.cmnt.usrid = usr.id;

        ro.init(commit, { cmnt: Vue._.cloneDeep(obj.cmnt) }, this);
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
