<script>
require("./style.scss");

import { mapGetters } from "vuex";
import VueNotifications from "vue-notifications";

export default {
    name: "ByPosts",

    data() {
        return {
            findTxt: "",
            findDlg: false,
            itmChk: [],
            inPostDlg: false,
            postObjEntered: {}
        };
    },

    mounted: function() {
        this.itmChk = [];
        this.findTxt = "";
        this.findDlg = false;

        //Load posts with comments count by page num
        this.$store.dispatch("loadbyPosts", {
            data: {
                pgNum: 1,
                findTxt: this.findTxt
            },
            r: this.$router
        });
    },

    computed: {
        ...mapGetters(["getContentLang"])
    },

    methods: {
        //Page changed
        onChangePage: function(pgNum) {
            //Load posts with comments count by page num
            this.$store.dispatch("loadbyPosts", {
                data: {
                    pgNum: pgNum,
                    findTxt: this.findTxt
                },
                r: this.$router
            });
        },

        //On/off search panel
        toggleFindDlg: function() {
            this.findDlg = !this.findDlg;
            if (!this.findDlg)
                //Load posts with comments count by page num
                this.$store.dispatch("loadbyPosts", {
                    data: {
                        pgNum: this.$store.getters.getByPostsPgNum,
                        findTxt: this.findTxt
                    },
                    r: this.$router
                });
        },

        //Find posts by comments
        findComment: function() {
            //Load posts with comments count by page num
            this.$store.dispatch("loadbyPosts", {
                data: {
                    pgNum: this.$store.getters.getByPostsPgNum,
                    findTxt: this.findTxt
                },
                r: this.$router
            });
        },

        //Reset find
        resetFind: function() {
            this.findTxt = "";
            //Load posts with comments count by page num
            this.$store.dispatch("loadbyPosts", {
                data: {
                    pgNum: this.$store.getters.getByPostsPgNum,
                    findTxt: this.findTxt
                },
                r: this.$router
            });
        },

        //Close find
        closeFind: function() {
            this.findDlg = false;
            this.findTxt = "";
            this.$store.dispatch("loadbyPosts", {
                data: {
                    pgNum: this.$store.getters.getByPostsPgNum,
                    findTxt: this.findTxt
                },
                r: this.$router
            });
        },

        //Remove comments of one user
        removeCommentsOfPosts: function() {
            if (this.itmChk.length > 0) {
                //Remove comments of post
                this.$store.dispatch("removeCommentsOfPost", {
                    ids: this.itmChk,
                    r: this.$router
                });
                this.itmChk = [];
            } else
                VueNotifications.error({
                    message: this.$t("Posts_not_selected")
                });
        },

        //Remove comments of one post
        removeCommentsOfPost: function(id) {
            this.$store.dispatch("removeCommentsOfPost", {
                ids: [id],
                r: this.$router
            });
        },

        //Block users of post
        blockUsers: function(id) {
            this.$store.dispatch("blockCommentsOfPost", {
                ids: [id],
                r: this.$router
            });
        },

        //Block users of checked posts
        blockUsersCheckedPosts: function() {
            if (this.itmChk.length == 0)
                VueNotifications.error({
                    message: this.$t("Posts_not_selected")
                });
            else {
                this.$store.dispatch("blockCommentsOfPost", {
                    ids: this.itmChk,
                    r: this.$router
                });
                this.itmChk = [];
            }
        },

        //Get comments of one post
        enterPost: function(post) {
            this.postObjEntered = post;
            this.inPostDlg = !this.inPostDlg;
        },

        //Close one post
        closeInPost: function() {
            this.inPostDlg = false;
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
