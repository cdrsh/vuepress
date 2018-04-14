<script>
require("./style.scss");

import { mapGetters } from "vuex";
import VueNotifications from "vue-notifications";

export default {
    name: "ByCategories",

    data() {
        return {
            findTxt: "",
            findDlg: false,
            itmChk: [],
            oneCategoryDlg: false,
            catname: "",
            catid: 1
        };
    },

    mounted: function() {
        this.itmChk = [];
        this.findTxt = "";
        this.findDlg = false;
    },

    computed: {
        ...mapGetters(["getContentLang"])
    },

    methods: {
        //Page category changed
        onChangePage: function(pgNum) {
            this.$store.dispatch("setPgNumByCategories", pgNum);
        },

        //Search on/off toggle
        toggleFindDlg: function() {
            this.findDlg = !this.findDlg;
            if (!this.findDlg) {
                this.findTxt = "";
                this.$store.dispatch("loadbyCategories", {
                    findTxt: this.findTxt,
                    r: this.$router
                });
            }
        },

        //Find categories by comments
        findComment: function() {
            this.$store.dispatch("loadbyCategories", {
                findTxt: this.findTxt,
                r: this.$router
            });
        },

        //Reset find comment
        resetFind: function() {
            this.findTxt = "";
            this.$store.dispatch("loadbyCategories", {
                findTxt: this.findTxt,
                r: this.$router
            });
        },

        //Close find
        closeFind: function() {
            this.findDlg = false;
            this.findTxt = "";
            this.$store.dispatch("loadbyCategories", {
                findTxt: this.findTxt,
                r: this.$router
            });
        },

        //Remove comments of selected categories
        removeCommentsOfCategories: function() {
            if (this.itmChk.length > 0) {
                this.$store.dispatch("removeCommentsOfCategory", {
                    ids: this.itmChk,
                    findTxt: this.findTxt,
                    r: this.$router
                });
                this.itmChk = [];
            } else
                VueNotifications.error({
                    message: this.$t("Category_not_selected")
                });
        },

        //Remove comments of the post
        removeCommentsOfCategory: function(id) {
            this.$store.dispatch("removeCommentsOfCategory", {
                ids: [id],
                findTxt: this.findTxt,
                r: this.$router
            });
        },

        //Show comments of the one category
        enterCategory: function(catid, catname) {
            this.catname = catname;
            this.catid = catid;
            this.oneCategoryDlg = !this.oneCategoryDlg;
        },

        //Close category
        closeCategoryOne: function() {
            this.oneCategoryDlg = false;
        }
    },

    beforeCreate: function() {
        //Load by categories
        this.$store.dispatch("loadbyCategories", {
            findTxt: "",
            r: this.$router
        });
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
