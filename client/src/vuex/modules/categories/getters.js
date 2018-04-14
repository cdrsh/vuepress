import Vue from "vue";

//Root category name
let objAllCategories = {
    ru: "Все категории",
    en: "All categories",
    de: "Alle Kategorien",
    zh: "所有类别"
};

//Build breadcrumb
let addCategoryToBreadcrumb = (pid, arr, list) => {
    if (pid == -1) return;
    for (let i = 0; i < list.length; i++)
        if (list[i].id == pid) {
            arr.push(list[i]);
            addCategoryToBreadcrumb(list[i].pid, arr, list);
        }
};

//Compare by num sort function
let compare = function(a, b) {
    if (parseInt(a.num) < parseInt(b.num)) return -1;
    if (parseInt(a.num) > parseInt(b.num)) return 1;
    return 0;
};

export default {
    //Get all categories
    getAllCategories: state => state.list.sort(compare),

    //Get top views categories
    getMenuCategories: state => state.list_top,

    //Get breadcrumb to the active category
    getCategoriesBreadcrumb: (state, getters) => id => {
        let arr = [];
        addCategoryToBreadcrumb(id, arr, state.list);
        let lngsArr = getters.getLangsContentSelected;
        let allCategories = { id: -1, pid: -1 };
        for (let i = 0; i < lngsArr.length; i++)
            allCategories["name_" + lngsArr[i].code] =
                objAllCategories[lngsArr[i].code];
        arr.push(allCategories);

        //Reverse array
        return arr.reverse();
    },

    //Get active category object
    getCatObjActive: state => {
        let catObj = state.list.filter(itm => itm.id == state.catParentId);
        if (catObj != undefined && catObj.length > 0) return catObj[0];
        return { id: -1 };
    },

    //Active category ID
    getCatId: state => state.catParentId
};
