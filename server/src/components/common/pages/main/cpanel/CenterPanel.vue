<script>
require("./style.scss");

export default {
    name: "CenterPanel",

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
