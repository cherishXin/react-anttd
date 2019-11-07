import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'antd';

class NumericInput extends PureComponent {
    static propTypes = {
        // 可输入长度
        maxLength: PropTypes.number,
        // 允许负数
        allowMinus: PropTypes.bool,
        // 允许小数
        allowDecimal: PropTypes.bool,
        // 最大值
        maxValue: PropTypes.number,
        // 最小值
        minValue: PropTypes.number,
        // 是否允许输入的值等于最大值
        allowMaxValue: PropTypes.bool,
        // 是否允许输入的值等于最小值
        allowMinValue: PropTypes.bool,
    }

    static defaultProps = {
        maxLength: 25,
        allowMinus: true,
        allowDecimal: true,
        maxValue: Number.maxValue,
        minValue: Number.minValue,
        allowMaxValue: true,
        allowMinValue: true,
    }

    onChange = e => {
        const { allowMinus, allowDecimal } = this.props;
        const { value } = e.target;
        let reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;

        if (allowMinus === false && allowDecimal === false) {
            reg = /^[0-9]*$/;
        } else if (allowMinus === false) {
            reg = /^(0|[1-9][0-9]*)(\.[0-9]*)?$/;
        } else if (allowDecimal === false) {
            reg = /^-?(0|[1-9][0-9]*)$/;
        }

        if ((!Number.isNaN(value) && reg.test(value)) || value === '' || (allowMinus && value === '-')) {
            this.props.onChange && this.props.onChange(value);
        }
    };

    // '.' at the end or only '-' in the input box.
    onBlur = () => {
        const { value, onBlur, onChange, maxValue, minValue, allowMaxValue, allowMinValue, allowDecimal } = this.props;

        if (typeof value === "string" && (value.charAt(value.length - 1) === '.' || value === '-')) {
            onChange && onChange(value.slice(0, -1));
        }
        if ((allowMaxValue && value > maxValue) || (!allowMaxValue && value >= maxValue)) {
            onChange && onChange(allowMaxValue ? `${allowDecimal ? maxValue : parseInt(maxValue, 10)}` : '');
        }
        if ((allowMinValue && value < minValue) || (!allowMinValue && value <= minValue)) {
            onChange && onChange(allowMinValue ? `${minValue}` : '');
        }
        if (onBlur) {
            onBlur();
        }
    };

    render() {
        const { maxLength } = this.props;
        const props = { ...this.props };
        delete props.maxLength;
        delete props.allowMinus;
        delete props.allowDecimal;
        delete props.maxValue;
        delete props.minValue;
        delete props.allowMaxValue;
        delete props.allowMinValue;
        return (
            <Input
                {...props}
                onChange={this.onChange}
                onBlur={this.onBlur}
                maxLength={maxLength}
            />
        );
    }
}

export default NumericInput;
