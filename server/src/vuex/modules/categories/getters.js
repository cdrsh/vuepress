import Vue from "vue";

//Build breadcrumbs
let addCategoryToBreadcrumb = (pid, arr, list) => {
    if (pid == -1) return;
    for (let i = 0; i < list.length; i++)
        if (list[i].id == pid) {
            arr.push(list[i]);
            addCategoryToBreadcrumb(list[i].pid, arr, list);
        }
};

//Root category breadcrumb
let objAllCategories = {
    ru: "Все категории",
    en: "All categories",
    de: "Alle Kategorien",
    zh: "所有类别"
};

//Sort function by num
let compare = function(a, b) {
    if (parseInt(a.num) < parseInt(b.num)) return -1;
    if (parseInt(a.num) > parseInt(b.num)) return 1;
    return 0;
};

export default {
    //Get active page number
    getActivePgNum: state => state.activePgNum,

    //Get all categories
    getAllCategories: state => state.list,

    //Get categories
    getCategories: state => {
        let list = state.list.filter(itm => itm.pid == state.catParentId);
        list = list.sort(compare);
        return list.slice(
            (state.activePgNum - 1) * state.itemsPerPage,
            state.activePgNum * state.itemsPerPage
        );
    },

    //Get categories load indicator
    getCategoriesStateLoading: state => state.categoryLoading,

    //Get categories items count
    getCategoriesItemsCount: state => {
        return state.list.filter(itm => itm.pid == state.catParentId).length;
    },

    //Get categories items count of post
    getCategoriesItemsCountForPost: (state, getters) => {
        return state.list.filter(itm => itm.pid == getters.getCatParentPostId)
            .length;
    },

    //Get categories count per page
    getCategoriesItemsPerPage: state => state.itemsPerPage,

    //Get active category ID
    getCategoriyActiveID: state => state.catParentId,

    //Get categories breadcrumb to current category
    getCategoriesBreadcrumb: (state, getters) => {
        let arr = [];
        addCategoryToBreadcrumb(state.catParentId, arr, state.list);
        let lngsArr = getters.getLangsContentSelected;
        let allCategories = { id: -1, pid: -1 };
        for (let i = 0; i < lngsArr.length; i++)
            allCategories["name_" + lngsArr[i].code] =
                objAllCategories[lngsArr[i].code];
        arr.push(allCategories);

        //Reverse array
        return arr.reverse();
    },

    //Get category init object with names prefix
    getCategoriesObjToAdd: (state, getters) => {
        let CategoriesObj = {};
        getters.getLangsContentSelected.map(itm => {
            CategoriesObj[itm.code] = { name: "" };
        });
        return CategoriesObj;
    },

    //Get categories names to edit
    getCategoriesNamesToEdit: (state, getters) => {
        let CategoriesObj = {};
        getters.getLangsContentSelected.map(itm => {
            CategoriesObj["name_" + itm.code] = "";
        });
        return CategoriesObj;
    },

    //Get visible add categories dialog
    getVisAddCategory: state => state.visAddCategory,

    //Get visible edit categories dialog
    getVisEditCategory: state => state.visEditCategory,

    //Get edit object category
    getEditCatObj: state => state.editCatObj,

    //Get save category indicator
    getSaveIndicatorCategory: state => state.categorySaving,

    //Get add category indicator
    getAddIndicatorCategory: state => state.categoryAdding,

    //Get remove category indicator
    getOneCategoryRemoving: state => state.categoryOneRemoving,

    //Get checked categories
    getChkdCategories: state => state.list.filter(itm => itm.chkd),

    //Get array of children categories in current leaf as ids list
    getLeafChildrenCategories: (state, getters) => id => {
        let arrIds = state.list.filter(itm => itm.pid == id).map(itm => itm.id);
        if (arrIds.length == 0) return;
        let chldrnList = [];
        for (let i = 0; i < arrIds.length; i++) {
            let tmp = getters.getLeafChildrenCategories(arrIds[i]);
            if (tmp !== undefined) chldrnList = [...chldrnList, ...tmp];
        }
        return [...arrIds, ...chldrnList];
    },

    //Get filter mode
    getCategoryFilterMode: state => state.categoryFilterMode,

    //Get filtered categories
    getFilteredCategories: state => langCode => {
        let arr = [];
        if (state.categoryFilterText == "") arr = state.list;
        else
            arr = state.list.filter(
                itm =>
                    itm["name_" + langCode].indexOf(state.categoryFilterText) !=
                    -1
            );
        state.itemsCountFiltered = arr.length;
        return arr.slice(
            (state.activePgNumFiltered - 1) * state.itemsPerPage,
            state.activePgNumFiltered * state.itemsPerPage
        );
    },

    //Get filtered categories items
    getFilteredCategoriesItemsCount: state => state.itemsCountFiltered,

    //Get one category by id
    getCategoryById: state => id => state.list.filter(itm => itm.id == id),

    //Get move category indicator
    getCategoryMoving: state => state.categoryMoving
};
