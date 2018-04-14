import Vue from "vue";
import messages from "../../../langs";

export default {
    //Get all languages
    getLangsAll: state => state.langs_list,

    //Get not active languages
    getLangsContentAll: state =>
        state.langs_list.filter(itm => itm.used == "0"),

    //Get active languages
    getLangsContentSelected: state =>
        state.langs_list.filter(itm => itm.used == "1"),

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

    //Get load languages indicator
    getIndicatorLangsLoading: state => state.langsLoading,

    //Get adding languages indicator
    getIndicatorLangsAdding: state => state.langsAdding,

    //Get removing languages indicator
    getIndicatorLangsRemoving: state => state.langsRemoving,

    //Get setting show/hide language panel on client
    getBShowContentLang: state => state.bShowContentLang,

    //Get preffered content language on first load
    getPrefferedContentLang: (state, getters) => {
        let langs_list = getters.getLangsContentSelected;
        let uiLng = getters.getSelectedUILang;
        let lng = { code: "en" };
        if (uiLng.length > 0) {
            lng = langs_list.filter(itm => itm.code == uiLng[0].code);
            if (lng.length > 0) return lng[0].code;
        }
        return langs_list.length > 0
            ? langs_list[0].code
            : uiLng.length > 0 ? uiLng[0].code : "en";
    },

    //Get content language prefix
    getContentLang: state => state.contentLang
};
