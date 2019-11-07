import React, { Component } from 'react';
import { Input } from 'antd';

export default class LengthLimitedInput extends Component {
    render() {
        return (
            <Input.TextArea maxLength={2000} {...this.props}></Input.TextArea>
        );
    }
}
