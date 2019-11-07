import React, { PureComponent } from 'react';
import './logo.less';
import loginLogo from '@/images/logo.png';

class Logo extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        // let style = this.props.style || {};
        const { style, src } = this.props;
        const defaultStyle = {
            width: 120,
            left: 40,
            top: 15,
        };
        // if (!style.background && !style.backgroundImage) {
        //     style.backgroundImage = `url(${loginLogo})`;
        // }
        return (
            // <div className="logo" style={style}>
            // </div>
            <div className="logo-layout">
                <img className="logo" src={src || loginLogo} style={style || defaultStyle} alt="" />
            </div>
        );
    }
}

export default Logo;
