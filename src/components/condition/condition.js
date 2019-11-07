import React, { Component } from 'react';
import './condition.less';
import { Row, Col, Input, Form, Radio, DatePicker, TimePicker, TreeSelect, Cascader } from 'antd';
import moment from 'moment';
import { get } from '@/axios';

const { MonthPicker, RangePicker, WeekPicker } = DatePicker;
const TreeNode = TreeSelect.TreeNode;
class Page extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currnetValue: {},
        };
    }

    async componentDidMount() {
        const { options } = this.props;
        let currnetValue = {};
        // 使用forEach会导致执行过程重新变回异步，缓存机制失效
        for (let option of options) {
            if (option.type === 'datetime') {
                currnetValue[option.startTimeName] = Page.range(option.defaultValue)[0].format('YYYY-MM-DD HH:mm:ss');
                currnetValue[option.endTimeName] = Page.range(option.defaultValue)[1].format('YYYY-MM-DD HH:mm:ss');
                option.value = Page.range(option.defaultValue);
            } else {
                currnetValue[option.conditionName] = option.defaultValue;
                // 如果有source，则从接口获取并赋值
                if (option.source) {
                    const result = await get(option.source.api, option.source.param);
                    if (result.success !== false) {
                        let items = Object.getValue(result.data || result, option.source.field);
                        items = option.source.map ? items.map(option.source.map) : items;
                        option.items = option.items ? option.items.concat(items) : items;
                    } else {
                        console.error(option.source);
                    }
                    this.setState({ currnetValue });
                }
            }
        }//s);
        this.onChange(currnetValue);
    }

    onChange = (currnetValue) => {
        this.props.onChange && this.props.onChange({ ...currnetValue });
        this.setState({ ...currnetValue });
    }

    onCustomChange = (e, option) => {
        let { currnetValue } = this.state;
        currnetValue[option.conditionName] = e.target.value;
        option.value = e.target.value;
        this.onChange(currnetValue);
    }

    onCascaderChange = (e, option) => {
        let { currnetValue } = this.state;
        currnetValue[option.conditionName] = e.join(',');
        option.value = e.join(',');
        this.onChange(currnetValue);
    }

    onDateTimeChange = (moments, option, defaultValue) => {
        let { currnetValue } = this.state;
        if (moments.length > 0) {
            currnetValue[option.startTimeName] = moments[0].format('YYYY-MM-DD HH:mm:ss');
            currnetValue[option.endTimeName] = moments[1].format('YYYY-MM-DD HH:mm:ss');
        } else {
            currnetValue[option.startTimeName] = '';
            currnetValue[option.endTimeName] = '';
        }
        option.value = moments;
        option.defaultValue = defaultValue;
        this.onChange(currnetValue);
    }

    static range(time) {
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
                startTime = moment().startOf(time);
                endTime = moment().endOf(time);
                break;
        }
        return [startTime, endTime];
    }

    render() {
        // layout:less default more
        const { options, layout, buttonSize, itemClassName } = this.props;
        const getTimeList = list => {
            var ranges = [];
            var text = new Map([['currentDay', '今天'],['yestrday', '昨天'],['lastWeek', '上周'], ['currentWeek', '本周'], ['currentMonth', '本月'],['lastMonth', '上月'], ['currentQuarter', '本季度'], ['currentYear', '本年']]);
            list.forEach(time => {
                ranges.push({
                    text: text.get(time),
                    key: time,
                    value: Page.range(time),
                });
            });
            return ranges;
        };
        let size = {
            col: {
                sm: 24, md: 24, lg: 12, xl: 8,
            },
            col2: {
                sm: 24, md: 24, lg: 24, xl: 16,
            },
            size: buttonSize ? buttonSize : 'default',
            form: 'inline',
        };
        if (layout === 'less') {
            size = {
                col: {},
                col2: {},
                size: buttonSize ? buttonSize : 'default',
                form: 'inline',
            };
        }
        if (layout === 'more') {
            size = {
                col: {
                    sm: 24, md: 12, lg: 8, xl: 6,
                },
                col2: {
                    sm: 24, md: 12, lg: 8, xl: 6,
                },
                size: buttonSize ? buttonSize : 'default',
                form: 'horizontal',
            };
        }
        return (
            <div className={`condition ${layout || 'default'}`}>
                <Form layout={size.form}>
                    <Row gutter={8} className="row">
                        {
                            options && options.map(option => (
                                <Col key={option.conditionName} className={`col ${itemClassName || ''} ${option.className || ''}`} style={option.style || {}} {...(option.type === 'datetime' ? size.col2 : size.col)}>
                                    <Form.Item label={layout === 'less' ? null : option.displayName} size={size.size}>
                                        {
                                            option.type === "input" ? (
                                                <Input placeholder={option.displayName} size={size.size} onChange={(e) => this.onCustomChange(e, option)} />
                                            ) : ''
                                        }
                                        {
                                            option.type === "custom" ? (
                                                <Radio.Group buttonStyle="solid" size={size.size} ref={ref => {
                                                    option.element = ref;
                                                }
                                                }
                                                    defaultValue={option.value || option.defaultValue}
                                                    onChange={(e) => this.onCustomChange(e, option)}>
                                                    {
                                                        option.items.map(item => (
                                                            <Radio.Button value={item.value} key={item.key || item.value}>{item.text || item.name}</Radio.Button>
                                                        ))
                                                    }
                                                </Radio.Group>
                                            ) : ''
                                        }
                                        {
                                            option.type === "tree" ? (
                                                <TreeSelect
                                                    showSearch
                                                    style={{ width: 300 }}
                                                    value={this.state.value}
                                                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                                    placeholder="Please select"
                                                    allowClear
                                                    treeDefaultExpandAll
                                                    onChange={this.onChange}
                                                >
                                                    <TreeSelect.TreeNode value="parent 1" title="parent 1" key="0-1">
                                                        <TreeNode value="parent 1-0" title="parent 1-0" key="0-1-1">
                                                            <TreeNode value="leaf1" title="my leaf" key="random" />
                                                            <TreeNode value="leaf2" title="your leaf" key="random1" />
                                                        </TreeNode>
                                                        <TreeNode value="parent 1-1" title="parent 1-1" key="random2">
                                                            <TreeNode value="sss" title={<b style={{ color: '#08c' }}>sss</b>} key="random3" />
                                                        </TreeNode>
                                                    </TreeSelect.TreeNode>
                                                </TreeSelect>
                                            ) : ''
                                        }
                                        {
                                            option.type === "datetime" ? (
                                                <div>
                                                    <RangePicker size={size.size} ref={ref => {
                                                        option.element = ref;
                                                    }
                                                    }
                                                        defaultValue={option.value}
                                                        value={option.value}
                                                        allowClear={option.allowClear}
                                                        onChange={(e) => {
                                                            this.onDateTimeChange(e, option, 'other');
                                                        }} />
                                                    <Radio.Group buttonStyle="solid" className="time-radio" size={size} ref={ref => {
                                                        option.subElement = ref;
                                                    }
                                                    }
                                                        defaultValue={option.defaultValue}
                                                        value={option.defaultValue}
                                                        onChange={(e) => this.onDateTimeChange(Page.range(e.target.value), option, e.target.value)}
                                                        style={{ marginLeft: '10px' }}>
                                                        {
                                                            getTimeList(option.datePeriods || ['currentDay', 'currentWeek', 'currentMonth', 'currentYear']).map(item => (
                                                                <Radio.Button className="time-radio-item" value={item.key} key={item.value}>{item.text || item.name}</Radio.Button>
                                                            ))
                                                        }
                                                    </Radio.Group>
                                                </div>
                                            ) : ''
                                        }
                                        {
                                            option.type === "time" ? (
                                                <TimePicker onChange={this.onChange}></TimePicker>
                                            ) : ''
                                        }
                                        {
                                            option.type === "date" ? (
                                                <DatePicker onChange={this.onChange}></DatePicker>
                                            ) : ''
                                        }
                                        {
                                            option.type === "week" ? (
                                                <WeekPicker onChange={this.onChange}></WeekPicker>
                                            ) : ''
                                        }
                                        {
                                            option.type === "month" ? (
                                                <MonthPicker onChange={this.onChange}></MonthPicker>
                                            ) : ''
                                        }
                                        {
                                            option.type === "cascader" ? (
                                                <Cascader defaultValue={option.defaultValue || []} options={option.items} onChange={(e) => this.onCascaderChange(e, option)}
                                                    placeholder={`请选择${option.displayName}`}
                                                    style={{ width: '260px' }}
                                                />
                                            ) : ''
                                        }
                                    </Form.Item>
                                </Col>
                            ))
                        }
                    </Row>
                </Form>
            </div >
        );
    }
}

export default Page;
