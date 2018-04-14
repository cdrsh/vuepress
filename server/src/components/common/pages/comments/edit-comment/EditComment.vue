<script>
import Vue from "vue";
import { mapGetters } from "vuex";

export default {
    name: "EditComment",

    props: ["closeEditDlg"],

    data() {
        return {
            editCommentObj: Vue._.cloneDeep(
                this.$store.getters.getCommentToEditById
            )
        };
    },

    methods: {
        //Block comment
        blockUserComment: function() {
            this.editCommentObj.isBlocked = !this.editCommentObj.isBlocked;
            this.$store.dispatch("blockUsersCheckedComment", [
                this.editCommentObj.id
            ]);
        },

        //Save comment
        saveComment: function() {
            this.$store.dispatch("saveComment", {
                comment: this.editCommentObj,
                r: this.$router
            });
            this.closeEditDlg();
        }
    },

    computed: {
        ...mapGetters(["getCommentToEditById"])
    },

    watch: {
        //Get comment edit object
        getCommentToEditById: function(val, oldVal) {
            this.editCommentObj = Vue._.cloneDeep(val);
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
