define([
    "./core"
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

        append: function () {
            var nodes = mjp(arguments);

            this.each(function (i, el) {
                nodes.each(function (j, n) {
                    var c = mjp(n).clone();
                    el.appendChild(c[0]);
                });
            });
            return this;
        }
    });

    return mjp;
});
