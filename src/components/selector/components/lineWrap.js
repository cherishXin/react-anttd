/**
 * td 溢出隐藏 组件
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'antd';

export default class LineWrap extends PureComponent {
    static propTypes = {
        title: PropTypes.string,
    };

    render() {
        const { children, title } = this.props;
        return (
            <Tooltip placement="topLeft" title={title || children} mouseEnterDelay={1}>
                <span className='lineEllipsis'>{children}</span>
            </Tooltip>
        );
    }
}
