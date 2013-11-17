define([
    "../events",
    "../utils/addToUrl"
], function (mjp, addToUrl) {
    function removeNode(node) {
        node.parentNode.removeChild(node);
    }

    function createScript(url, opts, deferred) {
        var script = document.createElement("script"),
            jqXHR,
            callback;
        script.async = true;

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
                    removeNode(script);
                    callback = null;
                    if (e) {
                        if (e.type === "load") {
                            deferred.resolve("", "OK", jqXHR);
                        } else { // Error
                            deferred.reject("error", jqXHR);
                        }
                    }
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
