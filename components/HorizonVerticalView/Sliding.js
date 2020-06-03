'use strict';

import PropTypes from 'prop-types'
import React, { PureComponent } from 'react';
import { Platform, View, } from 'react-native';
import PhotoBrowser from '../../node_modules/react-native-photos-browser/RCTPhotoBrowser';
import HorizonVerticalView from '../HorizonVerticalView/HorizonVerticalView.js';
export default class Sliding extends PureComponent {
    constructor() {
        super();
    }
    static propTypes = {
        ...View.propTypes,
        dataList: PropTypes.array,//图片数组
        defaultIndex: PropTypes.number,//默认展示的index
        defaultImg: PropTypes.string,//无图时默认展示的图片
        onPageHorizonScroll: PropTypes.func,//左右滑动
        onVerticalPageScroll: PropTypes.func,//滑动
        onPagePress: PropTypes.func, //点击
        changeCurrent: PropTypes.func,//修改当前页面的图片
        onShow: PropTypes.func,
    }
    oldIndex = 0;
    isAndroid = 'android' === Platform.OS;

    setNativeProps(nativeProps) {
        this.refs["HorizonVerticalView"].setNativeProps(nativeProps);
    }


    changeCurrent(datas) {//修改当前页面的图片
        if (this.isAndroid) {
            this.refs["HorizonVerticalView"].changeCurrent(datas);
        }
        // else{
        //     this.refs["HorizonVerticalView"].changeCurrent(datas);
        // }
    }
    startCarousel(times) {
        this.refs["HorizonVerticalView"].startCarousel(times);
    }
    cancelCarousel() {
        this.refs["HorizonVerticalView"].cancelCarousel();
    }
    render() {
        return this.isAndroid ?
            <HorizonVerticalView
                {...this.props}
                dataList={JSON.stringify({ index: this.props.defaultIndex, dataList: this.props.dataList, limitShowCount: '60' })}
                ref={"HorizonVerticalView"}
            >
            </HorizonVerticalView>
            :
            <PhotoBrowser
                {...this.props}
                onShow={this.props.onShow}
                photos={this.props.dataList}
                currentPosition={{ 'section': this.props.defaultIndex, 'index': 0 }}
                onDidSingleTapAtPosition={() => {
                    this.props.onPagePress();
                }}//单击
                onDidChangePosition={(json) => {
                    if (json) {
                        let section = json.nativeEvent.section;
                        let index = json.nativeEvent.index;
                        let photoURL = json.nativeEvent.photo; // 图片路径
                        if (index != this.oldIndex) {//上下滑动
                            this.props.onVerticalPageScroll(section, index, photoURL)
                        } else {//左右滑动
                            this.props.onPageHorizonScroll(section, photoURL)
                        }
                        this.oldIndex = index;
                    }
                }
                }
                ref={"HorizonVerticalView"}
            >
            </PhotoBrowser>
    }
}
module.exports = Sliding