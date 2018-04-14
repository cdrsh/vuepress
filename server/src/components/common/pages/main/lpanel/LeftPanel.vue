<script>
require("./style.scss");

export default {
    name: "LeftPanel",

    data() {
        return {
            bShowLPanel: true
        };
    },

    methods: {
        //Show hide left panel
        showHide: function() {
            this.bShowLPanel = !this.bShowLPanel;
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
