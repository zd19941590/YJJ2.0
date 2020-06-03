import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  ToastAndroid,
  DeviceEventEmitter,
  ScrollView, TouchableHighlight, Alert, Linking, Platform, NativeAppEventEmitter
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import CommonService, { formatMenu } from '../../services/common.js';
import DataDownloadService from '../../services/datadownload.js';
import OperationMessage from '../../components/OperationMessage.js';
import AppConfig, { clearStorage } from '../../config/app.config.js';
import CompanyConfig, { CompanyConfigHelper } from '../../config/company.config.js';
import PropTypes from "prop-types";
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme';
import SQLiteBase from '../../services/sqlite.js';
import VersionUpdate from '../../services/versionupdate.js';
import FileHelper from '../../helpers/fileHelper.config.js';
import { getVersion } from 'react-native-device-info';
// import BaiduPush from 'react-native-baidu-push';
import SvgUri from '../../components/svguri.js';
import { CompanyAppConfig } from '../../config/company.app';
import HomeA from './homeA.js';
// import codePush from 'react-native-code-push';
import authService from '../../services/loginregisterService';
import DeviceInfo from 'react-native-device-info';
import Constaints from "../../config/Constaints";
import RNFS from "react-native-fs";
import RNFetchBlob from 'react-native-fetch-blob';
import Spinner2 from '../../components/Spinner2';

const isGeneral = CompanyConfig.isGeneral();
// const { InstallMode, SyncStatus } = codePush;


console.disableYellowBox = true;

let homeStyles = null;
function setStyle(config) {
  if (config == undefined || config == null) {
    if (homeStyles != null) return homeStyles;
    config = CompanyConfig;
  }
  let menuTop = AppConfig.design.height * 0.50 + 30;

  homeStyles = StyleSheet.create({
    splashImg: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      resizeMode: Image.resizeMode.contain,
      backgroundColor: config.AppColor.PageBackground
    },
    bgimg: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    },
    home: {
      width: getResponsiveValue(1334),
      height: getResponsiveValue(AppConfig.design.height),
      alignItems: 'center',
      justifyContent: 'center',
    },
    menu: {
      flex: 1,
      flexDirection: "row",
      position: "absolute",
      marginLeft: getResponsiveValue(90),
      marginRight: getResponsiveValue(90),
      top: getResponsiveValue(menuTop)
    },
    menuItem: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: getResponsiveValue(190),
      height: getResponsiveValue(190),
      borderRadius: getResponsiveValue(30)
    },
    menuItemContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      // backgroundColor: "green"
    },
    menuItemImgContainer: {
      alignItems: "center",
      justifyContent: "flex-start",
      width: getResponsiveValue(80),
      height: getResponsiveValue(80),
      borderRadius: getResponsiveValue(30),
      marginTop: getResponsiveValue(10)
    },
    menuItemImg: {
      width: getResponsiveValue(80),
      height: getResponsiveValue(80),
      resizeMode: Image.resizeMode.contain
    },
    menuItemImgContainerV1: {
      alignItems: "center",
      justifyContent: "flex-start",
      width: getResponsiveValue(100),
      height: getResponsiveValue(190),
      borderRadius: getResponsiveValue(30),
      marginTop: getResponsiveValue(10),
      // backgroundColor:"#FF0",
    },
    menuItemImgV1: {
      width: getResponsiveValue(100),
      height: getResponsiveValue(190),
      resizeMode: Image.resizeMode.contain,
    },
    menuItemTextContainer: {
      flex: 1,
      flexDirection: "column",
      marginTop: getResponsiveValue(20)
    },
    menuItemText: {
      color: config.AppColor.MainFront,
      textAlign: "center",
      textAlignVertical: "center",
      fontSize: getResponsiveFontSize(30)
    },
    menuItemTextEn: {
      color: config.AppColor.MainFront,
      textAlign: "center",
      textAlignVertical: "center",
      fontSize: getResponsiveFontSize(18)
    },
    topbar: {
      position: "absolute",
      right: getResponsiveValue(48),
      top: getResponsiveValue(15),
      height: getResponsiveValue(80),
      width: getResponsiveValue(200),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    topbarItem: {
      width: getResponsiveValue(80),
      height: getResponsiveValue(80),
      borderRadius: getResponsiveValue(40),
      alignItems: "center",
      justifyContent: "center",
    },
    more: {
      marginLeft: getResponsiveValue(8),
    },
    topbarItemImg: {
      width: getResponsiveValue(42),
      height: getResponsiveValue(42)
    },
    notice: {
      position: 'absolute',
      right: getResponsiveValue(0),
      top: 0,
      width: getResponsiveValue(30),
      height: getResponsiveValue(25),
      backgroundColor: 'red',
      borderRadius: getResponsiveValue(12),
      alignItems: 'center',
      justifyContent: 'center'
    }
  });
  return homeStyles;
}
let IsNedLogin = false;
const resetActionToHome = NavigationActions.reset({
  index: 0,
  actions: [
    NavigationActions.navigate({ routeName: 'Home' })
  ]
});
const resetActionToLogin = NavigationActions.reset({
  index: 0,
  actions: [
    NavigationActions.navigate({ routeName: 'Login' })
  ]
});

export default class SplashScreen extends Component {
  timer = null;
  // 当前屏render完成的时间
  didmountTime = null;
  // 当前欢迎屏显示的时间;
  waitMinseconds = 3000; //5000;update to 3000
  constructor(props) {
    super(props);
    setStyle();
    this.dbService = new SQLiteBase();
    this.autoNavigateHomePage = this.autoNavigateHomePage.bind(this);
    this.iniData = this.iniData.bind(this);
  }
  autoNavigateHomePage() {
    let self = this;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    let thisTime = new Date();
    let minSeconds = 0; // 当前屏已经等待的时间
    if (this.didmountTime != null) {
      minSeconds = thisTime.getTime() - this.didmountTime.getTime();
    }
    if (!minSeconds || minSeconds < 0) minSeconds = 0;
    minSeconds = this.waitMinseconds - minSeconds;
    if (minSeconds < 1000) {
      minSeconds = 1000;
    }
    global.NeedLogin = true;//默认需要登录
    self.timer = setTimeout(() => {
      try {
        global.storage.load(
          {
            key: 'loginState',
            autoSync: false
          }).then(auth => {
            if (auth != null) {
              global.NeedLogin = false;//不需要登录
              self.props.navigation.dispatch(resetActionToHome);
            }
            else {
              if (CompanyAppConfig.isGeneral()) {
                clearStorage();
                self.props.navigation.dispatch(resetActionToLogin);
              } else {
                self.props.navigation.dispatch(resetActionToHome);
              }
            };

          }).catch(err => {
            if (CompanyAppConfig.isGeneral()) {
              clearStorage();
              self.props.navigation.dispatch(resetActionToLogin);
            } else {
              self.props.navigation.dispatch(resetActionToHome);
            };
          });
      }
      catch (e) {
        if (CompanyAppConfig.isGeneral()) {
          clearStorage();
          self.props.navigation.dispatch(resetActionToLogin);
        } else {
          self.props.navigation.dispatch(resetActionToHome);
        };
      }
    }, minSeconds);
  }
  dbService;

  iniData() {
    let self = this;
    const { navigate } = this.props.navigation;

    //  如果用户设置的是“稍后提示”，则启动时设置用户数据更新提示为未提示，启动后将提示。
    global.storage.load({ key: "DataDownloadAlert" }).then(t => {
      if (t == 1) {
        global.storage.save({ key: "DataDownloadAlert", data: 0 });
      }
    });
    global.storage.save({ key: "AppUpdateAlert", data: 1 });
    if (global.AppAuthentication != null && global.AppAuthentication.AppCompanyID != null) {
      //  取得最新的信息缓存到本地
      let devicesinfo = {
        DeviceUniqueID: DeviceInfo.getUniqueID(),
        DeviceModel: DeviceInfo.getModel(),
        DeviceManufacturer: DeviceInfo.getManufacturer(),
        DeviceSystemName: DeviceInfo.getSystemName(),
        DeviceIsTable: DeviceInfo.isTablet() === null ? "" : DeviceInfo.isTablet().toString()
      };
      //  console.log("用户认证!")
      authService.netAuthentication(devicesinfo).then(res => {
        let result = res.data;
        if (result !== null && result.code && result.code === "0") {
          IsNedLogin = true
          Alert.alert("提示", "登录信息已过期,请重新登录!",
            [{
              text: '确定', onPress: () => {
                global.storage.remove({ key: 'loginState' });
                global.NeedLogin = true;
                global.AppAuthentication = null;
                global.storage.remove({ key: "AppMenu" });

                DeviceEventEmitter.emit("needlogin", true);

                if (CompanyAppConfig.isGeneral()) {
                  clearStorage();
                  CompanyConfigHelper.forceUpdate(() => {
                    this.props.navigation.dispatch(resetActionToLogin);
                  }, error => {
                    this.props.navigation.dispatch(resetActionToLogin);
                  })
                } else {
                  this.props.navigation.dispatch(resetActionToHome);
                }
              }
            }], { cancelable: false });
        } else if (result !== null && result.success && result.code && result.code === "1") {
          global.storage.save({
            key: 'loginState',
            data: result.data
          });
          global.NeedLogin = false;
          let menuList = result.data.MenuList;
          formatMenu(menuList);
          global.storage.save({ key: "AppMenu", data: menuList });
          if (result.data.CompanyConfigList.length > 0) {
            global.storage.save({ key: "CompanyParameters", data: result.data.CompanyConfigList });
            if (isGeneral) {
              CompanyConfigHelper.ready((companyConfig) => {
                setStyle(companyConfig);
              }, error => {
              });
            } else {
              CompanyConfigHelper.ready(
                (companyConfig) => {
                  setStyle(companyConfig);
                }, error => {
                });
            }
          }

        }
      }).catch(err => { });
    } else {
      global.NeedLogin = true;
    }

    //下载经销商系列权限数据
    var dataDownloadService = new DataDownloadService();
    dataDownloadService.DeleteNoPermissionProductData();
  }
  UNSAFE_componentWillMount() {
    let dbService = this.dbService;
    dbService.createDB(() => { });

    let VUService = new VersionUpdate();
    VUService.AddProductColumn();
    VUService.AddAppContentColumn();
  }
  componentDidMount() {
    // --创建数据库表，数据库在原生代码中创建
    let self = this;
    this.didmountTime = new Date();
    self.autoNavigateHomePage();
    CompanyConfigHelper.ready(function (companyConfig) {
      setStyle(companyConfig);
      self.iniData();
    }, error => {
      self.iniData();
    });
    if (!global.AppAuthentication) {
      this.getCompanyInfo();
    }

  }
  //获取厂家名称
  getCompanyInfo() {
    if (isGeneral) {
      global.APPCompanyName = '通用版'
    } else {
      let commonService = new CommonService();
      commonService.getAppCompanyName().then(response => {
        let name = response.data;
        if (name != null && (typeof name === "string")) {
          global.APPCompanyName = name
        }
      });
    }
  }
  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
  render() {
    setStyle();
    if (Platform.OS === "ios") {
      return (
        <ImageBackground style={homeStyles.bgimg} source={require("../../assets/images/Default-Landscape.png")} />
      );
    } else {
      return (
        <ImageBackground style={homeStyles.bgimg} source={require("../../assets/images/yjj.png")} />
      );
    }
  }
}

export class HomeMenuItem extends Component {
  static propTypes = {
    menu: PropTypes.any
  };
  _root;
  constructor(props) {
    super(props);
    this.state = {
      selected: false
    };
  }
  pressIn() {
    this.setState({
      selected: true
    });
  }
  pressOut() {
    this.setState({
      selected: false
    });
  }
  componentDidMount() {
    let self = this;

    let menu = this.props.menu
    let alist = [];
    if (menu.DefaultImage != null && menu.DefaultImage != "") {
      if (typeof (menu.DefaultImageUri) == "undefined" || menu.DefaultImageUri == null) {
        alist.push(FileHelper.fetchFile(menu.DefaultImage));
      }
    }

    if (alist.length > 0) {
      Promise.all(alist).then(function (r) {
        let i = 0;
        if (menu.DefaultImage != null && menu.DefaultImage != "") {
          menu.DefaultImageUri = r[i];
          menu.MouseOverImageUri = menu.DefaultImageUri;
          i = i + 1;
        }
        self.forceUpdate();
      });
    }
  }

  render() {
    setStyle();
    let menu = this.props.menu;
    let iconURL;


    /// FIXED: Use local file if exists. Or use remote path.

    if (menu.DefaultImageUri) {
      iconURL = menu.DefaultImageUri;
    } else {
      if (menu.DefaultImage) {
        iconURL = FileHelper._getFileUrl(menu.DefaultImage);
      }
    }

    let isV1 = (CompanyConfig.Compatibility && CompanyConfig.Compatibility == 1);
    let s_imgContainer = homeStyles.menuItemImgContainer;
    let s_menuItemImg = homeStyles.menuItemImg;
    if (isV1) {
      s_imgContainer = homeStyles.menuItemImgContainerV1;
      s_menuItemImg = homeStyles.menuItemImgV1;
    }
    let isNewVersion = !isV1;

    return (<View style={homeStyles.menuItemContainer} horizontal={true} >
      <View style={s_imgContainer}>
        <Image source={{ uri: iconURL }} style={s_menuItemImg} key={menu.SysNo} >
        </Image>
        </View>
      {isNewVersion ? (<View style={homeStyles.menuItemTextContainer}>
        {/* 导航条的名称 */}
      <Text style={homeStyles.menuItemText}>{menu.MenuName}{}</Text>
        <Text style={homeStyles.menuItemTextEn}>{menu.Memo}</Text>
      </View>) : null}
    </View>);
  }
}

export class HomeC extends Component {
  static propTypes = {
    MenuList: PropTypes.array,
    navigation: PropTypes.any,
    hasNotice: PropTypes.number
  };

  dbService = null;
  constructor(prop) {
    super(prop);
    this.state = {
      MenuList: [],
      ShowShoppingCart: false,
      isGuest: true
    };
  }

  refreshShoppingCar() {

    let service = new CommonService();
    service.fetchAuthorityForKey('APP_SOManager', (valid) => {
      this.setState({
        ShowShoppingCart: valid
      })
    });
  }

  componentDidMount() {

    let self = this;

    global.storage.load({
      key: 'loginState',
      autoSync: false
    }).then(auth => {
      if (auth) {
        this.state.isGuest = auth.IsGuest
      }
    }).catch(() => { });

    let service = new CommonService();
    service.fetchAuthorityForKey('APP_SOManager', (valid) => {
      this.setState({
        ShowShoppingCart: valid
      })
    });

    CompanyConfigHelper.ready(function (companyConfig) {
      setStyle(companyConfig);
      self.forceUpdate();
    }, () => { });

  }

  renderMenuList(menuList) {
    const { navigate } = this.props.navigation;
    if (!menuList || !menuList.length) {
      return null;
    }

    return (
      <ScrollView style={homeStyles.menu} horizontal={true} showsHorizontalScrollIndicator={false} >
        {
          menuList.map((menuItem, index, list) => {
            return (
            <TouchableHighlight key={menuItem.SysNo} style={homeStyles.menuItem} activeOpacity={0.8} underlayColor={CompanyConfig.StyleColor.HomePageA.MenuItemPressBackground}
              onPress={() => {
                // 循环menuList路由跳转到指定项
                // console.error(menuItem.LinkCode,menuItem,"我要看的内容")
                console.log(menuItem);
                navigate(menuItem.LinkCode, { menu: menuItem });
              }}
              onShowUnderlay={() => {
                this.refs["imgBtn" + index].pressIn();
              }}
              onHideUnderlay={() => { this.refs["imgBtn" + index].pressOut(); }}
            >
              <HomeMenuItem menu={menuItem} ref={"imgBtn" + index} key={menuItem.SysNo} ></HomeMenuItem>
            </TouchableHighlight>);
          })
        }
      </ScrollView>
    );
  }
  render() {
    const { navigate } = this.props.navigation;
    let menuList = this.props.MenuList;
    let sizeWidth = getResponsiveValue(42);

    return (
      <View style={homeStyles.home}  >
        <View style={[homeStyles.topbar]}>
          <TouchableHighlight style={[homeStyles.topbarItem, homeStyles.more]}
            onPress={() => navigate("DataDownload")}
            activeOpacity={0.8}
            underlayColor={CompanyConfig.StyleColor.HomePageA.MenuItemPressBackground}
          >
            <SvgUri width={sizeWidth + 5} height={sizeWidth + 5} fill={CompanyConfig.AppColor.Main} source="updatedata" />
          </TouchableHighlight>
          <TouchableHighlight style={[homeStyles.topbarItem]} onPress={() => navigate("MessageCenter")} activeOpacity={0.8} underlayColor={CompanyConfig.StyleColor.HomePageA.MenuItemPressBackground} >
            <View style={{ height: getResponsiveValue(50), width: getResponsiveValue(50), alignItems: 'center', justifyContent: 'center' }}><SvgUri width={sizeWidth} height={sizeWidth} fill={CompanyConfig.AppColor.Main} source="message" />
              {this.props.hasNotice > 0 ?
                <View style={homeStyles.notice}>
                  <Text style={{ fontSize: getResponsiveFontSize(20), borderRadius: getResponsiveValue(12), backgroundColor: 'transparent' }}>{this.props.hasNotice}
                  </Text>
                </View> : <View />}
            </View>
          </TouchableHighlight>
      

          <TouchableHighlight style={homeStyles.topbarItem} onPress={() => {
            storage.load(
              {
                key: 'loginState',
                autoSync: false
              }).then(auth => {
                if (auth != null) {
                  navigate("CustomerIndex");
                }
                else {
                  navigate("Login");
                }
              }).catch((error) => {
                navigate("Login");
              });
          }} activeOpacity={0.8} underlayColor={CompanyConfig.StyleColor.HomePageA.MenuItemPressBackground} >
            <View >
              <SvgUri width={sizeWidth} height={sizeWidth} fill={CompanyConfig.AppColor.Main} source="user" />
              {typeof global.NeedLogin === 'undefined' || global.NeedLogin ? (
                <View style={{
                  position: 'absolute', right: 0, backgroundColor: 'red', top: 0, width: getResponsiveValue(20), height: getResponsiveValue(20), borderRadius: getResponsiveValue(10), alignItems: 'center', justifyContent: 'center'
                }} >
                  <SvgUri width={getResponsiveValue(10)} height={getResponsiveValue(10)} fill={"#FFF"} source="needlogin" />
                </View>
              ) : null}
            </View>
          </TouchableHighlight>

          {this.state.isGuest ? null : <TouchableHighlight style={[homeStyles.topbarItem]} onPress={() => navigate("ProductList", { ShowSearch: true })} activeOpacity={0.8} underlayColor={CompanyConfig.StyleColor.HomePageA.MenuItemPressBackground} >
            <View ><SvgUri width={sizeWidth} height={sizeWidth} fill={CompanyConfig.AppColor.Main} source="search" /></View>
          </TouchableHighlight>}
          <TouchableHighlight style={[homeStyles.topbarItem, homeStyles.more]} onPress={() => navigate("More", { refresh: () => this.refreshShoppingCar() })} activeOpacity={0.8} underlayColor={CompanyConfig.StyleColor.HomePageA.MenuItemPressBackground} >
            <View ><SvgUri width={sizeWidth} height={sizeWidth} fill={CompanyConfig.AppColor.Main} source="homemore" /></View>
          </TouchableHighlight>
        </View>

        {this.renderMenuList(menuList)}
      </View>
    );
  }
}

const storage = global.storage;

export class DefaultHome extends Component {

  dbService = null;
  constructor(prop) {
    super(prop);
    this.state = {
      MenuList: [],
      hasNoticeNum: 0,
      neededLogin: false,
    };
    this.TipLigin = true;
  }

  componentWillUnmount() {
    this.devicelistener.remove();
  }

  appIsUpdate() {
    let appPlatformNo = -1;
    if (Platform.OS === 'android') {
      appPlatformNo = 0
    }
    else if (Platform.OS === 'ios') {
      appPlatformNo = 1
    }

    let commonService = new CommonService();
    let updateurl = AppConfig.appUpdateUrl;
    commonService.update(getVersion(), appPlatformNo, isGeneral).then(result => {
      let rresult = result.data;
      if (rresult.success) {
        Alert.alert("新版本更新", "你有新的版本需要更新!是否马上更新!",
          [{
            text: '下次启动时提示!', onPress: () => {
              this.getDataUpdateInfo();
              global.storage.save({ key: "AppUpdateAlert", data: 0 });
            }
          },
          {
            text: '立即更新！', onPress: () => {
              Linking.openURL(updateurl + rresult.data.CompanySysNo).catch(err => {
                ToastAndroid.show("打开链接失败！下次启动时更新！", ToastAndroid.SHORT);
                global.storage.save({ key: "AppUpdateAlert", data: 0 });
                this.getDataUpdateInfo();
              })
            }
          }], { cancelable: false });
      } else {
        setTimeout(() => {
          if (!IsNedLogin) {
            this.getDataUpdateInfo();
          }
        }, 1000)
      }
    }).catch(() => {
      global.storage.save({ key: "AppUpdateAlert", data: 0 });
      if (!IsNedLogin) {
        setTimeout(() => {
          if (!IsNedLogin) {
            this.getDataUpdateInfo();
          }
        }, 1000)
      }
    });
  }

  checkForUpdate() {
    // codePush.sync({
    //   updateDialog: {
    //     appendReleaseDescription: true, /* 是否显示更新详情*/
    //     descriptionPrefix: '\n', /* 更新说明的前缀 */
    //     mandatoryContinueButtonLabel: '立即更新', /* 强制更新的按钮文字 */
    //     mandatoryUpdateMessage: '有新版本可用，您需要更新才能继续使用！', /* 强制更新时，更新通知 */
    //     optionalIgnoreButtonLabel: '忽略', /* 非强制更新时，取消按钮文字 */
    //     optionalInstallButtonLabel: '更新', /* 非强制更新时，确认文字 */
    //     optionalUpdateMessage: '有新版本可以使用，本次更新内容如下：', /* 非强制更新时，更新通知 */
    //     title: '版本更新' /* 要显示的更新通知的标题 */
    //   },
    //   installMode: InstallMode.IMMEDIATE,
    //   mandatoryInstallMode: InstallMode.IMMEDIATE
    // }, (state) => {
    //   switch (state) {
    //     case SyncStatus.DOWNLOADING_PACKAGE:
    //       this.refs["messageBar"].show("应用正在后台更新，更新完成之后将自动重启", 1);
    //       break;
    //     default:
    //       break;
    //   }
    // }, () => { });
  }

  getDataUpdateInfo() {
    let dbService = new DataDownloadService();
    const { navigate } = this.props.navigation;
    //如果还没有提示就提示，否则就不提示
    global.storage.load({ key: "DataDownloadAlert" }).then(d => {
      if (d == 1 || d == 2) return;
      dbService.GetDataDownloadInfo(result => {
        let dataCount = 0;
        let dlInfo = result.data;
        for (let i = 0; i < dlInfo.length; i++) {
          let tdl = dlInfo[i];
          dataCount += tdl.DataCount;
        }
        if (dataCount > 0 && !this.state.neededLogin) {
          Alert.alert('数据更新提示', '你有新的商品数据需要同步，是否马上同步？', [
            {
              text: '稍后提示',
              onPress: () => {
                global.storage.save({ key: "DataDownloadAlert", data: 1 });
              }
            },
            // {
            //   text: '不再提示',
            //   onPress: () => {
            //     global.storage.save({ key: "DataDownloadAlert", data: 2 });
            //   }
            // },
            {
              text: '马上更新',
              onPress: () => {
                global.storage.save({ key: "DataDownloadAlert", data: 1 });
                setTimeout(function () { navigate("DataDownload"); }, 500);
              }
            }
          ], { cancelable: false });
        } else {
          this.checkIfNeedUpdateFiles();
        }
      });
    });
  }

  componentDidMount() {
    let self = this;
    this.dbService = new DataDownloadService();
    let commonService = new CommonService();
    let dbService = this.dbService;
    if (!__DEV__ && CompanyAppConfig.env === "production") {
      this.checkForUpdate(); //应用进入主界面之后，获取更新状态.
    }
    // BaiduPush.fetchLastClickedNotification((data) => {
    //   if (data) {
    //     const { navigate } = this.props.navigation;
    //     navigate("MessageCenter");
    //   }
    // });
    // if (Platform.OS === "ios") {
    //   NativeAppEventEmitter.addListener(
    //     'OnReceivedRemoteNotification',
    //     (data) => {
    //       if (data && data.applicationState != 0) {
    //         const { navigate } = this.props.navigation;
    //         navigate("MessageCenter");
    //       }
    //     })
    // }

    CompanyConfigHelper.ready(function (companyConfig) {
      setStyle(companyConfig);
      self.forceUpdate();
    }, error => {
      self.forceUpdate();
    });
    //初始化下载数据记录表
    dbService.initDataReplicationInfo();
    const { navigate } = this.props.navigation;
    //更新
    global.storage.load({ key: "AppUpdateAlert" }).then(rs => {
      if (rs == 0) return;
      self.appIsUpdate();
    }).catch(() => {
      self.appIsUpdate();
    });
    let IsNeedMenuSave = true;
    this.devicelistener = DeviceEventEmitter.addListener("needlogin", (re) => {
      if (re) {
        let service = new CommonService();
        service.GetMenuList().then(requestObj => {
          var menuList = requestObj.data;

          if (typeof (menuList.success) != undefined && menuList.success == false) {
          } else {

            if (IsNeedMenuSave) {
              formatMenu(menuList);
              storage.save({ key: "AppMenu", data: menuList });
              self.setState({
                MenuList: menuList
              });
              IsNeedMenuSave = false;
            }
          }
        }).catch(() => { });
      }
    });
    if (global.NeedLogin) {
      let service = new CommonService();
      service.GetMenuList().then(requestObj => {
        var menuList = requestObj.data;
        if (typeof (menuList.success) != undefined && menuList.success == false) {
        } else {
          formatMenu(menuList);
          if (IsNeedMenuSave) {
            storage.save({ key: "AppMenu", data: menuList });
            self.setState({
              MenuList: menuList
            });
            this.checkNeedLoginShowMenu(menuList);
            IsNeedMenuSave = false;
          }
        }
      }).catch(() => {
      });
    }
    // 从缓存中拉取菜单的图标
    global.storage.load({key: 'AppMenu'}).then(menuList => {
      if (menuList == null) {
        menuList = [];
      }
      // 需要登陆才查看的情况下，需要每次都拉取
      if (global.NeedLogin) {
        let request = new CommonService();
        request.GetMenuList().then( response => {
          self.setState({
            MenuList: response.data
          });
        });
        // 如果登陆后就不需要
      } else {
        self.setState({
          MenuList: menuList
        });
      }
    })
    // 菜单在线拉取，每次进入首页拉一次
    // global.storage.load({ key: "AppMenu" }).then(menuList => {
    //   if (menuList == null) menuList = [];
      // if (!global.NeedLogin) {
      //   let request = new CommonService();
      //   request.GetMenuList().then( response => {
      //     self.setState({
      //       MenuList: response.data
      //     });
      //   });
      // } else {
      //   self.setState({
      //     MenuList: menuList
      //   });
      // }
    // }).catch(error => {
    //   self.refs["messageBar"].show(error.message, 2);
    // });

    commonService.GetUnViewdMessageCount().then((res) => {
      let noticenum = 0;
      if (typeof res.data.data === 'number') {
        noticenum = res.data.data;
      }
      this.setState({
        hasNoticeNum: noticenum
      });
    }).catch(_ => {

    });

    if (Platform.OS === 'ios') {
      this.checkIfShouldSwitchiOSDocumentDir();
    } else {
      this.validImageComletenessIfNeeded();
    }
    global.storage.load(
      {
        key: 'loginState',
        autoSync: false
      }).then(auth => {
        if (auth.IsGuest) {
          let dbService = new DataDownloadService();
          dbService.GustDateOpion();
        }
      }).catch(err => {

      });

  }

  checkIfShouldSwitchiOSDocumentDir() {
    let key = Constaints.STORAGE_CHECK_CACHE_DESTINATION_KEY;
    global.storage.load({ key: key }).then(ck => {
      if (!ck) {
        this.switchiOSDocumentDir();
      } else {
        this.validImageComletenessIfNeeded();
      }
    }).catch(() => {
      this.switchiOSDocumentDir();
    });
  }

  switchiOSDocumentDir() {
    let key = Constaints.STORAGE_CHECK_CACHE_DESTINATION_KEY;
    let before = `${RNFetchBlob.fs.dirs.CacheDir}/.yjj`;
    let after = `${RNFetchBlob.fs.dirs.DocumentDir}/yjj`;

    this._spinner.showLoading();
    RNFS.readDir(before).then(result => {
      result.forEach((obj, idx) => {
        let from = obj.path;
        let to = `${after}/${obj.name}`;

        RNFS.moveFile(from, to).then(() => {
          if (result.length == (idx + 1)) {
            this._spinner.hideLoading();
            global.storage.save({ key: key, data: true });
            this.validImageComletenessIfNeeded();
          }
        }).catch(() => {
          if (result.length == (idx + 1)) {
            this._spinner.hideLoading();
            global.storage.save({ key: key, data: true });
            this.validImageComletenessIfNeeded();
          }
        });
      });
    }).catch(() => {
      this._spinner.hideLoading();
      global.storage.save({ key: key, data: true });
      this.validImageComletenessIfNeeded();
    });
  }

  switchiOSCacheDocuments() {

  }

  login() {
    this.props.navigation.dispatch(resetActionToLogin);
  }

  checkNeedLoginShowMenu(menuList) {
    if (menuList && menuList.length <= 0 && this.TipLigin && global.NeedLogin) {
      this.TipLigin = false;
      // self.refs["messageBar"].show("请登录后查看菜单", 2);
      this.state.neededLogin = true;
      Alert.alert('提示', '请登录后查看菜单', [
        { text: '取消' },
        { text: '立即登录', onPress: () => this.login() }
      ])
    }
  }
  validImageComletenessIfNeeded() {
    let key = Constaints.STORAGE_CHECK_FILE_COMPLETENESS_ID_KEY();
    global.storage.load({ key: key })
      .then(ck => {
        if (!ck) {
          this.imageCompletenessValid();
        }
      })
      .catch(() => {
        this.imageCompletenessValid();
      });
  }

  imageCompletenessValid() {
    let key = Constaints.STORAGE_CHECK_FILE_COMPLETENESS_ID_KEY();
    FileHelper.fetchStorageImagesWithMd5Parameter((elms, error) => {
      if (!error) {
        if (!elms.length) {
          return;
        }

        let cacheKey = Constaints.STORAGE_FILE_DOWNLOAD_LIST_ID_KEY();

        FileHelper.judgeInvalidImages(elms, (valid, results) => {
          if (!valid) {
            FileHelper.fetchAndStoreImages(results, (done, sucess, faliure) => {
              if (!done) {
                global.storage.save({ key: cacheKey, data: faliure });
              } else {
                global.storage.save({ key: key, data: true });
              }
            });
          }
        });
      } else {
      }
    });
  }

  checkIfNeedUpdateFiles() {
    let cacheKey = Constaints.STORAGE_FILE_DOWNLOAD_LIST_ID_KEY();
    const { navigate } = this.props.navigation;
    global.storage.load({ key: cacheKey }).then(array => {
      if (array == null) array = [];
      if (array.length) {
        Alert.alert("数据更新提示", "你有新的商品数据需要同步，是否马上同步？",
          [
            {
              text: '稍后提示', onPress: () => {
                global.storage.save({ key: "DataDownloadAlert", data: 1 });
              }
            },
            // {
            //   text: '不再提示', onPress: () => {
            //     global.storage.save({ key: "DataDownloadAlert", data: 2 });
            //   }
            // },
            {
              text: '马上更新', onPress: () => {
                global.storage.save({ key: "DataDownloadAlert", data: 1 });
                setTimeout(function () { navigate("DataDownload"); }, 500);
              }
            }
          ], { cancelable: false });
      }
    }).catch(_ => { });
  }

  renderHomePage(style: String) {
    let menu = this.state.MenuList;
    if (style === 'A') {
      return <HomeA MenuList={menu} hasNotice={this.state.hasNoticeNum} navigation={this.props.navigation} />;
    }
    return <HomeC MenuList={menu} hasNotice={this.state.hasNoticeNum} navigation={this.props.navigation} />;
  }

  render() {
    let style = CompanyConfig.AppStyle;
    return (
      <ImageBackground style={[homeStyles.bgimg]} source={CompanyConfig.CompanyBGImgWithLogo} >
        <Spinner2 ref={c => (this._spinner = c)} />
        <OperationMessage ref="messageBar" />
        {this.renderHomePage(style)}
      </ImageBackground>
    );
  }
}
