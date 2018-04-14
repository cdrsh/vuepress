<template>
  <div>
    <div class="md-toolbar-container">
      <md-toolbar>
        <md-menu md-close-on-select>
            <md-button md-menu-trigger class="md-icon-button">
            <md-icon>menu</md-icon>
            </md-button>

            <md-menu-content style="width:100%;">
            <md-menu-item
                manual-highlight
                v-for="itm in $store.getters.getLpanelItems"
                :key="itm.path"
                v-on:click="goto(itm.path)"
                :class="{'active-cls':
                ( $route.fullPath==itm.path || 
                ( $route.fullPath=='/admin' && itm.path=='/admin/dashboard'))}"
            >
                <md-icon class="md-primary" :title="$t(itm.title)">
                    {{itm.icon}}
                </md-icon>
                <span class="md-primary">{{$t(itm.title)}}</span>
            </md-menu-item>
          </md-menu-content>
        </md-menu>

        <h2 class="md-title" style="flex: 1">
            {{$t($store.getters.getLPanelName($route.fullPath))}}
        </h2>

        <md-button class="md-icon-button" @click="logout">
          <md-icon>exit_to_app</md-icon>
        </md-button>
      </md-toolbar>
    </div>

    <lpanel></lpanel>
    <cpanel class="pr10"></cpanel>
  </div>
</template>


<script>
var store = require("store");
import ru from "../../node_modules/vee-validate/dist/locale/ru";
import en from "../../node_modules/vee-validate/dist/locale/en";
import de from "../../node_modules/vee-validate/dist/locale/de";
import zh from "../../node_modules/vee-validate/dist/locale/zh_CN";
import VeeValidate, { Validator } from "vee-validate";

export default {
    name: "MainPage",
    data() {
        return {};
    },

    methods: {
        //Mobile navigate by routes
        goto: function(path) {
            this.$router.push(path);
        },

        //Logout
        logout: function() {
            this.$store.dispatch("logout", { r: this.$router });
        }
    },

    beforeCreate: function() {
        //Load active language form localStorage
        let code = store.get("curlang");
        if (code !== undefined) {
            this.$i18n.locale = code;
            this.$store.dispatch("setCurrentLang", code);

            let lng = en;
            if (code == "ru") lng = ru;
            if (code == "de") lng = de;
            if (code == "zh") lng = zh;
            Validator.localize(code, lng);
        }
        else
            store.set("en");
    }
};
</script>
