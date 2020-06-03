import React, { Component } from 'react';
import {
  View
  , StyleSheet
  , Text
  , Image
  , TouchableOpacity
  , Alert
  , ScrollView
  , TouchableHighlight
} from 'react-native';
import Checkbox from '../../components/Checkbox.js'
import CompanyConfig from '../../config/company.config.js';
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme';
import CustomerService from '../../services/myprofile.js';
import OperationMessage from '../../components/OperationMessage.js';
import Spinner from '../../components/Spinner.js';
import SvgUri from '../../components/svguri.js';
import StyleConfig from '../../config/style.config'

let moreStyles = null;
export default class UserAuth extends Component {
  static navigationOptions = {
    header: null,
  };
  constructor(props) {
    super(props);
    this.state = {
      userList: [],
      permissionList: [],
      isSelected: false,
      isPermissionSelected: false,
      showOK: false,
    };
    this.customerService = new CustomerService();
    this.userList = [];
    this.permissionList = [];
    this.clickCheckUser = this.clickCheckUser.bind(this);
    this.clickCheckPermission = this.clickCheckPermission.bind(this);
    this.setUserCheckboxState = this.setUserCheckboxState.bind(this);
    this.setPermissionCheckboxState = this.setPermissionCheckboxState.bind(this);
    this._getSelectedPermissions = this._getSelectedPermissions.bind(this);
    this._getSelectedUsers = this._getSelectedUsers.bind(this);
    this._saveUsersPermissionsInfo = this._saveUsersPermissionsInfo.bind(this);
  }

  componentDidMount() {
    this.customerService.GetAllUserInfo().then((userData) => { //获取所有用户  
      this.customerService.GetUsersPermission(this._getSelectedUsers()).then((permissionData) => {//获取所有权限
        this.userList = userData.data;
        this.permissionList = permissionData.data;
        this.setState({
          userList: this.userList,
          permissionList: this.permissionList
        })
        if (typeof (userData.data.success) != "undefined" && !userData.data.success) {
          Alert.alert(
            '提示',
            userData.data.message,
            [
              { text: '确定', onPress: () => console.log(''), style: 'cancel' },
            ],
            { cancelable: false }
          );
        }
      }).catch(error => {
        Alert.alert('提示', error.message, [
          { text: '确定', onPress: () => console.log(''), style: 'cancel' },
        ],
          { cancelable: false }
        );
      })
    }).catch(error => {
      Alert.alert('提示', error.message, [
        { text: '确定', onPress: () => console.log(''), style: 'cancel' },
      ],
        { cancelable: false }
      );
    })
  }

  GetSelectedUsersPermission() {
    this.customerService.GetUsersPermission(this._getSelectedUsers()).then((permissionData) => {//获取所有权限
      let permissionList = permissionData.data;
      if (permissionList != null && permissionList.length > 0) {
        let newpermissionList = permissionList.map((item) => {
          this.setPermissionCheckboxState({ key: "permession_checkbox_" + item.PermissionSysNo, state: item.HasPermission });
        })
      }
    }).catch(error => {
      Alert.alert('提示', error.message, [
        { text: '确定', onPress: () => console.log(''), style: 'cancel' },
      ],
        { cancelable: false }
      );
    })
  }

  clickCheckUser(newState) {

    if (this.state.isSelected) {
      newState = false;
      this.state.isSelected = false;
      if (this.state.isPermissionSelected) {
        this.refs["allCheckPermission"].setCheckState(false);
        this.state.isPermissionSelected = false;
      }
    } else {
      newState = true;
      this.state.isSelected = true;
    }
    this.refs["allCheck"].setCheckState(newState);
    let userList = this.state.userList;
    if (userList != null && userList.length > 0) {
      let newUserList = userList.map((item) => {
        this.setUserCheckboxState({ key: "user_checkbox_" + item.UserSysNo, state: newState });
      })
    }
  }
  clickCheckPermission(newState) {
    this.refs["okpress"].showok();
    let permissionList = this.state.permissionList;
    if (this.state.isPermissionSelected) {
      newState = false;
      this.state.isPermissionSelected = false;

    } else {
      newState = true;
      this.state.isPermissionSelected = true;

    }
    this.refs["allCheckPermission"].setCheckState(newState);
    if (permissionList != null && permissionList.length > 0) {
      let newpermissionList = permissionList.map((item) => {
        this.setPermissionCheckboxState({ key: "permession_checkbox_" + item.PermissionSysNo, state: newState });
      })
    }
  }
  setUserCheckboxState({ key, state }) {
    this.refs[key].setCheckState(state, () => {
      this.GetSelectedUsersPermission();
    });

  }
  setPermissionCheckboxState({ key, state }) {
    this.refs[key].setCheckState(state)
  }
  getCheckboxState({ key }) {
    return this.refs[key].getCheckState()
  }

  _getSelectedUsers() {
    let users = [];
    if (this.state.userList != null && this.state.userList.length > 0) {
      for (let item in this.state.userList) {
        let user = this.state.userList[item];
        let isSelected = this.getCheckboxState({ key: `user_checkbox_${user.UserSysNo}` });
        if (isSelected) {
          users.push(user.UserSysNo)
        }

      }
    }
    return users;
  }
  _getSelectedPermissions() {
    let permissions = [];
    if (this.state.permissionList != null && this.state.permissionList.length > 0) {
      for (let item in this.state.permissionList) {
        let permission = this.state.permissionList[item];
        let isSelected = this.getCheckboxState({ key: `permession_checkbox_${permission.PermissionSysNo}` });
        if (isSelected) {
          permissions.push(permission.PermissionSysNo)
        }

      }
    }
    return permissions;
  }
  _saveUsersPermissionsInfo() {
    let self = this;
    let users = this._getSelectedUsers();
    let permissions = this._getSelectedPermissions();
    this.customerService.UpdateUserPermission({ UserSysNos: users, PermessionList: permissions }).then(result => {
      if (result.data.success) {
        self.refs["messageBar"].show(result.data.message, 1);
      } else {
        if (!result.data.success) {
          self.refs["messageBar"].show(result.data.message, 2);
        } else {
          self.refs["messageBar"].show("网络错误，请稍后再试！", 2);

        }
      }
    })
  }
  renderUser() {
    if (this.state.userList != null && this.state.userList.length > 0) {
      return (
        this.state.userList ?
          this.state.userList.map((item, index) => {
            return (
              <TouchableHighlight key={item.UserSysNo}
                underlayColor={StyleConfig.PopupBackground} onPress={() => {
                  this.setUserCheckboxState({ key: "user_checkbox_" + item.UserSysNo, state: !this.getCheckboxState({ key: "user_checkbox_" + item.UserSysNo }) });
                  if (this.state.isSelected) {
                    this.refs["allCheck"].setCheckState(false);
                    this.state.isSelected = false;
                  };
                  if (this.state.isPermissionSelected) {
                    this.refs["allCheckPermission"].setCheckState(false);
                    this.state.isPermissionSelected = false;
                  }
                }}
                style={{ marginTop: getResponsiveValue(6) }}
              >
                <View style={moreStyles.itemView}>
                  <Text style={[moreStyles.title, { color: StyleConfig.FocalFront }]}>{item.UserFullName}</Text>
                  <View style={moreStyles.checkView}>
                    <Checkbox ref={"user_checkbox_" + item.UserSysNo} clickCallback={() => {
                      this.setUserCheckboxState({ key: "user_checkbox_" + item.UserSysNo, state: !this.getCheckboxState({ key: "user_checkbox_" + item.UserSysNo }) });
                      if (this.state.isSelected) {
                        this.refs["allCheck"].setCheckState(false);
                        this.state.isSelected = false;
                      };
                      if (this.state.isPermissionSelected) {
                        this.refs["allCheckPermission"].setCheckState(false);
                        this.state.isPermissionSelected = false;
                      }
                    }} style={moreStyles.checkImage} isSelected={item.IsSelected}></Checkbox>
                  </View>
                </View>
              </TouchableHighlight>)
          }) : null
      )
    }
  }
  renderPermession() {
    if (this.state.permissionList != null && this.state.permissionList.length > 0) {
      return (
        this.state.permissionList.map((item, index) => {
          return (
            <TouchableHighlight key={item.PermissionSysNo} onPress={() => {
              this.setPermissionCheckboxState({ key: "permession_checkbox_" + item.PermissionSysNo, state: !this.getCheckboxState({ key: "permession_checkbox_" + item.PermissionSysNo }) });
              if (this.state.isPermissionSelected) {
                this.refs["allCheckPermission"].setCheckState(false);
                this.state.isPermissionSelected = false;
              };
              this.refs["okpress"].showok();
            }}
              underlayColor={CompanyConfig.AppColor.OnPressMain}
              style={{ marginTop: getResponsiveValue(6) }}
            >
              <View style={moreStyles.itemView}>
                <Text style={[moreStyles.title, { color: StyleConfig.FocalFront }]}>{item.PermissionName}</Text>
                <View style={moreStyles.checkView}>
                  <Checkbox ref={"permession_checkbox_" + item.PermissionSysNo} clickCallback={() => {
                    this.setPermissionCheckboxState({ key: "permession_checkbox_" + item.PermissionSysNo, state: !this.getCheckboxState({ key: "permession_checkbox_" + item.PermissionSysNo }) });
                    if (this.state.isPermissionSelected) {
                      this.refs["allCheckPermission"].setCheckState(false);
                      this.state.isPermissionSelected = false;
                    };
                    this.refs["okpress"].showok();
                  }} style={moreStyles.checkImage} isSelected={item.HasPermission}></Checkbox>
                </View>
              </View>
            </TouchableHighlight>)
        })

      )
    }
  }
  render() {
    setStyle();
    // let flag = this.state.isSelected;
    // let check = this.state.isSelected;
    return (
      <View style={moreStyles.bgimg} >
        <OperationMessage ref="messageBar" />
        <View style={moreStyles.layout}>
          <View style={moreStyles.halfLayout} >
            <View style={moreStyles.headView}>
              <TouchableHighlight style={moreStyles.back} onPress={() => {
                if (typeof (this.props.navigation.state.params) != "undefined" && typeof (this.props.navigation.state.params.refresh) == "function") {
                  this.props.navigation.state.params.refresh();
                }
                this.props.navigation.goBack();
              }} underlayColor={CompanyConfig.AppColor.OnPressSecondary} >
                <View><SvgUri width={getResponsiveValue(40)} height={getResponsiveValue(40)} fill={StyleConfig.Main} source={"back"} /></View>
              </TouchableHighlight>
              <Text style={[moreStyles.title, { opacity: 0.7 }]} >人员</Text>
              <View style={[moreStyles.checkView, { paddingRight: getResponsiveValue(5), opacity: 0.7, }]}>
                <TouchableOpacity onPress={this.clickCheckUser}>
                  <Text style={{ fontSize: getResponsiveFontSize(24), color: StyleConfig.FocalFront, marginRight: getResponsiveValue(10) }}>全选</Text>
                </TouchableOpacity>
                <Checkbox ref="allCheck" isShowNotSelectImg={true} clickCallback={this.clickCheckUser} style={[moreStyles.checkImage]} isSelected={this.state.isSelected}></Checkbox>
              </View>
            </View>
            <ScrollView horizontal={false} style={moreStyles.scrollView}>
              {
                this.renderUser()
              }
            </ScrollView>
          </View>
          <View style={moreStyles.halfLayout}>
            <View style={moreStyles.headView}>
              <Text style={[moreStyles.title, moreStyles.fontSize32, { opacity: 0.7 }]}>权限</Text>

              <View style={[moreStyles.checkView, { marginRight: getResponsiveValue(15) }]}>
                <OKPress ref="okpress" OkOnPress={() => this._saveUsersPermissionsInfo()} />
              </View>
            </View>
            <ScrollView horizontal={false} style={[moreStyles.scrollView, { borderRightWidth: 0 }]}>
              {
                this.renderPermession()
              }
            </ScrollView>
          </View>
        </View>
        <Spinner IsCanTouch={true} />
      </View>
    );
  }
}
export class OKPress extends Component {
  constructor(props) {
    super(props);
    this.state = {

      showOK: false,
    };
  }
  showok() {
    this.setState({
      showOK: true
    })
  }
  componentDidMount() { }
  render() {
    setStyle();
    return (<View>
      {this.state.showOK ? (<TouchableOpacity style={{ zIndex: 140 }} onPress={() => this.props.OkOnPress()}>
        <Text style={{ fontSize: getResponsiveFontSize(32), color: StyleConfig.FocalFront }}>确定</Text>
      </TouchableOpacity>) : null}
    </View>
    )
  }

}
function setStyle() {
  if (moreStyles != null && !CompanyConfig.isGeneral()) return moreStyles;
  moreStyles = StyleSheet.create({
    bgimg: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: StyleConfig.PopupBackground
    },
    layout: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      // marginTop: getResponsiveValue(90),
      // marginLeft: getResponsiveValue(9),
      // marginRight: getResponsiveValue(9),
      marginBottom: getResponsiveValue(4),
      // backgroundColor: StyleConfig.OnPressMain

    },
    halfLayout: {
      flex: 0.5,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      borderRightWidth: getResponsiveValue(1),
      borderColor: CompanyConfig.formatColor(StyleConfig.DescriptionFront, "33"),
    },
    headView: {
      backgroundColor: StyleConfig.PopupBackground,
      // width: getResponsiveValue(632),
      height: getResponsiveValue(90),
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center"
    },
    scrollView: {

      // width: getResponsiveValue(667),
      // paddingRight: getResponsiveValue(20),
      // paddingLeft: getResponsiveValue(30),
      borderStyle: "solid",

      flex: 1,


    },
    back: {
      height: getResponsiveValue(80),
      width: getResponsiveValue(80),
      borderRadius: getResponsiveValue(40),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: StyleConfig.Secondary
    },
    backImg: {
      height: getResponsiveValue(40),
      resizeMode: Image.resizeMode.contain
    },
    itemView: {
      height: getResponsiveValue(88),
      flexDirection: 'row',
      justifyContent: "flex-start",
      backgroundColor: StyleConfig.Secondary,
      alignItems: "center",
      paddingLeft: getResponsiveValue(30),
      marginRight: getResponsiveValue(6),
      marginLeft: getResponsiveValue(6)
    },
    checkView: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "flex-end",
      marginRight: getResponsiveValue(32),
      alignItems: "center",
      height: getResponsiveValue(90),
      zIndex: 1
    },
    footView: {
      width: getResponsiveValue(632),
      padding: getResponsiveValue(20),
      // borderStyle: "solid",
      // borderWidth: getResponsiveValue(1),
      // borderColor: CompanyConfig.AppColor.OnPressLine,
      flex: 1,
      flexDirection: 'column',
      justifyContent: "flex-start"
    },
    title: {
      // width: getResponsiveValue(126),
      // height: getResponsiveValue(30),
      // fontFamily: "NotoSansCJKsc-DemiLight",
      fontSize: getResponsiveFontSize(32),
      // lineHeight: getResponsiveValue(76),
      color: StyleConfig.FocalFront,
      // marginRight: getResponsiveValue(35),

    },
    fontSize32: {
      fontSize: getResponsiveFontSize(28),
      marginLeft: getResponsiveValue(30)
    },
    checkImage: {
      width: getResponsiveValue(30),
      height: getResponsiveValue(30),

    }

  });
  return moreStyles;
}
