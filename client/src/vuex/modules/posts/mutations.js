import * as consts from "./constants";
import Vue from "vue";

let getDateFrm = dt => {
    let d = new Date(dt);
    let curr_date = d.getDate();
    let curr_month = d.getMonth() + 1;
    let curr_year = d.getFullYear();
    if (curr_date < 10) curr_date = "0" + curr_date;
    if (curr_month < 10) curr_month = "0" + curr_month;
    return curr_date + "." + curr_month + "." + curr_year;
};

export default {
    //Posts load success
    [consts.POSTS_LOAD_SUCCESS](state, posts) {
        if (posts.length == 0 || state.itemsPerPage > posts.length)
            state.fullLoaded = true;
        let prevDt = -1;
        for (let i = 0; i < posts.length; i++) {
            posts[i].dtjs = getDateFrm(posts[i].dt);
            if (i > 0 && posts[i].dtjs == prevDt) posts[i].dtjs = -1;
            else prevDt = posts[i].dtjs;
            Vue.set(state.postList, state.postList.length, posts[i]);
        }
    },

    //Set posts load indicator
    [consts.POSTS_INDICATOR_LOADING](state, val) {
        state.postsLoading = val;
    },

    //Clear posts
    [consts.POSTS_CLEAR](state, val) {
        state.postList = [];
        state.fullLoaded = false;
    },

    //Toggle search panel
    [consts.TOGGLE_SEARCH_PANEL](state, par) {
        if (par == -1) state.visSearchPanel = !state.visSearchPanel;
        if (par == 0) state.visSearchPanel = false;
    },

    //Save find text
    [consts.SET_POST_FIND_TEXT](state, findText) {
        state.findText = findText;
    },

    //One post load success
    [consts.POSTONE_LOAD_SUCCESS](state, post) {
        state.postActive = post;
    },

    //One post load indicator
    [consts.POSTONE_INDICATOR_LOADING](state, val) {
        state.postOneLoadIndicator = val;
    },

    //Get paginator data
    [consts.POST_GET_PAGINATOR_DATA](state, cnt) {
        state.itemsCount = cnt;
    }
};
