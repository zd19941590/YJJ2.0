import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  ScrollView, TouchableHighlight
} from 'react-native';
import CompanyConfig from '../../config/company.config.js';
import CustomHeader from '../../components/CustomHeader.js';
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme';
import PropTypes from "prop-types";
import FileHelper from '../../helpers/fileHelper.config.js';
import AppConfig from '../../config/app.config.js';

let pageStyles;

export class SubMenuItem extends Component {
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

    if (menu.DefaultImage != null && menu.DefaultImage != "") {
      FileHelper.fetchFile(menu.DefaultImage).then(path => {
        menu.DefaultImageUri = path;
        self.forceUpdate();
      });
    }
  }
  // setNativeProps(nativeProps) {
  //   this._root.setNativeProps(nativeProps);
  // }
  render() {

    setStyle();
    let menuItem = this.props.menu;
    let imgSource = null;
    if (menuItem.DefaultImage == null || menuItem.DefaultImage == "") {
      //  imgSource = CompanyConfig.CompanyLogo;
    }
    if (menuItem.DefaultImageUri) {
      imgSource = { uri: menuItem.DefaultImageUri };
    }
    let self = this;
    return (<View style={pageStyles.menuItemContainer} horizontal={true} >
      <Image source={imgSource} style={pageStyles.menuItemImg} key={menuItem.SysNo}
        onError={(e) => {
          let reg = /http(s?):\/\//i;
          if (menuItem.DefaultImageUri && !reg.test(menuItem.DefaultImageUri)) {
            menuItem.DefaultImageUri = FileHelper._getFileUrl(menuItem.DefaultImage);
            self.forceUpdate();
          }
        }} />

      {imgSource == null ? (
        <View style={pageStyles.menuItemWrap}>
          <Text style={pageStyles.menuItemText}>{menuItem.MenuName}</Text>
        </View>
      ) : null}
    </View>);
  }
}

export default class DispatchMenuAsLattice extends Component {

  static propTypes = {
    leftButtonImageSource: PropTypes.any,
    leftButtonOnPress: PropTypes.func,
    menu: PropTypes.any
  };

  constructor(prop) {
    super(prop);
    this.state = {
    };
  }
  menuList;
  getChildrenMenu() {
    if (this.menuList != null) return this.menuList;
    let self = this;
    let menu = null;
    if (this.props.menu) {
      menu = this.props.menu;
    }
    else {
      const { state } = this.props.navigation;
      menu = state.params.menu;
    }

    if (menu != null && menu.Children != null && menu.Children.length > 0) {
      for (let i = 0; i < menu.Children.length; i++) {
        let item = menu.Children[i];
        item.onPress = function () {
          self.changeMenuItem(item);
        }
      }
      this.menuList = menu.Children;
      return this.menuList;
    }
    else {
      return null;
    }
  }
  componentDidMount() {
    let self = this;
  }

  renderMenuList(menuList) {
    if (menuList == null || menuList.length == 0) return null;
    const { navigate } = this.props.navigation;
    let thisObj = this;
    let menuRowList = [];

    let row = null;
    //// 1行最多只能有个四个菜单数据
    for (let i = 0; i < menuList.length; i++) {
      if (i % 4 == 0) {
        row = {
          key: "key" + (i / 4),
          menuLists: []
        }
        menuRowList.push(row);
      }
      row.menuLists.push(menuList[i])
    }
    return (
      <ScrollView
        removeClippedSubviews={true}//用于将屏幕以外的视图卸载    
        style={pageStyles.menu} bounces={false} horizontal={false} showsVerticalScrollIndicator={false} >
        {

          menuRowList.map((row, rowIndex) => {
            return (<View key={"row" + rowIndex} style={{
              flex: 1,
              flexDirection: "row",
              alignItems: 'center',
              justifyContent: 'center',

            }}>
              <View style={pageStyles.menuRow} horizontal={true}  >
                {
                  row.menuLists.map((menuItem, index, list) => {
                    if (menuItem.LinkCode == "Home") menuItem.LinkCode = "DispatchMenuAsDetail";
                    return (
                      <TouchableHighlight style={pageStyles.menuItem} key={"menuItem" + index} underlayColor={CompanyConfig.AppColor.OnPressSecondary}
                        onPress={() => {
                          navigate(menuItem.LinkCode, { menu: menuItem });
                        }}
                      >
                        <View style={{
                          width: getResponsiveValue(290),
                          height: getResponsiveValue(290),

                        }}>
                          <SubMenuItem menu={menuItem} ref={"imgBtn" + index} key={menuItem.SysNo} ></SubMenuItem>
                        </View>
                      </TouchableHighlight>);
                  })
                }
              </View>
            </View>)

          })

        }
      </ScrollView>
    );
  }
  render() {
    setStyle();
    const { navigate } = this.props.navigation;
    let menuList = this.getChildrenMenu();
    return (
      <ImageBackground style={pageStyles.bgimg} source={CompanyConfig.CompanyBGImg} >
        <CustomHeader moreButton={true} navigation={this.props.navigation}
          leftButtonImageSource={this.props.leftButtonImageSource}
          leftButtonOnPress={this.props.leftButtonOnPress} />
        <View style={{
          flexDirection: "row",
          alignItems: 'center',
          justifyContent: 'center',
          width: getResponsiveValue(AppConfig.design.width),
          height: getResponsiveValue(AppConfig.design.height),
          paddingBottom: getResponsiveValue(20)
        }}>
          {this.renderMenuList(menuList)}
        </View>
      </ImageBackground>
    );
  }
}
function setStyle() {
  if (pageStyles != null && !CompanyConfig.isGeneral()) return pageStyles;
  pageStyles = StyleSheet.create({
    bgimg: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: CompanyConfig.AppColor.PageBackground,
    },
    menuRow: {
      //flex: 1,
      flexDirection: "row",
      alignItems: 'center',
      justifyContent: 'center',
      width: getResponsiveValue(1296),
      marginBottom: getResponsiveValue(40),
      marginTop: getResponsiveValue(40)
    },
    back: {
      position: "absolute",
      backgroundColor: CompanyConfig.AppColor.OnPressMain,
      left: getResponsiveValue(20),
      top: getResponsiveValue(5),
      height: getResponsiveValue(80),
      width: getResponsiveValue(80),
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      borderRadius: getResponsiveValue(40)
    },
    backImg: {
      height: getResponsiveValue(40),
      resizeMode: Image.resizeMode.contain
    },
    menu: {
      flex: 1,
      flexDirection: "column",

    },
    menuItem: {
      flexDirection: "column",
      width: getResponsiveValue(290),
      height: getResponsiveValue(290),
      marginLeft: getResponsiveValue(17),
      marginRight: getResponsiveValue(17),
      borderRadius: getResponsiveValue(20),
    },
    menuItemContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-start",
      elevation: 20,
    },

    menuItemImg: {
      top: 0,
      flex: 1,
      width: getResponsiveValue(290),
      height: getResponsiveValue(290),
      resizeMode: "cover",
      zIndex: 95,
      position: "absolute",
      borderRadius: getResponsiveValue(20)
    },

    menuItemWrap: {
      alignItems: "center",
      justifyContent: "center",
      borderRadius: getResponsiveValue(20),
      width: getResponsiveValue(290),
      height: getResponsiveValue(290),
      backgroundColor: CompanyConfig.AppColor.OnPressSecondary
    },

    menuItemText: {
      zIndex: 90,
      color: CompanyConfig.StyleColor.ContentFront,
      width: getResponsiveValue(290),
      height: getResponsiveValue(36),
      lineHeight: getResponsiveValue(36),
      textAlign: "center",
      textAlignVertical: "center",
      fontSize: getResponsiveFontSize(30),
      borderRadius: getResponsiveValue(10)
    }
  });
}
