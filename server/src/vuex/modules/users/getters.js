export default {
    //Get user detais dialog show/hide
    getVisibleDetailsUser: state => {
        return state.test;
    },

    //Get users list
    getUserList: state => state.userlist,

    //Get users per page
    getUsersPerPage: state => state.usersPerPage,

    //Get users page number
    getUsersPgNum: state => state.usersPgNum,

    //Get all users count
    getUsersAllCount: state => state.usersAllCount,

    //Get users find text
    getUsersFindTxt: state => state.usersFindTxt,

    //Get users find type number: -1 - not find
    getUsersFindNum: state => state.usersFindNum,

    //Get users loading indicator
    getUsersLoadingIndicator: state => state.usersLoadingIndicator,

    //Get users blocking indicator
    getUsersBlockingIndicator: state => state.usersBlockingIndicator,

    //Get users set privelege indicator
    getUsersPrivelegeIndicator: state => state.usersPrivelegeIndicator,

    //Get users adding indicator
    getUserAddIndicator: state => state.userAddIndicator,

    //Get users saving indicator
    getUserSaveIndicator: state => state.userSaveIndicator,

    //Get users removing indicator
    getUsersRemovingIndicator: state => state.usersRemovingIndicator
};
