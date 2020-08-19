import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  TouchableHighlight,
} from 'react-native';
import { getResponsiveValue } from '../assets/default.theme';
import CompanyConfig from '../config/company.config.js';
import PropTypes from "prop-types";
import SvgUri from '../components/svguri.js';
import RNFetchBlob from 'react-native-fetch-blob';
let Styles = null;
function setStyle() {
  if (Styles != null && !CompanyConfig.isGeneral()) return Styles;

  Styles = StyleSheet.create({
    refreshView: {
      position: "absolute",

      zIndex: 119
    },
    siteStyle: {
      right: getResponsiveValue(20),
      top: getResponsiveValue(20),
    },
    touchView: {
      backgroundColor: CompanyConfig.AppColor.OnPressMain,
      height: getResponsiveValue(80),
      width: getResponsiveValue(80),
      borderRadius: getResponsiveValue(40),
      alignItems: "center",
      justifyContent: "center",
    }

  });

  return Styles;
}
export default class RefreshButton extends Component {
  static propTypes = {
    deleteUri: PropTypes.string,
    priorFunction: PropTypes.func,
    refreshFunction: PropTypes.func,
    style: PropTypes.any
  };

  constructor(prop) {
    super(prop);
    this.state = {
      rotateZ: new Animated.Value(0),
      nu: 1
    }
  }

  refresh() {
    this.startAnimation();
    if (typeof (this.props.priorFunction) == "function") {
      this.props.priorFunction();
    };
    if (this.props.deleteUri != null && this.props.deleteUri != "") {
      let fdStart = this.props.deleteUri.indexOf("http");
      if (fdStart == -1) {
        let path = this.props.deleteUri.substring(7);
        RNFetchBlob.fs.unlink(path);  // 删除本地文件 
      }
    }

    if (typeof (this.props.refreshFunction) == "function") {
      this.props.refreshFunction();
    };
  }
  getStyle() {
    return [{ transform: [{ rotateZ: this.state.rotateZ.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) }] }]
  }
  startAnimation() {
    Animated.parallel([
      Animated.timing(this.state.rotateZ, {
        toValue: this.state.nu * 360,
        duration: 600,
      }),
    ]).start();
    this.state.nu = this.state.nu + 1;
  }

  render() {
    setStyle();
    return (
      <View style={[Styles.refreshView, typeof (this.props.style) != "undefined" && this.props.style != null ? this.props.style : Styles.siteStyle]}>
        <Animated.View style={this.getStyle()}>
          <TouchableHighlight style={Styles.touchView} underlayColor={CompanyConfig.AppColor.OnPressSecondary} onPress={() => this.refresh()}>
            <View><SvgUri width={getResponsiveValue(40)} height={getResponsiveValue(40)} fill={CompanyConfig.AppColor.SecondaryFront} source={"refresh"} />
            </View>
          </TouchableHighlight>
        </Animated.View>
      </View >
    )
  }
}