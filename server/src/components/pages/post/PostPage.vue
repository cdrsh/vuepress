<script>
require("./style.scss");

export default {
    name: "PostPage",

    data() {
        return {
            filterOn: false,
            showSelectCategoryDlg: false
        };
    },

    methods: {
        //Category clicked
        onClickCategory: function() {
            this.showSelectCategoryDlg = !this.showSelectCategoryDlg;
        },

        //Category show/hide dialog
        openCategories: function() {
            this.showSelectCategoryDlg = !this.showSelectCategoryDlg;
        },

        //Close categories
        closeCategories: function() {
            this.showSelectCategoryDlg = false;
        },

        //Toggle find dialog
        openfindOnDlg: function() {
            this.filterOn = !this.filterOn;
        },

        //Close find dialog
        closefindOnDlg: function() {
            this.filterOn = false;
        }
    },

    beforeCreate: function() {
        Promise.all([
            //Reset post actions
            this.$store.dispatch("resetPostIndicators")
        ]).then(() => {
            //Load settings if not loaded
            this.$store.dispatch("loadSettings", { r: this.$router });

            //Categories load if not loaded
            this.$store.dispatch("loadAllCategoriesIfNotLoaded", {
                r: this.$router
            });

            //Post paginator load
            this.$store.dispatch("loadPaginatorData", { r: this.$router });

            //Load posts
            this.$store.dispatch("loadPosts", {
                pgNum: 1,
                r: this.$router
            });
        });
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
