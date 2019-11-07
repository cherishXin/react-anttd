import React, { Component } from 'react';
import { DatePicker } from 'antd';
import PropTypes from 'prop-types';

const { RangePicker } = DatePicker;

export default class MonthRangePicker extends Component {
    static propTypes = {
        value: PropTypes.array,
        onChange: PropTypes.func,
    };

    static defaultProps = {
        onChange: () => {},
    };

    state = {
        mode: ['month', 'month'],
        value: [],
    };

    get value() {
        return this.props.value || this.state.value;
    }

    onPanelChange = (value, mode) => {
        if (mode.indexOf('date') === -1) {
            this.setState({
                mode,
            });
        }
        this.setState({ value });
        this.props.onChange(value);
    };

    render() {
        return (
            <RangePicker
                value={this.value}
                mode={this.state.mode}
                format="YYYY-MM"
                onPanelChange={this.onPanelChange}
            ></RangePicker>
        );
    }
}
