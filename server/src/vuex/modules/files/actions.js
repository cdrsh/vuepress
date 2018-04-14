import * as consts from "./constants";
import Vue from "vue";
import VueNotifications from "vue-notifications";
import * as conf from "../../../config";
var localStorage = require("store");

export default {
    //Load all files list
    loadFilesList({ commit, state }, obj) {
        let ro = {
            url: conf.FILES_GETALL,
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

                //Set files load indicator
                this.commit(consts.FILES_INDICATOR_LOADING, true);
                return true;
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Files load success
                if (response.data.status == 1) {
                    //Files list save in store
                    this.commit(consts.FILES_LOAD_SUCCESS, response.data.files);

                    //Reset files load indicator
                    this.commit(consts.FILES_INDICATOR_LOADING, false);
                } else throw "Error";
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
                        //Reset files load indicator
                        this.commit(consts.FILES_INDICATOR_LOADING, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_load_files") +
                                ": " +
                                er.message
                        });
                        //Reset files load indicator
                        this.commit(consts.FILES_INDICATOR_LOADING, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_load_files")
                        });
                        //Reset files load indicator
                        this.commit(consts.FILES_INDICATOR_LOADING, false);
                        break;
                }
            }
        };

        if (state.filesLoaded) return;

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
    },

    //Upload image
    uploadImage({ commit, state }, obj) {
        let ro = {
            url: conf.FILES_ADD,
            method: "post",
            params: {},
            paramsObj: {},
            env: {},
            r: obj.r,
            headers: {
                headers: { Authorization: "Bearer " + localStorage.get("at") }
            },
            commit: function() {},

            init: function(commit, obj, env) {
                this.commit = commit;
                this.env = env;

                //Set file save indicator
                this.commit(consts.FILE_INDICATOR_UPLOADING, true);

                let formData = new FormData();
                let arrLngs = this.env.getters.getLangsContentSelected;
                arrLngs.map(itm => {
                    formData.append(
                        "title_" + itm.code,
                        obj.file["title_" + itm.code]
                    );
                });
                this.paramsObj = { obj: obj, arrLngs: arrLngs };
                formData.append("szw", obj.file.szw);
                formData.append("szh", obj.file.szh);
                if (obj.file.fileObj != 0)
                    formData.append(
                        "fil",
                        obj.file.fileObj,
                        obj.file.fileObj.name
                    );
                this.params = formData;
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Files list loaded success
                if (response.data.status == 1) {
                    //Save files in store
                    this.commit(consts.FILE_UPLOAD_SUCCESS, {
                        srvFile: response.data.file,
                        clientFile: this.params,
                        lngs: this.paramsObj.arrLngs
                    });

                    if (this.paramsObj.obj.editor != null) {
                        let img =
                            "<img src='" +
                            conf.API_HOST +
                            "/uploads/" +
                            response.data.file.pth +
                            "/" +
                            response.data.file.fnam +
                            "' title='" +
                            this.paramsObj.obj.file[
                                "title_" + this.env.getters.getContentLang
                            ] +
                            "' " +
                            "style='" +
                            (this.paramsObj.obj.file.szw != ""
                                ? " width:" +
                                  this.paramsObj.obj.file.szw +
                                  "px !important; "
                                : "") +
                            " " +
                            (this.paramsObj.obj.file.szh != ""
                                ? " height:" +
                                  this.paramsObj.obj.file.szh +
                                  "px !important; "
                                : "") +
                            "'>";
                        this.paramsObj.obj.editor.setContent(
                            this.paramsObj.obj.editor.getContent() + img
                        );
                    }

                    VueNotifications.success({
                        message: this.env.getters.tr("File_load_success")
                    });

                    //Reset load files indicator
                    this.commit(consts.FILE_INDICATOR_UPLOADING, false);

                    this.paramsObj.obj.closeFn();
                } else throw "Error";
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
                        //Reset load files indicator
                        this.commit(consts.FILE_INDICATOR_UPLOADING, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_load_file") +
                                ": " +
                                er.message
                        });
                        //Reset load files indicator
                        this.commit(consts.FILE_INDICATOR_UPLOADING, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_load_file")
                        });
                        //Reset load files indicator
                        this.commit(consts.FILE_INDICATOR_UPLOADING, false);
                        break;
                }
            }
        };

        ro.init(commit, obj, this);
        Vue.http
            .post(ro.url, ro.params, ro.headers)
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
    },

    //Remove images
    removeImages({ commit }, obj) {
        let ro = {
            url: conf.FILES_DELETESELECTED,
            method: "post",
            params: {},
            paramsObj: {},
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

                //Set remove file indicator
                this.commit(consts.FILE_INDICATOR_REMOVING, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //File removed success
                if (response.data.status == 1) {
                    //Save files in storage
                    this.commit(consts.FILES_REMOVE_SUCCESS, this.params.ids);

                    VueNotifications.success({
                        message: this.env.getters.tr("Files_remove_success")
                    });

                    //Reset remove file indicator
                    this.commit(consts.FILE_INDICATOR_REMOVING, false);
                } else throw "Error";
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
                        //Reset remove file indicator
                        this.commit(consts.FILE_INDICATOR_REMOVING, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_remove_files") +
                                ": " +
                                er.message
                        });
                        //Reset remove file indicator
                        this.commit(consts.FILE_INDICATOR_REMOVING, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_remove_files")
                        });
                        //Reset remove file indicator
                        this.commit(consts.FILE_INDICATOR_REMOVING, false);
                        break;
                }
            }
        };

        ro.init(commit, { ids: obj.filesChecked }, this);
        Vue.http
            .post(ro.url, ro.params, ro.headers)
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
    },

    //Save edit file title
    saveEditFileTitle({ commit }, obj) {
        let ro = {
            url: conf.FILES_UPDATE,
            method: "post",
            params: {},
            paramsObj: {},
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

                //Save file title save indicator
                this.commit(consts.FILE_TITLE_INDICATOR_SAVING, true);
            },

            onSuccess: function(response) {
                //Server error technical
                if (response.data.status == 0) throw response.data.err;

                //Files list saved success
                if (response.data.status == 1) {
                    //Save file title success
                    this.commit(consts.FILE_TITLE_SAVE_SUCCESS, {
                        obj: this.params,
                        lngs: this.env.getters.getLangsContentSelected
                    });

                    VueNotifications.success({
                        message: this.env.getters.tr("File_save_success")
                    });

                    //Reset file title indicator
                    this.commit(consts.FILE_TITLE_INDICATOR_SAVING, false);
                } else throw "Error";
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
                        //Reset file title indicator
                        this.commit(consts.FILE_TITLE_INDICATOR_SAVING, false);
                        break;

                    //string
                    case 0:
                    //Server validator error
                    case 2:
                    //Slim error
                    case 4:
                        VueNotifications.error({
                            message:
                                this.env.getters.tr("Error_save_file") +
                                ": " +
                                er.message
                        });
                        //Reset file title indicator
                        this.commit(consts.FILE_TITLE_INDICATOR_SAVING, false);
                        break;

                    //Token expired
                    case 3:
                        this.env.dispatch("refreshAccessToken", ro);
                        break;

                    //Unknown error
                    default:
                        VueNotifications.error({
                            message: this.env.getters.tr("Error_save_file")
                        });
                        //Reset file title indicator
                        this.commit(consts.FILE_TITLE_INDICATOR_SAVING, false);
                        break;
                }
            }
        };

        ro.init(commit, obj.itm, this);
        Vue.http
            .post(ro.url, ro.params, ro.headers)
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
