import Vue from "vue";

let defaultPostObj = {
    id: -1,
    dt: "",
    ispub: "1",
    title_en: "",
    txt_en: "",
    kwrds: ""
};

export default {
    postsLoading: false,

    itemsPerPage: 10,
    itemsCount: 1,
    post_list: [],
    visAddPost: false,
    postsRemoving: false,

    catParentPostIdSelected: -1,

    catParentPostId: -1,
    idLeaf: -1,
    activePostPgNumSelCat: 1,
    itemsPostCategoriesCount: 1,
    pagesCategoryCount: 1,

    //postlist
    postListPgNum: 1,

    //post edit
    visEditPost: false,
    visEditPostLoading: false,
    editPostObj: defaultPostObj,
    visPostSaving: false,
    postIndicatorAdding: false,

    addPostObj: {
        id: -1,
        dt: "",
        ispub: "1",
        title_en: "",
        txt_en: "",
        kwrds: ""
    },

    //post find
    postListFound: [],
    postListFoundPgNum: 1,
    postIndicatorFinding: false,
    postItemsFoundCount: 0,
    postItemsPerPageFound: 10,
    postFindTxt: "",
    postFindBy: ""
};
