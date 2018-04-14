import Vue from "vue";
export default {
    //Get all comments
    getComments: state => state.comments,

    //Get items count comments
    getCommentsAllItems: state => state.commentsAllItems,

    //Get items per page
    getCommentsItemsPerPage: state => state.commentsItemsPerPage,

    //Get page number
    getCommentsPgNum: state => state.commentsPgNum
};
