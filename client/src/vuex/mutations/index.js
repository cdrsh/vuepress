import * as consts from "../constants";
import Vue from "vue";
let localStorage = require("store");

export default {
    //Settings loads successful
    [consts.SETTING_LOAD_SUCCESS](state, settings) {
        for (let itm in settings) {
            settings[itm] =
                settings[itm] == "true" || settings[itm] == "false"
                    ? settings[itm] == "true" ? true : false
                    : settings[itm];
        }
        state.settings = settings;
        if (state.settings.ANONYMOUS_ACCESS) state.API = "/api-noauth";
        state.settingsLoaded = true;
    },

    //Set current languge
    [consts.SET_CURRENT_LANG](state, code) {
        for (let i = 0; i < state.langsArr.length; i++) {
            if (state.langsArr[i].code == code) state.langsArr[i].active = true;
            else state.langsArr[i].active = false;
        }
    },

    //Login
    [consts.LOGIN_SUCCESS](state, obj) {
        localStorage.set("at", obj.at);
        localStorage.set("rt", obj.rt);
        localStorage.set("user", obj.user);
    },

    //Login indicator
    [consts.LOGIN_INDICATOR](state, val) {
        state.loginIndicator = val;
    },

    //Registration indicator
    [consts.REGISTRATION_INDICATOR](state, val) {
        state.registrationIndicator = val;
    },

    //Registration success
    [consts.REGISTRATION_SUCCESS](state, obj) {
        localStorage.set("at", obj.at);
        localStorage.set("rt", obj.rt);
        localStorage.set("user", obj.user);
    },

    //Logout success, clear tokens
    [consts.LOGOUT_SUCCESS](state) {
        let user = Vue._.cloneDeep(state.defaultUser);
        let at = "";
        let rt = "";
        localStorage.set("at", at);
        localStorage.set("rt", rt);
        localStorage.set("user", user);
    },

    //Set token
    [consts.SET_TOKEN_SUCCESS](state, obj) {
        localStorage.set("at", obj.at);
    },

    //Set reset indicator
    [consts.RESET_INDICATOR](state, val) {
        state.resetIndicator = val;
    }
};
