<script>
require("./style.scss");

import Vue from "vue";
import Vuex from "vuex";
import { mapGetters } from "vuex";
import { createEditor } from "vueditor";
import { API_HOST } from "../../../../../config";

export default {
    name: "PostEdit",

    data() {
        return {
            inst: null,
            tinymceData: "",
            selectedIDsInit: [],
            postEdit: Vue._.cloneDeep(this.$store.getters.getEditPostObj),
            previewDlg: false,
            imageAddDlg: false,
            edPostSelCatVis: false,
            categories_edpost: []
        };
    },

    methods: {
        //Show/Hide edit post dialog
        setEdPostSelCatVis: function() {
            this.edPostSelCatVis = !this.edPostSelCatVis;
        },

        //Remove current post
        removeThisPost: function() {
            this.$store.dispatch("removePost", {
                ids: [this.postEdit.id],
                r: this.$router
            });
            this.closeDialog();
        },

        //Publish post
        publishThisPost: function() {
            this.postEdit.ispub = 1;
            this.postEdit[
                "txt_" + this.$store.getters.getContentLang
            ] = this.inst.getContent();

            //Save post on server
            this.$store.dispatch("savePost", {
                postEdit: this.postEdit,
                r: this.$router
            });

            //Close edit dialog
            this.closeDialog();
        },

        //Save post
        saveThisPost: function() {
            this.postEdit.ispub = 0;
            this.postEdit[
                "txt_" + this.$store.getters.getContentLang
            ] = this.inst.getContent();

            //Save post on server
            this.$store.dispatch("savePost", {
                postEdit: this.postEdit,
                r: this.$router
            });

            //Close edit dialog
            this.closeDialog();
        },

        //Preview post
        onPreview: function() {
            this.tinymceData = this.inst.getContent();
            this.previewDlg = !this.previewDlg;
        },

        //Open image add dialog
        openImageAddDlg: function() {
            this.imageAddDlg = !this.imageAddDlg;
        },

        //Close add image dialog
        closeImageAddDlg: function() {
            this.imageAddDlg = false;
        },

        //New categories selected
        onSelectCategory: function(categories) {
            let oldCategories = Vue._.cloneDeep(this.postEdit.categories);

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

            this.postEdit.categories = categories;
            this.categories_edpost = [];
            this.$store.dispatch("selectCategoryPostEdit", categories);

            //Hide add dialog
            this.edPostSelCatVis = false;
        },

        //Close add post dialog
        closeDialog: function() {
            this.$store.dispatch("showEditPost", false);
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
            this.postEdit["txt_" + this.getContentLang] = imgs;
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
        ...mapGetters(["getContentLang", "getEditPostObj", "getFilesList"])
    },

    mounted: function() {
        //Editor init
        this.inst = createEditor("#editorContainer", {
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
            id: "#editorContainer"
        });

        this.inst.setContent(this.postEdit["txt_" + this.getContentLang]);
    },

    watch: {
        //Language changed - change editor text
        getContentLang: function(val, oldVal) {
            if (this.postEdit["title_" + val] == undefined)
                this.postEdit["title_" + val] = "";

            this.postEdit["txt_" + oldVal] = this.inst.getContent();

            if (this.postEdit["txt_" + val] == undefined)
                this.postEdit["txt_" + val] = "";

            this.inst.setContent(this.postEdit["txt_" + val]);
        },

        //Add post dialog is visible
        //Init editor and data
        getEditPostObj: function(val, oldVal) {
            this.postEdit = Vue._.cloneDeep(val);
            this.inst.setContent(this.postEdit["txt_" + this.getContentLang]);
            this.selectedIDsInit = [];
            this.postEdit.categories.map(cat => {
                this.selectedIDsInit.push(cat.id);
            });
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
