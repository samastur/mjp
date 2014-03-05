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

    // General method for xTo methods
    function apTo(args_func) {
        function _wrapped(target) {
            var $target = mjp(target);

            this.each(function (i, el) {
                var c = mjp(el).remove();
                $target.each(function (j, n) {
                    var params = args_func(n),
                        args = [c.clone()[0]].concat(params[1]);
                    // appendChild(x) == insertBefore(x, null)
                    params[0].insertBefore.apply(params[0], args);
                });
            });
            return this;
        }
        return _wrapped;
    }

    // General method for not xTo add methods
    // WARNING: ap&apTo could be generalized, but result produces bigger
    //          zipped file
    function ap(args_func) {
        function _wrapped() {
            var nodes = mjp(arguments),
                self = this;

            nodes.each(function (j, n) {
                var c = mjp(n).remove();
                self.each(function (i, el) {
                    var params = args_func(el),
                        args = [c.clone()[0]].concat(params[1]);
                    // appendChild(x) == insertBefore(x, null)
                    params[0].insertBefore.apply(params[0], args);
                });
            });
            return this;
        }
        return _wrapped;
    }

    // PUBLIC methods
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

        append: ap(function (el) { return [el, [null]]; }),

        prepend: ap(function (el) { return [el, [el.firstChild || null]]; }),

        appendTo: apTo(function (el) { return [el, [null]]; }),

        prependTo: apTo(function (el) {
            return [el, [el.firstChild || null]];
        }),

        after: ap(function (el) {
            return [el.parentNode, [el.nextSibling || null]];
        }),

        before: ap(function (el) { return [el.parentNode, [el]]; }),

        insertAfter: apTo(function (el) {
            return [el.parentNode, [el.nextSibling || null]];
        }),

        insertBefore: apTo(function (el) { return [el.parentNode, [el]]; })
    });

    return mjp;
});
