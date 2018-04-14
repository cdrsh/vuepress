<script>
import Vue from "vue";
import { mapGetters } from "vuex";

export default {
    name: "Breadcrumb",

    computed: {
        ...mapGetters([
            "getCategoriesBreadcrumb",
            "getContentLang",
            "getCategoriyActiveID",
            "getCategoriesItemsCount",
            "getCategoriesItemsPerPage"
        ])
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
