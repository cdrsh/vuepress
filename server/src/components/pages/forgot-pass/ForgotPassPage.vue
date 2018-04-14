<script>
require("./style.scss");

var store = require("store");

export default {
    name: "ForgotPassPage",

    data() {
        return {
            user: {
                email: ""
            }
        };
    },

    methods: {
        //Reset password on server
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
        //Load active language from localStorage
        let code = store.get("curlang");

        if (code != "undefined") {
            this.$store.dispatch("setCurrentLangAction", code);
            this.$i18n.locale = code;
            store.set("curlang", code);
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
