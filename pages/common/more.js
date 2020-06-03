
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Linking,
  ImageBackground, Alert,
  ScrollView, TouchableHighlight, TouchableOpacity, NativeModules
} from 'react-native';
import AlertModal, { showModal } from "../../components/AlertModal";
import { NavigationActions, NavigationState, NavigationRouter } from 'react-navigation';
import CompanyConfig, { CompanyConfigHelper } from '../../config/company.config.js';
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme';
import OperationMessage from '../../components/OperationMessage.js';
import CustomHeader, { HeaderMenu } from '../../components/CustomHeader.js';
import SvgUri from '../../components/svguri.js';
import { getVersion, getSystemName } from 'react-native-device-info';
import AppConfig, { clearStorage } from '../../config/app.config.js';
import SalesService from '../../services/sales.js';
import CustomerService from '../../services/myprofile';
import DataDownloadService from '../../services/datadownload.js';
import axios from "axios";

// import codePush from 'react-native-code-push';
const codePushVersion = '.0';
let moreStyles;

const resetActionToHome = NavigationActions.reset({
  index: 0,
  actions: [
    NavigationActions.navigate({ routeName: 'Home' })
  ]
});
export default class More extends Component {
  static navigationOptions = {
    title: '更多',
  };
  constructor(prop) {
    super(prop);
    this.state = {
      loginAuth: null,
      showModal: false,
      disableTouch: false
      // PermissionList: null
    }
    // this.navigateCustomerCenter = this.navigateCustomerCenter.bind(this);
    this.clearStorageComfirm = this.clearStorageComfirm.bind(this);
    this.clearStorage = this.clearStorage.bind(this);
    const Cancel = axios.CancelToken.source();
    this.cancelaxios = Cancel;
    this.ComponentWillUnmount = false;
    this.service = new CustomerService(Cancel);
    this.timer = null;
  }
  hintinfo = null;
  componentWillUnmount() {
    this.cancelaxios.cancel();
    this.ComponentWillUnmount = true;
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }
  }

  componentDidMount() {
    let service = new CustomerService();
    global.storage.load(
      {
        key: 'loginState',
        autoSync: false
      }).then(auth => {

        service.GetCompanyUser().then(result => {
          if (result.data.success) {
            if (!this.ComponentWillUnmount) {
              this.state.loginAuth.PermissionList = result.data.data.SysPermissionList;
              this.state.loginAuth.AllPermissionList = result.data.data.AllPermissionList;
              global.storage.save({
                key: 'loginState',
                data: this.state.loginAuth
              });
              global.storage.save({
                key: 'productSeries',
                data: result.data.data.DistributorProductMultipleList,
              });
              this.setState({
                loginAuth: this.state.loginAuth,
              })
            }
          }
        });
        this.setState({
          loginAuth: auth
        });
      }).catch(err => {

      });
  }

  clearStorageComfirm() {
    Alert.alert("提示", '确定要清除数据吗？', [
      {
        text: "取消",
        onPress: () => { }
      },
      {
        text: "清除数据",
        onPress: () => {
          this.clearStorage();
        }
      }
    ]
    );
  }

  clearStorage() {
    let self = this;
    clearStorage(true);
    let dlService = new DataDownloadService();
    let menuKey = dlService.getMenuReplicationDateKey();
    dlService.ClearData();
    global.storage.remove({ key: menuKey });
    self.refs["messageBar"].show("数据清除成功！", 1);
    CompanyConfigHelper.forceUpdate();
  }
  //是否显示弹框
  isShowModel(bl) {
    this.setState({
      showModal: bl
    })
  }
  _hintModal() {
    return (
      <View>
        <Modal
          animationType={'fade'}
          visible={this.state.showModal}
          transparent={true}
          supportedOrientations={['portrait', 'landscape']}
          onRequestClose={() => {
            this.setState({ showModal: false });
          }}
        >

          <View style={{ flex: 1, backgroundColor: '#000000b3' }}>
            <View style={{
              width: getResponsiveValue(500),
              height: getResponsiveValue(253),
              borderRadius: getResponsiveValue(20),
              backgroundColor: "#ffffff",
              shadowColor: "#0b11241a",
              marginTop: (getResponsiveValue(AppConfig.design.height) - getResponsiveValue(253)) / 2,
              alignSelf: 'center',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              //paddingTop: getResponsiveValue(30),
              elevation: 20,
              shadowOffset: {
                width: 0,
                height: getResponsiveValue(10)
              },
              shadowRadius: getResponsiveValue(80),
              shadowOpacity: 1
            }}>
              <Text style={{
                fontSize: getResponsiveFontSize(37),
                color: "#3a3a3a",
                marginTop: getResponsiveValue(20),

              }}>
                提示
            </Text>
              {this.hintinfo}
              <View style={{ flexDirection: 'row', }}>
                <TouchableOpacity
                  style={{
                    borderTopWidth: getResponsiveValue(1),
                    borderTopColor: "#dcdfe3",
                    width: getResponsiveValue(500),
                    height: getResponsiveValue(70),
                    justifyContent: 'center'
                  }}
                  onPress={
                    () => this.setState({
                      showModal: false
                    })
                  }
                  activeOpacity={0.8}
                >
                  <Text style={{
                    fontSize: getResponsiveValue(32),
                    color: "#3a3a3a",
                    textAlign: 'center'
                  }}>确定</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    )

  }
  //判断是否拥有权限
  IsHavePermissions(permissionKey) {
    if (this.state.loginAuth != null && this.state.loginAuth.PermissionList != null) {
      let IsMessage = false;
      let permissinsList = this.state.loginAuth.PermissionList;
      if (permissinsList && permissinsList.length > 0) {
        for (let i = 0; i < permissinsList.length; i++) {
          if (permissinsList[i].PermissionKey == permissionKey) {
            IsMessage = true;
          };
        };
      }
      // }
      return IsMessage;
    } else {
      return false;
    }

  }
  callPhone(cellphone) {
    Linking.canOpenURL('tel:' + cellphone).then(supported => {
      if (!supported) {
        this.refs["messageBar"].show("当前设备不支持打电话,请手动拨打电话!", 3);
      } else {
        Linking.openURL('tel:' + cellphone);
      }
    }).catch(e => {
      this.refs["messageBar"].show("当前设备不支持打电话,请手动拨打电话!", 3);
    })
  }
  //是否能进入此功能
  IsEnterInto(permissionKey, menuItem) {
    if (this.state.loginAuth == null) {
      return () => {
        this.hintinfo = <Text style={{ fontSize: getResponsiveValue(28), color: "#3a3a3a", paddingLeft: getResponsiveValue(30), paddingRight: getResponsiveValue(30) }}>请登录后查看！</Text>
        this.isShowModel(true);
      }
    };
    const { navigate } = this.props.navigation;
    if (this.IsHavePermissions(permissionKey)) {
      return () => navigate(menuItem.Code, { PlayUri: menuItem.PlayUri })
    } else {
      let bl = false;
      let allpermissinsList = this.state.loginAuth.AllPermissionList;
      for (let i = 0; i < allpermissinsList.length; i++) {
        if (allpermissinsList[i].PermissionKey == permissionKey) {
          bl = true;
        }
      };
      if (bl) {

        return () => {
          this.hintinfo = <Text style={{ fontSize: getResponsiveValue(28), color: "#3a3a3a", paddingLeft: getResponsiveValue(30), paddingRight: getResponsiveValue(30) }}>您没有查看权限，请您与门店负责人联系。</Text>
          this.isShowModel(true);
        }
      } else {
        return () => {

          // 未开放的功能
          this.hintinfo =
            <View style={{ flexDirection: 'column' }}>
              <Text style={{ fontSize: getResponsiveValue(28), color: "#3a3a3a", paddingLeft: getResponsiveValue(30) }}>您还未开通"{menuItem.Name}"功能，</Text>
              {this.state.loginAuth.APPCompanyCellphone == null ?
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ fontSize: getResponsiveValue(28), color: "#3a3a3a", paddingLeft: getResponsiveValue(30) }}>请您与厂商联系。</Text>
                </View>
                : <View style={{ flexDirection: 'row' }}>
                  <Text style={{ fontSize: getResponsiveValue(28), color: "#3a3a3a", paddingLeft: getResponsiveValue(30) }}>请您与厂商联系:</Text>
                  <TouchableOpacity onPress={() => this.callPhone(this.state.loginAuth.APPCompanyCellphone)}>
                    <Text style={{ fontSize: getResponsiveValue(28), color: "#18a9ed", paddingRight: getResponsiveValue(30) }}>{this.state.loginAuth.APPCompanyCellphone}</Text>
                  </TouchableOpacity>
                </View>}
            </View>
          this.isShowModel(true);
        }
      }
    }


  }

  _bluetoothPrint() {
    let saleService = new SalesService();
    saleService.GetBluetoothPrintData(10000204).then(data => {
      if (data.data.success) {
        NativeModules.BluetoothPrinter.print(data.data.data);// this.IsEnterInto("App_FundManager", menuItem);
      }
    });
  }
  renderMenuList() {
    const { navigate } = this.props.navigation;
    let thisObj = this;
    let allMenuList = [];
    // allMenuList.push({ Name: "个人中心", Icon: "user", Code: "CustomerIndex" });
    allMenuList.push({ Name: "零售价管理", Icon: "modifyPrice", Code: "ModifyPrice" });
    allMenuList.push({ Name: "数据更新", Icon: "update", Code: "DataDownload" });
    allMenuList.push({ Name: "清除缓存", Icon: "purge", Code: "ClearStorage" });
    let menuRowList = [];
    let row = null;
    //// 1行最多只能有个四个菜单数据
    for (let i = 0; i < allMenuList.length; i++) {
      if (i % 4 == 0) {
        row = {
          key: "key" + (i / 4),
          menuList: []
        }
        menuRowList.push(row);
      }
      row.menuList.push(allMenuList[i])
    }

    let sizeWidth = getResponsiveValue(65);
    return (
      <ScrollView style={moreStyles.menu} horizontal={false} >
        {
          menuRowList.map((row, rowIndex) => {
            return (<View style={moreStyles.menuRow} horizontal={true} key={"row" + rowIndex} >
              {
                row.menuList.map((menuItem, index, list) => {
                  let onPress = () => navigate(menuItem.Code, { PlayUri: menuItem.PlayUri });
                  if (menuItem.Code == "ClearStorage") {
                    onPress = thisObj.clearStorageComfirm;
                  }


                  if (menuItem.Code == "ModifyPrice") {
                    this.IsHavePermissions("APP_EditProductManager") ?
                      onPress = this.IsEnterInto("APP_EditProductManager", menuItem)
                      : onPress = this.IsEnterInto("APP_PurchasePrice", menuItem);
                  }
                  return (<TouchableHighlight
                    disabled={thisObj.state.disableTouch}
                    key={menuItem.Name} style={moreStyles.menuItem} activeOpacity={0.8} underlayColor={CompanyConfig.AppColor.OnPressSecondary}
                    onPress={() => {
                      thisObj.setState({ disableTouch: true });
                      onPress();
                      thisObj.timer = setTimeout(() => {
                        thisObj.setState({ disableTouch: false });
                      }, 1000);
                    }
                    } >
                    <View style={moreStyles.menuItemContainer} horizontal={true} >
                      <View style={moreStyles.menuItemImgContainer}><SvgUri width={sizeWidth} height={sizeWidth} fill={CompanyConfig.AppColor.ContentFront} source={menuItem.Icon} /></View>
                      <Text style={moreStyles.menuItemText}>{menuItem.Name}</Text>
                    </View>
                  </TouchableHighlight>);
                })
              }
            </View>);
          })
        }
      </ScrollView>
    );
  }

  render() {
    setStyle();
    let version = getVersion();
    return (<ImageBackground style={moreStyles.bgimg} source={CompanyConfig.CompanyBGImg} >
      <OperationMessage ref="messageBar" />
      <AlertModal ref={(al) => this.AlertModal = al} />
      <CustomHeader navigation={this.props.navigation} leftButtonOnPress={() => {
        if (typeof (this.props.navigation.state.params) != "undefined" && typeof (this.props.navigation.state.params.refresh == "function")) {
          this.props.navigation.state.params.refresh();
        }
        this.props.navigation.goBack()
      }} />

      {this._hintModal()}
      <View style={{
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'center',
        width: getResponsiveValue(AppConfig.design.width),
        height: getResponsiveValue(AppConfig.design.height),
        paddingTop: getResponsiveValue(100),
        paddingBottom: getResponsiveValue(90)
      }}>
        {this.renderMenuList()}
      </View>
      <Text style={{ color: CompanyConfig.AppColor.ContentFront, backgroundColor: '#ffffff00', fontSize: 12, marginLeft: getResponsiveValue(980), bottom: getResponsiveValue(40) }}>版本号：{version + codePushVersion}</Text>
    </ImageBackground >
    );
  }
}
function setStyle() {
  if (moreStyles != null && !CompanyConfig.isGeneral()) return moreStyles;
  moreStyles = StyleSheet.create({
    bgimg: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menu: {
      flex: 1,
      flexDirection: "column"
    },
    menuRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: 'center',
      justifyContent: 'center',
      width: getResponsiveValue(AppConfig.design.width),
      marginBottom: getResponsiveValue(10)
    },
    menuItem: {
      flexDirection: "column",
      width: getResponsiveValue(270),
      height: getResponsiveValue(270),
      marginLeft: getResponsiveValue(5),
      marginRight: getResponsiveValue(5),
      backgroundColor: CompanyConfig.AppColor.OnPressSecondary
    },
    menuItemContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-start"
    },
    menuItemImgContainer: {
      marginTop: getResponsiveValue(40),
      width: getResponsiveValue(120),
      height: getResponsiveValue(120),
      // borderRadius: getResponsiveValue(60),
      alignItems: "center",
      justifyContent: "center"
    },
    menuItemText: {
      color: CompanyConfig.AppColor.ContentFront,
      textAlign: "center",
      textAlignVertical: "center",
      // marginTop: getResponsiveValue(15),
      fontSize: getResponsiveFontSize(32)
    }
  });
  return moreStyles;
}
