define([
    "./core"
], function (mjp) {
    mjp.handlers = {};
    mjp.node_handlers = {};

    function normalizeEvent(e) {
        var ev = {originalEvent: e,
                  timeStamp: (new Date()).getTime()},
            copy = ["type", "clientX", "clientY", "altKey", "ctrlKey", "shiftKey"];

        mjp(e).each(function (i, attr) { ev[attr] = e[attr]; });
        mjp(copy).each(function (i, attr) { ev[attr] = e[attr]; });

        ev.currentTarget = this;
        ev.target = e.target || e.srcElement;
        ev.charCode = e.charCode || e.keyCode;
        ev.eventPhase = this === ev.target ? 2 : 3;
        ev.relatedTarget = e.relatedTarget || e.fromElement || e.toElement;

        if (!e.preventDefault) {
            e.stopPropagation = function () { this.cancelBubble = true; };
            e.preventDefault = function () { this.returnValue = false; };
        }
        return e;
    }

    function getHandlerId(db) {
        var id;
        while((id=Math.ceil(Math.random()*10000)) in db) {}
        return id;
    }

    function getNodeId(node) {
        var nid;
        if (!node.hasAttribute("mjp")) {
            nid = node.setAttribute("mjp", getHandlerId(mjp.node_handlers));
            mjp.node_handlers[nid] = {};
        }
        return node.getAttribute("mjp");
    }

    function saveNodeHandler(node, ev_type, handler) {
        getNodeId(node, ev_type, handler);
    }

    function wrapHandler(func) {
        var f = function (e) {
            var ev = normalizeEvent.call(this, e || window.event);
            return func.call(this, ev);
        };
        if (!func.mjp) {
            func.mjp = getHandlerId(mjp.handlers);
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
                saveNodeHandler(node, ev_type, handler);
                if (node.addEventListener) {
                    node.addEventListener(ev_type, wrapHandler(handler));
                } else {  // For IE8
                    node.attachEvent("on"+ev_type, wrapHandler(handler));
                }
            });
            return this;
        },

        off: function (ev_type, handler) {
            this.each(function (i, node) {
                if (node.removeEventListener) {
                    node.removeEventListener(ev_type, getHandler(handler));
                } else { // For IE8
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
