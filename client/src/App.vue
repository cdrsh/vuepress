<template>
  <div id="app" class="app-bg">
    <router-view/>
  </div>
</template>

<script>
export default {
    name: "app",

    mounted: function() {
        //Languages and settings load
        Promise.all([
            this.$store.dispatch("loadLangs"),
            this.$store.dispatch("loadSettings")
        ]).then(() => {});
    }
};
</script>

<style>
/* material icons offline */
@font-face {
    font-family: "Material Icons";
    font-style: normal;
    font-weight: 400;
    src: url(/static/material-icons.woff2) format("woff2");
}
.material-icons {
    font-family: "Material Icons";
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-feature-settings: "liga";
    -webkit-font-smoothing: antialiased;
}

.app-bg {
    background: #f5f5dc url("/static/fon.png") repeat-y;
    background-size: cover;
}
</style>
