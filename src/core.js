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

    // HTML "templating"
    function innerHTML(template) {
        var div = document.createElement("div");
        div.innerHTML = template;
        return div.removeChild(div.firstChild);
    }

    var fn = {
            each: _forEach,

            html: function (value) {
                if (value) {
                    this.each(function (i, el) {
                        el.innerHTML = value;
                    });
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
                    raw_nodes = [innerHTML(sel)];
                } else {
                    raw_nodes = root.querySelectorAll(sel);
                }
            } else if (sel_type === "object") {
                if (sel.length) {
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

    mjp.fn = fn;
    mjp.trim = trim;
    mjp.extend = extend;

    return mjp;
});
