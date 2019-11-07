Image.url = (url) => {
    if (!url) {
        return url;
    }
    if (typeof url === 'object' && url._url) {
        return window._baseURL + '/' + url._url;
    }
    if (url.indexOf(window._baseURL) === 0) {
        return url;
    }
    if (url.indexOf('/') === 0) {
        return window._baseURL + url;
    }
    if (url.indexOf('~/') === 0) {
        return url.replace('~/', window._baseURL);
    }
    if (url.indexOf('../') === 0) {
        return url.replace('../', window._baseURL);
    }
    return url;
};
