/**
 * Created by jean.h.ma on 19/05/2017.
 */
import React from "react";
import BaseComponent from "./BaseComponent";
import {
  View, Text, StyleSheet, Platform, ActivityIndicator, NetInfo, TouchableHighlight,

} from "react-native";
import { Colors } from "../assets/default.theme";
import PropTypes from "prop-types";
import { IOS_HEADER_HEIGHT, IOS_STATUS_BAR_HEIGHT, ANDROID_HEADER_HEIGHT } from "./LinearHeader";

const top = Platform.select({
  ios: IOS_HEADER_HEIGHT + IOS_STATUS_BAR_HEIGHT,
  android: ANDROID_HEADER_HEIGHT
});

export const SpinnerType = {
  normal: 1,
  custom: 2
};

let _toggle;
let togglelist = [];

export function toggleSpinner(value: Boolean,
  containerStyle: any = {},
  color: String = "#FFFFFF",
  label: ?String = "加载中...",//strings['Loading'],
  type: SpinnerType = SpinnerType.custom) {
  if (togglelist.length > 0) {
    let tt = togglelist[togglelist.length - 1];
    tt(value, containerStyle, color, label, type);
  }
}

let timer = null;

export default class Spinner extends BaseComponent {
  static propTypes = {
    label: PropTypes.string,
    IsCanTouch: PropTypes.bool
  };
  constructor(props) {
    super(props);
    this.count = 0;
    this.state = {
      count: 0,
      label: null,
      color: "#FFFFFF",
      containerStyle: {},
      type: Spinner.custom,
      isOnline: true,
      ShowTouchHide: false
    };
    _toggle = (value: Boolean, containerStyle: any, color: String, label: ?String, type: SpinnerType) => {
      let tlable = label;
      if (this.props.label) {
        tlable = this.props.label;
      }
      if (value) {
        this.count += 1;
        if (this.count === 1) {
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          this.updateState({
            count: { $set: 1 },
            label: { $set: tlable },
            color: { $set: color },
            containerStyle: { $set: containerStyle },
            type: { $set: type }
          });
        }
      }
      else {
        if (this.state.count > 0) {
          this.count -= 1;
          if (this.count === 0) {
            timer = setTimeout(() => {
              this.updateState({
                count: { $set: 0 }
              });
            }, 500);
          }
          if (this.count < 0) {
            this.count = 0;
          }
        }
      }
    };
    togglelist.push(_toggle);
  }
  hide() {
    this.setState({
      ShowTouchHide: false,
      count: 0
    })
  }

  render() {
    const visible = this.state.count > 0 && this.state.isOnline;
    let canTouch = false;
    if (this.props.IsCanTouch != null) {
      canTouch = this.props.IsCanTouch
    }
    if (visible) {
      if (this.state.ShowTouchHide && canTouch) {
        return (
          <TouchableHighlight style={[style.container2]} onPress={() => this.hide()} underlayColor={"#ffffff00"}>
            <View style={{ backgroundColor: "rgba(0,0,0,0.5)", width: 100, height: 100, borderRadius: 20, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator color={this.state.color}></ActivityIndicator>
              {this.state.label &&
                <Text style={[Colors.$FFFFFF, style.indicatorText]}>{this.state.label}</Text>}
            </View>
          </TouchableHighlight>
        );
      } else {
        if (canTouch) {
          setTimeout(() => {
            this.setState({
              ShowTouchHide: true
            })
          }, 5000);
        }
        return (
          <View
            style={[style.container2]}>
            <View style={{ backgroundColor: "rgba(0,0,0,0.5)", width: 100, height: 100, borderRadius: 20, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator color={this.state.color}></ActivityIndicator>
              {this.state.label &&
                <Text style={[Colors.$FFFFFF, style.indicatorText]}>{this.state.label}</Text>}
            </View>
          </View >
        );
      }

    }
    return null;
  }
  componentWillUnmount() {
    if (togglelist.length > 0) {
      togglelist.pop();
    }
  }
  componentDidMount() {
    super.componentDidMount();
    NetInfo.getConnectionInfo().done((reach) => {
      const isConnected = !(/^none$/i.test(reach));
      this.updateState({
        isOnline: { $set: isConnected }
      });
    });
  }
}

const style = StyleSheet.create({
  container: {
    position: "absolute",
    top: top,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EEEEEE",
  },
  container2: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    zIndex: 10000
  },
  indicatorView: {
    width: 100,
    height: 100,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  indicatorText: {
    backgroundColor: "transparent"
  }
});
