import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    Image,
    View,
    TouchableHighlight,
    ScrollView,
} from 'react-native';
import AppConfig from '../../config/app.config.js';
import CompanyConfig from '../../config/company.config.js';
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme.js';

const maxHistory = 10;    //最多存储10个搜索历史
let pageStyles = null;
function setStyle() {
    if (pageStyles != null && !CompanyConfig.isGeneral()) return pageStyles;
    pageStyles = StyleSheet.create({
        baseView: {
            flex: 1,
            width: getResponsiveValue(1334),
            height: getResponsiveValue(AppConfig.design.height),
            backgroundColor: '#ffffff',

            position: "absolute",
            zIndex: 200,
        },

        topView: {
            height: getResponsiveValue(80),
            width: getResponsiveValue(1334),
            backgroundColor: '#f4f4f4',
            flexDirection: "row",
        },

        backImage: {
            width: getResponsiveValue(23),
            height: getResponsiveValue(40),
            marginLeft: getResponsiveValue(20),
            marginTop: getResponsiveValue(20),
            opacity: 0.3,
        },

        searchTextView: {
            marginLeft: getResponsiveValue(35),
            width: getResponsiveValue(1158),
        },

        searchTextInput: {
            marginTop: getResponsiveValue(5),
            width: getResponsiveValue(1158),
            height: getResponsiveValue(60),
            borderColor: 'transparent',
            padding: 0,
            fontSize: getResponsiveFontSize(30),
        },

        searchText: {
            marginTop: getResponsiveValue(20),
            marginLeft: getResponsiveValue(20),
            fontSize: getResponsiveFontSize(30),
            color: '#a0a1a7',
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

            // textAlign: 'center',
            // textAlignVertical: 'center',
            backgroundColor: "#f4f4f4",

        },

        HistorySearchItemViewNoColor: {
            height: getResponsiveValue(55),
            marginLeft: getResponsiveValue(20),
            marginTop: getResponsiveValue(20),
            borderRadius: getResponsiveValue(10),

            // textAlign: 'center',
            // textAlignVertical: 'center',
            // backgroundColor: "#f4f4f4",

        },

        HistorySearchItemText: {
            marginLeft: getResponsiveValue(26),
            marginRight: getResponsiveValue(26),
            // marginTop:getResponsiveValue(4),
            // marginBottom:getResponsiveValue(10),
            fontSize: getResponsiveFontSize(32),
            textAlign: 'center',
            textAlignVertical: 'center',
            color: '#a0a1a7',
            // backgroundColor:'gray'
        },

        HistorySearchItemTextNoColor: {
            marginLeft: getResponsiveValue(26),
            marginRight: getResponsiveValue(26),
            // marginTop:getResponsiveValue(4),
            // marginBottom:getResponsiveValue(10),
            fontSize: getResponsiveFontSize(32),
            textAlign: 'center',
            textAlignVertical: 'center',
            // color:'#a0a1a7',
            // backgroundColor:'gray'
        },

        latelyText: {
            // width: getResponsiveValue(114),
            height: getResponsiveValue(55),
            marginLeft: getResponsiveValue(20),
            marginTop: getResponsiveValue(20),
            borderRadius: getResponsiveValue(15),
            fontSize: getResponsiveFontSize(32),
            textAlign: 'center',
            textAlignVertical: 'center',
            backgroundColor: "#f4f4f4",
            color: '#a0a1a7',
        }
    });
    return pageStyles;
}

export default class ContentSearch extends Component {
    status;
    constructor(prop) {
        super(prop);
        this.state = {
            SearchText: '',
            HisotrySearchTexts: [],
        }
    }
    componentDidMount() {
        this.loadHistory();
    }

    loadHistory() {
        let thisObj = this;
        this.loadFromStorage('ContentSearchHistory').then((result) => {
            var array = [];
            if (result != null && result.length > 0) {
                for (var i = result.length - 1; i >= 0; i--) {
                    array.push(result[i]);
                }

                thisObj.setState({ HisotrySearchTexts: array });
            }

        });

    }

    search = () => {
        //const {goBack} = this.props.navigation;
        var searchObj = {
            SearchText: this.state.SearchText
        }
        this.saveSearchHistory(this.state.SearchText);
        this.props.searchText = this.state.SearchText;
        this.props.hiddenAndSearch(searchObj);

        /*        navigateAction.params={SearchText:this.state.SearchText};
                this.props.navigation.dispatch(navigateAction);*/
        //goBack();

        /*navigate("ProductList");*/
    }

    historySearch(historyText) {
        this.state.SearchText = historyText;
        this.setState({ SearchText: historyText });
        this.search();
    }

    saveSearchHistory(searchText) {
        if (searchText == null || searchText == '') {
            return;
        }
        var history = [];
        this.loadFromStorage('ContentSearchHistory').then((result) => {
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
                key: 'ContentSearchHistory',
                data: history,
                expires: (1000 * 3600 * 24) * 30 * 3
            });
        });
    }
    searchTextChange(newText) {
        this.setState({ SearchText: newText });
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

    searchTextChange(newText) {
        this.setState({ SearchText: newText });
    }
    render() {
        setStyle();
        // const { goBack } = this.props.navigation;
        return (

            <View style={pageStyles.baseView}>
                <View style={pageStyles.topView}>
                    <TouchableHighlight onPress={() => this.props.showSearch(false)} activeOpacity={0.8} underlayColor={null} >
                        <Image source={require("../../assets/icons/back2.png")} style={pageStyles.backImage}></Image>
                    </TouchableHighlight>
                    <View style={pageStyles.searchTextView}>
                        <TextInput autoCapitalize="none"
                            autoCorrect={false} onChangeText={(newText) => this.searchTextChange(newText)} underlineColorAndroid="transparent" style={pageStyles.searchTextInput} />
                        <View style={{ backgroundColor: '#d5d5d5', width: getResponsiveValue(1158), height: 1 }}>
                        </View>
                    </View>
                    <TouchableHighlight style={{}} onPress={this.search} activeOpacity={0.8} underlayColor={null}>
                        <Text style={pageStyles.searchText}>搜索</Text>
                    </TouchableHighlight>
                </View>
                <ScrollView style={pageStyles.searchButtom}>
                    {(this.state.HisotrySearchTexts != null && this.state.HisotrySearchTexts.length > 0) ? (
                        <Text style={pageStyles.LatelyPromptText}>
                            最近搜索:
                    </Text>
                    ) : null}
                    <View style={pageStyles.latelyTextView}>
                        {

                            this.state.HisotrySearchTexts.map((item, index) => {
                                return (
                                    <TouchableHighlight key={index} onPress={() => this.historySearch(item)} >
                                        <View style={[pageStyles.HistorySearchItemView]}>
                                            <Text style={pageStyles.HistorySearchItemText} >{item}</Text>
                                        </View>
                                    </TouchableHighlight>
                                )
                            })
                        }
                    </View>
                </ScrollView>
            </View>
        );
    }


}

