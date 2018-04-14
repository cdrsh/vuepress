<script>
require("./style.scss");

export default {
    name: "PaginatorCommonComponent",

    props: ["onChange", "itemsCount", "itemsPerPage"],

    data() {
        return {
            pages: [1, 2, 3],
            pageNum: 1,
            activePage: 1
        };
    },

    computed: {
        //Calculate pages count
        pgCount: function() {
            return Math.ceil(this.itemsCount / this.itemsPerPage);
        }
    },

    watch: {
        //Items count changed - recalc pgCount
        //Change page if needed
        itemsCount: function(val, oldVal) {
            let pgcnt = Math.ceil(this.itemsCount / this.itemsPerPage);
            if (pgcnt == 0) pgcnt = 1;
            if (pgcnt < this.activePage && this.activePage > 0)
                this.gotoLastPage();
            if (this.activePage == 0 && this.activePage > 0)
                this.gotoFirstPage();
        }
    },

    methods: {
        //Make offset page number
        makeOffsetPagesToActive: function(num) {
            if (this.pgCount < 3) return;
            if (
                num >= this.pages[0] &&
                num <= this.pages[2] &&
                this.pages[2] <= this.pgCount
            )
                return;
            let nnum = num;
            //offset-Left
            if (num < this.pages[0] && this.pages[0] > 1) {
                for (let i = 0; i < 3; i++) {
                    this.$set(this.pages, i, nnum);
                    nnum++;
                }
            } else {
                //offset-right
                //>3 pages
                for (let i = 2; i >= 0; i--) {
                    this.$set(this.pages, i, nnum);
                    nnum--;
                }
            }
        },

        //Page clicked
        gotoPage: function(num) {
            if (num <= this.pgCount) {
                for (let i = 0; i < this.pages.length; i++)
                    if (this.pages[i] == num) this.activePage = this.pages[i];
                this.onChange(num);
            }
        },

        //Rewind to first page
        gotoFirstPage: function() {
            this.activePage = 1;
            this.makeOffsetPagesToActive(this.activePage);
            this.onChange(this.activePage);
        },

        //Rewind to last page
        gotoLastPage: function() {
            this.activePage = this.pgCount;
            this.makeOffsetPagesToActive(this.activePage);
            this.onChange(this.activePage);
        },

        //Rewind to previous page
        gotoPrevPage: function() {
            if (this.activePage > 1) {
                this.activePage--;
                this.makeOffsetPagesToActive(this.activePage);
                this.onChange(this.activePage);
            }
        },

        //Rewind to next page
        gotoNextPage: function() {
            if (this.activePage <= this.pgCount - 1) {
                this.activePage++;
                this.makeOffsetPagesToActive(this.activePage);
                this.onChange(this.activePage);
            }
        },

        //Goto discrete page
        gotoPageNum: function() {
            if (this.pageNum <= this.pgCount && this.pageNum > 0) {
                this.activePage = this.pageNum;
                this.makeOffsetPagesToActive(this.activePage);
                this.onChange(this.activePage);
            }
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
