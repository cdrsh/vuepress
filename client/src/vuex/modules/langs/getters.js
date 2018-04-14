import Vue from "vue";
import messages from "../../../langs";

export default {
    //Get all languages
    getLangsAll: state => state.langsList,

    //Get not active languages
    getLangsContentAll: state => state.langsList.filter(itm => itm.used == "0"),

    //Get active languages
    getLangsContentSelected: state =>
        state.langsList.filter(itm => itm.used == "1"),

    //Get UI languages
    getUILangs: state => {
        let arr = [];
        for (let itm in messages)
            arr.push({
                code: itm,
                lngName: messages[itm][itm]
            });
        return arr;
    },

    //Get languages load indicator
    getIndicatorLangsLading: state => state.langsLoading,

    //Get show/hide language select panel
    getBShowContentLang: state => state.bShowContentLang,

    //Get preffered ui language
    getPrefferedContentLang: (state, getters) => {
        let langsList = getters.getLangsContentSelected;
        let uiLng = getters.getSelectedUILang;
        let lng = { code: "en" };
        if (uiLng.length > 0) {
            lng = langsList.filter(itm => itm.code == uiLng[0].code);
            if (lng.length > 0) return lng[0].code;
        }
        return langsList.length > 0
            ? langsList[0].code
            : uiLng.length > 0 ? uiLng[0].code : "en";
    },

    //Get selected content language (code only - en)
    getContentLang: state => state.contentLang,

    //Get selected content language full object
    getContentLangFull: (state, getters) => {
        let arr = getters.getLangs.filter(itm => itm.code == state.contentLang);
        let obj =
            arr !== undefined && arr.length > 0
                ? arr[0]
                : { icon: "us", name: "English" };
        if (obj.icon == "en") obj.icon = "us";
        return obj;
    },

    //Get browser language
    getBrowserLang: state => {
        let lang = "en";
        if (navigator.languages && navigator.languages.length) {
            // latest versions of Chrome and Firefox set this correctly
            lang = navigator.languages[0];
        } else if (navigator.userLanguage) {
            // IE only
            lang = navigator.userLanguage;
        } else {
            // latest versions of Chrome, Firefox, and Safari set this correctly
            lang = navigator.language;
        }
        return lang.substr(0, 2);
    }
};
