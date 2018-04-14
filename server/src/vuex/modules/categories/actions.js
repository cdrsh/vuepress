import * as consts from "./constants";
import Vue from "vue";
import VueNotifications from "vue-notifications";
import * as conf from "../../../config";
var localStorage = require("store");

let ObjectToPlainArray = objErrors => {
    let strOut = "";
    for (let itm in objErrors) {
        let arrVals = objErrors[itm];
        for (let j = 0; j < arrVals.length; j++)
            strOut += itm + ": " + arrVals[j] + "<br>";
    }
    return strOut;
};

export default {
    //Save category current language
    saveCategoryCurLang({ commit }, objCat) {
        commit(consts.SAVE_CATEGORY_CUR_LANG, objCat);
    },

    //Category page number change
    setCategoriesPageNum({ commit }, PageNum) {
        commit(consts.SET_CATEGORIES_PAGE_NUM, PageNum);
    },

    //Load categories if not loaded
    loadAllCategoriesIfNotLoaded({ commit }, obj) {
        if (this.getters.getCategories.length == 0)
            this.dispatch("loadAllCategories", obj);
    },

    //Load all categories
    loadAllCategories({ commit }, obj) {
        let ro = {
            url: conf.CATEGORY_GET,
            method: "get",
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

                this.commit(consts.VIS_EDIT_CATEGORY, false);
                this.commit(consts.VIS_ADD_CATEGORY, false);
                this.commit(consts.SET_CATEGORY_FILTER_MODE, false);

                //Set categories load indicator
                this.commit(consts.CATEGORY_LOADING_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Categories list loaded success
                if (response.data.status == 1) {
                    response.data.categories.map(itm => {
                        //Add fields
                        itm.num = parseInt(itm.num);
                        itm.chkd = false;
                        itm.auto_numerate = itm.auto_numerate == "1";

                        //Map user fields to categories
                        itm.uflds = [];
                        response.data.uflds.map(itmFld => {
                            if (itmFld.catid == itm.id && itmFld.namef != "")
                                itm.uflds.push({
                                    namef: itmFld.namef,
                                    fldid: itmFld.id
                                });
                        });
                    });

                    //Save categories list
                    this.commit(
                        consts.CATEGORY_LOAD_SUCCESS,
                        response.data.categories
                    );

                    //Reset categories load indicator
                    this.commit(consts.CATEGORY_LOADING_INDICATOR, false);
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
                        //Reset categories load indicator
                        this.commit(consts.CATEGORY_LOADING_INDICATOR, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_load_categories") +
                                ": " +
                                er.message
                        });
                        //Reset categories load indicator
                        this.commit(consts.CATEGORY_LOADING_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr(
                                "Error_load_categories"
                            )
                        });
                        //Reset categories load indicator
                        this.commit(consts.CATEGORY_LOADING_INDICATOR, false);
                        break;
                }
            }
        };

        ro.init(commit, {}, this);
        Vue.http
            .get(ro.url, ro.headers)
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

    //Enter to category
    enterCategory({ commit }, catObj) {
        commit(consts.CATEGORY_ENTER, catObj);
    },

    //Open add category dialog
    onClickAddCategory({ commit }, val) {
        commit(consts.VIS_ADD_CATEGORY, val);
    },

    //Open edit category dialog
    openEditCategoryDlg({ commit, rootState }, obj) {
        commit(consts.BEGIN_EDIT_CATEGORY, {
            vis: obj.vis,
            id: obj.id,
            contentLang: this.getters.getLangsContentSelected,
            names: this.getters.getCategoriesNamesToEdit
        });
        commit(consts.VIS_EDIT_CATEGORY, { vis: obj.vis });
    },

    //Remove one category
    removeOneCategory({ commit, state }, obj) {
        let ro = {
            url: conf.CATEGORY_DELETESELECTED,
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

                //Set remove category indicator
                this.commit(consts.CATEGORY_REMOVING_INDICATOR, true);

                //Make children category list in current leaf
                let idsloc = this.env.getters.getLeafChildrenCategories(obj.id);
                let ids;
                if (idsloc !== undefined) ids = [obj.id, ...idsloc];
                else ids = [obj.id];
                this.params.ids = ids;
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Category remove success
                if (response.data.status == 1) {
                    //Remove categories in store
                    this.commit(consts.CATEGORIES_REMOVE, this.params.ids);

                    VueNotifications.success({
                        message: this.env.getters.tr("Category_remove_success")
                    });

                    //Reset remove category indicator
                    this.commit(consts.CATEGORY_REMOVING_INDICATOR, false);
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
                        //Reset remove category indicator
                        this.commit(consts.CATEGORY_REMOVING_INDICATOR, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_category_removing") +
                                ": " +
                                er.message
                        });
                        //Reset remove category indicator
                        this.commit(consts.CATEGORY_REMOVING_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr(
                                "Error_category_removing"
                            )
                        });
                        //Reset remove category indicator
                        this.commit(consts.CATEGORY_REMOVING_INDICATOR, false);
                        break;
                }
            }
        };

        ro.init(commit, { id: obj.id }, this);
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

    //Remove selected categories
    removeSelectedCategories({ commit, state }, obj) {
        let ro = {
            url: conf.CATEGORY_DELETESELECTED,
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

                //Set remove category indicator
                this.commit(consts.CATEGORY_REMOVING_INDICATOR, true);

                //Get checked categories list
                let idsObj = this.env.getters.getChkdCategories;
                if (idsObj.length == 0) {
                    //Reset remove category indicator
                    this.commit(consts.CATEGORY_REMOVING_INDICATOR, false);
                    VueNotifications.error({
                        message: this.env.getters.tr("Categories_not_selected")
                    });
                    return;
                }
                let ids = [];
                idsObj.map(function(itm) {
                    if (itm.chkd) ids.push(itm.id);
                });

                //Make children category list in current leaf
                let idsArr = [...ids];
                for (let i = 0; i < ids.length; i++) {
                    let idsloc = this.env.getters.getLeafChildrenCategories(
                        ids[i]
                    );
                    if (idsloc !== undefined) idsArr = [...idsArr, ...idsloc];
                }
                this.params.ids = idsArr;
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Categories removed success
                if (response.data.status == 1) {
                    //Remove categories in store
                    this.commit(consts.CATEGORIES_REMOVE, this.params.ids);

                    VueNotifications.success({
                        message: this.env.getters.tr("Category_remove_success")
                    });

                    //Reset remove category indicator
                    this.commit(consts.CATEGORY_REMOVING_INDICATOR, false);
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
                        //Reset remove category indicator
                        this.commit(consts.CATEGORY_REMOVING_INDICATOR, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_category_removing") +
                                ": " +
                                er.message
                        });
                        //Reset remove category indicator
                        this.commit(consts.CATEGORY_REMOVING_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr(
                                "Error_category_removing"
                            )
                        });
                        //Reset remove category indicator
                        this.commit(consts.CATEGORY_REMOVING_INDICATOR, false);
                        break;
                }
            }
        };

        ro.init(commit, { id: obj.id }, this);
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

    //Move category down
    moveDwCategory({ commit, state }, obj) {
        let ro = {
            url: conf.CATEGORY_MOVE,
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

                //Set move category indicator
                this.commit(consts.CATEGORY_MOVING_INDICATOR, true);

                //id1 id2 num1 num2 change
                let objUp = this.env.getters.getCategories.filter(
                    itm => itm.id == obj.id
                )[0];
                let objDw = this.env.getters.getCategories.filter(
                    itm => itm.num > objUp.num && itm.pid == objUp.pid
                )[0];
                if (objDw == undefined) {
                    //Reset move category indicator
                    this.commit(consts.CATEGORY_MOVING_INDICATOR, false);
                    return false;
                }

                let movingObj = {
                    id1: objUp.id,
                    id2: objDw.id,
                    num1: objDw.num,
                    num2: objUp.num
                };

                this.params = movingObj;

                return true;
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Categories move success
                if (response.data.status == 1) {
                    //Move categories in store
                    this.commit(consts.CATEGORY_MOVE, this.params);

                    //Reset move category indicator
                    this.commit(consts.CATEGORY_MOVING_INDICATOR, false);
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
                        //Reset move category indicator
                        this.commit(consts.CATEGORY_MOVING_INDICATOR, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_category_moving") +
                                ": " +
                                er.message
                        });
                        //Reset move category indicator
                        this.commit(consts.CATEGORY_MOVING_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr(
                                "Error_category_moving"
                            )
                        });
                        //Reset move category indicator
                        this.commit(consts.CATEGORY_MOVING_INDICATOR, false);
                        break;
                }
            }
        };

        if (!ro.init(commit, { id: obj.id }, this)) return;
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

    //Move category up
    moveUpCategory({ commit, state }, obj) {
        let ro = {
            url: conf.CATEGORY_MOVE,
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

                //Set move indicator
                this.commit(consts.CATEGORY_MOVING_INDICATOR, true);

                //id1 id2 num1 num2 change
                let objDw = this.env.getters.getCategories.filter(
                    itm => itm.id == obj.id
                )[0];
                let objUp = this.env.getters.getCategories.filter(
                    itm => itm.num < objDw.num && itm.pid == objDw.pid
                );

                if (objUp.length == 0) {
                    //Reset Move category indicator
                    this.commit(consts.CATEGORY_MOVING_INDICATOR, false);
                    return;
                }
                objUp = objUp[objUp.length - 1];

                let movingObj = {
                    id1: objUp.id,
                    id2: objDw.id,
                    num1: objDw.num,
                    num2: objUp.num
                };

                this.params = movingObj;

                return true;
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Category moved success
                if (response.data.status == 1) {
                    //Move categories in store
                    this.commit(consts.CATEGORY_MOVE, this.params);

                    //Reset Move category indicator
                    this.commit(consts.CATEGORY_MOVING_INDICATOR, false);
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
                        //Reset Move category indicator
                        this.commit(consts.CATEGORY_MOVING_INDICATOR, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_category_moving") +
                                ": " +
                                er.message
                        });
                        //Reset Move category indicator
                        this.commit(consts.CATEGORY_MOVING_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr(
                                "Error_category_moving"
                            )
                        });
                        //Reset Move category indicator
                        this.commit(consts.CATEGORY_MOVING_INDICATOR, false);
                        break;
                }
            }
        };

        if (!ro.init(commit, { id: obj.id }, this)) return;
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

    //Set filter mode categories
    setFilterCategory({ commit }, val) {
        commit(consts.SET_CATEGORY_FILTER_MODE, val);
    },

    //Set text filter categories
    setCategoryFilterText({ commit }, txt) {
        commit(consts.SET_CATEGORY_FILTER_TEXT, txt);
    },

    //Set category page number in filtered categories list
    setFilteredCategoryPageNum({ commit }, pgNum) {
        commit(consts.SET_FILTERED_CATEGORY_PAGE_NUM, pgNum);
    },

    //Reset categories actions indicators
    categoryActionsReset({ commit }) {
        commit(consts.CATEGORY_ACTION_RESET);
    },

    //Add category
    addCategory({ commit, state }, obj) {
        let ro = {
            url: conf.CATEGORY_ADD,
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

                //Set add category indicator
                this.commit(consts.CATEGORY_ADD_INDICATOR, true);

                this.params["pid"] = state.catParentId;
                this.params["idleaf"] = state.idLeaf;
                this.params.keyWords.keyWords =
                    typeof this.params.keyWords.keyWords == "object"
                        ? this.params.keyWords.keyWords.join(",")
                        : this.params.keyWords.keyWords;
                this.params.userFields.userFields =
                    typeof this.params.userFields.userFields == "object"
                        ? this.params.userFields.userFields.join(";")
                        : this.params.userFields.userFields;
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Category added success
                if (response.data.status == 1) {
                    //Add category to store
                    this.params["id"] = response.data.id;
                    this.params["dt"] = response.data.dt;
                    this.params["num"] = parseInt(response.data.num);
                    if (this.params["pid"] == -1)
                        this.params["idleaf"] = response.data.idleaf;
                    this.params["uflds"] = response.data.uflds;
                    this.commit(consts.CATEGORY_ADD, this.params);
                    this.commit(consts.VIS_ADD_CATEGORY, false);

                    VueNotifications.success({
                        message: this.env.getters.tr("Category_adding_success")
                    });

                    //Reset add category indicator
                    this.commit(consts.CATEGORY_ADD_INDICATOR, false);
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
                        this.commit(consts.VIS_ADD_CATEGORY, false);

                        //Reset add category indicator
                        this.commit(consts.CATEGORY_ADD_INDICATOR, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_category_adding") +
                                ": " +
                                er.message
                        });
                        this.commit(consts.VIS_ADD_CATEGORY, false);

                        //Reset add category indicator
                        this.commit(consts.CATEGORY_ADD_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr(
                                "Error_category_adding"
                            )
                        });
                        this.commit(consts.VIS_ADD_CATEGORY, false);

                        //Reset add category indicator
                        this.commit(consts.CATEGORY_ADD_INDICATOR, false);
                        break;
                }
            }
        };

        ro.init(commit, obj.catObj, this);
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

    //Save category
    saveEditCategory({ commit }, obj) {
        let ro = {
            url: conf.CATEGORY_UPDATE,
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

                //Set edit category indicator
                this.commit(consts.CATEGORY_SAVING_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Category save success
                if (response.data.status == 1) {
                    //Save category in store
                    this.params.ufldsArr = response.data.ufldsArr;
                    this.params.uflds = this.params.ufldsArr;
                    this.commit(consts.SAVE_EDIT_CATEGORY, this.params);
                    this.commit(consts.VIS_EDIT_CATEGORY, { vis: false });
                    VueNotifications.success({
                        message: this.env.getters.tr("Category_save_success")
                    });

                    //Reset edit category indicator
                    this.commit(consts.CATEGORY_SAVING_INDICATOR, false);
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

                        //Reset edit category indicator
                        this.commit(consts.CATEGORY_SAVING_INDICATOR, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_category_saving") +
                                ": " +
                                er.message
                        });

                        //Reset edit category indicator
                        this.commit(consts.CATEGORY_SAVING_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr(
                                "Error_category_saving"
                            )
                        });

                        //Reset edit category indicator
                        this.commit(consts.CATEGORY_SAVING_INDICATOR, false);
                        break;
                }
            }
        };

        ro.init(commit, obj.editCatObj, this);
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
