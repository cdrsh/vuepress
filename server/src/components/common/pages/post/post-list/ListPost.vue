<script>
import { mapGetters } from "vuex";

export default {
    name: "ListPost",

    computed: {
        ...mapGetters(["getContentLang", "getPostList"])
    },

    methods: {
        //Get category name
        getCatName: function(cat) {
            return cat["name_" + this.getContentLang] !== undefined
                ? cat["name_" + this.getContentLang]
                : "";
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
