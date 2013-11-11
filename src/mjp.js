define([
    "./core",
    "./classes",
    "./events",
    "./deferred",
    "./ajax",
    "./ajaxplus"
], function (mjp) {
    return (window.mjp = window.$ = mjp);
});
