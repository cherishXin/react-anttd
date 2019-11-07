import React from 'react';
import { Row } from 'antd';
import './index.less';

const DescriptionList = ({
    className,
    title,
    col = 3,
    //   layout = 'horizontal',
    gutter = 32,
    children,
    size,
    rowStyle,
    ...restProps
}) => {
    const column = col > 4 ? 4 : col;
    return (
        <div className={`descriptionList ${size} ${className}`} {...restProps}>
            {title ? <div className='title'>{title}</div> : null}
            <Row gutter={gutter} style={rowStyle}>
                {React.Children.map(children, child =>
                    child ? React.cloneElement(child, { column }) : child
                )}
            </Row>
        </div>
    );
};

export default DescriptionList;
