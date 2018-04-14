<script>
import Vue from "vue";
import { mapGetters } from "vuex";

export default {
    name: "AddRSS",

    props: ["closeFn"],

    data() {
        return {
            addObj: {
                title: "",
                description: "",
                link: "",
                category: "",
                language: ""
            },

            categorySelDlg: false,
            selectedIDsCat: [],
            selectedCatNames: ""
        };
    },

    methods: {
        //Add RSS
        addRSS: function() {
            this.addObj.language = this.$store.getters.getContentLang;
            this.$store.dispatch("addRSS", {
                addObj: this.addObj,
                r: this.$router
            });
            this.closeFn();
        },

        //Category select dialog
        selCategory: function() {
            this.categorySelDlg = !this.categorySelDlg;
        },

        //Close selection category dialog
        closeSelCategory: function() {
            this.categorySelDlg = false;
        },

        //Category selected
        onSelectCategory: function(cats) {
            this.selectedIDsCat = [];
            cats.map(itm => {
                this.selectedIDsCat.push(itm.id);
            });
            this.addObj.category = this.selectedIDsCat.join(";");
            this.categorySelDlg = !this.categorySelDlg;
        }
    },

    computed: {
        //Categories name calculated
        getCategories: function() {
            this.selectedCatNames = "";
            this.selectedIDsCat.map(itm => {
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
