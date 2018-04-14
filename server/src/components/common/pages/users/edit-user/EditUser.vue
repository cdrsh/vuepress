<script>
import { mapGetters } from "vuex";
import Vue from "vue";
import * as conf from "../../../../../config/index";

export default {
    name: "EditUser",

    props: ["closeFn", "userEdit"],

    data() {
        return {
            //Edit user object
            editUser: {
                email: "",
                pass: "",
                fname: "",
                mname: "",
                lname: "",
                nick: "",
                phone: "",
                site: "",
                icon: "",
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
            }
        };
    },

    methods: {
        //Save user
        saveUserFn: function() {
            //Calc priveleges
            let privs = 0;
            privs = conf.setAdminAccess(privs, this.editUser.privlgs.adminA);
            privs = conf.setFilesManagement(
                privs,
                this.editUser.privlgs.filesRW
            );
            privs = conf.setWriteCategories(
                privs,
                this.editUser.privlgs.categoryW
            );
            privs = conf.setReadCategories(
                privs,
                this.editUser.privlgs.categoryR
            );
            privs = conf.setWriteUsers(privs, this.editUser.privlgs.usersW);
            privs = conf.setReadUsers(privs, this.editUser.privlgs.usersR);
            privs = conf.setBlocked(privs, this.editUser.privlgs.blocked);
            privs = conf.setWritePost(privs, this.editUser.privlgs.postW);
            privs = conf.setReadPost(privs, this.editUser.privlgs.postR);
            this.editUser.privs = privs;

            //Save on server
            this.$store.dispatch("saveUser", {
                editUser: this.editUser,
                r: this.$router
            });
            this.closeFn();
        }
    },

    mounted: function() {
        //Load edited user
        this.editUser = Vue._.cloneDeep(this.userEdit);
        let privlgs = parseInt(this.userEdit.privlgs);

        //Get priveleges
        this.editUser.privlgs = {
            adminA: conf.isAdminAccess(privlgs),
            filesRW: conf.isFilesManagement(privlgs),
            categoryR: conf.isReadCategories(privlgs),
            categoryW: conf.isWriteCategories(privlgs),
            usersW: conf.isWriteUsers(privlgs),
            usersR: conf.isReadUsers(privlgs),
            blocked: conf.isBlocked(privlgs),
            postW: conf.isWritePost(privlgs),
            postR: conf.isReadPost(privlgs)
        };
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
