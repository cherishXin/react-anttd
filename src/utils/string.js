String.Resovle = (context, startString, stopString, isTurn, subIndex = 0) => {
    let res = null;
    let start = startString.split('*');
    let stop = stopString.split('*');
    try {
        if (!isTurn) {
            for (let i = 0; i < start.length; i++) {
                let s1 = GetGoodString(context, start[i], isTurn);
                let indexOf = context.indexOf(s1);
                if (indexOf > -1) {
                    context = context.substring(indexOf + s1.length);
                } else {
                    return false;
                }
            }
            let s2 = GetGoodString(context, stop[0], isTurn);
            res = context.substring(subIndex, context.indexOf(s2) - subIndex);
            return res;
        } else {
            for (let i = stop.length - 1; i >= 0; i--) {
                let s1 = GetGoodString(context, stop[i], isTurn);
                let indexOf = context.lastIndexOf(s1);
                if (indexOf > -1) {
                    context = context.substring(0, indexOf);
                } else {
                    return false;
                }
            }
            let s2 = GetGoodString(context, start[start.length - 1], isTurn);
            res = context.substring(context.lastIndexOf(s2) + s2.length + subIndex);
            return res;
        }
    } catch (Exception) {
        return false;
    }
};

String.Resovles = (context, startString, stopString, isTurn, subIndex = 0) => {
    let list = [];
    let start = startString.split('*');
    let stop = stopString.split('*');
    try {
        if (!isTurn) {
            while (context.indexOf(start[0]) > -1) {
                for (let i = 0; i < start.length; i++) {
                    let indexOf = context.indexOf(start[i]);
                    if (indexOf > -1) {
                        context = context.substring(indexOf + start[i].length);
                    } else {
                        return list;
                    }
                }
                if (context.indexOf(stop[0]) > -1) {
                    list.push(context.substring(subIndex, context.indexOf(stop[0]) - subIndex));
                } else {
                    return list;
                }
            }
        } else {
            while (context.indexOf(stop[0]) > -1) {
                for (let i = stop.length - 1; i >= 0; i--) {
                    let indexOf = context.lastIndexOf(stop[i]);
                    if (indexOf > -1) {
                        context = context.substring(0, indexOf);
                    } else {
                        return list;
                    }
                }
                list.push(context.substring(context.lastIndexOf(start[start.length - 1]) + start[start.length - 1].length + subIndex));
            }
        }
        return list;
    } catch (Exception) {
        return list;
    }
};

function GetGoodString(context, substring, turn) {
    if (!context) {
        return substring;
    }
    let arr = substring.split('|');
    let index = turn ? -1 : context.length;
    let ret = substring;
    for (let i in arr) {
        let str = arr[i];
        if (!str) {
            continue;
        }
        if (!turn) {
            let temp = context.indexOf(str);
            if (temp > -1 && temp < index) {
                index = temp;
                ret = str;
            }
        } else {
            let temp = context.lastIndexOf(str);
            if (temp > -1 && temp > index) {
                index = temp;
                ret = str;
            }
        }
    }
    return ret;
}
String.replaceAll = function (string, oldValue, newValue) {
    return string.toString().replace(new RegExp(oldValue, 'gm'), newValue);
};
