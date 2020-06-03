import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    Alert,
    Keyboard,
    TouchableOpacity,
    Image,
    TextInput
} from 'react-native';
import moment from 'moment';
import BaseComponent from '../../components/BaseComponent.js';
import CustomerService from '../../services/myprofile';
import CompanyConfig from '../../config/company.config.js';
import OperationMessage from '../../components/OperationMessage.js';
import Spinner, { toggleSpinner } from '../../components/Spinner.js';
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme';
import CustomHeader from '../../components/CustomHeader.js';
import AppConfig from '../../config/app.config.js';
import SvgUri from '../../components/svguri.js';
import StyleConfig from '../../config/style.config'
let Style = null;
export default class FeedBack extends BaseComponent {
    static navigationOptions = {
        title: '意见反馈',
    };

    constructor(prop) {
        super(prop);
        this.state = {
            height: 80,
            IsMore: 1,
            pageIndex: 0,
            NewDescription: '',
            pageSize: 10,
            feedback: [{ SysNo: '', FeedbackCompanyName: '', ParentCompanyName: '', Description: '', SolveDescription: '', InDate: null }],
            defaultmesage: ''
        }
    }
    componentWillUnmount() {

    }
    componentDidMount() {
        let service = new CustomerService();
        service.QueryFeedback(this.state.pageIndex, this.state.pageSize).then(result => {
            if (result.data.success) {
                for (let i = 0; i < result.data.data.data.length; i++) {
                    result.data.data.data[i].key = i
                    result.data.data.data[i].InDate = moment(result.data.data.data[i].InDate).format('YYYY-MM-DD HH:mm:ss')
                    if (result.data.data.data[i].SolveDate != null) {
                        result.data.data.data[i].SolveDate = moment(result.data.data.data[i].SolveDate).format('YYYY-MM-DD HH:mm:ss')
                    }

                }
                if (result.data.data.data.length < this.state.pageSize) {
                    this.state.IsMore = 1;
                } else {
                    this.state.IsMore = 0;
                }
                this.setState({
                    feedback: result.data.data.data

                });
            } else {
                Alert.alert(
                    '提示',
                    result.data.message,
                    [
                        { text: '确定', onPress: () => console.log(''), style: 'cancel' },
                    ],
                    { cancelable: false }
                )
            };
        }).catch(error => {
            Alert.alert(
                '提示',
                error.message,
                [
                    { text: '确定', onPress: () => console.log(''), style: 'cancel' },
                ],
                { cancelable: false }
            );
            // this.refs["messageBar"].show(error.message, 2);
        });
        toggleSpinner(false);
    }
    MoreNews() {
        this.state.pageIndex = this.state.pageIndex + 1;
        let service = new CustomerService();
        if (this.state.IsMore == 0) {
            service.QueryFeedback(this.state.pageIndex, this.state.pageSize).then(result => {
                if (result.data.success) {
                    let list = this.state.feedback;
                    let morList = result.data.data.data;
                    for (let i = 0; i < morList.length; i++) {
                        morList[i].InDate = moment(morList[i].InDate).format('YYYY-MM-DD HH:mm:ss')
                        if (morList[i].SolveDate != null) {
                            morList[i].SolveDate = moment(morList[i].SolveDate).format('YYYY-MM-DD HH:mm:ss')
                        }
                        list.push(morList[i])
                    }
                    // for (let i = 0; i < list.length; i++) {
                    //     morList.push(list[i])
                    // }
                    this.setState({
                        feedback: list
                    })
                } else {
                    this.setState({
                        feedback: this.state.feedback,
                        IsMore: 1
                    })
                }
            }
            )
        }
        toggleSpinner(false);
    }
    onChange(event) {
        var height = 0;
        if (event.nativeEvent.contentSize.height > 40) {//此处是判断 是否大于我设置的input默认高度，如果大于则使用input的内容高度
            height = event.nativeEvent.contentSize.height * 2;//内容高度
        } else {
            height = 60;
        }
        this.setState({
            height: height
        })
    }
    onContentSizeChange(params) {
    }
    send() {
        Keyboard.dismiss();

        let service = new CustomerService();
        if (this.state.NewDescription != '' && this.state.NewDescription != null && this.state.NewDescription != undefined) {
            var description = this.state.NewDescription;
            this.state.NewDescription = "";
            this.refs["input"].clear();
            service.InsertFeedback(description).then(result => {
                if (result.data.success) {
                    let infoList = [];
                    let nowTime = moment(result.data.data).format('YYYY-MM-DD HH:mm:ss')
                    let info = { FeedbackCompanyName: '', ParentCompanyName: '', Description: description, SolveDescription: '', InDate: nowTime }
                    let List = this.state.feedback;
                    infoList.push(info)
                    for (let i = 0; i < List.length; i++) {
                        infoList.push(List[i])
                    }
                    this.setState({
                        feedback: infoList,
                        height: 60,
                        NewDescription: '',
                        defaultmesage: ''
                    });

                    this.refs["input"].clear();
                    this.refs["messageBar"].show(result.data.message, 1);
                } else {
                    
                    Alert.alert(
                        '提示',
                        result.data.message,
                        [
                            { text: '确定', onPress: () => console.log(''), style: 'cancel' },
                        ],
                        { cancelable: false }
                    );
                    // this.refs["messageBar"].show(result.data.message, 2);
                }
            })
        } else {
            this.refs["messageBar"].show("您还未输入反馈内容！", 3);
        }

    }

    render() {
        setStyle();

        let DescriptionLogo = CompanyConfig.CompanyLogo;
        return (
            <View style={Style.back}>
                <CustomHeader sourceColor={StyleConfig.Secondary} sourceBackGroundColor={StyleConfig.Main} buttonHasBackgroundColor={false} ref="header" navigation={this.props.navigation} />
                <OperationMessage ref="messageBar" />
                <View style={{ flex: 1, flexDirection: 'column', marginTop: getResponsiveValue(90) }}>
                    <View style={{ flex: 1 }}>
                        <FlatList
                            removeClippedSubviews={true}//用于将屏幕以外的视图卸载
                            data={this.state.feedback}
                            ref="List"
                            onEndReachedThreshold={0.1}
                            onEndReached={() => this.MoreNews()}
                            keyExtractor={(item, index) => item.InDate}
                            //  onRefresh={() => { this.MoreNews() }}
                            renderItem={({ item }) =>
                                <View key={item.InDate} style={{ flexDirection: 'column', height: getResponsiveValue(AppConfig.design.height), marginTop: getResponsiveValue(20) }} key={item.SysNo}>
                                    {/* <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: getResponsiveValue(40), }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: getResponsiveValue(1182) }}>
                                            <Text style={item.Description != "" && item.Description != null ? Style.DescriptionText : {}}>{item.Description}</Text>
                                            <View style={item.Description != "" && item.Description != null ? Style.triangleRight : {}}></View>
                                            <Image style={[Style.Image, { marginRight: getResponsiveValue(30), }]} source={item.Description != "" && item.Description != null ? DescriptionLogo : {}} />
                                        </View>
                                    </View> */}
                                    <View style={{ flexDirection: 'column', }}>
                                        <Text style={Style.dateText} >{item.InDate}</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', width: getResponsiveValue(1182) }}>
                                            <Image style={[Style.Image, { marginLeft: getResponsiveValue(30), }]} source={item.Description != "" && item.Description != null ? DescriptionLogo : {}} />
                                            <Text style={item.Description != "" && item.Description != null ? Style.DescriptionText : {}}>{item.Description}</Text>
                                        </View>
                                        <View style={item.SolveDescription != "" && item.SolveDescription != null ? Style.triang : null}></View>

                                        <View style={{
                                            flexDirection: 'row',
                                            width: getResponsiveValue(1182),
                                            marginLeft: getResponsiveValue(120),
                                            borderRadius: getResponsiveValue(20),
                                        }}>
                                            <View style={item.SolveDescription != '' && item.SolveDescription != null ? {
                                                padding: getResponsiveValue(20),
                                                height: 'auto',
                                                borderRadius: getResponsiveValue(20),
                                                backgroundColor: CompanyConfig.formatColor(StyleConfig.DescriptionFront, "33"),
                                                width: 'auto',
                                                flexDirection: 'column'
                                            } : {}}>
                                                {item.SolveDescription != '' && item.SolveDescription != null ? <Text style={[Style.dateText, { marginLeft: getResponsiveValue(0), }]} >{item.SolveDate}</Text> : null}
                                                <Text style={item.SolveDescription != '' && item.SolveDescription != null ? Style.SolveDescriptionText : null} >{item.SolveDescription != '' && item.SolveDescription != null ? item.SolveDescription : ""}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            }
                        />
                    </View>
                    <View style={Style.InputViewStyle}>
                        <TextInput
                            // autoCapitalize="none"
                            // autoCorrect={false}
                            underlineColorAndroid="transparent"
                            style={[Style.InputStyle, { padding: 0, height: getResponsiveValue(this.state.height) }]}
                            onChangeText={(text) => { this.state.NewDescription = text }}
                            //onChange={this.onChange.bind(this)}
                            placeholder="问题"
                            // onSubmitEditing={(text) => {
                            //     this.send()
                            // }}
                            // selectTextOnFocus={true}
                            onContentSizeChange={(event) => {
                                this.onChange(event)
                            }}
                            maxLength={200}
                            disableFullscreenUI={true}
                            multiline={true}
                            ref='input'
                            //value={this.state.defaultmesage}
                            //value={this.state.NewDescription}
                            placeholderTextColor={StyleConfig.PopupBackground}>
                            <Text>{this.state.NewDescription}</Text>
                        </TextInput>
                        <TouchableOpacity style={{ marginRight: getResponsiveValue(10), width: getResponsiveValue(40), height: getResponsiveValue(40), borderRadius: getResponsiveValue(20), backgroundColor: StyleConfig.FocalFront, justifyContent: 'center', alignItems: 'center', }} onPress={() => this.send()}>
                            <View><SvgUri width={getResponsiveValue(30)} height={getResponsiveValue(30)} fill={StyleConfig.Secondary} source={"download"} /></View>
                        </TouchableOpacity>
                    </View>
                </View>
                <Spinner IsCanTouch={true} />
            </View>
        );

    }
}
function setStyle() {
    if (Style != null && !CompanyConfig.isGeneral()) return Style;
    Style = StyleSheet.create({
        back: {
            flex: 1,
            backgroundColor: StyleConfig.PopupBackground,
        },
        InputViewStyle: {

            paddingLeft: 15,
            paddingRight: 15,
            //  width: getResponsiveValue(AppConfig.design.width - 100),
            height: 'auto',
            borderRadius: 39,
            marginLeft: getResponsiveValue(20),
            marginRight: getResponsiveValue(20),
            marginBottom: getResponsiveValue(20),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: StyleConfig.Main
        },
        InputStyle: {
            // borderRadius: 39,
            // borderColor: CompanyConfig.AppColor.OnPressMain,
            // borderWidth: getResponsiveValue(4),
            fontSize: getResponsiveFontSize(32),
            color: StyleConfig.Secondary,
            width: getResponsiveValue(1220),
        },
        Image: {
            borderRadius: getResponsiveValue(33),
            width: getResponsiveValue(66),
            height: getResponsiveValue(66),
        },
        NameText: {
            fontSize: getResponsiveFontSize(30),
            color: "#ffffff",
            opacity: 0.7,
            marginLeft: getResponsiveValue(175)
        },
        dateText: {
            // textAlign: 'center',
            marginLeft: getResponsiveValue(116),
            color: StyleConfig.DescriptionFront,
            fontSize: getResponsiveFontSize(24),
            backgroundColor: '#ffffff00',
            // opacity: 0.8
        },
        DescriptionText: {
            // backgroundColor: '#0093de',
            fontSize: getResponsiveFontSize(30),
            // padding: getResponsiveValue(20),
            borderRadius: getResponsiveValue(20),
            borderColor: '#0093de',
            color: StyleConfig.FocalFront,
            marginLeft: getResponsiveValue(20)
        },
        SolveDescriptionText: {
            // backgroundColor: '#FFF',
            fontSize: getResponsiveFontSize(30),
            // padding: getResponsiveValue(20),
            height: 'auto',
            borderRadius: getResponsiveValue(20),
            color: CompanyConfig.AppColor.ContentFront,
            // backgroundColor: CompanyConfig.AppColor.OnPressSecondary,
            backgroundColor: '#00000000',
            // borderRadius: getResponsiveValue(20),
            // width: getResponsiveValue(1182),
            // marginLeft: getResponsiveValue(100)
            width: 'auto',
        },
        triang: {
            width: getResponsiveValue(0),
            height: getResponsiveValue(0),
            backgroundColor: 'transparent',
            borderStyle: 'solid',
            borderLeftWidth: getResponsiveValue(20),
            borderRightWidth: getResponsiveValue(20),
            borderBottomWidth: getResponsiveValue(16),
            borderTopWidth: getResponsiveValue(16),
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: 'transparent',
            borderBottomColor: CompanyConfig.AppColor.OnPressSecondary,
            marginLeft: getResponsiveValue(140)
        },


    });
    return Style;
}
