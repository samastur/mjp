define([
    "./core"
], function (mjp) {
    mjp.handlers = {};

    function normalizeEvent(e) {
        return e;
    }

    function getHandlerId() {
        var id;
        while((id=Math.ceil(Math.random()*10000)) in mjp.handlers) {}
        return id;
    }

    function wrapHandler(func) {
        var f = function (e) {
            var ev = e || normalizeEvent(window.event);
            return func.call(this, ev);
        };
        if (!func.mjp) {
            func.mjp = getHandlerId();
            mjp.handlers[func.mjp] = f;
        }
        return mjp.handlers[func.mjp];
    }

    function getHandler(func) {
        return func.mjp ? mjp.handlers[func.mjp] : func;
    }

    // Event handlers
    mjp.extend(mjp.fn, {
        on: function(ev_type, handler) {
            this.each(function (i, node) {
                if (node.addEventListener) {
                    node.addEventListener(ev_type, wrapHandler(handler));
                } else if (node.attachEvent) {  // For IE8
                    node.attachEvent("on"+ev_type, wrapHandler(handler));
                }
            });
            return this;
        },

        off: function (ev_type, handler) {
            this.each(function (i, node) {
                if (node.removeEventListener) {
                    node.removeEventListener(ev_type, getHandler(handler));
                } else if (node.detachEvent) { // For IE8
                    node.detachEvent("on"+ev_type, getHandler(handler));
                }
            });
        },

        trigger: function (ev_type) {
            this.each(function (i, node) {
                node[ev_type] && node[ev_type]();
            });
        }
    });

    return mjp;
});
