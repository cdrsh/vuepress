<script>
require("./style.scss");
import { mapGetters } from "vuex";
import Vue from "vue";

export default {
    name: "CommentsOfPost",

    props: ["postObj", "closeFn"],

    data() {
        return {
            findTxt: "",
            findDlg: false,
            itmChk: [],
            itmChk1: [],
            post: this.postObj,
            editDlg: false,
            viewTypeBtn: "tree",
            levelPadAllComments: 20
        };
    },

    computed: {
        ...mapGetters([
            "getContentLang",
            "getLangsContentSelected",
            "getByOnePostAllItemsCount",
            "getByCategoriesOneItemsPerPage",
            "getByOnePostAllItemsCountFound",
            "getByCategoriesOneItemsPerPage",
            "getByOnePostComments",
            "getByOnePostCommentsFound"
        ])
    },

    mounted: function() {
        //Get comments of one post
        this.$store.dispatch("loadCommentsOfOnePost", {
            data: {
                pgNum: 1,
                postid: this.post.id
            },
            r: this.$router
        });
    },

    methods: {
        //Set comments view tree/list
        setViewTypeAllComments: function(typ) {
            this.viewTypeBtn = typ;
        },

        //Comments page changed
        onChangePage: function(pgNum) {
            //Get comments of one post by page number
            this.$store.dispatch("loadCommentsOfOnePost", {
                data: {
                    pgNum: pgNum,
                    postid: this.post.id
                },
                r: this.$router
            });
        },

        //Page changed in found comments
        onChangePageFound: function(pgNum) {
            //Get comments of one post by page number
            this.$store.dispatch("findCommentsOfOnePost", {
                data: {
                    pgNum: pgNum,
                    postid: this.post.id,
                    findTxt: this.findTxt
                },
                r: this.$router
            });
        },

        //Show edit comment
        showEditComment: function(id) {
            this.editDlg = !this.editDlg;
            this.$store.dispatch("prepareEditCommentOfPost", id);
        },

        //Close Edit comment
        closeEditComment: function() {
            this.editDlg = false;
        },

        //Comment saved
        onSaveComment: function(obj) {
            this.$store.dispatch("saveCommentOfPostOne", obj);
        },

        //Remove one comment
        removeComment: function(id) {
            this.$store.dispatch("removeCommentsOfOnePost", {
                data: {
                    ids: [id],
                    postid: this.post.id,
                    findTxt: this.findTxt
                },
                r: this.$router
            });
        },

        //Remove comments checked
        removeComments: function() {
            this.$store.dispatch("removeCommentsOfOnePost", {
                data: {
                    ids: this.itmChk,
                    postid: this.post.id,
                    findTxt: this.findTxt
                },
                r: this.$router
            });
            this.itmChk = [];
        },

        //Remove comment found
        removeCommentFound: function(id) {
            this.$store.dispatch("removeCommentsOfOnePostFound", {
                data: {
                    ids: [id],
                    postid: this.post.id
                },
                r: this.$router
            });
        },

        //Remove comments found and checked
        removeCommentsFound: function() {
            this.$store.dispatch("removeCommentsOfOnePostFound", {
                data: {
                    ids: this.itmChk1,
                    postid: this.post.id
                },
                r: this.$router
            });
            this.itmChk1 = [];
        },

        //Block user by comment
        blockUserComment: function(id) {
            this.$store.dispatch("blockCommentsOfOnePost", {
                ids: [id],
                r: this.$router
            });
        },

        //Block user by comments checked
        blockUserComments: function() {
            this.$store.dispatch("blockCommentsOfOnePost", {
                ids: this.itmChk,
                r: this.$router
            });
            this.itmChk = [];
        },

        //Block user on comment found
        blockUserCommentFound: function(id) {
            this.$store.dispatch("blockCommentsOfOnePostFound", {
                ids: [id],
                r: this.$router
            });
        },

        //Block users on comments checked and found
        blockUserCommentsFound: function() {
            this.$store.dispatch("blockCommentsOfOnePostFound", {
                ids: this.itmChk1,
                r: this.$router
            });
            this.itmChk1 = [];
        },

        //Toggle find comments
        toggleFindDlg: function() {
            this.findDlg = !this.findDlg;
            if (this.findDlg) this.$store.dispatch("clearCommentsOfOnePost");
            else
                this.$store.dispatch("loadCommentsOfOnePost", {
                    data: {
                        pgNum: 1,
                        postid: this.post.id
                    },
                    r: this.$router
                });
        },

        //Find comment
        findComment: function() {
            this.$store.dispatch("findCommentsOfOnePost", {
                data: {
                    pgNum: this.$store.getters.getByUsersOneCommentPgNumFound,
                    postid: this.post.id,
                    findTxt: this.findTxt
                },
                r: this.$router
            });
        },

        //Reset find
        resetFind: function() {
            this.$store.dispatch("clearCommentsOfOnePost");
            this.itmChk1 = [];
            this.findTxt = "";
            this.$store.dispatch("findCommentsOfOnePost", {
                data: {
                    pgNum: 1,
                    postid: this.post.id,
                    findTxt: this.findTxt
                },
                r: this.$router
            });
        },

        //Close find
        closeFind: function() {
            this.findDlg = false;
            this.findTxt = "";
            this.itmChk = [];
            this.$store.dispatch("loadCommentsOfOnePost", {
                data: {
                    pgNum: 1,
                    postid: this.post.id
                },
                r: this.$router
            });
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
