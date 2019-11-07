import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './selector.less';
import { Table, Statistic, message, Tag, Tooltip, Typography, Avatar } from 'antd';
import { Filters, ExportExcel, LineWrap } from './components';
import { request } from '@/axios';
import anime from 'animejs';

const A = props => <a {...props}>{props.children}</a>;

class Selector extends Component {
    static propTypes = {
        // 数据集
        data: PropTypes.array,
        // 列
        columns: PropTypes.array.isRequired,
        rowKey: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.func,
        ]),
        // table组件的补充属性
        table: PropTypes.object,
        // 表格是否自适应高度
        autoHeight: PropTypes.bool,
        // 表格是否自适应宽度
        autoWidth: PropTypes.bool,
        // 查询参数
        param: PropTypes.object,
        // 接口
        api: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.string,
        ]),
        // 总条数字段
        totalField: PropTypes.string,
        // 列表字段
        listField: PropTypes.string,
        // 加载后的回调
        callback: PropTypes.func,
        //首次加载不需要调用接口
        nocallapi: PropTypes.bool,
        // 是否显示已筛选项
        showFilterValue: PropTypes.bool,
    }

    static defaultProps = {
        totalField: 'totalNum',
        listField: 'list',
        table: {},
        autoHeight: true,
        autoWidth: true,
        enabledExport: true,
        nocallapi: false,
        showFilterValue: true,
    }

    constructor(props) {
        super(props);
        this.keyMap = new Map();
        this.state = {
            data: this.props.data || [],
            pagination: this.props.pagination === false ? false : {
                pageSize: Object.getValue(window, '_user.UserConfig.pageSize', 10),
                pageSizeOptions: ['10', '20', '50', '100'],
                showQuickJumper: true,
                showSizeChanger: true,
                onShowSizeChange: (current, size) => {
                    const { pagination } = this.state;
                    pagination.current = current;
                    pagination.pageSize = size;
                    this.setState({ pagination });
                },
            },
            loading: true,
            columns: Object.clone(this.props.columns),
            selectedRowKeys: [],
            activeRowKeys: [],
            tagColumn: {
                key: 'no-one-on-selected',
            },
            totalNum: 0,
        };
    }

    async componentDidMount() {
        setTimeout(() => {
            this.onWindowResize();
        });
        window.addEventListener('resize', this.onWindowResize);
        await this.getFilterItem();
        if (this.props.nocallapi) {
            this.setState({ loading: false });
            return;
        } else {
            this.fetch(this.setPaginationParam({
                ...this.props.param,
            }, true));
        }
    }

    componentWillUnmount() {
        const { timer } = this.state;
        clearTimeout(timer);
        window.removeEventListener('resize', this.onWindowResize);
    }

    setPaginationParam = (param, reset) => {
        if (this.state.pagination) {
            const pagination = { ...this.state.pagination };
            Object.assign(param, {
                offset: reset ? 0 : (pagination.current - 1) * pagination.pageSize,
                rows: pagination.pageSize,
                currentPage: reset ? 1 : pagination.current,
            });
        }
        return param;
    }

    async getFilterItem() {
        const { columns } = this.state;
        const { table } = this.props;
        const parentWidth = this.refs.selector.offsetWidth;
        let defaultValue = {};
        let width = 0;
        let lastIndex;
        if (table.rowSelection) {
            if (table.rowSelection.columnWidth) {
                width += table.rowSelection.columnWidth;
            } else if (table.rowSelection.columnTitle && typeof table.rowSelection.columnTitle === "string") {
                table.rowSelection.columnWidth = table.rowSelection.columnTitle.length * 15 + 40;
                width += table.rowSelection.columnWidth;
            } else {
                width += 60;
            }
        }
        if (table.expandedRowRender) {
            width += 50;
        }
        for (let index in columns) {
            const column = columns[index];
            defaultValue = await this.renderColumn(column, defaultValue);
            if (column.children) {
                column.width = 0;
                for (let child of column.children) {
                    defaultValue = await this.renderColumn(child, defaultValue, 'datetime');
                    child.scrollLeft = width + column.width;
                    column.width += child.width;
                    child.caclWidth = child.width;
                }
            }
            column.scrollLeft = width;
            width += column.width;
            column.calcWidth = column.width;
            if (!column.fixed && !column.solidWidth) {
                lastIndex = index;
            }
        }
        if (lastIndex !== undefined) {
            delete columns[lastIndex].width;
            delete columns[lastIndex].calcWidth;
        }
        if (width < parentWidth) {
            const diffWidth = parentWidth - width;
            let autoOldTotalWidth = 0;
            const autoColumns = [];
            for (let index in columns) {
                const column = columns[index];
                if (column.autoWidth && column.width) {
                    if (column.children) {
                        for (let child of column.children) {
                            autoOldTotalWidth += child.width;
                            autoColumns.push(child);
                        }
                    } else {
                        autoOldTotalWidth += column.width;
                        autoColumns.push(column);
                    }
                }
            }
            for (let column of autoColumns) {
                column.width += column.width / autoOldTotalWidth * diffWidth;
            }
        }
        const footerColumns = [...columns];
        for (let index in footerColumns) {
            const column = columns[index];
            if (column.fixed || column.key === 'action' || column.solidRender) {
                footerColumns[index] = { ...column };
                footerColumns[index].render = () => <></>;
            }
        }
        footerColumns[0] = { ...columns[0] };
        footerColumns[0].render = () => <>合计</>;
        if (table.rowSelection) {
            footerColumns[0].width += 60;
        }
        if (table.expandedRowRender) {
            footerColumns[0].width += 50;
        }
        this.setState({ defaultValue, columns, width, footerColumns, initialValue: defaultValue });
    }

    async renderColumn(column, defaultValue, columnType) {
        let width = 180;
        if (columnType === 'date') {
            width = 150;
        }
        if (columnType === 'datetime') {
            width = 180;
        }
        if (column.total) {
            width = 80;
        }
        const oldRender = column.render;
        const render = (text, record, index) => {
            const filters = (column.filter && column.filter.items) || column.filters || [];
            const find = filters.find(data => parseInt(data.value, 10) === text || data.value === text) || {};
            let value = (find && find.text) || column.otherValue || text;
            value = oldRender ? oldRender(text, record, index, value) : value;
            return find.type === 'Tag' ? <Tag color={find.color}>{value}</Tag> : <LineWrap>{value}</LineWrap>;
        };
        // 如果有source，则从接口获取并赋值
        if (column.source) {
            const param = column.source.param instanceof Function ? column.source.param(column) : column.source.param;
            const result = await request(column.source.api, param);
            if (result.success !== false) {
                let items = Object.getValue(result.data || result, column.source.field);
                items = column.source.map ? items.map(column.source.map) : items;
                if (!column.filter) {
                    column.filter = {};
                }
                column.filter.items = items || [];
            } else {
                console.error(column.source);
            }
        }
        if (column.filter) {
            if (column.filter.dataIndex) {
                this.keyMap.set(column.dataIndex, column.filter.dataIndex);
            } else {
                column.filter.dataIndex = column.dataIndex;
            }
            if (column.filter.initialValue === undefined && column.filter.allowClear === false) {
                column.filter.initialValue = column.filter.defaultValue;
            }
            column.filter.allowClear = column.filter.allowClear === false ? false : true;
            if (column.filter.type === 'input') {
                Object.assign(column, Filters.getColumnSearchProps(column));
                width = 180;
            }
            if (column.filter.type === 'number') {
                column.filter.value = [...(column.filter.defaultValue || ['', ''])];
                Object.assign(column, Filters.getColumnNumberProps(column));
                defaultValue[column.filter.dataIndex] = column.filter.value;
                width = 80;
            }
            if (column.filter.type === 'date') {
                column.filter.hasTime = column.filter.hasTime === false ? false : true;
                column.filter.hasFilterTime = column.filter.hasFilterTime === false ? false : true;
                column.filter.datePeriods = column.filter.datePeriods || ['currentDay', 'currentWeek', 'currentMonth', 'currentYear'];
                if (column.filter.defaultValue) {
                    column.filter.value = Filters.range(column.filter.defaultValue);
                    if (column.children) {
                        let currentValue = Filters.onRangePickerChange(Filters.range(column.filter.defaultValue), column, column.filter.defaultValue);
                        defaultValue = { ...defaultValue, ...currentValue };
                    } else {
                        let currentValue = Filters.onDateTimeChange(Filters.range(column.filter.defaultValue), column, column.filter.defaultValue);
                        if (currentValue instanceof Object && !(currentValue instanceof Array)) {
                            defaultValue = { ...defaultValue, ...currentValue };
                        } else {
                            defaultValue[column.filter.dataIndex || column.key] = currentValue;
                        }
                    }
                }
                if (column.children) {
                    column.key = column.key || column.children[0].dataIndex;
                    Object.assign(column, Filters.getColumnRangeProps(column));
                    width = 0;
                } else {
                    Object.assign(column, Filters.getColumnDateProps(column));

                    width = 180;
                    if (column.filter.hasTime === false) {
                        width = 150;
                    }
                }
            }
            if (column.filter.type === 'operator') {
                const param = (column.filter.param instanceof Function ? column.filter.param(column) : column.filter.param) || this.props.param;
                const newColumn = await Filters.getColumnOperatorsProps(column, param);
                Object.assign(column, newColumn);
                width = 120;
            }
            if (column.filter.type === 'licence-plate') {
                Object.assign(column, Filters.getColumnLicencePlateProps(column));
                width = 110;
            }
            if (column.filter.items) {
                width = 100;
                column.filter.items = column.filters ? column.filter.items.concat(column.filters) : column.filter.items;
                column.filters = [];
                if (column.filter.defaultValue) {
                    defaultValue[column.filter.dataIndex || column.key] = column.filter.defaultValue;
                }
                if (column.filter.type !== 'none') {
                    Object.assign(column, Filters.getColumnItemsProps(column, this));
                }
            }
        }
        if (!(column.key === 'action' || column.solidRender)) {
            column.render = render;
        }

        if (column.defaultValue) {
            defaultValue[column.dataIndex || column.key] = column.defaultValue;
        }
        let minWidth = column.title.length * 14 + 32;
        if (column.filter) {
            minWidth += 14;
        }
        if (column.sorter) {
            minWidth += 20;
        }
        // 针对奇葩分辨率电脑，修复表格列宽度计算后显示不下的问题
        if (window.devicePixelRatio !== parseInt(window.devicePixelRatio, 10)) {
            minWidth++;
        }
        if (!column.width) {
            column.width = Math.max(width, minWidth);
            column.autoWidth = true;
        }
        column.className = `selector-tag-${column.dataIndex || column.key}`;
        // column.sortDirections = ["asc", "desc"];
        return defaultValue;
    }

    componentDidUpdate(prevProps) {
        const updateColumns = () => {
            this.keyMap = new Map();
            this.setState({ columns: Object.clone(this.props.columns) }, async () => {
                await this.getFilterItem();
                // 在切换车场的时候清除选中的行
                this.onRowSelectChange([], []);
                this.fetch(this.setPaginationParam({
                    ...this.props.param,
                }, true));
            });
        };
        if (!Object.equal(this.props.columns, prevProps.columns)) {
            prevProps.columns = this.props.columns;
            updateColumns();
        } else if (!Object.equal(this.props.param, prevProps.param)) {
            // 在切换车场的时候清除选中的行
            this.onRowSelectChange([], []);
            this.fetch(this.setPaginationParam({
                ...this.props.param,
            }, true));
            // 判断变更的参数
            const changes = Object.changeList(this.props.param, prevProps.param);
            this.state.columns.forEach(column => {
                if (column.changeOf) {
                    if (column.changeOf instanceof Array) {
                        column.changeOf.forEach(change => {
                            if (changes.includes(change)) {
                                this.renderColumn(column);
                            }
                        });
                    } else {
                        if (changes.includes(column.changeOf)) {
                            this.renderColumn(column);
                        }
                    }
                }
            });
        }
    }
    animeExport = () => {
        const center = {
            x: -document.body.clientWidth / 2 + 150,
            y: document.body.clientHeight / 2,
        };
        anime({
            targets: this.refs.exportfile,
            keyframes: [
                {
                    translateX: center.x,
                    translateY: center.y,
                    opacity: 0,
                },
                {
                    translateX: center.x,
                    translateY: center.y,
                    opacity: 1,
                },
                {
                    translateX: 0,
                    translateY: 0,
                    opacity: 0.5,
                },
                {
                    translateX: 0,
                    translateY: 0,
                    opacity: 0,
                },
                {
                    translateX: 0,
                    translateY: -50,
                    opacity: 0,
                },
            ],
            duration: 1800,
            easing: 'easeInOutSine',
        });
    }

    handleTableChange = (pagination, filters, sorter) => {
        let param = {
            sortColumn: sorter.field,
            order: new Map([["ascend", "asc"], ["descend", "desc"], ["", ""]]).get(sorter.order),
            ...this.props.param,
        };
        if (!Object.isEmpty(pagination)) {
            param = {
                ...param,
                offset: (pagination.current - 1) * pagination.pageSize,
                rows: pagination.pageSize,
                currentPage: pagination.current,
            };
        }
        let currentFilter = '';
        if (filters) {
            for (let key in filters) {
                delete param[key];
                let value = filters[key];
                if (this.keyMap.has(key)) {
                    let newkey = this.keyMap.get(key);
                    filters[newkey] = filters[key];
                    delete filters[key];
                    key = newkey;
                }
                if (value) {
                    if (value instanceof Array) {
                        param[key] = filters[key];
                    } else if (typeof (value) === "object") {
                        if (value.column) {
                            param[key] = value.value;
                        } else {
                            param = { ...param, ...value };
                        }
                    } else {
                        param[key] = filters[key];
                    }
                }
                let valueStr = param[key];
                if (valueStr instanceof Array) {
                    valueStr = valueStr.join(',');
                    currentFilter += key + ':' + valueStr;
                } else if (typeof valueStr === "object") {
                    for (let k in valueStr) {
                        currentFilter += `${k}:${valueStr[k]}`;
                    }
                } else {
                    currentFilter += key + ':' + valueStr;
                }
            }
        }
        this.currentFilter = currentFilter;
        this.fetch(param);
    }

    fetch = async (params = {}) => {
        this.setState({ loading: true });
        if (this.state.lastParams) {
            for (let key2 in this.state.lastParams) {
                if (params[key2] === undefined) {
                    params[key2] = this.state.lastParams[key2];
                }
            }
        }
        for (let key in this.state.defaultValue) {
            if (params[key] === undefined || (params[key] instanceof Array && params[key].length === 0)) {
                params[key] = this.state.defaultValue[key];
            }
        }
        await this.load(params);
    }

    reload = async callback => {
        this.setState({ loading: true });
        let { lastParams } = this.state;
        // 在reload的时候清除选中的行
        this.onRowSelectChange([], []);
        // await this.getFilterItem();
        await this.load(lastParams);
        callback && callback();
        this.onWindowResize();
    }

    load = async params => {
        let { totalData, totalNum } = this.state;
        this.setState({ loading: true }, () => {
            this.onWindowResize();
        });
        try {
            let result = await request(this.props.api, { ...params });
            let totalField = this.props.totalField;
            let listField = this.props.listField;
            if (result.success) {
                if (!result.data) {
                    result.data = {};
                }
                const { pagination } = this.state;
                totalNum = Object.getValue(result.data, totalField, 0);
                if (pagination) {
                    pagination.total = totalNum;
                    pagination.current = params.currentPage;
                }
                const list = Object.getValue(result.data, listField, []);
                const totalRecord = Object.getValue(result.data, 'totalRecord', {});

                if (!pagination || (pagination.current === 1 && this.currentFilter !== this.lastFilter) || !totalData) {
                    totalData = list;
                } else {
                    totalData.push(...list);
                }
                this.lastFilter = this.currentFilter;
                let footer = {};
                for (let column of this.state.columns) {
                    delete column.filteredValue;
                    if (column.total && totalRecord[column.dataIndex] !== undefined) {
                        footer[column.dataIndex] = totalRecord[column.dataIndex];
                    }
                }
                this.props.callback && this.props.callback(result.data);
                this.setState({
                    loading: false,
                    data: list,
                    totalData: totalData,
                    pagination,
                    lastParams: params,
                    footer: footer,
                    totalNum,
                }, () => {
                    this.onRowSelectChange(this.state.selectedRowKeys, []);
                    if (!Object.isEmpty(footer)) {
                        setTimeout(() => {
                            try {
                                const tableDOM = ReactDOM.findDOMNode(this.refs.table);
                                const tableBodyDOM = tableDOM.querySelector('.ant-table-body');
                                const footerTableDOM = tableDOM.querySelector('.ant-table-footer .ant-table-body');
                                if (tableBodyDOM && footerTableDOM) {
                                    tableBodyDOM.onscroll = e => {
                                        footerTableDOM.scrollLeft = e.target.scrollLeft;
                                    };
                                    footerTableDOM.onscroll = e => {
                                        tableBodyDOM.scrollLeft = e.target.scrollLeft;
                                    };
                                }
                            } catch (e) {
                                console.log(e);
                            }
                        });
                    }
                });
            } else {
                message.error(result.message || '系统繁忙，请稍后重试');
                console.log(params, result);
                const { pagination } = this.state;
                if (pagination) {
                    pagination.total = 0;
                    pagination.current = 0;
                }
                this.setState({
                    loading: false,
                    data: [],
                    lastParams: params,
                    pagination,
                    footer: null,
                    totalNum: 0,
                });
            }
        } catch (ex) {
            console.log(ex);
            message.error(ex);
        }
    }


    onRowSelectChange = (selectedRowKeys, selectedRows) => {
        const { rowKey, table } = this.props;
        const tableRowKey = rowKey || table.rowKey;
        const { totalData } = this.state;
        const nextSelectedRowKeys = [];
        const nextSelectedRows = [];
        if (selectedRowKeys.length !== selectedRows.length) {
            totalData.forEach(record => {
                const key = typeof tableRowKey === "function" ? tableRowKey(record) : record[tableRowKey];
                if (selectedRowKeys.includes(key) && !nextSelectedRowKeys.includes(key)) {
                    nextSelectedRowKeys.push(key);
                    nextSelectedRows.push(record);
                }
            });
            selectedRowKeys = nextSelectedRowKeys;
            selectedRows = nextSelectedRows;
        }
        if (this.tableRowSelectionOnChange && this.tableRowSelectionOnChange !== this.onRowSelectChange) {
            this.tableRowSelectionOnChange(selectedRowKeys, selectedRows);
        }
        this.setState({ selectedRowKeys, selectedRows });
    }

    onWindowResize = () => {
        const el = this.refs.selector;
        if (el && el.offsetParent) {
            const tagHeight = this.refs.tags ? this.refs.tags.offsetHeight : 0;
            const height = el.offsetParent.offsetHeight - el.offsetTop - tagHeight;
            this.setState({ height });
        }

        if (this.props.autoWidth) {
            const { columns, width } = this.state;
            const parentWidth = this.refs.selector.offsetWidth;
            if (width < parentWidth) {
                const diffWidth = parentWidth - width;
                let autoOldTotalWidth = 0;
                const autoColumns = [];
                for (let index in columns) {
                    const column = columns[index];
                    if (column.autoWidth && column.calcWidth) {
                        if (column.children) {
                            for (let child of column.children) {
                                autoOldTotalWidth += child.calcWidth;
                                autoColumns.push(child);
                            }
                        } else {
                            autoOldTotalWidth += column.calcWidth;
                            autoColumns.push(column);
                        }
                    }
                }
                for (let column of autoColumns) {
                    column.width = column.calcWidth + column.calcWidth / autoOldTotalWidth * diffWidth;
                }
            }
            this.setState({ now: new Date() });
        }

        if (this.props.autoHeight) {
            const nodeList = this.refs.selector && (this.refs.selector.querySelectorAll('.ant-table-body-outer') || []);
            nodeList.forEach(node => {
                node.classList.add('auto-height');
            });
        }
    }

    setActiveRowKeys = (activeRowKeys, timeout = 3000) => {
        const rowKeys = activeRowKeys;
        this.setState({
            activeRowKeys, timer: timeout && setTimeout(() => {
                this.setState({
                    timer: 0,
                    activeRowKeys: activeRowKeys.filter(key => !rowKeys.includes(key)),
                });
            }, timeout),
        });
    }

    rowClassName = record => {
        const { rowKey, table } = this.props;
        const tableRowKey = rowKey || table.rowKey;
        const { activeRowKeys } = this.state;
        return activeRowKeys.includes(typeof tableRowKey === "function" ? tableRowKey(record) : record[tableRowKey]) ? 'ant-table-row-active' : '';
    }

    onTagClose = (column, e) => {
        column.filter.clearFilters();
        e.stopPropagation();
    }

    onTagClick = column => {
        const tableDom = ReactDOM.findDOMNode(this.refs.table);
        const tableHeaderDom = tableDom.querySelector('.ant-table-header');
        if (tableDom && tableHeaderDom) {
            tableHeaderDom.scrollLeft = column.scrollLeft - (tableHeaderDom.offsetWidth / 2) + (column.width ? column.width / 2 : 0);
            this.setState({
                tagColumn: column,
            });
        }
        setTimeout(() => {
            this.setState({
                tagColumn: {
                    key: 'no-one-on-selected',
                },
            });
        }, 2000);
    }

    onTagReset = () => {
        this.reset();
    }

    reset = () => {
        // const hasValueColumns = this.getHasValueColumns();
        let initialValue = {};
        this.state.columns.filter(column => column.filter).forEach(column => {
            // column.filter.clearFilters && column.filter.clearFilters();
            column.filteredValue = column.filter.initialValue || [];
            column.filter.value = column.filter.initialValue || [];
            column.filter.defaultValue = column.filter.selectedKeys = column.filter.initialValue;
            if (column.filter.defaultValue) {
                if (column.filter.type === 'date') {
                    if (column.children) {
                        column.filteredValue = Filters.onRangePickerChange(Filters.range(column.filter.defaultValue), column, column.filter.defaultValue);
                    } else {
                        column.filteredValue = Filters.onDateTimeChange(Filters.range(column.filter.defaultValue), column, column.filter.defaultValue);
                    }
                } else if (column.filter.items) {
                    column.filter.selectedKeys = column.filter.defaultValue;
                    column.filter.value = column.filter.defaultValue;
                    column.filter.text = column.filter.items.filter(item => column.filter.value.includes(item.value)).map(item => item.text);
                }
            }
            if (column.filteredValue) {
                if (column.filteredValue instanceof Object && !(column.filteredValue instanceof Array)) {
                    initialValue = { ...initialValue, ...column.filteredValue };
                } else {
                    initialValue[column.filter.dataIndex || column.key] = column.filteredValue;
                }
            }
        });

        // 在reload的时候清除选中的行
        this.onRowSelectChange([], []);
        this.load(this.setPaginationParam({
            ...this.props.param,
            ...initialValue,
        }, true));
    }

    getHasValueColumns = () => {
        const { columns } = this.state;
        return columns.filter(column => {
            if (!column.filter) {
                return false;
            }
            if (column.filter.type === "number") {
                if (column.filter.value && column.filter.value.length === 2) {
                    return typeof column.filter.value[0] === "number" || typeof column.filter.value[1] === "number";
                } else {
                    return false;
                }
            }
            return column.filter.value && (column.filter.value instanceof Array ? (column.filter.value.length > 0) : true);
        });
    }

    render() {
        const { data, loading, pagination, selectedRowKeys, exportVisible, height, width, columns, footer, tagColumn, footerColumns, totalNum } = this.state;
        const { rowKey, table, autoHeight, autoWidth, api, showFilterValue, extraTagBefore, extraTagAfter } = this.props;
        const tableRowKey = rowKey || table.rowKey;
        let tableSize = Object.getValue(window, '_user.UserConfig.tableSize', 'auto');
        const hasValueColumns = this.getHasValueColumns();
        // 是否有已筛选项
        const hasFilterValue = showFilterValue && hasValueColumns.length > 0;

        if (tableSize === 'auto') {
            if (window.innerHeight < 550) {
                tableSize = 'small';
            } else if (window.innerHeight < 750) {
                tableSize = 'middle';
            } else {
                tableSize = 'default';
            }
        }

        let lineHeight = 54;
        if (tableSize === 'default') {
            lineHeight = 54;
        } else if (tableSize === 'middle') {
            lineHeight = 47;
        } else if (tableSize === 'small') {
            lineHeight = 39;
        }
        if (table.rowSelection) {
            if (!this.tableRowSelectionOnChange) {
                this.tableRowSelectionOnChange = table.rowSelection.onChange;
            }
            table.rowSelection.onChange = this.onRowSelectChange;
        }
        if (!table.scroll) {
            table.scroll = {};
        }

        const hasFooter = !Object.isEmpty(footer) && !!totalNum;
        if (autoHeight) {
            const _height = height - lineHeight - 12;
            table.scroll.y = _height - lineHeight - (hasFooter ? lineHeight - (window.isMac ? 17 : 0) : 0);
            table.bodyStyle = { height: `${_height}px` };
        }
        if (autoWidth) {
            table.scroll.x = width;
        }
        if (!table.className) {
            table.className = '';
        }
        table.className += hasFooter ? ' has-footer' : '';
        if (window.isMac) {
            table.className += ' mac';
        }
        const footerTable = { scroll: { x: width }, size: tableSize };
        let index = 0;
        return (
            <div className="selector" ref="selector">
                {
                    (hasFilterValue || extraTagBefore || extraTagAfter) && <div className="tag-group clearfix" ref="tags">
                        {extraTagBefore && <div className="tag-buttons tag-buttons-left">{extraTagBefore}</div>}
                        {
                            hasFilterValue && <Tag onClick={() => this.onTagReset(hasValueColumns)}>重置</Tag>
                        }
                        {
                            hasValueColumns.map(column => {
                                if (column.filter.text instanceof Array && column.filter.text.length > 1) {
                                    return <Tooltip key={column.dataIndex || column.key} title={column.filter.text.join('、')} getPopupContainer={triggerNode => triggerNode.parentElement}>
                                        <Tag closable={column.filter.allowClear}
                                            onClose={e => this.onTagClose(column, e)}
                                            onClick={() => this.onTagClick(column)}
                                        ><span className="tag-name">{column.title}</span><span className="tag-value">{column.filter.text.length > 1 ? `${column.filter.text[0]}…等${column.filter.text.length}项` : column.filter.text[0]}</span></Tag>
                                    </Tooltip>;
                                } else if (column.filter.allowClear === false) {
                                    return <Tooltip key={column.dataIndex || column.key} title={'此筛选项不能清空'} getPopupContainer={triggerNode => triggerNode.parentElement}>
                                        <Tag
                                            key={column.dataIndex || column.key}
                                            closable={column.filter.allowClear}
                                            onClose={e => this.onTagClose(column, e)}
                                            onClick={() => this.onTagClick(column)}
                                        ><span className="tag-name">{column.title}</span><span className="tag-value"><Typography.Text ellipsis>{column.filter.text}</Typography.Text></span></Tag>
                                    </Tooltip>;
                                } else {
                                    return <Tag
                                        key={column.dataIndex || column.key}
                                        closable={column.filter.allowClear}
                                        onClose={e => this.onTagClose(column, e)}
                                        onClick={() => this.onTagClick(column)}
                                    ><span className="tag-name">{column.title}</span><span className="tag-value"><Typography.Text ellipsis>{column.filter.text}</Typography.Text></span></Tag>;
                                }
                            })
                        }
                        {extraTagAfter && <div className="tag-buttons">{extraTagAfter}</div>}
                        <style>
                            {`.ant-table-thead > tr > th.selector-tag-${tagColumn.dataIndex || tagColumn.key} {background: #f5f5f5;}
                            .ant-table-tbody > tr > td.selector-tag-${tagColumn.dataIndex || tagColumn.key} {background: rgba(0, 0, 0, 0.04);}`}
                        </style>
                    </div>
                }
                <Table
                    ref="table"
                    columns={columns}
                    dataSource={data}
                    pagination={pagination}
                    loading={loading}
                    onChange={this.handleTableChange}
                    rowKey={tableRowKey || (() => index++)}
                    {...hasFooter ? {
                        footer: () => {
                            return <Table {...footerTable} columns={footerColumns} dataSource={[footer]}
                                pagination={false}
                                showHeader={false} rowKey={() => 0} ref="footerTable"
                            />;
                        },
                    } : {}}
                    rowClassName={table.rowClassName || this.rowClassName}
                    size={tableSize}
                    {...table}
                ></Table>

                {
                    totalNum ? (
                        <div className="totalCount">
                            共<Statistic value={totalNum} />条数据
                            {
                                (table && table.rowSelection) ? `，已选${selectedRowKeys.length}条` : ''
                            }
                            {
                                (table && table.rowSelection && selectedRowKeys.length) ? <A onClick={() => this.onRowSelectChange([], [])}> 清空已选项</A> : ''
                            }
                            {
                                api && api._export !== false && this.props.enabledExport !== false &&
                                <A className="exportButton" onClick={() => this.setState({ exportVisible: true })}>导出结果</A>
                            }
                        </div>
                    ) : ''
                }
                <ExportExcel onExportJob={this.animeExport} visible={exportVisible} onClose={() => this.setState({ exportVisible: false })} {...this.props} {...this.state} />
                <div class="export-file" ref="exportfile">
                    <Avatar icon="file-excel" style={{ backgroundColor: '#87d068' }} />
                </div>
            </div >
        );
    }
}

export default Selector;
