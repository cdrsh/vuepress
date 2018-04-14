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
    rssList: [],
    rssPgNum: 1,
    rssIndicatorLoading: false,
    rssIndicatorRemoving: false,
    rssIndicatorAdding: false,
    rssIndicatorUpdating: false,
    rssItemsCount: 0,
    rssItemsPerPage: 10,
    rssFindTxt: ""
};
