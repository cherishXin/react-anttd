const replace = string => {
    if (!string || typeof string !== "string") {
        return string;
    }
    if (string.indexOf('/') === 0) {
        string = window._baseURL + string;
    }
    if (string.indexOf('~/') > -1) {
        string = String.replaceAll(string, '~/', window._baseURL);
    }
    if (string.indexOf('../') > -1) {
        string = String.replaceAll(string, '\\../', window._baseURL);
    }
    return string;
};

const humpName = name => {
    let arr = name.split('-');
    for (let i = 1; i < arr.length; i++) {
        let str = arr[i];
        let s = str[0] || "";
        arr[i] = str.replace(s, s.toUpperCase());
    }
    return arr.join("");
};

const fields = [
    'src',
    'href',
    'background',
    'background-image',
    'backgroundImage',
    'border',
    'border-image',
    'borderImage',
    'border-image-source',
    'borderImageSource',
];

export default config => {
    return (varPath, defaultValue = null) => {
        let value = Object.getValue(config, varPath, defaultValue);
        if (value === undefined || value === null) {
            return value;
        }
        if (typeof (value) === "object") {
            value = { ...value };
            fields.forEach(field => {
                if (value[field]) {
                    value[field] = replace(value[field]);
                    if (field.indexOf("-") > -1) {
                        value[humpName(field)] = value[field];
                        delete value[field];
                    }
                }
            });
        }
        if (typeof (value) === "string") {
            value = Image.url(value);
        }
        return value;
    };
};
