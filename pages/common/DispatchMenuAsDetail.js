import React, { Component } from 'react';
import {
  StyleSheet,
  ImageBackground,
} from 'react-native';
import CompanyConfig from '../../config/company.config.js';
import CustomHeader, { HeaderMenu } from '../../components/CustomHeader.js';
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme';
import PropTypes from "prop-types";

import { ProductSolutionList } from '../../pages/productsolution/list.js';
import { ContentList } from '../../pages/appcontent/list.js';
import { ProductList } from '../../pages/product/productlist.js';
import NotFond from '../../components/NotFond.js';

let pageStyles;

export default class DispatchMenuAsDetail extends Component {

  static propTypes = {
    leftButtonImageSource: PropTypes.any,
    leftButtonOnPress: PropTypes.func,
    menu: PropTypes.any
  };

  constructor(prop) {
    super(prop);
    this.state = {
      currentMenu: null
    }
  }
  componentWillUnmount() {

  }

  componentDidMount() {
    let ml = this.getChildrenMenu();
    if (ml != null && ml.length > 0) {
      this.changeMenuItem(ml[0]);
    }
  }
  changeMenuItem(menuItem) {
    if (this.state.currentMenu == null || this.state.currentMenu.SysNo != menuItem.SysNo) {
      if (this.state.currentMenu != null && this.state.currentMenu.LinkCode == menuItem.LinkCode) {
        // 处理如果是不同菜单加载的是同一页面控件，不更新数据的问题
        this.setState({ currentMenu: null }, function () {
          this.setState({ currentMenu: menuItem });
        });
      }
      else {
        this.setState({ currentMenu: menuItem });
      }
    }
  }

  getComponent() {
    let menuItem = this.state.currentMenu;
    if (menuItem == null) return (<NotFond />);
    let component = null;
    let menuCode = new String(menuItem.LinkCode).toLowerCase();
    // {"CategorySysNo":0,"DetailSysNo":98};
    // if (!menuItem.Params) {
    //   menuItem.Params = JSON.parse(menuItem.PathParams);
    // }
    if (menuCode == "productlist") {
      component = (<ProductList menu={menuItem} navigation={this.props.navigation} />);
    }
    else if (menuCode == "productsolutionlist") {
      component = (<ProductSolutionList menu={menuItem} navigation={this.props.navigation} />);
    }
    else if (menuCode == "contentlist") {
      component = (<ContentList menu={menuItem} navigation={this.props.navigation} />);
    }
    // else if (menuCode == "contentdetail") {
    //   component = (<ContentDetail sysno={menuItem.Params.DetailSysNo} navigation={this.props.navigation} />);
    // }
    return component;
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
  render() {
    setStyle();
    let menuList = this.getChildrenMenu();
    let menu = null;
    if (this.props.menu) {
      menu = this.props.menu;
    }
    else {
      const { state } = this.props.navigation;
      menu = state.params.menu;
    }

    let headerTitle = menu.MenuName;
    if (this.state.currentMenu != null) {
      headerTitle += "-" + this.state.currentMenu.MenuName;
    }
    let rightButtonEnabled = menuList != null && menuList.length > 1;
    return (
      <ImageBackground style={pageStyles.bgimg} source={CompanyConfig.CompanyBGImg}>
        <CustomHeader title={headerTitle} moreButton={true} navigation={this.props.navigation}
          leftButtonImageSource={this.props.leftButtonImageSource}
          leftButtonOnPress={this.props.leftButtonOnPress}
          rightButtonEnabled={rightButtonEnabled}
          rightButtonOnPress={() => {
            this.refs["headerMenu"].toggle();
          }} />
        <HeaderMenu ref="headerMenu" menuList={menuList} />
        {
          this.getComponent()
        }
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
    emptyContainer: {
      backgroundColor: CompanyConfig.formatColor(CompanyConfig.AppColor.PopupBackground, "66"),
      width: getResponsiveValue(870),
      height: getResponsiveValue(500),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: getResponsiveValue(20),
    },
    menu: {
      flex: 1,
      flexDirection: "column",
      marginTop: getResponsiveValue(54),
    },
    menuRow: {
      flex: 1,
      flexDirection: "row",
      width: getResponsiveValue(1100),
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      marginBottom: getResponsiveValue(10)
    },
    menuItem: {
      flexDirection: "column",
      width: getResponsiveValue(270),
      height: getResponsiveValue(270),
      marginLeft: getResponsiveValue(5),
      marginRight: getResponsiveValue(5),
      backgroundColor: CompanyConfig.formatColor(CompanyConfig.AppColor.MainFront, "66")
    },
    menuItemContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center"
    },
    menuItemTextContainer: {
      flex: 1,
      flexDirection: "column",
      marginBottom: getResponsiveValue(61),
    },
    menuItemText: {
      flex: 1,
      color: CompanyConfig.AppColor.MainFront,
      textAlign: "center",
      textAlignVertical: "center",
      marginTop: getResponsiveValue(41),
      fontSize: getResponsiveFontSize(32)
    }
  });
}
