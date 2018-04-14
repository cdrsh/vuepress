<script>
require("./style.scss");
var store = require("store");
import * as conf from "../../../config";
import ru from "../../../../node_modules/vee-validate/dist/locale/ru";
import en from "../../../../node_modules/vee-validate/dist/locale/en";
import de from "../../../../node_modules/vee-validate/dist/locale/de";
import zh from "../../../../node_modules/vee-validate/dist/locale/zh_CN";
import VeeValidate, { Validator } from "vee-validate";
import { mapGetters } from "vuex";

export default {
    name: "RegistrationPage",

    data() {
        return {
            //User object
            addUser: {
                email: "",
                pass: "",
                pass2: "",
                fname: "",
                mname: "",
                lname: "",
                nick: "",
                phone: "",
                site: "",
                icon: "home",
                privlgs: {
                    filesRW: false,
                    categoryR: false,
                    categoryW: false,
                    usersW: false,
                    usersR: false,
                    blocked: false,
                    postW: false,
                    postR: false
                }
            }
        };
    },

    methods: {
        //Get Avatar name
        avatarName: function() {
            if (this.addUser.nick.trim() != "")
                return this.addUser.nick.trim().substr(0, 1);
            if (this.addUser.fname.trim() != "")
                return this.addUser.fname.trim().substr(0, 1);
            if (this.addUser.mname.trim() != "")
                return this.addUser.mname.trim().substr(0, 1);
            if (this.addUser.lname.trim() != "")
                return this.addUser.lname.trim().substr(0, 1);
            if (this.addUser.email.trim() != "")
                return this.addUser.email.trim().substr(0, 1);
            return "N";
        },

        //Register on Server
        register: function() {
            let privs = 0;
            privs = conf.setFilesManagement(
                privs,
                this.addUser.privlgs.filesRW
            );
            privs = conf.setWriteCategories(
                privs,
                this.addUser.privlgs.categoryW
            );
            privs = conf.setReadCategories(
                privs,
                this.addUser.privlgs.categoryR
            );
            privs = conf.setWriteUsers(privs, this.addUser.privlgs.usersW);
            privs = conf.setReadUsers(privs, this.addUser.privlgs.usersR);
            privs = conf.setBlocked(privs, this.addUser.privlgs.blocked);
            privs = conf.setWritePost(privs, this.addUser.privlgs.postW);
            privs = conf.setReadPost(privs, this.addUser.privlgs.postR);
            this.addUser.privs = privs;
            if (this.$validator.errors.items.length == 0)
                this.$store.dispatch("register", {
                    addUser: this.addUser,
                    r: this.$router
                });
            else
                VueNotifications.error({
                    message: this.$t("Error_fields_fill")
                });
        }
    },

    computed: {
        ...mapGetters([
            "getRegistrationIndicator",
            "getIcons",
            "getSettings",
            "getLangs"
        ]),

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

    beforeCreate: function() {
        //Load active UI language from localStorage
        let code = store.get("curlang");

        //Set validator UI language
        if (code !== undefined) {
            this.$store.dispatch("setCurrentLangAction", code);
            this.$i18n.locale = code;
            store.set("curlang", code);
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
