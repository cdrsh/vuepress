<script>
require("./style.scss");

import { mapGetters } from "vuex";

export default {
    name: "PostFind",

    props: ["contentLang", "closeFind"],

    data() {
        return {
            findBy: "v1",
            findTxt: "",
            findBySrv: "v1",
            findTxtSrv: "",
            pgNum: 1,
            postListFound: []
        };
    },

    methods: {
        //Find posts
        findPost: function() {
            this.findBySrv = this.findBy;
            this.findTxtSrv = this.findTxt;
            this.$store.dispatch("findPost", {
                data: {
                    findTxt: this.findTxtSrv,
                    findBy: this.findBySrv,
                    pgNum: this.pgNum
                },
                r: this.$router
            });
        },

        //Reset find
        resetFind: function() {
            this.findBy = "v1";
            this.findTxt = "";
            this.findBySrv = this.findBy;
            this.findTxtSrv = this.findTxt;
            this.pgNum = 1;
            this.$store.dispatch("findPost", {
                data: {
                    findTxt: this.findTxt,
                    findBy: this.findBy,
                    pgNum: 1
                },
                r: this.$router
            });
        },

        //Page changed
        onChangePage: function(pgNum) {
            this.pgNum = pgNum;
            this.$store.dispatch("findPost", {
                data: {
                    findTxt: this.findTxt,
                    findBy: this.findBy,
                    pgNum: this.pgNum
                },
                r: this.$router
            });
        },

        //Close find dialog
        closeFn: function() {
            this.findBy = "v1";
            this.findTxt = "";
            this.findBySrv = "v1";
            this.findTxtSrv = "";
            this.closeFind();
        }
    },

    computed: {
        ...mapGetters([
            "getContentLang",
            "getPostListFound",
            "getLangsContentSelected",
            "getPostPaginatorData"
        ])
    },

    watch: {
        //Post find object changed
        getEditPostObj: function(val, oldVal) {
            this.postListFound = val;
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
