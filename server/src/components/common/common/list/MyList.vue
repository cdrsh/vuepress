<script>
require("./style.scss");

export default {
    name: "MyList",

    props: ["title", "list", "onSelectItem", "iconAlign", "activeClr"],

    data() {
        return {
            selectedId: -1
        };
    },

    methods: {
        //Item selected
        onSelectItemList: function(itm) {
            this.selectedId = itm.id;
            this.onSelectItem(itm);
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
