import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    ImageBackground,
    View,
    TouchableHighlight,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import PropTypes from "prop-types";
import DictionaryService from '../../services/dictionary.js';
// import ProductService from '../../services/product.js';
import AppConfig from '../../config/app.config.js';
import CompanyConfig from '../../config/company.config.js';
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme.js';
// import { CompanyAppConfig } from '../../config/company.app';
import SvgUri from '../../components/svguri.js';

// import { NavigationActions } from 'react-navigation'
const storage = global.storage;
const maxHistory = 10;    //最多存储10个搜索历史

let pageStyles = null;

function setStyle() {
    if (pageStyles != null && !CompanyConfig.isGeneral()) return pageStyles;

    pageStyles = StyleSheet.create({
        baseView: {
            flex: 1,
            width: getResponsiveValue(1334),
            height: getResponsiveValue(AppConfig.design.height),
            backgroundColor: CompanyConfig.AppColor.PageBackground,

            position: "absolute",
            zIndex: 100040,
        },

        topView: {
            // marginTop: getResponsiveValue(21),
            height: getResponsiveValue(88),
            width: getResponsiveValue(1334),
            flexDirection: "row",
            alignItems: 'center',
            backgroundColor: CompanyConfig.formatColor(CompanyConfig.AppColor.Secondary, "b3"),
        },

        back: {
            height: getResponsiveValue(69),
            width: getResponsiveValue(73),
            borderRadius: getResponsiveValue(40),
            alignItems: "center",
            justifyContent: "center"
        },

        searchTextView: {
            // marginLeft: getResponsiveValue(30),
            width: getResponsiveValue(1170),
            height: getResponsiveValue(69),
            // opacity: 0.2,
            borderRadius: 10,
            backgroundColor: CompanyConfig.formatColor(CompanyConfig.AppColor.DescriptionFront, "4d"),
            flexDirection: "row",
        },
        searchTextIcon: {
            marginLeft: getResponsiveValue(20),
            marginTop: getResponsiveValue(19),
            width: getResponsiveValue(39),
            height: getResponsiveValue(32),
            // opacity: 0,
        },

        searchTextInput: {
            marginLeft: getResponsiveValue(27),
            // marginTop: getResponsiveValue(5),
            width: getResponsiveValue(1000),
            height: getResponsiveValue(69),
            borderColor: 'transparent',
            padding: 0,
            fontSize: getResponsiveFontSize(32),
            textAlignVertical: 'center',
            color: CompanyConfig.AppColor.ContentFront,
        },

        searchTextTouch: {
            height: getResponsiveValue(69),
            width: getResponsiveValue(91),
            borderRadius: getResponsiveValue(40),
            alignItems: "center",
            justifyContent: "center",
            // backgroundColor: 'gray',
        },

        searchText: {
            fontSize: getResponsiveFontSize(30),
            color: CompanyConfig.AppColor.ButtonBg,
        },

        HistorySearchItemView: {
            height: getResponsiveValue(55),
            marginLeft: getResponsiveValue(20),
            marginTop: getResponsiveValue(20),
            borderRadius: getResponsiveValue(10),

            // textAlign: 'center',
            // textAlignVertical: 'center',
            backgroundColor: "#f4f4f4",

        },

        HistorySearchItemViewNoColor: {
            height: getResponsiveValue(55),
            marginLeft: getResponsiveValue(15),
            marginTop: getResponsiveValue(12),
            borderRadius: getResponsiveValue(10),
            alignItems: 'center',
            justifyContent: 'center'
        },
        HistorySearchItemHiddenText: {
            marginLeft: getResponsiveValue(26),
            marginRight: getResponsiveValue(26),
            fontSize: getResponsiveFontSize(32),
            textAlign: 'center',
            textAlignVertical: 'center',

            color: CompanyConfig.AppColor.MainFront,
            opacity: 0,
            // backgroundColor: 'gray'
        },

        HistorySearchItemHiddenText2: {
            marginLeft: getResponsiveValue(10),
            marginRight: getResponsiveValue(18),
            // marginTop: getResponsiveValue(5),
            // marginBottom:getResponsiveValue(10),
            fontSize: getResponsiveFontSize(30),

            color: CompanyConfig.AppColor.MainFront,
        },

        latelyText: {
            marginLeft: getResponsiveValue(20),
            marginRight: getResponsiveValue(20),
            marginTop: getResponsiveValue(15),
            // marginBottom:getResponsiveValue(10),
            fontSize: getResponsiveFontSize(30),
            textAlign: 'center',
            textAlignVertical: 'center',
            backgroundColor: 'transparent',
        },

        itemGroup: {
            flexDirection: "row",
            flexWrap: 'wrap',
            width: getResponsiveValue(1173),
            // backgroundColor: 'gray'
        },

        rowNameText: {
            marginTop: getResponsiveValue(15),
            fontSize: getResponsiveFontSize(30),
            // opacity: 0.4,
            color: CompanyConfig.AppColor.ContentFront,
            width: getResponsiveValue(78),
            backgroundColor: 'transparent',
        },
        rowView: {
            width: getResponsiveValue(1334),
        },

        rowRightView: {
            width: getResponsiveValue(1261),
            marginLeft: getResponsiveValue(30),
            marginTop: getResponsiveValue(20),
            flexDirection: "row",
        },

        rowRightView_History: {
            width: getResponsiveValue(1261),
            marginLeft: getResponsiveValue(30),
            marginTop: getResponsiveValue(0),
            flexDirection: "row",
        },

    });

    return pageStyles;
}


export default class ProductSearch extends Component {
    status;

    static propTypes = {
        backHandler: PropTypes.func,
        searchHandler: PropTypes.func,
    };

    constructor(prop) {
        super(prop);
        this.state = {
            SearchText: '',
            // SearchStyleSysNo: null,
            // SearchSeriesSysNo: null,
            // SearchCategorySysNo: null,
            HisotrySearchTexts: [],
            Styles: [],
            Series: [],
            Categorys: [],
            SearchStyleSysNos: [],
            SearchSeriesSysNos: [],
            SearchCategoryCodes: [],
            SearchProductTag:[],
            ProductTag:[],
            Show: false,
        }
        setStyle();
    }
    IsMounted = false;
    SearchStyleTexts = [];
    SearchSeriesTexts = [];
    SearchCategoryTexts = [];
    SearchProductTagTexts = [];
    BackAddress = null;   //点击返回时  返回地址   如果有返回地址  则点击返回按钮时  直接跳转到返回地址

    UNSAFE_componentWillMount() {
        this.IsMounted = true;
    }
    componentDidMount() {
        this.loadHistory();
        this.getStylesAndSeries();
    }
    componentWillUnmount() {
        this.IsMounted = false;
    }
    search = () => {
        var searchObj = {
            SearchText: this.state.SearchText,
            SearchStyleSysNos: this.state.SearchStyleSysNos,
            SearchSeriesSysNos: this.state.SearchSeriesSysNos,
            SearchCategoryCodes: this.state.SearchCategoryCodes,
            SearchProductTag:this.state.SearchProductTag,
            SearchHeaderText: this.convertTextArrayToString(),
        }
        this.saveSearchHistory(this.state.SearchText);
        // this.props.searchText=this.state.SearchText;
        this.props.searchHandler(searchObj);
    }

    historySearch(historyText) {
        //this.state.SearchText = historyText;
        // this.setState({ SearchText: historyText });
        this.state.SearchText = historyText;
        this.search();
    }

    saveSearchHistory(searchText) {
        if (searchText == null || searchText == '') {
            return;
        }

        var history = [];

        this.loadFromStorage('ProductSearchHistory').then((result) => {
            if (result == null) {
                history.push(searchText);
            }
            if (result != null && result.length > 0) {

                history = result;
                let position = history.indexOf(searchText);
                if (!(position > -1)) {
                    history.push(searchText);
                } else {
                    history.splice(position, 1);
                    history.push(searchText);
                    //history.unshift(searchText);  //从数组头部添加元素
                }

                if (history.length > maxHistory) {
                    var count = history.length - maxHistory;
                    history.splice(0, count);
                }
            }


            global.storage.save({
                key: 'ProductSearchHistory',
                data: history,
                expires: (1000 * 3600 * 24) * 30 * 3
            });
        });


    }

    searchTextChange(newText) {
        this.setState({ SearchText: newText });
    }

    loadHistory() {
        let thisObj = this;
        this.loadFromStorage('ProductSearchHistory').then((result) => {
            var array = [];
            if (result != null && result.length > 0) {
                for (var i = result.length - 1; i >= 0; i--) {
                    array.push(result[i]);
                }

                if (thisObj.IsMounted) {
                    thisObj.setState({ HisotrySearchTexts: array });
                }
            }

        });

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

    getStylesAndSeries() {

        let thisObj = this;

        let dicService = new DictionaryService();
        dicService.GetSearchConditionData((result) => {
            if (thisObj.IsMounted) {
                if (result.Styles != null) {
                    thisObj.setState({ Styles: result.Styles });
                }
                if (result.Series != null) {
                    thisObj.setState({ Series: result.Series });
                }
                if (result.Categorys != null) {
                    thisObj.setState({ Categorys: result.Categorys });
                }                
                if (result.ProductTag != null) {
                    thisObj.setState({ ProductTag: result.ProductTag });
                }
            }
        });
    }


    choiceChange(choiceType, sysNo, text, isAdd) {
        if (this.IsMounted) {
            var result = null;
            if (choiceType == 'style') {
                result = this.updateSearchSysNo(this.state.SearchStyleSysNos, this.SearchStyleTexts, sysNo, text, isAdd);
                this.state.SearchStyleSysNos = result.searchSysNos;
                this.SearchStyleTexts = result.searchTexts;
            }
            else if (choiceType == 'series') {
                // this.setState({ SearchSeriesSysNos: this.updateSearchSysNo(this.state.SearchSeriesSysNos, sysNo, isAdd) });
                result = this.updateSearchSysNo(this.state.SearchSeriesSysNos, this.SearchSeriesTexts, sysNo, text, isAdd);
                this.state.SearchSeriesSysNos = result.searchSysNos;
                this.SearchSeriesTexts = result.searchTexts;
            }
            else if (choiceType == 'category') {
                // this.setState({ SearchCategorySysNos: this.updateSearchSysNo(this.state.SearchCategorySysNos, sysNo, isAdd) });
                result = this.updateSearchSysNo(this.state.SearchCategoryCodes, this.SearchCategoryTexts, sysNo, text, isAdd);
                this.state.SearchCategoryCodes = result.searchSysNos;
                this.SearchCategoryTexts = result.searchTexts;
            }//SearchProductTag
            else if (choiceType == 'producttag') {
                // this.setState({ SearchCategorySysNos: this.updateSearchSysNo(this.state.SearchCategorySysNos, sysNo, isAdd) });
                result = this.updateSearchSysNo(this.state.SearchProductTag, this.SearchProductTagTexts, sysNo, text, isAdd);
                this.state.SearchProductTag = result.searchSysNos;
                this.SearchProductTag = result.searchTexts;
            }//SearchProductTag
            //console.log(this.state.SearchStyleSysNos)
        }
    }

    updateSearchSysNo(searchSysNos, searchTexts, sysNo, text, isAdd) {
        let no = -1;
        for (var i = 0; i < searchSysNos.length; i++) {
            if (sysNo == searchSysNos[i]) {
                no = i;
            }
        }

        if (isAdd) {
            if (no < 0) {
                searchSysNos.push(sysNo);
                searchTexts.push(text);
            }
        } else {
            if (no >= 0) {
                searchSysNos.splice(no, 1);
                searchTexts.splice(no, 1);
            }
        }
        return { searchSysNos: searchSysNos, searchTexts: searchTexts };
    }

    convertTextArrayToString() {
        let str = "";
        if (this.state.SearchText != null && this.state.SearchText.length > 0) {
            str += "[" + this.state.SearchText + "]";
        }

        if (this.SearchStyleTexts.length > 0) {
            str += "[" + this.SearchStyleTexts.join(",") + "]";
        }

        if (this.SearchSeriesTexts.length > 0) {
            str += "[" + this.SearchSeriesTexts.join(",") + "]";
        }

        if (this.SearchCategoryTexts.length > 0) {
            str += "[" + this.SearchCategoryTexts.join(",") + "]";
        }
        return str;
    }

    show() {
        this.loadHistory();
        this.setState({ Show: true, SearchText: '' });
        this.forceUpdate();
    }
    hide() {
        this.setState({ Show: false });
        this.forceUpdate();
    }

    receiveInitData(searchObj) {
        if (this.IsMounted) {


        }
    }

    setBackAddress(address) {
        this.BackAddress = address;
    }

    backHandler() {
        const { goBack } = this.props.navigation;
        if (this.BackAddress != null) {
            // this.props.navigation.navigate(this.BackAddress);
            goBack();
        } else {
            if (typeof (this.props.backHandler) == 'function') {
                this.props.backHandler();
            }
        }
    }


    render() {
        if (!this.state.Show) return null;
        setStyle();
        return (

            <ImageBackground source={CompanyConfig.CompanyBGImg} style={pageStyles.baseView}>
                <View style={pageStyles.topView}>
                    <TouchableHighlight style={pageStyles.back} onPress={() => this.backHandler()} activeOpacity={0.8} underlayColor={CompanyConfig.AppColor.OnPressSecondary} >
                        <View><SvgUri width={getResponsiveValue(40)} height={getResponsiveValue(40)} fill={CompanyConfig.AppColor.SecondaryFront} source="back" /></View>
                    </TouchableHighlight>
                    <View style={pageStyles.searchTextView}>
                        {/* <Image source={require("../../assets/icons/search.png")} style={pageStyles.searchTextIcon}></Image> */}
                        <View>
                            <SvgUri style={{ marginLeft: getResponsiveValue(20), marginTop: getResponsiveValue(15) }} width={getResponsiveValue(39)} height={getResponsiveValue(38)} fill={CompanyConfig.AppColor.DescriptionFront} source="search" />
                        </View>
                        <TextInput autoCapitalize="none"
                            autoCorrect={false} defaultValue={this.state.SearchText} onChangeText={(newText) => this.searchTextChange(newText)} disableFullscreenUI={true}
                            placeholder='输入商品名称或型号' placeholderTextColor={CompanyConfig.formatColor(CompanyConfig.AppColor.DescriptionFront, "b3")} underlineColorAndroid="transparent"
                            style={pageStyles.searchTextInput} onEndEditing={this.search} />
                    </View>
                    <TouchableHighlight style={pageStyles.searchTextTouch} onPress={this.search} activeOpacity={0.8} underlayColor={CompanyConfig.AppColor.OnPressSecondary} >
                        <Text style={pageStyles.searchText}>搜索</Text>
                    </TouchableHighlight>
                </View>
                <ScrollView>

                    <View style={pageStyles.rowView}>
                        <View style={pageStyles.rowRightView_History} >
                            {(this.state.HisotrySearchTexts != null && this.state.HisotrySearchTexts.length > 0) ? (
                                <Text style={pageStyles.rowNameText}>
                                    最近:
                                </Text>
                            ) : null}

                            <View style={pageStyles.itemGroup}>
                                {
                                    this.state.HisotrySearchTexts.map((item, index) => {
                                        return (
                                            <CheckItemHistory key={index} index={index} showText={item}
                                                isChoice={false} historySearch={(searchText) => this.historySearch(searchText)}
                                            />
                                        )
                                    })
                                }

                            </View>

                        </View>
                    </View>

                    <View style={{ marginTop: getResponsiveValue(20) }}></View>
                    <View style={pageStyles.rowView}>
                        <View style={pageStyles.rowRightView} >

                            {(this.state.Styles != null && this.state.Styles.length > 0) ? (
                                <Text style={pageStyles.rowNameText}>
                                    风格:
                                </Text>
                            ) : null}


                            <View style={pageStyles.itemGroup}>
                                {
                                    this.state.Styles.map((item, index) => {
                                        return (
                                            <CheckItem key={index} choiceChange={(choicetype, sysno, text, isadd) => this.choiceChange(choicetype, sysno, text, isadd)} choiceType='style' showText={item.Name} sysNo={item.SysNo}
                                                isChoice={(this.state.SearchStyleSysNos.indexOf(item.SysNo) > -1) ? true : false}
                                            />
                                        )
                                    })
                                }
                            </View>

                        </View>
                    </View>

                    <View style={[pageStyles.rowView]}>
                        <View style={pageStyles.rowRightView} >
                            {(this.state.Series != null && this.state.Series.length > 0) ? (
                                <Text style={pageStyles.rowNameText}>
                                    系列:
                            </Text>
                            ) : null}


                            <View style={pageStyles.itemGroup}>
                                {
                                    this.state.Series.map((item, index) => {
                                        return (
                                            <CheckItem key={index} choiceChange={(choicetype, sysno, text, isadd) => this.choiceChange(choicetype, sysno, text, isadd)} choiceType='series' showText={item.Name} sysNo={item.SysNo}
                                                isChoice={(this.state.SearchSeriesSysNos.indexOf(item.SysNo) > -1) ? true : false} />
                                        )
                                    })
                                }
                            </View>

                        </View>
                    </View>


                    <View style={pageStyles.rowView}>
                        <View style={pageStyles.rowRightView} >


                            {(this.state.Categorys != null && this.state.Categorys.length > 0) ? (
                                <Text style={pageStyles.rowNameText}>
                                    分类:
                                </Text>
                            ) : null}

                            <View style={pageStyles.itemGroup}>
                                {
                                    this.state.Categorys.map((item, index) => {
                                        return (


                                            <CheckItem key={index} choiceChange={(choicetype, sysno, text, isadd) => this.choiceChange(choicetype, sysno, text, isadd)} choiceType='category' showText={item.Name} sysNo={item.Code}
                                                isChoice={(this.state.SearchCategoryCodes.indexOf(item.Code) > -1) ? true : false} />
                                        )
                                    })
                                }
                            </View>

                        </View>
                    </View>
                    <View style={[pageStyles.rowView]}>
                        <View style={pageStyles.rowRightView} >  
                        {(this.state.ProductTag != null && this.state.ProductTag.length > 0) ? (
                                <Text style={pageStyles.rowNameText}>
                                    标签:
                                </Text>
                            ) : null}
                            <View style={pageStyles.itemGroup}>
                                {
                                    this.state.ProductTag.map((item, index) => {
                                        return (
                                            <CheckItem key={index} choiceChange={(choicetype, sysno, text, isadd) => this.choiceChange(choicetype, sysno, text, isadd)} choiceType='producttag' showText={item.Name} sysNo={item.Name}
                                                isChoice={(this.state.SearchProductTag.indexOf(item.Name) > -1) ? true : false} />
                                        )
                                    })
                                }
                            </View>
                        </View>
                    </View>
                </ScrollView>

            </ImageBackground>
        );
    }


}

export class SearchItemRow extends Component {

    constructor(prop) {
        super(prop);
        this.state = {

        }

        setStyle();
    }
    componentDidMount() {

    }
    clickHandler() {

    }

    render() {

        setStyle();
        return (
            <View style={{ width: getResponsiveValue(1334) }}>
                <View style={{ marginLeft: getResponsiveValue(19) }} >
                    <Text style={{ marginTop: getResponsiveValue(49), fontSize: getResponsiveFontSize(22), opacity: 0.4, color: "#ffffff", width: getResponsiveValue(71) }}>
                        最近:
                    </Text>

                    <CheckItem showText={'测试'} />
                </View>
            </View>

        )
    }

}



// const defaultBackgroundColor = '#ffffff';
//const checkedBackgroundColor = '#027fd6';

// const defaultTextColor = CompanyConfig.AppColor.MainFront;
// const checkedTextColor = CompanyConfig.AppColor.MainFront;
export class CheckItem extends Component {

    constructor(prop) {
        super(prop);
        this.state = {
            // backgroundColor: defaultBackgroundColor,
            // textColor: defaultTextColor,isChoice
            isChoice: false,
        }

        setStyle();
    }
    // isChoice = false;
    IsMounted = false;
    ChoiceTextColor = '#027fd6';
    defaultBackgroundColor = CompanyConfig.AppColor.Secondary;
    checkedBackgroundColor = CompanyConfig.AppColor.SecondaryFront;
    defaultTextColor = CompanyConfig.AppColor.ContentFront;
    checkedTextColor = CompanyConfig.AppColor.Main;
    UNSAFE_componentWillMount() {
        this.IsMounted = true;
    }
    componentDidMount() {

        // this.isChoice = this.props.isChoice;

        this.setState({ isChoice: this.props.isChoice });

        // if (this.props.isChoice) {
        //     this.setState({ backgroundColor: checkedBackgroundColor, textColor: checkedTextColor });
        // }
    }
    componentWillUnmount() {
        this.IsMounted = false;

    }
    clickHandler() {
        if (this.IsMounted) {
            this.props.choiceChange(this.props.choiceType, this.props.sysNo, this.props.showText, !this.state.isChoice);
            this.setState({ isChoice: !this.state.isChoice });
        }
        // this.isChoice = !this.isChoice;


        // if (this.isChoice) {
        //     this.setState({ backgroundColor: checkedBackgroundColor, textColor: checkedTextColor });
        // } else {
        //     this.setState({ backgroundColor: defaultBackgroundColor, textColor: defaultTextColor });
        // }



    }

    render() {


        setStyle();
        let colorStyle = { backgroundColor: CompanyConfig.formatColor(this.defaultBackgroundColor, "cc") };
        let textColorStyle = { color: this.defaultTextColor };
        // let opacityStyle = { opacity: 0.1 };

        if (this.state.isChoice) {
            colorStyle = { backgroundColor: this.checkedBackgroundColor };
            textColorStyle = { color: this.checkedTextColor };
            // opacityStyle = {};
        }

        return (
            <View>
                <TouchableHighlight style={[pageStyles.HistorySearchItemViewNoColor, colorStyle]} onPress={() => this.clickHandler()}
                    underlayColor={this.checkedBackgroundColor} >
                    <Text style={[pageStyles.HistorySearchItemHiddenText2, textColorStyle]} > <Text >  {this.props.showText}</Text>  </Text>
                </TouchableHighlight>
            </View>

        )
    }

}


export class CheckItemHistory extends Component {

    constructor(prop) {
        super(prop);
        this.state = {
            backgroundColor: this.defaultBackgroundColor,
            textColor: this.defaultTextColor,
        }

        setStyle();
    }
    defaultTextColor = CompanyConfig.AppColor.ContentFront;
    checkedTextColor = CompanyConfig.AppColor.MainFront;
    componentDidMount() {

        if (this.props.isChoice) {
            this.setState({ backgroundColor: checkedBackgroundColor, textColor: this.checkedTextColor });
        }
    }
    clickHandler(searchText) {
        // if (this.state.backgroundColor == defaultBackgroundColor) {
        //     this.setState({ backgroundColor: checkedBackgroundColor, textColor: checkedTextColor });
        // } else {
        //     this.setState({ backgroundColor: defaultBackgroundColor, textColor: defaultTextColor });
        // }

        this.props.historySearch(searchText);
    }

    render() {
        setStyle();

        let addMarginStyle = {};

        if (this.props.index == 0) {
            addMarginStyle = { marginLeft: getResponsiveValue(20) };
        }

        // let colorStyle = { backgroundColor: this.state.backgroundColor };
        let textColorStyle = { color: this.defaultTextColor };



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


