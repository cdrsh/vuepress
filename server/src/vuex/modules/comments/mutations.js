import * as consts from "./constants";
import Vue from "vue";
import * as conf from "../../../config";
export default {
    //+++allComments+++

    //Comments loaded
    [consts.COMMENTS_LOAD_SUCCESS](state, obj) {
        state.allComments = obj.comments;
        state.allCommentsLoaded = true;
        state.allCommentsPgNum = obj.pgNum;
        state.allCommentsAllItems = obj.itemsCount;
    },

    //Set comments load indicator
    [consts.COMMENTS_LOAD_INDICATOR](state, val) {
        state.allCommentsLoading = val;
    },

    //Set users block indicator
    [consts.COMMENTS_BLOCKUSERS_INDICATOR](state, val) {
        state.allCommentsUsersBlockIndicator = val;
    },

    //Users blocked success
    [consts.COMMENTS_BLOCKUSERS_SUCCESS](state, commentIds) {
        commentIds.map(cmntId => {
            state.allComments.map(itm => {
                if (itm.id == cmntId) {
                    itm.privlgs = 0x4 ^ itm.privlgs;
                    itm.isBlocked = conf.isBlocked(itm.privlgs);
                }
            });

            state.allCommentsFound.map(itm => {
                if (itm.id == cmntId) {
                    itm.privlgs = 0x4 ^ itm.privlgs;
                    itm.isBlocked = conf.isBlocked(itm.privlgs);
                }
            });
        });
    },

    //Set comments remove indicator
    [consts.COMMENTS_REMOVE_INDICATOR](state, val) {
        state.allCommentsRemoveIndicator = val;
    },

    //Prepare to edit comment
    [consts.COMMENTS_PREPARE_EDIT](state, id) {
        let obj = state.allComments.filter(itm => itm.id == id);
        if (obj !== undefined)
            if (obj.length > 0) state.defEditObj = Vue._.cloneDeep(obj[0]);
    },

    //Prepare to edit comment filtered
    [consts.COMMENTS_PREPARE_EDIT_FILTERED](state, id) {
        let obj = state.allCommentsFound.filter(itm => itm.id == id);
        if (obj !== undefined)
            if (obj.length > 0) state.defEditObj = Vue._.cloneDeep(obj[0]);
    },

    //Comment save success
    [consts.COMMENTS_SAVE_SUCCESS](state, comment) {
        let obj = state.allComments.filter(itm => itm.id == comment.id);
        if (obj !== undefined) if (obj.length > 0) obj[0].txt = comment.txt;

        obj = state.allCommentsFound.filter(itm => itm.id == comment.id);
        if (obj !== undefined) if (obj.length > 0) obj[0].txt = comment.txt;
    },

    //Set comment save indicator
    [consts.COMMENTS_SAVE_INDICATOR](state, val) {
        state.allCommentsSavingIndicator = val;
    },

    //Set comments find indicator
    [consts.COMMENTS_FIND_INDICATOR](state, val) {
        state.allCommentsFindIndicator = val;
    },

    //Comments find success
    [consts.COMMENTS_FIND_SUCCESS](state, obj) {
        state.allCommentsFound = obj.comments;
        state.allCommentsFoundPgNum = obj.pgNum;
        state.allCommentsFoundAllItems = obj.itemsCount;
        state.allCommentsFoundTxt = obj.findTxt;
        state.allCommentsFindIndicator = false;
    },

    //Comments removed success
    [consts.COMMENTS_REMOVE_SUCCESS](state) {
        state.allCommentsLoaded = false;
    },
    //---allComments---

    //+++by Users+++
    //Set users load indicator
    [consts.COMMENTS_USERSLOAD_INDICATOR](state, val) {
        state.byUsersLoadIndicator = val;
    },

    //Users load success
    [consts.COMMENTS_USERSLOAD_SUCCESS](state, obj) {
        state.byUsers = obj.users;
        state.byUsersPgNum = obj.pgNum;
        state.byUsersAllItems = obj.itemsCount;
    },

    //Set comments remove indicator
    [consts.COMMENTS_REMOVE_OF_USERS_INDICATOR](state, val) {
        state.byUsersRemoveIndicator = val;
    },

    //Comments of selected users remove
    [consts.COMMENTS_REMOVE_OF_USERS_SUCCESS](state, ids) {
        state.byUsers.map(itmByUsr => {
            ids.map(itm => {
                if (itmByUsr.id == itm) itmByUsr.cnt = 0;
            });
        });
    },

    //Set users block indicator
    [consts.COMMENTS_BLOCK_OF_USERS_INDICATOR](state, val) {
        state.byUsersBlockIndicator = val;
    },

    //Users block success
    [consts.COMMENTS_BLOCK_OF_USERS_SUCCESS](state, ids) {
        ids.map(itmIds => {
            state.byUsers.map(itm => {
                if (itm.id == itmIds) {
                    itm.isBlocked = !itm.isBlocked;
                    itm.privlgs = 0x4 ^ itm.privlgs;
                }
            });
        });
    },

    //Set comments load of one user indicator
    [consts.COMMENTS_LOAD_OF_ONE_USER_INDICATOR](state, val) {
        state.byUsersLoadOfOneUserIndicator = val;
    },

    //Comments load succes of one user
    [consts.COMMENTS_LOAD_OF_ONE_USER_SUCCESS](state, obj) {
        state.byUsersOneComment = obj.comments;
        state.byUsersOneCommentPgNum = obj.pgNum;
        state.byUsersOneCommentAllItems = obj.itemsCount;
    },

    //Set comments remove indicator of one user
    [consts.COMMENTS_REMOVE_OF_ONE_USER_INDICATOR](state, val) {
        state.byUsersOneCommentRemoveIndicator = val;
    },

    //Comments remove success of one user
    [consts.COMMENTS_REMOVE_OF_ONE_USER_SUCCESS](state, obj) {
        let usr = state.byUsers.filter(itm => itm.id == obj.usrid);
        if (usr !== undefined) {
            usr[0].cnt -= obj.cnt;
            if (usr[0].cnt < 0) usr[0].cnt = 0;
        }
    },

    //Prepare to edit comment of user
    [consts.COMMENTS_PREPARE_EDIT_OF_USER](state, id) {
        let obj = state.byUsersOneComment.filter(itm => itm.id == id);
        if (obj !== undefined)
            if (obj.length > 0) state.defEditObj = Vue._.cloneDeep(obj[0]);
    },

    //Comment saved success
    [consts.COMMENTS_SAVE_SUCCESS_OF_USER](state, comment) {
        let obj = state.byUsersOneComment.filter(itm => itm.id == comment.id);
        if (obj !== undefined) if (obj.length > 0) obj[0].txt = comment.txt;
    },
    //---by Users---

    //+++by Posts+++
    //Set load posts indicator
    [consts.COMMENTS_BY_POSTS_GET_INDICATOR](state, val) {
        state.byPostsLoading = val;
    },

    //Posts loaded
    [consts.COMMENTS_BY_POSTS_GET_SUCCESS](state, obj) {
        state.byPosts = obj.posts;
        state.byPostsAllItemsCount = obj.itemsCount;
        state.byPostsPgNum = obj.pgNum;
        state.byPostsFindTxt = obj.findTxt;
    },

    //Set remove comments indicator of post
    [consts.COMMENTS_REMOVE_OF_POST_INDICATOR](state, val) {
        state.byPostsRemoving = val;
    },

    //Comments removed success
    [consts.COMMENTS_REMOVE_OF_POST_SUCCESS](state, ids) {
        state.byPosts.map(itm => {
            ids.map(id => {
                if (itm.id == id) itm.cnt = 0;
            });
        });
    },

    //Set users blocking indicator by post
    [consts.COMMENTS_BLOCK_OF_POST_INDICATOR](state, val) {
        state.byPostsBlocking = val;
    },

    //Users blocked success
    [consts.COMMENTS_BLOCK_OF_POST_SUCCESS](state, ids) {
        state.byPosts.map(itm => {
            ids.map(id => {
                if (itm.id == id) {
                    itm.isBlocked = !itm.isBlocked;
                    itm.privlgs = 0x4 ^ itm.privlgs;
                }
            });
        });
    },
    //---by Posts---

    //+++by Posts One+++
    //Set comments loading indicator
    [consts.COMMENTS_BY_POSTS_GET_ONEPOST_INDICATOR](state, val) {
        state.byOnePostCommentsLoading = val;
    },

    //Set comments loading indicator
    [consts.COMMENTS_BY_POSTS_GET_ONEPOST_SUCCESS](state, obj) {
        state.byOnePostComments = obj.comments;
        state.byOnePostAllItemsCount = obj.itemsCount;
        state.byOnePostPgNum = obj.pgNum;
    },

    //Set remove comments indicator
    [consts.COMMENTS_REMOVE_OF_ONE_POST_INDICATOR](state, val) {
        state.byOnePostCommentsRemoving = val;
    },

    //Comments remove success
    [consts.COMMENTS_REMOVE_OF_ONE_POST_SUCCESS](state, obj) {
        let item = state.byPosts.filter(itm => itm.id == obj.postid);
        if (item !== undefined) {
            item[0].cnt -= obj.cnt;
            if (item[0].cnt < 0) item[0].cnt = 0;
        }
    },

    //Begin edit comment
    [consts.COMMENTS_PREPARE_EDIT_OF_POSTONE](state, id) {
        let obj = state.byOnePostComments.filter(itm => itm.id == id);
        if (obj !== undefined)
            if (obj.length > 0) state.defEditObj = Vue._.cloneDeep(obj[0]);
    },

    //Save comment
    [consts.COMMENTS_SAVE_OF_POSTONE](state, obj) {
        let item = state.byOnePostComments.filter(itm => itm.id == obj.id);
        if (item !== undefined) if (item.length > 0) item[0].txt = obj.txt;
    },

    //Set authors blocking indicator
    [consts.COMMENTS_BLOCK_OF_ONEPOST_INDICATOR](state, val) {
        state.byOnePostCommentsBlocking = val;
    },

    //Authors blocked success
    [consts.COMMENTS_BLOCK_OF_ONEPOST_SUCCESS](state, commentIds) {
        commentIds.map(cmntId => {
            state.byOnePostComments.map(itm => {
                if (itm.id == cmntId) {
                    itm.privlgs = 0x4 ^ itm.privlgs;
                    itm.isBlocked = conf.isBlocked(itm.privlgs);
                }
            });
        });
    },
    //---by Posts One---

    //+++by Posts One Find+++

    //Comments found success
    [consts.COMMENTS_BY_POSTS_FIND_ONEPOST_SUCCESS](state, obj) {
        state.byOnePostCommentsFound = obj.comments;
        state.byOnePostAllItemsCountFound = obj.itemsCount;
        state.byOnePostPgNumFound = obj.pgNum;
        state.byOnePostFindTxt = obj.findTxt;
    },

    //Comments find clear
    [consts.COMMENTS_CLEAR_FIND_OF_ONEPOST](state) {
        state.byOnePostCommentsFound = [];
        state.byOnePostAllItemsCountFound = 0;
        state.byOnePostPgNumFound = 1;
        state.byOnePostFindTxtFound = "";
    },

    //Authors in comments find success
    [consts.COMMENTS_BLOCK_OF_ONEPOST_FIND_SUCCESS](state, commentIds) {
        commentIds.map(cmntId => {
            state.byOnePostCommentsFound.map(itm => {
                if (itm.id == cmntId) {
                    itm.privlgs = 0x4 ^ itm.privlgs;
                    itm.isBlocked = conf.isBlocked(itm.privlgs);
                }
            });
        });
    },
    //---by Posts One Find---

    //+++by Categories+++
    //Set categories loading indicator
    [consts.COMMENTS_BY_CATEGORIES_GET_INDICATOR](state, val) {
        state.byCategoriesLoading = val;
    },

    //Categories load success
    [consts.COMMENTS_BY_CATEGORIES_GET_SUCCESS](state, categories) {
        state.byCategories = categories;
        state.byCategoriesLoaded = true;
    },

    //Set categories page number
    [consts.COMMENTS_BY_CATEGORIES_SET_PGNUM](state, pgNum) {
        state.byCategoriesPgNum = pgNum;
    },

    //Set category remove indicator
    [consts.COMMENTS_REMOVE_OF_CATEGORY_INDICATOR](state, val) {
        state.byCategoriesRemoving = val;
    },

    //Comments remove success
    [consts.COMMENTS_REMOVE_OF_CATEGORY_SUCCESS](state, ids) {
        //state.byCategoriesRemoving=ids;
    },

    //Set remove comment indicator
    [consts.COMMENTS_REMOVE_CATEGORY_ONE_INDICATOR](state, val) {
        state.byCategoriesRemoving = val;
    },
    //---by Categories---

    //+++By Categories One+++
    //Set commetns loading indicator
    [consts.COMMENTS_LOAD_CATEGORY_INDICATOR](state, val) {
        state.byCategoriesOneLoading = val;
    },

    //Comments loaded success
    [consts.COMMENTS_LOAD_COMMENTS_CATEGORY_SUCCESS](state, obj) {
        state.byCategoriesOneComment = obj.arr;
        state.byCategoriesOneAllItemsCount = obj.itemsCount;
        state.byCategoriesOnePgNum = obj.pgNum;
    },

    //Comments blocked success
    [consts.COMMENTS_BLOCK_USER_CATEGORY_ONE_SUCCESS](state, ids) {
        state.byCategoriesOneComment.map(itm => {
            ids.map(id => {
                if (itm.id == id) {
                    itm.isBlocked = !itm.isBlocked;
                    itm.privlgs = 0x4 ^ itm.privlgs;
                }
            });
        });
    },

    //Set users blocking indicator
    [consts.COMMENTS_BLOCK_USER_CATEGORY_ONE_INDICATOR](state, val) {
        state.byCategoriesOneBlocking = val;
    },

    //Set comment saving indicator
    [consts.COMMENTS_SAVE_CATEGORY_ONE_INDICATOR](state, val) {
        state.byCategoriesOneSaving = val;
    },

    //Comment saved success
    [consts.COMMENTS_SAVE_CATEGORY_ONE_SUCCESS](state, comment) {
        let obj = state.byCategoriesOneComment.filter(
            itm => itm.id == comment.id
        );
        if (obj !== undefined) if (obj.length > 0) obj[0].txt = comment.txt;
    },

    //Comments remove success
    [consts.COMMENTS_REMOVE_CATEGORY_ONE_SUCCESS](state, obj) {
        let catOne = state.byCategories.filter(itm => itm.id == obj.catid);
        if (catOne !== undefined) {
            catOne[0].cnt -= obj.ids;
            if (catOne[0].cnt < 0) catOne[0].cnt = 0;
        }
    },
    //---By Categories One---

    //Reset comments actions
    [consts.COMMENTS_INDICATOR_RESET](state) {
        state.allCommentsLoaded = false;
        state.allCommentsUsersBlockIndicator = false;
        state.allCommentsRemoveIndicator = false;
        state.allCommentsSavingIndicator = false;
        state.allCommentsFindIndicator = false;

        state.byUsersRemoveIndicator = false;
        state.byUsersBlockIndicator = false;
        state.byUsersLoadOfOneUserIndicator = false;
        state.byUsersOneCommentRemoveIndicator = false;

        state.byPostsRemoving = false;
        state.byPostsBlocking = false;

        state.byOnePostCommentsLoading = false;
        state.byOnePostCommentsRemoving = false;
        state.byOnePostCommentsBlocking = false;

        state.byCategoriesLoaded = false;
        state.byCategoriesRemoving = false;
        state.byCategoriesBlocking = false;

        state.byCategoriesOneLoading = false;
        state.byCategoriesOneRemoving = false;
        state.byCategoriesOneBlocking = false;
        state.byCategoriesOneSaving = false;
    }
};
