<script>
require("./style.scss");
import VueNotifications from "vue-notifications";

export default {
    name: "AllComments",

    props: ["showEditComment"],

    data() {
        return {
            levelPadAllComments: 20,
            viewTypeBtn: "tree",
            findTxt: "",
            findDlg: false,
            itmChk: []
        };
    },

    mounted: function() {
        this.itmChk = [];
        this.findTxt = "";
        this.findDlg = false;

        //Load all comments on show
        this.$store.dispatch("loadAllComments", {
            pgNum: this.$store.getters.getAllCommentsPgNum,
            r: this.$router
        });
    },

    methods: {
        //Close search dialog
        closeFind: function() {
            this.findDlg = false;
            this.findTxt = "";
        },

        //Toggle search dialog
        toggleFindDlg: function() {
            this.findDlg = !this.findDlg;
            if (!this.findDlg)
                //Load all comments with find text
                this.$store.dispatch("loadAllComments", {
                    pgNum: this.$store.getters.getAllCommentsPgNum,
                    r: this.$router
                });
        },

        //Switch comments view tree/list
        setViewTypeAllComments: function(typ) {
            this.viewTypeBtn = typ;
        },

        //Comments page unfiltered changed
        onChangePageAllComments: function(pgNum) {
            //Load all comments with new page
            this.$store.dispatch("loadAllComments", {
                pgNum: pgNum,
                r: this.$router
            });
        },

        //Block user which comment
        blockUserComment: function(id) {
            this.$store.dispatch("blockUsersCheckedComment", {
                ids: [id],
                r: this.$router
            });
        },

        //Block checked users
        blockUsersCheckedComment: function() {
            if (this.itmChk.length > 0) {
                this.$store.dispatch("blockUsersCheckedComment", {
                    commentIds: this.itmChk,
                    r: this.$router
                });
                this.itmChk = [];
            } else
                VueNotifications.error({
                    message: this.$t("No_comments_select_to_block")
                });
        },

        //Remove comment
        removeComment: function(id) {
            this.$store.dispatch("removeComments", {
                ids: [id],
                r: this.$router
            });
        },

        //Remove comments
        removeComments: function() {
            if (this.itmChk.length > 0) {
                if (!this.findDlg)
                    this.$store.dispatch("removeComments", {
                        ids: this.itmChk,
                        r: this.$router
                    });
                else
                    this.$store.dispatch("removeCommentsFound", {
                        ids: this.itmChk,
                        r: this.$router
                    });
                this.itmChk = [];
            } else
                VueNotifications.error({
                    message: this.$t("No_comments_select_to_remove")
                });
        },

        //Remove found comments
        removeCommentFound: function(id) {
            this.$store.dispatch("removeCommentsFound", {
                ids: [id],
                r: this.$router
            });
        },

        //Page changed on found comments
        onChangePageAllCommentsFound: function(pgNum) {
            //find comments with new page num
            this.$store.dispatch("findAllComments", {
                findTxt: this.findTxt,
                pgNum: pgNum,
                r: this.$router
            });
        },

        //Find comments clicked
        findComment: function() {
            this.$store.dispatch("findAllComments", {
                findTxt: this.findTxt,
                pgNum: this.$store.getters.getAllCommentsFoundPgNum,
                r: this.$router
            });
        },

        //Reset find
        resetFind: function() {
            this.findTxt = "";
            this.$store.dispatch("findAllComments", {
                findTxt: this.findTxt,
                pgNum: 1,
                r: this.$router
            });
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
