<script>
export default {
    name: "BtnsPanelCategory",

    props: ["onClickAdd", "onClickDelete", "onClickFilter", "onClickCategory"],

    methods: {
        onClickCategoryRun: function() {
            if (this.onClickCategory != undefined) this.onClickCategory();
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
