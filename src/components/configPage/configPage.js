import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { Config } from '@/utils';

const configPage = (WrappedComponent, PageName, Page) => class ConnectComponent extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.applyConfig();
    }

    componentDidUpdate() {
        this.applyConfig();
    }

    applyConfig = () => {
        const { SystemConfig, getConfig } = this.props;
        const getPageConfig = getConfig || Config(SystemConfig);
        const PageConfig = getPageConfig(`V3.Pages.${PageName}`);
        if (PageConfig && PageConfig.DOMNode) {
            try {
                const dom = ReactDOM.findDOMNode(this);
                if (dom) {
                    for (let querySelector in PageConfig.DOMNode) {
                        let opt = PageConfig.DOMNode[querySelector];
                        let els = dom.querySelectorAll(querySelector);
                        for (let el of els) {
                            if (opt.remove) {
                                el.remove();
                            } else {
                                if (opt.hide) {
                                    el.style.display = 'none';
                                }
                                if (opt.innerText !== undefined) {
                                    el.innerText = opt.innerText;
                                }
                                if (opt.innerHTML !== undefined) {
                                    el.innerHTML = opt.innerHTML;
                                }
                                if (opt.attrs) {
                                    for (let attr in opt.attrs) {
                                        let val = opt.attrs[attr];
                                        if (['src', 'href'].indexOf(attr) > -1) {
                                            if (val.indexOf('~/') === 0) {
                                                val = Image.url(val);
                                            }
                                        }
                                        el.setAttribute(attr, val);
                                        if (attr === 'src') {
                                            el.css('visibility', 'hidden');
                                            el.on('load', function () {
                                                el.css('visibility', 'inherit');
                                            });
                                        }
                                    }
                                }
                                if (opt.css) {
                                    for (let css in opt.css) {
                                        let val = opt.css[css];
                                        if (['background',
                                            'background-image',
                                            'border',
                                            'border-image',
                                            'border-image-source',
                                        ].indexOf(css) > -1) {
                                            if (val.indexOf('~/') > -1) {
                                                val = Image.url(val);
                                            }
                                        }
                                        el.style[css] = val;
                                    }
                                }
                                if (opt.value !== undefined) {
                                    el.value = opt.value;
                                }
                            }
                        }
                    }
                }
            } catch (ex) {
                console.log('applyConfig Fail', PageName);
            }
        }
    }

    render() {
        return (<WrappedComponent ref={ref => {
            if (Page) {
                Page.ref = ref;
            }
            setTimeout(() => {
                this.applyConfig();
            });
        }}
            {...this.props}
        />);
    }
};

export default configPage;
