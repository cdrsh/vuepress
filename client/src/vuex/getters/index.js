import * as langs from "../../langs";
var localStorage = require("store");
export default {
    //Get API prefix
    API: state => state.API,

    //Get settings load success
    getSettingsLoaded: state => state.settingsLoaded,

    //Get settings load success
    getSettings: state => state.settings,

    //Get items names for the left panel
    getLpanelItems: state => {
        return state.lpanelItems;
    },

    //Get all languages
    getLangs: state => {
        return state.langsArr;
    },

    //Authorisation check
    chkAuth: state => {
        //Authorisation by token
        let at = localStorage.get("at");
        let rt = localStorage.get("rt");
        return at !== undefined && at != "" && rt !== undefined && rt != ""
            ? true
            : false;
    },

    //get UI language
    getSelectedUILang: state => state.langsArr.filter(itm => itm.active),

    //Get Left panel name
    getLPanelName: state => pth => {
        let arr = state.lpanelItems.filter(itm => itm.path == pth);
        if (arr.length == 0) return "AdminPanel";
        return arr[0].title;
    },

    //Get translated string
    tr: (state, getters) => keyT => {
        let code = getters.getContentLang;
        return langs.default[code][keyT];
    },

    //Get authorisation indicator
    getLoginIndicator: state => state.loginIndicator,

    //Get registration indicator
    getRegistrationIndicator: state => state.registrationIndicator
};
