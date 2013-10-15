define([
    "./core"
], function (mjp) {
    // Event handlers
    mjp.extend(mjp.fn, {
        on: function(ev_type, handler) { // For IE8
            this.each(function (i, node) {
                if (node.addEventListener) {
                    node.addEventListener(ev_type, handler);
                } else if (node.attachEvent) {
                    node.attachEvent("on"+ev_type, handler);
                }
            });
            return this;
        }
    });

    return mjp;
});
