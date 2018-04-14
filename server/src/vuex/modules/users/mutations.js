import * as consts from "./constants";
import Vue from "vue";
import * as conf from "../../../config";

export default {
    //Get edit user dialog show/hide
    [consts.SH_USER_EDIT_DIALOG](state, userId) {
        let res = Vue._.filter(state.userlist, function(user) {
            return user.id === userId;
        });
        if (res.length > 0) res[0].showEdit = !res[0].showEdit;
    },

    //Get user details dialog show/hide
    [consts.SH_USER_DETAILS_DIALOG](state, userId) {
        let res = Vue._.filter(state.userlist, function(user) {
            return user.id === userId;
        });
        if (res.length > 0) res[0].showDetails = !res[0].showDetails;
    },

    //Users remove success
    [consts.REMOVE_USERS_SELECTED](state) {
        if (state.userlist.length > 0) {
            let arrIds = [];
            for (let i = state.userlist.length - 1; i >= 0; i--)
                if (state.userlist[i].checked) {
                    arrIds.push(state.userlist[i].id);
                    state.userlist.splice(i, 1);
                }
        }
    },

    //User remove success
    [consts.REMOVE_ONE_USER](state, userId) {
        if (state.userlist.length > 0) {
            for (let i = state.userlist.length - 1; i >= 0; i--)
                if (state.userlist[i].id == userId) {
                    state.userlist.splice(i, 1);
                    break;
                }
        }
    },

    //+++Users+++

    //Set users loading indicator
    [consts.USERS_LOAD_INDICATOR](state, val) {
        state.usersLoadingIndicator = val;
    },

    //Users loaded success
    [consts.USERS_LOAD_SUCCESS](state, obj) {
        state.userlist = obj.users;
        state.usersPgNum = obj.pgNum;
        state.usersAllCount = obj.itemsCount;
    },

    //Set blocking users indicator
    [consts.USERS_BLOCK_INDICATOR](state, val) {
        state.usersBlockingIndicator = val;
    },

    //Users blocked success
    [consts.USERS_BLOCK_SUCCESS](state, ids) {
        state.userlist.map(itm => {
            ids.map(id => {
                if (itm.id == id) {
                    itm.isBlocked = !itm.isBlocked;
                    itm.privlgs = 0x4 ^ itm.privlgs;
                }
            });
        });
    },

    //Set removing users indicator
    [consts.USERS_REMOVE_INDICATOR](state, val) {
        state.usersRemovingIndicator = val;
    },

    //Set privelegies users indicator
    [consts.USERS_PRIVELEGE_INDICATOR](state, val) {
        state.usersPrivelegeIndicator = val;
    },

    //Priveleges set success
    [consts.USERS_PRIVELEGE_SUCCESS](state, obj) {
        state.userlist.map(itm => {
            obj.ids.map(id => {
                if (itm.id == id) {
                    itm.privlgs = obj.priv;
                    itm.isBlocked = conf.isBlocked(obj.priv);
                }
            });
        });
    },

    //Set adding users indicator
    [consts.USERS_ADD_INDICATOR](state, val) {
        state.userAddIndicator = val;
    },

    //Set saving users indicator
    [consts.USERS_SAVE_INDICATOR](state, val) {
        state.userSaveIndicator = val;
    },

    //---Users---

    //Registration success
    [consts.REGISTRATION_SUCCESS](state, obj) {
        obj.rootState.user = obj.addUser;
    },

    //Reset users actions
    [consts.USERS_RESET_INDICATOR](state) {
        state.usersBlockingIndicator = false;
        state.usersPrivelegeIndicator = false;
        state.userAddIndicator = false;
        state.userSaveIndicator = false;
        state.usersRemovingIndicator = false;
    }
};
