<script>
require("./style.scss");

import VueNotifications from "vue-notifications";

export default {
    name: "byUsers",

    props: ["showEditComment"],

    data() {
        return {
            findTxt: "",
            findDlg: false,
            itmChk: [],
            commentOfUserDlg: false,
            usr: {
                usrid: "",
                email: ""
            }
        };
    },

    mounted: function() {
        this.itmChk = [];
        this.findTxt = "";
        this.findDlg = false;
        //Load users list
        this.$store.dispatch("loadbyUsers", {
            pgNum: 1,
            r: this.$router
        });
    },

    methods: {
        //On/Off search panel
        toggleFindDlg: function() {
            this.findDlg = !this.findDlg;
            if (!this.findDlg)
                //Load users list
                this.$store.dispatch("loadbyUsers", {
                    pgNum: this.$store.getters.getByUsersPgNum,
                    r: this.$router
                });
        },

        //Find comments
        findComment: function() {
            //Find users by comment text
            this.$store.dispatch("loadbyUsers", {
                pgNum: this.$store.getters.getByUsersPgNum,
                findTxt: this.findTxt,
                r: this.$router
            });
        },

        //Reset find users
        resetFind: function() {
            this.findTxt = "";
            this.$store.dispatch("loadbyUsers", {
                pgNum: 1,
                findTxt: this.findTxt,
                r: this.$router
            });
        },

        //Close find
        closeFind: function() {
            this.findDlg = false;
            this.findTxt = "";
            this.$store.dispatch("loadbyUsers", {
                pgNum: 1,
                findTxt: this.findTxt,
                r: this.$router
            });
        },

        //Page changed in users list
        onChangePageByUsers: function(pgNum) {
            this.$store.dispatch("loadbyUsers", {
                pgNum: pgNum,
                findTxt: this.findTxt,
                r: this.$router
            });
        },

        //Enter to user and get comments of current user
        openCommentsOfUser: function(usrid, email) {
            this.usr.usrid = usrid;
            this.usr.email = email;
            this.commentOfUserDlg = !this.commentOfUserDlg;
        },

        //Close user - back to users list
        closeCommentOfUserDlg: function() {
            this.commentOfUserDlg = !this.commentOfUserDlg;
        },

        //Remove comments in one user
        removeCommentsOfUser: function(id) {
            this.$store.dispatch("removeCommentsOfUsers", {
                ids: [id],
                r: this.$router
            });
        },

        //Remove comments of checked users
        removeCommentsOfUsers: function() {
            if (this.itmChk.length == 0)
                VueNotifications.error({
                    message: this.$t("Users_not_selected")
                });
            else {
                this.$store.dispatch("removeCommentsOfUsers", {
                    ids: this.itmChk,
                    r: this.$router
                });
                this.itmChk = [];
            }
        },

        //Block one user
        blockUser: function(id) {
            this.$store.dispatch("blockUsersOfComments", {
                ids: [id],
                r: this.$router
            });
        },

        //Block checked users
        blockUsersCheckedComment: function() {
            if (this.itmChk.length == 0)
                VueNotifications.error({
                    message: this.$t("Users_not_selected")
                });
            else {
                this.$store.dispatch("blockUsersOfComments", {
                    ids: this.itmChk,
                    r: this.$router
                });
                this.itmChk = [];
            }
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
