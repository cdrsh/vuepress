<script>
import Vue from "vue";

export default {
    name: "PostBreadcrumb",

    methods: {
        //Category selector
        selectCategory: function(itm) {
            this.$store.dispatch("selectPostCategory", {
                id: itm.id,
                r: this.$router
            });
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
