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
    categoryAdding: false,
    categorySaving: false,
    categoryOneRemoving: false,
    categoryMoving: false,
    activePgNum: 1,
    itemsPerPage: 10,
    itemsCount: 1,
    list: [],
    catParentId: -1,
    idLeaf: -1,

    visAddCategory: false,
    visEditCategory: false,

    defaultEditCatObj: defaultCatObj,
    editCatObj: defaultCatObj,

    //Filter
    activePgNumFiltered: 1,
    itemsCountFiltered: 1,
    categoryFilterMode: false,
    categoryFilterText: ""
};
