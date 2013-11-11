define([
    "./ajax"
], function (mjp) {
    mjp.extend(mjp.fn, {
        // TODO: serialize & serializeArray add ~200 bytes to gzipped lib
        serialize: function() {
            return mjp.param( this.serializeArray() );
        },

        // Simplified jQuery version
        serializeArray: function() {
            var rCRLF = /\r?\n/g,
                rcheckableType = /^(?:checkbox|radio)$/i,
                rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
                rsubmittable = /^(?:input|select|textarea|keygen)/i;

            return this.map(function(i, el) {
                // If passed form element, then fetch its elements (form fields)
                return el.elements ? mjp.makeArray(el.elements) : this;
            })
            // Filter out disabled, unchecked and unselected
            .filter(function(i, el) {
                return el.name && !el.disabled &&
                    rsubmittable.test( el.nodeName ) &&
                    !rsubmitterTypes.test( el.type ) &&
                    ( el.checked || !rcheckableType.test( el.type ) );
            })
            // Grab values of the rest
            .map(function( i, elem ) {
                var val = elem.value;

                return val == null ?
                    null :
                    Array.isArray( val ) ?
                        mjp.map( val, function( val ) {
                            return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
                        }) :
                        { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
            });
        }
    });

    return mjp;
});
