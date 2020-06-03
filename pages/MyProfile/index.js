import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Linking,
  TouchableOpacity,
  ImageBackground,
  TouchableHighlight,
  Image,
  DeviceEventEmitter
} from 'react-native';
import AlertModal from "../../components/AlertModal";
import CustomerService from '../../services/myprofile';
import commService from '../../services/common';
import { NavigationActions } from 'react-navigation';
import CompanyConfig, { CompanyConfigHelper } from '../../config/company.config.js';
import OperationMessage from '../../components/OperationMessage.js';
import Spinner, { toggleSpinner } from '../../components/Spinner.js';
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme';
import SvgUri from '../../components/svguri.js';
import AppConfig from '../../config/app.config.js';
import CompanyAppConfig from '../../config/company.app';
import axios from "axios";

let indexStyle = null;
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
    NavigationActions.navigate({ routeName: 'Login' }),
  ]
});

let isGeneral = CompanyAppConfig.isGeneral();
export default class MyProfileIndex extends Component {
  static navigationOptions = {
    title: '个人中心',
  };

  constructor(prop) {
    super(prop);
    indexStyle = null;
    this.state = {
      user: {
        UserFullName: null,
        CellPhone: null,
        LoginName: null,
        IsChild: null,
        IsGuest: null,
        AppCompanySysNo: null,
        DistributorSysNo: null,
        showloding: false,
      },
      manyManuFS: false, //多个厂商
      storageInfo: null,
      PermissionList: []
    }
    const Cancel = axios.CancelToken.source();
    this.cancelaxios = Cancel;
    this.ComponentWillUnmount = false;
    this.service = new CustomerService(Cancel);
  }
  componentWillUnmount() {
    this.cancelaxios.cancel();
    this.ComponentWillUnmount = true;
  }

  exit() {
    this.setState({
      showloding: true
    }, () => {
      toggleSpinner(true);
      let self = this;
      global.storage.remove({
        key: 'loginState'
      });
      global.storage.remove({
        key: 'productSeries'
      });
      global.storage.remove({
        key: 'SelectedShoppingCarCustomer'
      });
      global.NeedLogin = true;
      global.usertemp = Object.assign({}, global.AppAuthentication);
      global.AppAuthentication = null;
      const { navigate } = this.props.navigation;


      DeviceEventEmitter.emit("needlogin", true);



      if (CompanyAppConfig.isGeneral()) {
        let cService = new commService();
        cService.GetCompanyParameters().then((r) => {
          var cparameters = r.data;
          if (cparameters !== null) {
            storage.save({ key: "CompanyParameters", data: cparameters });
            CompanyConfigHelper.forceUpdate(() => {
              toggleSpinner(false);
              self.props.navigation.dispatch(resetAction);
            }, error => {
              toggleSpinner(false);
              self.props.navigation.dispatch(resetAction);
            });
          } else {
            toggleSpinner(false);
            self.props.navigation.dispatch(resetAction);
          }
        }).catch(e => {
          toggleSpinner(false);
          self.props.navigation.dispatch(resetAction);
        });
      }
      else {
        toggleSpinner(false);
        this.props.navigation.dispatch(resetdefaultAction);
      }
    });

  }

  componentDidMount() {
    let thisObj = this;
    global.storage.load(
      {
        key: 'loginState',
        autoSync: false
      }).then(auth => {
        thisObj.setState({
          user: { AppCompanySysNo: auth.AppCompanySysNo, DistributorSysNo: auth.DistributorSysNo, LoginName: auth.LoginName, UserFullName: auth.UserFullName, CellPhone: auth.CellPhone, IsChild: auth.IsChild, IsGuest: auth.IsGuest },
          PermissionList: auth.PermissionList,
          storageInfo: auth,
          manyManuFS: auth.IsManyMerchantor
        });
        thisObj.service.GetCompanyUser().then(result => {
          if (result.data.success) {
            if (!thisObj.ComponentWillUnmount) {
              this.state.storageInfo.PermissionList = result.data.data.SysPermissionList
              global.storage.save({
                key: 'loginState',
                data: this.state.storageInfo
              });
              global.storage.save({
                key: 'productSeries',
                data: result.data.data.DistributorProductMultipleList,
              });
              this.setState({
                PermissionList: result.data.data.SysPermissionList,
                showloding: true,
              })
            }
          }

        }).catch(() => { });
      }).catch(() => {
        if (CompanyAppConfig.isGeneral()) {
          thisObj.props.navigation.dispatch(resetAction);
        } else {
          thisObj.props.navigation.dispatch(resetdefaultAction);
        }
      });
  }

  CallCompanyPhone() {
    this.AlertModal.Show("提示", "请联系厂商开通权限，电话号码" + this.state.storageInfo.APPCompanyCellphone, [

      {
        text: "拨打", onPress: () => {
          Linking.canOpenURL('tel:' + this.state.storageInfo.APPCompanyCellphone).then(supported => {
            if (!supported) {
              this.refs["messageBar"].show("当前设备不支持打电话,请手动拨打电话!", 3);
            } else {
              Linking.openURL('tel:' + this.state.storageInfo.APPCompanyCellphone);
            }
          }).catch(e => {
            this.refs["messageBar"].show("当前设备不支持打电话,请手动拨打电话!", 3);
          })
        }
      }, {
        text: "取消", onPress: () => { }
      }
    ]);
  }

  render() {
    setStyle();
    let hasUserManager = false, hasPermissionManager = false, isInstallationPersonnel = false;
    if (this.state.PermissionList && this.state.PermissionList.length > 0) {
      for (let i = 0; i < this.state.PermissionList.length; i++) {
        let p = this.state.PermissionList[i];
        if (p.PermissionKey == "APP_UserManager") {
          if (this.state.user.AppCompanySysNo != this.state.user.DistributorSysNo) {
            hasUserManager = true;
          }
        }
        else if (p.PermissionKey == "APP_UserPermissionManager") {
          hasPermissionManager = true;
        } else if (p.PermissionKey == "APP_InstallationPersonnel") {
          isInstallationPersonnel = true
        }
      }
    }

    // }
    //  }
    const { navigate } = this.props.navigation;
    let user = this.state.user;
    let name = user.UserFullName == '' || user.UserFullName == null ? '' : user.UserFullName;
    let loginName = user.LoginName == '' || user.LoginName == null ? '' : user.LoginName;
    let LoginNameText = user.UserFullName;
    if (loginName != '' && loginName.length == 11) {
      LoginNameText = loginName.substr(0, 3) + "****" + loginName.substr(7);
    } else {
      LoginNameText = loginName;
    }
    let logo = CompanyConfig.CompanyLogo;
    return (
      <ImageBackground style={indexStyle.ScrollView} source={CompanyConfig.CompanyBGImg}>
        <OperationMessage ref="messageBar" />
        {this.state.showloding ? <Spinner /> : null}
        <AlertModal ref={(al) => this.AlertModal = al} />
        <View style={indexStyle.headerView}>
          <TouchableHighlight style={indexStyle.back} onPress={() => { this.props.navigation.goBack(); }} activeOpacity={0.8} underlayColor={CompanyConfig.AppColor.OnPressSecondary} >
            <View><SvgUri width={getResponsiveValue(40)} height={getResponsiveValue(40)} fill={CompanyConfig.AppColor.SecondaryFront} source="back" /></View>
          </TouchableHighlight>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: getResponsiveValue(32), color: CompanyConfig.AppColor.SecondaryFront, paddingRight: getResponsiveValue(35) }}>个人中心</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: "center", }}>
          <View style={indexStyle.View}>
            <Image style={indexStyle.Image} source={logo} />
            <View style={{ flexDirection: 'column', alignItems: "center", }}>
              <Text style={indexStyle.Name}>{name}</Text>
              <Text style={indexStyle.Phone} >{LoginNameText}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginTop: getResponsiveValue(30) }}>
              <TouchableHighlight style={indexStyle.buttonView} underlayColor={CompanyConfig.AppColor.OnPressSecondary} onPress={() => {
                this.AlertModal.Show("提示", "确定退出登录并重新登录吗?", [

                  {
                    text: "确定", onPress: () => {
                      // self.service.switchManuFacturer
                      this.exit();
                    }
                  }, {
                    text: "取消", onPress: () => { }
                  }
                ])
              }}>
                <Text style={{ fontSize: getResponsiveFontSize(24), color: CompanyConfig.AppColor.ButtonFront }}>退出登录</Text>
              </TouchableHighlight>
            </View>
          </View>

          <View style={indexStyle.clickView}>
            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
              {hasUserManager ? <TouchableOpacity onPress={() => navigate('Personnel')}>
                <View style={indexStyle.TextView}>
                  <Text style={indexStyle.Text}>员工管理</Text>
                  <SvgUri width={getResponsiveValue(30)} height={getResponsiveValue(30)} fill={CompanyConfig.AppColor.ContentFront} source={"arrow-right"} />
                </View>
              </TouchableOpacity> : null}
              {hasPermissionManager ? <TouchableOpacity onPress={() => navigate('UserAuth')}>
                <View style={[indexStyle.TextView]}>
                  <Text style={indexStyle.Text}>权限分配</Text>
                  <SvgUri width={getResponsiveValue(30)} height={getResponsiveValue(30)} fill={CompanyConfig.AppColor.ContentFront} source={"arrow-right"} />
                </View>
              </TouchableOpacity> : null}
              {this.state.storageInfo != null && this.state.storageInfo.IsGuest ?
                <TouchableOpacity onPress={() => this.CallCompanyPhone()}>
                  <View style={indexStyle.TextView}>
                    <Text style={indexStyle.Text}>权限申请</Text>
                    <SvgUri width={getResponsiveValue(30)} height={getResponsiveValue(30)} fill={CompanyConfig.AppColor.ContentFront} source={"arrow-right"} />
                  </View>
                </TouchableOpacity>
                : null}
              {isGeneral && this.state.manyManuFS ? (
                // ProfileSwitcher SwitchManuFacturers
                <TouchableOpacity onPress={() => navigate('SwitchManuFacturers')}>
                  <View style={[indexStyle.TextView]}>
                    <Text style={indexStyle.Text}>切换厂商</Text>
                    <SvgUri width={getResponsiveValue(30)} height={getResponsiveValue(30)} fill={CompanyConfig.AppColor.ContentFront} source={"arrow-right"} />
                  </View>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity onPress={() => navigate('UpdatePassword')}>
                <View style={indexStyle.TextView}>
                  <Text style={indexStyle.Text}>修改密码</Text>
                  <SvgUri width={getResponsiveValue(30)} height={getResponsiveValue(30)} fill={CompanyConfig.AppColor.ContentFront} source={"arrow-right"} />
                </View>
              </TouchableOpacity>
              {this.state.storageInfo != null && !this.state.storageInfo.IsGuest ?
                <TouchableOpacity onPress={() => navigate('Feedback')}>
                  <View style={indexStyle.TextView}>
                    <Text style={indexStyle.Text}>意见反馈</Text>
                    <SvgUri width={getResponsiveValue(30)} height={getResponsiveValue(30)} fill={CompanyConfig.AppColor.ContentFront} source={"arrow-right"} />
                  </View>
                </TouchableOpacity> : null}
            </ScrollView>
          </View>

        </View>
      </ImageBackground>
    );
  }
}
function setStyle() {
  if (indexStyle != null && !CompanyConfig.isGeneral()) return indexStyle;
  indexStyle = StyleSheet.create({
    ScrollView: {
      backgroundColor: CompanyConfig.AppColor.OnPressMain,
      flex: 1
    },
    buttonView: {
      width: getResponsiveValue(140),
      height: getResponsiveValue(48),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: CompanyConfig.AppColor.ButtonBg,
      borderRadius: getResponsiveValue(8),
      marginLeft: getResponsiveValue(10),
      marginRight: getResponsiveValue(10)
    },
    headerView: {
      height: getResponsiveValue(90),
      width: getResponsiveValue(AppConfig.design.width),
      backgroundColor: CompanyConfig.formatColor(CompanyConfig.AppColor.Secondary, "b3"),
      flexDirection: 'row',
      alignItems: 'center'
    },
    back: {
      height: getResponsiveValue(69),
      width: getResponsiveValue(73),
      borderRadius: getResponsiveValue(40),
      marginLeft: getResponsiveValue(12),
      justifyContent: "center",
      alignItems: 'center'
    },
    Text: {
      fontSize: getResponsiveFontSize(32),
      color: CompanyConfig.AppColor.ContentFront,
      marginRight: getResponsiveValue(30)
    },
    TextView: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: 'auto',
      height: getResponsiveValue(88),
      borderBottomWidth: getResponsiveValue(1),
      borderStyle: 'solid',
      borderColor: CompanyConfig.AppColor.OnPressLine,
      alignItems: "center",
      paddingRight: getResponsiveValue(30)
    },
    Image: {
      borderRadius: getResponsiveValue(74),
      width: getResponsiveValue(148),
      height: getResponsiveValue(148),
    },
    View: {
      width: getResponsiveValue(AppConfig.design.width / 2),
      height: getResponsiveValue(AppConfig.design.height - 90),
      flexDirection: 'column',
      alignItems: "center",
      justifyContent: 'center',
    },
    Name: {
      fontSize: getResponsiveFontSize(32),
      color: CompanyConfig.AppColor.ContentFront,
      marginTop: getResponsiveValue(20),
    },
    Phone: {
      fontSize: getResponsiveFontSize(24),
      color: CompanyConfig.AppColor.ContentFront,
    },
    clickView: {
      width: getResponsiveValue(AppConfig.design.width / 2 - 80),
      height: getResponsiveValue(444),
      marginTop: getResponsiveValue(20),
      marginLeft: getResponsiveValue(20)

    },

  });
  return indexStyle;
}
