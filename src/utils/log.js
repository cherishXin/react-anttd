window.hzlogConfig = {
    projectId: 19,
    enabled: true,
    url: 'log.ttpark.cn',
    event: {
        'LOGIN_SUCCESS': 79,
        'LOGIN_ERROR': 80,
        'FEEDBACK': 81,
    },
};

window._log = (event, data, callback) => {
    const eventid = window.hzlogConfig.event[event];
    if (eventid) {
        window._log_countup(eventid, callback, data);
    } else {
        console.log('no log event:' + event);
    }
};

if (window.hzlogConfig && window.hzlogConfig.enabled) {
    var event = window.hzlogConfig.event;
    window._hzlog_ready = function () {
        if (event) {
            for (var key in event) {
                const eventid = event[key];
                window['_LOG_' + key] = function (data, callback) {
                    window._log_countup(eventid, callback, data);
                };
            }
        }
    };

    (function () {
        window._hzlog_projectID = window.hzlogConfig.projectId || 2;
        window._hzlog_version = window.version;
        var a = document.createElement("script");
        a.async = !0;
        a.crossOrigin = 'anonymous';
        a.src = (document.location.protocol === "https:" ? "https:" : "http:") + "//" + (window.hzlogConfig.url || "log.ttpark.cn") + "/v3/log.js";
        var b = document.getElementsByTagName("script")[0];
        b.parentNode.insertBefore(a, b);
    })();
}
