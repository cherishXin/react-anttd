import React, { Component } from 'react';
import { DatePicker } from 'antd';
// import moment from 'moment';
import PropTypes from 'prop-types';

const { RangePicker } = DatePicker;

export default class YearRangePicker extends Component {
    static propTypes = {
        defaultValue: PropTypes.array,
        value: PropTypes.array,
        onChange: PropTypes.func,
    };

    static defaultProps = {
        onChange: () => {},
    };

    state = {
        value: this.props.defaultValue || [],
    };

    get value() {
        return this.props.value || this.state.value;
    }

    onPanelChange = value => {
        this.setState({ value });
        this.props.onChange(value);
    };

    render() {
        return (
            <RangePicker
                value={this.value}
                mode={['year', 'year']}
                format="YYYY"
                onPanelChange={this.onPanelChange}
            ></RangePicker>
        );
    }
}
