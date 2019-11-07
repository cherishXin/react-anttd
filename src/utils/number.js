Number.toFix = (number, length = 2) => {
    var int = parseFloat(number);
    if (int.toString().indexOf('.') > 0) {
        return parseFloat(int.toFixed(length));
    }
    return int;
};
