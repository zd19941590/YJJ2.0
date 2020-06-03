import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableHighlight,
    TouchableOpacity,
} from 'react-native';
// import envConfig from '../config/app.config.js';
import CompanyConfig from '../config/company.config.js';
import { getResponsiveValue, getResponsiveFontSize } from '../assets/default.theme.js';
// import { NavigationActions } from 'react-navigation';
import PropTypes from "prop-types";
import AppConfig from '../config/app.config.js';
import SvgUri from '../components/svguri.js';
import { StyleConfig } from '../config/style.config.js';
// const storage = global.storage;
// const maxHistory = 10;    //最多存储10个搜索历史

let pageStyles = null;

function setStyle() {
    if (pageStyles != null && !CompanyConfig.isGeneral()) return pageStyles;

    pageStyles = StyleSheet.create({
        baseView: {
            flex: 1,
            width: getResponsiveValue(AppConfig.design.width),
            height: getResponsiveValue(88),
            position: "absolute",
            zIndex: 200,
            backgroundColor: StyleConfig.modelBackground
        },

        topView: {
            marginTop: getResponsiveValue(10),
            height: getResponsiveValue(88),
            width: getResponsiveValue(1334),
            flexDirection: "row",

        },

        back: {
            height: getResponsiveValue(69),
            width: getResponsiveValue(73),
            borderRadius: getResponsiveValue(40),
            alignItems: "center",
            justifyContent: "center"
        },

        backImage: {
            width: getResponsiveValue(23),
            height: getResponsiveValue(40),
            backgroundColor: StyleConfig.PopupBackground
        },

        searchTextView: {
            width: getResponsiveValue(1170),
            height: getResponsiveValue(69),
            borderRadius: 10,
            backgroundColor: StyleConfig.Secondary,
            flexDirection: "row",
            borderColor:StyleConfig.ContentFront,
        },
        searchTextIcon: {
            marginLeft: getResponsiveValue(20),
            marginTop: getResponsiveValue(19),
            width: getResponsiveValue(39),
            height: getResponsiveValue(32),
            opacity: 0,
        },

        searchTextIconReal: {
            position: 'absolute',
            zIndex: 205,
            left: getResponsiveValue(93),
            top: getResponsiveValue(19),
            width: getResponsiveValue(39),
            height: getResponsiveValue(32),
            opacity: 0.4,
        },

        searchTextInput: {
            marginLeft: getResponsiveValue(27),
            width: getResponsiveValue(1050),
            height: getResponsiveValue(69),
            // borderColor: StyleConfig.PopupBackground,
            padding: 0,
            fontSize: getResponsiveFontSize(32),
            textAlignVertical: 'center'
        },

        searchTextTouch: {
            height: getResponsiveValue(69),
            width: getResponsiveValue(91),
            borderRadius: getResponsiveValue(40),
            alignItems: "center",
            justifyContent: "center"
        },

        searchButtom: {
            marginTop: getResponsiveValue(14),
            marginLeft: getResponsiveValue(60),
        },

        //最近搜索提示文字样式
        LatelyPromptText: {
            marginTop: getResponsiveValue(15),
            fontSize: getResponsiveFontSize(26),
            color: "#383838",
        },

        latelyTextView: {
            flexDirection: "row",
            flexWrap: 'wrap',  //自动换行
        },

        HistorySearchItemView: {
            height: getResponsiveValue(55),
            marginLeft: getResponsiveValue(20),
            marginTop: getResponsiveValue(20),
            borderRadius: getResponsiveValue(10),
            backgroundColor: "#f4f4f4",

        },

        HistorySearchItemViewNoColor: {
            height: getResponsiveValue(55),
            marginLeft: getResponsiveValue(20),
            marginTop: getResponsiveValue(10),
            borderRadius: getResponsiveValue(10)
        },

        HistorySearchItemViewNoColor2: {
            position: 'absolute',
            height: getResponsiveValue(55),
            left: getResponsiveValue(20),
            top: getResponsiveValue(10),
            borderRadius: getResponsiveValue(10)
        },

        HistorySearchItemText: {
            marginLeft: getResponsiveValue(26),
            marginRight: getResponsiveValue(26),
            fontSize: getResponsiveFontSize(32),
            textAlign: 'center',
            textAlignVertical: 'center',
            color: '#a0a1a7'
        },

        HistorySearchItemHiddenText: {
            marginLeft: getResponsiveValue(26),
            marginRight: getResponsiveValue(26),
            fontSize: getResponsiveFontSize(32),
            textAlign: 'center',
            textAlignVertical: 'center',

            color: '#ffffff',
            opacity: 0,
            // backgroundColor: 'gray'
        },

        HistorySearchItemHiddenText2: {
            marginLeft: getResponsiveValue(26),
            marginRight: getResponsiveValue(26),
            marginTop: getResponsiveValue(4),
            fontSize: getResponsiveFontSize(32),
            textAlign: 'center',
            textAlignVertical: 'center',
            color: '#ffffff',
        },

        HistorySearchItemTextNoColor: {
            left: getResponsiveValue(45),
            top: getResponsiveValue(13),
            fontSize: getResponsiveFontSize(32),
            textAlign: 'center',
            textAlignVertical: 'center',
            position: 'absolute',
            zIndex: 205
        },

        latelyText: {
            marginLeft: getResponsiveValue(20),
            marginRight: getResponsiveValue(20),
            marginTop: getResponsiveValue(15),
            // marginBottom:getResponsiveValue(10),
            fontSize: getResponsiveFontSize(28),
            textAlign: 'center',
            textAlignVertical: 'center'
        },

        itemGroup: {
            flexDirection: "row",
            flexWrap: 'wrap',
            width: getResponsiveValue(1210)
        },

        rowNameText: {
            marginTop: getResponsiveValue(18),
            fontSize: getResponsiveFontSize(22),
            opacity: 0.4,
            color: "#ffffff",
            width: getResponsiveValue(51)
        },
        rowView: {
            width: getResponsiveValue(1334),
        },

        rowRightView: {
            width: getResponsiveValue(1261),
            marginLeft: getResponsiveValue(73),
            marginTop: getResponsiveValue(20),
            flexDirection: "row",
        },

        rowRightView_History: {
            width: getResponsiveValue(1261),
            marginLeft: getResponsiveValue(73),
            marginTop: getResponsiveValue(0),
            flexDirection: "row",
        },


        rightBlock: {
            height: getResponsiveValue(69),
            width: getResponsiveValue(91),
            alignItems: "center",
            justifyContent: "center"
        },

        numberView: {
            width: getResponsiveValue(40),
            height: getResponsiveValue(30),
            left: getResponsiveValue(45),
            top: getResponsiveValue(0),
            borderRadius: 15,
            backgroundColor: "red",
            position: 'absolute',
            zIndex: 10,
            justifyContent: 'center',
            alignItems: 'center',
        },

        numberText: {
            fontSize: getResponsiveFontSize(16),
            color: 'white',
            textAlign: 'center',
            textAlignVertical: 'center',
            includeFontPadding: false,
        },

    });

    return pageStyles;
}


export default class SimpleSearch extends Component {
    static propTypes = {
        showSearch: PropTypes.func,
        onChangeText: PropTypes.func,    //搜索关键字变更事件
        onSearch: PropTypes.func,      //搜索事件
        onRightButtonClick: PropTypes.func,   //右侧按钮点击事件
        onBack: PropTypes.func,   //返回事件

        placeholder: PropTypes.any,
    };

    status;
    constructor(prop) {
        super(prop);
        this.state = {
            SearchText: '',
            HisotrySearchTexts: [],
            Show: true,
        }
    }
    IsMounted = false;

    UNSAFE_componentWillMount() {
        this.IsMounted = true;
    }

    componentWillUnmount() {
        this.IsMounted = false;
    }
    search = () => {
        var searchObj = {
            SearchText: this.state.SearchText,
        }
        this.saveSearchHistory(this.state.SearchText);
    }

    historySearch(historyText) {
        this.setState({ SearchText: historyText });

    }

    searchTextChange(newText) {
        this.setState({ SearchText: newText });

        if (typeof (this.props.onChangeText) != 'undefined' && this.props.onChangeText != null) {
            this.props.onChangeText(newText);
        }
    }
    async loadFromStorage(key) {
        let data = null;
        await global.storage.load({
            key: key,
            autoSync: false,
        }).then(result => {
            data = result;

        }).catch(err => {
            switch (err.name) {
                case 'NotFoundError':
                    break;
                case 'ExpiredError':
                    break;
            }
        });

        return data;
    }

    show() {
        this.loadHistory();
        this.setState({ Show: true });
        // this.forceUpdate();
    }
    hide() {
        this.setState({ Show: false });
        //this.forceUpdate();
    }

    onSearch() {
        if (typeof (this.props.onSearch) != 'undefined' || this.props.onSearch != null) {
            this.props.onSearch(this.state.SearchText);
        }
    }

    onRightButtonClick() {
        if (typeof (this.props.onRightButtonClick) == 'function') {
            this.props.onRightButtonClick();
        }
    }

    onBack() {
        if (typeof (this.props.onBack) == 'function') {
            this.props.onBack();
        }

        // this.props.navigation.goBack();
    }

    initRightNumber(defaultNumber) {
        this.refs["rightButton"].initNumber(defaultNumber);
    }

    render() {
        setStyle();
        if (!this.state.Show) return null;



        return (

            <View style={pageStyles.baseView}>
                <View style={pageStyles.topView}>
                    <TouchableHighlight  underlayColor={CompanyConfig.AppColor.OnPressSecondary} style={pageStyles.back}  onPress={() => { this.onBack() }} activeOpacity={0.8}  >
                        <View><SvgUri width={getResponsiveValue(40)} height={getResponsiveValue(40)} fill={StyleConfig.Main} source="back" /></View>
                    </TouchableHighlight>
                    <View style={pageStyles.searchTextView}>
                        <TextInput autoCapitalize="none"
                            autoCorrect={false} defaultValue={this.state.SearchText} onChangeText={(newText) => this.searchTextChange(newText)} disableFullscreenUI={true}
                            underlineColorAndroid="transparent" style={pageStyles.searchTextInput} onEndEditing={() => { this.onSearch() }} placeholder={this.props.placeholder}
                            placeholderTextColor={CompanyConfig.formatColor(StyleConfig.PopupFront, "66")} />
                        <TouchableHighlight onPress={() => { this.onSearch() }} activeOpacity={0.8} >
                            <View>
                                <SvgUri style={{ marginLeft: getResponsiveValue(20), marginTop: getResponsiveValue(15) }}
                                    width={getResponsiveValue(39)} height={getResponsiveValue(38)} fill={StyleConfig.Main} source="search"
                                />
                            </View>
                        </TouchableHighlight>
                    </View>
                    <SimpleSearchRightButton ref='rightButton' clickHandler={() => { this.onRightButtonClick() }} />
                </View>
            </View>
        );
    }


}


const defaultBackgroundColor = '#ffffff';
const checkedBackgroundColor = '#027fd6';

const defaultTextColor = '#ffffff';
const checkedTextColor = '#ffffff';
export class CheckItemHistory extends Component {

    constructor(prop) {
        super(prop);
        this.state = {
            backgroundColor: defaultBackgroundColor,
            textColor: defaultTextColor,
        }

    }
    componentDidMount() {

        if (this.props.isChoice) {
            this.setState({ backgroundColor: checkedBackgroundColor, textColor: checkedTextColor });
        }
    }
    clickHandler(searchText) {
        this.props.historySearch(searchText);
    }

    render() {

        setStyle();
        let addMarginStyle = {};

        if (this.props.index == 0) {
            addMarginStyle = { marginLeft: getResponsiveValue(20) };
        }

        let textColorStyle = { color: defaultTextColor };
        return (
            <View>
                <TouchableOpacity onPress={() => this.clickHandler(this.props.showText)}
                >
                    <Text style={[pageStyles.latelyText, textColorStyle, addMarginStyle]} >{this.props.showText}</Text>
                </TouchableOpacity>
            </View>

        )
    }

}


export class SimpleSearchRightButton extends Component {
    static propTypes = {
        clickHandler: PropTypes.func,   //Button点击事件
    };
    constructor(prop) {
        super(prop);
        this.state = {
            Number: 0,
        }
    }
    componentDidMount() {
    }
    clickHandler() {
        if (typeof (this.props.clickHandler) == 'function') {
            this.props.clickHandler();
        }
    }
    isShowNumber() {
        if (this.state.Number > 0) {
            return true;
        }
        return false;
    }

    initNumber(defaultNumber) {
        this.setState({ Number: defaultNumber });
    }

    addNumber(addNum) {
        this.setState({ Number: this.state.Number + addNum });
    }

    render() {
        setStyle();

        return (
            <TouchableHighlight style={pageStyles.searchTextTouch} onPress={() => { this.clickHandler() }} activeOpacity={0.8} underlayColor={CompanyConfig.AppColor.OnPressSecondary} >
                <View style={pageStyles.rightBlock}>
                    <SvgUri width={getResponsiveValue(37)} height={getResponsiveValue(41)} fill={StyleConfig.Main} source="purchase" />
                    {this.isShowNumber() ? (
                        <View style={pageStyles.numberView}>
                            <Text style={pageStyles.numberText}>{this.state.Number}</Text>
                        </View>
                    ) : null}
                </View>


            </TouchableHighlight>
        )
    }
}
