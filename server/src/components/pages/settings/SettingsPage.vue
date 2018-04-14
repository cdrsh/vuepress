<script>
require("./style.scss");

import { mapGetters } from "vuex";
import Vue from "vue";
import * as conf from "../../../config";

export default {
    name: "SettingsPage",
    data() {
        return {
            defSettings: {
                SITE_TITLE: "",
                KEYWORDS: "",
                DESCRIPTION: "",
                LANGS_SHOW_SWITCHER: false,
                LOGIN_SWITCHER: false,
                ANONYMOUS_ACCESS: false,
                SHOW_POST_DATE: false,
                REGISTRATION_SWITCHER: false,
                COMMENTS_ENABLE: false,
                ANONYMOUS_COMMENTS: false,
                RECAPCHA_COMMENTS: false,
                CATEGORIES_ENABLE: false,
                CATEGORIES_TREE_LPANEL: false,
                RSS_ENABLE: false,
                DEF_PRIVLGS: 297,
                RECAPCHA_PUBLIC_KEY: "",
                RECAPCHA_PRIVATE_KEY: ""
            },

            settings: {
                SITE_TITLE: "",
                KEYWORDS: "",
                DESCRIPTION: "",
                LANGS_SHOW_SWITCHER: false,
                LOGIN_SWITCHER: false,
                ANONYMOUS_ACCESS: false,
                SHOW_POST_DATE: false,
                REGISTRATION_SWITCHER: false,
                COMMENTS_ENABLE: false,
                ANONYMOUS_COMMENTS: false,
                RECAPCHA_COMMENTS: false,
                CATEGORIES_ENABLE: false,
                CATEGORIES_TREE_LPANEL: false,
                RSS_ENABLE: false,
                DEF_PRIVLGS: 297,
                RECAPCHA_PUBLIC_KEY: "",
                RECAPCHA_PRIVATE_KEY: ""
            },

            privlgs: {
                adminA: false,
                filesRW: false,
                categoryR: false,
                categoryW: false,
                usersW: false,
                usersR: false,
                blocked: false,
                postW: false,
                postR: false
            }
        };
    },

    computed: {
        ...mapGetters(["getSettings"])
    },

    mounted: function() {
        //Load settings if not loaded
        this.$store.dispatch("loadSettings", { r: this.$router });
        this.settings = Vue._.cloneDeep(this.getSettings);
    },

    watch: {
        //Settings loaded
        getSettings: function(val, oldVal) {
            this.settings = Vue._.cloneDeep(val);
        }
    },

    methods: {
        //Save settings
        saveSettings: function() {
            //Calc priveleges
            let privs = 0;
            privs = conf.setAdminAccess(privs, this.privlgs.adminA);
            privs = conf.setFilesManagement(privs, this.privlgs.filesRW);
            privs = conf.setWriteCategories(privs, this.privlgs.categoryW);
            privs = conf.setReadCategories(privs, this.privlgs.categoryR);
            privs = conf.setWriteUsers(privs, this.privlgs.usersW);
            privs = conf.setReadUsers(privs, this.privlgs.usersR);
            privs = conf.setBlocked(privs, this.privlgs.blocked);
            privs = conf.setWritePost(privs, this.privlgs.postW);
            privs = conf.setReadPost(privs, this.privlgs.postR);
            this.settings.DEF_PRIVLGS = privs;

            this.$store.dispatch("saveSettings", {
                settings: this.settings,
                reset: false,
                r: this.$router
            });
        },

        //Reset settings
        resetSettings: function() {
            this.settings = Vue._.cloneDeep(this.defSettings);
            this.$store.dispatch("saveSettings", {
                settings: this.settings,
                reset: true,
                r: this.$router
            });
        }
    },

    created: function() {
        //Get priveleges
        let privs = parseInt(this.getSettings.DEF_PRIVLGS);
        this.privlgs = {
            adminA: conf.isAdminAccess(privs),
            filesRW: conf.isFilesManagement(privs),
            categoryR: conf.isReadCategories(privs),
            categoryW: conf.isWriteCategories(privs),
            usersW: conf.isWriteUsers(privs),
            usersR: conf.isReadUsers(privs),
            blocked: conf.isBlocked(privs),
            postW: conf.isWritePost(privs),
            postR: conf.isReadPost(privs)
        };
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
