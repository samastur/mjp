define(function () {
    function _forEach(func) {
        var l = this.length || 0, i = 0, rtn = null, prop = null;
        if (this.length !== undefined) {
            for(;i<l;i++) {
                rtn = func(i, this[i]);
                if (rtn === false) { // Break out on false
                    break;
                }
            }
        } else { // Object
            for(prop in this) {
                if (this.hasOwnProperty(prop)) {
                    rtn = func(i, this[prop]);
                    if (rtn === false) { // Break out on false
                        break;
                    }
                }
                i++;
            }
        }
        return this;
    }

    function extend() {
        var target = arguments[0], obj = null, i=1, k;
        for(; i<arguments.length; i++) {
            obj = arguments[i];
            for(k in obj) {
                if (obj.hasOwnProperty(k) && obj[k] !== null && obj[k] !== undefined) {
                    target[k] = obj[k];
                }
            }
        }
        return target;
    }

    function trim(txt) {
        var trimLeft = /^[\s\xA0]+/,
            trimRight = /[\s\xA0]+$/;
        return txt == null ?
            "" :
            txt.trim ?
                txt.trim() :
                txt.toString().replace(trimLeft, "").replace(trimRight, "");
    }

    function makeArray(obj) {
        // .slice.call() makes an array from array-like object
        return [].slice.call(obj);
    }

    // HTML "templating"
    function innerHTML(template) {
        var div = document.createElement("div");
        div.innerHTML = template;
        return makeArray(div.childNodes);
    }

    var fn = {
            mjp: "v0.8.0",

            each: _forEach,

            map: function (callback) {
                var mapped = [];
                this.each(function (i, el) {
                    mapped = mapped.concat(callback(i, el));
                });
                return mjp(mapped);
            },

            filter: function (callback) {
                var filtered = [];
                this.each(function (i, el) {
                    callback(i, el) && filtered.push(el);
                });
                return mjp(filtered);
            },

            html: function (value) {
                if (typeof value === "string") {
                    this.each(function (i, el) {
                        el.innerHTML = value;
                    });
                    return this;
                } else {
                    return this.length ? this[0].innerHTML : "";
                }
            }
        },

        // Main
        mjp = function (sel, context) {
            var raw_nodes = [], nodes = [],
                root = context || document,
                sel_type = typeof sel;

            if (sel_type === "string") {
                if (sel.slice(0, 1) === "<") {
                    nodes = innerHTML(sel);
                } else if (sel.indexOf(",") > -1) { // Multiple selectors
                    // TODO: write test
                    sel = sel.split(",");
                    for(var i=0;i<sel.length;i++) {
                        nodes = nodes.concat(makeArray(
                                    root.querySelectorAll(trim(sel[i]))));
                    }
                } else {
                    raw_nodes = root.querySelectorAll(sel);
                }
            } else if (sel_type === "object") {
                if (sel.length !== undefined) {
                    if (Array.isArray(sel)) {
                        nodes = sel;
                    } else {
                        raw_nodes = sel;
                    }
                } else {
                    nodes = [sel];
                }
            }
            if (raw_nodes.length) {
                raw_nodes.forEach = _forEach;
                raw_nodes.forEach(function (i, node) {
                    nodes.push(node);
                });
            }
            // Add useful methods (TODO: create extend object method)
            extend(nodes, mjp.fn);
            return nodes;
        };

    mjp.extend = extend;

    mjp.extend(mjp, {
        fn: fn,
        trim: trim,
        isFunction: function (obj) { return typeof obj === "function"; },
        isArray: function (obj) { return Array.isArray(obj); },
        makeArray: makeArray
    });

    return mjp;
});
