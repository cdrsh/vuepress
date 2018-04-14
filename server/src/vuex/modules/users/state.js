export default {
    //Users loading
    isUserListPageLoading: false,

    //User skel
    defaultUser: {
        id: 0,
        token: "",
        isAuth: false,
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        nick: "",
        phone: "",
        acptd: "",
        icon: "",
        site: "",
        dt: "",
        privlgs: {
            manageFiles: 0,
            readCategories: 0,
            writeCategories: 0,
            readUsers: 0,
            writeUsers: 0,
            blockedUser: 0,
            writePost: 0,
            readPost: 0
        },
        showDetails: false,
        showEdit: false,
        checked: false
    },

    //User object
    user: {
        id: 0,
        token: "123",
        isAuth: false,
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        nick: "",
        phone: "",
        acptd: "",
        icon: "",
        site: "",
        dt: "",
        privlgs: {
            manageFiles: 0,
            readCategories: 0,
            writeCategories: 0,
            readUsers: 0,
            writeUsers: 0,
            blockedUser: 0,
            writePost: 0,
            readPost: 0
        },
        showDetails: false,
        showEdit: false,
        checked: false
    },

    //+++Users page+++
    userlist: [],
    usersLoadingIndicator: false,
    usersBlockingIndicator: false,
    usersPerPage: 10,
    usersPgNum: 1,
    usersAllCount: 0,
    usersFindTxt: "",
    usersFindNum: -1,
    usersPrivelegeIndicator: false,
    userAddIndicator: false,
    userSaveIndicator: false,
    usersRemovingIndicator: false
    //---Users page---
};
