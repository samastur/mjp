define([
    "../core",
    "../utils/addToUrl"
], function (mjp, addToUrl) {
    function setHeaders(xhr, headers) {
        var fullheaders = {"X-Requested-With": "XMLHttpRequest"};
        mjp.extend(fullheaders, headers);
        for(var prop in fullheaders) {
            if (fullheaders.hasOwnProperty(prop)) {
                xhr.setRequestHeader(prop, fullheaders[prop]);
            }
        }
    }

    function evalScript(code) {
        var scr = document.createElement("script");
        scr.text = mjp.trim(code);
        // Add and remove it to execute it
        document.head.appendChild(scr).parentNode.removeChild(scr);
    }

    function xhrFinished(xhr, opts, deferred) {
        var data,
            sCode = opts.statusCode;
        if (xhr.status === 200) {
            data = xhr.responseText;
            try {
                switch (opts.dataType) {
                    case "json":
                        data = JSON.parse(data);
                        break;
                    case "html":
                        data = mjp(data);
                        break;
                    case "script":
                        evalScript(data);
                        break;
                    case "xml":
                        data = xhr.responseXML;
                        break;
                } // default handles 'text'
                sCode["200"] && sCode["200"](data, xhr.statusText, xhr);
                deferred.resolve(data, xhr.statusText, xhr);
            } catch(e) {
                deferred.reject(xhr, "parsererror");
            }
        } else { // Failed
            sCode[xhr.status] && sCode[xhr.status](xhr, "error");
            deferred.reject(xhr, "error");
        }
    }

    function createXHR(url, opts, deferred) {
        var xhr = opts.xhr();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                xhrFinished(xhr, opts, deferred);
            }
        };
        opts.data || null;
        if (opts.data) {
            if (typeof opts.data !== "string" && !opts.processData) {
                opts.data = mjp.param(opts.data, opts.traditional);
            }
            // Attach to URL if GET or HEAD, otherwise add to send
            if (/^(?:GET|HEAD)$/.test(opts.type)) {
                url = addToUrl(url, opts.data);
                opts.data = null;
            } else {
                // Set headers
                opts.headers["Content-Type"] = opts.contentType;
            }
        }

        // Override mime type for XML (just in case)
        opts.dataType === "xml" && xhr.overrideMimeType("text/xml");

        // Set timeout if it exists
        if (opts.timeout) {
            xhr.timeout = opts.timeout;
        }

        xhr.open(opts.type, url, opts.async, opts.username, opts.password);
        setHeaders(xhr, opts.headers);
        return xhr;
    }

    return createXHR;
});
