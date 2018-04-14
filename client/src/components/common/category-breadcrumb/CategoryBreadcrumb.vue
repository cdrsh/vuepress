<script>
import { mapGetters } from "vuex";
require("./style.scss");

export default {
    name: "CategoryBreadcrumb",

    computed: {
        ...mapGetters(["getContentLang", "getCategoriesBreadcrumb"])
    },

    methods: {
        //Set category
        goToCategory: function(id) {
            if (id != -1) this.$router.push("/category/" + id);
            else this.$router.push("/");
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
