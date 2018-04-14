import * as consts from "./constants";
import Vue from "vue";

export default {
    //Set rss loading indicator
    [consts.RSS_LOAD_INDICATOR](state, val) {
        state.rssIndicatorLoading = val;
    },

    //rss load success
    [consts.RSS_LOAD_SUCCESS](state, obj) {
        state.rssList = obj.rss;
        state.rssPgNum = obj.pgNum;
        state.rssItemsCount = obj.itemsCount;
    },

    //Set rss removing indicator
    [consts.RSS_REMOVE_INDICATOR](state, val) {
        state.rssIndicatorRemoving = val;
    },

    //Set rss adding indicator
    [consts.RSS_ADD_INDICATOR](state, val) {
        state.rssIndicatorAdding = val;
    },

    //Set rss saving indicator
    [consts.RSS_UPDATE_INDICATOR](state, val) {
        state.rssIndicatorUpdating = val;
    },

    //Reset rss actions
    [consts.RSS_RESET_INDICATOR](state) {
        state.rssIndicatorRemoving = false;
        state.rssIndicatorAdding = false;
        state.rssIndicatorUpdating = false;
    }
};
