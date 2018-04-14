import * as consts from "./constants";
import Vue from "vue";

export default {
    //Posts load success
    [consts.POSTS_LOAD](state, posts) {
        state.post_list = posts;
    },

    //Set posts loading indiactor
    [consts.POSTS_INDICATOR_LOADING](state, val) {
        state.postsLoading = val;
    },

    //Get posts paginator data
    [consts.POST_GET_PAGINATOR_DATA](state, cnt) {
        state.itemsCount = cnt;
    },

    //Get show/hide post edit dialog
    [consts.SHOW_EDIT_POST](state, vis) {
        state.visEditPost = vis;
    },

    //Set add post dialog
    [consts.SHOW_ADD_POST](state, vis) {
        state.visAddPost = vis;
    },

    //Set removing post indicator
    [consts.POSTS_INDICATOR_REMOVING](state, val) {
        state.postsRemoving = val;
    },

    //Remove posts success
    [consts.REMOVE_POSTS](state, ids) {
        let cnt = state.itemsCount;
        for (let j = 0; j < ids.length; j++)
            for (let i = state.post_list.length - 1; i >= 0; i--)
                if (state.post_list[i].id == ids[j]) {
                    state.post_list.splice(i, 1);
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

    //Enter category
    [consts.POST_CATEGORY_ENTER](state, catObj) {
        state.activePostPgNumSelCat = 1;
        state.catParentPostId = catObj.id;
        state.idLeaf = catObj.idleaf;
        state.itemsPostCategoriesCount = this.getters.getAllCategories.filter(
            itm => itm.pid == state.catParentId
        ).length;
        state.pagesCategoryCount =
            state.itemsPostCategoriesCount / state.itemsPerPage < 1
                ? 1
                : Math.ceil(
                      state.itemsPostCategoriesCount / state.itemsPerPage
                  );
    },

    //Set category page number
    [consts.SET_POST_CATEGORIES_PAGE_NUM](state, pgNum) {
        state.activePostPgNumSelCat = pgNum;
    },

    //Select category in post dialogs
    [consts.SELECT_POST_CATEGORY](state, catId) {
        state.catParentPostIdSelected = catId;
        state.catParentPostId = catId;
    },

    //Prepare post edit
    [consts.POST_PREPARE_EDIT](state, postFrSrv) {
        state.editPostObj = postFrSrv;
    },

    //Set post edit show/hide dialog
    [consts.POST_EDIT_LOAD_INDICATOR](state, vis) {
        state.visEditPostLoading = vis;
    },

    //Categories selected in post edit dialog
    [consts.SELECT_CATEGORY_POST_EDIT](state, categories) {
        state.editPostObj.categories = Vue._.cloneDeep(categories);
    },

    //Set post saving indicator
    [consts.POST_INDICATOR_SAVING](state, vis) {
        state.visPostSaving = vis;
    },

    //Set page number in post list
    [consts.SET_POSTLIST_PGNUM](state, pgNum) {
        state.postListPgNum = pgNum;
    },

    //Set adding post indicator
    [consts.POST_INDICATOR_ADDING](state, val) {
        state.postIndicatorAdding = val;
    },

    //Set posts text find
    [consts.SET_FIND_TEXT_POST](state, obj) {
        state.postListFound = obj.postListFound;
        state.postListFoundPgNum = obj.postListFoundPgnum;
        state.postItemsFoundCount = obj.itemsCount;
        state.postFindTxt = obj.findTxt;
        state.postFindBy = obj.findBy;
    },

    //Set posts find indicator
    [consts.POST_INDICATOR_FINDING](state, val) {
        state.postIndicatorFinding = val;
    }
};
