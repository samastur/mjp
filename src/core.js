define(function () {
    /*
     * MICRO JS LIB
     *
     * If you encounter a non-trivial bug, switch to jquip or jquery.
     * Otherwise fix it :)
     *
     */

    // Utils (.each...)
    function _forEach(func) {
        var l = this.length, i = 0, rtn = null;
        for(;i<l;i++) {
            rtn = func(i, this[i]);
            if (rtn === false) { // Break out on false
                break;
            }
        }
        return this;
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

    // Event handlers
    function on(ev_type, handler) { // For IE8
        this.each(function (i, node) {
            if (node.addEventListener) {
                node.addEventListener(ev_type, handler);
            } else if (node.attachEvent) {
                node.attachEvent("on"+ev_type, handler);
            }
        });
        return this;
    }

    // HTML "templating"
    function innerHTML(template) {
        var div = document.createElement("div");
        div.innerHTML = template;
        return div.removeChild(div.firstChild);
    }

    // class functions (addClass, hasClass, removeClass)
    function hasClass(value) {
        var has = false, cls = "";
        this.each(function(i, el) {
            cls = " "+el.className+" ";
            if (cls.search(" "+value+" ") > -1) {
                has = true;
                return false;
            }
        });
        return has;
    }

    function addClass(value) {
        this.each(function(i, el) {
            if (!mjp(el).hasClass(value)) {
                el.className = mjp.trim(el.className) + " "+value;
            }
        });
        return this;
    }

    function removeClass(value) {
        this.each(function(i, el) {
            var cls = " "+el.className+" ", new_cls = "";
            new_cls = cls.replace(" "+value+" ", "");
            if (new_cls !== cls) {
                el.className = mjp.trim(new_cls);
            }
        });
        return this;
    }

    // Main
    var mjp = function (sel, context) {
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
        nodes.each = _forEach;
        nodes.hasClass = hasClass;
        nodes.addClass = addClass;
        nodes.removeClass = removeClass;
        nodes.on = on;
        return nodes;
    };
    mjp.trim = trim;

    return mjp;
});
