<script>
require("./style.scss");
import { mapGetters } from "vuex";

export default {
    name: "CategoryList",

    methods: {
        //Set category
        goToCategory: function(id) {
            this.$emit("toggleCat");
            this.$router.push("/category/" + id);
        }
    },

    computed: {
        ...mapGetters(["getContentLang"])
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
