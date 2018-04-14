<script>
import Vue from "vue";
import { mapGetters } from "vuex";

export default {
    name: "EditCommentOfCategoryOne",

    props: ["closeEditComment", "commentObj"],

    data() {
        return {
            editCommentObj: Vue._.cloneDeep(this.commentObj)
        };
    },

    methods: {
        //Block author
        blockUserComment: function() {
            this.editCommentObj.isBlocked = !this.editCommentObj.isBlocked;
            this.$store.dispatch("blockUserCategoryOne", [
                this.editCommentObj.id
            ]);
        },

        //Save comment
        saveComment: function() {
            this.$store.dispatch("saveCommentCategoryOne", {
                comment: this.editCommentObj,
                r: this.$router
            });
            this.closeEditComment();
        }
    },

    watch: {
        //Get comment object to edit
        getCommentToEditById: function(val, oldVal) {
            editCommentObj: Vue._.cloneDeep(val);
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
