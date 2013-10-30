define([
    "./core",
    "./classes",
    "./events",
    "./deferred",
    "./ajax"
], function (mjp) {
    return (window.mjp = window.$ = mjp);
});
