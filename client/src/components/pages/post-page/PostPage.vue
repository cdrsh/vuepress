<script>
require("./style.scss");
import { mapGetters } from "vuex";
let localStorage = require("store");

export default {
    name: "PostPage",

    data() {
        return {
            //One post object
            post: {
                user: {
                    id: -1,
                    nam: ""
                },
                title: "",
                txt: "",
                dt: Date()
            }
        };
    },

    methods: {
        //Get formatted username
        getUserName(usr) {
            if (usr != -1)
                return usr.nick !== ""
                    ? usr.nick
                    : usr.fname !== ""
                        ? usr.fname
                        : usr.lname !== ""
                            ? usr.lname
                            : usr.mname !== "" ? usr.mname : "";
            return " ";
        },

        //Go to post list
        closeOnePost: function() {
            if (this.$route.params.id == -1) this.$router.push("/");
            else this.$router.push("/category/" + this.$route.params.id);
        },

        //Get formatted date
        getDateFrm: function(dt) {
            let d = new Date(dt);
            let curr_date = d.getDate();
            let curr_month = d.getMonth() + 1;
            let curr_year = d.getFullYear();
            if (curr_date < 10) curr_date = "0" + curr_date;
            if (curr_month < 10) curr_month = "0" + curr_month;
            return curr_date + "." + curr_month + "." + curr_year;
        }
    },

    computed: {
        ...mapGetters(["getPostActive", "getContentLang", "getSettings"])
    },

    watch: {
        //Post changed - set title and txt
        getPostActive: function(val, oldVal) {
            this.post = val;
            this.post.title = this.post["title_" + this.getContentLang];
            this.post.txt = this.post["txt_" + this.getContentLang];
        }
    },

    template: require("!raw-loader!pug-html-loader!./template-tmpl.pug").toString()
};
</script>
