import React, { Component } from 'react';
import { NavigationActions } from "react-navigation";
import {
  StyleSheet,
  Text,
  Keyboard,
  View,
  Platform,
  TextInput,
  Image,
  ImageBackground,
  TouchableHighlight,
  TouchableOpacity,
  Animated,
  Dimensions,
  ToastAndroid,
  Easing,
  Alert,
  Modal,
  FlatList,
  BackHandler,
  Linking
} from 'react-native';
import Service from '../../services/loginregisterService.js';
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme';
import CompanyConfig, { DefaultCompanyConfig, CompanyConfigHelper } from '../../config/company.config.js';
import DeviceInfo from 'react-native-device-info';
import OperationMessage from '../../components/OperationMessage.js';
import TimerButton from '../../components/TimerButton';
import Spinner2 from '../../components/Spinner2';
import SvgUri, { transformStyle } from '../../components/svguri.js';
import AppConfig, { clearStorage } from '../../config/app.config.js';

import DataDownloadService from '../../services/datadownload.js';
import CommonService, { formatMenu } from '../../services/common.js';
import Select from '../../components/Select';
import BaseUrl from '../../config/company.app';
import Checkbox from '../../components/Checkbox.js'
import axios from "axios";
import { formatStr } from "../../helpers/utils";
import dismissKeyboard from "dismissKeyboard";
import AnalyticsUtil from '../../services/AnalyticsUtil'
import FileHelper from '../../helpers/fileHelper.config.js';
import VersionUpdateService from "../../services/versionupdate";
var serv = new VersionUpdateService();

let dbService = new DataDownloadService();
let { height } = Dimensions.get('window');
const renderr = height;



const isGeneral = CompanyConfig.isGeneral();
const resetAction = NavigationActions.reset({
  index: 0,
  actions: [
    NavigationActions.navigate({ routeName: 'Home' })
  ]
});


let styles = null;
let config = null;
config = DefaultCompanyConfig;
function setStyle() {
  if (styles != null) return styles;
  config = CompanyConfig;
  styles = StyleSheet.create({
    container: {
      flex: 1,
      height: renderr,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bgimg: {
      flex: 1,
    },
    loginlogoStyle: {
      position: 'absolute',
      borderRadius: getResponsiveValue(20),
      width: getResponsiveValue(104),
      height: getResponsiveValue(104),
      top: getResponsiveValue(61),
      right: getResponsiveValue(410),
    },
    buttontextStyle: {
      color: config.AppColor.DescriptionFront,
      fontSize: getResponsiveFontSize(36),
      borderColor: 'transparent',
      backgroundColor: 'transparent',
      textAlign: 'center'
    },
    back: {
      position: "absolute",
      left: getResponsiveValue(60),
      top: getResponsiveValue(60),
      height: getResponsiveValue(80),
      width: getResponsiveValue(80),
      borderRadius: getResponsiveValue(40),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: 'transparent',
      zIndex: 10
    },
    loginTextInputRow: {
      flexDirection: 'row',
      width: getResponsiveValue(643),
      height: getResponsiveValue(85),
      marginTop: getResponsiveValue(10),
    },
    loginTextInputStyle: {
      width: getResponsiveValue(600),
      marginTop: getResponsiveValue(15),
      marginLeft: getResponsiveValue(10),
      height: getResponsiveValue(75),
      padding: 0,
      borderColor: "transparent",
      textAlign: 'left',
      alignSelf: 'center',
      opacity: 0.6,
      color: config.AppColor.ContentFront
    },
    line: {
      backgroundColor: config.AppColor.ContentFront,
      opacity: 0.4,
      borderColor: 'transparent',
      width: getResponsiveValue(643),
      height: 1
    },
    loginPasswordStyle: {
      width: getResponsiveValue(490),
      marginTop: getResponsiveValue(15),
      marginLeft: getResponsiveValue(10),
      height: getResponsiveValue(73),
      padding: 0,
      borderColor: "transparent",
      textAlign: 'left',
      alignSelf: 'center',
      opacity: 0.6,
      color: config.AppColor.ContentFront
    },
    mainTextStyle: {
      color: config.AppColor.MainFront, fontSize: getResponsiveFontSize(36)
    },
    loginBtnStyle: {
      height: getResponsiveValue(84),
      width: getResponsiveValue(643),
      backgroundColor: config.AppColor.ButtonBg,
      marginTop: getResponsiveValue(50),
      borderRadius: getResponsiveValue(10),
      justifyContent: 'center',
      alignItems: 'center',
    },
    loginSettingStyle: {

    },
    loginOtherStyle: {
      flexDirection: 'row',
      marginTop: getResponsiveValue(100)
    },
    //注册样式
    Capchastyle: {
      flexDirection: 'row',
      width: getResponsiveValue(643)
    },
    loginSMSTextInputStyle: {
      width: getResponsiveValue(420),
      height: getResponsiveValue(73),
      marginTop: getResponsiveValue(15),
      padding: 0,
      marginLeft: getResponsiveValue(10),
      alignSelf: 'center',
      opacity: 0.6,
      borderColor: "transparent",
      textAlign: 'left',
      color: config.AppColor.ContentFront
    },
    loginSMSButtonStyle: {
      width: getResponsiveValue(180),
      height: getResponsiveValue(55),
      marginTop: getResponsiveValue(25),
      // borderColor: "transparent",
      alignSelf: 'flex-end',
      borderRadius: getResponsiveValue(35),
      backgroundColor: config.AppColor.ButtonBg,
    },
  });
}


let usertemp = {};

export default class Login extends Component {
  constructor(props) {
    super(props);
    styles = null;
    this.state = {
      isBindFacturers: null,//是否要绑定生厂商
      isLogin: true,
      findPwd: false,
      BtnmarginTop: new Animated.Value(30), //登录注册位置变化
      loginBtnopacity: new Animated.Value(1),//登录透明度变化
      registerBtnopacity: new Animated.Value(0.5),//注册透明度变化
      forgetpwd: new Animated.Value(0.8),//忘记密码透明度变化
      mainopacity: new Animated.Value(1),//主页面透明度变化
      secondpacity: new Animated.Value(0),//副页面透明度变化
      maintop: new Animated.Value(0),//主屏幕高度
      ManuFacturer: {
        ManuFacturerSysNo: '',
        ManuFacturerName: ''
      },
      LoginName: '',
      LoginPassword: '',
      passwordsecure: true,
      Capcha: '',
      devicesinfo: {
        DeviceUniqueID: DeviceInfo.getUniqueID(),
        DeviceModel: DeviceInfo.getModel(),
        DeviceManufacturer: DeviceInfo.getManufacturer(),
        DeviceSystemName: DeviceInfo.getSystemName(),
        DeviceIsTable: DeviceInfo.isTablet() === null ? "" : DeviceInfo.isTablet().toString()
      },
      renderManuFacturer: [],//注册要实时渲染的厂商,
      showModel: false,//登录时展示选择厂商 模态框
      showAgencyModal: false,//代理申请和登录成功的 模态框
      isSelected: false,
      successLogin: null,//showAgencyModal后登录成功的判断
      //isChangeText: -200,//注册时text offset?
    };
    this.requestMessage = "";
    this.companyPhone = "";
    this.successLoginData = null;//登录成功后的data,需要在模态框中去使用
    this.isshowItems = false;
    this.changeManuFacturer = false;
    this.inputManuFacturer = "";//填写的厂商
    this.selectManuFacturer = null;//选择的厂商
    this.inputComponents = [];
    this.allManuFacturer = [];//进入当前页面, 获取所有注册时的厂商
    this.loginManuFacturer = [];//登录时输入账户后得到所有关联的厂商
    this.upTop = this.upTop.bind(this);
    this.NetLogin = this.NetLogin.bind(this);
    this.NetRegisterOrFindPwd = this.NetRegisterOrFindPwd.bind(this);
    setStyle();
    const Cancel = axios.CancelToken.source();
    this.cancelaxios = Cancel;
    this.service = new Service(Cancel);
    this.ImgBackgSuccess = false;//背景图加载成功
  };

  NativeNextPage() {
    AnalyticsUtil.onEventWithLabel('Login', global.AppAuthentication ? global.AppAuthentication.APPCompanyName : global.APPCompanyName);
    this.props.navigation.dispatch(resetAction);
  }


  _onStartShouldSetResponderCapture(event) {//最外层view 捕获到最初级的点击事件,判断当前点击事件是否为inputtext组件,否：收起键盘，是：return false;
    let target = event.nativeEvent.target;
    if (!this.inputComponents.includes(target)) {
      dismissKeyboard();
    }
    return false;
  }
  _inputOnLayout(event) {//当组件挂载或者布局变化的时候调用，将inputtext放到一个数组中
    this.inputComponents.push(event.nativeEvent.target);
  }

  render() {
    let self = this;
    let hadmessagebar = typeof self.refs["messageBar"] !== "undefined";
    setStyle();
    return (
      <ImageBackground style={styles.bgimg} onLoadEnd={(event) => {
        if (!this.ImgBackgSuccess) {
          this.forceUpdate();
        }
      }}
        onLoad={(event) => {
          if (!this.ImgBackgSuccess) {
            this.ImgBackgSuccess = true;
          }
        }}
        source={config.LoginBGImg}
      >
        <OperationMessage ref="messageBar" showMilliseconds={5000} />

        <View style={{ position: 'absolute', flexWrap: 'wrap', flex: 1, left: getResponsiveValue(30), bottom: getResponsiveValue(20), zIndex: 2 }}>
          <Animated.View style={{
            opacity: self.state.forgetpwd
          }}>
            <TouchableHighlight
              underlayColor={'transparent'} onPress={() => {
                if (self.state.isLogin) {
                  self.setState({ findPwd: true });
                  self.upTop();
                }
              }}>
              <Text style={{ color: config.AppColor.DescriptionFront, fontSize: getResponsiveFontSize(28), textAlign: 'center' }}>忘记密码?</Text>
            </TouchableHighlight>
          </Animated.View>
        </View>
        {/* 忘记密码 end */}
        <View onStartShouldSetResponderCapture={this._onStartShouldSetResponderCapture.bind(this)} style={{ backgroundColor: (self.state.showModel && this.loginManuFacturer.length > 0) || self.state.showAgencyModal ? '#000000' : 'transparent', opacity: (self.state.showModel && this.loginManuFacturer.length > 0) || self.state.showAgencyModal ? 0.7 : 1 }} >
          {/* <Image source={CompanyConfig.CompanyLogo} style={styles.loginlogoStyle} /> */}
          < View style={{ width: getResponsiveValue(331) }} >

            {self._readerLeft_BackhomeSection()}
            {/* 左边登录注册项 start*/}

            <Animated.View style={{
              position: "absolute", marginTop: self.state.BtnmarginTop,
              width: getResponsiveValue(331)
            }}>
              <View style={{
                flexDirection: 'column',
                position: "absolute",
                alignItems: 'center',
                height: renderr, justifyContent: 'center', zIndex: 1
              }}>
                <TouchableOpacity style={{ height: getResponsiveValue(50), width: getResponsiveValue(180), alignSelf: 'center', margin: getResponsiveValue(28), marginLeft: getResponsiveValue(150), borderColor: 'transparent' }} underlayColor={'transparent'} onPress={() => {
                  if (!self.state.isLogin) {
                    self.setState({ findPwd: false });
                    self.upTop();
                  }
                }}
                  activeOpacity={1}>
                  <Animated.View style={{ opacity: self.state.loginBtnopacity }}>
                    <Text style={styles.buttontextStyle}>立即登录</Text>
                  </Animated.View>
                </TouchableOpacity>
                {self._readerLeftSection()}
              </View>
            </Animated.View>

            {/* 左边登录注册项 end*/}

          </View>
          <Animated.View style={{
            height: renderr * 2,
            width: getResponsiveValue(1003),
            alignSelf: 'flex-end',
            flexDirection: 'column',
            marginTop: self.state.maintop
          }} >
            <Animated.View style={[styles.container, { opacity: self.state.mainopacity }]}>
              <View style={{ marginTop: getResponsiveValue(200) }}>
                <View style={{ flexDirection: 'column' }}>
                  <View style={styles.loginTextInputRow}>
                    <View style={{ marginTop: getResponsiveValue(35) }}><SvgUri width={getResponsiveValue(25)} height={getResponsiveValue(32)} opacity={0.6} fill={config.AppColor.ContentFront} source="phone" /></View>
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      ref={(val) => self.loginName = val}
                      onLayout={this._inputOnLayout.bind(this)}
                      placeholder={'账号/手机号'}
                      keyboardType={'default'}
                      returnKeyType={'next'}
                      disableFullscreenUI={true}
                      underlineColorAndroid={'transparent'}
                      placeholderTextColor={config.AppColor.ContentFront}
                      onChangeText={(LoginName) => {
                        this.setState({ LoginName });
                      }}
                      style={styles.loginTextInputStyle}
                      onSubmitEditing={() => {
                        self.loginPassword.focus();
                      }}
                    >
                    </TextInput>
                  </View>
                  <View style={styles.line}>
                  </View>
                </View>
                <View style={{ flexDirection: 'column' }}>
                  <View style={styles.loginTextInputRow}>
                    <View style={{ marginTop: getResponsiveValue(35) }}><SvgUri width={getResponsiveValue(25)} height={getResponsiveValue(32)} opacity={0.6} fill={config.AppColor.ContentFront} source="lpassword" /></View>
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      ref={(val) => self.loginPassword = val}
                      placeholder={'请输入密码'}
                      onLayout={this._inputOnLayout.bind(this)}
                      underlineColorAndroid={'transparent'}
                      placeholderTextColor={config.AppColor.ContentFront}
                      disableFullscreenUI={true}
                      returnKeyType={'done'}
                      secureTextEntry={self.state.passwordsecure}
                      onChangeText={(LoginPassword) => {
                        self.setState({ LoginPassword });
                      }}
                      style={styles.loginPasswordStyle}
                      onSubmitEditing={() => {
                        if (isGeneral) {
                          self._getFacturersByLogin();
                        } else {
                          self.NetLogin();
                        }
                      }} />
                    <TouchableOpacity style={{ width: getResponsiveValue(40), height: getResponsiveValue(40), marginTop: getResponsiveValue(35), opacity: 0.4, marginLeft: getResponsiveValue(60) }}
                      onPress={() => {
                        Keyboard.dismiss();
                        self.setState({ passwordsecure: !self.state.passwordsecure });
                      }}>
                      {self.state.passwordsecure ? (<View><SvgUri width={getResponsiveValue(40)} height={getResponsiveValue(40)} fill={config.AppColor.ContentFront} source="eyeclose" /></View>)
                        :
                        (<View><SvgUri width={getResponsiveValue(40)} height={getResponsiveValue(40)} fill={config.AppColor.ContentFront} source="eye" /></View>)
                      }
                    </TouchableOpacity >
                  </View>
                  <View style={styles.line}>
                  </View>
                </View>
                <View style={{ margin: getResponsiveValue(10), marginLeft: 0 }}>
                  <TouchableOpacity
                    style={styles.loginBtnStyle}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (isGeneral) {
                        self._getFacturersByLogin();
                      } else {
                        self.NetLogin();
                      }
                    }}>
                    <Text style={{ color: config.AppColor.ButtonFront, fontSize: getResponsiveFontSize(32) }}>登录</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.loginOtherStyle}>
                  {/*** 登录即代表阅读并同意*/}
                  <Text style={{ opacity: 0.6, color: config.AppColor.ContentFront, fontSize: getResponsiveFontSize(23) }}>
                  </Text>
                  <TouchableHighlight style={{ height: getResponsiveValue(40) }} underlayColor={'transparent'}
                    onPress={() => {
                      self.props.navigation.dispatch(
                        NavigationActions.reset({
                          index: 0,
                          actions: [NavigationActions.navigate({ routeName: 'Home' })]
                        }));
                    }}>
                    {/*** 服务条款*/}
                    <Text style={{ color: config.AppColor.ContentFront, fontSize: getResponsiveFontSize(23) }}></Text>
                  </TouchableHighlight>
                </View>
              </View >
            </Animated.View>
            {/* 登录页面 end*/}
            {/* 注册页面 start*/}
            <Animated.View style={[styles.container, { opacity: self.state.secondpacity }]}>

              <View style={{ marginTop: getResponsiveValue(200) }}>


                <View style={{ flexDirection: 'column' }}>
                  <View style={[styles.loginTextInputRow, { height: getResponsiveValue(73) }]}>
                    <View style={{ marginTop: getResponsiveValue(28) }}><SvgUri width={getResponsiveValue(25)} height={getResponsiveValue(32)} opacity={0.6} fill={config.AppColor.ContentFront} source="phone" />
                    </View>
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      ref={(val) => self.registerName = val}
                      placeholder={'手机号'}
                      onLayout={this._inputOnLayout.bind(this)}
                      keyboardType={'phone-pad'}
                      maxLength={11}
                      returnKeyType={'next'}
                      // defaultValue={self.state.LoginName}
                      disableFullscreenUI={true}
                      underlineColorAndroid={'transparent'}
                      placeholderTextColor={config.AppColor.ContentFront}
                      onChangeText={(LoginName) => {
                        this.setState({ LoginName });
                      }}
                      style={[styles.loginTextInputStyle, { height: getResponsiveValue(73) }]}
                      onFocus={() => {
                        if (isGeneral) {
                          self.state.isBindFacturers = null;
                          if (self.inputManuFacturer.length > 0 && self.selectManuFacturer === null) {
                            if (hadmessagebar) {
                              self.refs["messageBar"].show(self.inputManuFacturer + "厂商不存在!请重新选择厂商!", 2);
                            }
                          }
                          else if (self.selectManuFacturer === null && self.inputManuFacturer.length <= 0 && !self.state.findPwd) {
                            if (hadmessagebar) {
                              self.refs["messageBar"].show("请选择厂商后在输入手机号", 2);
                            }
                          }
                        }
                      }}
                      onSubmitEditing={() => {
                        self.Capcha.focus();
                      }}
                    >
                    </TextInput>
                  </View>
                  <View style={styles.line}>
                  </View>
                </View>
                <View style={{ flexDirection: 'column' }}>
                  <View style={styles.Capchastyle}>
                    <View style={{ marginTop: getResponsiveValue(32) }}><SvgUri width={getResponsiveValue(25)} height={getResponsiveValue(32)} opacity={0.6} fill={config.AppColor.ContentFront} source="yanzheng" />
                    </View>
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      ref={(val) => self.Capcha = val}
                      placeholder={'短信验证码'}
                      onLayout={this._inputOnLayout.bind(this)}
                      underlineColorAndroid={'transparent'}
                      keyboardType={'phone-pad'}
                      returnKeyType={'next'}
                      //defaultValue={self.state.Capcha}
                      placeholderTextColor={config.AppColor.ContentFront}
                      disableFullscreenUI={true}
                      onChangeText={(Capcha) => this.setState({ Capcha })}
                      style={styles.loginSMSTextInputStyle}
                      onSubmitEditing={() => {
                        self.registerPassword.focus();
                      }}
                      onFocus={() => {
                        if (!self.state.findPwd) {
                          self._isExistByLoginName(self.state.LoginName, () => { });
                        }
                      }}>
                    </TextInput>
                    <TimerButton
                      ref={(ref) => self.tb = ref}
                      enable={true}
                      style={[styles.loginSMSButtonStyle, { opacity: self.state.LoginName.trim().length > 0 ? 1 : 0 }]}
                      textStyle={{ color: config.AppColor.ButtonFront, fontSize: getResponsiveFontSize(23), }}
                      timerCount={60}//TODO: 原始时间 60
                      onClick={(shouldStartCountting) => {
                        self.checkTimeButton(shouldStartCountting);
                      }} />

                  </View>
                  <View style={styles.line}>
                  </View>
                </View>
                <View style={{ flexDirection: 'column' }}>
                  <View style={[styles.loginTextInputRow, { marginTop: 0 }]}>
                    <View style={{ marginTop: getResponsiveValue(32) }}><SvgUri width={getResponsiveValue(25)} height={getResponsiveValue(32)} opacity={0.6} fill={config.AppColor.ContentFront} source="lpassword" /></View>
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      ref={(val) => self.registerPassword = val}
                      placeholder={self.state.findPwd ? '新密码' : '密码'}
                      onLayout={this._inputOnLayout.bind(this)}
                      underlineColorAndroid={'transparent'}
                      placeholderTextColor={config.AppColor.ContentFront}
                      disableFullscreenUI={true}
                      // defaultValue={self.state.LoginPassword}
                      returnKeyType={'done'}
                      secureTextEntry={self.state.passwordsecure}
                      onChangeText={(LoginPassword) => this.setState({ LoginPassword })}
                      style={styles.loginPasswordStyle}
                      onSubmitEditing={() => {
                        self.NetRegisterOrFindPwd();
                      }}
                    />
                    <TouchableOpacity style={{ width: getResponsiveValue(40), height: getResponsiveValue(40), opacity: 0.4, marginTop: getResponsiveValue(42), marginLeft: getResponsiveValue(60) }}
                      onPress={() => {
                        self.setState({ passwordsecure: !self.state.passwordsecure });
                      }}>
                      {self.state.passwordsecure ?
                        (<View><SvgUri width={getResponsiveValue(40)} height={getResponsiveValue(40)} fill={config.AppColor.ContentFront} source="eyeclose" /></View>)
                        :
                        (<View><SvgUri width={getResponsiveValue(40)} height={getResponsiveValue(40)} fill={config.AppColor.ContentFront} source="eye" /></View>)
                      }

                    </TouchableOpacity >
                  </View>
                  <View style={styles.line}>
                  </View>
                </View>
                <View style={{ flexDirection: 'column' }}>
                  <View style={{ position: 'absolute', top: -getResponsiveValue(345) }}>
                    {
                      isGeneral && (!this.state.isLogin) && (!this.state.findPwd) ?
                        (
                          <Select
                            model={2}
                            onLayout={this._inputOnLayout.bind(this)}
                            placeholder={"厂商"}
                            ajaxUrl={"/login/GetAllManuFacturers"}
                            listStyle={{
                              top: 0,
                              maxHeight: getResponsiveValue(200),
                              width: getResponsiveValue(643),
                              backgroundColor: '#FFFFFF',
                              borderBottomRightRadius: getResponsiveValue(30),
                              borderBottomLeftRadius: getResponsiveValue(30),
                            }}
                            itemSeparatorStyle={{
                              height: getResponsiveValue(2),
                              backgroundColor: '#9999994d',
                              width: getResponsiveValue(550),
                              alignSelf: 'flex-end'
                            }}
                            itemStyle={{
                              height: getResponsiveValue(90),
                              width: getResponsiveValue(643),
                              justifyContent: 'center',
                            }}
                            selectViewStyle={{
                              width: getResponsiveValue(560)
                            }}
                            Colorconfig={config}
                            data={this.allManuFacturer}
                            onChangeText={(text) => {
                              self.selectManuFacturer = null;
                              self.inputManuFacturer = text;
                              if (text.length > 0) {
                                self.inputManuFacturer = text;
                                //self.setState({ isChangeText: 300 });
                              } else {
                                self.selectManuFacturer = null;
                                //self.setState({ isChangeText: -200 });
                              }

                            }}
                            callback={(key, value, item) => {
                              self.selectManuFacturer = item;
                            }} />
                        ) : null
                    }
                  </View>

                </View>
                <View style={{ margin: getResponsiveValue(10), marginLeft: 0 }}>
                  <TouchableOpacity
                    style={[styles.loginBtnStyle, { marginTop: getResponsiveValue(40) }]}
                    activeOpacity={0.7}

                    onPress={() => {
                      self.NetRegisterOrFindPwd();
                    }}>
                    <Text style={{ color: config.AppColor.ButtonFront, fontSize: getResponsiveFontSize(32) }}>{self.state.findPwd ? '确认密码' : '注册'}</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.loginOtherStyle, { marginTop: getResponsiveValue(60) }]}>
                  <Text style={{ fontSize: getResponsiveFontSize(23) }}></Text>
                  <View>
                    <TouchableHighlight style={{ height: getResponsiveValue(40) }} underlayColor={'transparent'} onPress={() => {
                      Keyboard.dismiss();
                      self.props.navigation.dispatch(
                        NavigationActions.reset({
                          index: 0,
                          actions: [
                            NavigationActions.navigate({ routeName: 'Home' })
                          ]
                        })
                      );
                    }}>
                      {/**
             * 服务条款
              */}
                      <Text style={{ color: '#fff', fontSize: getResponsiveFontSize(23) }}></Text>
                    </TouchableHighlight>
                  </View>
                </View>
              </View >
            </Animated.View>
            {/* 注册页面 end*/}

          </Animated.View>
        </View>
        {self._renderModal()}
        {self._renderAgencyModal()}
        <Spinner2 ref={(ref) => this.Spinner2 = ref} />
      </ImageBackground >
    )
  }
  componentDidMount() {
    let self = this;
    if (typeof global.usertemp === 'object') {
      usertemp = Object.assign({}, global.usertemp);
    } else {
      usertemp = {
        AppCompanyID: BaseUrl.CompanyID,
        DistributorSysNo: -1
      }
    }

    if (isGeneral) {
      self.Spinner2.showLoading();
      this.service.getallManuFacturer((result) => {
        let rresult = result.data;
        if (rresult.success === true) {
          this.allManuFacturer = rresult.data;
          if (this.allManuFacturer.length > 0) {
            this.allManuFacturer.map((manufacturer) => {
              if (manufacturer.Logo !== null && manufacturer.Logo !== "") {
                // let logo = FileHelper.getFilePath( manufacturer.Logo,120);
                manufacturer.Logo = manufacturer.Logo;
                manufacturer.icon = manufacturer.Logo;
              } else {
                manufacturer.Logo = AppConfig.defaultNoImage;
                manufacturer.icon = AppConfig.defaultNoImage;
              };
              manufacturer.key = manufacturer.SysNo;
              manufacturer.value = manufacturer.Name;
            });
          }
        } else {
          if (typeof this.refs["messageBar"] !== "undefined")
            this.refs["messageBar"].show(rresult.message, 2)
        }
        self.Spinner2.hideLoading();
      }, (error) => {
        this.allManuFacturer = [];
        if (typeof this.refs["messageBar"] !== "undefined")
          this.refs["messageBar"].show(error.message, 3);
        self.Spinner2.hideLoading();
      });
    }
  }
  UNSAFE_componentWillMount() {
    global.storage.remove({ key: 'loginState' });
    global.NeedLogin = true;
    global.AppAuthentication = null;
    //if (isGeneral) {
    if (Platform.OS === 'android') {
      this.listener = BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
    }
    //}
  }
  onBackAndroid = () => {
    if (this.state.showAgencyModal) {
      if (this.state.isBindFacturers !== null && this.state.isBindFacturers) {
        this.state.LoginPassword = "";
        this.state.isBindFacturers = false;
      }
    }
    if (isGeneral) {
      //到了主页了
      if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
        //最近2秒内按过back键，可以退出应用。
        return false;
      }
      this.lastBackPressed = Date.now();
      ToastAndroid.show('再按一次退出应用', ToastAndroid.SHORT);
      return true;
    } else {
      return false;
    }
  };
  componentWillUnmount() {
    this.cancelaxios.cancel();

    if (isGeneral && this.listener && this.listener !== null) {
      if (Platform.OS === 'android') {
        this.listener.remove('hardwareBackPress');
      }
    }
  }
  //#region  
  _renderModal() {
    if (isGeneral && this.state.showModel && this.loginManuFacturer.length > 0) {
      return (
        <View>
          <Modal
            animationType={'fade'}
            visible={this.state.showModel}
            transparent={true}
            supportedOrientations={['portrait', 'landscape']}
            onRequestClose={() => {
              this.setState({ showModel: false });
            }}
          >
            <View style={{
              width: getResponsiveValue(650),
              height: getResponsiveValue(437),
              borderRadius: getResponsiveValue(30),
              backgroundColor: '#ffffff',
              alignSelf: 'center',
              marginTop: (renderr - getResponsiveValue(437)) / 2,
              shadowOffset: {
                width: 0,
                height: getResponsiveValue(30)
              },
              shadowColor: '#0709174d',
              shadowRadius: getResponsiveValue(70),
              shadowOpacity: getResponsiveValue(1)
            }}>

              <Text style={{
                marginTop: getResponsiveValue(43),
                marginLeft: getResponsiveValue(39),
                fontSize: getResponsiveFontSize(44),
                color: '#3a3a3a'
              }}>登录厂商</Text>
              <FlatList
                style={{
                  alignSelf: 'center',
                  width: getResponsiveValue(550)
                }}
                horizontal={true}
                ref='flatlist'
                keyExtractor={(item, index) => index.toString()}
                numColumns={1}
                contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', }}
                getItemLayout={(item, index) => ({ length: getResponsiveValue(170), offset: getResponsiveValue(170) * index, index })}
                initialNumToRender={4}
                extraData={this.state}
                showsHorizontalScrollIndicator={false}
                data={this.loginManuFacturer}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={{
                    }}
                    onPress={(event) => {
                      this._renderIsselected(index);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={{
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: getResponsiveValue(150),
                    }}>
                      <View style={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: getResponsiveValue(150),
                      }}>
                        <Image source={item.Logo} style={{
                          width: getResponsiveValue(90),
                          height: getResponsiveValue(90),
                          borderRadius: getResponsiveValue(45),
                          borderWidth: item.isSelected ? getResponsiveValue(5) : 0,
                          borderColor: item.isSelected ? '#0071e0' : 'transparent'
                        }} />
                        {item.isSelected ? (
                          <Checkbox style={{ position: 'absolute', top: 0, right: 0, width: getResponsiveValue(30), height: getResponsiveValue(30) }} isShowNotSelectImg={false} fill={'#0071e0'} isSelected={item.isSelected} ></Checkbox>
                        ) : null
                        }
                      </View>
                      <Text style={{
                        fontSize: getResponsiveFontSize(30),
                        color: item.isSelected ? '#0071e0' : '#000000',
                      }}>
                        {formatStr(item.Name, 5)}
                      </Text>
                    </View>

                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={{
                width: getResponsiveValue(400),
                height: getResponsiveValue(75),
                margin: getResponsiveValue(10),
                marginBottom: getResponsiveValue(30),
                borderRadius: getResponsiveValue(37),
                alignSelf: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: config.AppColor.ButtonBg,
              }}
                activeOpacity={0.7}
                onPress={(event) => {
                  let seltemp = this.loginManuFacturer.some((value, index) => {
                    if (value.isSelected === true) {
                      global.AppAuthentication = {};
                      global.AppAuthentication.AppCompanyID = value.AuthID;
                      return true;
                    }
                  });
                  if (seltemp) {
                    if (isGeneral && this.state.isLogin) {
                      this.NetLogin();
                      this.setState({ showModel: false });
                    }
                  } else {
                    if (typeof this.refs["messageBar"] !== "undefined")
                      this.refs["messageBar"].show("请选择生产商后登录！", 2)
                    return;
                  }
                }}
              >
                <Text style={{
                  fontSize: getResponsiveFontSize(32),
                  color: config.AppColor.ButtonFront
                }}>确定</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{
                position: 'absolute',
                backgroundColor: '#969ca2b3',
                height: getResponsiveValue(46),
                width: getResponsiveValue(46),
                borderRadius: getResponsiveValue(23),
                top: getResponsiveValue(29),
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                right: getResponsiveValue(29), zIndex: 999999
              }}
                onPress={() => {
                  this.setState({ showModel: false });
                }}
              >
                <View>
                  <SvgUri width={getResponsiveValue(21)} height={getResponsiveValue(21)} fill={'#fff'} source="close" />
                </View>
              </TouchableOpacity>
            </View>

          </Modal>
        </View>

      );
    }
    return null;
  }
  _renderIsselected(index) {
    if (this.loginManuFacturer.length > 0) {
      this.loginManuFacturer.map((data, inde) => {
        if (index === inde) {
          data.isSelected = true;
        } else {
          data.isSelected = false;
        }
      })
    }
    this.forceUpdate();
  }


  _isExistByLoginName(LoginName: String, callback = () => { }) {
    if (LoginName.trim() !== "") {
      if (isGeneral) {
        if (this.selectManuFacturer === null) {
          return;
        }
        global.AppAuthentication = {};
        global.AppAuthentication.AppCompanyID = this.selectManuFacturer.AuthID;
      }
      this.Spinner2.showLoading();
      this.service.isExistByLoginName(LoginName, (result) => {
        this.Spinner2.hideLoading();
        let rresult = result.data;
        if (!rresult.success) {
          if (typeof this.refs["messageBar"] !== "undefined")
            this.refs["messageBar"].show(rresult.message, 2)
        } else {
          if (rresult.message !== null) {
            this.requestMessage = rresult.message;
          }

          if (rresult.code !== "20" && rresult.code !== "5") {
            Keyboard.dismiss();
            this.setState({ isBindFacturers: true, showAgencyModal: true });
          } else {
            callback();
          }
        }
      }, (error) => {
        this.Spinner2.hideLoading();
      });
    }
  }

  _getFacturersByLogin() {
    let self = this;
    if (self.state.LoginName === '') {
      if (typeof self.refs["messageBar"] !== "undefined")
        self.refs["messageBar"].show("请输入账号！", 2);
    } else if (self.state.LoginPassword === '') {
      if (typeof self.refs["messageBar"] !== "undefined")
        self.refs["messageBar"].show("请输入密码！", 2);
    } else {
      let data = {
        LoginName: self.state.LoginName,
        LoginPassword: self.state.LoginPassword
      };
      self.Spinner2.showLoading();
      self.service.getFacturersByLogin(data, (result) => {
        self.Spinner2.hideLoading();
        let rresult = result.data;
        if (rresult.success) {
          self.loginManuFacturer = rresult.data;
          self.loginManuFacturer.map((manufacturer) => {
            if (manufacturer.Logo !== null && manufacturer.Logo !== "") {
              manufacturer.Logo = { uri: BaseUrl.imageBaseUrl + FileHelper.getUrl(manufacturer.Logo, 120) };
            } else {
              manufacturer.Logo = AppConfig.defaultNoImage;
            };
            manufacturer.isSelected = false;
          });
          if (self.loginManuFacturer.length > 1) {
            self.setState({ showModel: true });
          } else if (self.loginManuFacturer.length === 1) {
            global.AppAuthentication = {};
            global.AppAuthentication.AppCompanyID = self.loginManuFacturer[0].AuthID;
            self.NetLogin();
          } else {
            if (typeof self.refs["messageBar"] !== "undefined")
              self.refs["messageBar"].show("未找到该账号注册的厂商", 2)
          }
        }
        else {
          self.NetLogin();
        }
      }, (error) => {
        self.Spinner2.hideLoading();
        this.loginManuFacturer = [];
        if (typeof this.refs["messageBar"] !== "undefined")
          this.refs["messageBar"].show(error.message, 3);
      });
    }
  }
  //#endregion

  //#region 请求短信服务
  smsService(shouldStartCountting) {
    let self = this;
    let hadmessagebar = typeof self.refs["messageBar"] !== "undefined";
    shouldStartCountting(true);
    self.Spinner2.showLoading();
    this.service.getCapcha(self.state.LoginName, self.state.findPwd.toString(), (result) => {
      self.Spinner2.hideLoading();
      let rresult = result.data;
      if (!rresult.success) {
        if (rresult.code === "1") {
          self.tb.InitAction();
          //shouldStartCountting(false);
        }
        if (hadmessagebar)
          self.refs["messageBar"].show(rresult.message, 2);
      } else {
        ToastAndroid.show("获取验证码成功！", ToastAndroid.SHORT);
      }
    }, (error) => {
      self.Spinner2.hideLoading();
      if (hadmessagebar)
        self.refs["messageBar"].show("网络加载失败!请重试!", 2);
      self.tb.InitAction();
    });
  }
  //#endregion

  //#region 查询账号是否存在服务
  checkLoginNameSevice(shouldStartCountting) {
    let self = this;
    let hadmessagebar = typeof self.refs["messageBar"] !== "undefined";
    self._isExistByLoginName(self.state.LoginName, () => {
      if (self.state.isBindFacturers !== null && self.state.isBindFacturers) {//是否要绑定生厂商: 需要绑定
        shouldStartCountting(false);
        return;
      }
      if (isGeneral) {
        global.AppAuthentication = {};
        global.AppAuthentication.AppCompanyID = self.selectManuFacturer.AuthID;
      }
      self.smsService(shouldStartCountting);
    });
  }
  //#endregion


  checkTimeButton(shouldStartCountting) {
    let self = this;
    let hadmessagebar = typeof self.refs["messageBar"] !== "undefined";
    if (self.state.LoginName.trim() !== '' && (!(/^1\d{10}$/.test(self.state.LoginName.trim())))) {
      if (hadmessagebar)
        self.refs["messageBar"].show("请输入正确的手机号！", 2);
      shouldStartCountting(false);
      return;
    }
    if (isGeneral) {
      if (self.state.findPwd) {//通用版找回密码
        self.smsService(shouldStartCountting);
      } else {//通用版注册
        if (self.selectManuFacturer === null) {
          if (hadmessagebar)
            self.refs["messageBar"].show("请选择厂商后再获取验证码!", 2);
          shouldStartCountting(false);
          return;
        }
        self._isExistByLoginName(self.state.LoginName, () => {
          self.smsService(shouldStartCountting);
        });
      }
    } else {
      if (self.state.findPwd) {//特定版找回密码
        self.smsService(shouldStartCountting);
      } else {//特定版注册
        self.checkLoginNameSevice(shouldStartCountting);
      }
    }
  }

  //注册代理或者是登录成功 模态框:this.state.successLogin :null 注册代理; true 可以登录; false 不能登录 
  _renderAgencyModal() {

    let self = this;
    let hadmessagebar = typeof self.refs["messageBar"] !== "undefined";
    if (self.state.showAgencyModal) {
      if (self.state.successLogin === null) {
        self.state.LoginPassword = "";
      }

      let cancelTouchStyle = {
        justifyContent: 'center',
        marginTop: getResponsiveValue(30),
        marginBottom: getResponsiveValue(40),
      }, cancelTextStyle = {
        fontSize: getResponsiveValue(28),
        color: "#b2b2b2",
      };

      if (self.state.successLogin !== null && !self.state.successLogin && (self.companyPhone === null || self.companyPhone === "")) {
        cancelTouchStyle = {
          backgroundColor: "#18a9ed",
          height: getResponsiveValue(72),
          width: getResponsiveValue(430),
          justifyContent: 'center',
          borderRadius: getResponsiveValue(36),
          marginBottom: getResponsiveValue(20)
        };
        cancelTextStyle = {
          fontSize: getResponsiveValue(32),
          color: "#FFFFFF",

        }
      }
      return (
        <View onStartShouldSetResponderCapture={this._onStartShouldSetResponderCapture.bind(this)}>
          <Modal
            animationType={'fade'}
            visible={self.state.showAgencyModal}
            transparent={true}
            supportedOrientations={['portrait', 'landscape']}
            onRequestClose={() => {
              if (this.state.showAgencyModal) {
                if (this.state.successLogin === null) {//注册代理
                  if (this.state.isBindFacturers !== null && this.state.isBindFacturers) {
                    this.state.LoginPassword = "";
                    this.state.isBindFacturers = false;
                  }
                } else {//登录后
                  this.state.successLogin = null;
                }
              }
              self.setState({ showAgencyModal: false });
            }}
          >
            <View style={{
              width: getResponsiveValue(558),
              borderRadius: getResponsiveValue(10),
              backgroundColor: "#ffffff",
              shadowColor: "#0b11241a",
              marginTop: (renderr - getResponsiveValue(550)) / 2,
              alignSelf: 'center',
              flexDirection: 'column',
              // justifyContent: 'space-between',
              alignItems: 'center',
              //paddingTop: getResponsiveValue(30),
              elevation: 10,
              shadowOffset: {
                width: getResponsiveValue(10),
                height: getResponsiveValue(17)
              },
              shadowRadius: getResponsiveValue(70),
              shadowOpacity: 1
            }}>
              <Text style={{
                fontSize: getResponsiveFontSize(32),
                color: "#3a3a3a",
                marginTop: getResponsiveValue(40),
              }}>
                登录提示
               </Text>
              <Text style={{
                fontSize: getResponsiveFontSize(28),
                color: "#3a3a3a",
                alignSelf: 'center',
                width: getResponsiveValue(500),
                marginTop: getResponsiveValue(30),
              }}>
                {self.requestMessage !== "" ? self.requestMessage : "您已注册!可以通过密码快捷登录!"}
              </Text>
              {self.state.successLogin === null ?
                (
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder={'请输入密码'}
                    onLayout={this._inputOnLayout.bind(this)}
                    underlineColorAndroid={'transparent'}
                    placeholderTextColor={"#b2b2b2"}
                    disableFullscreenUI={true}
                    returnKeyType={'done'}
                    secureTextEntry={true}
                    onChangeText={(LoginPassword) => this.state.LoginPassword = LoginPassword}
                    style={{
                      width: getResponsiveValue(430), height: getResponsiveValue(72),
                      borderColor: "transparent",
                      alignSelf: 'center',
                      backgroundColor: "#b2b2b24d",
                      paddingLeft: getResponsiveValue(30),
                      borderRadius: getResponsiveValue(36),
                      marginTop: getResponsiveValue(40),
                      paddingVertical: 0
                    }}
                  />
                ) : (
                  <TouchableOpacity onPress={() => {
                    if (self.companyPhone !== "" && self.companyPhone !== null) {
                      Linking.canOpenURL('tel:' + self.companyPhone).then(supported => {
                        if (!supported) {
                          if (hadmessagebar) {
                            this.refs["messageBar"].show("当前设备不支持打电话,请手动拨打电话!", 3);
                          }
                        } else {
                          Linking.openURL('tel:' + self.companyPhone);
                        }
                      }).catch(e => {
                        if (hadmessagebar) {
                          this.refs["messageBar"].show("当前设备不支持打电话,请手动拨打电话!", 3);
                        }
                      });
                    }
                  }
                  }>
                    <Text style={{
                      width: getResponsiveValue(430),
                      height: getResponsiveValue(72),
                      backgroundColor: "transparent",
                      textAlign: 'center',
                      fontSize: getResponsiveFontSize(32),
                      marginTop: getResponsiveValue(40),
                      color: '#18a9ed'
                    }} >{self.companyPhone} </Text></TouchableOpacity>)}
              <View style={{ flexDirection: 'row', }}>

                {self.state.successLogin !== null && !self.state.successLogin && (self.companyPhone === null || self.companyPhone === "") ? null : (
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#18a9ed",
                      height: getResponsiveValue(72),
                      width: getResponsiveValue(430),
                      justifyContent: 'center',
                      borderRadius: getResponsiveValue(36),
                      marginTop: getResponsiveValue(20)
                    }}
                    onPress={(event) => {

                      Keyboard.dismiss();
                      if (self.state.successLogin === null) {//注册代理
                        if (self.state.LoginPassword.trim().length > 0) {
                          if (isGeneral && self.selectManuFacturer !== null) {
                            global.AppAuthentication = {};
                            global.AppAuthentication.AppCompanyID = self.selectManuFacturer.AuthID;
                          } else if (isGeneral && self.selectManuFacturer === null) {
                            if (hadmessagebar)
                              self.refs["messageBar"].show("请选择生厂商后发起请求!", 2);
                            return;
                          }
                          self.Spinner2.showLoading();
                          this.service.ApplyAgency({ LoginName: this.state.LoginName, LoginPassword: this.state.LoginPassword }, (data) => {
                            self.Spinner2.hideLoading();
                            if (data.data.success) {
                              //self.upTop();
                              self.setState({ showAgencyModal: false });
                              self.NetLogin();
                            } else {
                              self.registerName.clear();
                              self.Capcha.clear();
                              self.registerPassword.clear();
                              self.setState({ showAgencyModal: false, LoginPassword: "", LoginName: "" });
                              if (hadmessagebar)
                                this.refs["messageBar"].show(data.data.message, 2);
                            }
                          }, (error) => {
                            self.Spinner2.hideLoading();
                            self.setState({ showAgencyModal: false });
                            if (hadmessagebar)
                              this.refs["messageBar"].show(error.message, 3);
                          });
                        } else {
                          if (hadmessagebar)
                            this.refs["messageBar"].show("请输入密码!", 2);
                        }
                      }
                      else if (!self.state.successLogin) {
                        if (self.companyPhone !== "" && self.companyPhone !== null) {
                          Linking.canOpenURL('tel:' + self.companyPhone).then(supported => {
                            if (!supported) {
                              if (hadmessagebar) {
                                this.refs["messageBar"].show("当前设备不支持打电话,请手动拨打电话!", 3);
                              }
                            } else {
                              Linking.openURL('tel:' + self.companyPhone);
                            }
                          }).catch(e => {
                            if (hadmessagebar) {
                              this.refs["messageBar"].show("当前设备不支持打电话,请手动拨打电话!", 3);
                            }
                          });
                        }
                      } else {  //登录成功
                        self.Spinner2.showLoading();
                        self.setState({ showAgencyModal: false });
                        if (self.successLoginData !== null) {
                          if (usertemp) {
                            serv.checkLoginUser(usertemp, self.successLoginData);
                          };
                          global.storage.save({
                            key: 'loginState',
                            data: self.successLoginData
                          });
                          global.AppAuthentication = self.successLoginData;
                        };
                        global.NeedLogin = false;
                        //添加设备到百度推送标签组中
                        let common = new CommonService();
                        // storage.load({
                        //   key: 'BaiduPushChannelID',
                        //   autoSync: false
                        // }).then(channelid => {
                        //   common.AddDeviceToBaiduPushTag(channelid).then((result) => {
                        //     //
                        //   })
                        // })
                        let menuList = self.successLoginData.MenuList;
                        formatMenu(menuList);
                        global.storage.save({ key: "AppMenu", data: menuList });
                        if (self.successLoginData.CompanyConfigList.length > 0) {
                          global.storage.save({ key: "CompanyParameters", data: self.successLoginData.CompanyConfigList });
                          if (isGeneral) {
                            CompanyConfigHelper.forceUpdate(() => {
                              self.Spinner2.hideLoading();
                              self.NativeNextPage();
                            }, error => {
                              self.Spinner2.hideLoading();
                              self.NativeNextPage();
                            });
                          } else {
                            CompanyConfigHelper.ready(
                              () => {
                                self.Spinner2.hideLoading();
                                self.UpProductData();
                              }, error => {
                                self.Spinner2.hideLoading();
                                self.NativeNextPage();
                              });
                          }
                        }

                      }
                    }}
                    activeOpacity={0.6}>
                    <Text style={{
                      fontSize: getResponsiveValue(32),
                      color: "#FFFFFF",
                      textAlign: 'center',
                      backgroundColor: 'transparent'
                    }}>{self.state.successLogin === null ? "确定" : self.state.successLogin ? "游客登录" : "拨打电话"}</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity style={{
                position: 'absolute',
                backgroundColor: '#969ca24b',
                height: getResponsiveValue(46),
                width: getResponsiveValue(46),
                borderRadius: getResponsiveValue(23),
                top: getResponsiveValue(10),
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                right: getResponsiveValue(10), zIndex: 999999
              }}
                onPress={() => {
                  if (self.state.successLogin === null) {
                    self.state.LoginPassword = "";
                    self.state.isBindFacturers = false;
                  } else {
                    self.state.successLogin = null;
                  }
                  self.setState({ showAgencyModal: false });
                }}
              >
                <View>
                  <SvgUri width={getResponsiveValue(21)} height={getResponsiveValue(21)} fill={'#fff'} source="close" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={cancelTouchStyle}
                onPress={(event) => {
                  if (self.state.successLogin === null) {
                    self.loginName.clear();
                    self.registerName.clear();
                    self.Capcha.clear();
                    self.loginPassword.clear();
                    self.registerPassword.clear();
                    self.state.LoginName = "";
                    self.state.LoginPassword = "";
                    self.state.Capcha = "";
                    self.state.passwordsecure = true;
                    self.selectManuFacturer = null;
                    self.setState({ showAgencyModal: false, findPwd: true, isBindFacturers: false });
                  } else {
                    if (self.state.successLogin) {//游客登录
                    } else {//取消登录
                      self.state.successLogin = null;
                      self.setState({ showAgencyModal: false });
                    }
                  }
                }}
                activeOpacity={0.6}>
                <Text style={[{
                  backgroundColor: 'transparent',
                  textAlign: 'center',
                }, cancelTextStyle]}>{self.state.successLogin === null ? "找回密码?" : (self.state.successLogin ? "" : (self.companyPhone === null || self.companyPhone === "" ? "确定" : "取消"))}</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      );
    }
    return null;
  }

  //#region 左边部分
  _readerLeftSection() {
    let self = this;
    //if (!isGeneral) {//TODO: 通用版注册
    return (
      <TouchableOpacity style={{ height: getResponsiveValue(50), width: getResponsiveValue(180), alignSelf: 'center', margin: getResponsiveValue(28), marginLeft: getResponsiveValue(150), borderColor: 'transparent' }} underlayColor={'transparent'} onPress={() => {
        if (self.state.isLogin) {
          self.setState({ findPwd: false });
          self.upTop();
        }
      }}
        activeOpacity={1}
      >
        <Animated.View style={{ opacity: self.state.registerBtnopacity }}>
          <Text style={styles.buttontextStyle}>{self.state.findPwd ? "重置密码" : "注册账号"}</Text>
        </Animated.View>
      </TouchableOpacity>
    )
    //}//TODO: 通用版注册
    return null;
  };

  _readerLeft_BackhomeSection() {
    let self = this;
    if (!isGeneral) {
      return (
        <TouchableOpacity style={styles.back} onPress={() => {
          self.props.navigation.dispatch(
            NavigationActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({ routeName: 'Home', params: { needlogin: true } })
              ]
            })
          );
        }} activeOpacity={0.8}  >

          <View ><SvgUri width={getResponsiveValue(40)} height={getResponsiveValue(40)} fill={CompanyConfig.AppColor.SecondaryFront} source="backhome" /></View>
        </TouchableOpacity>
      )
    }
    return null;
  }
  //#endregion
  NetLogin() {

    if (isGeneral) {
      clearStorage();
      if (this.listener && this.listener !== null) {
        if (Platform.OS === 'android') {
          this.listener.remove('hardwareBackPress');
        }
      }
    }
    let self = this;
    if (this.state.LoginName === '') {
      if (typeof self.refs["messageBar"] !== "undefined")
        self.refs["messageBar"].show("请输入账号！", 2);
    } else if (this.state.LoginPassword === '') {
      if (typeof self.refs["messageBar"] !== "undefined")
        self.refs["messageBar"].show("请输入密码！", 2);
    } else {
      self.Spinner2.showLoading();
      this.service.netlogin({ LoginName: this.state.LoginName, LoginPassword: this.state.LoginPassword, Devicesinfo: this.state.devicesinfo }, (result) => {
        let rresult = result.data;
        self.Spinner2.hideLoading();
        if (rresult.success === true) {
          if (rresult.code !== null) {// 登录成功 有提示信息
            self.successLoginData = rresult.data;
            self.requestMessage = rresult.message;
            self.companyPhone = rresult.code;
            global.AppAuthentication = self.successLoginData;
            const commonService = new CommonService();
              commonService.GetMenuList().then(result => {
                self.successLoginData.MenuList = result.data
                global.storage.save({ key: "AppMenu", data: self.successLoginData.MenuList });
              })
            self.setState({ successLogin: true, showAgencyModal: true });
          } else {//登录成功没有提示信息
            if (usertemp) {
              serv.checkLoginUser(usertemp, rresult.data);
            }
            global.storage.save({
              key: 'loginState',
              data: rresult.data
            });
            global.AppAuthentication = rresult.data;
            global.NeedLogin = false;
            let menuList = rresult.data.MenuList;
            global.storage.save({ key: "AppMenu", data: menuList });
            formatMenu(menuList);
            
            if (rresult.data.CompanyConfigList.length > 0) {
              global.storage.save({ key: "CompanyParameters", data: rresult.data.CompanyConfigList });
              if (isGeneral) {
                CompanyConfigHelper.forceUpdate(() => {
                  self.NativeNextPage();
                }, error => {
                  self.NativeNextPage();
                });
              } else {
                CompanyConfigHelper.ready(
                  () => {
                    self.UpProductData();
                  }, error => {
                    self.NativeNextPage();
                  });
              }
            }
          }
        } else {//不能登录
          if (rresult.code && rresult.code !== null) {//有提示信息
            self.requestMessage = rresult.message;
            self.companyPhone = rresult.data;

            self.setState({ successLogin: false, showAgencyModal: true });
          } else {//没有提示信息
            if (typeof self.refs["messageBar"] !== "undefined")
              self.refs["messageBar"].show(rresult.message, 2);
          }
        }
      }, (error) => {
        self.Spinner2.hideLoading();
      });
    }
  }
  UpProductData() {
    let self = this;
    global.storage.load({ key: "DataDownloadAlert" }).then(d => {
      dbService.GetDataDownloadInfo(result => {
        let dataCount = 0;
        let dlInfo = result.data;
        for (let i = 0; i < dlInfo.length; i++) {
          let tdl = dlInfo[i];
          dataCount += tdl.DataCount;
        }
        if (dataCount > 0) {
          Alert.alert("数据更新提示", "你有新的商品数据需要同步，是否马上同步？",
            [
              {
                text: '稍后提示', onPress: () => {
                  global.storage.save({ key: "DataDownloadAlert", data: 1 });
                  self.NativeNextPage();
                }
              },
              // {
              //   text: '不再提示', onPress: () => {
              //     global.storage.save({ key: "DataDownloadAlert", data: 2 });
              //     self.NativeNextPage();
              //   }
              // },
              {
                text: '马上更新', onPress: () => {
                  global.storage.save({ key: "DataDownloadAlert", data: 1 });
                  setTimeout(function () {
                    self.props.navigation.dispatch(new NavigationActions.reset({
                      index: 1,
                      actions: [
                        NavigationActions.navigate({ routeName: 'Home' }),
                        NavigationActions.navigate({ routeName: 'DataDownload' })
                      ]
                    }));
                  }, 500);
                }
              }
            ], { cancelable: false });
        } else {
          self.NativeNextPage();
        };
      }, error => {
        self.NativeNextPage();
      });
    });
  }
  NetRegisterOrFindPwd() {
    let self = this;
    let hadmessagebar = typeof self.refs["messageBar"] !== "undefined";
    Keyboard.dismiss();
    if (isGeneral && this.listener && this.listener !== null) {
      if (Platform.OS === 'android') {
        this.listener.remove('hardwareBackPress');
      }
    }
    if (isGeneral && (!self.state.findPwd) && self.selectManuFacturer === null) {
      if (hadmessagebar)
        self.refs["messageBar"].show("请选择厂商!", 3);
    } else if (self.state.LoginName.trim() === '') {
      if (hadmessagebar)
        self.refs["messageBar"].show("请输入手机号！", 3);
    }
    else if (self.state.LoginName.trim() !== '' && (!(/^1\d{10}$/.test(self.state.LoginName.trim())))) {
      if (hadmessagebar)
        self.refs["messageBar"].show("请输入正确的手机号！", 3);
    }
    else if (self.state.Capcha.trim() === '') {
      if (hadmessagebar)
        self.refs["messageBar"].show("请输入验证码！", 3);
    } else if (self.state.LoginPassword.trim() === '') {
      if (hadmessagebar)
        self.refs["messageBar"].show("请输入密码！", 3);
    } else if (!(/^[a-zA-Z0-9]{6,20}$/.test(self.state.LoginPassword))) {
      if (hadmessagebar)
        self.refs["messageBar"].show("密码只能由6至20位字母或数字组成！", 3);
    }
    else {
      if (isGeneral && this.selectManuFacturer !== null) {
        global.AppAuthentication = {};
        global.AppAuthentication.AppCompanyID = this.selectManuFacturer.AuthID;
      }
      self.Spinner2.showLoading();
      this.service.netregister({ LoginName: self.state.LoginName, LoginPassword: self.state.LoginPassword, Capcha: self.state.Capcha, IsFindPwd: self.state.findPwd.toString() }, (result) => {
        self.Spinner2.hideLoading();
        let rresult = result.data;
        if (rresult.success === true) {
          if (self.state.findPwd) {
            self.setState({ findPwd: false });
            self.upTop();
            ToastAndroid.show("密码重置成功！请登录!", ToastAndroid.SHORT);
          } else {
            self.NetLogin();//自动登录
            if (hadmessagebar)
              ToastAndroid.show("注册成功!", ToastAndroid.SHORT);
          }
          // global.AppAuthentication = null;
        } else {

          if (rresult.code === "66") {
            self.setState({ showAgencyModal: true });
          } else {
            if (hadmessagebar)
              self.refs["messageBar"].show(rresult.message, 2);
          }
        };
      }, (error) => {
        self.Spinner2.hideLoading();
      });
    }

  }
  //改变左边的位置与透明度
  upTop() {
    let self = this;
    self.state.isChangeText = -200;
    //if (self.state.isLogin) {
    Animated.parallel([
      Animated.timing(self.state.loginBtnopacity, {
        toValue: self.state.isLogin ? 0.5 : 1,
        duration: 500,
        easing: Easing.linear
      }),
      Animated.timing(self.state.registerBtnopacity, {
        toValue: self.state.isLogin ? 1 : 0.5,
        duration: 500,
        easing: Easing.linear
      }),
      Animated.timing(self.state.forgetpwd, {
        toValue: self.state.isLogin ? 0 : 0.8,
        duration: 50,
        easing: Easing.linear
      }),
      Animated.timing(self.state.mainopacity, {
        toValue: self.state.isLogin ? 0.5 : 1,
        duration: 500,
        easing: Easing.linear,
        delay: 500
      }),
      Animated.timing(self.state.secondpacity, {
        toValue: self.state.isLogin ? 1 : 0.5,
        duration: 500,
        easing: Easing.liner,
        delay: 500
      }),
      Animated.spring(self.state.BtnmarginTop, {
        toValue: self.state.isLogin ? -30 : 30,
        friction: 10,
        tension: 20
      }),
      Animated.spring(self.state.maintop, {
        toValue: self.state.isLogin ? -renderr : 0,
        friction: renderr / 5,
        tension: renderr
      }),
    ]).start();
    Keyboard.dismiss();
    self.loginName.clear();
    self.registerName.clear();
    self.Capcha.clear();
    self.loginPassword.clear();
    self.registerPassword.clear();
    self.state.LoginName = "";
    self.state.LoginPassword = "";
    self.state.Capcha = "";
    self.state.passwordsecure = true;
    self.selectManuFacturer = null;
    self.state.isLogin = !self.state.isLogin;
  }
}



