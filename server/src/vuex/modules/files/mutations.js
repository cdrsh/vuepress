import * as consts from "./constants";
import Vue from "vue";

export default {
    //Files load success
    [consts.FILES_LOAD_SUCCESS](state, files) {
        state.filesList = files;
        state.filesLoaded = true;
    },

    //Files loading indicator
    [consts.FILES_INDICATOR_LOADING](state, val) {
        state.fileLoading = val;
    },

    //Set file uploading indicator
    [consts.FILE_INDICATOR_UPLOADING](state, val) {
        state.fileUploading = val;
    },

    //File upload success
    [consts.FILE_UPLOAD_SUCCESS](state, obj) {
        let objFileAdd = {
            id: obj.srvFile.id,
            pth: obj.srvFile.pth,
            dt: obj.srvFile.dt,
            fnam: obj.srvFile.fnam,
            szw: obj.clientFile.has("szw") ? obj.clientFile.get("szw") : 100,
            szh: obj.clientFile.has("szh") ? obj.clientFile.get("szh") : 100
        };

        obj.lngs.map(itm => {
            if (obj.clientFile.has("title_" + itm.code))
                objFileAdd["title_" + itm.code] = obj.clientFile.get(
                    "title_" + itm.code
                );
            else objFileAdd["title_" + itm.code] = "";
        });
        state.filesList.push(objFileAdd);
    },

    //Set remove file indicator
    [consts.FILE_INDICATOR_REMOVING](state, val) {
        state.fileRemoving = val;
    },

    //Files removed success
    [consts.FILES_REMOVE_SUCCESS](state, checkedIds) {
        if (state.filesList.length > 0 && checkedIds.length > 0)
            for (let j = 0; j < checkedIds.length; j++)
                for (let i = state.filesList.length - 1; i >= 0; i--)
                    if (state.filesList[i].id == checkedIds[j]) {
                        state.filesList.splice(i, 1);
                        break;
                    }
    },

    //Set file title success indicator
    [consts.FILE_TITLE_INDICATOR_SAVING](state, val) {
        state.fileTitleSaving = val;
    },

    //Save file title success
    [consts.FILE_TITLE_SAVE_SUCCESS](state, obj) {
        let item = state.filesList.filter(itm => itm.id == obj.obj.id);
        if (item !== undefined) {
            obj.lngs.map(itmLng => {
                item["title_" + itmLng.code] = obj.obj["title_" + itmLng.code];
            });
        }
    }
};
