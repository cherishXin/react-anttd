import qs from 'qs';
import axios from 'axios';
import { mock } from "mockjs";

const get = (api, params) => {
    return new Promise((resolve) => {
        let url;
        if (typeof (api) === "object") {
            url = api._url;
        } else {
            url = api;
        }
        axios.get(url, {
            params,
            paramsSerializer: param => {
                for (let key in param) {
                    let value = param[key];
                    if (typeof (value) === 'object' && !(value instanceof Array)) {
                        param[key] = JSON.stringify(value);
                    }
                }
                return qs.stringify(param, { arrayFormat: 'repeat' });
            },
        }).then(res => {
            resolve(res);
        });
    });
};

const post = (url, params) => {
    return new Promise((resolve, reject) => {
        axios.post(url, qs.stringify(params)).then(res => {
            if (res && res.data) {
                resolve(res.data);
            } else {
                reject(res);
            }
        });
    });
};

const request = (api, params) => {
    return new Promise((resolve) => {
        if (!api) {
            resolve({ success: false, message: '没有配置接口' });
        } else {
            let url;
            let type = 'get';
            if (typeof (api) === "object") {
                url = api._url;
                type = api._type;
                if (api._token) {
                    params = {
                        token: api._token,
                        ...params,
                    };
                }
            } else {
                url = api;
            }
            const res = window.__cache.get(url + qs.stringify(params));
            if (res) {
                resolve(res);
                return;
            }
            if (typeof (api) === "object" && api._result) {
                if (api._result instanceof Function) {
                    resolve(mock(api._result(params)));
                } else {
                    resolve(mock(api._result));
                }
                return;
            }
            let config = {
            };
            if (type === 'get') {
                config = {
                    params,
                    paramsSerializer: param => {
                        for (let key in param) {
                            let value = param[key];
                            if (typeof (value) === 'object' && !(value instanceof Array)) {
                                param[key] = JSON.stringify(value);
                            }
                        }
                        return qs.stringify(param, { arrayFormat: 'repeat' });
                    },
                };
            } else {
                config = {
                    data: params,
                    transformRequest: [function (data) {
                        for (let key in data) {
                            let value = data[key];
                            if (typeof (value) === 'object' && !(value instanceof Array)) {
                                data[key] = JSON.stringify(value);
                            }
                        }
                        return qs.stringify(data, { arrayFormat: 'repeat' });
                    }],
                };
            }

            if (api._timeout !== undefined) {
                config.timeout = api._timeout;
            }
            axios.request(url, {
                method: type,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                ...config,
            }).then(res => {
                if (api._cache) {
                    window.__cache.set(url + qs.stringify(params), res, api._cache);
                }
                resolve(res);
            });
        }
    });
};
export {
    get,
    post,
    request,
};
