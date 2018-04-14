import * as consts from "./constants";
import Vue from "vue";
import VueNotifications from "vue-notifications";
import * as conf from "../../../config";
var localStorage = require("store");

export default {
    //Load graphs data
    loadGraphs({ commit }, obj) {
        let ro = {
            url: conf.LOAD_GRAPHS,
            method: "get",
            params: {},
            env: {},
            r: obj.r,
            headers: {
                headers: { Authorization: "Bearer " + localStorage.get("at") }
            },
            commit: function() {},

            init: function(commit, obj, env) {
                this.params = obj;
                this.commit = commit;
                this.env = env;

                //Set graphs load rss indicator
                this.commit(consts.LOAD_GRAPHS_INDICATOR, true);
            },

            onSuccess: function(response) {
                switch (response.data.status) {
                    case 0:
                        //Server error technical
                        throw response.data.err;
                        break;

                    case 1:
                        //Reset graphs load rss indicator
                        this.commit(consts.LOAD_GRAPHS_INDICATOR, false);

                        //rss load success
                        this.commit(consts.LOAD_GRAPHS_SUCCESS, response.data);
                        break;

                    default:
                        throw "Error";
                }
            },

            onError: function(err) {
                let er = conf.getErrorType(err);

                switch (er.typ) {
                    //No server connection
                    case 1:
                        VueNotifications.error({
                            message: this.env.getters.tr(
                                "Server_is_not_connected"
                            )
                        });
                        //Reset graphs load rss indicator
                        this.commit(consts.LOAD_GRAPHS_INDICATOR, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_load_graphs") +
                                ": " +
                                er.message
                        });
                        //Reset graphs load rss indicator
                        this.commit(consts.LOAD_GRAPHS_INDICATOR, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_load_graphs")
                        });
                        //Reset graphs load rss indicator
                        this.commit(consts.LOAD_GRAPHS_INDICATOR, false);
                        break;
                }
            }
        };

        ro.init(commit, {}, this);
        Vue.http
            .get(ro.url, ro.headers)
            .then(
                response => {
                    ro.onSuccess(response);
                },
                err => {
                    throw err;
                }
            )
            .catch(error => {
                ro.onError(error);
            });
    }
};
