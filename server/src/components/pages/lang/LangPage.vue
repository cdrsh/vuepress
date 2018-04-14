<script>
require("./style.scss");

var store = require("store");
import VueNotifications from "vue-notifications";
import ru from "../../../../node_modules/vee-validate/dist/locale/ru";
import en from "../../../../node_modules/vee-validate/dist/locale/en";
import de from "../../../../node_modules/vee-validate/dist/locale/de";
import zh from "../../../../node_modules/vee-validate/dist/locale/zh_CN";
import VeeValidate, { Validator } from "vee-validate";

export default {
    name: "LangPage",

    data: function() {
        return {
            lng: this.$i18n.locale,
            contentLang: [],
            contentAllLang: [],
            bShowContentLang:
                this.$store.getters.getBShowContentLang == 1 ? true : false
        };
    },

    methods: {
        //UI language selected - remember to localStorage
        onSelectUILangOK: function() {
            this.$i18n.locale = this.lng;
            this.$store.dispatch("setCurrentLang", this.lng);
            store.set("curlang", this.lng);
        },

        //UI language cursor set
        onSelectUILang: function(code) {
            this.lng = code;
            let lng = en;
            if (code == "ru") lng = ru;
            if (code == "de") lng = de;
            if (code == "zh") lng = zh;
            Validator.localize(code, lng);
        },

        //Add content language
        addContentLanguage: function() {
            this.$store.dispatch("addLang", {
                lng: this.contentAllLang,
                r: this.$router
            });
            this.contentAllLang = [];
        },

        //Remove content language
        removeContentLanguage: function() {
            //Remove not all languages, one needed minimum
            if (
                this.$store.getters.getLangsContentSelected.length ==
                    this.contentLang.length ||
                this.$store.getters.getLangsContentSelected.length == 1
            ) {
                VueNotifications.error({
                    message: this.$t("Min_one_lang_must_be_set")
                });
            } else {
                this.$store.dispatch("removeLang", {
                    lng: this.contentLang,
                    r: this.$router
                });
                this.contentLang = [];
            }
        }
    },

    mounted: function() {
        //Load settings if not loaded
        this.$store.dispatch("loadSettings", { r: this.$router });
    },

    watch: {
        //Set content language switcher visibility on client changed
        bShowContentLang: function(val, oldVal) {
            this.$store.dispatch("setBShowContentLang", {
                val: val ? 1 : 0,
                r: this.$router
            });
        }
    },

    beforeCreate: function() {
        //Load languages
        this.$store.dispatch("loadLangs");
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
