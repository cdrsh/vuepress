<script>
import { mapGetters } from "vuex";

export default {
    name: "AddCategory",

    data() {
        return {
            //Category object
            catObj: {
                name: "",
                order: {
                    autoNumerate: true,
                    orderby: 1
                },
                keyWords: {
                    keyWordsSelfOn: false,
                    keyWords: ""
                },
                userFields: {
                    userFieldsOn: false,
                    userFields: []
                },
                names: this.$store.getters.getCategoriesObjToAdd
            }
        };
    },

    methods: {
        //Add category
        addCategory: function() {
            if (this.catObj.userFields.userFields == "") {
                this.catObj.userFields.userFieldsOn = false;
                this.catObj.userFields.userFields = "";
            }
            //Save last name with language prefix
            this.catObj.names[this.getContentLang].name = this.catObj.name;
            this.$store.dispatch("addCategory", {
                catObj: this.catObj,
                r: this.$router
            });
        },

        //Autonumerate changed on/off/array
        onAutoNumerateChanged: function(orderObj) {
            this.catObj.order = orderObj;
        },

        //Keywords changed on/off/array
        onSelfKeywordsChanged: function(keyWordsObj) {
            this.catObj.keyWords = keyWordsObj;
        },

        //User fields changed on/off/array
        onUserFieldsChanged: function(userFieldsObj) {
            this.catObj.userFields = userFieldsObj;
        },

        //Copy current category name to other names
        //with languages prefix
        onCopyToAllLangs: function() {
            for (let itm in this.catObj.names) {
                this.catObj.names[itm].name = this.catObj.name;
            }
        }
    },

    computed: {
        ...mapGetters([
            "getContentLang",
            "getAddIndicatorCategory",
            "getLangsContentSelected"
        ])
    },

    watch: {
        //Content language changed
        getContentLang: function(val, oldVal) {
            this.catObj.names[oldVal].name = this.catObj.name;
            this.catObj.name = this.catObj.names[val].name;
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
