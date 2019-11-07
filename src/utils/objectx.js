Object.clone = (obj, func = false) => {
    if (!obj || !(obj instanceof Object) || (typeof obj == "function")) {
        if (typeof obj == "function" && func) {
            return null;
        }
        return obj;
    }
    var constructor = obj.constructor;
    var result = new constructor();
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            result[key] = Object.clone(obj[key]);
        }
    }
    return result;
};

Object.extend = (target, object1, object2) => {
    if (object1 && typeof object1 === "object") {
        for (let key in object1) {
            if (object1.hasOwnProperty(key)) {
                //判断ojb子元素是否为对象，如果是，递归复制
                if (object1[key] && typeof object1[key] === "object" && !(object1[key] instanceof Function)) {
                    target[key] = Object.extend(target[key] || {}, object1[key]);
                } else {
                    //如果不是，简单复制
                    target[key] = object1[key];
                }
            }
        }
    }
    if (object2) {
        Object.extend(target, object2);
    }
    return target;
};

Object.getValue = (object, field, defaultValue = object) => {
    if (!object || !Object.keys(object).length || !field) {
        return defaultValue;
    }
    let fields = field.split('.');
    let result = { ...object };
    for (let key of fields) {
        if (result !== undefined && result !== null && result[key] !== undefined) {
            result = result[key];
        } else {
            return defaultValue;
        }
    }
    return result;
};
Object.isEmpty = (object, except = []) => {
    if (!object) {
        return false;
    }
    for (let key in object) {
        if (except && except.includes(key)) {
            continue;
        }
        if (object.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
};

Object.toStr = object => {
    return JSON.stringify(Object.clone(object));
};

Object.equal = (object1, object2) => {
    return Object.toStr(object1) === Object.toStr(object2);
};

Object.changeList = (object1, object2) => {
    if (!object1) {
        object1 = {};
    }
    if (!object2) {
        object2 = {};
    }
    const changes = [];
    for (const key in object1) {
        if (object1[key] !== object2[key]) {
            !changes.includes(key) && changes.push(key);
        }
    }
    for (const key in object2) {
        if (object1[key] !== object2[key]) {
            !changes.includes(key) && changes.push(key);
        }
    }
    return changes;
};
