import Vue from "vue";

//Построить хлебные крошки
let addCategoryToBreadcrumb = (pid, arr, list) => {
    if (pid == -1) return;
    for (let i = 0; i < list.length; i++)
        if (list[i].id == pid) {
            arr.push(list[i]);
            addCategoryToBreadcrumb(list[i].pid, arr, list);
        }
};

let objAllCategories = {
    ru: "Все категории",
    en: "All categories",
    de: "All categories-de",
    zh: "All categories-zh"
};

let compare = function(a, b) {
    if (parseInt(a.num) < parseInt(b.num)) return -1;
    if (parseInt(a.num) > parseInt(b.num)) return 1;
    return 0;
};

export default {
    //Get indicator ope post load
    getPostOneLoadIndicator: state => state.postOneLoadIndicator,

    //Get active one post
    getPostActive: state => state.postActive,

    //Get active one post by id
    getPostActiveById: state => id => {
        let onePost = state.postList.filter(itm => itm.id == id);
        if (onePost == undefined || onePost.length == 0) return -1;
        return onePost[0];
    },

    //Get posts
    getPostList: state => state.postList,

    //Get posts loading indicator
    getPostLoadingIndicator: state => state.postsLoading,

    //Get post params to request post list
    getPostParams: (state, getters) => {
        return {
            count: state.postList.length,
            itemsPerPage: state.itemsPerPage,
            catId: getters.getCatId
        };
    },

    //get all posts loaded in list
    getFullLoaded: state => state.fullLoaded,

    //Get posts per page
    getItemsPostPerPage: state => state.itemsPerPage,

    //Get search panel show/hide
    getVisSearchPanel: state => state.visSearchPanel,

    //Get active category id
    getCatParentPostId: state => state.catParentPostId
};
