<script>
require("./style.scss");

import VueNotifications from "vue-notifications";
import Vue from "vue";

export default {
    name: "UserPage",
    data() {
        return {
            showUserAdd: false,

            //User edit object
            userEdit: {
                id: 0,
                token: "123",
                isAuth: false,
                firstName: "",
                middleName: "",
                lastName: "",
                email: "",
                nick: "",
                phone: "",
                acptd: "",
                icon: "",
                site: "",
                dt: "",
                privlgs: {
                    adminA: 0,
                    manageFiles: 0,
                    readCategories: 0,
                    writeCategories: 0,
                    readUsers: 0,
                    writeUsers: 0,
                    blockedUser: 0,
                    writePost: 0,
                    readPost: 0
                },
                showDetails: false,
                showEdit: false,
                checked: false
            },

            findTxt: "",
            findNum: -1,
            findDlg: false,
            itmChk: [],
            editUserDlg: false,
            addUserDlg: false,
            editPrivelegeDlg: false,
            editPrivNum: 0,
            idsPriv: [],
            arrPlaceholders: [
                "Email",
                "First name",
                "Middle name",
                "Last name",
                "Nick",
                "Phone",
                "Site"
            ]
        };
    },

    computed: {
        //Get placeholder name
        findbyPlaceholder: function() {
            if (this.findNum >= 0 && this.findNum < 7)
                return this.arrPlaceholders[this.findNum];
            return "";
        }
    },

    methods: {
        //Show edit one user priveleges dialog
        showEditPrivOneDlg: function(item) {
            this.editPrivNum = item.privlgs;
            this.idsPriv = [item.id];
            this.editPrivelegeDlg = true;
        },

        //Show edit general priveleges dialog
        showEditPrivDlg: function() {
            if (this.itmChk.length == 0)
                VueNotifications.error({
                    message: "Не выбран ни один пользователь"
                });
            else {
                this.editPrivNum = undefined;
                this.idsPriv = this.itmChk;
                this.editPrivelegeDlg = true;
            }
        },

        //Hide edit priveleges dialog
        hideEditPrivDlg: function() {
            this.editPrivelegeDlg = false;
            this.itmChk = [];
        },

        //Page changed - load users by page num
        onChangePage: function(pgNum) {
            this.$store.dispatch("loadUsers", {
                data: {
                    pgNum: pgNum,
                    findTxt: this.findTxt,
                    findNum: this.findNum,
                    itemsPerPage: this.$store.getters.getUsersPerPage
                },
                r: this.$router
            });
        },

        //Fnd users
        findUser: function() {
            this.$store.dispatch("loadUsers", {
                data: {
                    pgNum: this.$store.getters.getUsersPgNum,
                    findTxt: this.findTxt,
                    findNum: this.findNum,
                    itemsPerPage: this.$store.getters.getUsersPerPage
                },
                r: this.$router
            });
        },

        //Reset find users
        resetFind: function() {
            this.findTxt = "";
            this.findNum = -1;
            this.$store.dispatch("loadUsers", {
                data: {
                    pgNum: this.$store.getters.getUsersPgNum,
                    findTxt: this.findTxt,
                    findNum: this.findNum,
                    itemsPerPage: this.$store.getters.getUsersPerPage
                },
                r: this.$router
            });
        },

        //Close find dialog
        closeFind: function() {
            this.resetFind();
            this.findDlg = !this.findDlg;
        },

        //Show edit user dialog
        showEditUserDlg: function(itm) {
            this.userEdit = Vue._.cloneDeep(itm);
            this.editUserDlg = !this.editUserDlg;
        },

        //Hide edit user dialog
        hideEditUserDlg: function() {
            this.editUserDlg = false;
        },

        //Remove user
        removeUser: function(id) {
            this.$store.dispatch("removeUsers", {
                ids: [id],
                r: this.$router
            });
        },

        //Remove checked users
        removeCheckedUsers: function() {
            if (this.itmChk.length > 0) {
                this.$store.dispatch("removeUsers", {
                    ids: this.itmChk,
                    r: this.$router
                });
                this.itmChk = [];
            } else
                VueNotifications.error({
                    message: this.$t("Users_not_selected")
                });
        },

        //Block user
        blockUser: function(id) {
            this.$store.dispatch("blockUsers", {
                ids: [id],
                r: this.$router
            });
        },

        //Block checked users
        blockCheckedUsers: function() {
            if (this.itmChk.length == 0)
                VueNotifications.error({
                    message: this.$t("Users_not_selected")
                });
            else {
                this.$store.dispatch("blockUsers", {
                    ids: this.itmChk,
                    r: this.$router
                });
                this.itmChk = [];
            }
        },

        //Toggle find dialog
        showFindDlg: function() {
            this.findDlg = !this.findDlg;
        },

        //Toggle add user dialog
        showAddUserDlg: function() {
            this.addUserDlg = !this.addUserDlg;
        },

        //Hide add user dialog
        hideAddUserDlg: function() {
            this.addUserDlg = false;
        }
    },

    mounted: function() {
        //Reset user actions
        this.$store.dispatch("usersActionsReset");

        //Load settings if not loaded
        this.$store.dispatch("loadSettings", { r: this.$router });
    },

    beforeCreate: function() {
        //Load users
        this.$store.dispatch("loadUsers", {
            data: {
                pgNum: 1,
                findTxt: "",
                findNum: -1,
                itemsPerPage: this.$store.getters.getUsersPerPage
            },
            r: this.$router
        });
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
