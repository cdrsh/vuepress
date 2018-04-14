<script>
import Vue from "vue";
import { mapGetters } from "vuex";

export default {
    name: "EditRSS",

    props: ["closeFn", "edObj"],

    data() {
        return {
            editObj: Vue._.cloneDeep(this.edObj),
            categorySelDlg: false,
            selectedCatNames: ""
        };
    },

    mounted: function() {
        this.editObj = Vue._.cloneDeep(this.edObj);
    },

    methods: {
        //Save RSS
        saveRSS: function() {
            this.editObj.language = this.$store.getters.getContentLang;
            this.$store.dispatch("saveRSS", {
                editObj: this.editObj,
                r: this.$router
            });
            this.closeFn();
        },

        //Category selector dialog show/hide
        selCategory: function() {
            this.categorySelDlg = !this.categorySelDlg;
        },

        //Category selector dialog hide
        closeSelCategory: function() {
            this.categorySelDlg = false;
        },

        //Categories selected
        onSelectCategory: function(cats) {
            this.editObj.category = [];
            cats.map(itm => {
                this.editObj.category.push(itm.id);
            });
            this.categorySelDlg = !this.categorySelDlg;
        }
    },

    computed: {
        //Get categories names
        getCategories: function() {
            this.selectedCatNames = "";
            this.editObj.category.map(itm => {
                let itmsFound = this.$store.getters.getCategoryById(itm);
                let lng = this.$store.getters.getContentLang;
                if (itmsFound.length > 0)
                    this.selectedCatNames += itmsFound[0]["name_" + lng] + ",";
            });
            if (this.selectedCatNames.length > 0)
                this.selectedCatNames = this.selectedCatNames.substr(
                    0,
                    this.selectedCatNames.length - 1
                );
            return this.selectedCatNames;
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
