<script>
import { mapGetters } from "vuex";

export default {
    name: "ListFilteredCategories",

    data() {
        return {
            contentLang: this.$store.getters.getContentLang
        };
    },

    computed: {
        ...mapGetters(["getContentLang"])
    },

    watch: {
        //Content language
        getContentLang: function(val, oldVal) {
            this.contentLang = val;
            this.$emit("contentLangChanged", { contentLang: val });
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
