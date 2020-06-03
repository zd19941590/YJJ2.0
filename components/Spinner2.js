
import React from "react";
import BaseComponent from "./BaseComponent";
import { View, Text, StyleSheet, Platform, ActivityIndicator, NetInfo, Image } from "react-native";
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
export default class Spinner2 extends BaseComponent {
  static propTypes = {
    label: PropTypes.string
  };
  constructor(props) {
    super(props);
    this.count = 0;
    this.state = {
      count: 0,
      label: "加载中...",
      color: "#FFFFFF",
      containerStyle: {},
      type: SpinnerType.custom,
      isOnline: true,
    };
    this.showLoading = this.showLoading.bind(this);
    this.hideLoading = this.hideLoading.bind(this);
  }

  showLoading() {
    let self = this;
    if (self.state.count === 0) {
      self.setState({ count: ++self.state.count });
    }
  }

  hideLoading() {
    let self = this;
    self.setState({ count: 0 });
  }

  render() {
    const visible = this.state.count > 0 && this.state.isOnline;
    if (visible) {
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
    return null;
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