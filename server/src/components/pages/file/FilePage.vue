<script>
require("./style.scss");

import Vue from "vue";
import { mapGetters } from "vuex";
import VueNotifications from "vue-notifications";

export default {
    name: "FilePage",

    data() {
        return {
            dlgAddImg: false,
            uploadImageAdd: null,
            localFile: {
                title: "",
                szw: "100",
                szh: "100",
                fileObj: null
            },
            checkedFileList: []
        };
    },

    methods: {
        //Delete image
        onDeleteImage: function(filesChecked) {
            this.$store.dispatch("removeImages", {
                filesChecked: filesChecked,
                r: this.$router
            });
        },

        onSelectImagesInStore: function(checkedFileList) {},

        //Reset image object on reinit
        resetLocalFile: function() {
            let arr = this.getLangsContentSelected;
            for (let i = 0; i < arr.length; i++)
                this.localFile["title_" + arr[i].code] = "";
        },

        //Image was added
        onAddImage: function() {
            this.dlgAddImg = !this.dlgAddImg;
            if (!this.dlgAddImg) {
                this.localFile = {
                    title: "",
                    szw: "100",
                    szh: "100",
                    fileObj: null
                };
                this.resetLocalFile();
                this.uploadImageAdd = null;
            }
        },

        //File selected to upload
        onFileSelect: function(fileObj) {
            if (fileObj.length > 0) {
                this.localFile.fileObj = fileObj[0];
                this.localFile[
                    "title_" + this.getContentLang
                ] = this.localFile.title;
                if (this.localFile.title == "") {
                    this.localFile.title = this.localFile.fileObj.name;
                    let arr = this.getLangsContentSelected;
                    for (let i = 0; i < arr.length; i++)
                        if (this.localFile["title_" + arr[i].code] == "")
                            this.localFile[
                                "title_" + arr[i].code
                            ] = this.localFile.fileObj.name;
                }
            }
        },

        //Add image to server
        addImage: function() {
            if (this.localFile.fileObj == null)
                VueNotifications.error({ message: "Файл не выбран" });
            else {
                this.localFile[
                    "title_" + this.getContentLang
                ] = this.localFile.title;
                this.$store.dispatch("uploadImage", {
                    file: this.localFile,
                    closeFn: this.onAddImage,
                    editor: null,
                    r: this.$router
                });
                //Сбросить попозже
                setTimeout(() => {
                    this.resetLocalFile();
                }, 1000);
            }
        }
    },

    computed: {
        ...mapGetters(["getContentLang", "getLangsContentSelected"])
    },

    mounted: function() {
        //Load settings if not loaded
        this.$store.dispatch("loadSettings", { r: this.$router });

        //Load files list if not loaded
        this.$store.dispatch("loadFilesList", { r: this.$router });

        let arr = this.getLangsContentSelected;
        for (let i = 0; i < arr.length; i++)
            this.localFile["title_" + arr[i].code] = "";
    },

    created: function() {
        //Init file object
        this.resetLocalFile();
    },

    watch: {
        //Language changed - set file title
        getContentLang: function(val, oldVal) {
            this.localFile["title_" + oldVal] = this.localFile.title;
            this.localFile.title = this.localFile["title_" + val];
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
