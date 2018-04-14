<script>
require("./style.scss");
import Vue from "vue";
import { mapGetters } from "vuex";
import VueNotifications from "vue-notifications";

export default {
    name: "AddFileDialog",

    props: [
        "closeFn",
        "onSelectImagesInternet",
        "onSelectImagesFromStore",
        "onSelectImagesFromDisk"
    ],

    data() {
        return {
            uploadImageAdd: null,

            //File object from internet
            internetFile: {
                lnk: "",
                title: "",
                szw: "100",
                szh: "100"
            },

            //File object from local store
            localFile: {
                title: "",
                szw: "100",
                szh: "100",
                fileObj: null
            },
            fileList: [],
            filesChecked: [],
            tabs: 1
        };
    },

    methods: {
        //Delete images
        onDeleteImage: function(filesChecked) {
            this.$store.dispatch("removeImages", {
                filesChecked: filesChecked,
                r: this.$router
            });
        },

        //File selected
        onFileSelect: function(fileObj) {
            if (fileObj.length > 0) {
                this.localFile.fileObj = fileObj[0];
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

        //Close image add dialog
        closeImageAddDlg: function() {
            this.closeFn();
        },

        //Select images
        selectImages: function() {
            //Add from disk with adding to stor
            if (this.tabs == "1") {
                if (this.localFile.fileObj == null)
                    VueNotifications.error({
                        message: this.$t("File_does_not_selected")
                    });
                else {
                    this.localFile[
                        "title_" + this.getContentLang
                    ] = this.localFile.title;
                    this.onSelectImagesFromDisk(this.localFile);
                }
            }

            //Add from internet
            if (this.tabs == "2")
                this.onSelectImagesInternet(this.internetFile);

            //Add from store
            if (this.tabs == "3") this.onSelectImagesFromStore(this.fileList);
        },

        //Tab selected
        setTab: function(tabNum) {
            this.tabs = tabNum;
        },

        //Files selected in store
        onSelectImagesInStore: function(fileListSelected) {
            this.fileList = fileListSelected;
        }
    },

    computed: {
        ...mapGetters(["getContentLang", "getLangsContentSelected"])
    },

    mounted: function() {
        //init local file object
        let arr = this.getLangsContentSelected;
        for (let i = 0; i < arr.length; i++) {
            this.localFile["title_" + arr[i].code] = "";
        }

        //Load files list if not loaded
        this.$store.dispatch("loadFilesList", { r: this.$router });
    },

    watch: {
        //Language changed - change title_lng
        getContentLang: function(val, oldVal) {
            this.localFile["title_" + oldVal] = this.localFile.title;
            this.localFile.title = this.localFile["title_" + val];
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
