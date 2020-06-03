import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  FlatList,
  ImageBackground,
  TouchableHighlight, Alert
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import CommonService from '../../services/common.js';
import DataDownloadService from '../../services/datadownload.js';
import Spinner from '../../components/Spinner.js';
import OperationMessage from '../../components/OperationMessage.js';
import envConfig from '../../config/app.config.js';
import CompanyConfig, { CompanyConfigHelper } from '../../config/company.config.js';
import PropTypes from "prop-types";
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme';
import SQLiteBase from '../../services/sqlite.js';
import FileHelper from '../../helpers/fileHelper.config.js'
import SvgUri from '../../components/svguri.js';

/**
 * iOS 卡片控件
 */
var RCTiCarousel = require('../../node_modules/react-native-icarousel/RCTiCarousel.js');
var Cell = RCTiCarousel.Cell;
var Type = RCTiCarousel.Type;

var items = [];

let homeStyles = null;
function setStyle(config) {
  if (config == undefined || config == null) {
    if (homeStyles != null) return homeStyles;
    config = CompanyConfig;
  }
  homeStyles = StyleSheet.create({

    topbar: {
      position: "absolute",
      right: getResponsiveValue(48),
      top: getResponsiveValue(15),
      height: getResponsiveValue(80),
      width: getResponsiveValue(250),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      backgroundColor: 'gray'
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

    /**
     * Muen List Styles
     */
    menuContainer: {
      width: getResponsiveValue(1334),
      height: getResponsiveValue(550),
      bottom: getResponsiveValue(-50),
    },
    carousel: {
      width: getResponsiveValue(1334),
      height: getResponsiveValue(550),
    },
    cell: {
      alignItems: 'center',
      width: getResponsiveValue(350),
      height: getResponsiveValue(500),
      borderRadius: getResponsiveValue(10),
      overflow: 'hidden'
    },
    image: {
      width: getResponsiveValue(350),
      height: getResponsiveValue(500)
    },
    text: {
      zIndex: 1,
      color: 'black',
      fontSize: getResponsiveFontSize(35),
      bottom: getResponsiveValue(80),
      backgroundColor: "transparent"
    },
    cellShadowView: {
      backgroundColor: 'black',
      width: getResponsiveValue(350),
      height: getResponsiveValue(500),
      zIndex: 10,
      opacity: 0.4,
    }
  });
  return homeStyles;
}

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

export class CellMenuItem extends Component {

  static propTypes = {
    menu: PropTypes.any,
  };
  _root;
  constructor(props) {
    super(props);
    this.state = {
      selected: false
    };
  }

  setMenuItemSelected(selected) {
    this.setState({
      selected: selected
    })
  }

  shouldNavigationAtIndex(menu) {
    //  console.log('🔶' + muen);
    navigator(muen.LinkCode);
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
    if (menu.MouseOverImage != null && menu.MouseOverImage != "") {
      if (typeof (menu.DefaultImageUri) == "undefined" || menu.DefaultImageUri == null) {
        alist.push(FileHelper.fetchFile(menu.MouseOverImage));
      }
    }
    if (alist.length > 0) {
      Promise.all(alist).then(function (r) {
        let i = 0;
        if (menu.DefaultImage != null && menu.DefaultImage != "") {
          menu.DefaultImageUri = r[i];
          i = i + 1;
        }
        if (menu.MouseOverImage != null && menu.MouseOverImage != "") {
          menu.MouseOverImageUri = r[i];
        }
        self.forceUpdate();
      });
    }
  }

  render() {
    setStyle();
    let menuItem = this.props.menu;
    let iconName = "home";
    let opacity = 0.3;
    if (this.state.selected) {
      opacity = 0;
    }
    if (menuItem.DefaultImageUri) {
      iconName = menuItem.DefaultImageUri;
    }

    if (this.state.selected && menuItem.MouseOverImageUri) {
      iconName = menuItem.MouseOverImageUri;
    }

    return (
      <Cell style={homeStyles.cell} title={'标题'} backgroundImageURL={'test://www.baidu.com'} >
        <Image style={homeStyles.image} source={{ uri: 'http://gl.lixiantuce.com/companyimages/6fa5fa9f-aced-4453-9fb5-db95fbfbb258/icon/cb71940d-1394-46ea-afb0-1ea43f5aa2f4.png' }}>
          <View ref='RefCellShadowViewTag' style={homeStyles.cellShadowView} opacity={opacity}></View>
        </Image>
        <Text style={homeStyles.text}> {menuItem.MenuName} </Text>
      </Cell>
    );
    // iconName MenuName
  }
}

export default class HomeB extends Component {
  static propTypes = {
    MenuList: PropTypes.array,
    navigation: PropTypes.any
  };

  dbService = null;
  constructor(prop) {
    super(prop);
    this.state = {
      MenuList: []
    };
    this.renderMenuList = this.renderMenuList.bind(this);
  }

  componentDidMount() {
    let self = this;
    CompanyConfigHelper.ready(function (companyConfig) {
      setStyle(companyConfig);
      self.forceUpdate();
    }, error => {
    });
  }
  selectedMenuItemIndex = -1;
  renderMenuList(menuList) {
    if (menuList == null || menuList.length == 0) return null;
    const { navigate } = this.props.navigation;
    let thisObj = this;

    //  console.log(menuList);
    let self = this; this.refs
    return (
      <View style={homeStyles.menuContainer}>
        <RCTiCarousel
          ref="RCTiCarouselTargetTag"
          type={Type.Rotary}
          style={homeStyles.carousel}
          optionValueConfigurations={{
            "iCarouselOptionWrap": false,
            "iCarouselOptionCount": 7 * 1.5,
            "iCarouselOptionArc": 6.28 * 0.45,
            "iCarouselOptionRadius": 293 * 1.5,
            "iCarouselOptionSpacing": 0.5
          }}
          onCurrentItemIndexDidChange={(body) => {
            if (body.nativeEvent.index < 0) return;

            if (self.selectedMenuItemIndex >= 0 && self.selectedMenuItemIndex != body.nativeEvent.index) {
              self.refs['CellMenuItemTag' + self.selectedMenuItemIndex].setMenuItemSelected(false);
            }
            self.selectedMenuItemIndex = body.nativeEvent.index;
            self.refs['CellMenuItemTag' + self.selectedMenuItemIndex].setMenuItemSelected(true);
          }}
          onDidSelectItemAtIndex={(body) => {
            var index = body.nativeEvent.index;
            self.refs['CellMenuItemTag' + index].shouldNavigationAtIndex(menuList[index]);
          }}
        >
          {menuList.map((menuItem, index, list) => {
            return <CellMenuItem menu={menuItem} ref={'CellMenuItemTag' + index} key={menuItem.SysNo} ></CellMenuItem>;
          })}
        </RCTiCarousel>
      </View>
    );
  }

  render() {
    const { navigate } = this.props.navigation;
    setStyle();
    let menuList = this.props.MenuList;
    let sizeWidth = getResponsiveValue(42);

    return (
      <View style={homeStyles.home} >
        <View style={[homeStyles.topbar]} >

          <TouchableHighlight
            style={[homeStyles.topbarItem]}
            onPress={() => navigate("MessageCenter")}
            activeOpacity={0.8}
            underlayColor={CompanyConfig.StyleColor.HomePageA.MenuItemPressBackground}
          >
            <View>
              <SvgUri width={sizeWidth} height={sizeWidth} fill={CompanyConfig.AppColor.SecondaryFront} source="message" />
            </View>
          </TouchableHighlight>

          {this.state.hasNotice ? <View style={homeStyles.notice}></View> : <View />}

          <TouchableHighlight style={homeStyles.topbarItem} onPress={() => {
            storage.load({
              key: 'loginState',
              autoSync: false
            }).then(auth => {
              if (auth != null) {
                navigate("CustomerIndex");
              } else {
                navigate("Login");
              }
            }).catch(err => {
              navigate("Login");
            });
          }} activeOpacity={0.8} underlayColor={CompanyConfig.StyleColor.HomePageA.MenuItemPressBackground} >
            <View >
              <SvgUri width={sizeWidth} height={sizeWidth} fill={CompanyConfig.AppColor.SecondaryFront} source="user" />
            </View>
          </TouchableHighlight>

          <TouchableHighlight style={[homeStyles.topbarItem, homeStyles.more]} onPress={() => navigate("More")} activeOpacity={0.8} underlayColor={CompanyConfig.StyleColor.HomePageA.MenuItemPressBackground} >
            <View >
              <SvgUri width={sizeWidth} height={sizeWidth} fill={CompanyConfig.AppColor.SecondaryFront} source="homemore" />
            </View>
          </TouchableHighlight>

        </View>
        {this.renderMenuList(menuList)}
      </View>
    );
  }
}
