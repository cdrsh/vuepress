import * as consts from "./constants";
import Vue from "vue";
import VueNotifications from "vue-notifications";
import * as conf from "../../../config";
var localStorage = require("store");

export default {
    //Reset user actions
    usersActionsReset({ commit }) {
        commit(consts.USERS_RESET_INDICATOR);
    },

    //Show edit user dialog
    showEditUser({ commit }, userId) {
        commit(consts.SH_USER_EDIT_DIALOG, userId);
    },

    //Show details user
    showDetailsUser({ commit }, userId) {
        commit(consts.SH_USER_DETAILS_DIALOG, userId);
    },

    //Remove users checked
    removeSelected({ commit }) {
        commit(consts.REMOVE_USERS_SELECTED);
    },

    //Remove one user
    removeOneUser({ commit }, userId) {
        commit(consts.REMOVE_ONE_USER, userId);
    },

    //Load users
    loadUsers({ commit }, obj) {
        let ro = {
            url: conf.USER_GET,
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

                //Set loading users indicator
                this.commit(consts.USERS_LOAD_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Reset loading users indicator
                this.commit(consts.USERS_LOAD_INDICATOR, false);

                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //User list loading success
                if (response.data.status == 1) {
                    //Fetch block flag from access rights
                    response.data.users.map(itm => {
                        itm.isBlocked = conf.isBlocked(itm.privlgs);
                    });

                    //Save users in storage
                    this.commit(consts.USERS_LOAD_SUCCESS, response.data);
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
                        //Reset loading users indicator
                        this.commit(consts.USERS_LOAD_INDICATOR, false);
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
                        //Reset loading users indicator
                        this.commit(consts.USERS_LOAD_INDICATOR, false);
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
                        //Reset loading users indicator
                        this.commit(consts.USERS_LOAD_INDICATOR, false);
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

    //Block users
    blockUsers({ commit }, obj) {
        let ro = {
            url: conf.USER_BLOCK,
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
                this.commit(consts.USERS_BLOCK_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Users blocked success
                if (response.data.status == 1) {
                    this.commit(consts.USERS_BLOCK_SUCCESS, this.params.ids);

                    VueNotifications.success({
                        message: this.env.getters.tr("Users_block_success")
                    });

                    //Reset blocking users indicator
                    this.commit(consts.USERS_BLOCK_INDICATOR, false);
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
                        this.commit(consts.USERS_BLOCK_INDICATOR, false);
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
                        this.commit(consts.USERS_BLOCK_INDICATOR, false);
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
                        this.commit(consts.USERS_BLOCK_INDICATOR, false);
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

    //Remove users
    removeUsers({ commit }, obj) {
        let ro = {
            url: conf.USER_DELETESELECTED,
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

                //Set removing users indicator
                this.commit(consts.USERS_REMOVE_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Users removed success
                if (response.data.status == 1) {
                    //Reload users list
                    this.env.dispatch("loadUsers", {
                        data: {
                            pgNum: this.env.getters.getUsersPgNum,
                            findTxt: this.env.getters.getUsersFindTxt,
                            findNum: this.env.getters.getUsersFindNum,
                            itemsPerPage: this.env.getters.getUsersPerPage
                        },
                        r: this.r
                    });

                    VueNotifications.success({
                        message: this.env.getters.tr("Users_delete_success")
                    });

                    //Reset removing users indicator
                    this.commit(consts.USERS_REMOVE_INDICATOR, false);
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
                        //Reset removing users indicator
                        this.commit(consts.USERS_REMOVE_INDICATOR, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_remove_users") +
                                ": " +
                                er.message
                        });
                        //Reset removing users indicator
                        this.commit(consts.USERS_REMOVE_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_remove_users")
                        });
                        //Reset removing users indicator
                        this.commit(consts.USERS_REMOVE_INDICATOR, false);
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

    //Set user privelege
    setUserPrivelege({ commit }, obj) {
        let ro = {
            url: conf.USERS_PRIVELEGE,
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

                //Set user privelege indicator
                this.commit(consts.USERS_PRIVELEGE_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Privelege set success
                if (response.data.status == 1) {
                    this.commit(consts.USERS_PRIVELEGE_SUCCESS, this.params);

                    VueNotifications.success({
                        message: this.env.getters.tr("Privelege_set_success")
                    });

                    //Reset user privelege indicator
                    this.commit(consts.USERS_PRIVELEGE_INDICATOR, false);
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
                        //Reset user privelege indicator
                        this.commit(consts.USERS_PRIVELEGE_INDICATOR, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_save_privs") +
                                ": " +
                                er.message
                        });
                        //Reset user privelege indicator
                        this.commit(consts.USERS_PRIVELEGE_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_save_privs")
                        });
                        //Reset user privelege indicator
                        this.commit(consts.USERS_PRIVELEGE_INDICATOR, false);
                        break;
                }
            }
        };

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

    //Add user
    addUser({ commit }, obj) {
        let ro = {
            url: conf.USER_ADD,
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

                //Set user adding indicator
                this.commit(consts.USERS_ADD_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Users added success
                if (response.data.status == 1) {
                    //Users loaded success
                    this.env.dispatch("loadUsers", {
                        data: {
                            pgNum: this.env.getters.getUsersPgNum,
                            findTxt: this.env.getters.getUsersFindTxt,
                            findNum: this.env.getters.getUsersFindNum,
                            itemsPerPage: this.env.getters.getUsersPerPage
                        },
                        r: this.$router
                    });

                    VueNotifications.success({
                        message: this.env.getters.tr("Users_added_success")
                    });

                    //Reset user adding indicator
                    this.commit(consts.USERS_ADD_INDICATOR, false);
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
                        //Reset user adding indicator
                        this.commit(consts.USERS_ADD_INDICATOR, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_add_user") +
                                ": " +
                                er.message
                        });
                        //Reset user adding indicator
                        this.commit(consts.USERS_ADD_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_add_user")
                        });
                        //Reset user adding indicator
                        this.commit(consts.USERS_ADD_INDICATOR, false);
                        break;
                }
            }
        };

        ro.init(commit, obj.addUser, this);
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

    //Save user
    saveUser({ commit }, obj) {
        let ro = {
            url: conf.USER_UPDATE,
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

                //Set user saving indicator
                this.commit(consts.USERS_SAVE_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //User saved success
                if (response.data.status == 1) {
                    //Reload users list
                    this.env.dispatch("loadUsers", {
                        data: {
                            pgNum: this.env.getters.getUsersPgNum,
                            findTxt: this.env.getters.getUsersFindTxt,
                            findNum: this.env.getters.getUsersFindNum,
                            itemsPerPage: this.env.getters.getUsersPerPage
                        },
                        r: this.$router
                    });

                    VueNotifications.success({
                        message: this.env.getters.tr("User_saved_success")
                    });

                    //Reset user saving indicator
                    this.commit(consts.USERS_SAVE_INDICATOR, false);
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
                        //Reset user saving indicator
                        this.commit(consts.USERS_SAVE_INDICATOR, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_save_user") +
                                ": " +
                                er.message
                        });
                        //Reset user saving indicator
                        this.commit(consts.USERS_SAVE_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_save_user")
                        });
                        //Reset user saving indicator
                        this.commit(consts.USERS_SAVE_INDICATOR, false);
                        break;
                }
            }
        };

        ro.init(commit, obj.editUser, this);
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
