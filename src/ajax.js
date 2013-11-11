define([
    "./deferred"
], function (mjp) {
    function buildParams(prefix, obj, traditional, add ) { // Borrowed from jQuery
        var name;

        if ( Array.isArray( obj ) ) {
            // Serialize array item.
            mjp(obj).each(function( i, v ) {
                if ( traditional || /\[\]$/.test( prefix ) ) {
                    // Treat each array item as a scalar.
                    add( prefix, v );
                } else {
                    // Item is non-scalar (array or object), encode its numeric index.
                    buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
                }
            });
        } else if ( !traditional && typeof obj === "object" ) {
            // Serialize object item.
            for ( name in obj ) {
                buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
            }
        } else {
            // Serialize scalar item.
            add( prefix, obj );
        }
    }

    mjp.extend(mjp, {
        // Defaults
        ajaxSettings : {
            async: true,
            // beforeSend
            cache: true,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            crossDomain: false,
            // data
            dataType: "json",
            headers: {},
            jsonp: "callback",
            // jsonpCallback
            // password
            processData: true,
            statusCode: {},
            type: "GET",
            // username
            // url
            xhr: function () {
                try{
                    return new XMLHttpRequest();
                } catch(e) {}
            }
        }
    });
    //cors = ("withCredentials" in getXHR() || XDomainRequest);

    mjp.ajaxSetup = function(options) {
        mjp.extend(mjp.ajaxSettings, options);
    };

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
                } // default handles 'text'
                sCode[200] && sCode[200](data, xhr.statusText, xhr);
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
                url += (/\?/.type(url) ? "&" : "?") + opts.data;
                opts.data = null;
            } else {
                // Set headers
                opts.headers["Content-Type"] = opts.contentType;
            }
        }

        // Override mime type for XML (just in case)
        opts.dataType === "xml" && xhr.overrideMimeType("text/xml");

        xhr.open(opts.type, url, opts.async, opts.username, opts.password);
        setHeaders(xhr, opts.headers);
        return xhr;
    }

    function createScript(url, opts, deferred) {
        var script = document.createElement("script");
        if (url && opts && deferred) {
            return script;
        }
    }

    mjp.ajax = function (url, settings) {
        var opts = {},
            deferred = mjp.Deferred(),
            request;

        if (!settings) { settings = url; }

        opts = mjp.extend(opts, mjp.ajaxSettings, settings);

        opts.success && deferred.done(opts.success);
        opts.error && deferred.fail(opts.error);
        opts.complete && deferred.always(opts.complete);

        // Build XHR and execute it
        if (opts.crossDomain || opts.dataType === "jsonp") {
            request = createScript(url, opts, deferred);
        } else {
            request = createXHR(url, opts, deferred);
        }
        if (!opts.beforeSend || opts.beforeSend(request, opts)) {
            if (opts.timeout) {
                setTimeout(function () {
                    if (deferred.state() === "pending") {
                        request.abort();
                        deferred.reject(request, "timeout");
                    }
                }, opts.timeout);
            }
            request.send(opts.data);  // data can be null which is fine
        } else { // Cancel the request
            request.abort();
            deferred.reject(request, "timeout");
        }
        return deferred.promise(request);
    };

    // Call methods .get, .getJSON and .post
    function createCall(settings) {
        return function (url, data, success, type) {
            // shift arguments when there's no data
            if (mjp.isFunction(data)) {
                type = type || success;
                success = data;
                data = undefined;
            }
            var opts = {
                data: data,
                url: url,
                success: success,
                dataType: type || mjp.ajaxSettings.dataType
            };
            return mjp.ajax(url, mjp.extend(opts, settings));
        };
    }

    // Attach methods that go on mjp itself
    mjp.extend(mjp, {
        get: createCall({}),
        getJSON: createCall({dataType: "json"}),
        post: createCall({type: "POST"}),
        //getScript: createCall({dataType: "script"}),

        // Helpers
        param : function (obj, traditional) { // Borrowed from jQuery
            var prefix,
                s = [],
                add = function( key, value ) {
                    // If value is a function, invoke it and return its value
                    value = typeof value === "function" ? value() : ( value == null ? "" : value );
                    s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
                };

            // Set traditional to true for jQuery <= 1.3.2 behavior.
            if ( traditional === undefined ) {
                traditional = mjp.ajaxSettings && mjp.ajaxSettings.traditional;
            }

            // If an array was passed in, assume that it is an array of form elements.
            if (Array.isArray(obj)) {
                // Serialize the form elements
                mjp(obj).each(function(i, el) {
                    add( el.name, el.value );
                });
            } else {
                // If traditional, encode the "old" way (the way 1.3.2 or older
                // did it), otherwise encode params recursively.
                for ( prefix in obj ) {
                    buildParams( prefix, obj[ prefix ], traditional, add );
                }
            }

            // Return the resulting serialization
            return s.join( "&" ).replace( /%20/g, "+" );
        }
    });


    // Methods that belong on mjp objects
    mjp.extend(mjp.fn, {
        load: function (url, data, complete) {
            var self = this;
            if (self.length) {
                mjp.get(url, data, complete || function (value) {
                    if (value.length) {
                        self.each(function (i, el) {
                            el.appendChild(value[0]);
                        });
                    }
                }, "html");
            }
            return self;
        }
    });

    return mjp;
});
