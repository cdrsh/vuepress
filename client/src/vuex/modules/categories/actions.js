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
        for (let j = 0; j < arrVals.length; j++)
            strOut += itm + ": " + arrVals[j] + "<br>";
    }
    return strOut;
};

//Convert Array to Tree by pid->id
let parseCategoriesToTree = (arr, arrTree) => {
    arrTree.map(itm => {
        for (let i = 0; i < arr.length; i++)
            if (arr[i].pid == itm.id) {
                arr[i].lvl = itm.lvl + 1;
                if (arr[i].lvl > 10) arr[i].lvl = 10;
                itm.children.push(arr[i]);
            }
        if (itm.children.length > 0) parseCategoriesToTree(arr, itm.children);
    });
};

//Sort by num function
let compare = function(a, b) {
    if (parseInt(a.num) < parseInt(b.num)) return -1;
    if (parseInt(a.num) > parseInt(b.num)) return 1;
    return 0;
};

//Convert tree to array
let parseCategoriesToArr = (сategoriesAsArr, сategoriesAsTree) => {
    сategoriesAsTree.map(itm => {
        сategoriesAsArr.push(itm);
        if (itm.children.length > 0)
            parseCategoriesToArr(сategoriesAsArr, itm.children);
    });
};

export default {
    //Load all categories
    loadAllCategories({ commit }, obj) {
        let ro = {
            url: this.getters.API + conf.CATEGORY_GET,
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
                this.params = obj;
                this.commit = commit;
                this.env = env;

                //Set load indicator
                this.commit(consts.CATEGORY_LOADING_INDICATOR, true);
            },

            onSuccess: function(response) {
                //Server error
                if (response.data.status == 0) throw response.data.err;

                //Categories load success
                if (response.data.status == 1) {
                    response.data.categories.map(itm => {
                        itm.num = parseInt(itm.num);
                        itm.auto_numerate = itm.auto_numerate == "1";
                        itm.lvl = 0;

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

                    let categories = response.data.categories;

                    //Rss map to categories
                    categories.map(itm => {
                        response.data.rss.map(rssOne => {
                            if (
                                rssOne.category.filter(el => el == itm.id)
                                    .length > 0
                            ) {
                                if (itm.is_rss == -1) itm.is_rss = [rssOne];
                                else itm.is_rss.push(rssOne);
                            }
                        });
                    });

                    //Build tree categories
                    if (this.env.getters.getSettings.CATEGORIES_TREE_LPANEL) {
                        let categoriesAsTree = [];
                        categories.map(itm => {
                            if (itm.pid == -1 || itm.pid == "-1")
                                categoriesAsTree.push(itm);
                            itm.children = [];
                        });

                        categoriesAsTree = categoriesAsTree.sort(compare);
                        parseCategoriesToTree(categories, categoriesAsTree);

                        let categoriesAsArr = [];
                        parseCategoriesToArr(categoriesAsArr, categoriesAsTree);

                        categoriesAsArr.map(itm => {
                            delete itm.children;
                        });

                        categories = categoriesAsArr;
                    }

                    //Save categories
                    this.commit(consts.CATEGORY_LOAD_SUCCESS, categories);

                    //Reset load indicator
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
                        //Reset category load indicator
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
                        //Reset category load indicator
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
                        //Reset category load indicator
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

    //Set active category id
    setCatId({ commit }, catId) {
        this.commit(consts.SET_CATID, catId);
    }
};
