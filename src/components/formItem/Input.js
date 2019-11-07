import React, { Component } from 'react';
import { Input } from 'antd';

export default class LengthLimitedInput extends Component {
    render() {
        return <Input maxLength={500} {...this.props}></Input>;
    }
}

LengthLimitedInput.Password = class extends Component {
    render() {
        return (
            <Input.Password maxLength={500} {...this.props}></Input.Password>
        );
    }
};
