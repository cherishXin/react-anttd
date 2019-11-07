import React, { Component } from 'react';
import { Icon, Input, Button, Checkbox, DatePicker, Radio, InputNumber } from 'antd';
import moment from 'moment';
import UserTreeSelect from '@/pages/home/components/tree/userTreeSelect';
import { LicencePlateInput } from '@/components';
const A = props => <a {...props}>{props.children}</a>;

class Filters extends Component {
    static getColumnSearchProps = (column) => ({
        filterDropdown: (option) => {
            let { setSelectedKeys, selectedKeys, confirm, clearFilters } = option;
            column.filter.clearFilters = () => {
                column.filter.value = '';
                column.filter.text = '';
                clearFilters();
            };
            if (typeof selectedKeys !== "string") {
                selectedKeys = '';
            }
            return (
                <div className="selector-filter-box">
                    <Input
                        ref={node => {
                            column.filter.node = node;
                        }}
                        placeholder={`搜索 ${column.title}`}
                        onChange={e => {
                            setSelectedKeys(e.target.value);
                            // column.filter.value = e.target.value;
                            // column.filter.text = e.target.value;
                        }}
                        value={selectedKeys}
                        onPressEnter={() => {
                            const value = (selectedKeys || '').trim();
                            setSelectedKeys(value);
                            column.filter.value = value;
                            column.filter.text = value;
                            confirm();
                        }}
                        style={{ width: 188, marginBottom: 8, display: 'block' }}
                    />
                    <Button
                        type="primary"
                        onClick={() => {
                            const value = (selectedKeys || '').trim();
                            setSelectedKeys(value);
                            column.filter.value = value;
                            column.filter.text = value;
                            confirm();
                        }}
                        icon="search"
                        size="small"
                        style={{ width: 90, marginRight: 8 }}
                    >
                        搜索
            </Button>
                    <Button
                        onClick={() => column.filter.clearFilters()}
                        size="small"
                        style={{ width: 90 }}
                    >
                        重置
            </Button>
                </div>
            );
        },
        filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
                setTimeout(() => column.filter.node.select());
            }
        },
    })


    static getColumnItemsProps = (column, selector) => ({
        filterDropdown: (option) => {
            let { setSelectedKeys, selectedKeys, confirm, clearFilters } = option;
            column.filter.clearFilters = () => {
                column.filter.defaultValue = undefined;
                column.filter.value = [];
                column.filter.text = [];
                column.filter.selectedKeys = [];
                clearFilters();
                const { defaultValue, lastParams } = selector.state;
                if ((!column.filter || column.filter.allowClear) && defaultValue[column.filter.dataIndex || column.key]) {
                    delete defaultValue[column.filter.dataIndex || column.key];
                    delete lastParams[column.filter.dataIndex || column.key];
                    selector.setState({ defaultValue, lastParams }, () => {
                        selector.reload();
                    });
                }
            };
            if (column.filter.defaultValue) {
                column.filter.selectedKeys = column.filter.defaultValue;
                column.filter.value = column.filter.defaultValue;
                column.filter.text = column.filter.items.filter(item => column.filter.value.includes(item.value)).map(item => item.text);

                column.filter.defaultValue = undefined;
            }
            selectedKeys = column.filter.selectedKeys;
            return (
                <>
                    <ul className="ant-dropdown-menu ant-dropdown-menu-without-submenu ant-dropdown-menu-root ant-dropdown-menu-vertical">
                        <Checkbox.Group
                            value={selectedKeys}
                            onChange={value => {
                                column.filter.selectedKeys = selectedKeys = value;
                                setSelectedKeys(value);
                                // column.filter.value = value;
                                // column.filter.text = column.filter.items.filter(item => column.filter.value.includes(item.value)).map(item => item.text);
                            }}
                        >
                            {
                                column.filter.items.map(item =>
                                    <li key={item.value + item.text} className="ant-dropdown-menu-item">
                                        <Checkbox
                                            key={item.value + item.text}
                                            value={item.value}
                                            checked={true}
                                        >{item.text}</Checkbox>
                                    </li>
                                )
                            }
                        </Checkbox.Group>
                    </ul>
                    <div className="ant-table-filter-dropdown-btns">
                        <A
                            onClick={() => {
                                column.filter.value = selectedKeys || [];
                                column.filter.text = column.filter.items.filter(item => column.filter.value.includes(item.value)).map(item => item.text);
                                setSelectedKeys(column.filter.value);
                                confirm();

                                const { defaultValue, lastParams } = selector.state;
                                if ((!column.filter || column.filter.allowClear) && defaultValue[column.filter.dataIndex || column.key]) {
                                    delete defaultValue[column.filter.dataIndex || column.key];
                                    delete lastParams[column.filter.dataIndex || column.key];
                                    selector.setState({ defaultValue, lastParams });
                                }
                            }
                            }
                            className="ant-table-filter-dropdown-link confirm"
                        >确定</A>
                        <A
                            onClick={() => column.filter.clearFilters()}
                            className="ant-table-filter-dropdown-link clear"
                        >重置</A>
                    </div>
                </>
            );
        },
        filterIcon: () => <Icon type="filter" theme="filled" className={!column.filter.value || column.filter.value.length === 0 ? "" : "ant-table-filter-selected"} />,
    })

    static timeText = new Map([['currentDay', '今天'],['yestrday', '昨天'],['lastweek', '上周'], ['currentWeek', '本周'], ['currentMonth', '本月'],['lastmonth', '上月'], ['currentQuarter', '本季度'], ['currentYear', '本年']]);

    static getTimeList = list => {
        var ranges = [];
        list.forEach(time => {
            ranges.push({
                text: Filters.timeText.get(time),
                key: time,
                value: Filters.range(time),
            });
        });
        return ranges;
    };

    static range(time) {
        if (time === "none") {
            return [];
        }
        let startTime = moment();
        let endTime = moment();
        if (time.indexOf('current') === 0) {
            time = time.substr(7);
        }
        switch (time.toLowerCase()) {
            case 'onehour':
                startTime = moment().subtract(1, 'hour');
                endTime = moment();
                break;
            case 'eighthour':
                startTime = moment().subtract(8, 'hour');
                endTime = moment();
                break;
            case 'yestrday':
                startTime = moment().subtract(1, 'day').startOf('day');
                endTime = moment().subtract(1, 'day').endOf('day');
                break;
            case 'lastweek':
                startTime = moment().subtract(1, 'week').startOf('week');
                endTime = moment().subtract(1, 'week').endOf('week');
                break;
            case 'lastmonth':
                startTime = moment().subtract(1, 'month').startOf('month');
                endTime = moment().subtract(1, 'month').endOf('month');
                break;
            case 'lastyear':
                startTime = moment().subtract(1, 'year').startOf('year');
                endTime = moment().subtract(1, 'year').endOf('year');
                break;
            default:
                if (time === 'Week') {
                    time = 'isoWeek';
                }
                startTime = moment().startOf(time);
                endTime = moment().endOf(time);
                break;
        }
        return [startTime, endTime];
    }

    static onDateTimeChange = (moments, column, defaultValue) => {
        let currnetValue = Filters.getMomentsValue(moments, column);
        let returnValue;
        let startTimeName = column.filter.startTimeName || column.dataIndex;
        let endTimeName = column.filter.endTimeName || column.dataIndex;
        if (startTimeName !== endTimeName) {
            returnValue = {};
            if (moments.length > 0) {
                returnValue[startTimeName] = currnetValue[0];
                returnValue[endTimeName] = currnetValue[1];
            } else {
                returnValue[startTimeName] = null;
                returnValue[endTimeName] = null;
                defaultValue = 'none';
            }
        } else {
            if (moments.length > 0) {
                returnValue = currnetValue;
            } else {
                returnValue = [];
                defaultValue = 'none';
            }
        }
        column.filter.value = column.filter.selectedKeys = moments;
        column.filter.defaultValue = defaultValue;
        if (defaultValue === 'other') {
            column.filter.text = moments[0].format(column.filter.hasFilterTime ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD') + ' ~ ' + moments[1].format(column.filter.hasFilterTime ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD');
        } else {
            column.filter.text = Filters.timeText.get(defaultValue);
        }
        return returnValue;
    }
    static onRangePickerChange = (moments, column, defaultValue) => {
        let currnetValue = {};
        let startTimeName = column.filter.startTimeName || column.children[0].dataIndex;
        let endTimeName = column.filter.endTimeName || column.children[1].dataIndex;
        if (moments.length > 0) {
            currnetValue[startTimeName] = moments[0].format(column.filter.hasFilterTime ? 'YYYY-MM-DD HH:mm:00' : 'YYYY-MM-DD 00:00:00');
            currnetValue[endTimeName] = moments[1].format(column.filter.hasFilterTime ? 'YYYY-MM-DD HH:mm:59' : 'YYYY-MM-DD 23:59:59');
        } else {
            currnetValue[startTimeName] = null;
            currnetValue[endTimeName] = null;
            defaultValue = 'none';
        }
        column.filter.value = moments;
        column.filter.defaultValue = defaultValue;
        if (defaultValue === 'other') {
            column.filter.text = moments[0].format(column.filter.hasFilterTime ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD') + ' ~ ' + moments[1].format(column.filter.hasFilterTime ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD');
        } else {
            column.filter.text = Filters.timeText.get(defaultValue);
        }
        return currnetValue;
    }

    static getMomentsValue = (moments, column) => {
        if (moments.length < 2) {
            return [];
        }
        return [
            moments[0].format(column.filter.hasFilterTime ? 'YYYY-MM-DD HH:mm:00' : 'YYYY-MM-DD 00:00:00'),
            moments[1].format(column.filter.hasFilterTime ? 'YYYY-MM-DD HH:mm:59' : 'YYYY-MM-DD 23:59:59'),
        ];
    };

    static getColumnDateProps = (column) => ({
        filterDropdown: ({
            setSelectedKeys, confirm, clearFilters,
        }) => {
            column.filter.clearFilters = () => {
                if (column.filter.initialValue !== undefined) {
                    column.filter.defaultValue = column.filter.initialValue;
                    column.filteredValue = Filters.onDateTimeChange(Filters.range(column.filter.defaultValue), column, column.filter.defaultValue);
                } else {
                    column.filteredValue = column.filter.value = [];
                    column.filter.text = '';
                    column.filter.defaultValue = 'none';
                }
                clearFilters();
            };
            return (
                <div className="selector-filter-box">
                    <DatePicker.RangePicker
                        allowClear={column.filter.allowClear === undefined ? false : column.filter.allowClear}
                        value={column.filter.selectedKeys}
                        {
                        ...column.filter.hasFilterTime ? {
                            showTime: { format: 'HH:mm' },
                            format: "YYYY-MM-DD HH:mm",
                        } : {}
                        }
                        onChange={(moments) => {
                            column.filter.selectedKeys = moments;
                            setSelectedKeys(moments);
                        }}
                        onOk={(moments) => {
                            const value = Filters.onDateTimeChange(moments, column, 'other');
                            setSelectedKeys(value);
                            confirm();
                        }} />
                    <Radio.Group buttonStyle="solid" className="time-radio"
                        value={column.filter.defaultValue}
                        onChange={(e) => {
                            const currentValue = e.target.value;
                            const value = Filters.onDateTimeChange(Filters.range(currentValue), column, e.target.value);
                            setSelectedKeys(value);
                            confirm();
                        }
                        }>
                        {
                            Filters.getTimeList(column.filter.datePeriods).map(item => (
                                <Radio.Button className="time-radio-item" value={item.key} key={item.value}>{item.text || item.name}</Radio.Button>
                            ))
                        }
                    </Radio.Group>
                </div>
            );
        },
        filterIcon: () => <Icon type="filter" theme="filled" className={((!column.filter.defaultValue) || column.filter.defaultValue === "none") ? "" : "ant-table-filter-selected"} />,
    })

    static getColumnRangeProps = (column) => ({
        filterDropdown: ({
            setSelectedKeys, confirm, clearFilters,
        }) => {
            column.filter.clearFilters = () => {
                if (column.filter.initialValue !== undefined) {
                    column.filter.defaultValue = column.filter.initialValue;
                    Filters.onRangePickerChange(Filters.range(column.filter.defaultValue), column, column.filter.defaultValue);
                } else {
                    column.filter.value = [];
                    column.filter.text = '';
                    column.filter.defaultValue = 'none';
                }
                clearFilters();
            };
            return (
                <div className="selector-filter-box range-picker">
                    <DatePicker.RangePicker
                        allowClear={column.filter.allowClear === undefined ? false : column.filter.allowClear}
                        value={column.filter.value}
                        onChange={(e) => {
                            const value = Filters.onRangePickerChange(e, column, 'other');
                            setSelectedKeys(value);
                            confirm();
                        }} />
                    <Radio.Group buttonStyle="solid" className="time-radio"
                        value={column.filter.defaultValue}
                        onChange={(e) => {
                            const value = Filters.onRangePickerChange(Filters.range(e.target.value), column, e.target.value);
                            setSelectedKeys(value);
                            confirm();
                        }
                        }>
                        {
                            Filters.getTimeList(column.filter.datePeriods).map(item => (
                                <Radio.Button className="time-radio-item" value={item.key} key={item.value}>{item.text || item.name}</Radio.Button>
                            ))
                        }
                    </Radio.Group>
                </div>
            );
        },
        // filteredValue: {a: 1},
        filterIcon: () => <Icon type="filter" theme="filled" className={column.filter.defaultValue === "none" ? "" : "ant-table-filter-selected"} />,
    })

    static async getColumnOperatorsProps(column, param) {
        // 人员筛选器的树结构接口查询车场人员需要通过parkID查询，所以使用人员树筛选器的页面要传进来parkID

        return {
            filterDropdown: ({
                setSelectedKeys,
                selectedKeys,
                confirm,
                clearFilters,
            }) => {
                column.filter.clearFilters = () => {
                    column.filter.value = column.filter._value = [];
                    column.filter.text = column.filter._text = [];
                    clearFilters();
                };
                return (
                    <div className="selector-filter-box">
                        <Button
                            type="primary"
                            onClick={() => {
                                column.filter.value = column.filter._value;
                                column.filter.text = column.filter._text;
                                confirm();
                            }}
                            icon="search"
                            size="small"
                            style={{ width: 90, marginBottom: 10 }}
                        >
                            搜索
                        </Button>
                        <Button
                            onClick={() => {
                                column.filter.clearFilters();
                            }}
                            size="small"
                            style={{ width: 90, float: 'right' }}
                        >
                            重置
                        </Button>
                        <UserTreeSelect
                            param={param}
                            value={selectedKeys.map(item => 'user_' + item)}
                            selectableType="user"
                            onChange={ (value, label) => {
                                const userids = value.map(item => item.replace('user_', ''));
                                column.filter._value = userids;
                                column.filter._text = label;
                                setSelectedKeys(userids);
                            }}
                            treeSelectProps={{
                                multiple: true,
                                allowClear: true,
                                style: {width: 250},
                                placeholder: "点击选择人员",
                            }}
                        />
                    </div>
                );
            },
        };
    }

    static getColumnLicencePlateProps = (column) => {
        return {
            filterDropdown: ({
                setSelectedKeys,
                selectedKeys,
                confirm,
                clearFilters,
            }) => {
                column.filter.clearFilters = () => {
                    column.filter.value = '';
                    column.filter.text = '';
                    clearFilters();
                };
                if (typeof selectedKeys !== "string") {
                    selectedKeys = '';
                }
                return (
                    <div className="selector-filter-box">
                        <Button
                            type="primary"
                            onClick={() => {
                                const value = selectedKeys.trim();
                                setSelectedKeys(value);
                                column.filter.value = value;
                                column.filter.text = value;
                                confirm();
                            }}
                            icon="search"
                            size="small"
                            style={{ width: 90, marginBottom: 10 }}
                        >
                            搜索
                        </Button>
                        <Button
                            onClick={() => column.filter.clearFilters()}
                            size="small"
                            style={{ width: 90, float: 'right' }}
                        >
                            重置
                        </Button>
                        <LicencePlateInput
                            value={selectedKeys}
                            onChange={value => {
                                setSelectedKeys(value);
                                // column.filter.value = value;
                                // column.filter.text = value;
                            }}
                        />
                    </div>
                );
            },
        };
    }

    static getColumnNumberProps = (column) => ({
        filterDropdown: ({
            setSelectedKeys, selectedKeys, confirm, clearFilters,
        }) => {
            column.filter.clearFilters = () => {
                column.filter.value = ['', ''];
                column.filter.text = '';
                clearFilters();
            };
            return (
                <div className="selector-filter-box">
                    <div className="ant-number-group">
                        <InputNumber
                            ref={node => {
                                column.filter.node1 = node;
                            }}
                            placeholder={`最小值`}
                            value={selectedKeys[0]}
                            onChange={e => {
                                column.filter.value = [e, selectedKeys[1] || ''];
                                setSelectedKeys(column.filter.value);
                                column.filter.value = selectedKeys;
                                if (typeof column.filter.value[0] === "number" && typeof column.filter.value[1] === "number") {
                                    column.filter.text = `${column.filter.value[0]}-${column.filter.value[1]}`;
                                } else if (typeof column.filter.value[0] === "number") {
                                    column.filter.text = `≥${column.filter.value[0]}`;
                                } else if (typeof column.filter.value[1] === "number") {
                                    column.filter.text = `≤${column.filter.value[1]}`;
                                } else {
                                    column.filter.text = "";
                                }
                            }}
                            onPressEnter={() => confirm()}
                            style={{ marginRight: '8px' }}
                        />
                        <InputNumber
                            ref={node => {
                                column.filter.node2 = node;
                            }}
                            placeholder={`最大值`}
                            value={selectedKeys[1]}
                            onChange={e => {
                                column.filter.value = [selectedKeys[0] || '', e];
                                setSelectedKeys(column.filter.value);
                                column.filter.value = selectedKeys;
                                if (typeof column.filter.value[0] === "number" && typeof column.filter.value[1] === "number") {
                                    column.filter.text = `${column.filter.value[0]}-${column.filter.value[1]}`;
                                } else if (typeof column.filter.value[0] === "number") {
                                    column.filter.text = `≥${column.filter.value[0]}`;
                                } else if (typeof column.filter.value[1] === "number") {
                                    column.filter.text = `≤${column.filter.value[1]}`;
                                } else {
                                    column.filter.text = "";
                                }
                            }}
                            onPressEnter={() => confirm()}
                        />
                    </div>
                    <Button
                        type="primary"
                        onClick={() => {
                            column.filter.value = selectedKeys;
                            let minNum = column.filter.value[0];
                            let maxNum = column.filter.value[1];
                            if (typeof minNum === "number" && typeof maxNum === "number") {
                                if (minNum > maxNum) {
                                    column.filter.value[0] = maxNum;
                                    column.filter.value[1] = minNum;
                                }
                                column.filter.text = `${column.filter.value[0]}-${column.filter.value[1]}`;
                            } else if (typeof minNum === "number") {
                                column.filter.text = `≥${minNum}`;
                            } else if (typeof column.filter.value[1] === "number") {
                                column.filter.text = `≤${maxNum}`;
                            } else {
                                column.filter.text = "";
                            }
                            setSelectedKeys(column.filter.value);
                            confirm();
                        }}
                        icon="search"
                        size="small"
                        style={{ width: 90, marginRight: 8 }}
                    >
                        搜索
            </Button>
                    <Button
                        onClick={() => {
                            column.filter.clearFilters();
                        }}
                        size="small"
                        style={{ width: 90 }}
                    >
                        重置
            </Button>
                </div>
            );
        },
        onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
                setTimeout(() => column.filter.node1.focus());
            }
        },
    })
}

export default Filters;
