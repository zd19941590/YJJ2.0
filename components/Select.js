import React from 'react';
import PropTypes from "prop-types";
import {
    View, 
    TextInput,
    Text,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { getResponsiveValue, getResponsiveFontSize } from '../assets/default.theme';
import CompanyConfig from '../config/company.config.js';
import SvgUri from '../components/svguri.js';
import Svg, {
    Polygon,
} from 'react-native-svg';
import axios, { CancelToken } from 'axios';
import BaseUrl from '../config/company.app';
import SyncImgFetch from "../components/SyncImgFetch";

const dismissKeyboard = require('dismissKeyboard');


/**
 * 使用方法:model=1: <Select model={1} data={["1","2","3"]} callback={(key,value,item)=>{ }} />
 *                  <Select model={1} data={["1","2","3"]} isBackShow={true} callback={(key,value,item)=>{ }} />
 *         model=2: <Select model={2} data={["1","2","3"]} callback={(key,value,item)=>{ }} />
 *                  <Select model={2} data={[{key:"key1",value:"value1"},{key:"key2",value:"value2",icon:required('../1.png')},{key:"key3",value:"value3",icon:{uri:'http://www.baidu.com/img/**.jpg'}}]} callback={(key,value,item)=>{ }} />
 */
export default class Select extends React.Component {

    static defaultProps = {
        isBackShow: false,//model={1}   false: 不回显; true: 回显
        isTrigonShow: true,
        ajaxUrl: null,     //请求url地址
        // onBlur: () => { }
    };

    constructor(props) {
        super(props);
        this.state = {
            renderdata: [],
            isshowItems: false,
            inputtext: "",
            callbacktext: this.props.callbacktext || "请选择"//model={1} 回显
        };
        this.ajaxUrl = this.props.ajaxUrl;//请求的url
        this.isTrigonShow = this.props.isTrigonShow;
        this.isBackShow = this.props.isBackShow;
        this.data = this.props.data || [];//得到的数据
        this.model = this.props.model || 1;//模式
        this.existIcon = false;//是否有icon，true:item的样式整体向右一点;false,item居中显示
        this.defaultWidth = null;
        if (typeof props.selectViewStyle !== 'undefined' && typeof props.selectViewStyle.width !== 'undefined') {
            this.defaultWidth = props.selectViewStyle.width;
        }

        const Cancel = axios.CancelToken.source();
        this.cancelaxios = Cancel;
        // this._switchCallback = this._switchCallback.bind(this);
    };
    static propTypes = {
        selectViewStyle: PropTypes.any,
        model1textStyle: PropTypes.any,
        data: PropTypes.array,
        ajaxUrl: PropTypes.string,
        callback: PropTypes.func,
        listStyle: PropTypes.any,
        // onBlur: PropTypes.func,
        model: PropTypes.oneOf([1, 2, 3]),//1:单选不回显直接callback,2:单选可搜索回显inputtext，3：多选直接写入inputtext
    };
    componentWillUnmount() {
        this.cancelaxios.cancel();
    }

    initData(resolve = () => { }, reject = () => { }) {
        let self = this;
        if (this.data.length <= 0 && self.ajaxUrl !== null && self.ajaxUrl.length > 0) {
            axios.get(self.ajaxUrl, { cancelToken: self.cancelaxios }).then(r => {
                let rresult = result.data;
                if (rresult.success) {
                    let data = rresult.data;
                    if (data.length > 0) {
                        data.map(e => {
                            if (e.Logo !== null && e.Logo !== "") {


                                e.Logo = BaseUrl.imageBaseUrl + e.Logo;


                                e.icon = e.Logo;
                            } else {
                                e.Logo = AppConfig.defaultNoImage;
                                e.icon = AppConfig.defaultNoImage;
                            };
                            e.key = e.SysNo;
                            e.value = e.Name;
                        });
                        self.data = data;
                        resolve();
                        //self.forceUpdate();
                    }
                }
            }).catch(e => {
                reject();
            });
        }
    }

    componentDidMount() {
        this.initData();
    }
    getSelectStatus() {
        return this.state.isshowItems ? 'show' : 'hide';
    }
    show() {
        if (this.model === 1) {
            if (!this.state.isshowItems) {
                this.setState({ isshowItems: true });
            }
        }
    }
    hide() {
        if (this.model === 1) {
            if (this.state.isshowItems) {
                this.setState({ isshowItems: false });
            }
        }
    }
    toggle() {
        if (this.model === 1) {
            this.setState({ isshowItems: !this.state.isshowItems })
        }
    }
    _renderItems(item) {
        let self = this;
        if (typeof (item) === 'string') {
            return (
                <View style={{ flexDirection: 'row', width: getResponsiveValue(200), alignItems: 'center', justifyContent: 'center', zIndex: 33 }}>
                    {this.existIcon ? <View /> : null}
                    <Text style={{ color: "#000", fontSize: 13, textAlign: 'left', textAlignVertical: 'center' }}>
                        {item}
                    </Text>
                </View>
            );
        }
        else if (typeof (item) === 'object') {
            item.value = (typeof item.value === 'undefined' ? item.Value : item.value);
            item.key = (typeof item.key === 'undefined' ? item.Key : item.key);
            if (typeof (item.icon) === 'object' && React.isValidElement(item.icon)) {
                return (
                    <View style={[{ flexDirection: 'row', width: getResponsiveValue(220), alignItems: 'center', justifyContent: 'center', }, { width: this.defaultWidth }]}>
                        <View>
                            {item.icon}
                        </View>
                        <Text style={{ color: "black", fontSize: getResponsiveFontSize(28), marginLeft: getResponsiveValue(16), textAlign: 'center', }}>
                            {item.value}
                        </Text>
                    </View>
                );
            } else if (item.icon) {//目前调试了这个模式的
                return (
                    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }, { width: this.defaultWidth }]}>

                        <SyncImgFetch
                            imgStyle={{
                                width: getResponsiveValue(40),
                                height: getResponsiveValue(40),
                                borderRadius: getResponsiveValue(20),
                                marginHorizontal: getResponsiveValue(25),
                            }}
                            imgSource={item.icon}
                            imgSize={0}
                        />

                        {/* <Image source={item.icon} style={{
                            width: getResponsiveValue(40),
                            height: getResponsiveValue(40),
                            borderRadius: getResponsiveValue(20),
                            marginHorizontal: getResponsiveValue(25),
                        }} /> */}


                        <Text style={{ color: "#0071e0", fontSize: getResponsiveFontSize(28), textAlign: "left", textAlignVertical: "center" }}>
                            {item.value}
                        </Text>
                    </View >
                );
            }
            return (
                <View style={[{ flexDirection: 'row', width: 300, alignItems: 'center', justifyContent: 'flex-start' }, typeof this.props.listItemSytle !== 'undefined' ? this.props.listItemSytle : null, { width: this.defaultWidth }]}>
                    {this.existIcon ? <View /> : null}
                    <Text style={{ color: "#000", fontSize: getResponsiveFontSize(28), textAlign: 'left', textAlignVertical: 'center' }}>
                        {item.value}
                    </Text>
                </View>
            );
        }
    }


    _switchCallback = (item, index, callback) => {
        let model = this.model;
        if (typeof (this.props.onChangeText) === 'function') {
            this.props.onChangeText("");
        }
        switch (model) {
            case 1:
                if (typeof (item) === 'string') {
                    this.state.callbacktext = item;
                    callback(index, item);
                } else if (typeof (item) === 'object') {
                    if (typeof (item.key) !== 'undefined' && typeof (item.value) === 'string') {
                        this.state.callbacktext = item.value;
                        callback(item.key, item.value, item);
                    } else {
                        this.state.callbacktext = item.value;
                        callback(index, item.value, item);
                    }

                };
                break;
            case 2:
                if (typeof (item) === 'object') {
                    item.value = (typeof item.value === 'undefined' ? item.Value : item.value);
                    item.key = (typeof item.key === 'undefined' ? item.Key : item.key);
                    this.state.inputtext = item.value;
                    callback(item.key, item.value, item);
                };
                break;
            default:
                break;
        }
        this.setState({ isshowItems: false });
    }



    _selectItems(renderdata: Array, callback: (key, value, item) => Function) {
        if (this.state.isshowItems) {
            if (renderdata.length > 0) {
                return (
                    <FlatList style={[{
                        position: "absolute",
                        top: 15,
                        zIndex: 20,
                        maxHeight: getResponsiveValue(300),
                        width: getResponsiveValue(220),
                        backgroundColor: '#ffffff',//模式1 需要的背景色
                        borderBottomRightRadius: getResponsiveValue(20),
                        borderBottomLeftRadius: getResponsiveValue(20),
                    }, this.props.listStyle, { width: this.defaultWidth }]}
                        ItemSeparatorComponent={() => {
                            return (
                                <View style={[{
                                    height: getResponsiveValue(2),
                                    backgroundColor: '#9999994d',
                                    width: getResponsiveValue(180),
                                    alignSelf: 'center'
                                }, this.props.itemSeparatorStyle]} />
                            )
                        }}
                        numColumns={1}
                        data={renderdata}
                        keyExtractor={(item, index) => index.toString()}
                        getItemLayout={(data, index) => ({
                            length: getResponsiveValue(70),
                            offset: (getResponsiveValue(100)) * index,
                            index
                        })}
                        initialNumToRender={3}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity key={index}
                                activeOpacity={0.8}
                                style={[{
                                    height: getResponsiveValue(70),
                                    width: getResponsiveValue(643),
                                    justifyContent: 'center',
                                }, this.props.itemStyle, { width: this.defaultWidth }]}
                                onPress={(event) => {
                                    this._switchCallback(item, index, callback);
                                }}>
                                {/* <View style={[{ width: getResponsiveValue(643), alignSelf: 'flex-end' }, this.props.itemStyle && this.props.itemStyle.width ? { width: this.props.itemStyle.width } : null]}> */}
                                {this._renderItems(item)}
                                {/* </View> */}
                            </TouchableOpacity>
                        )}
                    />
                );
            }
            return null;
        }
        return null;
    }
    filterinputtext() {
        let self = this;
        if (self.props.data && self.props.data !== null && self.props.data.length > 0 && self.state.inputtext.trim().length > 0) {
            self.state.renderdata = [];
            if (self.state.inputtext.trim().length >= 2) {//必须输入两个字符以上
                self.props.data.forEach((data, index) => {
                    if (data.Name.indexOf(self.state.inputtext.trim()) >= 0) {
                        self.state.renderdata.push(data);
                    }
                });
            }
        }

    }
    render() {
        let self = this;
        let renderdata;
        self.filterinputtext();
        // if (self.state.renderdata.length === 0 || this.state.inputtext.length === 0) {
        //     renderdata = self.state.renderdata = self.data;
        // } else {

        switch (self.model) {
            case 1:
                renderdata = self.data;
                break;
            case 2:
                if (self.state.inputtext.trim().length > 0) {
                    renderdata = self.state.renderdata;
                } else {
                    renderdata = self.data;
                };
                break;
            default:
                break;
        }

        // }
        if (typeof self.props.Colorconfig !== 'undefined' && self.props.Colorconfig !== null) {
            this.config = self.props.Colorconfig;
        } else {
            this.config = CompanyConfig;
        }
        if (renderdata !== 'undefined' && renderdata.length >= 0) {
            self.existIcon = renderdata.some((e) => {
                return (typeof e === 'object' && (typeof (e.icon) === 'object' || typeof (e.icon) === 'number'));
            });
            let callback;
            if (typeof (self.props.callback) === 'function') {
                callback = self.props.callback;
            }

            //callback = (k, v) => console.log("index" + k + "----   value" + v);
            // renderdata = [{ key: "3", value: "修改" }, { key: "5", value: "svg", icon: <View><SvgUri width={getResponsiveValue(20)} height={getResponsiveValue(20)} fill={"red"} source={"back"} /></View> }, "修raer改", "gagegr"];
            switch (self.model) {
                case 1:
                    return (
                        <View style={[{ position: 'absolute', right: 0, zIndex: 200 }, typeof self.props.selectViewStyle === 'undefined' ? null : self.props.selectViewStyle]}>
                            <TouchableOpacity
                                style={[{
                                    width: getResponsiveValue(88),
                                    height: getResponsiveValue(78),
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    alignSelf: 'flex-end',
                                }, typeof self.props.selectTouchableStyle === 'undefined' ? null : self.props.selectTouchableStyle, { width: self.defaultWidth }]}
                                onPress={() => {
                                    self.toggle();
                                }}
                                activeOpacity={0.9}
                            >
                                {self.isBackShow ? (
                                    <Text style={[{
                                        fontSize: getResponsiveFontSize(50),
                                        textAlign: 'center',
                                        backgroundColor: 'transparent'
                                    }, typeof self.props.model1textStyle === 'undefined' ? null : self.props.model1textStyle]}>{self.state.callbacktext}</Text>
                                ) : (
                                        <Text style={[{
                                            fontSize: getResponsiveFontSize(50),
                                            textAlign: 'center',
                                            backgroundColor: 'transparent'
                                        }, typeof self.props.model1textStyle === 'undefined' ? null : self.props.model1textStyle]}>···</Text>
                                    )}
                            </TouchableOpacity>
                            {
                                self.state.isshowItems ?
                                    (
                                        <View style={[{ width: getResponsiveValue(220), minHeight: getResponsiveValue(300), zIndex: 500 }, { width: self.defaultWidth }]}>
                                            {self.isTrigonShow ?
                                                <View style={[{ height: 16, width: getResponsiveValue(220), justifyContent: 'center', alignItems: 'center', marginLeft: getResponsiveValue(35) }]}>
                                                    <Svg height={16} width={28}>
                                                        <Polygon
                                                            points="0,16 16,0 28,16"
                                                            fill={(typeof self.props.itemStyle !== 'undefined') && (typeof self.props.itemStyle.backgroundColor !== 'undefined') ? self.props.itemStyle.backgroundColor : "#FFFFFF"}
                                                        />
                                                    </Svg>
                                                </View> : null}
                                            {self._selectItems(renderdata, callback)}
                                        </View>
                                    ) :
                                    null
                            }
                        </View >
                    );
                    break;
                case 2:
                    return (
                        <View  >
                            <View style={{
                                flexDirection: 'row',
                                width: getResponsiveValue(643),
                                marginTop: getResponsiveValue(10),
                                height: getResponsiveValue(73),
                            }}>
                                <View style={{ marginTop: getResponsiveValue(28) }}><SvgUri width={getResponsiveValue(25)} height={getResponsiveValue(32)} opacity={0.6} fill={this.config.AppColor.ContentFront} source="building" />
                                </View>
                                <TextInput
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    selectTextOnFocus={false}
                                    ref={(val) => self.manufacturer = val}
                                    placeholder={this.props.placeholder}
                                    onLayout={this.props.onLayout}
                                    keyboardType={'default'}
                                    returnKeyType={'next'}
                                    defaultValue={this.state.inputtext}
                                    disableFullscreenUI={true}
                                    underlineColorAndroid={'transparent'}
                                    placeholderTextColor={this.config.AppColor.ContentFront}
                                    onChangeText={(ManuFacturerName) => {
                                        ManuFacturerName = ManuFacturerName.trim();
                                        if (typeof (self.props.onChangeText) === 'function') {
                                            self.props.onChangeText(ManuFacturerName);
                                        }
                                        if (ManuFacturerName.length > 0) {
                                            this.setState({ inputtext: ManuFacturerName });
                                            this.state.isshowItems = true;
                                        } else {
                                            this.setState({ isshowItems: false, inputtext: "" })
                                            //this.state.isshowItems = true;
                                        }
                                    }}
                                    onFocus={() => {
                                        if (self.data.length <= 0) {
                                            self.initData(() => {
                                                //self.state.isshowItems = true;
                                            });
                                        } else {
                                            //this.setState({ isshowItems: true });
                                        }
                                    }}
                                    style={[{
                                        width: getResponsiveValue(560),
                                        marginTop: getResponsiveValue(15),
                                        marginLeft: getResponsiveValue(10),
                                        height: getResponsiveValue(73),
                                        padding: 0,
                                        borderColor: "transparent",
                                        textAlign: 'left',
                                        alignSelf: 'center',
                                        opacity: 0.6,
                                        color: this.config.AppColor.ContentFront
                                    }, this.props.selectViewStyle]}


                                    onSubmitEditing={() => {
                                        dismissKeyboard();
                                        // this.props.props.focus();
                                    }}>
                                </TextInput>
                                {self.state.inputtext.length > 0 ?
                                    (<View style={{ marginTop: getResponsiveValue(28) }}><SvgUri width={getResponsiveValue(35)} height={getResponsiveValue(32)} fill={this.config.AppColor.ContentFront} source="sure" /></View>)
                                    :
                                    (<View style={{ marginTop: getResponsiveValue(28), opacity: 0.4 }}><SvgUri width={getResponsiveValue(35)} height={getResponsiveValue(32)} fill={this.config.AppColor.ContentFront} source="search" /></View>)
                                }
                            </View>
                            <View style={{
                                backgroundColor: this.config.AppColor.ContentFront,
                                opacity: 0.4,
                                borderColor: 'transparent',
                                width: getResponsiveValue(643),
                                height: getResponsiveValue(1)
                            }}>
                            </View>
                            <View>
                                {this._selectItems(renderdata, callback)}
                            </View>
                        </View>
                    );
                case 3:
                    return (<View></View>);
                default:
                    break;
            }
        }
        else {
            return null;
        }
    }
};
