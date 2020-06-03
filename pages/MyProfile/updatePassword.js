import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Alert,
    ScrollView,
    TextInput,
    Image,
    Keyboard,
} from 'react-native';
import CustomerService from '../../services/myprofile';
import { NavigationActions } from 'react-navigation';
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme';
import OperationMessage from '../../components/OperationMessage.js';
import CompanyConfig from '../../config/company.config.js';
import CustomHeader, { HeaderMenu } from '../../components/CustomHeader.js';
import Spinner from '../../components/Spinner.js';
import CompanyAppConfig from '../../config/company.app';
import AppConfig from '../../config/app.config.js';
import StyleConfig from '../../config/style.config'
let Style = null;
const resetAction = NavigationActions.reset({
    index: 0,
    actions: [
        NavigationActions.navigate({ routeName: 'Login' })
    ]
});
const resetdefaultAction = NavigationActions.reset({
    index: 1,
    actions: [
        NavigationActions.navigate({ routeName: 'Home' }),
        NavigationActions.navigate({ routeName: 'Login' })
    ]
});
export default class updatePassword extends Component {
    static navigationOptions = {
        title: '修改密码',
    };

    constructor(props) {
        super(props);
        this.state = {
            OldPassword: '',
            NewPassword: '',
            NewPassword2: '',
            UserFullName: '',
            CellPhone: '',
            LoginName: "",
        };
    }
    componentDidMount() {
        global.storage.load(

            {
                key: 'loginState',
                autoSync: false
            }).then(auth => {
                this.setState({
                    UserFullName: auth.UserFullName,
                    CellPhone: auth.CellPhone,
                    LoginName: auth.LoginName
                });
            }).catch(err => {

            });
    }

    UpdatePassword() {
        Keyboard.dismiss();
        // const { goBack } = this.props.navigation;
        // const { navigate } = this.props.navigation;
        if (this.state.OldPassword == '') {
            this.refs["messageBar"].show("请输入原始密码！", 3);
        } else {
            if (this.state.NewPassword == "") {
                this.refs["messageBar"].show("请输入新密码！", 3);
            } else {
                if (this.state.NewPassword != this.state.NewPassword2) {
                    this.refs["messageBar"].show("确认密码与新密码不一致！", 3);
                } else {
                    if (!(/^[a-zA-Z0-9]{6,20}$/.test(this.state.NewPassword))) {
                        this.refs["messageBar"].show("密码只能由6至20位字母和数字组成！", 3);
                    } else {
                        let service = new CustomerService();
                        service.UpdateUserPassword(this.state.OldPassword, this.state.NewPassword).then(
                            result => {
                                if (result.data.success) {
                                    this.refs["messageBar"].show(result.data.message, 1);
                                    timer = setTimeout(() => {
                                        global.storage.remove({
                                            key: 'loginState'
                                        });
                                        global.AppAuthentication = null;
                                        if (CompanyAppConfig.isGeneral()) {
                                            this.props.navigation.dispatch(resetAction);
                                        }
                                        else {
                                            this.props.navigation.dispatch(resetdefaultAction);
                                        }
                                    }, 500);

                                } else {
                                    Alert.alert(
                                        '提示',
                                        result.data.message,
                                        [
                                            { text: '确定', onPress: () => console.log(''), style: 'cancel' },
                                        ],
                                        { cancelable: false }
                                    );
                                    // this.refs["messageBar"].show(result.data.message, 3);
                                }
                            }
                        )
                    }
                }
            }
        }
    }
    render() {
        setStyle();
        let logo = CompanyConfig.CompanyLogo;
        let name = this.state.UserFullName == '' || this.state.UserFullName == null ? '' : this.state.UserFullName;
        let cellPhone = this.state.CellPhone == '' || this.state.CellPhone == null ? '' : this.state.CellPhone;

        let phoneNumber = this.state.LoginName;
        if (phoneNumber && phoneNumber.length > 10) {
            phoneNumber = phoneNumber.substr(0, 3) + "****" + phoneNumber.substr(7);
        }
        
        // debugger
        return (
            <View style={Style.backImage}>
                <OperationMessage ref="messageBar" />
                <CustomHeader sourceColor={StyleConfig.Secondary} sourceBackGroundColor={StyleConfig.Main} buttonHasBackgroundColor={false} ref="header" title="修改密码" navigation={this.props.navigation} rightButtonOnPress={() => this.UpdatePassword()
                } />
                <ScrollView bounces={false} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps={'never'} >

                    <View style={{ flexDirection: 'row', alignItems: "center" }}>
                        <View style={Style.View}>
                            <Image style={Style.Image} source={logo} />
                            <View style={{ flexDirection: 'column', alignItems: "center"}}>
                                <Text style={Style.Name}>{name}</Text>
                                <Text style={Style.Phone} >{phoneNumber}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'column', width: getResponsiveValue(774), height: getResponsiveValue(270) }}>
                            <View style={Style.textView} >
                                <Text style={Style.Text}>原始密码：</Text>
                                <TextInput
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    //  placeholder="原始密码"
                                    /* placeholderTextColor={CompanyConfig.AppColor.MainFront} */
                                    underlineColorAndroid="transparent"
                                    style={Style.TextInput}
                                    returnKeyType={'next'}
                                    maxLength={20}
                                    disableFullscreenUI={true}
                                    onChangeText={newValue => { this.state.OldPassword = newValue }}
                                    onSubmitEditing={() => {
                                        this.refs["newPassword"].focus();
                                    }}
                                />
                            </View>
                            <View style={Style.textView} >
                                <Text style={Style.Text}>新  密  码：</Text>
                                <TextInput
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    // placeholder="新密码"
                                    /* placeholderTextColor={CompanyConfig.AppColor.MainFront} */
                                    underlineColorAndroid="transparent"
                                    style={Style.TextInput}
                                    secureTextEntry={true}
                                    returnKeyType={'next'}
                                    maxLength={20}
                                    ref="newPassword"
                                    disableFullscreenUI={true}
                                    onChangeText={newValue => { this.state.NewPassword = newValue }}
                                    onSubmitEditing={() => {
                                        this.refs["newPassword2"].focus();
                                    }}
                                />
                            </View>
                            <View style={Style.textView} >
                                <Text style={Style.Text}>确认密码：</Text>
                                <TextInput
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    //placeholder="确认密码"
                                    // {placeholderTextColor={CompanyConfig.AppColor.MainFront}}
                                    underlineColorAndroid="transparent"
                                    secureTextEntry={true}
                                    returnKeyType={'done'}
                                    ref="newPassword2"
                                    returnKeyLabel={"确定"}
                                    style={[Style.TextInput]}
                                    maxLength={20}
                                    disableFullscreenUI={true}
                                    onChangeText={newValue => { this.setState({ NewPassword2: newValue }); }}
                                />
                            </View>
                        </View>
                        <Spinner />
                    </View>
                </ScrollView>
            </View>
        );
    }
}
function setStyle() {
    if (Style != null && !CompanyConfig.isGeneral()) return Style;
    Style = StyleSheet.create({
        backImage: {
            flex: 1,
            backgroundColor: StyleConfig.PopupBackground
        },
        textView: {
            borderBottomWidth: getResponsiveValue(1),
            borderColor:  CompanyConfig.formatColor(StyleConfig.DescriptionFront, "33"),
            flexDirection: 'row',
            alignItems: 'center',
            height: getResponsiveValue(90),
            width: getResponsiveValue(650),
            backgroundColor: '#ffffff00'
        },
        Text: {
            // backgroundColor: '#FFFFFF',
            height: 'auto',
            fontSize: getResponsiveFontSize(32),
            color: StyleConfig.FocalFront,
            backgroundColor: '#ffffff00'
        },
        TextInput: {
            // borderBottomWidth: getResponsiveValue(1),
            // borderColor: CompanyConfig.AppColor.OnPressLine,
            height: getResponsiveValue(88),
            fontSize: getResponsiveFontSize(28),
            color: StyleConfig.FocalFront,
            width: getResponsiveValue(500),
            padding: 0,
            marginBottom: getResponsiveValue(-1)
        },
        Image: {
            borderRadius: getResponsiveValue(74),
            width: getResponsiveValue(148),
            height: getResponsiveValue(148),
        },
        View: {
            width: getResponsiveValue(560),
            height: getResponsiveValue(AppConfig.design.height),
            marginTop: getResponsiveValue(20),
            marginBottom: getResponsiveValue(20),
            flexDirection: 'column',
            alignItems: "center",
            // paddingTop: getResponsiveValue(214)
            justifyContent: 'center',

        },
        Name: {
            fontSize: getResponsiveFontSize(32),
            color: StyleConfig.FocalFront,
            marginTop: getResponsiveValue(20),
            // paddingLeft: getResponsiveValue(0),
            marginLeft: getResponsiveValue(20),
            backgroundColor: '#ffffff00'
        },
        Phone: {
            fontSize: getResponsiveFontSize(24),
            marginLeft: getResponsiveValue(20),
            color: StyleConfig.FocalFront,
            backgroundColor: '#ffffff00',
        },
    });
    return Style;
}
