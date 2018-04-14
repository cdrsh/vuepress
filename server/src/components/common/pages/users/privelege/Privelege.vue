<script>
import { mapGetters } from "vuex";
import * as conf from "../../../../../config/index";

export default {
    name: "Privelege",

    props: ["privelege"],

    data() {
        return {
            conf: conf
        };
    },

    methods: {
        //getRWCategories state
        getRWCategories(privelege) {
            return !this.conf.isReadCategories(privelege) &&
                !this.conf.isWriteCategories(privelege)
                ? "NO"
                : "";
        },

        //getRWposts state
        getRWposts(privelege) {
            return !this.conf.isReadPost(privelege) &&
                !this.conf.isWritePost(privelege)
                ? "NO"
                : "";
        },

        //get users state
        getRWUsers(privelege) {
            return !this.conf.isReadUsers(privelege) &&
                !this.conf.isWriteUsers(privelege)
                ? "NO"
                : "";
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
