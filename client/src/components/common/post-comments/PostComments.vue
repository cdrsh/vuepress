<script>
require("./style.scss");
import Vue from "vue";
let localStorage = require("store");
import { mapGetters } from "vuex";

export default {
    name: "PostComments",

    data() {
        return {
            //Answer comment object
            cmntToEdit: { mycmnt: "", postid: -1 },

            //Recapcha text
            capcha: "",

            //Add comment object
            cmntToAdd: { mycmnt: "", postid: -1 },

            //Recapcha google site key
            RecapchaKEY: this.$store.getters.getSettings["RECAPCHA_PUBLIC_KEY"]
            //RECAPCHASITEKEY
        };
    },

    computed: {
        ...mapGetters([
            "getSettings",
            "getCommentsAllItems",
            "getCommentsItemsPerPage",
            "getComments"
        ]),

        //is Registered authorized user
        isRegistered: function() {
            let at = localStorage.get("at");
            return at != "" && at !== undefined;
        }
    },

    created: function() {
        //Load comments if enabled and post id set
        if (
            this.$store.getters.getSettings.COMMENTS_ENABLE &&
            this.$route.params.postid !== undefined
        ) {
            this.$store.dispatch("loadComments", {
                r: this.$router,
                pgNum: 1,
                postid: this.$route.params.postid
            });

            this.cmntToAdd.postid = this.$route.params.postid;
        }

        this.capcha = "";
    },

    methods: {
        //Paginator comments changed - load comments
        onChangeCommentsPage: function(pgNum) {
            if (this.$route.params.postid !== undefined)
                this.$store.dispatch("loadComments", {
                    r: this.$router,
                    pgNum: pgNum,
                    postid: this.$route.params.postid
                });
        },

        //Show add commend modal dialog
        openAddCommentDlg: function() {
            this.cmntToAdd.mycmnt = null;

            //validator reset later
            setTimeout(() => {
                this.$validator.reset();
            }, 500);

            //Open by ref
            this.$refs["addCommentDialog"].open();
        },

        //Hide add comment modal dialog
        closeAddCommentDlg: function() {
            this.$refs["addCommentDialog"].close();
        },

        //Show answer dialog comment
        answerShowDlg: function(itm) {
            itm.mycmnt = null;

            //validator reset later
            setTimeout(() => {
                this.$validator.reset();
            }, 500);

            //Open by ref
            this.$refs["answerCommentDialog"].open();

            //Clone comment object to answer
            this.cmntToEdit = Vue._.cloneDeep(itm);
        },

        //Hide answer comment modal dialog
        closeAnswerDlg() {
            this.$refs["answerCommentDialog"].close();
        },

        //Add comment
        addComment: function() {
            //Get capcha
            this.cmntToAdd.capcha = this.capcha;

            //Add comment on server
            this.$store.dispatch("addComment", {
                cmnt: this.cmntToAdd,
                r: this.$router
            });

            //Clear capcha and close add comment dialog
            this.capcha = "";
            this.closeAddCommentDlg();
        },

        //Answer comment
        answerCommentDialog() {
            //Get capcha
            this.cmntToEdit.capcha = this.capcha;

            //Answer comment on server
            this.$store.dispatch("answerComment", {
                cmnt: this.cmntToEdit,
                r: this.$router
            });

            //Clear capcha and close answer comment dialog
            this.capcha = "";
            this.closeAnswerDlg();
        },

        //Recapcha verify ok
        onVerify: function(res) {
            this.capcha = res;
        },

        //reCapcha expired
        onExpired: function() {
            console.log("onExpired");
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
