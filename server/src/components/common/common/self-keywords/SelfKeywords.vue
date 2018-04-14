<script>
export default {
    name: "SelfKeywords",

    props: ["keyWordsInit", "keyWordsSelfOnInit"],

    data() {
        return {
            //Keywords on
            keyWordsSelfOn:
                this.keyWordsSelfOnInit == undefined
                    ? false
                    : this.keyWordsSelfOnInit,

            //Keywords array
            keyWords:
                this.keyWordsInit == undefined || this.keyWordsInit == ""
                    ? []
                    : this.keyWordsInit,

            keyWord: ""
        };
    },

    methods: {
        //Add keyword
        addItem: function() {
            if (this.keyWord != "") {
                this.$set(this.keyWords, this.keyWords.length, this.keyWord);
                this.keyWord = "";
            }
        }
    },

    watch: {
        //Keyword on/off
        keyWordsSelfOn: function(val, oldVal) {
            this.$emit("selfKeywordsChanged", {
                keyWordsSelfOn: val,
                keyWords: this.keyWords
            });
        },

        //Keywords changed
        keyWords: function(val, oldVal) {
            this.$emit("selfKeywordsChanged", {
                keyWordsSelfOn: this.keyWordsSelfOn,
                keyWords: val
            });
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
