<script>
require("./style.scss");

import { mapGetters } from "vuex";
import Vue from "vue";

export default {
    name: "DashboardPage",

    methods: {
        onSelectItem: function(itm) {},

        onSelectPosts: function(itm) {}
    },

    mounted: function() {
        //Load settings if needed
        this.$store.dispatch("loadSettings", { r: this.$router });

        //Load graphs
        this.$store.dispatch("loadGraphs", { r: this.$router });
    },

    computed: {
        ...mapGetters([
            "getLoadGraphsIndicator",
            "getGraphPosts3",
            "getGraphPostsData",
            "getGraphCategories3",
            "getGraphCategoriesData",
            "getGraphComments3",
            "getGraphCommentsData",
            "getGraphUsers3",
            "getGraphUsersData"
        ]),

        //Calc posts graph data
        getGraphPostsDataCmp: function() {
            return {
                labels: [
                    this.$t("January"),
                    this.$t("February"),
                    this.$t("March"),
                    this.$t("April"),
                    this.$t("May"),
                    this.$t("June"),
                    this.$t("July"),
                    this.$t("August"),
                    this.$t("September"),
                    this.$t("October"),
                    this.$t("November"),
                    this.$t("December")
                ],
                datasets: [
                    {
                        label: this.$t("Publish_posts_by_months"),
                        data: this.getGraphPostsData
                    }
                ]
            };
        },

        //Calc categories graph data
        getGraphCategoriesDataCmp: function() {
            return {
                labels: [
                    this.$t("January"),
                    this.$t("February"),
                    this.$t("March"),
                    this.$t("April"),
                    this.$t("May"),
                    this.$t("June"),
                    this.$t("July"),
                    this.$t("August"),
                    this.$t("September"),
                    this.$t("October"),
                    this.$t("November"),
                    this.$t("December")
                ],
                datasets: [
                    {
                        label: this.$t("Publish_categories_by_months"),
                        data: this.getGraphCategoriesData
                    }
                ]
            };
        },

        //Calc comments graph data
        getGraphCommentsDataCmp: function() {
            return {
                labels: [
                    this.$t("January"),
                    this.$t("February"),
                    this.$t("March"),
                    this.$t("April"),
                    this.$t("May"),
                    this.$t("June"),
                    this.$t("July"),
                    this.$t("August"),
                    this.$t("September"),
                    this.$t("October"),
                    this.$t("November"),
                    this.$t("December")
                ],
                datasets: [
                    {
                        label: this.$t("Publish_comments_by_months"),
                        data: this.getGraphCommentsData
                    }
                ]
            };
        },

        //Calc users graph data
        getGraphUsersDataCmp: function() {
            return {
                labels: [
                    this.$t("January"),
                    this.$t("February"),
                    this.$t("March"),
                    this.$t("April"),
                    this.$t("May"),
                    this.$t("June"),
                    this.$t("July"),
                    this.$t("August"),
                    this.$t("September"),
                    this.$t("October"),
                    this.$t("November"),
                    this.$t("December")
                ],
                datasets: [
                    {
                        label: this.$t("Registration_users_by_months"),
                        data: this.getGraphUsersData
                    }
                ]
            };
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
