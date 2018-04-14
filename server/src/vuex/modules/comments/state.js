import Vue from "vue";

export default {
    //All comments
    defEditObj: {
        id: -1,
        pid: -1,
        idleaf: -1,
        usrid: -1,
        txt: "",
        dt: "",
        num: -1,
        isBlocked: false
    },
    allComments: [],
    allCommentsAllItems: 0,
    allCommentsItemsPerPage: 10,
    allCommentsLoading: false,
    allCommentsPgNum: 1,
    allCommentsLoaded: false,
    allCommentsUsersBlockIndicator: false,
    allCommentsRemoveIndicator: false,
    allCommentsSavingIndicator: false,
    allCommentsFindIndicator: false,
    //find res
    allCommentsFoundTxt: "",
    allCommentsFound: [],
    allCommentsFoundPgNum: 1,
    allCommentsFoundAllItems: 0,

    //byUsers
    byUsers: [],
    byUsersItemsPerPage: 10,
    byUsersRemoveIndicator: false,
    byUsersBlockIndicator: false,
    byUsersLoadIndicator: false,
    byUsersLoadOfOneUserIndicator: false,
    byUsersPgNum: 1,
    byUsersAllItems: 0,
    //byUsers one user comment
    byUsersOneComment: [],
    byUsersOneCommentPgNum: 1,
    byUsersOneCommentAllItems: 0,
    byUsersOneCommentRemoveIndicator: false,

    //byPosts
    byPosts: [],
    byPostsItemsPerPage: 10,
    byPostsAllItemsCount: 0,
    byPostsLoading: false,
    byPostsPgNum: 1,
    byPostsRemoving: false,
    byPostsBlocking: false,
    byPostsFindTxt: "",

    //byPost One
    byOnePostCommentsLoading: false,
    byOnePostCommentsRemoving: false,
    byOnePostCommentsBlocking: false,
    byOnePostComments: [],
    byOnePostAllItemsCount: 0,
    byOnePostPgNum: 1,
    byOnePostFindTxt: "",

    //byPost One found
    byOnePostCommentsFound: [],
    byOnePostAllItemsCountFound: 0,
    byOnePostPgNumFound: 1,

    //byCategories
    byCategories: [],
    byCategoriesLoading: false,
    byCategoriesLoaded: false,
    byCategoriesItemsPerPage: 10,
    byCategoriesAllItemsCount: 0,
    byCategoriesPgNum: 1,
    byCategoriesRemoving: false,
    byCategoriesBlocking: false,
    byCategoriesFindTxt: "",

    //byCategoriesOne
    byCategoriesOneComment: [],
    byCategoriesOneLoading: false,
    byCategoriesOneItemsPerPage: 10,
    byCategoriesOneAllItemsCount: 0,
    byCategoriesOnePgNum: 1,
    byCategoriesOneRemoving: false,
    byCategoriesOneBlocking: false,
    byCategoriesOneSaving: false,
    byCategoriesOneFindTxt: ""
};
