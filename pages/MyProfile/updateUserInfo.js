import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Alert,
    Keyboard,
    TouchableOpacity,
    ScrollView,
    
    Dimensions,
    TextInput,
    KeyboardAvoidingView,
   
} from 'react-native';
import CustomerService from '../../services/myprofile';
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme';
import OperationMessage from '../../components/OperationMessage.js';
// import CustomHeader from '../../components/CustomHeader.js';
import CompanyConfig from '../../config/company.config.js';
// import Spinner from '../../components/Spinner.js';
import SvgUri from '../../components/svguri.js';
let { height } = Dimensions.get('window');
import { AreaPicker } from '../../components/EasyPicker.js';
import { StyleConfig } from '../../config/style.config';
const renderr = height;
let Style = null;
export default class personnelPassword extends Component {
    static navigationOptions = {
        title: '修改信息',
    };
    // static propTypes = {
    //     closeOnPress: PropTypes.func
    // };
    constructor(props) {
        super(props);
        this.state = {
            UserFullName: '',
            CellPhone: '',
            UserSysNo: '',
            ProvinceName: null,    //省
            CityName: null,    //市
            DistrictName: null,   //区
            Address: null
        };
    }
    areaPicker = new AreaPicker();
    componentDidMount() {
        // const { navigate } = this.props.navigation;
    }
    _showAreaPicker() {
        let thisObj = this;
        let selectedValue = thisObj.state.ProvinceName ? [thisObj.state.ProvinceName, thisObj.state.CityName, thisObj.state.DistrictName] : ['四川省', '成都市', '新都区'];
        this.areaPicker.init(selectedValue, (pickedValue) => {
            thisObj.setState({ ProvinceName: pickedValue[0], CityName: pickedValue[1], DistrictName: pickedValue[2] });
        }, () => { thisObj.areaPicker.show(); });

    }
    getInfo(userSysNo, userFullName, cellPhone, ProvinceName, CityName, DistrictName, Address) {
        this.setState({
            UserSysNo: userSysNo,
            CellPhone: cellPhone,
            UserFullName: userFullName,
            ProvinceName: ProvinceName,
            CityName: CityName,
            DistrictName: DistrictName,
            Address: Address
        })
    }
    UpdateCompanyUserInfo() {
        // const { goBack } = this.props.navigation;
        Keyboard.dismiss();
        this.areaPicker.hide();
        // const { navigate } = this.props.navigation;
        if (this.state.UserFullName == '') {
            this.refs["messageBar"].show("请输入姓名！", 3);
        } else {
            if (this.state.CellPhone == '') {
                this.refs["messageBar"].show("请输入手机号码！", 3);
                // } else {
                //     if (!(/^((1[35847]\d{9})|(400\d{1,10})|(800\d{1,10})|(0\d{2,3}-\d{7,8}))$/).test(this.state.CellPhone)) {
                //         this.refs["messageBar"].show("请输入正确的手机号码！", 3);
            } else {
                let service = new CustomerService();
                service.UpdateUserInfo(this.state.UserSysNo, this.state.UserFullName, this.state.CellPhone, this.state.ProvinceName, this.state.CityName, this.state.DistrictName, this.state.Address).then(
                    result => {
                        if (result.data.success) {
                            this.refs["messageBar"].show(result.data.message, 1);
                            this.props.refreshOnPress();
                            timer = setTimeout(() => {
                                this.props.closeOnPress();

                            }, 500);

                        } else {
                            if (!result.data.success) {
                                Alert.alert(
                                    '提示',
                                    result.data.message,
                                    [
                                        { text: '确定', onPress: () => console.log(''), style: 'cancel' },
                                    ],
                                    { cancelable: false }
                                );
                                // this.refs["messageBar"].show(result.data.message, 2);
                            } else {
                                Alert.alert(
                                    '提示',
                                    '网络错误，请稍后再试！',
                                    [
                                        { text: '确定', onPress: () => console.log(''), style: 'cancel' },
                                    ],
                                    { cancelable: false }
                                );
                                //  this.refs["messageBar"].show('网络错误，请稍后再试！', 2);
                            }
                        }
                    }
                )

                    ;
            }

        }
    }

    render() {
        setStyle();
        return (
            <View style={Style.ScrollView} >
                <OperationMessage ref="messageBar" width={getResponsiveValue(667)} />
                {/* <CustomHeader ref="header" title="修改信息" navigation={this.props.navigation} rightButtonOnPress={() => this.UpdateCompanyUserInfo()
                    } /> */}
                <KeyboardAvoidingView behavior="position" keyboardVerticalOffset={-150}>
                    <ScrollView bounces={false} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps={'never'} >

                        <View style={Style.windowView}>

                            <View style={{ flexDirection: "row", }}>
                                <TouchableOpacity style={Style.closeTouch} onPress={() => { this.props.closeOnPress(); this.areaPicker.hide(); Keyboard.dismiss(); }}>
                                    <View><SvgUri width={getResponsiveValue(40)} height={getResponsiveValue(40)} fill={StyleConfig.Main} source={'close'} /></View>
                                </TouchableOpacity>
                                <TouchableOpacity style={{
                                    width: getResponsiveValue(50), height: getResponsiveValue(50), marginTop: getResponsiveValue(40),
                                    marginLeft: getResponsiveValue(450),
                                }} onPress={() => this.UpdateCompanyUserInfo()}>
                                    <View><SvgUri width={getResponsiveValue(40)} height={getResponsiveValue(40)} fill={StyleConfig.Main} source={"sure"} /></View>
                                </TouchableOpacity>
                            </View>
                            <View style={[Style.View, { marginTop: getResponsiveValue(111), }]} >
                                <Text style={Style.Text}>用户昵称：</Text>
                                <TextInput
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    placeholderTextColor={StyleConfig.DescriptionFront}
                                    underlineColorAndroid="transparent"
                                    style={Style.TextInput}
                                    maxLength={20}
                                    returnKeyType={'next'}
                                    disableFullscreenUI={true}
                                    onChangeText={newValue => { this.state.UserFullName = newValue; }}
                                    defaultValue={this.state.UserFullName}
                                    maxLength={20}
                                />
                            </View>
                            <View style={[Style.View]} >
                                <Text style={Style.Text}>手机号码：</Text>
                                <TextInput
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    placeholderTextColor={StyleConfig.DescriptionFront}
                                    underlineColorAndroid="transparent"
                                    style={Style.TextInput}
                                    maxLength={11}
                                    returnKeyType={'done'}
                                    returnKeyLabel={"确定"}
                                    keyboardType="numeric"
                                    disableFullscreenUI={true}
                                    onChangeText={newValue => { this.state.CellPhone = newValue; }}
                                    defaultValue={this.state.CellPhone}
                                />
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

            </View>
        );
    }
}
function setStyle() {
    if (Style != null && !CompanyConfig.isGeneral()) return Style;
    Style = StyleSheet.create({
        header: {
            color: CompanyConfig.StyleColor.TitleFront,
            fontSize: getResponsiveFontSize(32)
        },
        windowView: {
            width: getResponsiveValue(667),
            height: renderr,
            // backgroundColor: CompanyConfig.formatColor(CompanyConfig.AppColor.PopupBackground, "e6"),
            backgroundColor: StyleConfig.PopupBackground,
            flexDirection: "column",
            alignItems: 'center'
        },
        // soureImage: {
        //     opacity: 0.5,
        //     width: getResponsiveValue(50),
        //     height: getResponsiveValue(50),
        // marginTop: getResponsiveValue(40),
        // marginLeft: getResponsiveValue(550),
        // marginTop: getResponsiveValue(40),
        // marginLeft: getResponsiveValue(450),
        // },

        ScrollView: {
            backgroundColor: StyleConfig.PopupBackground,
            flex: 1
        },
        closeTouch: {
            // marginLeft: getResponsiveValue(50),
            marginTop: getResponsiveValue(47),
            width: getResponsiveValue(40),
            height: getResponsiveValue(40),
        },
        TextInput: {
            // backgroundColor: '#FFFFFF',
            height: 'auto',
            fontSize: getResponsiveFontSize(28),
            color: StyleConfig.FocalFront,
            width: getResponsiveValue(1000),
            padding: 0,
            marginBottom: getResponsiveValue(-1)
        },
        View: {
            borderBottomWidth: getResponsiveValue(1),
            // borderColor: CompanyConfig.AppColor.PopupFront,
            flexDirection: 'row',
            alignItems: 'center',
            height: getResponsiveValue(90),
            width: getResponsiveValue(550)
        },
        Text: {
            // backgroundColor: '#FFFFFF',
            height: 'auto',
            fontSize: getResponsiveFontSize(32),
            color: CompanyConfig.AppColor.PopupFront,
        }
    });
    return Style;
}
