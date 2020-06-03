import React, { Component } from 'react';
import {
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
  
  render() {
    let menuItem = this.props.menu;
    let imgSource = null;
    
    let self = this;
    if (menuItem.DefaultImageUri) {
      imgSource = { uri: menuItem.DefaultImageUri };
    }
    return (<View style={pageStyles.menuItemContainer} horizontal={true} >
      <Image source={imgSource} style={pageStyles.menuItemImg} key={menuItem.SysNo}
        onError={(e) => {
          let reg = /http(s?):\/\//i;
          if (menuItem.DefaultImageUri && !reg.test(menuItem.DefaultImageUri)) {
            menuItem.DefaultImageUri = FileHelper._getFileUrl(menuItem.DefaultImage);
            self.forceUpdate();
          }
        }}
      />
      {imgSource == null ? (
        <View style={pageStyles.menuItemWrap}>
          <Text style={pageStyles.menuItemText}>{menuItem.MenuName}</Text>
        </View>
      ) : null}
    </View>);
  }
}
/**
 * This is the secondary menu, which is the page after entering the menu from the home page.
 */
export default class DispatchMenuAsList extends Component {

  static propTypes = {
    leftButtonImageSource: PropTypes.any,
    leftButtonOnPress: PropTypes.func,
    menu: PropTypes.any
  };
  /**
   * constructor 
   * @param {menuItems} prop
   *  collection that Includes parameters in the secondary menus
   */
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
    window.console.log('menu')
    window.console.log(menu)
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

  renderMenuList(menuList) {
    if (menuList == null || menuList.length == 0) return null;
    const { navigate } = this.props.navigation;
    window.console.log(menuList)
    return (
      <ScrollView style={pageStyles.menu} horizontal={true} showsHorizontalScrollIndicator={false} >
        {
          menuList.map((menuItem, index, list) => {
            if (menuItem.LinkCode == "Home") menuItem.LinkCode = "DispatchMenuAsDetail";
            return (
              <View key={menuItem.SysNo} style={{ height: getResponsiveValue(AppConfig.design.height), justifyContent: 'center', alignItems: 'center' }}>
                <TouchableHighlight style={pageStyles.menuItem} activeOpacity={0.8} underlayColor={CompanyConfig.StyleColor.HomePageA.MenuItemPressBackground}
                  onPress={() => {
                    window.console.log(menuItem.LinkCode)
                    navigate(menuItem.LinkCode, { menu: menuItem });
                  }}
                >
                  <View>
                    <SubMenuItem menu={menuItem} ref={"imgBtn" + index} key={menuItem.SysNo} ></SubMenuItem>
                  </View>
                </TouchableHighlight></View>);
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
        {this.renderMenuList(menuList)}
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
      backgroundColor: CompanyConfig.AppColor.PageBackground
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
      flexDirection: "row",
      height: getResponsiveValue(578)
    },
    menuItem: {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: getResponsiveValue(290),
      height: getResponsiveValue(578),
      marginLeft: getResponsiveValue(60),
      marginRight: getResponsiveValue(60),
      borderRadius: getResponsiveValue(10)
    },
    menuItemContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: getResponsiveValue(290),
      height: getResponsiveValue(578),
      borderRadius: getResponsiveValue(10)
    },

    menuItemImg: {
      top: 0,
      flex: 1,
      width: getResponsiveValue(290),
      height: getResponsiveValue(578),
      borderRadius: getResponsiveValue(10),
      resizeMode: "contain",
      zIndex: 95,
      position: "absolute",
    },

    menuItemWrap: {
      alignItems: "center",
      justifyContent: "center",
      borderRadius: getResponsiveValue(10),
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
