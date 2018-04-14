<script>
require("./style.scss");

export default {
    name: "CategoryPage",

    methods: {
        //Load post list on Server
        loadPosts: function() {
            this.$store.dispatch("loadPosts", {
                catId: this.$route.params.id || -1,
                r: this.$router
            });
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
