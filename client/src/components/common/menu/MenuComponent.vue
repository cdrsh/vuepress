<script>
require("./style.scss");
import { mapGetters } from "vuex";
let localStorage = require("store");

export default {
    name: "MenuComponent",

    props: ["toggleCat", "toggleLang"],

    computed: {
        ...mapGetters([
            "getContentLang",
            "getContentLangFull",
            "getSettings",
            "getMenuCategories"
        ]),

        //Show login link
        isShowLogin: function() {
            let at = localStorage.get("at");
            return (
                this.getSettings.LOGIN_SWITCHER &&
                (at == "" || at === undefined)
            );
        },

        //Show logout link
        isShowLogout: function() {
            let at = localStorage.get("at");
            return (
                this.getSettings.LOGIN_SWITCHER &&
                (at != "" && at !== undefined)
            );
        }
    },

    methods: {
        //Logout to auth form
        logoutToAuthPage: function() {
            this.$store.dispatch("logout", { r: this.$router });
        },

        //Goto login
        goAuthPage() {
            this.$router.push("/auth");
        },

        //go to home page
        goToHome: function() {
            this.$router.push("/");
        },

        //Set category
        goToCategory: function(id) {
            this.$router.push("/category/" + id);
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
