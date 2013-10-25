define([
    "./core",
    "./classes",
    "./events",
    "./deferred"
], function (mjp) {
    return (window.mjp = window.$ = mjp);
});
