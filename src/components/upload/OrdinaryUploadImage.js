import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Upload, Button, Icon, Modal } from 'antd';
import './upload.less';

let uid = 1;

function generateFile(url) {
    return {
        uid: `${uid++}`,
        name: `file-${uid}`,
        status: 'done',
        url,
    };
}

function generateInitFileList(fileList) {
    if (typeof fileList === 'string') {
        return [generateFile(fileList)];
    }

    if (Array.isArray(fileList)) {
        return fileList.map(item => {
            if (typeof item === 'string') {
                return generateFile(item);
            } else {
                return item;
            }
        });
    }

    return [];
}

export default class OrdinaryUploadImage extends Component {
    static propTypes = {
        /** 配置这个属性来显示图片建议尺寸文案 */
        recommendSize: PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired,
        }),
        /** 是否多个文件上传和预览展示 默认单个文件 */
        isMultiple: PropTypes.bool,
        /** 能否删除图片 */
        canClear: PropTypes.bool,
        /** 预览图片点击的文字提示 */
        clickHint: PropTypes.string,
        /** 预览图片点击事件 */
        imageClick: PropTypes.func,
        /** 初始默认的已上传文件的url 支持单个文件和多个文件 */
        initUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        /** 受控的fileList */
        fileList: PropTypes.array,
        /** onChange事件 */
        onChange: PropTypes.func,
        /** onRemove事件 */
        onRemove: PropTypes.func,
        /** upload组件可用的prop */
        uploadProps: PropTypes.object,
    };

    static defaultProps = {
        canClear: true,
        fileList: [],
        isMultiple: false,
        uploadProps: {},
        onRemove: () => {},
    };

    state = {
        fileList: generateInitFileList(
            this.props.initUrl || this.props.fileList
        ),
        uploadLoading: false,
    };

    componentDidUpdate(prevProps) {
        const prevFileList = prevProps.fileList;
        const fileList = this.props.fileList;
        let fileListChange = false;
        if (prevFileList.length !== fileList.length) {
            fileListChange = true;
        } else {
            for (let i = 0; i < prevFileList.length; i++) {
                if (prevFileList[i] !== fileList[i]) {
                    fileListChange = true;
                }
            }
        }
        if (fileListChange) {
            this.setState({
                fileList: generateInitFileList(this.props.fileList),
            });
        }

        if (!prevProps.initUrl && this.props.initUrl) {
            this.setState({
                fileList: generateInitFileList(this.props.initUrl),
            });
        }
    }

    onChange = ({ file, fileList }) => {
        const { isMultiple, onChange = () => {} } = this.props;
        let newFileList;

        if (file.status === 'uploading') {
            this.setState({
                uploadLoading: true,
            });
        }

        if (file.status === 'done' || file.status === 'error') {
            this.setState({
                uploadLoading: false,
            });
        }

        if (file.status === 'done' && file.response.success) {
            const imgPath = file.response.data.imgPath || file.response.data.filePath;
            if (imgPath.indexOf('http') === 0) {
                file.url = imgPath;
            } else {
                file.url = Image.url('/' + imgPath);
            }
            if (isMultiple) {
                newFileList = this.state.fileList.concat(file);
            } else {
                newFileList = [file];
            }
        } else {
            newFileList = fileList.slice(0, fileList.length);
        }

        this.setState({
            fileList: newFileList,
        });
        onChange(file, newFileList);
    };

    onRemove = file => {
        Modal.confirm({
            title: '是否要清除当前图片',
            onOk: () => {
                const newFileList = this.state.fileList.filter(
                    item => item.uid !== file.uid
                );
                this.setState({
                    fileList: newFileList,
                });
                this.props.onRemove(file);
            },
        });
    };

    render() {
        const {
            canClear,
            recommendSize,
            uploadProps,
            clickHint,
            imageClick,
        } = this.props;
        const { uploadLoading } = this.state;
        const fileList = this.state.fileList;

        return (
            <div className="ordinary-upload">
                <Upload
                    {...uploadProps}
                    accept="image/*"
                    showUploadList={false}
                    fileList={fileList}
                    onChange={this.onChange}
                    onRemove={this.onRemove}
                >
                    <Button icon="upload" loading={uploadLoading}>
                        {uploadLoading ? '上传中...' : '上传图片'}
                    </Button>
                    {recommendSize && (
                        <span style={{ fontSize: 12, marginLeft: 10 }}>
                            图片尺寸建议为{recommendSize.x}*{recommendSize.y}
                        </span>
                    )}
                </Upload>
                <div className="ordinary-upload__preview">
                    {fileList.map(file =>
                        file.url ? (
                            <div
                                className="ordinary-upload__preview-item"
                                key={file.uid}
                            >
                                <img
                                    className={classNames([
                                        'ordinary-upload__preview-img',
                                        {
                                            'ordinary-upload__preview-img--click': !!imageClick,
                                        },
                                    ])}
                                    src={file.url}
                                    onClick={() =>
                                        imageClick && imageClick(file)
                                    }
                                    alt=""
                                />
                                <div className="ordinary-upload__preview-footer">
                                    <div className="ordinary-upload__preview-hint">
                                        {clickHint}
                                    </div>
                                    {canClear && (
                                        <div
                                            className="ordinary-upload__preview-delete"
                                            onClick={this.onRemove.bind(
                                                this,
                                                file
                                            )}
                                        >
                                            <Icon
                                                type="delete"
                                                theme="twoTone"
                                            />
                                            清除图片
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null
                    )}
                </div>
            </div>
        );
    }
}
