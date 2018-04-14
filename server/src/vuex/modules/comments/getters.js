import Vue from "vue";
export default {
    //+++All comments+++

    //Get all comments
    getAllComments: state => state.allComments,

    //Get all comments load indicator
    getAllCommentsLoading: state => state.allCommentsLoading,

    //Get root comments per page
    getAllCommentsItemsPerPage: state => state.allCommentsItemsPerPage,

    //Get all comments page number
    getAllCommentsPgNum: state => state.allCommentsPgNum,

    //Get all comments loaded flag
    getAllCommentsLoaded: state => state.allCommentsLoaded,

    //Get all comments count
    getAllCommentsAllItems: state => state.allCommentsAllItems,

    //Get comment to edit by id
    getCommentToEditById: state => state.defEditObj,

    //Get comment find text
    getAllCommentsFindTxt: state => state.allCommentsFindTxt,

    //Find all comments
    //Get all found comments
    getAllCommentsFound: state => state.allCommentsFound,

    //Get all comments found page number
    getAllCommentsFoundPgNum: state => state.allCommentsFoundPgNum,

    //Get all comments found count
    getAllCommentsFoundAllItems: state => state.allCommentsFoundAllItems,

    //Get find comments text
    getFindTxt: state => state.allCommentsFoundTxt,

    //Get all comments users block indicator
    getAllCommentsUsersBlockIndicator: state =>
        state.allCommentsUsersBlockIndicator,

    //Get all comments remove indicator
    getAllCommentsRemoveIndicator: state => state.allCommentsRemoveIndicator,

    //Get all comments save comment indicator
    getAllCommentsSavingIndicator: state => state.allCommentsSavingIndicator,

    //Get all comments find indicator
    getAllCommentsFindIndicator: state => state.allCommentsFindIndicator,
    //---All Comments---

    //+++by Users+++
    //Get users
    getByUsersItems: state => state.byUsers,

    //Get all users count
    getByUsersAllItems: state => state.byUsersAllItems,

    //Get users page number
    getByUsersPgNum: state => state.byUsersPgNum,

    //Get users blocking indicator
    getByUsersBlockIndicator: state => state.byUsersBlockIndicator,

    //+++One user

    //Get commetns by one user
    getByUsersOneComment: state => state.byUsersOneComment,

    //Get commetns by one user page number
    getByUsersOneCommentPgNum: state => state.byUsersOneCommentPgNum,

    //Get all comments count by one user
    getByUsersOneCommentAllItems: state => state.byUsersOneCommentAllItems,

    //Get author block indicator by one user view
    getByUsersLoadOfOneUserIndicator: state =>
        state.byUsersLoadOfOneUserIndicator,

    //Get comment remove indicator by one user view
    getByUsersOneCommentRemoveIndicator: state =>
        state.byUsersOneCommentRemoveIndicator,
    //---One user

    //Get comment to edit by id
    getCommentOfUserToEditById: state => state.defEditObj,

    //Get load users indicator
    getByUsersLoadIndicator: state => state.byUsersLoadIndicator,

    //Get remove comments by user indicator
    getByUsersRemoveIndicator: state => state.byUsersRemoveIndicator,
    //---by Users---

    //+++byPosts+++
    //Get post list
    getByPosts: state => state.byPosts,

    //Get posts per page
    getByPostsItemsPerPage: state => state.byPostsItemsPerPage,

    //Get all posts count
    getByPostsAllItemsCount: state => state.byPostsAllItemsCount,

    //Get posts page number
    getByPostsPgNum: state => state.byPostsPgNum,

    //Get posts loading indicator
    getByPostsLoading: state => state.byPostsLoading,

    //Get posts remove comments indicator
    getByPostsRemoving: state => state.byPostsRemoving,

    //Get post users blocking indicator
    getByPostsBlocking: state => state.byPostsBlocking,

    //---byPosts---

    //+++by post one
    //Get comments
    getByOnePostComments: state => state.byOnePostComments,

    //Get all comments count
    getByOnePostAllItemsCount: state => state.byOnePostAllItemsCount,

    //Get comments page number
    getByOnePostPgNum: state => state.byOnePostPgNum,

    //Get comments find text
    getByOnePostFindTxt: state => state.byOnePostFindTxt,

    //Get comments remove indicator
    getByOnePostCommentsRemoving: state => state.byOnePostCommentsRemoving,

    //Get users blocking indicator
    getByOnePostCommentsBlocking: state => state.byOnePostCommentsBlocking,
    //---by post one

    //+++by post one found
    //Get comments found
    getByOnePostCommentsFound: state => state.byOnePostCommentsFound,

    //Get all comments found count
    getByOnePostAllItemsCountFound: state => state.byOnePostAllItemsCountFound,

    //Get comments found page number
    getByOnePostPgNumFound: state => state.byOnePostPgNumFound,
    //---by post one found

    //+++byCategories+++
    //Get all categories list
    getByCategories: state => {
        //byCategoriesFindTxt-доделать тут с поиском
        let pgNum = state.byCategoriesPgNum;
        //console.log(pgNum);
        let itemsPerPage = state.byCategoriesItemsPerPage;
        return state.byCategories.slice(
            (pgNum - 1) * itemsPerPage,
            pgNum * itemsPerPage
        );
    },

    //Get categories per page
    getByCategoriesItemsPerPage: state => state.byCategoriesItemsPerPage,

    //Get all categories count
    getByCategoriesAllItemsCount: state => state.byCategories.length,

    //Get categories page number
    getByCategoriesPgNum: state => state.byCategoriesPgNum,

    //Get categories loaded flag
    getByCategoriesLoaded: state => state.byCategoriesLoaded,

    //Get categories text find
    getByCategoriesFindTxt: state => state.byCategoriesFindTxt,

    //Get categories load indicator
    getByCategoriesLoading: state => state.byCategoriesLoading,

    //Get categories remove comments indicator
    getByCategoriesRemoving: state => state.byCategoriesRemoving,
    //---byCategories---

    //+++byCategoriesOne+++
    //Get comments loaded
    getByCategoriesOneComment: state => state.byCategoriesOneComment,

    //Get comments per page
    getByCategoriesOneItemsPerPage: state => state.byCategoriesOneItemsPerPage,

    //Get all comments count
    getByCategoriesOneAllItemsCount: state =>
        state.byCategoriesOneAllItemsCount,

    //Get comments page number
    getByCategoriesOnePgNum: state => state.byCategoriesOnePgNum,

    //Get comments find text
    getByCategoriesOneFindTxt: state => state.byCategoriesOneFindTxt,

    //Get comments load indicator
    getByCategoriesOneLoading: state => state.byCategoriesOneLoading,

    //Get authors blocking indicator
    getByCategoriesOneBlocking: state => state.byCategoriesOneBlocking,

    //Get save comment indicator
    getByCategoriesOneSaving: state => state.byCategoriesOneSaving

    //---byCategoriesOne---
};
