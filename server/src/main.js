import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);
import App from "./App";
import router from "./router";

//Material design
var VueMaterial = require("vue-material");
Vue.use(VueMaterial);
/*
Vue.use(VueMaterial.MdCore)
Vue.use(VueMaterial.MdButton)
Vue.use(VueMaterial.MdIcon)
Vue.use(VueMaterial.MdSidenav)
Vue.use(VueMaterial.MdToolbar)
*/
import "@/components/vue-material.css";
import "./components/style.scss";

//Countries flags
import FlagIcon from "vue-flag-icon";
Vue.use(FlagIcon);

//http Client
import VueResource from "vue-resource";
Vue.use(VueResource);

//Lodash
import lodash from "lodash";
import VueLodash from "vue-lodash";
Vue.use(VueLodash, lodash);

//Charts
import VueChart from "vue-chart-js";
Vue.use(VueChart);

//i18n
import VueI18n from "vue-i18n";
Vue.use(VueI18n);
import messages from "./langs";
const i18n = new VueI18n({
    locale: "en",
    messages
});

//Form validator
import VeeValidate from "vee-validate";
Vue.use(VeeValidate);

//Vueditor
import "vueditor/dist/style/vueditor.min.css";
import Vueditor from "vueditor";

//Popup notifications
import VueNotifications from "vue-notifications";
import VueToasted from "vue-toasted";
function toast({ title, message, type, timeout, cb }) {
    if (type === VueNotifications.types.warn) type = "show";
    return Vue.toasted[type](message, { duration: 3000 });
}
Vue.use(VueToasted);
Vue.use(VueNotifications, {
    success: toast,
    error: toast,
    info: toast,
    warn: toast
});

//===Main panel===
//Central panel
import CenterPanel from "@/components/common/pages/main/cpanel/CenterPanel";
Vue.component("cpanel", CenterPanel);

//Left panel
import LeftPanel from "@/components/common/pages/main/lpanel/LeftPanel";
Vue.component("lpanel", LeftPanel);
//===Main panel===

//===Common===
//User Avatar
import Avatar from "@/components/common/common/avatar/Avatar";
Vue.component("avatar", Avatar);

//MyList
import MyList from "@/components/common/common/list/MyList";
Vue.component("my-list", MyList);

//Paginator
import Paginator from "@/components/common/common/paginator/Paginator";
Vue.component("paginator", Paginator);
//===Common===

//===Comments===
//Comment Editor
import EditComment from "@/components/common/pages/comments/edit-comment/EditComment";
Vue.component("edit-comment", EditComment);

//All comments
import AllComments from "@/components/common/pages/comments/all-comments/AllComments";
Vue.component("allcomments", AllComments);

//Comments by Users
import ByUsers from "@/components/common/pages/comments/by-users/byUsers";
Vue.component("by-users", ByUsers);

//Comments of one user
import CommentsOfUser from "@/components/common/pages/comments/comments-of-user/CommentsOfUser";
Vue.component("comments-of-user", CommentsOfUser);

//Edit user comment
import EditCommentOfUser from "@/components/common/pages/comments/edit-comment-of-user/EditCommentOfUser";
Vue.component("edit-comment-of-user", EditCommentOfUser);

//Comments of one category
import ByCategoriesOne from "@/components/common/pages/comments/by-categories-one/byCategoriesOne";
Vue.component("by-categories-one", ByCategoriesOne);

//Comment edit one category
import EditCommentOfCategoryOne from "@/components/common/pages/comments/edit-comment-of-category-one/EditCommentOfCategoryOne";
Vue.component("edit-comment-of-category-one", EditCommentOfCategoryOne);

//Comments by categories
import byCategories from "@/components/common/pages/comments/by-categories/byCategories";
Vue.component("by-categories", byCategories);

//Comments by posts
import byPosts from "@/components/common/pages/comments/by-posts/byPosts";
Vue.component("by-posts", byPosts);

//Select content language
import SelectContentLanguage from "@/components/common/common/select-content-language/SelectContentLanguage";
Vue.component("select-content-language", SelectContentLanguage);

//Comments of one post
import CommentsOfPost from "@/components/common/pages/comments/comments-of-post/CommentsOfPost";
Vue.component("comments-of-post", CommentsOfPost);

//Virtual list of comments
import virtualList from "vue-virtual-scroll-list";
Vue.component("virtual-list", virtualList);
//===Comments===

//===Categories===
//Add category
import AddCategory from "@/components/common/pages/category/add-category/AddCategory";
Vue.component("add-category", AddCategory);

//Category breadcrumb
import Breadcrumb from "@/components/common/pages/category/breadcrumb-category/Breadcrumb";
Vue.component("breadcrumb-category", Breadcrumb);

//Categories list
import ListCategories from "@/components/common/pages/category/list-categories/ListCategories";
Vue.component("list-categories", ListCategories);

//Category edit
import EditCategory from "@/components/common/pages/category/edit-category/EditCategory";
Vue.component("edit-category", EditCategory);

//Buttons panel category
import BtnsPanelCategory from "@/components/common/pages/category/btns-panel-category/BtnsPanelCategory";
Vue.component("btns-panel-category", BtnsPanelCategory);

//Autonumerate posts in category
import AutoNumerate from "@/components/common/common/auto-numerate/AutoNumerate";
Vue.component("auto-numerate", AutoNumerate);

//Keywords of category
import SelfKeywords from "@/components/common/common/self-keywords/SelfKeywords";
Vue.component("self-keywords", SelfKeywords);

//User fields of category
import UserFields from "@/components/common/common/user-fields/UserFields";
Vue.component("user-fields", UserFields);

//Find category dialog
import FindDialogComponent from "@/components/common/common/find-dialog/FindDialogComponent";
Vue.component("find-dialog", FindDialogComponent);

//Categories filtered list
import ListFilteredCategories from "@/components/common/pages/category/list-filtered-categories/ListFilteredCategories";
Vue.component("list-filtered-categories", ListFilteredCategories);
//===Categories===

//===Post===
//Post Add
import PostAdd from "@/components/common/pages/post/post-add/PostAdd";
Vue.component("postadd", PostAdd);

//Post Editor
import PostEdit from "@/components/common/pages/post/post-edit/PostEdit";
Vue.component("postedit", PostEdit);

//Posts list
import ListPost from "@/components/common/pages/post/post-list/ListPost";
Vue.component("post-list", ListPost);

//Posts list filtered
import PostListFound from "@/components/common/pages/post/post-list-found/PostListFound";
Vue.component("post-list-found", PostListFound);

//Find posts
import PostFind from "@/components/common/pages/post/post-find/PostFind";
Vue.component("post-find", PostFind);

//Posts Breadcrumbs
import PostBreadcrumb from "@/components/common/pages/post/post-breadcrumb/PostBreadcrumb";
Vue.component("post-breadcrumb", PostBreadcrumb);

//Select category for post add
import PostSelectCategory from "@/components/common/pages/post/post-select-category/PostSelectCategory";
Vue.component("post-select-category", PostSelectCategory);

//Select category for post edit
import PostEditSelectCategory from "@/components/common/pages/post/post-edit-select-category/PostEditSelectCategory";
Vue.component("post-edit-select-category", PostEditSelectCategory);
//===Post===

//===Files===
//Add file dialog
import AddFileDialog from "@/components/common/common/add-file-dialog/AddFileDialog";
Vue.component("add-file-dialog", AddFileDialog);

//Files list in local store
import MediaStoreList from "@/components/common/pages/files/media-store-list/MediaStoreList";
Vue.component("media-store-list", MediaStoreList);
//===Files===

//===RSS===
//Add RSS
import AddRSS from "@/components/common/pages/rss/add-rss/AddRSS";
Vue.component("add-rss", AddRSS);

//Edit RSS
import EditRSS from "@/components/common/pages/rss/edit-rss/EditRSS";
Vue.component("edit-rss", EditRSS);
//===RSS===

//===Users===
//Users management buttons panel
import UsersManageButtons from "@/components/common/common/users-manage-buttons/UsersManageButtons";
Vue.component("users-manage-buttons", UsersManageButtons);

//Add user
import AddUser from "@/components/common/pages/users/add-user/AddUser";
Vue.component("add-user", AddUser);

//Edit user
import EditUser from "@/components/common/pages/users/edit-user/EditUser";
Vue.component("edit-user", EditUser);

//Privelegies
import Privelege from "@/components/common/pages/users/privelege/Privelege";
Vue.component("privelege", Privelege);

//Edit Privelege dialog
import EditPrivelege from "@/components/common/pages/users/edit-privelege/EditPrivelege";
Vue.component("edit-privelege", EditPrivelege);
//===Users===

//Create store
import { store } from "@/vuex/store";

//Production
Vue.config.productionTip = false;

//Check authorisation for selected routes
router.beforeEach((to, from, next) => {
    let pathsAuth = [
        "/admin",
        "/admin/category",
        "/admin/comment",
        "/admin/dashboard",
        "/admin/file",
        "/admin/lang",
        "/admin/post",
        "/admin/rss",
        "/admin/settings",
        "/admin/user"
    ];
    let bFind = false;
    for (let i = 0; i < pathsAuth.length; i++)
        if (to.path == pathsAuth[i]) {
            bFind = true;
            break;
        }
    if (bFind) {
        if (store.getters.chkAuth) next();
        else next("/admin/auth");
    } else next();
});

//Create app
/* eslint-disable no-new */
new Vue({
    el: "#app",
    store,
    router,
    template: "<App/>",
    i18n,
    components: { App }
});
