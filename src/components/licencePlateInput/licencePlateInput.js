import React, { Component } from 'react';
import { Input, Select, Button } from 'antd';
import PropTypes from 'prop-types';
import './licencePlate.less';

const provinceBriefList = [
    '京', '冀', '津', '豫', '鲁', '贵', '渝', '云',
    '辽', '沪', '黑', '湘', '皖', '新', '苏', '浙',
    '赣', '鄂', '桂', '甘', '晋', '蒙', '陕', '吉',
    '闽', '粤', '青', '藏', '川', '宁', '琼', '使',
    '电', '无牌',
];

export default class LicencePlateInput extends Component {
    static propTypes = {
        /** 车牌号 */
        value: PropTypes.string,
        /** 选中项改变时触发的事件 */
        onChange: PropTypes.func,
        /** 牌号输入框失去焦点时触发的事件 */
        onBlur: PropTypes.func,
    };

    state = {
        value: this.props.value || '',
    }

    get value() {
        // 在props没传value的时候才用state
        return this.props.value === undefined ? this.state.value : this.props.value;
    }

    get brief() {
        if (this.value.indexOf('无牌') > -1) {
            return '无牌';
        }
        if (/[\u4e00-\u9fa5]+/.test(this.value.slice(0, 1))) {
            return this.value.slice(0, 1);
        }
        return '';
    }

    get code() {
        return this.value.slice(this.brief.length, this.value.length).toUpperCase();
    }

    onChange = value => {
        this.setState({
            value,
        });
        this.props.onChange && this.props.onChange(value);
    }

    onOriginSelectChange = value => {
        // 判断clear触发的情况
        if (value === undefined) {
            this.onChange(this.code);
        }
    }

    onInputChange = e => {
        const value = e.target.value.toUpperCase();
        this.onChange(this.brief + value);
    }

    onBlur = value => {
        this.props.onBlur && this.props.onBlur(value);
    }

    render() {
        return (
            <div className="licence-plate">
                {/* 这里必须要添加一个容器然后调用preventDefault来解决Select组件的一个bug */}
                <div onMouseDown={e => e.preventDefault()}>
                    <Select
                        allowClear
                        showArrow={false}
                        style={{ width: 68, marginRight: 10, color: this.brief ? 'inherit' : '#ccc' }}
                        value={this.brief || '省'}
                        onChange={this.onOriginSelectChange}
                        dropdownRender={() => (
                            <div className="licence-plate__dropdown">
                                {provinceBriefList.map(item => (
                                    <Button
                                        key={item}
                                        type={item === this.brief ? 'primary' : ''}
                                        onClick={this.onChange.bind(this, item + this.code)}
                                    >
                                        {item}
                                    </Button>
                                ))}
                            </div>
                        )}
                    />
                </div>
                <Input
                    value={this.code}
                    placeholder="牌号"
                    onChange={this.onInputChange}
                    onBlur={e => this.onBlur(this.brief + e.target.value)}
                />
            </div>
        );
    }
}
