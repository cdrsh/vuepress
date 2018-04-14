import * as consts from "./constants";
import Vue from "vue";

export default {
    //Set load rss indicator
    [consts.LOAD_GRAPHS_INDICATOR](state, val) {
        state.loadGraphsIndicator = val;
    },

    //Load rss success
    [consts.LOAD_GRAPHS_SUCCESS](state, obj) {
        state.postsCnts = obj.postsCnts;
        state.posts = obj.posts;

        state.categoriesCnts = obj.categoriesCnts;
        state.categories = obj.categories;

        state.commentsCnts = obj.commentsCnts;
        state.comments = obj.comments;

        state.usersCnts = obj.usersCnts;
        state.users = obj.users;
    }
};
