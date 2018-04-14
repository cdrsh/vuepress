<script>
import { mapGetters } from "vuex";

export default {
    name: "SelectContentLanguage",

    data() {
        return {
            //Content language
            contentLang: this.$store.getters.getContentLang
        };
    },

    watch: {
        //Language changed
        contentLang: function(val, oldVal) {
            this.$store.dispatch("setContentLang", { contentLang: val });
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
