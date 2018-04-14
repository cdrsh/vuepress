<script>
import { mapGetters } from "vuex";
require("./style.scss");
export default {
    name: "PostComment",
    props: ["itm", "answerShowDlg", "isRegged"],
    data() {
        return {
            commentsCount: 10
        };
    },

    methods: {
        getDateFrm: function(dt) {
            let d = new Date(dt);
            let curr_date = d.getDate();
            let curr_month = d.getMonth() + 1;
            let curr_year = d.getFullYear();
            if (curr_date < 10) curr_date = "0" + curr_date;
            if (curr_month < 10) curr_month = "0" + curr_month;
            return curr_date + "." + curr_month + "." + curr_year;
        },

        getUserName: function(itm) {
            if (itm == undefined || itm.usrid == undefined || itm.usrid == -1)
                return this.$t("User_deleted") + " ";
            else if (itm.usrid != -1)
                return itm.nick !== ""
                    ? itm.nick
                    : itm.fname !== ""
                        ? itm.fname
                        : itm.lname !== ""
                            ? itm.lname
                            : itm.mname !== "" ? itm.mname : "N";
            return " 123";
        },

        onChangeCommentsPage: function(pgNum) {
            console.log(pgNum);
        },

        avatarName: function(usr) {
            return this.getUserName(usr).substr(0, 1);
        },

        openDialog: function() {
            this.answerShowDlg(this.itm);
        }
    },
    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
