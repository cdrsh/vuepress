import Vue from "vue";
import Router from "vue-router";

//Pages
import MainPage from "@/components/MainPage";
import CategoryPage from "@/components/pages/category/CategoryPage";
import CommentPage from "@/components/pages/comment/CommentPage";
import DashboardPage from "@/components/pages/dashboard/DashboardPage";
import FilePage from "@/components/pages/file/FilePage";
import LangPage from "@/components/pages/lang/LangPage";
import PostPage from "@/components/pages/post/PostPage";
import RSSPage from "@/components/pages/rss/RSSPage";
import SettingsPage from "@/components/pages/settings/SettingsPage";
import UserPage from "@/components/pages/user/UserPage";
import AuthPage from "@/components/pages/auth/AuthPage";
import ForgotPassPage from "@/components/pages/forgot-pass/ForgotPassPage";
import RegistrationPage from "@/components/pages/registration/RegistrationPage";
import RegistrationSuccess from "@/components/pages/registration-success/RegistrationSuccess";

const NotFound = { template: "<p>Страница не найдена</p>" };

Vue.use(Router);

//Ожидание загружки языков контента
import { store } from "@/vuex/store";
const checkLangsLoaded = (to, from, next) => {
    function proceed() {
        if (store.getters.getLangsContentSelected.length > 0) {
            next();
        }
    }

    if (store.getters.getLangsContentSelected.length == 0) {
        store.watch(state => {
            if (state.langs.langs_list.length > 0) proceed();
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
            path: "/admin",
            component: MainPage,
            beforeEnter: checkLangsLoaded,
            children: [
                {
                    path: "",
                    components: { content: DashboardPage }
                },
                {
                    path: "category",
                    name: "CategoryPage",
                    components: { content: CategoryPage }
                },
                {
                    path: "comment",
                    name: "CommentPage",
                    components: { content: CommentPage }
                },
                {
                    path: "dashboard",
                    name: "DashboardPage",
                    components: { content: DashboardPage }
                },
                {
                    path: "file",
                    name: "FilePage",
                    components: { content: FilePage }
                },
                {
                    path: "lang",
                    name: "LangPage",
                    components: { content: LangPage }
                },
                {
                    path: "post",
                    name: "PostPage",
                    components: { content: PostPage }
                },
                {
                    path: "rss",
                    name: "RSSPage",
                    components: { content: RSSPage }
                },
                {
                    path: "user",
                    name: "UserPage",
                    components: { content: UserPage }
                },
                {
                    path: "settings",
                    name: "SettingsPage",
                    components: { content: SettingsPage }
                }
            ]
        },
        {
            path: "/admin/auth",
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
            redirect: "/admin/auth"
        },
        {
            path: "*",
            name: "NotFound",
            component: NotFound
        }
    ]
});
