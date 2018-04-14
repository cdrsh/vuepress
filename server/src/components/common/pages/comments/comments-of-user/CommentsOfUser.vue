<script>
export default {
    name: "CommentsOfUser",

    props: ["email", "usrid", "closeCommentOfUserDlg"],

    data() {
        return {
            findTxt: "",
            findDlg: false,
            itmChk: [],
            usr: {
                email: this.email,
                id: this.usrid
            },
            editDlg: false
        };
    },

    mounted: function() {
        this.itmChk = [];
        this.findTxt = "";
        this.findDlg = false;
        //Get comments of one user
        this.$store.dispatch("loadCommentsOfOneUser", {
            data: {
                pgNum: 1,
                usrid: this.usr.id,
                findTxt: this.findTxt
            },
            r: this.$router
        });
    },

    methods: {
        //Page changed
        onChangePageOneUserComments: function(pgNum) {
            this.$store.dispatch("loadCommentsOfOneUser", {
                data: {
                    pgNum: pgNum,
                    usrid: this.usr.id,
                    findTxt: this.findTxt
                },
                r: this.$router
            });
        },

        //Edit comment show dialog
        showEditComment: function(id) {
            this.editDlg = !this.editDlg;
            this.$store.dispatch("prepareEditCommentOfUser", id);
        },

        //Close edit comment
        closeEditComment: function() {
            this.editDlg = false;
        },

        //Remove comment
        removeComment: function(id) {
            this.$store.dispatch("removeCommentsOfOneUser", {
                ids: [id],
                usrid: this.usr.id,
                findTxt: this.findTxt,
                r: this.$router
            });
        },

        //Remove checked comments
        removeComments: function() {
            this.$store.dispatch("removeCommentsOfOneUser", {
                ids: this.itmChk,
                usrid: this.usr.id,
                findTxt: this.findTxt,
                r: this.$router
            });
        },

        //Toggle find comments
        toggleFindDlg: function() {
            this.findDlg = !this.findDlg;
        },

        //Find comment
        findComment: function() {
            this.$store.dispatch("loadCommentsOfOneUser", {
                data: {
                    pgNum: this.$store.getters.getByUsersOneCommentPgNum,
                    usrid: this.usr.id,
                    findTxt: this.findTxt
                },
                r: this.$router
            });
        },

        //Reset find
        resetFind: function() {
            this.findTxt = "";
            this.$store.dispatch("loadCommentsOfOneUser", {
                data: {
                    pgNum: this.$store.getters.getByUsersOneCommentPgNum,
                    usrid: this.usr.id,
                    findTxt: this.findTxt
                },
                r: this.$router
            });
        },

        //Close find dialog
        closeFind: function() {
            this.findDlg = false;
            this.findTxt = "";
            this.$store.dispatch("loadCommentsOfOneUser", {
                data: {
                    pgNum: this.$store.getters.getByUsersOneCommentPgNum,
                    usrid: this.usr.id,
                    findTxt: this.findTxt
                },
                r: this.$router
            });
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
