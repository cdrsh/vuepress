<script>
import { mapGetters } from "vuex";
import * as conf from "../../../../../config/index";

export default {
    name: "AddUser",

    props: ["closeFn"],

    data() {
        return {
            //Add user object
            addUser: {
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
        //Add user
        addUserFn: function() {
            //Calc privelege
            let privs = 0;
            privs = conf.setAdminAccess(privs, this.addUser.privlgs.adminA);
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

            //Add to server
            this.$store.dispatch("addUser", {
                addUser: this.addUser,
                r: this.$router
            });
            this.closeFn();
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
