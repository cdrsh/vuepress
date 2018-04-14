<script>
require("./style.scss");

import VueNotifications from "vue-notifications";
import Vue from "vue";
import { mapGetters } from "vuex";

export default {
    name: "CategoryPage",

    computed: {
        ...mapGetters([
            "getVisEditCategory",
            "getVisAddCategory",
            "getCategoriesStateLoading",
            "getOneCategoryRemoving",
            "getCategoryMoving",
            "getCategoryFilterMode",
            "getFilteredCategoriesItemsCount",
            "getCategoriesItemsPerPage"
        ])
    },

    mounted: function() {
        //Reset actions indicators
        this.$store.dispatch("categoryActionsReset");

        //Load settings if needed
        this.$store.dispatch("loadSettings", { r: this.$router });
    },

    beforeCreate: function() {
        //Get all categories
        this.$store.dispatch("loadAllCategories", { r: this.$router });
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
