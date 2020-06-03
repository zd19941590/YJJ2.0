import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Keyboard,
  Alert,
  TouchableHighlight,
  TextInput,
} from 'react-native';
import CustomerService from '../../services/myprofile';
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme';
import CompanyConfig from '../../config/company.config.js';
import AppConfig from '../../config/app.config.js';
import { AreaPicker } from '../../components/EasyPicker.js';
let Style = null;

export default class AddPersonnel extends Component {
  static navigationOptions = {
    title: '新增账号',
  };

  constructor(props) {
    super(props);
    this.state = {
      UserFullName: '',
      CellPhone: '',
      LoginPassword: '',
      ProvinceName: null,    //省
      CityName: null,    //市
      DistrictName: null,   //区
      Address: null
    };
  }
  areaPicker = new AreaPicker();

  clear() {
    Keyboard.dismiss();
    this.setState({
      UserFullName: '',
      CellPhone: '',
      LoginPassword: '',
      ProvinceName: null,    //省
      CityName: null,    //市
      DistrictName: null,   //区
      Address: null
    });
    this.refs["nameInputText"].clear();
    this.refs["phoneInputText"].clear();
    this.refs["passwordInputText"].clear();
    this.refs["AddressText"].clear();
    this.areaPicker.hide();
  }

  componentDidMount() {
    this.clear()
  }
  _showAreaPicker() {
    let thisObj = this;
    let selectedValue = ['四川省', '成都市', '新都区'];
    this.areaPicker.init(selectedValue, (pickedValue) => {
      thisObj.setState({ ProvinceName: pickedValue[0], CityName: pickedValue[1], DistrictName: pickedValue[2] });
    }, () => { thisObj.areaPicker.show(); });

  }
  AddUser() {

    Keyboard.dismiss();
    let service = new CustomerService();
    let state = this.state;
    if (state.UserFullName == ' ' || state.UserFullName == null) {
      this.props.showMessage("请输入姓名！", 3);
    } else {

      if (state.CellPhone == '' || state.CellPhone == null) {
        this.props.showMessage("请输入手机号码！", 3);
      } else {
        if (!(/^(1[23584769]\d{9})$/).test(state.CellPhone)) {
          this.props.showMessage("请输入正确的手机号码！", 3);
        } else {

          if (state.LoginPassword != '') {
            if (!(/^[a-zA-Z0-9]{6,20}$/.test(state.LoginPassword))) {
              this.props.showMessage("密码只能由6至20位字母和数字组成！", 3);
            } else {
              this.props.onShouldShowLoaing(true);
              service.AddCompanyUser(state.UserFullName, state.CellPhone, state.LoginPassword, state.ProvinceName, state.CityName, state.DistrictName, state.Address).then(
                result => {
                  this.props.onShouldShowLoaing(false);
                  if (result.data.success) {
                    this.props.showMessage(result.data.message, 1);
                    this.props.colseWindow();
                    timer = setTimeout(() => {
                      this.props.refresh();
                      this.setState({
                        UserFullName: '',
                        CellPhone: '',
                        LoginPassword: '',
                        ProvinceName: null,    //省
                        CityName: null,    //市
                        DistrictName: null,   //区
                        Address: null
                      })
                    }, 500);

                  } else {
                    Alert.alert('提示', result.data.message, [
                      { text: '确定', onPress: () => console.log(''), style: 'cancel' },
                    ], { cancelable: false });
                  }
                }
              )
            }
          } else {
            state.LoginPassword = state.CellPhone;
            this.props.onShouldShowLoaing(true);
            service.AddCompanyUser(state.UserFullName, state.CellPhone, state.LoginPassword, state.ProvinceName, state.CityName, state.DistrictName, state.Address).then(
              result => {
                this.props.onShouldShowLoaing(false);
                if (result.data.success) {
                  this.props.showMessage(result.data.message, 1);
                  this.props.refresh();
                  timer = setTimeout(() => {
                    this.props.colseWindow();
                    this.setState({
                      UserFullName: '',
                      CellPhone: '',
                      LoginPassword: '',
                      ProvinceName: null,    //省
                      CityName: null,    //市
                      DistrictName: null,   //区
                      Address: null
                    })
                  }, 500);
                } else {
                  Alert.alert('提示', result.data.message, [
                    { text: '确定', onPress: () => console.log(''), style: 'cancel' },
                  ], { cancelable: false }
                  );
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
    let self = this;
    return (
      <View style={{ width: getResponsiveValue(734), height: getResponsiveValue(AppConfig.design.height) }}>
        <View style={[Style.View, { marginTop: getResponsiveValue(40) }]} >
          <Text style={Style.Text}>用户昵称：</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={CompanyConfig.AppColor.ContentFront}
            underlineColorAndroid="transparent"
            style={Style.TextInput}
            maxLength={20}
            returnKeyType={'next'}
            disableFullscreenUI={true}
            onChangeText={newValue => { this.state.UserFullName = newValue; }}
            defaultValue={this.state.UserFullName}
            ref="nameInputText"
            onSubmitEditing={() => {
              self.refs["phoneInputText"].focus();
            }}
          />
        </View>
        <View style={[Style.View]} >
          <Text style={Style.Text}>手机号码：</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={CompanyConfig.AppColor.ContentFront}
            underlineColorAndroid="transparent"
            style={Style.TextInput}
            maxLength={11}
            keyboardType="numeric"
            returnKeyType={'done'}
            returnKeyLabel={"确定"}
            disableFullscreenUI={true}
            onChangeText={newValue => { this.state.CellPhone = newValue; }}
            defaultValue={this.state.CellPhone}
            ref="phoneInputText"
          />
        </View>
        {/* <View style={[Style.View]} >
          <Text style={Style.Text}>所在地区：</Text>
          <TouchableHighlight underlayColor={"#ffffff00"} style={{ height: getResponsiveValue(80), justifyContent: 'center' }} onPress={() => this._showAreaPicker()}>
            <Text numberOfLines={1} style={Style.TextInput}>{this.state.ProvinceName}{this.state.CityName}{this.state.DistrictName}</Text>
          </TouchableHighlight>
        </View> */}
        <View style={[Style.View]} >
          <Text style={Style.Text}>详细地址：</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={CompanyConfig.AppColor.ContentFront}
            underlineColorAndroid="transparent"
            style={Style.TextInput}
            maxLength={20}
            returnKeyType={'done'}
            returnKeyLabel={"确定"}
            disableFullscreenUI={true}
            onChangeText={newValue => { this.state.Address = newValue; }}
            defaultValue={this.state.Address}
            ref="AddressText"
          />
        </View>
        <View style={Style.View} >
          <Text style={Style.Text}>登录密码：</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={CompanyConfig.formatColor(CompanyConfig.AppColor.PopupFront, '80')}
            placeholder="不填写,默认为手机号码"
            underlineColorAndroid="transparent"
            secureTextEntry={true}
            style={Style.TextInput}
            returnKeyType={'done'}
            returnKeyLabel={"确定"}
            disableFullscreenUI={true}
            maxLength={20}
            onChangeText={newValue => { this.state.LoginPassword = newValue; }}
            defaultValue={this.state.LoginPassword}
            ref="passwordInputText"
          />
        </View>
        {/* <Spinner /> */}
        {/* <ProgressHUD ref={c => this._hud = c} /> */}
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
    MemoView: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: getResponsiveValue(234),
      marginTop: getResponsiveValue(24)
    },
    ScrollView: {
      backgroundColor: CompanyConfig.AppColor.OnPressMain,
      flex: 1
    },
    TextInput: {
      height: 'auto',
      fontSize: getResponsiveFontSize(28),
      color: CompanyConfig.AppColor.PopupFront,
      width: getResponsiveValue(1000),
      padding: 0,
      marginBottom: getResponsiveValue(-1),
      width: getResponsiveValue(420)
    },
    View: {
      borderBottomWidth: getResponsiveValue(1),
      borderColor: CompanyConfig.AppColor.PopupFront,
      flexDirection: 'row',
      alignItems: 'center',
      height: getResponsiveValue(90),
      width: getResponsiveValue(600)
    },
    Text: {
      height: 'auto',
      fontSize: getResponsiveFontSize(32),
      color: CompanyConfig.AppColor.PopupFront,
      textAlign: 'left'

    }
  });
  return Style;
}
