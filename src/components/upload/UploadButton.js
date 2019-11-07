import React, { Component } from 'react';
import { Upload, Button } from 'antd';
import PropTypes from 'prop-types';
import './upload.less';

export default class UploadButton extends Component {
    static propTypes = {
        /** antd Upload组件的prop 传递上传需要的配置 */
        uploadProps: PropTypes.object,
        /** 按钮文本 */
        buttonText: PropTypes.string.isRequired,
    };

    state = {
        isLoading: false,
    };

    onChange = e => {
        const { onChange } = this.props.uploadProps;
        const { file } = e;
        if (file.status === 'uploading') {
            this.setState({
                isLoading: true,
            });
        }
        if (file.status === 'done') {
            this.setState({
                isLoading: false,
            });
        }
        onChange && onChange(e);
    };

    render() {
        const { uploadProps, buttonText } = this.props;
        const { isLoading } = this.state;

        return (
            <Upload
                className="tt-upload-button"
                showUploadList={false}
                {...uploadProps}
                onChange={this.onChange}
            >
                <Button type="primary" loading={isLoading}>
                    {buttonText}
                </Button>
            </Upload>
        );
    }
}
