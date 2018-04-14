<script>
require("./style.scss");

import { API_HOST } from "../../../../../config";
import { mapGetters } from "vuex";
import Vue from "vue";
import VueNotifications from "vue-notifications";

export default {
    name: "MediaStoreList",

    props: ["onSelectImagesInStore", "onAddImage", "onDeleteImage"],

    data() {
        return {
            checkedFiles: [],
            selectOperations: "",
            filesList: [],
            pgNum: 1,
            findDlg: false,
            findTitleFltr: "",
            findTitle: "",
            editTitleDlg: false,
            edTitle: { id: -1 }
        };
    },

    methods: {
        //Save edit title
        saveEditTitle: function(itm) {
            this.getLangsContentSelected.map(itm1 => {
                itm["title_" + itm1.code] = this.edTitle["title_" + itm1.code];
            });
            this.edTitle = { id: -1 };
            this.editTitleDlg = false;
            this.$store.dispatch("saveEditFileTitle", {
                itm: itm,
                r: this.$router
            });
        },

        //Edit file header
        editTitle: function(itm) {
            this.editTitleDlg = !this.editTitleDlg;
            this.edTitle.id = itm.id;
            this.getLangsContentSelected.map(itm1 => {
                this.edTitle["title_" + itm1.code] =
                    itm["title_" + itm1.code] == null
                        ? ""
                        : itm["title_" + itm1.code];
            });
        },

        //Hide edit dialog
        hideEditTitle: function(id) {
            this.editTitleDlg = false;
        },

        //Remove images
        removeImages: function() {
            if (this.checkedFiles.length > 0)
                this.onDeleteImage(this.checkedFiles);
            else VueNotifications.error({ message: $t("Files_Not_Selected") });
        },

        //Remove one image
        removeOneImage: function(id) {
            this.onDeleteImage([id]);
        },

        //Find images
        findImages: function() {
            this.findTitleFltr = this.findTitle;
        },

        //Reset find image
        resetFindImages: function() {
            this.findTitle = "";
            this.findTitleFltr = "";
            this.pgNum = 1;
        },

        //Get image url
        getImgUrl: function(itm) {
            return API_HOST + "/uploads/" + itm.pth + "/" + itm.fnam;
        },

        //Set image page num
        setImagesPgNum: function(num) {
            this.pgNum = num;
        },

        //Show full image
        showFullImage: function(id) {},

        //Image add
        onAddImageClick: function() {
            this.onAddImage();
        },

        //Add prezero
        addZero: function(i) {
            if (i < 10) {
                i = "0" + i;
            }
            return i;
        },

        //Get date format
        getDateFrmt: function(dt1) {
            let dt = new Date(dt1);
            let curr_date = this.addZero(dt.getDate());
            let curr_month = this.addZero(dt.getMonth() + 1);
            let curr_year = this.addZero(dt.getFullYear());

            let hours = this.addZero(dt.getHours());
            let min = this.addZero(dt.getMinutes());
            let sec = this.addZero(dt.getSeconds());
            return (
                hours +
                ":" +
                min +
                ":" +
                sec +
                " / " +
                curr_date +
                "." +
                curr_month +
                "." +
                curr_year
            );
        },

        //Show hide find dialog
        showFindDlg: function() {
            this.findDlg = !this.findDlg;
            if (!this.findDlg) this.resetFindImages();
        }
    },

    computed: {
        ...mapGetters([
            "getFilesList",
            "getCategoriesItemsPerPage",
            "getContentLang",
            "getLangsContentSelected"
        ]),

        //Get images page num
        getImagesPgNum: function() {
            let arr = [];
            if (!this.findDlg) arr = this.filesList;
            else {
                if (this.findTitleFltr == "") arr = this.filesList;
                else
                    arr = this.filesList.filter(
                        itm =>
                            itm["title_" + this.getContentLang].indexOf(
                                this.findTitleFltr
                            ) !== -1
                    );
            }
            return arr.slice(
                (this.pgNum - 1) * this.getCategoriesItemsPerPage,
                this.pgNum * this.getCategoriesItemsPerPage
            );
        },

        //Get images count
        getImagesCount: function() {
            if (!this.findDlg) return this.filesList.length;
            else {
                if (this.findTitleFltr == "") return this.filesList.length;
                else
                    return this.filesList.filter(
                        itm =>
                            itm["title_" + this.getContentLang].indexOf(
                                this.findTitleFltr
                            ) !== -1
                    ).length;
            }
            return 0;
        }
    },

    mounted: function() {
        //Get files list
        this.filesList = this.$store.state.files.filesList;
        this.getLangsContentSelected.map(itm => {
            this.edTitle["title_" + itm.code] = "";
        });
    },

    watch: {
        //Select files operation changed
        selectOperations: function(val, oldval) {
            if (val != "") {
                if (val == "selallvis") {
                    this.checkedFiles = [];
                    this.getImagesPgNum.map(itm => {
                        this.checkedFiles.push(itm.id);
                    });
                }

                if (val == "unselallvis") {
                    this.getImagesPgNum.map(itm => {
                        for (let i = 0; i < this.checkedFiles.length; i++) {
                            if (this.checkedFiles[i] == itm.id) {
                                this.checkedFiles.splice(i, 1);
                                break;
                            }
                        }
                    });
                }

                if (val == "selall") {
                    this.checkedFiles = [];
                    this.filesList.map(itm => {
                        this.checkedFiles.push(itm.id);
                    });
                }

                if (val == "unselall") {
                    this.checkedFiles = [];
                }
            }
            this.selectOperations = "";
        },

        //Get files list
        getFilesList: function(val, oldval) {
            this.filesList = val;
        },

        //Image checked - external function
        checkedFiles: function(val, oldval) {
            this.onSelectImagesInStore(val);
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
