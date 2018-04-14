-- phpMyAdmin SQL Dump
-- version 4.8.0
-- https://www.phpmyadmin.net/
--
-- Хост: localhost
-- Время создания: Апр 14 2018 г., 07:23
-- Версия сервера: 10.2.9-MariaDB
-- Версия PHP: 7.1.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


-- --------------------------------------------------------

--
-- Структура таблицы `category`
--

CREATE TABLE `category` (
  `id` int(11) NOT NULL,
  `pid` int(11) DEFAULT NULL,
  `idleaf` int(11) DEFAULT NULL,
  `name_en` char(255) NOT NULL,
  `kwrds` text DEFAULT NULL,
  `kwrdson` int(1) DEFAULT NULL,
  `auto_numerate` int(1) DEFAULT NULL,
  `orderby` int(1) DEFAULT NULL,
  `num` int(1) DEFAULT NULL,
  `user_fields_on` int(1) DEFAULT NULL,
  `dt` datetime DEFAULT NULL,
  `vws` int(11) DEFAULT NULL,
  `name_zh` char(255) DEFAULT '',
  `name_ru` char(255) DEFAULT '',
  `name_de` char(255) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `category`
--

INSERT INTO `category` (`id`, `pid`, `idleaf`, `name_en`, `kwrds`, `kwrdson`, `auto_numerate`, `orderby`, `num`, `user_fields_on`, `dt`, `vws`, `name_zh`, `name_ru`, `name_de`) VALUES
(1, -1, 345764, 'Vue-Lessons-Youtube.com', 'Vue,youtube.com,learn,lesson,video,howto', 1, 0, 3, 1, 1, '2018-04-09 04:57:24', 20, 'Vue-教训-Youtube.com', 'Vue Уроки на Youtube.com', 'Vue-Unterricht-Youtube.com'),
(2, -1, 345764, 'Vue.js - Documentations', 'vue.js,documentation,book,learn', 1, 0, 3, 2, 1, '2018-04-09 05:06:24', 37, 'Vue.js - 单证', 'Vue.js - Документы', 'Vue.js - Dokumentationen'),
(3, -1, 345764, 'Vue.js - Projects', 'link,project,vue.js', 1, 0, 3, 3, 1, '2018-04-09 05:17:46', 70, 'Vue.js - 项目', 'Vue.js - Проекты', 'Vue.js - Projekte');

-- --------------------------------------------------------

--
-- Структура таблицы `cat_post_sv`
--

CREATE TABLE `cat_post_sv` (
  `id` int(11) NOT NULL,
  `catid` int(11) DEFAULT NULL,
  `postid` int(11) DEFAULT NULL,
  `num` int(11) DEFAULT NULL,
  `dt` datetime DEFAULT NULL,
  `ufldids` text DEFAULT NULL,
  `ufldvls` text DEFAULT NULL,
  `vws` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `cat_post_sv`
--

INSERT INTO `cat_post_sv` (`id`, `catid`, `postid`, `num`, `dt`, `ufldids`, `ufldvls`, `vws`) VALUES
(1, 2, 1, 1, '2018-04-05 05:28:52', '', '', 1),
(2, 3, 2, 1, '2018-04-05 06:13:23', '', '', 4),
(3, 3, 3, 2, '2018-04-09 09:00:27', ':5:6', ':!:https://vuetifyjs.com:!:projects', 0),
(4, 3, 4, 3, '2018-04-09 09:02:55', '', '', 0),
(5, 3, 5, 4, '2018-04-09 09:12:10', ':5:6', ':!:https://vue-material-old.netlify.com/:!:projects', 0),
(6, 3, 6, 5, '2018-04-09 09:26:35', ':5:6', ':!:https://github.com/PanJiaChen/vue-element-admin:!:projects', 0),
(7, 3, 7, 6, '2018-04-09 09:35:25', ':5:6', ':!:https://github.com/vue-bulma/vue-admin:!:projects', 0),
(8, 2, 8, 2, '2018-04-05 09:39:00', ':3:4', ':!:doc:!:https://legacy.gitbook.com/book/learning-vuejs/content/details', 0),
(9, 2, 9, 3, '2018-04-09 09:41:44', ':3:4', ':!:doc:!:https://www.amazon.com/dp/1786469944?tag=pymlk3g3kr-20', 0),
(10, 1, 10, 1, '2018-04-07 03:43:54', ':1:2:7', ':!:video:!:-1:!:https://www.youtube.com/watch?v=5LYrN_cAJoA&list=PL4cUxeGkcC9gQcYgjhBoeQH7wiAyZNrYa', 1),
(11, 1, 11, 2, '2018-04-10 04:54:46', ':1:2:7', ':!:video:!:-1:!:https://www.youtube.com/watch?v=z6hQqgvGI4Y', 0),
(12, 1, 12, 3, '2018-04-10 05:01:20', ':1:2:7', ':!:video:!:-1:!:https://www.youtube.com/watch?v=qA5PlSh1Qq8', 0);

-- --------------------------------------------------------

--
-- Структура таблицы `cat_usrflds`
--

CREATE TABLE `cat_usrflds` (
  `id` int(11) NOT NULL,
  `catid` int(11) DEFAULT NULL,
  `namef` char(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `cat_usrflds`
--

INSERT INTO `cat_usrflds` (`id`, `catid`, `namef`) VALUES
(1, 1, 'tag'),
(2, 1, 'starttime'),
(3, 2, 'tag'),
(4, 2, 'link'),
(5, 3, 'link'),
(6, 3, 'tag'),
(7, 1, 'link');

-- --------------------------------------------------------

--
-- Структура таблицы `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `pid` int(11) DEFAULT NULL,
  `leafid` int(11) DEFAULT NULL,
  `postid` int(11) DEFAULT NULL,
  `usrid` int(11) DEFAULT NULL,
  `num` int(11) DEFAULT NULL,
  `txt` text DEFAULT NULL,
  `dt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `comments`
--

INSERT INTO `comments` (`id`, `pid`, `leafid`, `postid`, `usrid`, `num`, `txt`, `dt`) VALUES
(1, -1, -1, 3, 1, NULL, 'FirstComment', '2018-04-09 11:28:02');

-- --------------------------------------------------------

--
-- Структура таблицы `files`
--

CREATE TABLE `files` (
  `id` int(11) NOT NULL,
  `usrid` int(11) DEFAULT NULL,
  `pth` text DEFAULT NULL,
  `fnam` text DEFAULT NULL,
  `dt` datetime DEFAULT NULL,
  `title_en` text DEFAULT NULL,
  `szw` int(11) DEFAULT NULL,
  `szh` int(11) DEFAULT NULL,
  `title_zh` text DEFAULT NULL,
  `title_ru` text DEFAULT NULL,
  `title_de` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `lang`
--

CREATE TABLE `lang` (
  `id` int(11) NOT NULL,
  `code` char(2) DEFAULT NULL,
  `used` int(1) DEFAULT NULL,
  `name` char(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `lang`
--

INSERT INTO `lang` (`id`, `code`, `used`, `name`) VALUES
(1, 'zh', 1, 'Chinese'),
(2, 'ru', 1, 'Russian'),
(3, 'de', 1, 'German'),
(4, 'en', 1, 'English');

-- --------------------------------------------------------

--
-- Структура таблицы `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL,
  `dt` datetime DEFAULT NULL,
  `ispub` int(2) DEFAULT NULL,
  `usrid` int(11) DEFAULT NULL,
  `title_en` text DEFAULT NULL,
  `txt_en` mediumtext DEFAULT NULL,
  `title_zh` text DEFAULT NULL,
  `txt_zh` mediumtext DEFAULT NULL,
  `title_ru` text DEFAULT NULL,
  `txt_ru` mediumtext DEFAULT NULL,
  `title_de` text DEFAULT NULL,
  `txt_de` mediumtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `posts`
--

INSERT INTO `posts` (`id`, `dt`, `ispub`, `usrid`, `title_en`, `txt_en`, `title_zh`, `txt_zh`, `title_ru`, `txt_ru`, `title_de`, `txt_de`) VALUES
(1, '2018-04-05 05:28:52', 1, 1, 'Vue.js guide', '<div><br></div><span style=\"font-weight: bold; color: rgb(66, 66, 66);\">Very simple and full guide with examples.</span><div><span style=\"color: rgb(66, 66, 66);\">This is the main resource for vue.js developers.</span></div>', 'Vue.js 指南', '<br><div><div><span style=\"color: rgb(66, 66, 66);\">用例子非常简单和全面的指导。</span></div><div><span style=\"color: rgb(66, 66, 66);\">这是vue.js开发人员的主要资源。</span></div></div>', 'Vue.js руководство', '<div><br></div><div><div><span style=\"color: rgb(66, 66, 66);\">Очень простое и полное руководство с примерами.</span></div><div><span style=\"color: rgb(66, 66, 66);\">Это основной ресурс для разработчиков vue.js.</span></div></div>', 'Vue.js führen', '<div><br></div><div><div><span style=\"font-weight: 700; color: rgb(66, 66, 66);\">Sehr einfache und vollständige Anleitung mit Beispielen.</span></div><div><span style=\"font-weight: 700; color: rgb(66, 66, 66);\">Dies ist die Hauptressource für vue.js-Entwickler.</span></div></div>'),
(2, '2018-04-06 06:13:23', 1, 1, 'A Desktop UI Library', '<div style=\"text-align: center;\"><span style=\"font-size: 18px; font-weight: bold;\"><br></span></div><div style=\"text-align: center;\"><span style=\"font-weight: bold; color: rgb(99, 99, 99); font-size: 24px;\">A Desktop UI library.</span></div><div style=\"text-align: center;\"><span style=\"font-size: 18px; font-weight: bold;\"><br></span></div><div style=\"text-align: left;\"><span style=\"color: rgb(99, 99, 99);\">Element, a Vue 2.0 based component library for developers, designers and product managers.</span></div><div style=\"text-align: left;\"><br></div>', 'A Desktop UI Library', '<div><br></div><div><div style=\"text-align: center;\"><div><span style=\"color: rgb(99, 99, 99); font-size: 24px; font-weight: 700;\">桌面用户界面库。</span></div><div><span style=\"color: rgb(99, 99, 99); font-size: 24px; font-weight: 700;\"><br></span></div><div style=\"text-align: left;\"><span style=\"font-size: 16px; color: rgb(66, 66, 66);\">基于Vue 2.0的组件库，面向开发人员，设计人员和产品经理。</span></div></div></div>', 'A Desktop UI Library', '<div><br></div><div><div style=\"text-align: center;\"><span style=\"color: rgb(99, 99, 99); font-size: 24px; font-weight: bold;\">Библиотека компонентов управления для рабочего стола.</span></div></div><div><div style=\"\"><span style=\"color: rgb(99, 99, 99);\"><br></span></div><div style=\"\"><span style=\"color: rgb(99, 99, 99);\">Библиотека компонентов на основе Vue 2.0 для разработчиков, дизайнеров и менеджеров продуктов.</span></div></div><div><span style=\"color: rgb(99, 99, 99);\"><br></span></div>', 'A Desktop UI Library', '<div><br></div><div><div style=\"text-align: center;\"><div><span style=\"color: rgb(99, 99, 99); font-size: 24px; font-weight: 700;\">Eine Desktop-UI-Bibliothek.</span></div><div><span style=\"color: rgb(99, 99, 99); font-size: 24px; font-weight: 700;\"><br></span></div><div style=\"text-align: left;\"><span style=\"color: rgb(99, 99, 99); font-size: 16px;\">Element, eine auf Vue 2.0 basierende Komponentenbibliothek für Entwickler, Designer und Produktmanager.</span></div></div></div>'),
(3, '2018-04-07 09:00:27', 1, 1, 'Material Design Component Framework', '<h3 data-v-8b8ef402=\"\" class=\"mb-3 text-xs-center\" style=\"box-sizing: inherit; background-repeat: no-repeat; padding: 0px; margin-top: 0px; margin-right: 0px; margin-left: 0px; margin-bottom: 16px !important;\"><div><span style=\"color: rgb(99, 99, 99);\"><br></span></div><ul><li><span style=\"color: rgb(99, 99, 99);\">Vibrant Community</span></li><li><span style=\"color: rgb(99, 99, 99);\">Semantic Material Components</span></li><li><span style=\"color: rgb(99, 99, 99);\">Ready-Made Project Scaffolding</span></li></ul></h3><h3 data-v-8b8ef402=\"\" class=\"mb-3 text-xs-center\" style=\"box-sizing: inherit; background-repeat: no-repeat; padding: 0px; margin-top: 0px; margin-right: 0px; margin-left: 0px; margin-bottom: 16px !important;\"><span style=\"font-weight: normal; font-size: 16px;\">When you run into a roadblock, you need assistance right away. Vuetify offers chat support in our growing community on Discord.&nbsp;</span></h3><h3 data-v-8b8ef402=\"\" class=\"mb-3 text-xs-center\" style=\"box-sizing: inherit; background-repeat: no-repeat; padding: 0px; margin-top: 0px; margin-right: 0px; margin-left: 0px; margin-bottom: 16px !important;\"><span style=\"font-weight: normal; font-size: 16px;\">Be prepared for an armada of specialized components at your disposal. With over 80 in total, there is a solution for any application.&nbsp;</span></h3><h3 data-v-8b8ef402=\"\" class=\"mb-3 text-xs-center\" style=\"box-sizing: inherit; background-repeat: no-repeat; padding: 0px; margin-top: 0px; margin-right: 0px; margin-left: 0px; margin-bottom: 16px !important;\"><span style=\"font-weight: normal; font-size: 16px;\">Vuetify comes ready to go with 8 pre-made vue-cli templates. From simple html to full-blown SSR you are ready to go in minutes.</span></h3><h3 data-v-8b8ef402=\"\" class=\"mb-3 text-xs-center\" style=\"box-sizing: inherit; background-repeat: no-repeat; padding: 0px; margin-top: 0px; margin-right: 0px; margin-left: 0px; margin-bottom: 16px !important;\"><div></div></h3><h3 data-v-8b8ef402=\"\" class=\"mb-3 text-xs-center\" style=\"box-sizing: inherit; background-repeat: no-repeat; padding: 0px; margin-top: 0px; margin-right: 0px; margin-left: 0px; margin-bottom: 16px !important;\"><span style=\"font-weight: normal; font-size: 14px; color: rgb(99, 99, 99);\">github:&nbsp;<a href=\"https://github.com/vuetifyjs/vuetify\">https://github.com/vuetifyjs/vuetify</a></span></h3>', 'Material Design Component Framework', '<h3 data-v-8b8ef402=\"\" class=\"mb-3 text-xs-center\" style=\"box-sizing: inherit; background-repeat: no-repeat; padding: 0px; margin-top: 0px; margin-right: 0px; margin-left: 0px; margin-bottom: 16px !important;\"><div><span style=\"color: rgb(99, 99, 99);\"><br></span></div><div><div style=\"\"><ul><li><span style=\"color: rgb(66, 66, 66);\">充满活力的社区</span></li><li><span style=\"color: rgb(66, 66, 66);\">语义材料组件</span></li><li><span style=\"color: rgb(66, 66, 66);\">现成的项目脚手架</span></li></ul><span style=\"color: rgb(66, 66, 66);\"><br></span><div><span style=\"color: rgb(66, 66, 66);\">当您遇到路障时，您需要立即获得帮助。 Vuetify在我们不断增长的社区中为Discord提供聊天支持。</span></div><div><span style=\"color: rgb(66, 66, 66);\">为您准备好专业组件的舰队。 总计超过80个，可为任何应用提供解决方案。</span></div><div><span style=\"color: rgb(66, 66, 66);\">Vuetify随时准备采用8个预先制作的vue-cli模板。 从简单的html到全面的SSR，您都可以在几分钟内完成任务。</span></div></div></div></h3><h3 data-v-8b8ef402=\"\" class=\"mb-3 text-xs-center\" style=\"box-sizing: inherit; background-repeat: no-repeat; padding: 0px; margin-top: 0px; margin-right: 0px; margin-left: 0px; margin-bottom: 16px !important;\"><span style=\"font-weight: normal; font-size: 14px; color: rgb(99, 99, 99);\">github:&nbsp;<a href=\"https://github.com/vuetifyjs/vuetify\">https://github.com/vuetifyjs/vuetify</a></span></h3>', 'Material Design Component Framework', '<div><h3 data-v-8b8ef402=\"\" class=\"mb-3 text-xs-center\" style=\"box-sizing: inherit; background-repeat: no-repeat; padding: 0px; margin-top: 0px; margin-right: 0px; margin-left: 0px; margin-bottom: 16px !important;\"><br><ul><li><span style=\"color: rgb(66, 66, 66);\">Яркое сообщество</span></li><li><span style=\"color: rgb(66, 66, 66);\">Компоненты семантического материала</span></li><li><span style=\"color: rgb(66, 66, 66);\">Готовые строительные леса</span></li></ul><span style=\"color: rgb(66, 66, 66);\"><br><span style=\"font-size: 16px; font-weight: normal;\">Когда вы сталкиваетесь с блокпостом, вам нужна помощь сразу. Vuetify предлагает поддержку чата в нашем растущем сообществе Discord.<br></span></span><ul></ul><span style=\"font-size: 16px; font-weight: normal; color: rgb(66, 66, 66);\">Будьте готовы к армаде специализированных компонентов в вашем распоряжении. С более чем 80 в целом, есть решение для любого приложения.<br></span><ul></ul><span style=\"font-size: 16px; font-weight: normal; color: rgb(66, 66, 66);\">Vuetify готов к работе с 8 предварительно изготовленными шаблонами vue-cli. От простого html до полномасштабной SSR вы готовы за считанные минуты.</span></h3></div><div><div><span style=\"color: rgba(0, 0, 0, 0.87); font-family: Roboto, sans-serif; font-size: 14px; text-align: center; background-color: rgb(255, 255, 255);\"><br></span></div><h3 data-v-8b8ef402=\"\" class=\"mb-3 text-xs-center\" style=\"box-sizing: inherit; background-repeat: no-repeat; padding: 0px; margin-top: 0px; margin-right: 0px; margin-left: 0px; margin-bottom: 16px !important;\"><span style=\"font-weight: normal; font-size: 14px; color: rgb(99, 99, 99);\">github:&nbsp;<a href=\"https://github.com/vuetifyjs/vuetify\">https://github.com/vuetifyjs/vuetify</a></span></h3></div>', 'Material Design Component Framework', '<h3 data-v-8b8ef402=\"\" class=\"mb-3 text-xs-center\" style=\"box-sizing: inherit; background-repeat: no-repeat; padding: 0px; margin-top: 0px; margin-right: 0px; margin-left: 0px; margin-bottom: 16px !important;\"><br><ul><li><span style=\"color: rgb(66, 66, 66);\">Lebhafte Gemeinschaft</span></li><li><span style=\"color: rgb(66, 66, 66);\">Semantische Materialkomponenten</span></li><li><span style=\"color: rgb(66, 66, 66);\">Fertige Projektgerüste</span></li></ul><span style=\"color: rgb(66, 66, 66);\"><br><span style=\"font-size: 16px;\">Wenn Sie in eine Straßensperre geraten, brauchen Sie sofort Hilfe. Vuetify bietet Chat-Support in unserer wachsenden Community auf Discord.<br></span></span><ul></ul><span style=\"color: rgb(66, 66, 66); font-size: 16px;\">Bereiten Sie sich auf eine Armada von spezialisierten Komponenten vor. Mit über 80 insgesamt gibt es für jede Anwendung eine Lösung.<br></span><ul></ul><span style=\"color: rgb(66, 66, 66); font-size: 16px;\">Vuetify ist ab sofort mit 8 vorgefertigten vue-cli-Vorlagen erhältlich. Von einfachem HTML bis zu vollwertigem SSR sind Sie in wenigen Minuten startklar.</span></h3><h3 data-v-8b8ef402=\"\" class=\"mb-3 text-xs-center\" style=\"box-sizing: inherit; background-repeat: no-repeat; padding: 0px; margin-top: 0px; margin-right: 0px; margin-left: 0px; margin-bottom: 16px !important;\"><div></div></h3><h3 data-v-8b8ef402=\"\" class=\"mb-3 text-xs-center\" style=\"box-sizing: inherit; background-repeat: no-repeat; padding: 0px; margin-top: 0px; margin-right: 0px; margin-left: 0px; margin-bottom: 16px !important;\"><span style=\"font-weight: normal; font-size: 14px; color: rgb(99, 99, 99);\">github:&nbsp;<a href=\"https://github.com/vuetifyjs/vuetify\">https://github.com/vuetifyjs/vuetify</a></span></h3>'),
(4, '2018-04-08 09:02:55', 1, 1, 'iView - A high quality UI Toolkit built on Vue.js 2.0', '<div><span style=\"color: rgb(99, 99, 99);\">Introduction here:&nbsp;<a href=\"https://www.iviewui.com/docs/guide/introduce-en\">https://www.iviewui.com/docs/guide/introduce-en</a></span></div><div><span style=\"color: rgb(99, 99, 99);\"><br></span></div><div><span style=\"color: rgb(99, 99, 99);\">Components:&nbsp;<a href=\"https://www.iviewui.com/docs/guide/install-en\">https://www.iviewui.com/docs/guide/install-en</a></span></div><div><br></div>', 'iView - 基于Vue.js 2.0构建的高质量UI工具包', '<div><div><span style=\"color: rgb(99, 99, 99);\">这里介绍:&nbsp;</span><a href=\"https://www.iviewui.com/docs/guide/introduce-en\">https://www.iviewui.com/docs/guide/introduce-en</a></div><div><span style=\"color: rgb(99, 99, 99);\"><br></span></div><div><span style=\"color: rgb(99, 99, 99);\">组件:&nbsp;<a href=\"https://www.iviewui.com/docs/guide/install-en\">https://www.iviewui.com/docs/guide/install-en</a></span></div></div><div><br></div>', 'iView - Высококачественный UI Toolkit, построенный на Vue.js 2.0', '<div><div><span style=\"color: rgb(99, 99, 99);\">Введение:&nbsp;<a href=\"https://www.iviewui.com/docs/guide/introduce-en\">https://www.iviewui.com/docs/guide/introduce-en</a></span></div><div><span style=\"color: rgb(99, 99, 99);\"><br></span></div><div><span style=\"color: rgb(99, 99, 99);\">Компоненты:&nbsp;<a href=\"https://www.iviewui.com/docs/guide/install-en\">https://www.iviewui.com/docs/guide/install-en</a></span></div></div><div><br></div>', 'iView - Ein hochwertiges UI-Toolkit, das auf Vue.js 2.0 aufbaut', '<div><div><span style=\"color: rgb(99, 99, 99);\">Einführung hier:&nbsp;<a href=\"https://www.iviewui.com/docs/guide/introduce-en\">https://www.iviewui.com/docs/guide/introduce-en</a></span></div><div><span style=\"color: rgb(99, 99, 99);\"><br></span></div><div><span style=\"color: rgb(99, 99, 99);\">Komponenten:&nbsp;<a href=\"https://www.iviewui.com/docs/guide/install-en\">https://www.iviewui.com/docs/guide/install-en</a></span></div></div><div><br></div>'),
(5, '2018-04-09 09:12:10', 1, 1, 'Vue-Material', '<div><span style=\"font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 20px; letter-spacing: 0.14px; text-align: center; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\"><br></span></div><span style=\"font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 20px; letter-spacing: 0.14px; text-align: center; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\">Build well-crafted apps with Material Design and Vue 2</span><div><span style=\"font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 20px; letter-spacing: 0.14px; text-align: center; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\"><br></span></div><div><span style=\"color: rgb(99, 99, 99); font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255);\">Vue Material is lightweight framework built exactly according to the&nbsp;</span><a data-v-ee9bf816=\"\" data-v-21b0d2be=\"\" href=\"http://material.google.com/\" target=\"_blank\" rel=\"noopener\" style=\"box-sizing: inherit; text-decoration-line: none; font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\">Material Design</a><span style=\"color: rgb(99, 99, 99); font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255);\">&nbsp;specs. Build powerful and well-designed web apps that can can fit on every screen.</span></div><div><span style=\"font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\"><br></span></div><div><span style=\"font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\">You can generate and use themes dynamically, use components on demand, take advantage of UI Elements and Components with an easy-to-use API and more…</span></div><div><span style=\"font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\"><br></span></div><div><span style=\"font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\">It aims to deliver a collection of reusable components and a series of UI Elements to build applications with support to all modern Web Browsers through Vue 2.0.</span></div>', 'Vue-Material', '<div><br></div><div><span style=\"font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 20px; letter-spacing: 0.14px; text-align: center; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\">Build well-crafted apps with Material Design and Vue 2</span><div><span style=\"font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 20px; letter-spacing: 0.14px; text-align: center; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\"><br></span></div><div><span style=\"color: rgb(99, 99, 99); font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255);\">Vue Material is lightweight framework built exactly according to the&nbsp;</span><a data-v-ee9bf816=\"\" data-v-21b0d2be=\"\" href=\"http://material.google.com/\" target=\"_blank\" rel=\"noopener\" style=\"box-sizing: inherit; text-decoration-line: none; font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\">Material Design</a><span style=\"color: rgb(99, 99, 99); font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255);\">&nbsp;specs. Build powerful and well-designed web apps that can can fit on every screen.</span></div><div><span style=\"font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\"><br></span></div><div><span style=\"font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\">You can generate and use themes dynamically, use components on demand, take advantage of UI Elements and Components with an easy-to-use API and more…</span></div><div><span style=\"font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\"><br></span></div><div><span style=\"font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\">It aims to deliver a collection of reusable components and a series of UI Elements to build applications with support to all modern Web Browsers through Vue 2.0.</span></div></div>', 'Vue-Material', '<div><br></div><div><span style=\"font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 20px; letter-spacing: 0.14px; text-align: center; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\">Build well-crafted apps with Material Design and Vue 2</span><div><span style=\"font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 20px; letter-spacing: 0.14px; text-align: center; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\"><br></span></div><div><span style=\"color: rgb(99, 99, 99); font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255);\">Vue Material is lightweight framework built exactly according to the&nbsp;</span><a data-v-ee9bf816=\"\" data-v-21b0d2be=\"\" href=\"http://material.google.com/\" target=\"_blank\" rel=\"noopener\" style=\"box-sizing: inherit; text-decoration-line: none; font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\">Material Design</a><span style=\"color: rgb(99, 99, 99); font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255);\">&nbsp;specs. Build powerful and well-designed web apps that can can fit on every screen.</span></div><div><span style=\"font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\"><br></span></div><div><span style=\"font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\">You can generate and use themes dynamically, use components on demand, take advantage of UI Elements and Components with an easy-to-use API and more…</span></div><div><span style=\"font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\"><br></span></div><div><span style=\"font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\">It aims to deliver a collection of reusable components and a series of UI Elements to build applications with support to all modern Web Browsers through Vue 2.0.</span></div></div>', 'Vue-Material', '<div><br></div><div><span style=\"font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 20px; letter-spacing: 0.14px; text-align: center; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\">Build well-crafted apps with Material Design and Vue 2</span><div><span style=\"font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 20px; letter-spacing: 0.14px; text-align: center; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\"><br></span></div><div><span style=\"color: rgb(99, 99, 99); font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255);\">Vue Material is lightweight framework built exactly according to the&nbsp;</span><a data-v-ee9bf816=\"\" data-v-21b0d2be=\"\" href=\"http://material.google.com/\" target=\"_blank\" rel=\"noopener\" style=\"box-sizing: inherit; text-decoration-line: none; font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\">Material Design</a><span style=\"color: rgb(99, 99, 99); font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255);\">&nbsp;specs. Build powerful and well-designed web apps that can can fit on every screen.</span></div><div><span style=\"font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\"><br></span></div><div><span style=\"font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\">You can generate and use themes dynamically, use components on demand, take advantage of UI Elements and Components with an easy-to-use API and more…</span></div><div><span style=\"font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\"><br></span></div><div><span style=\"font-family: Roboto, &quot;Noto Sans&quot;, Noto, sans-serif; font-size: 14px; letter-spacing: 0.14px; background-color: rgb(255, 255, 255); color: rgb(99, 99, 99);\">It aims to deliver a collection of reusable components and a series of UI Elements to build applications with support to all modern Web Browsers through Vue 2.0.</span></div></div>'),
(6, '2018-04-09 09:26:35', 1, 1, 'Vue Element Admin', '<a href=\"http://panjiachen.github.io/vue-element-admin/#/dashboard\">Live demo</a><br>', 'Vue Element Admin', '<a href=\"http://panjiachen.github.io/vue-element-admin/#/dashboard\">Live demo</a><div></div>', 'Vue Element Admin', '<a href=\"http://panjiachen.github.io/vue-element-admin/#/dashboard\">Live demo</a><div></div>', 'Vue Element Admin', '<a href=\"http://panjiachen.github.io/vue-element-admin/#/dashboard\">Live demo</a><div></div>'),
(7, '2018-04-09 09:35:25', 1, 1, 'Vue Admin Panel Framework, Powered by Vue 2.0 and Bulma 0.3', '<div><div><font color=\"#24292e\" face=\"-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol\"><br></font></div><ul style=\"box-sizing: border-box; padding-left: 2em; margin-top: 0px; margin-bottom: 16px; color: rgb(36, 41, 46); font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Helvetica, Arial, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;; font-size: 16px;\"><li style=\"box-sizing: border-box;\">Powered by&nbsp;<a href=\"http://vuejs.org/\" rel=\"nofollow\" style=\"box-sizing: border-box; color: rgb(3, 102, 214); text-decoration-line: none;\">Vue</a>&nbsp;<span style=\"box-sizing: border-box; font-weight: 600;\">2.0</span>&nbsp;&amp;&nbsp;<a href=\"http://bulma.io/\" rel=\"nofollow\" style=\"box-sizing: border-box; color: rgb(3, 102, 214); text-decoration-line: none;\">Bulma</a>&nbsp;<span style=\"box-sizing: border-box; font-weight: 600;\">0.3</span></li><li style=\"box-sizing: border-box; margin-top: 0.25em;\">Responsive and Flexible Box Layout</li><li style=\"box-sizing: border-box; margin-top: 0.25em;\"><a href=\"https://github.com/vue-bulma/vue-admin/blob/master/doc/charts.md\" style=\"box-sizing: border-box; color: rgb(3, 102, 214); text-decoration-line: none;\">Variety of Charts</a></li><li style=\"box-sizing: border-box; margin-top: 0.25em;\"><a href=\"https://github.com/vue-bulma/vue-admin/blob/master/doc/components.md\" style=\"box-sizing: border-box; color: rgb(3, 102, 214); text-decoration-line: none;\">Rich Components</a>&nbsp;or See&nbsp;<a href=\"https://github.com/vue-bulma\" style=\"box-sizing: border-box; color: rgb(3, 102, 214); text-decoration-line: none;\">vue-bulma</a></li><li style=\"box-sizing: border-box; margin-top: 0.25em;\">Based on the awesome third-party&nbsp;<a href=\"https://github.com/vue-bulma/vue-admin/blob/master/doc/dependencies.md\" style=\"box-sizing: border-box; color: rgb(3, 102, 214); text-decoration-line: none;\">libraries</a></li></ul></div><div>Live Demo:&nbsp;<a href=\"https://admin.vuebulma.com/\">https://admin.vuebulma.com</a></div>', 'Vue Admin Panel Framework, Powered by Vue 2.0 and Bulma 0.3', '<div><br></div><div><div><ul><li><span style=\"color: rgb(66, 66, 66);\">由Vue 2.0和Bulma 0.3提供支持</span></li><li><span style=\"color: rgb(66, 66, 66);\">响应灵活的箱子布局</span></li><li><span style=\"color: rgb(66, 66, 66);\">各种图表</span></li><li><span style=\"color: rgb(66, 66, 66);\">Rich Components或查看vue-bulma</span></li><li><span style=\"color: rgb(66, 66, 66);\">基于真棒第三方库</span></li></ul></div><div><span style=\"color: rgb(66, 66, 66);\"><span style=\"font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Helvetica, Arial, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;;\">现场演示</span>:</span>&nbsp;<a href=\"https://admin.vuebulma.com/\">https://admin.vuebulma.com<br></a></div></div>', 'Vue Admin Panel Framework, Powered by Vue 2.0 and Bulma 0.3', '<div><br></div><div><div><ul><li><span style=\"font-size: 16px; color: rgb(66, 66, 66);\">Работает на Vue 2.0 и Bulma 0.3</span></li><li><span style=\"font-size: 16px; color: rgb(66, 66, 66);\">Отзывчивый и гибкий box-макет</span></li><li><span style=\"font-size: 16px; color: rgb(66, 66, 66);\">Разнообразие графиков</span></li><li><span style=\"font-size: 16px; color: rgb(66, 66, 66);\">Богатые компоненты или см. Vue-bulma</span></li><li><span style=\"font-size: 16px; color: rgb(66, 66, 66);\">Основана на потрясающих сторонних библиотеках</span></li></ul></div><div><span style=\"font-size: 16px; color: rgb(66, 66, 66);\">Демо-версия</span>:&nbsp;<a href=\"https://admin.vuebulma.com/\">https://admin.vuebulma.com<br></a></div></div>', 'Vue Admin Panel Framework, Powered by Vue 2.0 and Bulma 0.3', '<div><br></div><div><div><ul><li><span style=\"font-size: 16px; color: rgb(66, 66, 66);\">Bereitgestellt von Vue 2.0 &amp; Bulma 0.3</span></li><li><span style=\"font-size: 16px; color: rgb(66, 66, 66);\">Responsive und flexible Box Layout</span></li><li><span style=\"font-size: 16px; color: rgb(66, 66, 66);\">Vielzahl von Charts</span></li><li><span style=\"font-size: 16px; color: rgb(66, 66, 66);\">Rich Components oder Siehe vue-bulma</span></li><li><span style=\"font-size: 16px; color: rgb(66, 66, 66);\">Basierend auf den tollen Bibliotheken von Drittanbietern</span></li></ul></div><div><span style=\"font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Helvetica, Arial, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;; font-size: 16px; color: rgb(66, 66, 66);\">Live Demo</span><span style=\"color: rgb(36, 41, 46); font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Helvetica, Arial, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;; font-size: 16px;\">:&nbsp;</span><a href=\"https://admin.vuebulma.com\" style=\"font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Helvetica, Arial, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;; font-size: 16px;\">https://admin.vuebulma.com</a></div></div>'),
(8, '2018-04-05 05:38:00', 1, 1, 'Learning Vue.js', '<h3 style=\"box-sizing: border-box; line-height: 1.1; margin-top: 1.275em; margin-bottom: 0.85em; break-after: avoid;\"><span style=\"font-weight: normal; font-size: 20px; color: rgb(66, 66, 66);\">This book means to be a collection of short how-to like tutorials.</span></h3><div><span style=\"color: rgb(66, 66, 66);\"><a href=\"https://legacy.gitbook.com/download/pdf/book/learning-vuejs/content\">Download here</a></span></div>', '学习 Vue.js', '<h3 style=\"box-sizing: border-box; line-height: 1.1; margin-top: 1.275em; margin-bottom: 0.85em; break-after: avoid;\"><span style=\"font-size: 20px; font-weight: 400; color: rgb(66, 66, 66);\">这本书的意思是收集简短的教程。</span></h3><h3 style=\"box-sizing: border-box; line-height: 1.1; margin-top: 1.275em; margin-bottom: 0.85em; break-after: avoid;\"><div style=\"font-size: medium; font-weight: 400;\"><span style=\"color: rgb(66, 66, 66);\"><a href=\"https://legacy.gitbook.com/download/pdf/book/learning-vuejs/content\">Download here</a></span></div></h3>', 'Изучаем Vue.js', '<h3 style=\"box-sizing: border-box; line-height: 1.1; margin-top: 1.275em; margin-bottom: 0.85em; break-after: avoid;\"><span style=\"color: rgb(66, 66, 66); font-size: 20px; font-weight: 400;\">Эта книга содержит сборник кратких how-to пособий.</span></h3><h3 style=\"box-sizing: border-box; line-height: 1.1; margin-top: 1.275em; margin-bottom: 0.85em; break-after: avoid;\"><div style=\"font-size: medium; font-weight: 400;\"><span style=\"color: rgb(66, 66, 66);\"><a href=\"https://legacy.gitbook.com/download/pdf/book/learning-vuejs/content\">Download here</a></span></div></h3>', 'Lernen Vue.js', '<h3 style=\"box-sizing: border-box; line-height: 1.1; margin-top: 1.275em; margin-bottom: 0.85em; break-after: avoid;\"><span style=\"color: rgb(66, 66, 66); font-size: 20px; font-weight: 400;\">Dieses Buch soll eine Sammlung von kurzen Tutorials sein.</span></h3><h3 style=\"box-sizing: border-box; line-height: 1.1; margin-top: 1.275em; margin-bottom: 0.85em; break-after: avoid;\"><div style=\"font-size: medium; font-weight: 400;\"><span style=\"color: rgb(66, 66, 66);\"><a href=\"https://legacy.gitbook.com/download/pdf/book/learning-vuejs/content\">Download here</a></span></div></h3>'),
(9, '2018-04-09 06:41:44', 1, 1, 'Learning Vue.js 2', '<div><br></div><span style=\"font-size: 18px; color: rgb(99, 99, 99);\">Learn how to build amazing and complex reactive web applications easily with Vue.js.</span><div><span style=\"color: rgb(99, 99, 99);\"><br></span></div><div><h2 style=\"margin: 0px; padding: 0px 0px 4px; text-rendering: optimizeLegibility; line-height: 1.3;\"><span style=\"font-size: 14px; color: rgb(99, 99, 99);\">About This Book</span></h2><ul style=\"margin: 0px 0px 18px 20px; padding: 0px;\"><li style=\"margin: 0px 0px 0px 20px; word-wrap: break-word;\"><span style=\"font-size: 14px; color: rgb(99, 99, 99);\">Learn how to propagate DOM changes across the website without writing extensive jQuery callbacks code.</span></li><li style=\"margin: 0px 0px 0px 20px; word-wrap: break-word;\"><span style=\"font-size: 14px; color: rgb(99, 99, 99);\">Learn how to achieve reactivity and easily compose views with Vue.js and understand what it does behind the scenes.</span></li><li style=\"margin: 0px 0px 0px 20px; word-wrap: break-word;\"><span style=\"font-size: 14px; color: rgb(99, 99, 99);\">Explore the core features of Vue.js with small examples, learn how to build dynamic content into&nbsp;</span></li></ul></div>', '学习 Vue.js 2', '<div><br></div><div><span style=\"color: rgb(99, 99, 99); font-size: 18px;\">学习如何使用Vue.js轻松构建令人惊叹的复杂反应式Web应用程序。</span></div><div><span style=\"color: rgb(99, 99, 99); font-size: 18px;\"><br></span></div><div><span style=\"color: rgb(99, 99, 99); font-size: 18px;\">关于本书</span></div><div><span style=\"color: rgb(99, 99, 99); font-size: 18px;\">了解如何在整个网站中传播DOM更改，而无需编写大量的jQuery回调代码。</span></div><div><span style=\"color: rgb(99, 99, 99); font-size: 18px;\">学习如何实现反应性，并轻松使用Vue.js撰写视图并理解它在幕后做了什么。</span></div><div><span style=\"color: rgb(99, 99, 99); font-size: 18px;\">通过小例子探索Vue.js的核心功能，学习如何构建动态内容</span></div>', 'Изучаем Vue.js 2', '<div><br></div><div><span style=\"color: rgb(99, 99, 99); font-size: 18px;\">Узнайте, как легко создавать удивительные и сложные реактивные веб-приложения с Vue.js.</span></div><div><span style=\"color: rgb(99, 99, 99); font-size: 18px;\"><br></span></div><div><span style=\"color: rgb(99, 99, 99); font-size: 18px; font-weight: bold;\">Об этой книге</span></div><div><span style=\"color: rgb(99, 99, 99); font-size: 18px;\">Вы узнаете, как распространять изменения DOM на веб-сайте без написания обширного кода обратных вызовов jQuery.</span></div><div><span style=\"color: rgb(99, 99, 99); font-size: 18px;\">Вы узнаете</span><span style=\"color: rgb(99, 99, 99); font-size: 18px;\">, как достичь реактивности и легко составить представления с Vue.js и понять, что он делает за кулисами.</span></div><div><span style=\"color: rgb(99, 99, 99); font-size: 18px;\">Изучите основные функции Vue.js с небольшими примерами, узнаете, как создавать динамический контент.</span></div>', 'Lernen Vue.js 2', '<div><br></div><div><span style=\"color: rgb(99, 99, 99); font-size: 18px;\">Erfahren Sie, wie Sie erstaunliche und komplexe reaktive Web-Anwendungen einfach mit Vue.js erstellen können.</span></div><div><span style=\"color: rgb(99, 99, 99); font-size: 18px;\"><br></span></div><div><span style=\"color: rgb(99, 99, 99); font-size: 18px; font-weight: bold;\">Über das Buch</span></div><div><span style=\"color: rgb(99, 99, 99); font-size: 18px;\">Erfahren Sie, wie Sie DOM-Änderungen über die Website verbreiten können, ohne umfangreichen jQuery-Callback-Code schreiben zu müssen.</span></div><div><span style=\"color: rgb(99, 99, 99); font-size: 18px;\">Erfahren Sie, wie Sie mit Vue.js Reaktivität erzielen und Ansichten erstellen können und was hinter den Kulissen passiert.</span></div><div><span style=\"color: rgb(99, 99, 99); font-size: 18px;\">Erforschen Sie die Kernfunktionen von Vue.js mit kleinen Beispielen und lernen Sie, wie man dynamische Inhalte erstellt</span></div>'),
(10, '2018-04-10 04:43:54', 1, 1, 'Vue JS 2 Tutorial', '<div><span style=\"font-size: 16px; font-family: &quot;arial black&quot;, sans-serif; color: rgb(99, 99, 99);\"><br></span></div><span style=\"font-size: 16px; font-family: &quot;arial black&quot;, sans-serif; color: rgb(99, 99, 99);\">44 Video lessons.</span><div><br></div><div><a href=\"https://www.youtube.com/watch?v=5LYrN_cAJoA&amp;list=PL4cUxeGkcC9gQcYgjhBoeQH7wiAyZNrYa\">Watch here</a><br></div><div><br></div>', 'Vue JS 2 教程', '<div><span style=\"color: rgb(99, 99, 99); font-family: &quot;arial black&quot;, sans-serif;\"><br></span></div><span style=\"color: rgb(99, 99, 99); font-family: &quot;arial black&quot;, sans-serif;\">44个视频课程。</span><br><div><br></div><div><a href=\"https://www.youtube.com/watch?v=5LYrN_cAJoA&amp;list=PL4cUxeGkcC9gQcYgjhBoeQH7wiAyZNrYa\">Watch here</a><br></div><div><br></div>', 'Руководство Vue JS 2', '<div><span style=\"font-size: 16px; font-family: &quot;arial black&quot;, sans-serif; color: rgb(99, 99, 99);\"><br></span></div><span style=\"font-size: 16px; font-family: &quot;arial black&quot;, sans-serif; color: rgb(99, 99, 99);\">44 Видео урока.</span><div><br></div><div><a href=\"https://www.youtube.com/watch?v=5LYrN_cAJoA&amp;list=PL4cUxeGkcC9gQcYgjhBoeQH7wiAyZNrYa\">Watch here</a><br></div><div><br></div>', 'Vue JS 2 Tutorial', '<div><span style=\"color: rgb(99, 99, 99); font-family: &quot;arial black&quot;, sans-serif;\"><br></span></div><span style=\"color: rgb(99, 99, 99); font-family: &quot;arial black&quot;, sans-serif;\">44 Videolektionen.</span><br><div><br></div><div><a href=\"https://www.youtube.com/watch?v=5LYrN_cAJoA&amp;list=PL4cUxeGkcC9gQcYgjhBoeQH7wiAyZNrYa\">Watch here</a><br></div><div><br></div>');
INSERT INTO `posts` (`id`, `dt`, `ispub`, `usrid`, `title_en`, `txt_en`, `title_zh`, `txt_zh`, `title_ru`, `txt_ru`, `title_de`, `txt_de`) VALUES
(11, '2018-04-11 04:54:46', 1, 1, 'Vue.js 2.0 In 60 Minutes', '<div><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background: rgb(255, 255, 255); max-height: 4.8rem; overflow: hidden; font-weight: 400; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"font-family: &quot;arial black&quot;, sans-serif; color: rgb(66, 66, 66);\"><span style=\"font-size: 16px;\"><br></span></span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background: rgb(255, 255, 255); max-height: 4.8rem; overflow: hidden; font-weight: 400; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"font-family: &quot;arial black&quot;, sans-serif; color: rgb(66, 66, 66);\"><span style=\"font-size: 16px;\">In this crash course we will cover all of the fundamentals of the Vue.js 2.0 JavaScript framework.</span><span style=\"font-size: var(--ytd-video-primary-info-renderer-title-font-size, 1.8rem);\">&nbsp;</span></span></h1></div><div><ul><li><span style=\"color: rgb(66, 66, 66);\">Vue-cli</span></li><li><span style=\"color: rgb(66, 66, 66);\">Declarative Rendering</span></li><li><span style=\"color: rgb(66, 66, 66);\">Directives</span></li><li><span style=\"color: rgb(66, 66, 66);\">Conditionals &amp; Loops</span></li><li><span style=\"color: rgb(66, 66, 66);\">Events &amp; Input</span></li><li><span style=\"color: rgb(66, 66, 66);\">Templates</span></li><li><span style=\"color: rgb(66, 66, 66);\">Components</span></li><li><span style=\"color: rgb(66, 66, 66);\">Properties</span></li><li><span style=\"color: rgb(66, 66, 66);\">vue-router</span></li><li><span style=\"color: rgb(66, 66, 66);\">vue-resource</span></li></ul></div><div><br></div><div><a href=\"https://www.youtube.com/watch?v=z6hQqgvGI4Y\">Watch here</a></div>', 'Vue.js 2.0 在60分钟内', '<div><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background: rgb(255, 255, 255); max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"color: rgb(66, 66, 66); font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; font-weight: 400;\"><br></span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background: rgb(255, 255, 255); max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"color: rgb(66, 66, 66); font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; font-weight: 400;\">在这个速成教程中，我们将介绍Vue.js 2.0 JavaScript框架的所有基础知识。</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background: rgb(255, 255, 255); max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"color: rgb(66, 66, 66); font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; font-weight: 400;\"><br></span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background: rgb(255, 255, 255); max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"color: rgb(66, 66, 66); font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; font-weight: 400;\">- Vue公司-CLI</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background: rgb(255, 255, 255); max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\">-<span style=\"color: rgb(66, 66, 66); font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; font-weight: 400;\">&nbsp;</span><span style=\"color: rgb(66, 66, 66); font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; font-weight: 400;\">声明式渲染</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background: rgb(255, 255, 255); max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\">-<span style=\"color: rgb(66, 66, 66); font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; font-weight: 400;\">&nbsp;</span><span style=\"color: rgb(66, 66, 66); font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; font-weight: 400;\">指令</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background: rgb(255, 255, 255); max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\">-<span style=\"color: rgb(66, 66, 66); font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; font-weight: 400;\">&nbsp;</span><span style=\"color: rgb(66, 66, 66); font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; font-weight: 400;\">条件与循环</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background: rgb(255, 255, 255); max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\">-<span style=\"color: rgb(66, 66, 66); font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; font-weight: 400;\">&nbsp;</span><span style=\"color: rgb(66, 66, 66); font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; font-weight: 400;\">活动和输入</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background: rgb(255, 255, 255); max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\">-<span style=\"color: rgb(66, 66, 66); font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; font-weight: 400;\">&nbsp;</span><span style=\"color: rgb(66, 66, 66); font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; font-weight: 400;\">模板</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background: rgb(255, 255, 255); max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\">-<span style=\"color: rgb(66, 66, 66); font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; font-weight: 400;\">&nbsp;</span><span style=\"color: rgb(66, 66, 66); font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; font-weight: 400;\">组件</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background: rgb(255, 255, 255); max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\">-<span style=\"color: rgb(66, 66, 66); font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; font-weight: 400;\">&nbsp;</span><span style=\"color: rgb(66, 66, 66); font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; font-weight: 400;\">属性</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background: rgb(255, 255, 255); max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\">-<span style=\"color: rgb(66, 66, 66); font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; font-weight: 400;\">&nbsp;</span><span style=\"color: rgb(66, 66, 66); font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; font-weight: 400;\">VUE路由器</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background: rgb(255, 255, 255); max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background: rgb(255, 255, 255); max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\">-<span style=\"color: rgb(66, 66, 66); font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; font-weight: 400;\">&nbsp;</span><span style=\"color: rgb(66, 66, 66); font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; font-weight: 400;\">VUE资源</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background: rgb(255, 255, 255); max-height: 4.8rem; overflow: hidden; font-weight: 400; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><br></h1></div><div><a href=\"https://www.youtube.com/watch?v=z6hQqgvGI4Y\">Watch here</a><br></div>', 'Vue.js 2.0 за 60 минут', '<div><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background: rgb(255, 255, 255); max-height: 4.8rem; overflow: hidden; font-weight: 400; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><br></h1></div><div><span style=\"font-size: 16px; font-weight: bold; color: rgb(66, 66, 66);\">В этом круговом курсе мы рассмотрим все основы JavaScript-среды Vue.js 2.0.</span></div><div><ul><li><span style=\"color: rgb(66, 66, 66);\">Vue-cli</span></li><li><span style=\"color: rgb(66, 66, 66);\">Declarative Rendering</span></li><li><span style=\"color: rgb(66, 66, 66);\">Directives</span></li><li><span style=\"color: rgb(66, 66, 66);\">Conditionals &amp; Loops</span></li><li><span style=\"color: rgb(66, 66, 66);\">Events &amp; Input</span></li><li><span style=\"color: rgb(66, 66, 66);\">Templates</span></li><li><span style=\"color: rgb(66, 66, 66);\">Components</span></li><li><span style=\"color: rgb(66, 66, 66);\">Properties</span></li><li><span style=\"color: rgb(66, 66, 66);\">vue-router</span></li><li><span style=\"color: rgb(66, 66, 66);\">vue-resource</span></li></ul></div><div><br></div><div><a href=\"https://www.youtube.com/watch?v=z6hQqgvGI4Y\">Watch here</a></div>', 'Vue.js 2.0 in 60 Minuten', '<div><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background: rgb(255, 255, 255); max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"color: rgb(66, 66, 66); font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; font-weight: 400;\"><br></span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background: rgb(255, 255, 255); max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"font-weight: 400; font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; color: rgb(66, 66, 66);\">In diesem Crashkurs werden wir alle Grundlagen des JavaScript-Frameworks Vue.js 2.0 behandeln.</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; color: rgb(66, 66, 66);\">- Vue-cli</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; color: rgb(66, 66, 66);\">- Deklaratives Rendern</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; color: rgb(66, 66, 66);\">- Richtlinien</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; color: rgb(66, 66, 66);\">- Bedingungen und Loops</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; color: rgb(66, 66, 66);\">- Ereignisse und Eingaben</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; color: rgb(66, 66, 66);\">- Vorlagen</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; color: rgb(66, 66, 66);\">- Komponenten</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; color: rgb(66, 66, 66);\">- Eigenschaften</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; color: rgb(66, 66, 66);\">- Vue-Router</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"font-family: &quot;arial black&quot;, sans-serif; font-size: 16px; color: rgb(66, 66, 66);\">- Vue-Ressource</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background: rgb(255, 255, 255); max-height: 4.8rem; overflow: hidden; font-weight: 400; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><br></h1></div><div><a href=\"https://www.youtube.com/watch?v=z6hQqgvGI4Y\">Watch here</a></div>'),
(12, '2018-04-10 05:01:20', 1, 1, 'CRUD with Vue JS', '<h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"font-size: 14px; font-family: &quot;arial black&quot;, sans-serif; color: rgb(66, 66, 66);\"><br></span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"font-size: 14px; font-family: &quot;arial black&quot;, sans-serif; color: rgb(66, 66, 66);\">This video demonstrates how to insert, delete, update data using vue js.&nbsp;</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"font-size: 14px; font-family: &quot;arial black&quot;, sans-serif; color: rgb(66, 66, 66);\">Source Code :&nbsp;&nbsp;<a href=\"http://ow.ly/Vyh7E\">http://ow.ly/Vyh7E</a></span></h1><div><a href=\"https://www.youtube.com/watch?v=qA5PlSh1Qq8\" style=\"font-family: &quot;arial black&quot;, sans-serif; font-size: 14px;\">Watch here</a></div>', 'CRUD with Vue JS', '<h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"font-size: 16px;\"><br></span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"font-size: 16px; color: rgb(66, 66, 66);\">本视频演示了如何使用vue js插入，删除和更新数据。</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"font-size: 16px; color: rgb(66, 66, 66);\">源代码 :</span>&nbsp;&nbsp;<a href=\"http://ow.ly/Vyh7E\" style=\"font-family: &quot;arial black&quot;, sans-serif; font-size: 14px;\">http://ow.ly/Vyh7E</a></h1><div><div><a href=\"https://www.youtube.com/watch?v=qA5PlSh1Qq8\" style=\"font-family: &quot;arial black&quot;, sans-serif; font-size: 14px;\">在这里观看</a></div></div>', 'CRUD на Vue JS', '<h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"font-size: 14px; font-family: &quot;arial black&quot;, sans-serif; color: rgb(66, 66, 66);\"><br></span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"font-size: 16px; color: rgb(66, 66, 66);\">Это видео демонстрирует, как вставлять, удалять и обновлять данные с помощью vue js.</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"font-size: 16px; color: rgb(66, 66, 66);\">Исходный код:&nbsp;</span><a href=\"http://ow.ly/Vyh7E\" style=\"font-family: &quot;arial black&quot;, sans-serif; font-size: 14px;\">http://ow.ly/Vyh7E</a></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><div style=\"font-size: medium; font-weight: 400;\"><a href=\"https://www.youtube.com/watch?v=qA5PlSh1Qq8\" style=\"font-family: &quot;arial black&quot;, sans-serif; font-size: 14px;\">Watch here</a></div></h1>', 'CRUD with Vue JS', '<h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"font-size: 16px;\"><br></span></h1><div><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"color: rgb(66, 66, 66); font-family: &quot;arial black&quot;, sans-serif; font-size: 14px;\">Dieses Video zeigt, wie Daten mit Hilfe von vue js eingefügt, gelöscht oder aktualisiert werden.</span></h1><h1 class=\"title style-scope ytd-video-primary-info-renderer\" style=\"margin: 0px; padding: 0px; border: 0px; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; max-height: 4.8rem; overflow: hidden; line-height: 2.4rem; transform: var(--ytd-video-primary-info-renderer-title-transform, none); text-shadow: var(--ytd-video-primary-info-renderer-title-text-shadow, none);\"><span style=\"color: rgb(66, 66, 66); font-family: &quot;arial black&quot;, sans-serif; font-size: 14px;\">Quellcode:</span>&nbsp;<a href=\"http://ow.ly/Vyh7E\" style=\"font-family: &quot;arial black&quot;, sans-serif; font-size: 14px;\">http://ow.ly/Vyh7E</a></h1><div><a href=\"https://www.youtube.com/watch?v=qA5PlSh1Qq8\" style=\"font-family: &quot;arial black&quot;, sans-serif; font-size: 14px;\">Watch here</a></div></div>');

-- --------------------------------------------------------

--
-- Структура таблицы `rss`
--

CREATE TABLE `rss` (
  `id` int(11) NOT NULL,
  `title` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `link` text DEFAULT NULL,
  `language` char(10) DEFAULT NULL,
  `copyright` text DEFAULT NULL,
  `mngeditor` text DEFAULT NULL,
  `pubdate` datetime DEFAULT NULL,
  `lastbuilddt` datetime DEFAULT NULL,
  `category` text DEFAULT NULL,
  `image` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `rss`
--

INSERT INTO `rss` (`id`, `title`, `description`, `link`, `language`, `copyright`, `mngeditor`, `pubdate`, `lastbuilddt`, `category`, `image`) VALUES
(1, 'Documentations', 'Vue.js documentations', '', 'en', '', '', '2018-04-09 09:44:15', '2018-04-09 09:44:15', '2', ''),
(2, 'Lessons', ' Vue-Lessons-Youtube.com', '', 'en', '', '', '2018-04-09 09:44:38', '2018-04-09 09:44:38', '1', ''),
(3, 'Projects', 'Vue.js - Projects', '', 'en', '', '', '2018-04-09 09:45:00', '2018-04-09 09:45:00', '3', '');

-- --------------------------------------------------------

--
-- Структура таблицы `settings`
--

CREATE TABLE `settings` (
  `kee` char(50) DEFAULT NULL,
  `vaa` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Дамп данных таблицы `settings`
--

INSERT INTO `settings` (`kee`, `vaa`) VALUES
('SITE_TITLE', 'Vuepress blog'),
('KEYWORDS', 'vuepress learn vue.js cms blog'),
('DESCRIPTION', 'Learn Vue.js'),
('LANGS_SHOW_SWITCHER', 'true'),
('LOGIN_SWITCHER', 'true'),
('ANONYMOUS_ACCESS', 'true'),
('SHOW_POST_DATE', 'true'),
('REGISTRATION_SWITCHER', 'true'),
('COMMENTS_ENABLE', 'true'),
('ANONYMOUS_COMMENTS', 'true'),
('RECAPCHA_COMMENTS', 'false'),
('CATEGORIES_ENABLE', 'true'),
('CATEGORIES_TREE_LPANEL', 'true'),
('RSS_ENABLE', 'true'),
('RECAPCHA_PUBLIC_KEY', '6LfEFEoUAAAAAEHGZgaM91GDzfci7eRwdjE4hbex'),
('RECAPCHA_PRIVATE_KEY', '6LfEFEoUAAAAACJeWjVJe2o5Qs9DutEjuMto3De4'),
('DEF_PRIVLGS', '511');

-- --------------------------------------------------------

--
-- Структура таблицы `tokens`
--

CREATE TABLE `tokens` (
  `id` int(11) NOT NULL,
  `usrid` int(11) DEFAULT NULL,
  `at` text DEFAULT NULL,
  `rt` text DEFAULT NULL,
  `devid` text DEFAULT NULL,
  `at_dt` int(16) DEFAULT NULL,
  `rt_dt` int(16) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` char(255) DEFAULT NULL,
  `pass` char(255) DEFAULT NULL,
  `fname` char(255) DEFAULT NULL,
  `mname` char(255) DEFAULT NULL,
  `lname` char(255) DEFAULT NULL,
  `nick` char(25) DEFAULT NULL,
  `phone` char(255) DEFAULT NULL,
  `urlacpt` char(255) DEFAULT NULL,
  `acptd` int(1) DEFAULT NULL,
  `icon` char(20) DEFAULT NULL,
  `site` char(255) DEFAULT NULL,
  `dt` datetime DEFAULT NULL,
  `privlgs` int(8) DEFAULT NULL,
  `resetacpt` char(255) DEFAULT NULL,
  `resetid` char(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `cat_post_sv`
--
ALTER TABLE `cat_post_sv`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `cat_usrflds`
--
ALTER TABLE `cat_usrflds`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `files`
--
ALTER TABLE `files`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `lang`
--
ALTER TABLE `lang`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `rss`
--
ALTER TABLE `rss`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `tokens`
--
ALTER TABLE `tokens`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `category`
--
ALTER TABLE `category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT для таблицы `cat_post_sv`
--
ALTER TABLE `cat_post_sv`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT для таблицы `cat_usrflds`
--
ALTER TABLE `cat_usrflds`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT для таблицы `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `files`
--
ALTER TABLE `files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `lang`
--
ALTER TABLE `lang`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT для таблицы `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT для таблицы `rss`
--
ALTER TABLE `rss`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT для таблицы `tokens`
--
ALTER TABLE `tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
