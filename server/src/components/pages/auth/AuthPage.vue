<script>
require("./style.scss");

var store = require("store");
import ru from "../../../../node_modules/vee-validate/dist/locale/ru";
import en from "../../../../node_modules/vee-validate/dist/locale/en";
import de from "../../../../node_modules/vee-validate/dist/locale/de";
import zh from "../../../../node_modules/vee-validate/dist/locale/zh_CN";
import VeeValidate, { Validator } from "vee-validate";

export default {
    name: "AuthPage",

    data() {
        return {
            bRemeberMe: true,
            langs: "",
            user: {
                email: "",
                password: "",
                remember: true
            }
        };
    },

    computed: {
        //Current object
        langsCur: function() {
            let arr = this.$store.getters.getLangs;
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
        //Toggle language selection panel
        toggleLangPanel: function() {
            this.$refs.leftSidenav.toggle();
        },

        //Set UI language
        setUILang: function(itm) {
            this.$store.dispatch("setCurrentLangAction", itm.code);
            this.$i18n.locale = itm.code;
            store.set("curlang", itm.code);

            let lng = en;
            if (itm.code == "ru") lng = ru;
            if (itm.code == "de") lng = de;
            if (itm.code == "zh") lng = zh;
            Validator.localize(itm.code, lng);

            //Hide language panel
            this.$refs.leftSidenav.toggle();
        },

        //Login on server
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
        //Load current language
        let code = store.get("curlang");
        if (code != "undefined") {
            this.$store.dispatch("setCurrentLangAction", code);
        }

        //Validator localsation
        let lng = en;
        if (code == "ru") lng = ru;
        if (code == "de") lng = de;
        if (code == "zh") lng = zh;
        Validator.localize(code, lng);
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>


<style>
/* material icons offline */
@font-face {
    font-family: "Material Icons";
    font-style: normal;
    font-weight: 400;
    src: url(/static/material-icons.woff2) format("woff2");
}
.material-icons {
    font-family: "Material Icons";
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-feature-settings: "liga";
    -webkit-font-smoothing: antialiased;
}
</style>
