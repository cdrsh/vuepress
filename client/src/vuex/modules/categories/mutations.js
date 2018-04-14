import * as consts from "./constants";
import Vue from "vue";

//Sort compare function by views
let compareCatViews = function(a, b) {
    if (parseInt(a.vws) > parseInt(b.vws)) return -1;
    if (parseInt(a.vws) < parseInt(b.vws)) return 1;
    return 0;
};

export default {
    //Set categories loading indicator
    [consts.CATEGORY_LOADING_INDICATOR](state, val) {
        state.categoryLoading = val;
    },

    //Save categories list
    [consts.CATEGORY_LOAD_SUCCESS](state, list) {
        state.list = list;
        state.itemsCount = state.list.filter(
            itm => itm.pid == state.catParentId
        ).length;
        state.pagesCount =
            state.itemsCount / state.itemsPerPage < 1
                ? 1
                : Math.ceil(state.itemsCount / state.itemsPerPage);
        state.list_top = state.list.sort(compareCatViews).slice(0, 2);
    },

    //Set categories id
    [consts.SET_CATID](state, catId) {
        state.catParentId = catId;
    },

    //Set categories page num
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

    //Add category on client
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

        //Categories items count +1
        state.itemsCount++;

        //Set leaf id if it is a root category
        if (catObj["pid"] == -1) state.idLeaf = catObj["idleaf"];

        Vue.set(state.list, state.list.length, insCategoryObj);
    },

    //Add category indicator
    [consts.CATEGORY_ADD_INDICATOR](state, val) {
        state.categoryAdding = val;
    },

    //Reset actions indicators
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
