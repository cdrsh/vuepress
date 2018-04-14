<script>
require("./style.scss");

export default {
    name: "FindDialogComponent",

    props: [
        "onFindCategory",
        "onResetFindCategory",
        "placeholderInit",
        "closeFind"
    ],

    data() {
        return {
            //Category name
            findCategoryName: "",

            //Placeholder
            placeholder:
                this.placeholderInit == undefined ? "" : this.placeholderInit
        };
    },

    methods: {
        //Find category by name
        findCategory: function() {
            this.onFindCategory(this.findCategoryName);
        },

        //Reset find
        resetFindCategory: function() {
            this.findCategoryName = "";
            this.onResetFindCategory();
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
