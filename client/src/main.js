import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);
import App from "./App";
import router from "./router";

//Material design
var VueMaterial = require("vue-material");
Vue.use(VueMaterial);
/*
Загрузка по отдельности
Vue.use(VueMaterial.MdCore) //Required to boot vue material
Vue.use(VueMaterial.MdButton)
Vue.use(VueMaterial.MdIcon)
Vue.use(VueMaterial.MdSidenav)
Vue.use(VueMaterial.MdToolbar)
*/
//import 'vue-material/dist/vue-material.css'
import "@/components/vue-material.css";
import "./components/style.scss";

//Flags of contries
import FlagIcon from "vue-flag-icon";
Vue.use(FlagIcon);

//http-client
import VueResource from "vue-resource";
Vue.use(VueResource);

//lodash
import lodash from "lodash";
import VueLodash from "vue-lodash";
Vue.use(VueLodash, lodash);

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

//Virtial list for large count comments list
import virtualList from "vue-virtual-scroll-list";
Vue.component("virtual-list", virtualList);

//PreLoad on scrolling
import MugenScroll from "vue-mugen-scroll";
Vue.component("mugen-scroll", MugenScroll);

//Client components
//Categories list in left column
import CategoryList from "@/components/common/category-list/CategoryList";
Vue.component("category-list", CategoryList);

//Categories Breadcrumbs
import CategoryBreadcrumb from "@/components/common/category-breadcrumb/CategoryBreadcrumb";
Vue.component("category-breadcrumb", CategoryBreadcrumb);

//Upper Menu
import MenuComponent from "@/components/common/menu/MenuComponent";
Vue.component("menu-component", MenuComponent);

//Search posts panel
import SearchPanel from "@/components/common/search-panel/SearchPanel";
Vue.component("search-panel", SearchPanel);

//Post Comments list
import PostComments from "@/components/common/post-comments/PostComments";
Vue.component("post-comments", PostComments);

//One comment
import PostComment from "@/components/common/post-comment/PostComment";
Vue.component("post-comment", PostComment);

//Post list
import PostList from "@/components/common/post-list/PostList";
Vue.component("post-list", PostList);

//Comments paginator
import Paginator from "@/components/common/paginator/Paginator";
Vue.component("paginator", Paginator);

//User avatar letter
import Avatar from "@/components/common/avatar/Avatar";
Vue.component("avatar", Avatar);

//Google-Recaptcha
import VueRecaptcha from "vue-recaptcha";
Vue.component("vue-recaptcha", VueRecaptcha);

//Create store
import { store } from "@/vuex/store";

//localStorage
var localStorage = require("store");

//Production
Vue.config.productionTip = false;

//Create app
new Vue({
    el: "#app",
    store,
    router,
    template: "<App/>",
    i18n,
    components: { App }
});
