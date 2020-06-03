import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Keyboard,
  Alert,
  KeyboardAvoidingView,
  TextInput,

} from 'react-native';
import CustomerService from '../../services/myprofile';
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme';
import CompanyConfig from '../../config/company.config.js';
import SvgUri from '../../components/svguri.js';

let Style = null;
export default class addPersonnel extends Component {
  static navigationOptions = {
    title: '绑定账号',
  };

  constructor(props) {
    super(props);
    this.state = {
      user: { UserFullName: '', CellPhone: '', SysNo: null, LoginName: '' }
    };
  }
  componentDidMount() {
    Keyboard.dismiss();
    this.setState({
      user: { UserFullName: '', CellPhone: '', SysNo: null, LoginName: '' }
    });
  }

  clear() {
    this.refs["cellPhoneTextInput"].clear();
    if (this.refs["nicknameTextInput"]) { 
      this.refs["nicknameTextInput"].clear();
    }
    if (this.refs["loginAccountTextInput"]) {
      this.refs["loginAccountTextInput"].clear();
    }
    
  }

  insertCompanyUser() {
    this.props.onShouldShowLoaing(true);
    let service = new CustomerService();
    if (this.state.user.SysNo > 0) {
      service.InsertCompanyUser(this.state.user.SysNo).then(result => {
        this.props.onShouldShowLoaing(false);
        if (result.data.success) {
          this.props.showMessage(result.data.message, 1);
          this.props.refresh();
          timer = setTimeout(() => {
            this.props.colseWindow();
          }, 500);
        } else {
          this.props.showMessage(result.data.message, 2);
          this.setState({
            user: { SysNo: null, UserFullName: '', LoginName: '', CellPhone: this.state.user.CellPhone },
          })
        }
      })
    } else {
      Alert.alert('提示', "网络错误，请稍后再试！", [
        { text: '确定', onPress: () => console.log(''), style: 'cancel' },
      ],
        { cancelable: false }
      );
    }
  }

  findUser() {
    Keyboard.dismiss();
    let service = new CustomerService();
    let state = this.state.user
    if (state.CellPhone == '') {
      this.props.showMessage("请输入手机号码！", 3);
    } else {
      if (!(/^(1[23568479]\d{9})$/).test(state.CellPhone)) {
        this.props.showMessage("请输入正确的手机号码！", 3);
      } else {
        this.props.onShouldShowLoaing(true);
        service.FindUser(state.CellPhone).then(result => {
          this.props.onShouldShowLoaing(false);
          if (result.data.success) {
            this.setState({
              user: result.data.data,
            })
            let alertinfo = "绑定人员" + this.state.user.UserFullName + "？"
            Alert.alert('提示', alertinfo, [
              { text: '取消', onPress: () => console.log(''), style: 'cancel' },
              { text: '确定', onPress: () => this.insertCompanyUser() }
            ],
              { cancelable: false }
            )
          } else {
            Alert.alert('提示', result.data.message, [
              { text: '确定', onPress: () => console.log(''), style: 'cancel' },
            ], { cancelable: false }
            );
            this.setState({
              user: { SysNo: null, UserFullName: '', LoginName: '', CellPhone: this.state.user.CellPhone },
            })
          }
        })
      }
    }
  }

  render() {
    setStyle();
    let self = this;
    return (
      <KeyboardAvoidingView behavior="position" keyboardVerticalOffset={-240}>
        <View style={[this.props.style, { width: getResponsiveValue(734) }]}>
          <View style={[Style.View, { marginTop: getResponsiveValue(98), }]} >
            <SvgUri width={getResponsiveValue(40)} height={getResponsiveValue(40)} fill={CompanyConfig.AppColor.PopupFront} source={"search"} />
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={CompanyConfig.formatColor(CompanyConfig.AppColor.PopupFront, '80')}
              underlineColorAndroid="transparent"
              placeholder="请输入手机号码"
              style={Style.TextInput}
              keyboardType="numeric"
              maxLength={11}
              returnKeyType={'search'}
              disableFullscreenUI={true}
              onChangeText={newValue => { this.state.user.CellPhone = newValue; this.state.SysNo = ''; }}
              onSubmitEditing={(text) => this.findUser()}
              defaultValue={this.state.user.CellPhone}
              ref="cellPhoneTextInput"
            />
          </View>

          {this.state.user.UserFullName ?  <View style={[Style.View]} >
            <Text style={Style.Text}>用户昵称：</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={CompanyConfig.AppColor.PopupFront}
              underlineColorAndroid="transparent"
              style={Style.TextInput}
              editable={false}
              disableFullscreenUI={true}
              onChangeText={newValue => { this.state.user.UserFullName = newValue }}
              defaultValue={this.state.user.UserFullName}
              ref="nicknameTextInput"
            />
          </View> : null}

         {this.state.user.LoginName ? <View style={[Style.View, { borderBottomWidth: getResponsiveValue(1), }]} >
            <Text style={Style.Text}>登录账号：</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor={CompanyConfig.AppColor.PopupFront}
              underlineColorAndroid="transparent"
              style={Style.TextInput}
              editable={false}
              disableFullscreenUI={true}
              onChangeText={newValue => { this.state.user.LoginName = newValue }}
              defaultValue={this.state.user.LoginName}
              ref="loginAccountTextInput"
            />
          </View> : null}

          
        </View>
      </KeyboardAvoidingView>
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
      marginBottom: getResponsiveValue(-1)
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

    }
  });
  return Style;
}
