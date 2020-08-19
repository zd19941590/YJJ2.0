import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    Dimensions,
    
} from 'react-native';
import PropTypes from "prop-types";
import CompanyConfig from '../config/company.config.js';
import AppConfig from '../config/app.config.js';
import SvgUri from '../components/svguri.js';
import { getResponsiveValue, getResponsiveFontSize, FontSize, Colors, BgColors } from "../assets/default.theme";
import { StyleConfig } from '../config/style.config.js';
//#region Styles
let windowHeight = Dimensions.get('window').height;
let windowWidth = Dimensions.get('window').width;

let pageStyles = null;

function setStyle() {
    if (pageStyles != null && !CompanyConfig.isGeneral()) return pageStyles;

    pageStyles = StyleSheet.create({

        baseView: {
            flex: 1,
            backgroundColor: "#f3f6fb",
        },

        //#region HeaderStyles

        header: {
            width: getResponsiveValue(AppConfig.design.width),
            height: getResponsiveValue(90),
            backgroundColor: "#ffffff",

            flexDirection: 'row',
            alignItems: 'center'
        },
        headerLeft: {
            width: getResponsiveValue(1005),
            flexDirection: 'row',
            alignItems: 'center',
        },

        back: {
            height: getResponsiveValue(69),
            width: getResponsiveValue(73),
            borderRadius: getResponsiveValue(40),
            alignItems: "center",
            justifyContent: "center"
        },
        titleText: {
            width: getResponsiveValue(58),
            height: getResponsiveValue(28),
            fontSize: getResponsiveFontSize(23),
            textAlignVertical: 'center',
            includeFontPadding: false,
            color: CompanyConfig.AppColor.SecondaryFront,
            backgroundColor: 'transparent',
        },

        headerButtonGroup: {
            width: getResponsiveValue(448),
            position: "absolute",
            zIndex: 2,
            right: 0,
            flexDirection: 'row',
            alignItems: 'center'
        },

        choiceProductButton: {
            width: getResponsiveValue(224),
            height: getResponsiveValue(90),
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        },
        choiceProductButtonText: {
            width: getResponsiveValue(117),
            height: getResponsiveValue(29),
            marginLeft: getResponsiveValue(11),
            color: "#969ca2",
            fontSize: getResponsiveFontSize(25),
            //设置文字在Text中垂直居中
            textAlignVertical: 'center',
            includeFontPadding: false,
        },
        addCustomerButton: {
            width: getResponsiveValue(224),
            backgroundColor: "#969ca2",
            height: getResponsiveValue(90),
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        },
        addCustomerButtonText: {
            width: getResponsiveValue(117),
            height: getResponsiveValue(29),
            marginLeft: getResponsiveValue(10),
            color: "#ffffff",
            fontSize: getResponsiveFontSize(25),
            //设置文字在Text中垂直居中
            textAlignVertical: 'center',
            includeFontPadding: false,
        },

        //#endregion

        contentView: {
            height: windowHeight - getResponsiveValue(100),
            marginTop: getResponsiveValue(10),
            flexDirection: 'row',

        },
        customerItemView: {
            width: getResponsiveValue(238),
            height: getResponsiveValue(100),
            position: 'absolute',
            left: 0,
            top: 0,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
        },
        customerItemNameView: {
            // width: getResponsiveValue(238),
            height: getResponsiveValue(30),
            marginTop: getResponsiveValue(23),
            marginLeft: getResponsiveValue(39),
            flexDirection: 'row',
            alignItems: 'center',
        },

        customerItemNameText: {
            width: getResponsiveValue(87),
            height: getResponsiveValue(28),
            fontSize: getResponsiveFontSize(21),
            marginLeft: getResponsiveValue(15),
            //设置文字在Text中垂直居中
            textAlignVertical: 'center',
            includeFontPadding: false,
        },

        customerItemPhoneText: {
            //设置文字在Text中垂直居中
            textAlign: 'center',
            fontSize: getResponsiveFontSize(30),
            textAlignVertical: 'center',
            includeFontPadding: false,
        },

        customerItemDeleteView: {
            width: getResponsiveValue(113),
            height: getResponsiveValue(106),
            backgroundColor: '#fd180d',
            justifyContent: 'center',
            alignItems: 'center',
            // marginLeft: getResponsiveValue(5),
        },

        customerItemDeleteText: {

            width: getResponsiveValue(58),
            height: getResponsiveValue(28),
            fontSize: getResponsiveFontSize(24),
            //设置文字在Text中垂直居中
            textAlignVertical: 'center',
            includeFontPadding: false,
        },

        customerItemDetailText: {
            position: 'absolute',
            zIndex: 1,
            width: getResponsiveValue(58),
            height: getResponsiveValue(29),
            fontSize: getResponsiveFontSize(24),
            left: getResponsiveValue(35),
            top: getResponsiveValue(39),
            //设置文字在Text中垂直居中
            textAlignVertical: 'center',
            includeFontPadding: false,
        },
        //#endregion
        //#endregion
    });

    return pageStyles;
}


//#endregion



export default class TabList extends Component {

    static defaultProps = {
        NeedScrollTo: false,
    };
    static propTypes = {
        flatListStyle: PropTypes.object,  //样式
        data: PropTypes.arrayOf(PropTypes.string),
        NeedScrollTo: PropTypes.bool,
    };
    constructor(props) {
        super(props);
        this.tempdata = [];

        if (typeof (props.data) !== 'undefined' && props.data.length > 0) {
            props.data.map((v, i) => {
                this.tempdata.push({ selected: false, value: v });
            });
            this.tempdata[0].selected = true;
        };
        this.NeedScrollTo = props.NeedScrollTo;
        this.state = {
            data: this.tempdata,
        };
        this._onpress = this._onpress.bind(this);
        this.PushData = this.PushData.bind(this);
    }

    PushData(data: Array) {
        this.tempdata = [];
        if (data.length > 0) {
            data.map((v, i) => {
                this.tempdata.push({ selected: false, value: v });
            })
        }
        this.tempdata[0].selected = true;
        this.setState({ data: this.tempdata });
    }


    _scrollRender(index: number) {
        this.tempdata.map((v, i) => {
            v.selected = false;
        })
        this.tempdata[index].selected = true;
        //this.state.change.in = this.state.change.out;
        // this.state.change.out = index;
        this.setState({
            data: this.tempdata
        });

    }

    _onpress(index: number) {
        this.tempdata.map((v, i) => {
            v.selected = false;
        })
        this.tempdata[index].selected = true;
        let onPress = () => { };
        if (typeof this.props.onPress === 'function') {
            onPress = this.props.onPress;
        }
        onPress(this.tempdata[index].value, index);
        // this.state.change.in = this.state.change.out;
        //this.state.change.out = index;
        this.setState({
            data: this.tempdata
        });

    };
    scrollToIndex(index) {
        let self = this;
        if (index < 1) {
            index = 0;
        } else if (--index > self.tempdata.length) {
            index = self.tempdata.length - 1;
        }
        if (self.NeedScrollTo) {
            self.fl.scrollToIndex({ animated: true, index: index });
        }
        self._scrollRender(index);
    }

    render() {
        setStyle();
        let self = this;
        let dataSource = self.state.data;
        if (typeof (self.props.data) !== 'undefined' && self.props.data.length > 0 && self.props.data.length > self.state.data.length) {
            self.tempdata = [];
            self.props.data.map((v, i) => {
                self.tempdata.push({ selected: false, value: v });
            });
            self.tempdata[0].selected = true;
            self.state.data = self.tempdata;
            dataSource = self.tempdata;
        };
        let flatListStyle = typeof this.props.flatListStyle !== 'undefined' ? this.props.flatListStyle : {};
        let fheight = { maxHeight: windowHeight - (typeof flatListStyle.top !== 'undefined' ? flatListStyle.top : getResponsiveValue(106)) };
        if (JSON.stringify(flatListStyle) !== "{}") {
            let fmaxHeight = this.props.flatListStyle.maxHeight, fHeight = this.props.flatListStyle.height;
            if (typeof fHeight !== 'undefined') {
                fheight = {};
                fheight.height = fHeight;
            } else if (typeof fmaxHeight !== 'undefined') {
                fheight.maxHeight = fmaxHeight;
            }
        };
        return (
            <View style={[flatListStyle]}>
                <FlatList
                    ref={(ref) => this.fl = ref}
                    style={{ ...fheight }}
                    numColumns={1}
                    initialNumToRender={3}
                    data={dataSource}
                    removeClippedSubviews={true}
                    getItemLayout={(item, index) => ({ length: getResponsiveValue(106), offset: getResponsiveValue(106) * index + getResponsiveValue(10), index })}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <TabItem data={item} index={index} onPress={() => { this._onpress(index) }} />
                    )}
                    ItemSeparatorComponent={() => {
                        return <View style={{ height: getResponsiveValue(10) }}></View>
                    }}
                />
            </View>
        );
    }


}
export class TabItem extends Component {
    static propTypes = {
        data: PropTypes.object,  //客户,
        onPress: PropTypes.func,
        index: PropTypes.number,
        //change: PropTypes.object,
    }
    RrapezoidDefaultColor = StyleConfig.Main;   //背景梯形默认颜色
    RrapezoidSelectedColor = CompanyConfig.AppColor.ButtonBg;   //背景梯形选中颜色
    UserIconDefaultColor = StyleConfig.SecondaryFront;//User图标默认颜色
    UserIconSelectedColor = CompanyConfig.AppColor.ButtonFront;   //User图标选中颜色
    NameDefaultColor = StyleConfig.SecondaryFront;  //名字默认颜色
    NameSelectedColor = CompanyConfig.AppColor.ButtonFront;  //名字选中颜色
    PhoneDefaultColor = StyleConfig.SecondaryFront;  //电话默认颜色
    PhoneSelectedColor = CompanyConfig.AppColor.ButtonFront;  //电话选中颜色
    constructor(props) {
        super(props);

        this.state = {
            data: Object.assign({}, props.data),
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.data.selected === this.state.data.selected && nextProps.data.value === this.state.data.value) {
            return false;
        } else {
            this.state.data = Object.assign({}, nextProps.data);
            return true;
        }
    }
    render() {
        setStyle();
        let selectedbgColor = null, selectedtextColor = null, self = this;
        if (self.props.data.selected) {
            selectedbgColor = this.RrapezoidSelectedColor;
            selectedtextColor = this.NameSelectedColor;
        } else {
            selectedbgColor = this.RrapezoidDefaultColor;
            selectedtextColor = this.NameDefaultColor;
        }
        let onPress = () => { };
        if (typeof this.props.onPress === 'function') {
            onPress = this.props.onPress;
        }
        return (
            <View style={{ width: getResponsiveValue(238) }}   >
                <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={() => { onPress() }}
                    style={{ flex: 1 }}>
                    <View style={{ width: getResponsiveValue(238), height: getResponsiveValue(100) }}>
                        <View style={{ flex: 1 }} >
                            <SvgUri width={getResponsiveValue(238)} height={getResponsiveValue(100)} fill={selectedbgColor} source="trapezoid" />
                        </View>
                        <View style={[pageStyles.customerItemView]}>
                            <Text style={[pageStyles.customerItemPhoneText, { color: selectedtextColor, backgroundColor: 'transparent' }]}>{self.state.data.value}</Text>
                        </View>

                    </View>
                </TouchableOpacity>

            </View>
        );
    }
}
