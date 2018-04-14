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

//Root category object
let objAllCategories = {
    ru: "Все категории",
    en: "All categories",
    de: "All categories-de",
    zh: "All categories-zh"
};

//Sort by number function
let compare = function(a, b) {
    if (parseInt(a.num) < parseInt(b.num)) return -1;
    if (parseInt(a.num) > parseInt(b.num)) return 1;
    return 0;
};

export default {
    //Get post list
    getPostList: state => state.post_list,

    //Get posts loading indicator
    getPostLoadingIndicator: state => state.postsLoading,

    //Get posts items per page
    getItemsPostPerPage: state => state.itemsPerPage,

    //Get all posts count
    getItemsPostCount: state => state.itemsCount,

    //Get show/hide edit post dialog
    getEditPostVis: state => state.visEditPost,

    //Get show/hide add post dialog
    getAddPostVis: state => state.visAddPost,

    //Get posts removing indicator
    getPostsRemoving: state => state.postsRemoving,

    //Get current category breadcrumb
    getPostsCategoriesBreadcrumb: (state, getters) => {
        let arr = [];
        let list = getters.getAllCategories;
        addCategoryToBreadcrumb(state.catParentPostId, arr, list);
        let lngsArr = getters.getLangsContentSelected;
        let allCategories = { id: -1, pid: -1 };
        for (let i = 0; i < lngsArr.length; i++)
            allCategories["name_" + lngsArr[i].code] =
                objAllCategories[lngsArr[i].code];
        arr.push(allCategories);
        //Reverse array
        return arr.reverse();
    },

    //Get current category breadcrumb in post dialog
    getPostsCategoriesBreadcrumbSelected: (state, getters) => {
        let arr = [];
        let list = getters.getAllCategories;
        addCategoryToBreadcrumb(state.catParentPostIdSelected, arr, list);
        let lngsArr = getters.getLangsContentSelected;
        let allCategories = { id: -1, pid: -1 };
        for (let i = 0; i < lngsArr.length; i++)
            allCategories["name_" + lngsArr[i].code] =
                objAllCategories[lngsArr[i].code];
        arr.push(allCategories);
        //Reverse array
        return arr.reverse();
    },

    //Get post active ID
    getPostCategoriyActiveID: state => state.catParentPostId,

    //Get post active ID selected
    getPostCategoriyActiveIDSelected: state => state.catParentPostIdSelected,

    //Get post categories
    getPostCategories: (state, getters) => {
        let list = getters.getAllCategories.filter(
            itm => itm.pid == state.catParentPostId
        );
        list = list.sort(compare);
        list = list.slice(
            (state.activePostPgNumSelCat - 1) * state.itemsPerPage,
            state.activePostPgNumSelCat * state.itemsPerPage
        );
        for (let i = 0; i < list.length; i++)
            list[i].hasChildred =
                getters.getAllCategories.filter(itm => list[i].id == itm.pid)
                    .length > 0;
        return list;
    },

    //Get category ID to select posts
    getCatParentPostId: state => state.catParentPostId,

    //Get Edit post object
    getEditPostObj: state => state.editPostObj,

    //Get paginator data
    getPaginatorData: state => {
        return {
            itemsPerPage: state.itemsPerPage
        };
    },

    //Get posts page number
    getPostListPgNum: state => state.postListPgNum,

    //Get add post object
    getAddPostObj: state => state.addPostObj,

    //+++Post find
    //Get post found paginator data
    getPostPaginatorData: state => {
        return {
            postItemsFoundCount: state.postItemsFoundCount,
            postItemsPerPageFound: state.postItemsPerPageFound,
            postListFoundPgNum: state.postListFoundPgNum,
            findTxt: state.findTxt,
            findBy: state.findBy
        };
    },

    //Get posts found list
    getPostListFound: state => state.postListFound,

    //Get posts adding incdicator
    getPostIndicatorAdding: state => state.postIndicatorAdding,

    //Get one post loading to edit incdicator
    getVisEditPostLoading: state => state.visEditPostLoading,

    //Get one post saving incdicator
    getVisPostSaving: state => state.visPostSaving,

    //Get post find incdicator
    getPostIndicatorFinding: state => state.postIndicatorFinding
};
