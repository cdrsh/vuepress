import Vue from "vue";

export default {
    //Get RSS list
    getRssList: state => state.rssList,

    //Get RSS page number
    getRssPgNum: state => state.rssPgNum,

    //Get all rss count
    getRssItemsCount: state => state.rssItemsCount,

    //Get rss find text
    getRssFindTxt: state => state.rssFindTxt,

    //Get Rss items per page
    getRssItemsPerPage: state => state.rssItemsPerPage,

    //Get rss loading indicator
    getRssIndicatorLoading: state => state.rssIndicatorLoading,

    //Get rss removing indicator
    getRssIndicatorRemoving: state => state.rssIndicatorRemoving,

    //Get rss adding indicator
    getRssIndicatorAdding: state => state.rssIndicatorAdding,

    //Get rss saving indicator
    getRssIndicatorUpdating: state => state.rssIndicatorUpdating
};
