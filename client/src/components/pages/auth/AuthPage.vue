<script>
require("./style.scss");
var store = require("store");
import VueNotifications from "vue-notifications";
import ru from "../../../../node_modules/vee-validate/dist/locale/ru";
import en from "../../../../node_modules/vee-validate/dist/locale/en";
import de from "../../../../node_modules/vee-validate/dist/locale/de";
import zh from "../../../../node_modules/vee-validate/dist/locale/zh_CN";
import VeeValidate, { Validator } from "vee-validate";
import { mapGetters } from "vuex";

export default {
    name: "AuthPage",

    data() {
        return {
            langs: "",

            //Auth user object
            user: {
                email: "",
                password: "",
                remember: true
            }
        };
    },

    computed: {
        ...mapGetters(["getLoginIndicator", "getSettings", "getLangs"]),

        //Get current language
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
        //Show/Hide language panel
        toggleLangPanel: function() {
            this.$refs.leftSidenav.toggle();
        },

        //Set new selected language and hide language panel
        setUILang: function(itm) {
            this.$store.dispatch("setCurrentLangAction", itm.code);
            this.$i18n.locale = itm.code;
            store.set("curlang", itm.code);
            this.$refs.leftSidenav.toggle();
        },

        //login on server
        login: function() {
            if (this.$validator.errors.items.length == 0)
                this.$store.dispatch("login", {
                    user: this.user,
                    r: this.$router
                });
            else
                VueNotifications.error({
                    message: this.$t("Error_fields_fill")
                });
        }
    },

    beforeCreate: function() {
        //Load active UI language from localStorage
        let code = store.get("curlang");

        //Set validator UI language
        if (code != "undefined") {
            this.$store.dispatch("setCurrentLangAction", code);
            let lng = en;
            if (code == "ru") lng = ru;
            if (code == "de") lng = de;
            if (code == "zh") lng = zh;
            Validator.localize(code, lng);
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
