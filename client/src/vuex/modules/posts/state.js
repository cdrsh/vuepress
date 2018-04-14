import Vue from "vue";

let defaultPostObj = {
    id: -1,
    dt: "",
    ispub: "1",
    title_en: "",
    txt_en: "",
    kwrds: ""
};

export default {
    postsLoading: false,
    postList: [],
    itemsPerPage: 10,
    fullLoaded: false,
    visSearchPanel: false,
    findText: "",
    postActive: "",
    postOneLoadIndicator: false,
    itemsCount: 1
};
