<script>
export default {
    name: "AutoNumerate",

    props: ["autoNumerateInit", "orderbyInit"],

    data() {
        return {
            autoNumerate:
                this.autoNumerateInit == undefined
                    ? false
                    : this.autoNumerateInit == "1" ? true : false,
            orderby: this.orderbyInit == undefined ? 1 : this.orderbyInit
        };
    },

    watch: {
        //autoNumerate on/off
        autoNumerate: function(val, oldVal) {
            this.$emit("autoNumerateChanged", {
                autoNumerate: val,
                orderby: this.orderby
            });
        },

        //order by changed
        orderby: function(val, oldVal) {
            this.$emit("autoNumerateChanged", {
                autoNumerate: this.autoNumerate,
                orderby: val
            });
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
