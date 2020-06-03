import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  FlatList,
  TouchableHighlight,
  Animated,
  Dimensions
} from 'react-native';
import CustomerService from '../../services/myprofile';
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme';
import CompanyConfig from '../../config/company.config.js';
import OperationMessage from '../../components/OperationMessage.js';
import Spinner, { toggleSpinner } from '../../components/Spinner.js';
import CustomHeader from '../../components/CustomHeader.js';
import SvgUri from '../../components/svguri.js';
import AppConfig from '../../config/app.config.js';
import AddPersonnel from '../../pages/MyProfile/addPersonnel';
import BindingPersonnel from '../../pages/MyProfile/bindingPersonnel';
import UpdateUserInfo from '../../pages/MyProfile/updateUserInfo';
import StyleConfig from '../../config/style.config'
import ProgressHUD from "../../components/Spinner2";

let Style = null;
// const SPRING_CONFIG = { tension: 4, friction: 4 }
const SPRING_SPEACE = getResponsiveValue(-300);
const SPRING_SPEACE1 = getResponsiveValue(-1034);
const SPRING_SPEACE2 = getResponsiveValue(-667);
const SPRING_SPEACE3 = getResponsiveValue(-AppConfig.design.height);
let { height } = Dimensions.get('window');
let { width } = Dimensions.get('window');
const renderr = height;
const windowWidth = width;

// this class is about person manager
export default class personnel extends Component {

  static navigationOptions = {
    title: '人员管理',

  };
  constructor(props) {
    super(props);
    this.state = {
      IsRun: 0,
      pageSize: 20,
      pageIndex: 0,
      UserSysNo: '',
      name: '',
      SysNo: '',
      UserFullName: '',
      CellPhone: '',
      CommonStatus: 1,
      user: [],
      pan: new Animated.Value(getResponsiveValue(1034)),
      seat: 0,//记录动画的初始位置
      // IsNotallowUpdate: true,
    };
  }
  componentDidMount() {
    this.getUser();
  }
  getUser() {
    this.state.pageIndex = 0;
    this.state.IsRun = 0;
    let thisObj = this;
    let service = new CustomerService();
    service.LoadUser(this.state.CommonStatus, this.state.pageIndex, this.state.pageSize).then(result => {
      if (result.data.success) {
        for (let i = 0; i < result.data.data.length; i++) {
          result.data.data[i].key = i;
          if (result.data.data[i].CommonStatus == 1) {
            result.data.data[i].status = "禁用";
          } else {
            result.data.data[i].status = "启用";
          };
          if (result.data.data[i].IsChild == 0) {
            result.data.data[i].status = "";
            result.data.data[i].Isdisabled = true;
          } else {
            result.data.data[i].Isdisabled = false;
          };
          if (result.data.data[i].CellPhone != result.data.data[i].LoginName && result.data.data[i].CellPhone != null && result.data.data[i].CellPhone != '') {
            result.data.data[i].LoginName = result.data.data[i].LoginName + "(" + result.data.data[i].CellPhone + ")";
          } else {
            result.data.data[i].LoginName = result.data.data[i].LoginName;
          };
        }

         result.data.data.sort(function(a,b){
                    return a.InDate < b.InDate ? 1 : -1
                  });
        if (result.data.data.length < this.state.pageSize) {
          this.state.IsRun = 1;
        }
        thisObj.setState({
          user: result.data.data
        });
      } else {
        Alert.alert(
          '提示',
          result.data.message,
          [
            { text: '确定', onPress: () => console.log(''), style: 'cancel' },
          ],
          { cancelable: false }
        );
        //this.refs["messageBar"].show(result.data.message, 2);
      }
    });
  }
  findUser(commonStatus) {
    this.state.pageIndex = 0;
    this.state.IsRun = 0;
    this.state.CommonStatus = commonStatus;
    this.getUser();
  }
  updateUserStatus(sysNo, commonStatus) {
    let service = new CustomerService();
    let s = 0;
    if (commonStatus == 1) {
      s = -1
    } else {
      s = 1;
    }
    // if (commonStatus == 0) {
    //     s = 1
    // }
    let userList = this.state.user;
    // let List = [];
    for (let i = 0; i < userList.length; i++) {
      let user = userList[i];

      if (user.SysNo == sysNo) {
        user.CommonStatus = s;
        user.status = s == 1 ? "禁用" : "启用";
        // userList.splice(user)
      }
    }
    service.UpdateCompanyUserStatus(sysNo, s).then(result => {
      if (result.data.success) {
        this.refs["messageBar"].show(result.data.message, 1);
        this.setState({
          name: this.state.name,
          user: userList
        });
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
    }
    );
  }
  pageFind = () => {
    this.state.pageIndex = this.state.pageIndex + 1;
    let service = new CustomerService();
    let userList = [];
    let morUserList = [];
    if (this.state.IsRun == 0) {
      service.LoadUser(this.state.CommonStatus, this.state.pageIndex, this.state.pageSize).then(result => {

        if (result.data.success) {
          for (let i = 0; i < result.data.data.length; i++) {
            result.data.data[i].key = i;
            if (result.data.data[i].CommonStatus == 1) {
              result.data.data[i].status = "禁用";
            } else {
              result.data.data[i].status = "启用";
            };
            if (result.data.data[i].IsChild == 0) {
              result.data.data[i].status = "";
              result.data.data[i].Isdisabled = true;
            } else {
              result.data.data[i].Isdisabled = false;
            };;
            if (result.data.data[i].CellPhone != result.data.data[i].LoginName && result.data.data[i].CellPhone != null && result.data.data[i].CellPhone != '') {
              result.data.data[i].LoginName = result.data.data[i].LoginName + "(" + result.data.data[i].CellPhone + ")";
            } else {
              result.data.data[i].LoginName = result.data.data[i].LoginName;
            };
          }
          morUserList = result.data.data;
          userList = this.state.user;
          for (let i = 0; i < morUserList.length; i++) {
            userList.push(morUserList[i])
          }
          this.setState({
            user: userList
          })
          if (morUserList.length == 0) {
            this.state.IsRun = 1;
          }
        }
        toggleSpinner(false)
      });
    }
  }
  ResetPassword() {
    let service = new CustomerService();
    service.ResetPassword(this.state.UserSysNo).then(result => {
      if (result.data.success) {
        this.refs["messageBar"].show(result.data.message, 1)
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
    });
  }

  UpdateUserInfo(userSysNo, userFullName, cellPhone, ProvinceName, CityName, DistrictName, Address) {
    this.refs["window"].closeAnimation()
    this.startAnimation();
    this.refs["updateUserInfo"].getInfo(userSysNo, userFullName, cellPhone, ProvinceName, CityName, DistrictName, Address);
  }

  getStyle() {
    return [Style.RightViewShowWap, {
      transform: [{ translateX: this.state.pan }]
    }];
  }
  startAnimation() {
    Animated.sequence([
      Animated.timing(this.state.pan, {
        toValue: getResponsiveValue(367),
        duration: 400,
        useNativeDriver: true
      }),
    ]).start();
    this.state.seat = SPRING_SPEACE2;
  }
  closeInfoWindow() {
    Animated.sequence([
      Animated.timing(this.state.pan, {
        toValue: getResponsiveValue(1034),
        duration: 300,
        useNativeDriver: true
      }),
    ]).start();
    this.state.seat = 0;
  }
  render() {
    setStyle();

    let self = this;
    const { navigate } = this.props.navigation;
    let user = this.state.user;
    let miniTouchImageWidth = getResponsiveValue(40);
    let miniTouchImageHeight = getResponsiveValue(40);
    return (
      <View style={Style.BackColor}>
        <OperationMessage ref="messageBar" />
        <View style={{ width: getResponsiveValue(AppConfig.design.width), alignItems: 'center' }}>
          <CustomHeader sourceColor={StyleConfig.Secondary} sourceBackGroundColor={StyleConfig.Main} ref="header" title="新增账号" moreButton={true} navigation={this.props.navigation} rightButtonOnPress={() => { this.refs["window"].startAnimation() }
          } />
          <View style={[Style.InputView]}>
            <TouchableOpacity onPress={() => this.findUser(1)} style={[Style.UsUser, this.state.CommonStatus == 1 ? { backgroundColor: CompanyConfig.AppColor.ButtonBg } : { backgroundColor: StyleConfig.Main }]}>
              <Text style={[Style.Text, this.state.CommonStatus == 1 ? { color: CompanyConfig.AppColor.ButtonFront } : { color: StyleConfig.Secondary }]}>启用员工</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.findUser(-1)}
              style={[Style.NotUsUser, this.state.CommonStatus == 1 ? { backgroundColor: StyleConfig.Main } : { backgroundColor: CompanyConfig.AppColor.ButtonBg }]}>
              <Text style={[Style.Text, this.state.CommonStatus == 1 ? { color: StyleConfig.Secondary } : { color: CompanyConfig.AppColor.ButtonFront }]}>禁用员工</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flexDirection: 'row', backgroundColor: '#ffffff00' }} >
          <View style={Style.topView}>
            <View style={Style.TextName}>
              <Text style={Style.topText}>用户昵称</Text>
            </View>
            <View style={Style.TextPhone}>
              <Text style={[Style.topText, { paddingLeft: getResponsiveValue(15) }]}>登录账号</Text>
            </View>
            <View style={Style.ListHeaderView}>
              <Text style={[Style.topText]}>修改信息</Text>
            </View>
            <View style={Style.ListHeaderView}>
              <Text style={Style.topText}>重置密码</Text>
            </View>
            <View style={Style.ListHeaderView}>
              <Text style={Style.topText}>{this.state.CommonStatus == -1 ? "启用员工" : "禁用员工"}</Text>
            </View>

          </View>
        </View>
        <FlatList
          onEndReachedThreshold={0.1}
          onEndReached={self.pageFind}
          refreshing={false}
          onRefresh={() => { self.findUser(this.state.CommonStatus) }}
          data={user}
          extraData={this.state}
          keyExtractor={(intem, index) => "C" + intem.SysNo}
          renderItem={({ item }) =>
            <TouchableHighlight style={{ marginTop: getResponsiveValue(6) }} underlayColor={'#ffffff20'} onPress={() =>
              self.UpdateUserInfo(item.UserSysNo, item.UserFullName, item.CellPhone, item.ProvinceName, item.CityName, item.DistrictName, item.Address)
            }>

              <View style={Style.TextView}>
                <View style={[Style.TextName]}>
                  <Text numberOfLines={1} style={Style.Text}>{item.UserFullName}</Text>
                </View>
                <View style={Style.TextPhone}>
                  <Text numberOfLines={1} style={Style.Text}>{item.LoginName}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                  <TouchableOpacity style={Style.touchView} onPress={() => this.UpdateUserInfo(item.UserSysNo, item.UserFullName, item.CellPhone, item.ProvinceName, item.CityName, item.DistrictName, item.Address)}>
                    <View style={[Style.touchImageView, { marginLeft: getResponsiveValue(-20) }]}>
                      {item.SysNo != "" ? <SvgUri width={miniTouchImageWidth} height={miniTouchImageHeight} fill={StyleConfig.ContentFront} source={"quanxian"} /> : null}
                      {/* <Text style={item.SysNo != "" ? Style.MiniText : { opacity: 0 }}>信息</Text> */}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={Style.touchView} disabled={item.IsChild == 0 ? true : false} onPress={() => {
                    self.state.UserSysNo = item.UserSysNo;
                    Alert.alert(
                      '提示',
                      "确定重置为默认密码(登录账号)吗？",
                      [
                        { text: '取消', onPress: () => console.log(''), style: 'cancel' },
                        { text: '确定', onPress: () => this.ResetPassword() }
                      ],
                      { cancelable: false }
                    );
                  }}>
                    {item.IsChild == 1 ? <View style={[Style.touchImageView, { marginLeft: getResponsiveValue(-10) }]}>
                      {item.SysNo != "" ? <SvgUri opcity={item.IsChild == 0 ? 0 : 1} fill={StyleConfig.ContentFront} width={miniTouchImageWidth} height={miniTouchImageHeight} source={"password"} /> : null}
                      {/* <Text style={Style.MiniText}>密码</Text> */}
                    </View> : <View style={Style.touchImageView}></View>}
                  </TouchableOpacity>
                  <TouchableOpacity style={Style.touchView} disabled={item.Isdisabled} onPress={
                    () => {
                      this.state.SysNo = item.SysNo;
                      this.state.CommonStatus = item.CommonStatus;
                      item.CommonStatus == 1 ? Alert.alert(
                        '提示',
                        "确定禁用该人员吗？",
                        [
                          { text: '取消', onPress: () => console.log(''), style: 'cancel' },
                          { text: '确定', onPress: () => this.updateUserStatus(this.state.SysNo, this.state.CommonStatus) }
                        ],
                        { cancelable: false }
                      ) : Alert.alert(
                        '提示',
                        '确定启用该人员吗？',
                        [
                          { text: '取消', onPress: () => console.log(''), style: 'cancel' },
                          { text: '确定', onPress: () => this.updateUserStatus(this.state.SysNo, this.state.CommonStatus) }
                        ],
                        { cancelable: false }
                      )
                    }
                  }>
                    {item.IsChild == 1 ? <View style={Style.touchImageView}>
                      {item.SysNo != "" && item.CommonStatus == 1 ? <SvgUri fill={StyleConfig.ContentFront} width={miniTouchImageWidth} height={miniTouchImageHeight} source={"jinyong"} /> :
                        item.SysNo != "" ? <SvgUri fill={StyleConfig.ContentFront} width={miniTouchImageWidth} height={miniTouchImageHeight} source={"qiyong"} /> : null}
                      {/* <Text style={Style.MiniText}>{item.status}</Text> */}
                    </View> : <View style={Style.touchImageView}></View>}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableHighlight>
          }
        />
        <RightWindow refreshOnPress={() => this.componentDidMount()} ref='window' navigation={this.props.navigation}
          onShouldShowLoaing={(show) => {
            if (show) {
              this._hud.showLoading();
            } else {
              this._hud.hideLoading();
            }
          }}
        />
        <Animated.View style={this.getStyle()}>
          <UpdateUserInfo refreshOnPress={() => this.componentDidMount()} closeOnPress={() => this.closeInfoWindow()} ref='updateUserInfo' navigation={this.props.navigation}></UpdateUserInfo>
        </Animated.View>
        <Spinner IsCanTouch={true} />
        <ProgressHUD ref={c => this._hud = c} />
      </View >
    );
  }
}

// This class is used for the right side of the bullet box for employee management.
export class RightWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pan: new Animated.Value(getResponsiveValue(1034)),
      seat: 0,//记录动画的初始位置
      key: '',
      addPen: new Animated.Value(0),
      addOpcity: new Animated.Value(1),
      bangdingOpcity: new Animated.Value(1),
    };
  }

  getStyle() {
    return [Style.RightViewShowWap, {
      transform: [{ translateX: this.state.pan }]
    }];
  }

  componentStyle() {
    return [Style.componentStyle, {
      transform: [{ translateY: this.state.addPen }]
    }];
  }

  startAnimation() {
    Animated.sequence([
      Animated.timing(this.state.pan, {
        // ...SPRING_CONFIG,
        toValue: this.state.seat == 0 ? getResponsiveValue(734) : 0,
        duration: 400,
        useNativeDriver: true
      }),
    ]).start();
    this.state.seat = this.state.seat == 0 ? SPRING_SPEACE : 0;
  }
  goAnimation() {
    Animated.sequence([
      Animated.timing(this.state.pan, {
        // ...SPRING_CONFIG,
        toValue: 0,
        duration: 600,
        useNativeDriver: true
      }),
    ]).start();
    this.state.seat = SPRING_SPEACE1;
  }
  closeAnimation() {
    Animated.sequence([
      Animated.timing(this.state.pan, {
        // ...SPRING_CONFIG,
        toValue: getResponsiveValue(1034),
        duration: 400,
        useNativeDriver: true
      }),
    ]).start();
    this.state.seat = 0;
    // this.props.refreshOnPress();
    this.refs["addPersonnel"].componentDidMount();
    this.refs["bangdingPersonnel"].componentDidMount();
    this.setState({
      key: ''
    })
  }
  gitComponent() {
    let key = this.state.key;
    return <Animated.View style={this.componentStyle()}>
      <Animated.View style={{ opacity: this.state.addOpcity }}>
        <AddPersonnel
          ref="addPersonnel"
          style={{ height: getResponsiveValue(250) }}
          refresh={() => this.props.refreshOnPress()}
          showMessage={(message, n) => this.refs["messageBar"].show(message, n)}
          colseWindow={() => this.closeAnimation()}
          navigation={this.props.navigation}
          onShouldShowLoaing={(show) => {
            this.props.onShouldShowLoaing(show)
          }}
        />
      </Animated.View>
      <Animated.View style={{ opacity: this.state.bangdingOpcity }}>
        <BindingPersonnel
           style={{ height: height}}
          refresh={() => this.props.refreshOnPress()} ref="bangdingPersonnel"
          showMessage={(message, n) => this.refs["messageBar"].show(message, n)}
          colseWindow={() => this.closeAnimation()}
          navigation={this.props.navigation}
          onShouldShowLoaing={(show) => {
            this.props.onShouldShowLoaing(show)
          }}
        />
      </Animated.View>
    </Animated.View>
  }
  gotoAddOrBangding(key) {
    this.refs["addPersonnel"].clear();
    this.refs["bangdingPersonnel"].clear();
    this.refs["addPersonnel"].areaPicker.hide();
    this.goAnimation();
    Animated.parallel([
      Animated.timing(this.state.addPen, {
        toValue: key == "add" ? 0 : SPRING_SPEACE3,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(this.state.addOpcity, {
        toValue: key == "add" ? 1 : 0,
        duration: 250,
        useNativeDriver: true

      }),
      Animated.timing(this.state.bangdingOpcity, {
        toValue: key == "bangding" ? 1 : 0,
        duration: 250,
      }),
    ]).start();
    this.setState({
      key: key
    })
  }
  sureOnPress() {
    if (this.state.key == "add") {
      this.refs["addPersonnel"].AddUser();
    } else if (this.state.key = "bangding") {
      this.refs["bangdingPersonnel"].findUser();
    } else { }
  }
  render() {
    setStyle();
    let self = this;
    let imageWidth = getResponsiveValue(30);
    let imageHeight = getResponsiveValue(30);
    return (
      <Animated.View style={this.getStyle()}>

        <OperationMessage ref="messageBar" width={getResponsiveValue(1034)} />
        <View style={Style.windowImageground} >
          <View style={Style.windowView}>
            <View style={{ flexDirection: "column", }}>
              <TouchableOpacity style={Style.closeTouch} onPress={() => self.closeAnimation()}>
                <View><SvgUri width={getResponsiveValue(40)} height={getResponsiveValue(40)} fill={StyleConfig.PopupFront} source={'close'} /></View>
              </TouchableOpacity>
              <View style={Style.gotoView}>
                <TouchableHighlight underlayColor={StyleConfig.PopupBackground} onPress={() => self.gotoAddOrBangding('add')}>
                  {self.state.key != 'add' ? (<View style={Style.addTouchView}>
                    <SvgUri width={imageWidth} height={imageHeight} fill={CompanyConfig.AppColor.PopupFront} source={'add'} />
                    <Text style={Style.blackText}>新增员工</Text>
                  </View>) :
                    (<View style={[Style.addTouchView, { backgroundColor: CompanyConfig.AppColor.ButtonBg }]}>
                      <SvgUri width={imageWidth} height={imageHeight} fill={CompanyConfig.formatColor(CompanyConfig.AppColor.ButtonFront, '')} source={'add'} />
                      <Text style={[Style.whiteText, { borderBottomWidth: 0 }]}>新增员工</Text>
                    </View>)}
                </TouchableHighlight>
                <TouchableHighlight underlayColor={StyleConfig.PopupBackground} onPress={() => self.gotoAddOrBangding('bangding')}>
                  {self.state.key != 'bangding' ? (<View style={Style.addTouchView}>
                    <SvgUri width={imageWidth} height={imageHeight} fill={CompanyConfig.AppColor.PopupFront} source={'bangding'} />
                    <Text style={Style.blackText}>绑定账号</Text>
                  </View>) :
                    (<View style={[Style.addTouchView, { backgroundColor: CompanyConfig.AppColor.ButtonBg }]}>
                      <SvgUri width={imageWidth} height={imageHeight} fill={CompanyConfig.formatColor(CompanyConfig.AppColor.ButtonFront, '')} source={'bangding'} />
                      <Text style={[Style.whiteText, { borderBottomWidth: 0 }]}>绑定账号</Text>
                    </View>)}
                </TouchableHighlight>
              </View>
            </View>
            <View style={{ flexDirection: "column", }}>
              <TouchableOpacity style={Style.touchImage} onPress={() => self.sureOnPress()}>
                <View><SvgUri width={getResponsiveValue(40)} height={getResponsiveValue(40)} fill={StyleConfig.PopupFront} source={"sure"} /></View>
              </TouchableOpacity>
              <View style={{ marginLeft: getResponsiveValue(53), width: getResponsiveValue(734) }}>
                {self.gitComponent()}
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    )
  }
}

function setStyle() {
  if (Style != null && !CompanyConfig.isGeneral()) return Style;
  Style = StyleSheet.create({
    SearchImage: {
      height: getResponsiveValue(37),
      marginLeft: getResponsiveValue(10)
    },
    touchView: {
      flexDirection: 'column',
      marginRight: getResponsiveValue(35),
      marginLeft: getResponsiveValue(35),
      width: getResponsiveValue(70),
      height: getResponsiveValue(90),
      alignItems: 'center',
      justifyContent: "center",

    },
    ListHeaderView: {
      flexDirection: 'column',
      width: getResponsiveValue(140),
      height: getResponsiveValue(90),
      alignItems: 'center',
      justifyContent: "center",
    },
    touchImageView: {
      flexDirection: 'column',
      width: getResponsiveValue(70),
      alignItems: 'center',
      justifyContent: "center",
    },
    windowImageground: {
      width: getResponsiveValue(1334),
      height: renderr,
      alignItems: 'center',
      backgroundColor: StyleConfig.PopupBackground
    },
    closeTouch: {
      marginLeft: getResponsiveValue(50),
      // marginTop: getResponsiveValue(47),
      width: getResponsiveValue(100),
      height: getResponsiveValue(100),
      alignItems: 'center',
      justifyContent: "center",
    },
    addTouchView: {
      flexDirection: "row",
      height: getResponsiveValue(112),
      alignItems: 'center',
      justifyContent: "center",
    },
    addImage: {
      height: getResponsiveValue(30),
      width: getResponsiveValue(30),
      marginTop: getResponsiveValue(45),
      marginLeft: getResponsiveValue(48),

    },
    blackText: {
      borderBottomWidth: getResponsiveFontSize(1),
      borderColor: CompanyConfig.AppColor.PopupFront,
      fontSize: getResponsiveFontSize(32),
      color: CompanyConfig.AppColor.PopupFront,
    },
    whiteText: {
      borderBottomWidth: getResponsiveFontSize(1),
      borderColor: CompanyConfig.formatColor(CompanyConfig.AppColor.PopupBackground, ''),
      fontSize: getResponsiveFontSize(32),
      color: CompanyConfig.formatColor(CompanyConfig.AppColor.PopupBackground, '')
    },
    gotoView: {
      marginTop: getResponsiveValue(75),
      width: getResponsiveValue(300),
      height: getResponsiveValue(224)
    },
    windowView: {
      width: getResponsiveValue(1334),
      height: renderr,
      backgroundColor: StyleConfig.PopupBackground,
      flexDirection: "row",
    },
    RightViewShowWap: {
      position: "absolute",
      flexDirection: "column",
      zIndex: 999,
      top: 0,
      right: getResponsiveValue(-(AppConfig.design.width - 1034)),
      height: renderr,
      width: getResponsiveValue(AppConfig.design.width),
    },
    touchImage: {
      height: getResponsiveValue(100),
      width: getResponsiveValue(100),
      alignItems: "center",
      justifyContent: "center",
      zIndex: 300,
      // marginTop: getResponsiveValue(40),
      marginLeft: getResponsiveValue(600),
    },
    componentStyle: {
      position: "absolute",
      flexDirection: "column",
      zIndex: 200,
      height: renderr * 2,
      width: getResponsiveValue(734),
    },
    UsUser: {
      //  marginTop: getResponsiveValue(11),
      // marginBottom: getResponsiveValue(11),
      borderTopLeftRadius: getResponsiveValue(10),
      borderBottomLeftRadius: getResponsiveValue(10),
      height: getResponsiveValue(70),
      backgroundColor: CompanyConfig.AppColor.Main,
      width: getResponsiveFontSize(550),
      justifyContent: 'center',
      alignItems: 'center',
    },
    MiniText: {
      color: CompanyConfig.AppColor.ContentFront,
      opacity: 0.7,
      fontSize: getResponsiveFontSize(18),
    },
    NotUsUser: {
      // marginTop: getResponsiveValue(11),
      // marginBottom: getResponsiveValue(11),
      height: getResponsiveValue(70),
      width: getResponsiveFontSize(550),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: CompanyConfig.AppColor.MainFront,
      borderTopRightRadius: getResponsiveValue(10),
      borderBottomRightRadius: getResponsiveValue(10)
    },
    InputView: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      zIndex: 110,
      marginTop: getResponsiveValue(26),
      width: getResponsiveValue(1102),
      height: getResponsiveValue(72.5),
      borderRadius: getResponsiveValue(10),
      borderWidth: getResponsiveValue(1),
      borderColor: CompanyConfig.AppColor.ButtonBg,
    },
    BackColor: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: StyleConfig.PopupBackground
    },
    TextPhone: {
      width: getResponsiveValue(400),
      marginRight: getResponsiveValue(180),
      justifyContent: 'center',
      marginLeft: getResponsiveValue(20)
    },
    TextName: {
      justifyContent: 'center',
      width: getResponsiveValue(250)
    },
    ButtonText: {
      fontSize: getResponsiveFontSize(32),
      paddingLeft: getResponsiveValue(35),
      paddingTop: getResponsiveValue(14),
      paddingBottom: getResponsiveValue(14),
      color: CompanyConfig.AppColor.MainFront,
    },

    IsChild: {
      width: getResponsiveValue(136),
      marginRight: getResponsiveValue(30),
    },

    Inputborder: {
      height: getResponsiveValue(70)
    },
    ButtonView: {
      borderRadius: getResponsiveValue(10),
      marginRight: getResponsiveValue(30),
      width: getResponsiveValue(136),
    },

    Text: {
      fontSize: getResponsiveFontSize(32),
      color: StyleConfig.ContentFront,
    },

    TextView: {
      justifyContent: 'space-between',
      flexDirection: 'row',
      width: getResponsiveValue(1334),
      height: getResponsiveValue(90),
      paddingTop: getResponsiveValue(20),
      paddingBottom: getResponsiveValue(20),
      paddingLeft: getResponsiveValue(30),
      alignItems: 'center',
      backgroundColor: StyleConfig.Secondary

    },
    topText: {
      fontSize: getResponsiveFontSize(28),
      color: StyleConfig.FocalFront,
    },
    topView: {
      justifyContent: 'space-between',
      flexDirection: 'row',
      width: getResponsiveFontSize(1334),
      height: getResponsiveValue(72),
      paddingLeft: getResponsiveValue(30),
      alignItems: 'center',
    }

  })
  return Style;
}
