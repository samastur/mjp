define(function () {
    function addToUrl(url, data_string) {
        if (data_string) {
            url += (/\?/.test(url) ? "&" : "?") + data_string;
        }
        return url;
    }

    return addToUrl;
});
