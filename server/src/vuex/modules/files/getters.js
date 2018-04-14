import Vue from "vue";

export default {
    //Get files list
    getFilesList: state => state.filesList,

    //Get files loading indicator
    getFileLoading: state => state.fileLoading,

    //Get file uploading indicator
    getFileUploading: state => state.fileUploading,

    //Get file removing indicator
    getFileRemoving: state => state.fileRemoving,

    //Get file title saving indicator
    getFileTitleSaving: state => state.fileTitleSaving
};
