import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

//Main store
import mutationsObj from "../mutations";
import gettersObj from "../getters";
import stateObj from "../state";
import actionsObj from "../actions";

//Store modules
import usersModule from "../modules/users";
import categoriesModule from "../modules/categories";
import postsModule from "../modules/posts";
import langsModule from "../modules/langs";
import filesModule from "../modules/files";
import commentsModule from "../modules/comments";
import rssModule from "../modules/rss";
import graphs from "../modules/graphs";

export const store = new Vuex.Store({
    state: stateObj,
    mutations: mutationsObj,
    getters: gettersObj,
    actions: actionsObj,
    modules: {
        users: usersModule,
        categories: categoriesModule,
        langs: langsModule,
        posts: postsModule,
        files: filesModule,
        comments: commentsModule,
        rss: rssModule,
        graphs: graphs
    }
});
