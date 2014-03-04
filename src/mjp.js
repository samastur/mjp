define([
    "./core",
    "./classes",
    "./events",
    "./deferred",
    "./ajax",
    "./ajaxplus",
    "./manipulation"
], function (mjp) {
    return (window.mjp = window.$ = mjp);
});
