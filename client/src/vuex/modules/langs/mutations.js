import * as consts from "./constants";
import Vue from "vue";

export default {
    //Set load language indicator
    [consts.LANGS_LOADING_INDICATOR](state, val) {
        state.langsLoading = val;
    },

    //Languages load success
    [consts.LANGS_LOAD_SUCCESS](state, listObj) {
        state.langsList = listObj.langs;

        //Get active languages
        let langsList = state.langsList.filter(itm => itm.used == "1");

        //If active language selected
        if (langsList !== undefined) {
            let foundContentLangs = langsList.filter(
                itm => itm.code == listObj.curclientlng && itm.used == 1
            );
            let bFound = false;
            if (
                foundContentLangs !== undefined &&
                foundContentLangs.length > 0
            ) {
                state.contentLang = listObj.curclientlng;
                bFound = true;
            }
            //If browser language is not in active languages
            //find first active language (en peffered)
            if (!bFound) {
                let foundContentLangs = langsList.filter(
                    itm => itm.code == "en"
                );
                if (
                    foundContentLangs !== undefined &&
                    foundContentLangs.length > 0
                ) {
                    state.contentLang = "en";
                    bFound = true;
                }
            }
            //Get first active language
            if (!bFound) {
                state.contentLang = "en";
                if (langsList.length > 0) state.contentLang = langsList[0];
            }
        } else state.contentLang = "en";
    },

    //Set current active language
    [consts.SET_CURRENT_LANG_ACTIVE](state, obj) {
        for (let i = 0; i < obj.rootState.langsArr.length; i++) {
            if (obj.rootState.langsArr[i].code == obj.code)
                obj.rootState.langsArr[i].active = true;
            else obj.rootState.langsArr[i].active = false;
        }
    },

    //Set show/hide language select panel
    [consts.SET_B_SHOW_CONTENT_LANG](state, val) {
        state.bShowContentLang = val;
    },

    //Content language changed
    [consts.SET_CONTENT_LANG](state, code) {
        state.contentLang = code;
    }
};
