<script>
require("./style.scss");

import { mapGetters } from "vuex";
import * as conf from "../../../config";
import { unionTypeAnnotation } from "babel-types";

export default {
    name: "PostClientPage",
    props: ["byCategories"],

    data() {
        return {
            //Text to find post
            findText: "",

            //Array of rss links of current category
            linkRss: []
        };
    },

    computed: {
        ...mapGetters([
            "getSettings",
            "getContentLang",
            "getCatObjActive",
            "getPostList",
            "getVisSearchPanel",
            "getCatId",
            "getFullLoaded",
            "getPostLoadingIndicator"
        ])
    },

    methods: {
        //Load posts with params
        loadPosts: function() {
            this.$store.dispatch("loadPosts", {
                catId:
                    this.$route.path.match(/\/category\//) !== null
                        ? this.$route.params.id
                        : -1,
                findText: this.$store.getters.getVisSearchPanel
                    ? this.findText
                    : "",
                r: this.$router
            });
        },

        //Show/hide posts search panel
        toggleSearch: function() {
            this.$store.dispatch("toggleSearchPanel", -1);
        },

        //Set text to find posts
        setFindText: function(pFindText) {
            this.findText = pFindText;
        },

        //Get username formatted
        getUserName: function(usr) {
            if (usr != -1)
                return usr.nick !== ""
                    ? usr.nick
                    : usr.fname !== ""
                        ? usr.fname
                        : usr.lname !== ""
                            ? usr.lname
                            : usr.mname !== "" ? usr.mname : "";
            return " ";
        },

        //Get User fields
        getUserFieldsLink: function(itm) {
            if (this.getCatObjActive.uflds != undefined) {
                //Get Link field
                let foundLink = this.getCatObjActive.uflds.filter(
                    itm => itm.namef == "link"
                );
                if (foundLink.length > 0) {
                    let linkid = foundLink[0].fldid;
                    let ufldids = itm.ufldids.split(":");
                    let ufldvls = itm.ufldvls.split(":!:");
                    for (let i = 0; i < ufldids.length; i++) {
                        if (ufldids[i] == linkid) {
                            return (
                                "<a href='" +
                                ufldvls[i] +
                                "'>" +
                                ufldvls[i] +
                                "</a>"
                            );
                        }
                    }
                }
            }
            return "";
        },

        //Check first post tag
        chkFirstPostTag: function() {
            let li = this.getPostList;
            if (
                li !== undefined &&
                this.getCatObjActive.uflds != undefined &&
                li.length !== 0
            ) {
                //Get tag field
                let foundTag = this.getCatObjActive.uflds.filter(
                    itm => itm.namef == "tag"
                );
                if (foundTag.length > 0) {
                    let tagid = foundTag[0].fldid;
                    let ufldids = li[0].ufldids.split(":");
                    let ufldvls = li[0].ufldvls.split(":!:");
                    for (let i = 0; i < ufldids.length; i++) {
                        if (ufldids[i] == tagid && ufldvls[i] == "doc") {
                            return "card";
                        }
                    }
                }
            }
            return "list";
        }
    },

    watch: {
        //Link rss selected in dropdown
        linkRss: function(val, oldVal) {
            window.location = conf.HOST + "/rss/content/" + val;
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
