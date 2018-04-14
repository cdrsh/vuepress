<script>
require("./style.scss");
var store = require("store");

export default {
    name: "ForgotPassPage",

    data() {
        return {
            //User object
            user: {
                email: ""
            }
        };
    },

    methods: {
        //Reset password on Server
        resetPassword: function() {
            if (this.$validator.errors.items.length == 0)
                this.$store.dispatch("resetPasswordAction", {
                    email: this.user.email,
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

        //set validator UI language
        if (code != "undefined") {
            this.$store.dispatch("setCurrentLangAction", code);
            this.$i18n.locale = code;
            store.set("curlang", code);
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
