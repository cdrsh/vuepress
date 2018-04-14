import * as langs from "../../langs";
var localStorage = require("store");

export default {
    //Get settings loaded flag
    getSettingsLoaded: state => state.settingsLoaded,

    //Get settings
    getSettings: state => state.settings,

    //Get left panel names
    getLpanelItems: state => {
        return state.lpanelItems;
    },

    //Get languages
    getLangs: state => {
        return state.langsArr;
    },

    //Get icons
    getIcons: state => {
        return state.iconsArr;
    },

    //Check auth
    chkAuth: state => {
        //Get tokens from localStorage
        let at = localStorage.get("at");
        let rt = localStorage.get("rt");
        return at !== undefined && at != "" && rt !== undefined && rt != ""
            ? true
            : false;
    },

    //Get selected language UI
    getSelectedUILang: state => state.langsArr.filter(itm => itm.active),

    //Get left panel name
    getLPanelName: state => pth => {
        let arr = state.lpanelItems.filter(itm => itm.path == pth);
        if (arr.length == 0) return "AdminPanel";
        return arr[0].title;
    },

    //Get translated string
    tr: (state, getters) => keyT => {
        let code = "en";
        if (getters.getSelectedUILang !== undefined)
            code = getters.getSelectedUILang[0].code;
        return langs.default[code][keyT];
    },

    //Get auth indicator
    getLoginIndicator: state => state.loginIndicator,

    //Get registration indicator
    getRegistrationIndicator: state => state.registrationIndicator
};
