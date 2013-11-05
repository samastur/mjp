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

    mjp.ajax = function (url, settings) {
        var opts = {},
            deferred = mjp.Deferred(),
            xhr, data;

        if (!url) { settings = url; }

        opts = mjp.extend(opts, mjp.ajaxSettings, settings);

        opts.success && deferred.done(opts.success);
        opts.error && deferred.fail(opts.error);
        opts.complete && deferred.always(opts.complete);

        // Build XHR and execute it
        xhr = opts.xhr() || (new XMLHttpRequest());
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                xhrFinished(xhr, opts, deferred);
            }
        };
        data = opts.data || null;
        if (data) {
            if (typeof data !== "string" && !opts.processData) {
                data = mjp.param(data, opts.traditional);
            }
            // Attach to URL if GET or HEAD, otherwise add to send
            if (/^(?:GET|HEAD)$/.test(opts.type)) {
                url += (/\?/.type(url) ? "&" : "?") + data;
                data = null;
            } else {
                // Set headers
                opts.headers["Content-Type"] = opts.contentType;
            }
        }

        // Override mime type for XML (just in case)
        opts.dataType === "xml" && xhr.overrideMimeType("text/xml");

        xhr.open(opts.type, url, opts.async, opts.username, opts.password);
        setHeaders(xhr, opts.headers);
        if (!opts.beforeSend || opts.beforeSend(xhr, opts)) {
            if (opts.timeout) {
                setTimeout(function () {
                    if (deferred.state() === "pending") {
                        xhr.abort();
                        deferred.reject(xhr, "timeout");
                    }
                }, opts.timeout);
            }
            xhr.send(data);  // data can be null which is fine
        } else { // Cancel the request
            xhr.abort();
            deferred.reject(xhr, "timeout");
        }
        return deferred.promise(xhr);
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
        },

        // TODO: serialize & serializeArray add ~200 bytes to gzipped lib
        serialize: function() {
            return mjp.param( this.serializeArray() );
        },

        // Simplified jQuery version
        serializeArray: function() {
            var rCRLF = /\r?\n/g,
                rcheckableType = /^(?:checkbox|radio)$/i,
                rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
                rsubmittable = /^(?:input|select|textarea|keygen)/i;

            return this.map(function(i, el) {
                // If passed form element, then fetch its elements (form fields)
                return el.elements ? mjp.makeArray(el.elements) : this;
            })
            // Filter out disabled, unchecked and unselected
            .filter(function(i, el) {
                return el.name && !el.disabled &&
                    rsubmittable.test( el.nodeName ) &&
                    !rsubmitterTypes.test( el.type ) &&
                    ( el.checked || !rcheckableType.test( el.type ) );
            })
            // Grab values of the rest
            .map(function( i, elem ) {
                var val = elem.value;

                return val == null ?
                    null :
                    Array.isArray( val ) ?
                        mjp.map( val, function( val ) {
                            return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
                        }) :
                        { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
            });
        }
    });

    return mjp;
});
