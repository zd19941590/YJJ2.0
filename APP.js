/**
 * Created by jean.h.ma on 19/05/2017.
 */
import React, { Component } from "react";
// import {
//   Platform,
//   NativeAppEventEmitter
// } from "react-native";
import AppNavigator from './config/route.config';
// import AppConfig from './config/app.config.js';
// import BaiduPush from 'react-native-baidu-push';
// import CommonService from './services/common';

export default class App extends Component {
  /**
   * bind company ID with baiduyun
   * @param {*} channelID channelID
   */
  // _bindCompanyChannel(channelID) {
  //   let common = new CommonService();
  //   common.BindCompanyChannel(channelID).then((result) => {
  //   })
  // }

  // componentDidMount() {
  //   // Disable yellowbox here, you can change is here.
  //   console.disableYellowBox = true

  //   BaiduPush.fetchLastClickedNotification((data) => {
  //     if (data) {
  //       if (Platform.OS === "android") {
  //       }
  //     }
  //   })
  //   //百度云推送 - 注册
  //   if (Platform.OS === "android") {
  //     BaiduPush.listen("onBind", (errorCode, appid, userId, channelId, requestId) => {

  //       global.storage.save({
  //         key: 'BaiduPushChannelID',
  //         data: channelId,
  //         expires: (1000 * 3600 * 24)
  //       });
  //       this._bindCompanyChannel(channelId);
  //     });
  //     BaiduPush.listen("onNotificationArrived", (title, description, customContentString) => {
  //       //TODO do notification message
  //     });
  //   }
  //   else if (Platform.OS === "ios") {
  //     NativeAppEventEmitter.addListener(
  //       'OnReceivedRemoteNotification',
  //       (data) => {
  //       }
  //     )
  //     NativeAppEventEmitter.addListener('OnBPushRegistered', (data) => {
  //       if (data.channelID) {
  //         global.storage.save({
  //           key: 'BaiduPushChannelID',
  //           data: data.channelID,
  //           expires: (1000 * 3600 * 24)
  //         });
  //         this._bindCompanyChannel(data.channelID);
  //       }
  //     })
  //   }
  //   BaiduPush.startPushWork(AppConfig.baiduPushAPIKey);
  // }

  // componentWillUnmount() {
  //   NativeAppEventEmitter.removeAllListeners();
  // }
  render() {
    return (
      <AppNavigator />
    );
  }

}
