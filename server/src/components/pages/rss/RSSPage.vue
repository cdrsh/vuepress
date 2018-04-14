<script>
require("./style.scss");

import VueNotifications from "vue-notifications";

export default {
    name: "RSSPage",

    data() {
        return {
            addRSSDlg: false,
            editRSSDlg: false,
            findDlg: false,
            typeContent: "category",
            itmChk: [],
            findTxt: "",
            edObj: {}
        };
    },

    methods: {
        //Remove RSS
        removeRSS: function(id) {
            this.$store.dispatch("removeRSS", {
                ids: [id],
                r: this.$router
            });
        },

        //Remove checked RSS
        removeCheckedRSS: function() {
            if (this.itmChk.length > 0) {
                this.$store.dispatch("removeRSS", {
                    ids: this.itmChk,
                    r: this.$router
                });
                this.itmChk = [];
            } else
                VueNotifications.error({
                    message: this.$t("No_rss_selected")
                });
        },

        //Add RSS
        addRSS: function() {
            this.addRSSDlg = !this.addRSSDlg;
        },

        //Close add rss dialog
        closeAddRSSDlg: function() {
            this.addRSSDlg = false;
        },

        //Page changed
        onChangePage: function(pgNum) {
            this.$store.dispatch("loadRSS", {
                data: {
                    pgNum: pgNum,
                    itemsPerPage: this.$store.getters.getRssItemsPerPage,
                    findTxt: this.$store.getters.getRssFindTxt
                },
                r: this.$router
            });
        },

        //Find RSS
        findRSS: function() {
            this.$store.dispatch("loadRSS", {
                data: {
                    pgNum: this.$store.getters.getRssPgNum,
                    itemsPerPage: this.$store.getters.getRssItemsPerPage,
                    findTxt: this.findTxt
                },
                r: this.$router
            });
        },

        //Reset find
        resetFind: function() {
            this.findTxt = "";
            this.$store.dispatch("loadRSS", {
                data: {
                    pgNum: this.$store.getters.getRssPgNum,
                    itemsPerPage: this.$store.getters.getRssItemsPerPage,
                    findTxt: this.findTxt
                },
                r: this.$router
            });
        },

        //Close find
        closeFind: function() {
            this.findTxt = "";
            this.findDlg = false;
            this.$store.dispatch("loadRSS", {
                data: {
                    pgNum: this.$store.getters.getRssPgNum,
                    itemsPerPage: this.$store.getters.getRssItemsPerPage,
                    findTxt: this.findTxt
                },
                r: this.$router
            });
        },

        //Toggle find
        toggleFindDlg: function() {
            this.findDlg = !this.findDlg;
        },

        //Edit Rss - show dialog
        editRSS: function(itm) {
            this.edObj = itm;
            this.editRSSDlg = !this.editRSSDlg;
        },

        //Close edit rss dialog
        closeEditRSS: function() {
            this.editRSSDlg = false;
        }
    },

    mounted: function() {
        //Reset actions
        this.$store.dispatch("rssActionsReset");

        //Load settings if not loaded
        this.$store.dispatch("loadSettings", { r: this.$router });

        //Load categories if not loaded
        this.$store.dispatch("loadAllCategoriesIfNotLoaded", {
            r: this.$router
        });

        //Load RSS
        this.$store.dispatch("loadRSS", {
            data: {
                pgNum: 1,
                itemsPerPage: this.$store.getters.getRssItemsPerPage,
                findTxt: this.$store.getters.getRssFindTxt
            },
            r: this.$router
        });
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
