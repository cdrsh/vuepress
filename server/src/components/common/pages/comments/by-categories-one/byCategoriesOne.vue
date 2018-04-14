<script>
require("./style.scss");

import { mapGetters } from "vuex";

export default {
    name: "ByCategoriesOne",

    props: ["catid", "catname", "closeCategoryOne"],

    data() {
        return {
            findTxt: "",
            findDlg: false,
            editDlg: false,
            itmChk: [],
            oneCategoryDlg: false,
            editComment: {
                id: 0,
                txt: "",
                isBlocked: false
            }
        };
    },

    mounted: function() {
        this.itmChk = [];
        this.findTxt = "";
        this.findDlg = false;

        //Load comments category
        this.$store.dispatch("loadCommentsCategory", {
            data: {
                catid: this.catid,
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
        //Close edit comment dialog
        closeEditComment: function() {
            this.editDlg = !this.editDlg;
        },

        //On/off find
        toggleFindDlg: function() {
            this.findDlg = !this.findDlg;
            if (!this.findDlg) {
                this.findTxt = "";
                this.$store.dispatch("loadCommentsCategory", {
                    data: {
                        catid: this.catid,
                        pgNum: 1,
                        findTxt: this.findTxt
                    },
                    r: this.$router
                });
            }
        },

        //Find comments
        findComment: function() {
            this.$store.dispatch("loadCommentsCategory", {
                data: {
                    catid: this.catid,
                    pgNum: 1,
                    findTxt: this.findTxt
                },
                r: this.$router
            });
        },

        //Reset find
        resetFind: function() {
            this.findTxt = "";
            this.$store.dispatch("loadCommentsCategory", {
                data: {
                    catid: this.catid,
                    pgNum: 1,
                    findTxt: this.findTxt
                },
                r: this.$router
            });
        },

        //Close find
        closeFind: function() {
            this.findDlg = false;
            this.findTxt = "";
            this.$store.dispatch("loadCommentsCategory", {
                data: {
                    catid: this.catid,
                    pgNum: 1,
                    findTxt: this.findTxt
                },
                r: this.$router
            });
        },

        //Remove comments of checked categories
        removeCheckedCommentsOfCategory: function() {
            this.$store.dispatch("removeCommentsOfCategoryOne", {
                data: {
                    ids: this.itmChk,
                    catid: this.catid
                },
                r: this.$router
            });
            this.itmChk = [];
        },

        //Remove comments of one category
        removeCommentsOfCategory: function(id) {
            this.$store.dispatch("removeCommentsOfCategoryOne", {
                data: {
                    ids: [id],
                    catid: this.catid
                },
                r: this.$router
            });
        },

        //Show edit comment dialog
        showEditComment: function(itm) {
            this.editComment = itm;
            this.editDlg = !this.editDlg;
        },

        //Page categories changed
        onChangePage: function(pgNum) {
            this.$store.dispatch("loadCommentsCategory", {
                data: {
                    catid: this.catid,
                    pgNum: pgNum,
                    findTxt: this.findTxt
                },
                r: this.$router
            });
        },

        //Block users of one category comment
        blockUserComment: function(id) {
            this.$store.dispatch("blockUserCategoryOne", {
                ids: [id],
                r: this.$router
            });
        },

        //Block users of the checked categories comments
        blockUserCheckedComments: function() {
            this.$store.dispatch("blockUserCategoryOne", {
                ids: this.itmChk,
                r: this.$router
            });
            this.itmChk = [];
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
