import React, { Component } from 'react';
import { Cascader } from 'antd';
import api from '@/model';
import { request } from '@/axios';

export default class CitySelect extends Component {
    state = {
        options: [],
    };

    async componentDidMount() {
        const provinceData = await this.getProvinceData();
        const cityData = await this.getCityData();

        this.transformDataToOptions(provinceData, cityData);
    }

    async getProvinceData() {
        const result = await request(api.selectoption, {
            dicName: 'PROVINCE',
        });

        return result.success ? result.data.options : null;
    }

    async getCityData() {
        const result = await request(api.selectoption, {
            dicName: 'CITY',
        });

        return result.success ? result.data.options : null;
    }

    transformDataToOptions(provinceData, cityData) {
        if (!provinceData || !cityData) {
            return;
        }

        let options = [];

        options = provinceData.map(province => ({
            value: province.value,
            label: province.text,
            children: [],
        }));

        cityData.forEach(city => {
            const provinceOption = options.find(
                item => +item.value === city.seniorID
            );
            if (provinceOption) {
                provinceOption.children.push({
                    value: city.value,
                    label: city.text,
                });
            } else {
                // 有部分城市的seniorID没有对应省份
                // console.log(123, city, provinceOption);
            }
        });

        this.setState({
            options,
        });
    }

    render() {
        return (
            <Cascader
                options={this.state.options}
                placeholder="选择城市"
                {...this.props}
            ></Cascader>
        );
    }
}
