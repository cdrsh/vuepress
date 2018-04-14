import * as consts from "./constants";
import Vue from "vue";

export default {
    //Set categories load indicator
    [consts.CATEGORY_LOADING_INDICATOR](state, val) {
        state.categoryLoading = val;
    },

    //Category load success
    [consts.CATEGORY_LOAD_SUCCESS](state, list) {
        state.list = list;
        state.itemsCount = state.list.filter(
            itm => itm.pid == state.catParentId
        ).length;
        state.pagesCount =
            state.itemsCount / state.itemsPerPage < 1
                ? 1
                : Math.ceil(state.itemsCount / state.itemsPerPage);
    },

    //Set category page number
    [consts.SET_CATEGORIES_PAGE_NUM](state, pgNum) {
        state.activePgNum = pgNum;
    },

    //Enter to category
    [consts.CATEGORY_ENTER](state, catObj) {
        state.activePgNum = 1;
        state.catParentId = catObj.id;
        state.idLeaf = catObj.idleaf == undefined ? -1 : catObj.idleaf;
        state.itemsCount = state.list.filter(
            itm => itm.pid == state.catParentId
        ).length;
        state.pagesCount =
            state.itemsCount / state.itemsPerPage < 1
                ? 1
                : Math.ceil(state.itemsCount / state.itemsPerPage);
    },

    //Add category to client
    [consts.CATEGORY_ADD](state, catObj) {
        let insCategoryObj = {
            id: catObj["id"],
            pid: catObj["pid"],
            dt: catObj["dt"],
            idleaf: catObj["idleaf"],
            kwrds: catObj["keyWords"]["keyWords"],
            kwrdson: catObj["keyWords"]["keyWordsSelfOn"],
            orderby: catObj["order"]["orderby"],
            auto_numerate: catObj["order"]["autoNumerate"],
            user_fields_on: catObj["userFields"]["userFieldsOn"],
            uflds: catObj["uflds"],
            num: parseInt(catObj["num"]),
            chkd: false
        };
        for (let itm in catObj["names"])
            insCategoryObj["name_" + itm] = catObj["names"][itm].name;

        //Categories add 1
        state.itemsCount++;

        //Set leaf id if it is root category
        if (catObj["pid"] == -1) state.idLeaf = catObj["idleaf"];

        Vue.set(state.list, state.list.length, insCategoryObj);
    },

    //Set add category indicator
    [consts.CATEGORY_ADD_INDICATOR](state, val) {
        state.categoryAdding = val;
    },

    //Show/Hide add category dialog
    [consts.VIS_ADD_CATEGORY](state, val) {
        state.visAddCategory = val;
    },

    //Show/hide edit category dialog
    [consts.VIS_EDIT_CATEGORY](state, obj) {
        state.visEditCategory = obj.vis;
    },

    //Begin edit category
    [consts.BEGIN_EDIT_CATEGORY](state, obj) {
        if (obj.vis) {
            let li = state.list.filter(itm => itm.id == obj.id);
            if (li.length > 0) {
                let edObj = Vue._.cloneDeep(li[0]);
                edObj["name"] = edObj["name_" + obj.contentLang[0].code];
                edObj["kwrdson"] = edObj["kwrdson"] == 1 ? true : false;
                edObj["user_fields_on"] =
                    edObj["user_fields_on"] == 1 ? true : false;
                edObj["kwrds"] = edObj["kwrds"].split(",");
                state.editCatObj = edObj;
            }
        }
    },

    //Set category save indicator
    [consts.CATEGORY_SAVING_INDICATOR](state, val) {
        state.categorySaving = val;
    },

    //Save edit category
    [consts.SAVE_EDIT_CATEGORY](state, obj) {
        obj.kwrds = obj.kwrds.join(",");
        obj.kwrdson = obj.kwrdson ? "1" : "0";
        delete obj["name"];
        obj.user_fields_on = obj.user_fields_on ? "1" : "0";
        for (let i = 0; i < state.list.length; i++) {
            if (state.list[i].id == obj.id) {
                Vue.set(state.list, i, obj);
                break;
            }
        }
    },

    //Set remove category indicator
    [consts.CATEGORY_REMOVING_INDICATOR](state, val) {
        state.categoryOneRemoving = val;
    },

    //Remove category
    [consts.CATEGORY_REMOVE](state, id) {
        for (let i = 0; i < state.list.length; i++)
            if (state.list[i].id == id) {
                state.list.splice(i, 1);
                state.itemsCount = state.itemsCount - 1;
                let pagesCount =
                    state.itemsCount / state.itemsPerPage < 1
                        ? 1
                        : Math.ceil(state.itemsCount / state.itemsPerPage);
                if (state.activePgNum > pagesCount)
                    state.activePgNum = pagesCount;
                break;
            }
    },

    //Remove checked categories
    [consts.CATEGORIES_REMOVE](state, ids) {
        let cnt = state.itemsCount;
        for (let j = 0; j < ids.length; j++)
            for (let i = state.list.length - 1; i >= 0; i--)
                if (state.list[i].id == ids[j]) {
                    state.list.splice(i, 1);
                    cnt--;
                    break;
                }
        state.itemsCount = cnt;
        let pagesCount =
            state.itemsCount / state.itemsPerPage < 1
                ? 1
                : Math.ceil(state.itemsCount / state.itemsPerPage);
        if (state.activePgNum > pagesCount) state.activePgNum = pagesCount;
    },

    //Set move category indicator
    [consts.CATEGORY_MOVING_INDICATOR](state, val) {
        state.categoryMoving = val;
    },

    //Move category
    [consts.CATEGORY_MOVE](state, obj) {
        let obj1 = state.list.filter(itm => itm.id == obj.id1)[0];
        let obj2 = state.list.filter(itm => itm.id == obj.id2)[0];
        let tmp = parseInt(obj1.num);
        obj1.num = parseInt(obj2.num);
        obj2.num = tmp;
    },

    //set filter categories mode
    [consts.SET_CATEGORY_FILTER_MODE](state, val) {
        state.categoryFilterMode = val;
        state.categoryFilterText = "";
    },

    //Set category filter text
    [consts.SET_CATEGORY_FILTER_TEXT](state, txt) {
        state.categoryFilterText = txt;
    },

    //Set filtered categories page number
    [consts.SET_FILTERED_CATEGORY_PAGE_NUM](state, pgNum) {
        state.activePgNumFiltered = pgNum;
    },

    //Reset categories actions
    [consts.CATEGORY_ACTION_RESET](state) {
        state.categoryAdding = false;
        state.categorySaving = false;
        state.categoryOneRemoving = false;
        state.categoryMoving = false;
        state.categoryFilterMode = false;
        state.visAddCategory = false;
        state.visEditCategory = false;
    }
};
