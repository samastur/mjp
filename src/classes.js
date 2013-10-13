define([
    "./core"
], function (mjp) {
    // class functions (addClass, hasClass, removeClass)
    mjp.extend(mjp.fn, {
        hasClass: function(value) {
            var has = false, cls = "";
            this.each(function(i, el) {
                cls = " "+el.className+" ";
                if (cls.search(" "+value+" ") > -1) {
                    has = true;
                    return false;
                }
            });
            return has;
        },

       addClass: function(value) {
            this.each(function(i, el) {
                if (!mjp(el).hasClass(value)) {
                    el.className = mjp.trim(el.className) + " "+value;
                }
            });
            return this;
        },

        removeClass: function(value) {
            this.each(function(i, el) {
                var cls = " "+el.className+" ", new_cls = "";
                new_cls = cls.replace(" "+value+" ", "");
                if (new_cls !== cls) {
                    el.className = mjp.trim(new_cls);
                }
            });
            return this;
        }
    });
});
