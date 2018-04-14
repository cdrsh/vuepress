<script>
import Vue from "vue";
import VueNotifications from "vue-notifications";
import { mapGetters } from "vuex";

export default {
    name: "PostSelectCategory",

    props: ["closeFn"],

    data() {
        return {
            selectedCategoryID: -2
        };
    },

    computed: {
        ...mapGetters([
            "getPostsCategoriesBreadcrumb",
            "getPostCategoriyActiveID",
            "getLangsContentSelected",
            "getCategoriesItemsCountForPost",
            "getCategoriesItemsPerPage",
            "getPostCategories",
            "getContentLang",
            ""
        ])
    },

    methods: {
        //Select category
        selectCategory: function() {
            if (this.selectedCategoryID != -2) {
                this.$store.dispatch("selectPostCategory", {
                    id: this.selectedCategoryID,
                    r: this.$router
                });
                this.closeFn();
            } else
                VueNotifications.error({
                    message: this.$t("Category_not_selected")
                });
        },

        //Enter category
        enterCategory: function(itm) {
            this.selectedCategoryID = itm.id == -1 ? -1 : -2;
            this.$store.dispatch("enterPostCategory", itm);
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
