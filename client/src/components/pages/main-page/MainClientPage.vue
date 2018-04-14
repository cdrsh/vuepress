<script>
require("./style.scss");
var store = require("store");
import ru from "../../../../node_modules/vee-validate/dist/locale/ru";
import en from "../../../../node_modules/vee-validate/dist/locale/en";
import de from "../../../../node_modules/vee-validate/dist/locale/de";
import zh from "../../../../node_modules/vee-validate/dist/locale/zh_CN";
import VeeValidate, { Validator } from "vee-validate";
import { mapGetters } from "vuex";

export default {
    name: "MainClientPage",

    data() {
        return {
            //Show search panel
            searchPanel: false
        };
    },

    computed: {
        ...mapGetters([
            "getLangs",
            "getContentLang",
            "getLangsContentSelected",
            "getSettings"
        ]),

        //Current language
        langsCur: function() {
            let arr = this.getLangs;
            for (let i = 0; i < arr.length; i++)
                if (arr[i].active) {
                    this.$i18n.locale = arr[i].code;
                    return arr[i];
                }
            this.$i18n.locale = arr[0].code;
            return arr[0];
        }
    },

    methods: {
        //Toggle categories list sidebar
        toggleCat: function() {
            this.$refs.leftSidenavCat.toggle();
        },

        //Toggle language list sidebar
        toggleLang: function() {
            this.$refs.rightSidenavLang.toggle();
        },

        //Set UI language and hide language sidebar
        setUILang: function(par) {
            this.$i18n.locale = par.code;
            this.$store.dispatch("setContentLang", par.code);
            this.$refs.rightSidenavLang.toggle();

            //Set language validator
            let code = this.$i18n.locale;
            let lng = en;
            if (code == "ru") lng = ru;
            if (code == "de") lng = de;
            if (code == "zh") lng = zh;
            Validator.localize(code, lng);

            //Load posts with selected language prefix
            this.$store.dispatch("loadPosts", {
                catId:
                    this.$route.params.id == undefined
                        ? this.$route.params.id
                        : -1,
                clearBefore: true,
                r: this.$router
            });
        }
    },

    watch: {
        //On category id changed - load posts
        "$route.params.id": function(val, oldVal) {
            this.$store.dispatch("toggleSearchPanel", 0);
            this.$store.dispatch("loadPosts", {
                catId:
                    this.$route.path.match(/\/category\//) !== null ? val : -1,
                clearBefore: true,
                r: this.$router
            });
        },

        //On postid changed load one post
        "$route.params.postid": function(postid, oldVal) {
            //Get one post data from Server
            if (postid != undefined)
                this.$store.dispatch("setPostActive", {
                    id: postid,
                    catid: this.$route.params.id,
                    r: this.$router
                });
        }
    },

    created: function() {
        //Load categories from Server
        this.$store.dispatch("loadAllCategories", { r: this.$router });

        //Load posts from Server
        this.$store.dispatch("loadPosts", {
            catId:
                this.$route.path.match(/\/category\//) !== null
                    ? this.$route.params.id
                    : -1,
            clearBefore: true,
            r: this.$router
        });
    },

    beforeCreate: function() {
        //Load content language
        this.$i18n.locale = this.$store.getters.getContentLang;
        let code = this.$i18n.locale;

        //Set validator language
        let lng = en;
        if (code == "ru") lng = ru;
        if (code == "de") lng = de;
        if (code == "zh") lng = zh;
        Validator.localize(code, lng);
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
