<script>
import Vue from "vue";
import { mapGetters } from "vuex";

//Build breadcrumbs
let addCategoryToBreadcrumb = (pid, arr, list) => {
    if (pid == -1) return;
    for (let i = 0; i < list.length; i++)
        if (list[i].id == pid) {
            arr.push(list[i]);
            addCategoryToBreadcrumb(list[i].pid, arr, list);
        }
};

//Root category object
let objAllCategories = {
    ru: "Все категории",
    en: "All categories",
    de: "All categories-de",
    zh: "All categories-zh"
};

//Sort compare function
let compare = function(a, b) {
    if (parseInt(a.num) < parseInt(b.num)) return -1;
    if (parseInt(a.num) > parseInt(b.num)) return 1;
    return 0;
};

export default {
    name: "PostEditSelectCategory",

    props: ["onSelectCategory", "selectedIDsInit", "setAddPostSelCatVis"],

    data() {
        return {
            selectedCategoryID: -1,
            categories: Vue._.cloneDeep(this.$store.getters.getAllCategories),
            categoriesCount: this.$store.getters.getAllCategories.length,
            itemsPerPage: this.$store.getters.getPaginatorData.itemsPerPage,
            pgNum: 1,
            selectedIDs:
                this.selectedIDsInit !== undefined ? this.selectedIDsInit : []
        };
    },

    methods: {
        //Get breadcrumbs by category id
        getBreadcrumb: function(id) {
            let arr = [];
            addCategoryToBreadcrumb(id, arr, this.categories);
            let lngsArr = this.$store.getters.getLangsContentSelected;
            let allCategories = { id: -1, pid: -1 };
            for (let i = 0; i < lngsArr.length; i++)
                allCategories["name_" + lngsArr[i].code] =
                    objAllCategories[lngsArr[i].code];
            arr.push(allCategories);

            //Reverse array breadcrumbs
            return arr.reverse();
        },

        //Select category
        selectCategory: function() {
            let catSelectedArr = [];
            this.categories.map(itm => {
                let found = this.selectedIDs.filter(itmIn => itmIn == itm.id);
                if (found !== undefined && found.length > 0)
                    catSelectedArr.push(itm);
            });
            this.onSelectCategory(catSelectedArr);
        },

        //Enter category
        enterCategory: function(itm) {
            this.selectedCategoryID = itm.id;
        },

        //Category page changed
        onPaginatorChange: function(pgNum) {
            this.pgNum = pgNum;
        },

        //Get children categories by category id
        getCategoriesByID: function(id, pgNum) {
            this.pgNum = pgNum;
            let list = this.categories.filter(itm => itm.pid == id);
            list = list.sort(compare);
            list = list.slice(
                (pgNum - 1) * this.itemsPerPage,
                pgNum * this.itemsPerPage
            );
            list = list.map(itm => {
                itm.hasChildren =
                    this.categories.filter(itmCh => itmCh.pid == itm.id)
                        .length > 0;
                return itm;
            });
            return list;
        },

        //Get count children categories by category id
        getCategoriesCountByID: function(id, pgNum) {
            this.pgNum = pgNum;
            let list = this.categories.filter(itm => itm.pid == id);
            return list.length;
        },

        //Hide category selection dialog
        hideAddPostSelCatVis: function() {
            if (this.setAddPostSelCatVis != undefined)
                this.setAddPostSelCatVis();
        }
    },

    computed: {
        ...mapGetters(["getAllCategories", "getPaginatorData"])
    },

    mounted: function() {
        this.selectedIDs =
            this.selectedIDsInit !== undefined ? this.selectedIDsInit : [];
    },

    watch: {
        //Category list loaded
        getAllCategories: function(val, oldVal) {
            this.categories = Vue._.cloneDeep(val);
            this.categoriesCount = val.length;
        },

        //Pages count changed
        paginatorData: function(val, oldVal) {
            this.itemsPerPage = val.itemsPerPage;
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
