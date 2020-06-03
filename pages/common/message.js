import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    FlatList,
    Alert,
    TouchableHighlight,
    ImageBackground,
    Image,
} from 'react-native';
import { NavigationActions, NavigationState, NavigationRouter } from 'react-navigation';
import PropTypes from 'prop-types';
import BaseComponent from '../../components/BaseComponent.js';
import CommonService from '../../services/common';
import CompanyConfig from '../../config/company.config.js';
import OperationMessage from '../../components/OperationMessage.js';
import Spinner from '../../components/Spinner.js';
import SvgUri from '../../components/svguri.js';
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme';
let Style = null;

export class MessageList extends BaseComponent {

    constructor(prop) {
        super(prop);
        this._renderFlateList = this._renderFlateList.bind(this);
        this.state = {
            hasMore: true,//是否更多
            pageIndex: 0,//当前页码
            pageSize: 10,//每页数据量
            messageList: [],
            MessageSysNo: null,
        }
    }
    componentDidMount() {
        let service = new CommonService();
        this.state.pageIndex = 0;
        service.QueryMessageList(this.state.pageIndex, this.state.pageSize).then(result => {
            if (result.data.success) {
                if (result.data.data == null || result.data.data.data.length <= 0) {
                    return;
                }
                let messageInfoList = result.data.data.data;
                if (result.data.data.data.length < this.state.pageSize) {
                    this.state.hasMore = false;
                } else {
                    this.state.hasMore = true;
                }
                let noviewList = [];
                let viewList = [];
                if (messageInfoList.length > 0) {
                    for (let i = 0; i < messageInfoList.length; i++) {
                        if (messageInfoList[i].IsViewd == 1) {
                            viewList.push(messageInfoList[i]);
                        } else {
                            noviewList.push(messageInfoList[i]);
                        }
                    }
                    for (let i = 0; i < viewList.length; i++) {
                        noviewList.push(viewList[i]);
                    }
                }
                if (noviewList.length > 0) {
                    this.setState({
                        messageList: noviewList,
                        MessageSysNo: noviewList[0].SysNo
                    });
                    this.props.messageView(noviewList[0].SysNo);
                }

            } else {
                Alert.alert(
                    '提示',
                    result.data.message,
                    [
                        { text: '确定', onPress: () => console.log(''), style: 'cancel' },
                    ],
                    { cancelable: false }
                );
            }
        }).catch(error => {
            Alert.alert(
                '提示',
                error.message,
                [
                    { text: '确定', onPress: () => console.log(''), style: 'cancel' },
                ],
                { cancelable: false }
            );
            // this.props.showError(error.message);
        });
    }
    moreMessage = () => {
        if (this.state.hasMore) {
            this.state.pageIndex = this.state.pageIndex + 1;
            let service = new CommonService();
            service.QueryMessageList(this.state.pageIndex, this.state.pageSize).then(result => {
                if (result.data.success) {
                    if (result.data.data == null || result.data.data.data.length <= 0) {
                        return;
                    }
                    let list = this.state.messageList;
                    let morList = result.data.data.data;
                    for (let i = 0; i < morList.length; i++) {
                        list.push(morList[i])
                    };
                    if (result.data.data.data.length < this.state.pageSize) {
                        this.state.hasMore = false;
                    } else {
                        this.state.hasMore = true;
                    };

                    let noviewList = [];
                    let viewList = [];
                    if (list.length > 0) {
                        for (let i = 0; i < list.length; i++) {
                            if (list[i].IsViewd == 1) {
                                viewList.push(list[i]);
                            } else {
                                noviewList.push(list[i]);
                            }
                        }
                        for (let i = 0; i < viewList.length; i++) {
                            noviewList.push(viewList[i]);
                        }
                    }
                    // if (this.state.pageIndex == 1) {
                    //     this.props.messageView(noviewList[0].SysNo);
                    //     this.state.MessageSysNo = noviewList[0].SysNo
                    // }
                    this.setState({
                        messageList: noviewList
                    });

                } else {
                    this.setState({
                        messageList: this.state.messageList,
                        IsMore: false
                    })
                }
            }
            )
        }
    }
    _renderFlateList() {

    }
    render() {
        setStyle();
        return (
            <FlatList
                data={this.state.messageList}
                getItemLayout={(data, index) => ({ length: 2000, offset: 100 * index, index })}
                ref="dataList"
                // ListHeaderComponent={this.state.hasMore ? <Text style={{ textAlign: 'center', }} >下拉加载更多</Text> : ""}
                keyExtractor={(item, index) => String(item.SysNo)}
                refreshing={false}
                onRefresh={() => this.componentDidMount()}
                onEndReachedThreshold={0.1}
                onEndReached={this.moreMessage}
                bounces={false}
                renderItem={({ item, index }) =>
                    <TouchableHighlight key={item.SysNo} activeOpacity={1} underlayColor={CompanyConfig.formatColor(CompanyConfig.AppColor.Secondary, "1A")} onPress={
                        () => {
                            this.props.messageView(item.SysNo);
                            let refresh = false;
                            let messageList = this.state.messageList;
                            this.setState({
                                MessageSysNo: item.SysNo
                            })
                            for (let entity of messageList) {
                                if (entity.SysNo === item.SysNo && entity.IsViewd === 0) {
                                    entity.IsViewd = 1;
                                    refresh = true;
                                }
                            }
                            if (refresh) {
                                let result = Object.assign([], messageList);
                                this.setState({
                                    messageList: result
                                });
                            }

                        }
                    }>
                        <View style={[{ flexDirection: 'row', alignItems: 'center', paddingLeft: getResponsiveValue(20), height: getResponsiveValue(115), borderBottomWidth: 1, borderBottomColor: '#ffffff30' }, this.state.MessageSysNo == item.SysNo ? { backgroundColor: CompanyConfig.AppColor.OnPressMain } : null]} key={item.SysNo}>
                            <View style={{ flexDirection: 'column', width: getResponsiveValue(335) }}>
                                <Text style={Style.titleText}>{item.Title.substring(0, 10) + (item.Title.length > 10 ? "..." : "")}</Text>
                                <Text style={Style.dateText}>系统消息  {item.PushTimeStr}</Text>
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                {
                                    item.IsViewd == 1 ? <View></View> : <View style={{ width: getResponsiveValue(20), height: getResponsiveValue(20), backgroundColor: '#e60012', borderRadius: 100 }}></View>
                                }
                            </View>
                        </View>
                    </TouchableHighlight>
                }
            />
        )
    }
}

export class MessageDetail extends BaseComponent {
    static propTypes = {
        messageSysNo: PropTypes.string
    }
    constructor(prop) {
        super(prop);
        this.state = {
            message: {
                PushTimeStr: "",
                Content: ""
            },
        }
    }
    messageView(messageSysNo, callback) {
        let service = new CommonService();
        let sysNo = parseInt(messageSysNo);
        if (sysNo > 0) {
            service.GetMessageDetail(sysNo).then((res) => {
                if (res.data.success) {
                    this.setState({
                        message: res.data.data
                    });
                    if (callback) {
                        callback();
                    }
                }
            }).catch((error) => {
                Alert.alert(
                    '提示',
                    error.message,
                    [
                        { text: '确定', onPress: () => console.log(''), style: 'cancel' },
                    ],
                    { cancelable: false }
                );
                // this.props.showError(error.message);
            })
        }
    }
    componentDidMount() {
        let service = new CommonService();
        let messageSysNo = parseInt(this.props.messageSysNo);
        if (messageSysNo > 0) {
            service.GetMessageDetail(messageSysNo).then((res) => {
                global.storage.save({
                    key: 'messageInfo',
                    data: res.data
                });
                this.setState({
                    message: res.data
                })
            }).catch((error) => {
                Alert.alert(
                    '提示',
                    error.message,
                    [
                        { text: '确定', onPress: () => console.log(''), style: 'cancel' },
                    ],
                    { cancelable: false }
                );
                // this.refs["messageBar"].show(error.message, 2);
            })
        }

    }
    render() {
        setStyle();
        return (
            <View style={{ flex: 1, flexDirection: 'column', marginTop: 10 }}>
                <View style={{ width: getResponsiveValue(858), alignItems: 'center', flexDirection: 'column', }}>
                    <Text style={Style.detailDateText}>{this.state.message.PushTimeStr}</Text>
                </View>
                <ScrollView>
                    <Text style={Style.detailContentText}>{this.state.message.Content}</Text>
                </ScrollView>

            </View>
        )
    }
}

const resetActionToHome = NavigationActions.reset({
    index: 0,
    actions: [
        NavigationActions.navigate({ routeName: 'Home' })
    ]
});
export default class MessageCenter extends BaseComponent {
    static navigationOptions = {
        header: null,
    };

    constructor(prop) {
        super(prop);

    }
    componentWillUnmount() {

    }
    componentDidMount() {

    }

    render() {
        setStyle();
        return (
            <ImageBackground style={Style.back1} source={CompanyConfig.CompanyBGImg}>

                <OperationMessage ref="messageBar" />
                <View style={{ flex: 1, flexDirection: 'row', }}>
                    <View style={{ width: getResponsiveValue(476), borderRightWidth: 1, borderRightColor: '#ffffff50', backgroundColor: CompanyConfig.formatColor(CompanyConfig.AppColor.OnPressSecondary, "66") }}>
                        <View style={{ width: getResponsiveValue(476), flexDirection: 'row', alignItems: "center", }}>
                            <TouchableHighlight style={Style.back} onPress={() => this.props.navigation.dispatch(resetActionToHome)} underlayColor={CompanyConfig.AppColor.OnPressSecondary} >
                                <View><SvgUri width={getResponsiveValue(40)} height={getResponsiveValue(40)} fill={CompanyConfig.AppColor.SecondaryFront} source={"back"} /></View>
                            </TouchableHighlight>
                            <Text style={{ backgroundColor: '#ffffff00', fontSize: getResponsiveFontSize(32), color: CompanyConfig.AppColor.SecondaryFront, }}>消息中心</Text>
                        </View>
                        <MessageList messageView={(sysNo) => { this.refs["messageDetail"].messageView(sysNo) }} showError={(error) => { this.refs["messageBar"].show(error.message, 2); }} />
                    </View>
                    <MessageDetail ref="messageDetail" showError={(error) => { this.refs["messageBar"].show(error.message, 2); }} />
                </View>
                <Spinner />
            </ImageBackground>
        );

    }
}
function setStyle() {
    if (Style != null && !CompanyConfig.isGeneral()) return Style;
    Style = StyleSheet.create({
        back1: {
            flex: 1,
            backgroundColor: CompanyConfig.AppColor.OnPressMain,
        },
        titleText: {
            height: getResponsiveValue(36),
            fontSize: getResponsiveFontSize(30),
            lineHeight: getResponsiveValue(36),
            color: CompanyConfig.AppColor.ContentFront
        },
        back: {

            // marginLeft: getResponsiveValue(10),
            height: getResponsiveValue(80),
            width: getResponsiveValue(80),
            // marginTop: getResponsiveValue(20),
            borderRadius: getResponsiveValue(40),
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100
        },
        backImg: {
            height: getResponsiveValue(40),
            resizeMode: Image.resizeMode.contain
        },
        dateText: {
            height: getResponsiveValue(36),
            fontSize: getResponsiveFontSize(18),
            lineHeight: getResponsiveValue(36),
            color: CompanyConfig.AppColor.DescriptionFront,
            opacity: 0.5
        },
        detailContentText: {
            fontSize: getResponsiveFontSize(28),
            lineHeight: getResponsiveValue(48),
            color: CompanyConfig.AppColor.ContentFront,
            paddingLeft: getResponsiveValue(30),
            paddingRight: getResponsiveValue(30),
            paddingBottom: getResponsiveValue(50),
            marginTop: getResponsiveValue(20)
        },
        detailDateText: {
            color: CompanyConfig.AppColor.DescriptionFront
        },
        detaDateText: {
            fontSize: getResponsiveFontSize(30),
            lineHeight: getResponsiveValue(48),
            color: CompanyConfig.AppColor.ContentFront
        }
    });
    return Style;
}
