define([
    "../events",
    "../utils/addToUrl"
], function (mjp, addToUrl) {
    function removeNode(node) {
        node.parentNode.removeChild(node);
    }

    function createScript(url, opts, deferred) {
        var script = document.createElement("script"),
            jqXHR, callbackName, callback, responseContainer;

        script.async = true;

        callbackName = mjp.isFunction(opts.jsonpCallback) ? opts.jsonpCallback() : opts.jsonpCallback;

        url = addToUrl(url, opts.jsonp + "=" + callbackName);

        jqXHR = {
            abort: function () {
                script.src = "#";
                if (callback) {
                    callback();
                }
                deferred.reject("abort");
            },
            send: function (data) {
                callback = function (e) {
                    callback = null;
                    removeNode(script);
                    window[callbackName] = null;
                    if (e) {
                        if (e.type === "load") {
                            deferred.resolve(responseContainer, "OK", jqXHR);
                        } else { // Error
                            deferred.reject("error", jqXHR);
                        }
                    }
                };

                // Install callback
                window[callbackName] = function () {
                    var args = arguments;
                    responseContainer = (args && args[0]) || {};
                };

                // Serialize data it if it isn't yet
                if (typeof data !== "string") {
                    data = mjp.param(data, opts.traditional);
                }
                url = addToUrl(url, data);

                mjp(script).on("load", callback)
                           .on("error", callback);
                script.src = url;
                document.head.appendChild(script);
            }
        };
        return jqXHR;
    }

    return createScript;

});
