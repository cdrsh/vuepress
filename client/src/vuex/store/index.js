import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

//main store
import mutationsObj from "../mutations";
import gettersObj from "../getters";
import stateObj from "../state";
import actionsObj from "../actions";

//Store modules
import categoriesModule from "../modules/categories";
import postsModule from "../modules/posts";
import langsModule from "../modules/langs";
import commentsModule from "../modules/comments";

//Create store
export const store = new Vuex.Store({
    state: stateObj,
    mutations: mutationsObj,
    getters: gettersObj,
    actions: actionsObj,
    modules: {
        categories: categoriesModule,
        langs: langsModule,
        posts: postsModule,
        comments: commentsModule
    }
});
