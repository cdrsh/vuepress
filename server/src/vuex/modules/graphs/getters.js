import Vue from "vue";

export default {
    //Get graphs load indicator
    getLoadGraphsIndicator: state => state.loadGraphsIndicator,

    //Get 3 last posts
    getGraphPosts3: (state, getters) => {
        let arr = [];
        arr = state.posts;
        arr.map(itm => {
            itm.txt = itm["title_" + getters.getContentLang];
            if (itm.txt == undefined) itm.txt = "";
            itm.icon = "create";
            if (itm.txt.length > 40) itm.txt = itm.txt.substr(0, 40) + "...";
        });
        return arr;
    },

    //Get posts counts by months
    getGraphPostsData: (state, getters) => {
        let gt = getters.gt == undefined ? txt => txt : getters.gt;
        let posts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        state.postsCnts.map(itm => {
            posts[parseInt(itm.month1)] = parseInt(itm.cnt);
        });
        return posts;
    },

    //Get last 3 categories
    getGraphCategories3: (state, getters) => {
        let arr = [];
        arr = state.categories;
        arr.map(itm => {
            itm.txt = itm["name_" + getters.getContentLang];
            if (itm.txt == undefined) itm.txt = "";
            itm.icon = "create";
            if (itm.txt.length > 40) itm.txt = itm.txt.substr(0, 40) + "...";
        });
        return arr;
    },

    //Get categories counts by months
    getGraphCategoriesData: (state, getters) => {
        let categories = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        state.categoriesCnts.map(itm => {
            categories[parseInt(itm.month1)] = parseInt(itm.cnt);
        });
        return categories;
    },

    //Get last 3 comments
    getGraphComments3: (state, getters) => {
        let arr = [];
        arr = state.comments;
        arr.map(itm => {
            itm.icon = "create";
            if (itm.txt == undefined) itm.txt = "";
            if (itm.txt.length > 40) itm.txt = itm.txt.substr(0, 40) + "...";
        });
        return arr;
    },

    //Get comments counts by months
    getGraphCommentsData: (state, getters) => {
        let comments = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        state.commentsCnts.map(itm => {
            comments[parseInt(itm.month1)] = parseInt(itm.cnt);
        });
        return comments;
    },

    //Get last 3 users
    getGraphUsers3: (state, getters) => {
        let arr = [];
        arr = state.users;
        arr.map(itm => {
            itm.icon = "create";
            itm.txt = itm.email;
            if (itm.txt == undefined) itm.txt = "";
            if (itm.txt.length > 40) itm.txt = itm.txt.substr(0, 40) + "...";
        });
        return arr;
    },

    //Get users counts by months
    getGraphUsersData: (state, getters) => {
        let users = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        state.usersCnts.map(itm => {
            users[parseInt(itm.month1)] = parseInt(itm.cnt);
        });
        return users;
    }
};
