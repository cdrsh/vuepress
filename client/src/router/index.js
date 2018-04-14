import Vue from "vue";
import Router from "vue-router";
import VueNotifications from "vue-notifications";

//Pages
import AuthPage from "@/components/pages/auth/AuthPage";
import ForgotPassPage from "@/components/pages/forgot-pass/ForgotPassPage";
import RegistrationPage from "@/components/pages/registration/RegistrationPage";
import RegistrationSuccess from "@/components/pages/registration-success/RegistrationSuccess";
import MainClientPage from "@/components/pages/main-page/MainClientPage";
import CategoryPage from "@/components/pages/category-page/CategoryPage";
import PostPage from "@/components/pages/post-page/PostPage";
import PostList from "@/components/common/post-list/PostList";
const NotFound = { template: "<p>Страница не найдена</p>" };

//localStorage
let localStorage = require("store");

//Router
Vue.use(Router);

//Create vuex store
import { store } from "@/vuex/store";

//Before enter hook
const beforeEnterRouteFns = (to, from, next) => {
    function proceed() {
        if (
            store.getters.getLangsContentSelected.length > 0 &&
            store.getters.getSettingsLoaded
        ) {
            //Settings and languages loaded
            let at = localStorage.get("at");
            let rt = localStorage.get("rt");
            if (
                !store.getters.getSettings.ANONYMOUS_ACCESS &&
                (at == "" || at === undefined) &&
                (rt == "" || rt === undefined)
            ) {
                VueNotifications.error({ message: "You are not Authorised" });
                next("/auth");
            }

            next();
        }
    }

    //Check languages and settings loaded
    if (
        store.getters.getLangsContentSelected.length == 0 ||
        !store.getters.getSettingsLoaded
    ) {
        store.watch(state => {
            if (state.langs.langsList.length > 0 && state.settingsLoaded)
                proceed();
        });
    } else {
        proceed();
    }
};

export default new Router({
    mode: "history",
    base: "/",
    routes: [
        {
            path: "/auth",
            name: "AuthPage",
            component: AuthPage
        },
        {
            path: "/forgot",
            name: "ForgotPassPage",
            component: ForgotPassPage
        },
        {
            path: "/register",
            name: "RegistrationPage",
            component: RegistrationPage
        },
        {
            path: "/regaccept",
            name: "RegistrationSuccess",
            component: RegistrationSuccess
        },
        {
            path: "/",
            component: MainClientPage,
            beforeEnter: beforeEnterRouteFns,
            children: [
                {
                    path: "",
                    components: { contentmain: PostList }
                },
                {
                    path: "category/:id",
                    components: { contentmain: CategoryPage }
                },
                {
                    path: "category/:id/:postid",
                    components: { contentmain: PostPage }
                }
            ]
        },
        {
            path: "*",
            name: "NotFound",
            component: NotFound
        }
    ]
});
