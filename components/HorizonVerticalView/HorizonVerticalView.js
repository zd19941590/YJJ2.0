/**
 * Created by lijie on 16/7/13.
 */
'use strict';

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { requireNativeComponent, View, DeviceEventEmitter, NativeModules, UIManager } from 'react-native';
const ReactNative = require('ReactNative');
// var  HorizonVerticalViewEventModule = UIManager.RCTAndroidHorizonVerticalView;
var iface = {
  name: 'HorizonVerticalView',
  propTypes: {
    ...View.propTypes,
    dataList: PropTypes.string,
    defaultIndex: PropTypes.number,
    defaultImg: PropTypes.string
  },
};

var RCTHorizonVerticalView = requireNativeComponent('RCTAndroidHorizonVerticalView', iface);
export default class HorizonVerticalView extends Component {
  ontHorizonPageScroll: EmitterSubscription;
  onVerticalPageScroll: EmitterSubscription;
  onPagePress: EmitterSubscription;
  constructor() {
    super();
    let self = this;
  }
  static propTypes = {
    ...View.propTypes,
    data: PropTypes.string,
    defaultIndex: PropTypes.number,
    defaultImg: PropTypes.string,
    onPageHorizonScroll: PropTypes.func,
    onVerticalPageScroll: PropTypes.func,
    onPagePress: PropTypes.func,
  }
  getViewHandle = () => {
    return ReactNative.findNodeHandle(this.refs["RCTHorizonVerticalView"]);
  };
  //componentDidMount componentWillMount
  componentDidMount() {
    //横向滑动
    this.ontHorizonPageScroll = DeviceEventEmitter.addListener('ontHorizonPageScroll', (e) => {
      if (this.props.onPageHorizonScroll) {
        this.props.onPageHorizonScroll(e.HorizonIndex, e.ImagePath);
      }
    });
    //纵向滑动
    this.onVerticalPageScroll = DeviceEventEmitter.addListener('onVerticalPageScroll', (e) => {
      if (this.props.onVerticalPageScroll) {
        this.props.onVerticalPageScroll(e.HorizonIndex, e.verticalIndex, e.ImagePath);
      }
    });
    this.onPagePress = DeviceEventEmitter.addListener('onPagePress', (e) => {
      //e是原生传过来的参数  
      if (this.props.onPagePress && typeof (this.props.onPagePress) == 'function') {
        this.props.onPagePress();
      }
    });
  }
  removeEvent() {

  }
  componentWillUnmount() {
    this.ontHorizonPageScroll.remove();
    this.onVerticalPageScroll.remove();
    this.onPagePress.remove();
  }
  changeCurrent(data) {
    // this.RCTAndroidHorizonVerticalView.Commands.changeCurrent(data);
    UIManager.dispatchViewManagerCommand(
      this.getViewHandle(),
      UIManager.RCTAndroidHorizonVerticalView.Commands.changeCurrent,
      data,
    );
  }
  startCarousel(times) {//开始播放幻灯片
    UIManager.dispatchViewManagerCommand(
      this.getViewHandle(),
      UIManager.RCTAndroidHorizonVerticalView.Commands.AotuScroll,
      [times.toString()],
    );
  }
  cancelCarousel() {//停止幻灯片
    UIManager.dispatchViewManagerCommand(
      this.getViewHandle(),
      UIManager.RCTAndroidHorizonVerticalView.Commands.StopScroll,
      null,
    );
  }
  componentWillUnmount() {
    this.ontHorizonPageScroll.remove();
    this.onVerticalPageScroll.remove();
    this.onPagePress.remove();
    this.cancelCarousel();
  }
  render() {
    return <RCTHorizonVerticalView
      ref={"RCTHorizonVerticalView"}
      {...this.props}
    >
      {/* <Indicator
            {...pager} 
           /> */}
    </RCTHorizonVerticalView>
  }
}
module.exports = HorizonVerticalView