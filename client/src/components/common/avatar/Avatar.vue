<script>
require("./style.scss");
export default {
    name: "LeftPanel",
    props: ["txt", "size"],

    data() {
        return {
            colors: [
                "#d04a1d",
                "#d07218",
                "#d09a0f",
                "#cfc200",
                "#b5d000",
                "#8cd000",
                "#66d004",
                "#3bd008",
                "#12d021",
                "#12d052",
                "#11d07d",
                "#10cfa6",
                "#19aad0",
                "#1f81d1",
                "#2358d1",
                "#252cd2",
                "#3f18d2",
                "#6717d2",
                "#8c16d1",
                "#b415d1",
                "#d016c5",
                "#d01d9d",
                "#d02174",
                "#d1234b",
                "#d1251f",
                "#d04a1d"
            ],
            colorA: "#d04a1d"
        };
    },

    watch: {
        //Set avatar text color by char index
        txt: function(val, oldVal) {
            let index = val.charCodeAt(0) % 26;
            index = index > 26 ? 26 : index;
            this.colorA = this.colors[index];
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
