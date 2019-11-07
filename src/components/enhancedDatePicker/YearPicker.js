import React, { Component } from 'react';
import { DatePicker } from 'antd';
import PropTypes from 'prop-types';

export default class YearPicker extends Component {
    static propTypes = {
        value: PropTypes.array,
        onChange: PropTypes.func,
    };

    static defaultProps = {
        onChange: () => {},
    };

    state = {
        value: '',
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
            <DatePicker
                value={this.value}
                mode="year"
                format="YYYY"
                onPanelChange={this.onPanelChange}
            ></DatePicker>
        );
    }
}
