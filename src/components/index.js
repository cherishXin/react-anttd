import React from 'react';
import Logo from './logo/logo';
import Selector from './selector/selector';
import Condition from './condition/condition';
import PageLoading from './PageLoading';
import DescriptionList from './DescriptionList';
import NumericInput from './numericInput/numericInput';
import ConfigPage from './configPage/configPage';
import LicencePlateInput from './licencePlateInput/licencePlateInput';
import { Icon } from 'antd';
import { isUrl } from '@/utils/utils';
const IconFont = Icon.createFromIconfontCN({
    scriptUrl: 'static/icon.js', // 在 iconfont.cn 上生成
});
const getIcon = icon => {
    if (!icon) {
        return;
    }
    if (typeof icon === 'string') {
        if (isUrl(icon)) {
            return <Icon component={() => <img src={icon} alt="icon" className="icon" />} />;
        }
        if (icon.startsWith('icon-')) {
            return <IconFont type={icon} className="icon"/>;
        }
        return <Icon type={icon} />;
    }
    return icon;
};
const A = props => <a {...props}>{props.children}</a>;

export {
    Logo,
    Selector,
    Condition,
    IconFont,
    PageLoading,
    DescriptionList,
    A,
    getIcon,
    NumericInput,
    ConfigPage,
    LicencePlateInput,
};
