<script>
import { mapGetters } from "vuex";
import * as conf from "../../../../../config/index";

export default {
    name: "EditPrivelege",

    props: ["editPrivNum", "ids", "closeFn"],

    data() {
        return {
            //Calc priveleges
            adminA:
                this.editPrivNum !== undefined
                    ? conf.isAdminAccess(this.editPrivNum)
                    : false,
            filesRW:
                this.editPrivNum !== undefined
                    ? conf.isFilesManagement(this.editPrivNum)
                    : false,
            categoryW:
                this.editPrivNum !== undefined
                    ? conf.isWriteCategories(this.editPrivNum)
                    : false,
            categoryR:
                this.editPrivNum !== undefined
                    ? conf.isReadCategories(this.editPrivNum)
                    : false,
            usersW:
                this.editPrivNum !== undefined
                    ? conf.isWriteUsers(this.editPrivNum)
                    : false,
            usersR:
                this.editPrivNum !== undefined
                    ? conf.isReadUsers(this.editPrivNum)
                    : false,
            postW:
                this.editPrivNum !== undefined
                    ? conf.isWritePost(this.editPrivNum)
                    : false,
            postR:
                this.editPrivNum !== undefined
                    ? conf.isReadPost(this.editPrivNum)
                    : false,
            blocked:
                this.editPrivNum !== undefined
                    ? conf.isBlocked(this.editPrivNum)
                    : false
        };
    },

    methods: {
        //Save privelege
        savePriv: function() {
            let res = 0;
            res = this.adminA ? conf.setAdminAccess(res, true) : res;
            res = this.filesRW ? conf.setFilesManagement(res, true) : res;
            res = this.categoryW ? conf.setWriteCategories(res, true) : res;
            res = this.categoryR ? conf.setReadCategories(res, true) : res;
            res = this.usersW ? conf.setWriteUsers(res, true) : res;
            res = this.usersR ? conf.setReadUsers(res, true) : res;
            res = this.postW ? conf.setWritePost(res, true) : res;
            res = this.postR ? conf.setReadPost(res, true) : res;
            res = this.blocked ? conf.setBlocked(res, true) : res;
            this.$store.dispatch("setUserPrivelege", {
                data: {
                    ids: this.ids,
                    priv: res
                },
                r: this.$router
            });
            this.closeFn();
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
