<script>
import Vue from "vue";
import { mapGetters } from "vuex";

export default {
    name: "EditCategory",

    data() {
        return {
            //Category object
            editCatObj: Vue._.cloneDeep(this.$store.getters.getEditCatObj),

            nameTmp: this.$store.getters.getEditCatObj[
                "name_" + this.$store.getters.getContentLang
            ]
        };
    },

    methods: {
        //Save edited category
        saveEditCategory: function() {
            if (this.editCatObj.uflds.trim() == "")
                this.editCatObj.user_fields_on = false;
            this.editCatObj["name_" + this.getContentLang] = this.nameTmp;
            this.$store.dispatch("saveEditCategory", {
                editCatObj: this.editCatObj,
                r: this.$router
            });
        },

        //Autonumerate changed
        onAutoNumerateChanged: function(orderObj) {
            this.editCatObj.auto_numerate = orderObj.autoNumerate;
            this.editCatObj.orderby = orderObj.orderby;
        },

        //Keywords changed
        onSelfKeywordsChanged: function(keyWordsObj) {
            this.editCatObj.kwrds = keyWordsObj.keyWords;
            this.editCatObj.kwrdson = keyWordsObj.keyWordsSelfOn;
        },

        //User fields changed
        onUserFieldsChanged: function(userFieldsObj) {
            this.editCatObj.user_fields_on = userFieldsObj.userFieldsOn;
            this.editCatObj.uflds = userFieldsObj.userFields.join(",");
        },

        //Copy current name to other languages
        onCopyToAllLangs: function() {
            for (let itm in this.editCatObj)
                if (itm.substr(0, 4) == "name")
                    this.editCatObj[itm] = this.nameTmp;
        }
    },

    computed: {
        ...mapGetters(["getContentLang"])
    },

    watch: {
        //Language changed
        getContentLang: function(val, oldVal) {
            this.editCatObj["name_" + oldVal] = this.nameTmp;
            this.nameTmp = this.editCatObj["name_" + val];
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
