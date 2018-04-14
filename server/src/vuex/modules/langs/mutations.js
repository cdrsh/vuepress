import * as consts from "./constants";
import Vue from "vue";

export default {
    //Set load languages indicator
    [consts.LANGS_LOADING_INDICATOR](state, val) {
        state.langsLoading = val;
    },

    //Set removing languages indicator
    [consts.LANGS_REMOVE_INDICATOR](state, val) {
        state.langsRemoving = val;
    },

    //Set adding languages indicator
    [consts.LANGS_ADD_INDICATOR](state, val) {
        state.langsAdding = val;
    },

    //Languages load success
    [consts.LANGS_LOAD_SUCCESS](state, listObj) {
        state.langs_list = listObj.langs;

        let langs_list = state.langs_list.filter(itm => itm.used == "1");

        let uiLng = this.getters.getSelectedUILang;
        let lng = { code: "en" };
        if (uiLng.length > 0 && langs_list.length > 0) {
            lng = langs_list.filter(itm => itm.code == uiLng[0].code);
            if (lng.length > 0) state.contentLang = lng[0].code;
        } else {
            state.contentLang =
                langs_list.length > 0 ? langs_list[0].code : "en";
        }
    },

    //Add languages
    [consts.LANGS_ADD](state, list) {
        for (let i = 0; i < state.langs_list.length; i++)
            for (let j = 0; j < list.length; j++)
                if (state.langs_list[i].code == list[j])
                    state.langs_list[i].used = "1";
    },

    //Remove languages
    [consts.LANGS_REMOVE](state, list) {
        for (let i = 0; i < state.langs_list.length; i++)
            for (let j = 0; j < list.length; j++)
                if (state.langs_list[i].code == list[j])
                    state.langs_list[i].used = "0";
    },

    //Load languages from localstorage
    [consts.SET_CURRENT_LANG_ACTIVE](state, obj) {
        for (let i = 0; i < obj.rootState.langsArr.length; i++) {
            if (obj.rootState.langsArr[i].code == obj.code)
                obj.rootState.langsArr[i].active = true;
            else obj.rootState.langsArr[i].active = false;
        }
    },

    //Set switcher setting show/hide language switcher on client
    [consts.SET_B_SHOW_CONTENT_LANG](state, val) {
        state.bShowContentLang = val;
    },

    //Content language change
    [consts.SET_CONTENT_LANG](state, val) {
        state.contentLang = val.contentLang;
    }
};
