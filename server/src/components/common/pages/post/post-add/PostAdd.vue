<script>
require("./style.scss");

import Vue from "vue";
import Vuex from "vuex";
import { mapGetters } from "vuex";
import { createEditor } from "vueditor";
import { API_HOST } from "../../../../../config";

export default {
    name: "PostAdd",

    data() {
        return {
            inst: null,
            tinymceData: "",
            postAdd: {
                id: -1,
                dt: "",
                ispub: "1",
                title_en: "",
                txt_en: "",
                kwrds: "",
                categories: []
            },
            selectedIDsInit: [],
            previewDlg: false,
            imageAddDlg: false,
            categories_edpost: [],
            addPostSelCatVis: false
        };
    },

    methods: {
        //Show/hide category filter
        setAddPostSelCatVis: function() {
            this.addPostSelCatVis = !this.addPostSelCatVis;
        },

        //Publish post
        publishThisPost: function() {
            this.postAdd.ispub = 1;
            this.postAdd[
                "txt_" + this.$store.getters.getContentLang
            ] = this.inst.getContent();
            this.inst.setContent("");

            //Save on server
            this.$store.dispatch("addPost", {
                postAdd: Vue._.cloneDeep(this.postAdd),
                r: this.$router
            });

            //clear
            this.postAdd["txt_" + this.$store.getters.getContentLang] = "";
            this.postAdd["title_" + this.$store.getters.getContentLang] = "";
            this.inst.setContent("");

            this.closeDialog();
        },

        //Save only post
        saveThisPost: function() {
            this.postAdd.ispub = 0;
            this.postAdd[
                "txt_" + this.$store.getters.getContentLang
            ] = this.inst.getContent();
            this.inst.setContent("");

            //Save on server
            this.$store.dispatch("addPost", {
                postAdd: Vue._.cloneDeep(this.postAdd),
                r: this.$router
            });

            //clear
            this.postAdd["txt_" + this.$store.getters.getContentLang] = "";
            this.postAdd["title_" + this.$store.getters.getContentLang] = "";
            this.inst.setContent("");

            this.closeDialog();
        },

        //Post preview
        onPreview: function() {
            this.tinymceData = this.inst.getContent();
            this.previewDlg = !this.previewDlg;
        },

        //Open image add dialog
        openImageAddDlg: function() {
            this.imageAddDlg = !this.imageAddDlg;
        },

        //Close image add dialog
        closeImageAddDlg: function() {
            this.imageAddDlg = false;
        },

        //New categories selected
        onSelectCategory: function(categories) {
            let oldCategories = Vue._.cloneDeep(this.postAdd.categories);

            //Add category to newCats if it's not in oldCategories
            let newCats = [];
            categories.map(itmCat => {
                if (
                    oldCategories.filter(itm => itm.id == itmCat.id).length == 0
                )
                    newCats.push(itmCat);
            });

            //Add ufldsArr from old categories with values to categories
            oldCategories.map(cat => {
                let catOne = categories.filter(itm => itm.id == cat.id);
                if (catOne.length > 0)
                    catOne[0].ufldsArr = Vue._.cloneDeep(cat.ufldsArr);
            });

            //Add ufldsArr for the new categories
            newCats.map(cat => {
                let catOne = categories.filter(itm => itm.id == cat.id);
                if (catOne.length > 0) {
                    catOne[0].ufldsArr = [];
                    cat.uflds.map(ufld => {
                        if (ufld.namef != "")
                            catOne[0].ufldsArr.push({
                                namef: ufld.namef,
                                valf: "",
                                catid: catOne[0].id,
                                fldid: ufld.fldid
                            });
                    });
                }
            });

            this.postAdd.categories = categories;
            this.categories_edpost = [];

            //Hide add dialog
            this.addPostSelCatVis = false;
        },

        //Close add post dialog
        closeDialog: function() {
            this.$store.dispatch("showAddPost", false);
        },

        //Add image from internet
        onSelectImagesInternet: function(obj) {
            this.inst.setContent(
                this.getContentLang +
                    "<img src='" +
                    obj.lnk +
                    "' title='" +
                    obj.title +
                    "' " +
                    "style='" +
                    (obj.szw != ""
                        ? " width:" + obj.szw + "px !important; "
                        : "") +
                    " " +
                    (obj.szh != ""
                        ? " height:" + obj.szh + "px !important; "
                        : "") +
                    "'>"
            );

            //Hide add dialog
            this.closeImageAddDlg();
        },

        //Add image from local storage
        onSelectImagesFromStore: function(fileList) {
            let arr = [];
            fileList.map(itm => {
                let tmp = this.getFilesList.filter(el => el.id == itm);
                if (tmp !== undefined) if (tmp.length > 0) arr.push(tmp[0]);
            });

            let imgs = "";
            arr.map(obj => {
                imgs +=
                    "<img src='" +
                    API_HOST +
                    "/uploads/" +
                    obj.pth +
                    "/" +
                    obj.fnam +
                    "' title='" +
                    obj["title_" + this.getContentLang] +
                    "' " +
                    "style='" +
                    (obj.szw != ""
                        ? " width:" + obj.szw + "px !important; "
                        : "") +
                    " " +
                    (obj.szh != ""
                        ? " height:" + obj.szh + "px !important; "
                        : "") +
                    "'>";
            });

            //Append new file link to post content
            imgs = this.inst.getContent() + imgs;
            this.inst.setContent(imgs);
            this.postAdd["txt_" + this.getContentLang] = imgs;
            this.closeImageAddDlg();
        },

        //Add image to local storage
        onSelectImagesFromDisk: function(file) {
            this.$store.dispatch("uploadImage", {
                file: file,
                closeFn: this.closeImageAddDlg,
                editor: this.inst,
                r: this.$router
            });
        }
    },

    computed: {
        ...mapGetters([
            "getContentLang",
            "getFilesList",
            "getLangsContentSelected",
            "getAddPostVis"
        ])
    },

    mounted: function() {
        //Editor init
        if (this.inst == null)
            this.inst = createEditor("#editorContainerAddPost", {
                fontName: [
                    { val: "arial black" },
                    { val: "times new roman" },
                    { val: "Courier New" }
                ],
                fontSize: [
                    "12px",
                    "14px",
                    "16px",
                    "18px",
                    "20px",
                    "24px",
                    "28px",
                    "32px",
                    "36px"
                ],
                id: "#editorContainerAddPost"
            });

        this.getLangsContentSelected.map(itm => {
            this.postAdd["title_" + itm.code] = "";
            this.postAdd["txt_" + itm.code] = "";
        });
    },

    watch: {
        //Language changed - change editor text
        getContentLang: function(val, oldVal) {
            if (this.postAdd["title_" + val] == undefined)
                this.postAdd["title_" + val] = "";

            this.postAdd["txt_" + oldVal] = this.inst.getContent();

            if (this.postAdd["txt_" + val] == undefined)
                this.postAdd["txt_" + val] = "";

            this.inst.setContent(this.postAdd["txt_" + val]);
        },

        //Add post dialog is visible
        //Init editor and data
        getAddPostVis: function(val, oldVal) {
            if (val) {
                this.tinymceData = "";
                this.postAdd = {
                    id: -1,
                    dt: "",
                    ispub: "1",
                    title_en: "",
                    txt_en: "",
                    kwrds: "",
                    categories: []
                };
                this.selectedIDsInit = [];
                this.previewDlg = false;
                this.imageAddDlg = false;
                this.categories_edpost = [];
                this.addPostSelCatVis = false;

                this.getLangsContentSelected.map(itm => {
                    this.postAdd["title_" + itm.code] = "";
                    this.postAdd["txt_" + itm.code] = "";
                });
            }
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
