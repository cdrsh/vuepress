export default {
    user: {},
    defaultUser: {},
    at: "", //access token

    loginIndicator: false,
    resetIndicator: false,
    registrationIndicator: false,
    API: "/api",

    settings: {
        KEYWORDS: "",
        LANGS_SHOW_SWITCHER: false,
        LOGIN_SWITCHER: false,
        ANONYMOUS_ACCESS: false,
        REGISTRATION_SWITCHER: false,
        COMMENTS_ENABLE: false,
        ANONYMOUS_COMMENTS: false,
        RECAPCHA_COMMENTS: false,
        CATEGORIES_ENABLE: false,
        CATEGORIES_TREE_LPANEL: false,
        RSS_ENABLE: false
    },

    settingsLoaded: false,

    count: 0,

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

    langsArr: [
        { id: 1, name: "english", icon: "us", active: true, code: "en" },
        { id: 2, name: "russian", icon: "ru", active: false, code: "ru" },
        { id: 3, name: "german", icon: "de", active: false, code: "de" },
        { id: 4, name: "chinese", icon: "cn", active: false, code: "zh" }
    ]
};
