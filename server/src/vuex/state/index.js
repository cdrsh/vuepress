export default {
    user: {},
    at: "", //access token

    loginIndicator: false,
    resetIndicator: false,
    registrationIndicator: false,

    settings: [],
    settingsLoaded: false,

    iconsArr: [
        { id: 1, icon: "dashboard" },
        { id: 2, icon: "view_module" },
        { id: 3, icon: "description" }
    ],

    //Left panel names
    lpanelItems: [
        {
            title: "dashboard",
            path: "/admin/dashboard",
            icon: "home"
        },
        {
            title: "categories",
            path: "/admin/category",
            icon: "view_module"
        },
        {
            title: "posts",
            path: "/admin/post",
            icon: "description"
        },
        {
            title: "files",
            path: "/admin/file",
            icon: "attach_file"
        },
        {
            title: "comments",
            path: "/admin/comment",
            icon: "question_answer"
        },
        {
            title: "rss",
            path: "/admin/rss",
            icon: "rss_feed"
        },
        {
            title: "lang",
            path: "/admin/lang",
            icon: "language"
        },
        {
            title: "users",
            path: "/admin/user",
            icon: "account_box"
        },
        {
            title: "settings",
            path: "/admin/settings",
            icon: "settings"
        }
    ],

    //Pre installed languages
    langsArr: [
        { id: 1, name: "english", icon: "us", active: true, code: "en" },
        { id: 2, name: "russian", icon: "ru", active: false, code: "ru" },
        { id: 3, name: "german", icon: "de", active: false, code: "de" },
        { id: 4, name: "chinese", icon: "cn", active: false, code: "zh" }
    ]
};
