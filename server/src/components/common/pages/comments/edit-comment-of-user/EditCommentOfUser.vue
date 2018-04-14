<script>
import Vue from "vue";
import { mapGetters } from "vuex";

export default {
    name: "EditCommentOfUser",

    props: ["closeEditComment", "onSaveComment"],

    data() {
        return {
            editCommentObj: Vue._.cloneDeep(
                this.$store.getters.getCommentOfUserToEditById
            )
        };
    },

    methods: {
        //Block author
        blockUserComment: function() {
            this.editCommentObj.isBlocked = !this.editCommentObj.isBlocked;
        },

        //Save comment
        saveComment: function() {
            this.$store.dispatch("saveCommentOfUser", this.editCommentObj);
            if (this.onSaveComment !== undefined)
                this.onSaveComment(this.editCommentObj);
            this.closeEditComment();
        }
    },

    computed: {
        ...mapGetters(["getCommentOfUserToEditById"])
    },

    watch: {
        //Get comment object to edit
        getCommentToEditById: function(val, oldVal) {
            this.editCommentObj = Vue._.cloneDeep(val);
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
