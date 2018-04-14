<script>
require("./style.scss");

import { mapGetters } from "vuex";

export default {
    name: "CommentPage",

    data() {
        return {
            commentsFilter: "",
            commentFilters: [
                {
                    val: "all-comments",
                    txt: "All_comments",
                    icon: "question_answer"
                },
                { val: "by-users", txt: "By_users", icon: "account_box" },
                { val: "by-posts", txt: "By_posts", icon: "description" },
                {
                    val: "by-categories",
                    txt: "By_Categories",
                    icon: "view_module"
                }
            ],

            //active index
            commentFiltersActive: "all-comments",
            viewType: "treeView",
            viewTypeBtn: "list",
            levelPadAllComments: 20,
            filterBy: "v1",
            itemPerPage: 10,
            editCommentDlg: false
        };
    },

    computed: {
        ...mapGetters([
            "getAllCommentsLoading",
            "getAllCommentsUsersBlockIndicator",
            "getAllCommentsRemoveIndicator",
            "getAllCommentsSavingIndicator",
            "getAllCommentsFindIndicator",
            "getAllCommentsSavingIndicator",
            "getByUsersLoadIndicator",
            "getByUsersBlockIndicator",
            "getByUsersRemoveIndicator",
            "getByUsersOneCommentRemoveIndicator",
            "getByUsersLoadOfOneUserIndicator",
            "getByUsersLoadOfOneUserIndicator",
            "getByPostsLoading",
            "getByPostsBlocking",
            "getByPostsRemoving",
            "getByCategoriesOneLoading",
            "getByOnePostCommentsBlocking",
            "getByCategoriesOneBlocking",
            "getByCategoriesRemoving",
            "getByOnePostCommentsRemoving",
            "getByCategoriesOneSaving",
            "getByCategoriesLoading",
            "getByCategoriesOneSaving"
        ])
    },

    methods: {
        //Type view button
        setViewTypeAllComments: function(typ) {
            this.viewTypeBtn = typ;
        },

        //Show edit comment dialog
        showEditComment: function(id, type) {
            this.commentFiltersActive = "all-comments";
            //unfiltered
            if (type == 0) this.$store.dispatch("prepareEditComment", id);
            //filtered
            if (type == 1)
                this.$store.dispatch("prepareEditCommentFiltered", id);
            this.editCommentDlg = !this.editCommentDlg;
        },

        //Set filters active
        setCommentFiltersActive: function(vl) {
            this.commentFiltersActive = vl;
        }
    },

    watch: {
        //Filter by
        filterBy: function(val, oldVal) {
            this.commentFiltersActive = val;
        }
    },

    mounted: function() {
        //Reset comments actions
        this.$store.dispatch("commentsActionsReset");

        //Load settings if not loaded
        this.$store.dispatch("loadSettings", { r: this.$router });
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
