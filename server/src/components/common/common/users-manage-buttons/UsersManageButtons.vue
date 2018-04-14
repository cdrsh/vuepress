<script>
export default {
    name: "UsersManageButtons",

    props: ["addFn", "removeFn", "blockFn", "settingsFn", "findFn"],

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
