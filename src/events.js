define([
    "./core"
], function (mjp) {
    mjp.handlers = {};
    mjp.nh = {};

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
            nid = getHandlerId(mjp.nh);
            node.setAttribute("mjp", nid);
            mjp.nh[nid] = {};
        }
        return node.getAttribute("mjp");
    }

    function saveNodeHandler(node, ev_type, func) {
        // mjp.nh are mapping of node's event handlers [node][event][handler]
        var nid = getNodeId(node);
        if (!mjp.nh[nid]) {
            mjp.nh[nid] = {};
        }
        if (!mjp.nh[nid][ev_type]) {
            mjp.nh[nid][ev_type] = {};
        }
        if (!mjp.nh[nid][ev_type][func.mjp]) {
            mjp.nh[nid][ev_type][func.mjp] = func;
        }
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
        /* Return wrapped function; if it has mjp attribute, then it
         * is original so fetch wrapper, otherwise it is wrapper ready
         * to be returned */
        return func.mjp ? mjp.handlers[func.mjp] : func;
    }

    function getObjKeys(obj) {
        var keys = [];
        for(var k in obj) {
            obj.hasOwnProperty(k) && keys.push(k);
        }
        return keys;
    }

    // Event handlers
    mjp.extend(mjp.fn, {
        on: function(ev_type, handler) {
            var wrapped = wrapHandler(handler);
            this.each(function (i, node) {
                if (node.addEventListener) {
                    node.addEventListener(ev_type, wrapped);
                } else {  // For IE8
                    node.attachEvent("on"+ev_type, wrapped);
                }
                saveNodeHandler(node, ev_type, handler);
            });
            return this;
        },

        off: function (ev_type, handler) {
            this.each(function (i, node) {
                var nid = getNodeId(node),
                    events = ev_type ? [ev_type] : getObjKeys(mjp.nh[nid]);
                mjp(events).each(function (j, ev_type) {
                    var handlers = [], k;
                    if (handler) {
                        handlers = [handler];
                        delete mjp.nh[nid][ev_type][handler.mjp];
                    } else { // Delete all of this type
                        for(k in mjp.nh[nid][ev_type]) {
                            handlers.push(mjp.nh[nid][ev_type][k]);
                        }
                        delete mjp.nh[nid][ev_type];
                    }
                    mjp(handlers).each(function (k, listener) {
                        if (node.removeEventListener) {
                            node.removeEventListener(ev_type, getHandler(listener));
                        } else { // For IE8
                            node.detachEvent("on"+ev_type, getHandler(listener));
                        }
                    });
                });
                if (!ev_type) { // Removing all => clean up mapping
                    delete mjp.nh[nid];
                    node.removeAttribute("mjp");
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
