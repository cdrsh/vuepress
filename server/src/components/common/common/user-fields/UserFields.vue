<script>
export default {
    name: "UserFields",

    props: ["userFieldsInit", "userFieldsSelfOnInit"],

    data() {
        return {
            userFld: "",

            //User field on/off
            userFieldsOn:
                this.userFieldsSelfOnInit == undefined
                    ? false
                    : this.userFieldsSelfOnInit,

            //User fields array
            userFields: []
        };
    },

    methods: {
        //Add user field
        addItem: function() {
            if (this.userFld != "") {
                this.$set(
                    this.userFields,
                    this.userFields.length,
                    this.userFld
                );
                this.userFld = "";
            }
        }
    },

    mounted: function() {
        //Init user fields
        if (this.userFieldsInit !== undefined) {
            this.userFields = [];
            for (let i = 0; i < this.userFieldsInit.length; i++)
                this.userFields.push(this.userFieldsInit[i].namef);
        }
    },

    watch: {
        //User fields on/off
        userFieldsOn: function(val, oldVal) {
            this.$emit("userFieldsChanged", {
                userFieldsOn: val,
                userFields: this.userFields
            });
        },

        //User fields array changed
        userFields: function(val, oldVal) {
            this.$emit("userFieldsChanged", {
                userFieldsOn: this.userFieldsOn,
                userFields: val
            });
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
