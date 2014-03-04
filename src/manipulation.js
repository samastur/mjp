define([
    "./core",
    "./events",
], function (mjp) {
    // getAll and fixInput are modified versions from jQuery
    function getAll( ctx, tag ) {
        var ret = ctx.getElementsByTagName ? ctx.getElementsByTagName( tag || "*" ) :
                ctx.querySelectorAll ? ctx.querySelectorAll( tag || "*" ) :
                [];
        return [ ctx ].concat(mjp.makeArray(ret));
    }

    // Support: IE >= 9
    function fixInput( src, dest ) {
        var nodeName = dest.nodeName.toLowerCase();

        // Fails to persist the checked state of a cloned checkbox or radio button.
        if ( nodeName === "input" && (/^(?:checkbox|radio)$/i).test( src.type ) ) {
            dest.checked = src.checked;

        // Fails to return the selected option to the default selected state when cloning options
        } else if ( nodeName === "input" || nodeName === "textarea" ) {
            dest.defaultValue = src.defaultValue;
        }
    }


    mjp.extend(mjp.fn, {
        clone: function () {
            var copies = [];
            this.each(function (j, el) {
                var cloned = el.cloneNode(true),
                    i, l, srcEls, destEls;

                // Support: IE >= 9
                // Fix Cloning issues
                if (cloned.nodeType === 1 || cloned.nodeType === 11) {
                    destEls = getAll(cloned);
                    srcEls = getAll(el);
                    for (i = 0, l = srcEls.length; i < l; i++ ) {
                        fixInput(srcEls[i], destEls[i]);
                    }
                }

                copies.push(cloned);
            });
            return mjp(copies);
        },

        remove: function () {
            this.each(function (i, el) {
                // Remove handlers to prevent leaking memory
                mjp(el).off();
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            });
            return this;
        },

        append: function () {
            var nodes = mjp(arguments),
                self = this;

            nodes.each(function (j, n) {
                var c = mjp(n).remove();
                self.each(function (i, el) {
                    el.appendChild(c.clone()[0]);
                });
            });
            return this;
        },

        appendTo: function (target) {
            var $target = mjp(target);

            this.each(function (i, el) {
                var c = mjp(el).remove();
                $target.each(function (j, n) {
                    n.appendChild(c.clone()[0]);
                });
            });
            return this;
        }
    });

    return mjp;
});
