import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  ScrollView, TouchableHighlight
} from 'react-native';
import CompanyConfig from "../../config/company.config";
import CustomHeader from "../../components/CustomHeader";
import { getResponsiveValue } from "../../assets/default.theme";
import PropTypes from "prop-types";
import FileHelper from "../../helpers/fileHelper.config";
import AppConfig from "../../config/app.config";

export default class DispatchMenuAsGrid extends Component {
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

  renderMenuList(menuList) {
    if (menuList == null || menuList.length == 0) return null;
    const { navigate } = this.props.navigation;

    return (
      <ScrollView horizontal={true} style={styles.menu} showsHorizontalScrollIndicator={false} >
        {
          menuList.map((menuItem, index, list) => {
            if (menuItem.LinkCode == "Home") menuItem.LinkCode = "DispatchMenuAsDetail";
            return (
              <TouchableHighlight style={styles.menuItem} key={"menuItem" + index} underlayColor={CompanyConfig.AppColor.OnPressSecondary}
                onPress={() => {
                  navigate(menuItem.LinkCode, { menu: menuItem });
                }}
              >
                <SubMenuItem menu={menuItem} ref={"imgBtn" + index} key={menuItem.SysNo} ></SubMenuItem>
              </TouchableHighlight>
            );
          })
        }
      </ScrollView>
    );
  }
  render() {
    let menuList = this.getChildrenMenu();
    return (
      <ImageBackground style={[styles.bgimg]} source={CompanyConfig.CompanyBGImg} >
        <CustomHeader moreButton={true} navigation={this.props.navigation}
          leftButtonImageSource={this.props.leftButtonImageSource}
          leftButtonOnPress={this.props.leftButtonOnPress} />
        {this.renderMenuList(menuList)}
      </ImageBackground>
    );
  }
}

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
    if (menuItem.DefaultImageUri) {
      imgSource = { uri: menuItem.DefaultImageUri };
    }
    let self = this;
    return (
      <View style={styles.menuItemContainer} horizontal={true} >
        <Image source={imgSource} style={styles.menuItemImg} key={menuItem.SysNo}
          onError={(e) => {
            let reg = /http(s?):\/\//i;
            if (menuItem.DefaultImageUri && !reg.test(menuItem.DefaultImageUri)) {
              menuItem.DefaultImageUri = FileHelper._getFileUrl(menuItem.DefaultImage);
              self.forceUpdate();
            }
          }} />
        <Text style={[styles.menuItemText, { color: CompanyConfig.StyleColor.ContentFront }]}>{menuItem.MenuName}</Text>
      </View>);
  }
}

let menuTop = AppConfig.design.height * 0.54;
const styles = StyleSheet.create({
  bgimg: {
    flex: 1,
    alignItems: 'center',
  },
  menu: {
    flex: 1,
    flexDirection: "row",
    marginLeft: getResponsiveValue(30),
    marginRight: getResponsiveValue(30),
    top: getResponsiveValue(menuTop)
  },

  menuRow: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: getResponsiveValue(20),
  },

  menuItem: {
    height: getResponsiveValue(200),
    marginLeft: getResponsiveValue(10),
    marginRight: getResponsiveValue(10),
    borderRadius: getResponsiveValue(20),
    backgroundColor: 'transparent'
  },
  menuItemContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    borderRadius: getResponsiveValue(20),
    backgroundColor: 'transparent',
    // backgroundColor: "green"
  },

  menuItemImg: {
    top: getResponsiveValue(10),
    flex: 1,
    width: getResponsiveValue(80),
    height: getResponsiveValue(80),
    resizeMode: "cover",
    zIndex: 95,
    position: "absolute",
  },

  menuItemText: {
    zIndex: 90,
    top: getResponsiveValue(120),
    width: getResponsiveValue(170),
    height: getResponsiveValue(36),
    lineHeight: getResponsiveValue(36),
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: getResponsiveValue(30),
    borderRadius: getResponsiveValue(10)
  }
});
