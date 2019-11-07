import React, { PureComponent } from 'react';
import { Modal, Checkbox, Row, Col, Typography, Statistic, message } from 'antd';
import { request } from '@/axios';
import api from '@/model';
import { reFixUrl } from '@/utils/utils';
import { Storage } from '@/utils';
import './exportExcel.less';

const threshold = 1000;
class Page extends PureComponent {

    static defaultProps = {
        exportOptions: {},
    }

    constructor(props) {
        super(props);
        this.state = {
            checkedList: [],
            indeterminate: false,
            checkAll: true,
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (props.columns && !state.exportColumns) {
            let exportColumns = [];
            props.columns.forEach(column => {
                if (column.children) {
                    column.children.forEach(child => {
                        if (child.dataIndex) {
                            exportColumns.push(child);
                        }
                    });
                } else if (column.dataIndex) {
                    exportColumns.push(column);
                }
            });
            return { exportColumns, checkedList: exportColumns };
        }
        return null;
    }

    onChange = checkedList => {
        this.setState({
            checkedList,
            indeterminate: !!checkedList.length && checkedList.length < this.state.exportColumns.length,
            checkAll: checkedList.length === this.state.exportColumns.length,
        });
    };

    onCheckAllChange = e => {
        this.setState({
            checkedList: e.target.checked ? this.state.exportColumns : [],
            indeterminate: false,
            checkAll: e.target.checked,
        });
    };

    handleOk = async () => {
        const { exportOptions, lastParams, listField, page } = this.props;
        const { checkedList } = this.state;
        const headerData = [];
        checkedList.forEach(function (item) {
            if (item.dataIndex && item.export !== false) {
                //refer说明：
                //格式：
                //{
                //	"format":"场时已有${referText}",//格式化支持${referText},
                //  "column":"",要替换的字段,
                //	"type":"ifnull" //替换的条件 ifnull[字段空时替换],replace[始终替换],append[附加在在字段],appendReferNotNull[关联字段不空才替换]
                //}
                const basicData = ((item.filter && item.filter.items) || item.filters || []).map(it => {
                    return { key: it.value, value: it.text };
                });
                headerData.push({ colName: item.dataIndex, exportName: encodeURI(item.title), basicData: basicData, refer: item.refer || {}, sum: item.total });
            }
        });

        let apiUrl = this.props.api;
        let requestType = 'get';
        if (typeof (apiUrl) === "object") {
            requestType = apiUrl._type || requestType;
            apiUrl = apiUrl._url;
        }
        var paramTemp = { ...lastParams };
        paramTemp.offset = 0;
        paramTemp.rows = 999999;//防止接口漏判，导致导出数据缺失
        paramTemp.currentPage = -2;

        // 增加user信息，为了能够兼容外面url不加user登录信息的接口
        var user = Storage.get('user');
        var paramUser = {
            loginUserID: user.userID,
            loginUserPassword: user.password,
        };
        paramTemp.loginUserID = user.userID;
        paramTemp.loginUserPassword = user.password;

        //获取是否有选中参数,进行部分导出
        // if (exportOptions.exportData) {
        //     var selectedRows = this.getSelectedRows();
        //     var exportDataID = exportOptions.exportData; //获取需要筛选的参数字段
        //     var exportDataIDs = [];
        //     Y.Array.each(selectedRows, function (item) {
        //         if (item['' + exportDataID + '']) {
        //             exportDataIDs.push(item['' + exportDataID + '']);
        //         }
        //     });
        //     paramTemp.exportDataIDs = exportDataIDs.join(",");
        // }
        var isHasPage = 1;//是否使用分页
        // if (!this.get("autoPaginationOption")) {
        //     isHasPage = 0;
        // }
        if (window._develop) {
            apiUrl = 'http://dev.tongtongtingche.com.cn/' + window._baseURL + apiUrl;
        } else {
            apiUrl = window.location.origin + window._baseURL + apiUrl;
        }
        var param = {
            exportUrl: requestType === 'get' ? reFixUrl(apiUrl, paramTemp) : reFixUrl(apiUrl, paramUser),
            headerData: JSON.stringify(headerData),
            fileBaseName: exportOptions.exportTitle || (this.props.api && this.props.api._name) || Object.getValue(page, 'title', ''),
            sheetName: exportOptions.exportTitle || (this.props.api && this.props.api._name) || Object.getValue(page, 'title', ''),
            hasPage: isHasPage,
            requestType,
        };

        var exportInterface = api.excelExport;

        //返回resultInfo的请求
        // if (exportOptions && exportOptions.exportReulstType && exportOptions.exportReulstType === 1) {
        exportInterface = api.excelExportResultInfo;
        var paraData = [];
        if (requestType !== 'get') {
            for (let key in lastParams) {
                let value = lastParams[key];
                if (value instanceof Array) {
                    value.forEach(val => {
                        paraData.push({
                            key: key,
                            value: val,
                        });
                    });
                } else {
                    paraData.push({
                        key: key,
                        value: value,
                    });
                }
            }
        }
        param.paraData = JSON.stringify(paraData);
        param.listName = exportOptions.listName || listField;
        // }

        if (this.props.totalNum > threshold) {
            this.setState({ loading: true });
            const result = await request(api.home.submitexportjob, param);
            if (result.success) {
                this.props.onExportJob();
                this.handleCancel();
            } else {
                message.error(result.message || '系统繁忙，请稍后重试');
            }
        } else {
            let form = this.refs.formExport;
            while (form.hasChildNodes()) {
                form.removeChild(form.firstChild);
            }
            for (let key in param) {
                let input = document.createElement('input');
                input.name = key;
                input.value = param[key];
                this.refs.formExport.appendChild(input);
            }
            this.refs.formExport.action = window._baseURL + exportInterface;
            this.refs.formExport.submit();
            this.handleCancel();
            // var url = reFixUrl(window._baseURL + exportInterface, param);
            // this.refs.iframeExport.src = url;
        }
    }

    handleCancel = () => {
        this.setState({ loading: false });
        this.props.onClose();
    }

    render() {
        const { totalNum, page, exportOptions } = this.props;
        const { exportColumns } = this.state;
        const pageTitle = exportOptions.exportTitle || (this.props.api && this.props.api._name) || Object.getValue(page, 'title', '');
        return (
            <div>
                <Modal
                    title={`导出表格${pageTitle ? '-' + pageTitle : ''}`}
                    visible={this.props.visible}
                    onOk={this.handleOk}
                    okButtonProps={
                        {
                            disabled: this.state.checkedList.length < 2,
                            loading: this.state.loading,
                        }
                    }
                    okText="导出"
                    onCancel={this.handleCancel}
                    className="selector-export-excel"
                >
                    <div>
                        <div style={{ borderBottom: '1px solid #E9E9E9' }}>
                            <Checkbox
                                indeterminate={this.state.indeterminate}
                                onChange={this.onCheckAllChange}
                                checked={this.state.checkAll}
                            >
                                选择所有
                                {this.state.checkedList.length < 2 && '(需至少选择2列)'}
                            </Checkbox>
                        </div>
                        <br />
                        <Checkbox.Group
                            value={this.state.checkedList}
                            onChange={this.onChange}
                            style={{ width: '100%' }}
                        >
                            <Row>
                                {
                                    exportColumns && exportColumns.map(column => (
                                        <Col span={6} key={column.dataIndex}>
                                            <Typography.Text ellipsis style={{ width: '100%' }}>
                                                <Checkbox value={column}><span title={column.title}>{column.title}</span></Checkbox>
                                            </Typography.Text>
                                        </Col>
                                    ))
                                }
                            </Row>
                        </Checkbox.Group>
                        <div className="totalCount">
                            预计导出结果数：<Statistic value={totalNum} />条
                            {
                                totalNum > threshold && '。当前导出数据量较大，将创建导出任务'
                            }
                            <iframe ref="iframeExport" className="iframe-export" title="export-excel" />
                            <form className="form-export" method='post' ref="formExport" target="_blank"></form>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default Page;
