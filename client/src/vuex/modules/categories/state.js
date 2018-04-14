//Default category object
let defaultCatObj = {
    id: -1,
    name: "",
    order: {
        autoNumerate: true,
        orderby: 1
    },
    keyWords: {
        keyWordsSelfOn: false,
        keyWords: ""
    },
    userFields: {
        userFieldsOn: false,
        userFields: []
    },
    names: []
};

export default {
    categoryLoading: false,
    categoryFilterMode: false,
    categoryFilterText: "",
    activePgNum: 1,
    itemsPerPage: 10,
    itemsCount: 1,
    list: [],
    list_top: [],
    catParentId: -1,
    idLeaf: -1,

    defaultEditCatObj: defaultCatObj,

    //Фильтр
    activePgNumFiltered: 1,
    itemsCountFiltered: 1
};
