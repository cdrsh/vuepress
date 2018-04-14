<script>
require("./style.scss");
export default {
    name: "SearchPanel",

    props: ["closeSearch"],

    data() {
        return {
            //Test to find post
            findText: ""
        };
    },

    watch: {
        //find text changed
        findText: function(vl, oldVal) {
            this.$emit("fText", vl);
        }
    },

    methods: {
        //Cancel search
        cancelSearch: function() {
            this.closeSearch(0);
            this.findText = "";
            this.$store.dispatch("loadPosts", {
                findText: this.findText,
                clearBefore: true,
                r: this.$router
            });
        },

        //Start search
        searchDo: function() {
            this.$store.dispatch("loadPosts", {
                findText: this.findText,
                clearBefore: true,
                r: this.$router
            });
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
