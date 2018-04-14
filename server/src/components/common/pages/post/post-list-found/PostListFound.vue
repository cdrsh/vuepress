<script>
import { mapGetters } from "vuex";

export default {
    name: "PostListFound",

    computed: {
        ...mapGetters(["getContentLang", "getPostListFound"])
    },

    methods: {
        //Get category name
        getCatName: function(cat) {
            return cat["name_" + this.getContentLang] !== undefined
                ? cat["name_" + this.getContentLang]
                : "";
        },

        //Get user name
        getUser(itm) {
            return itm.user == -1 || itm.user === undefined
                ? "User removed"
                : itm.user.email;
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
