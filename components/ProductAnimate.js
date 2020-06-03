import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Animated,
    ScrollView,
} from 'react-native';
import PropTypes from "prop-types";
import { getResponsiveValue, getResponsiveFontSize } from '../assets/default.theme.js';
let styles = null;
function setStyle() {
    if (styles != null && !CompanyConfig.isGeneral()) return styles;

    styles = StyleSheet.create({
        price: {
            color: "#444"
        }
    });
    return styles;
}
const SPRING_CONFIG = { tension: 1, friction: 3 };//定义动画我们给弹性动画设置了 SPRING_CONFIG 配置，包括 tension（张力）和 friction（摩擦）值，会有一个小小回弹动画。
const SPRING_SPEACE = getResponsiveValue(-450);
export default class ProductAnimate extends Component {
    constructor(prop) {
        productInfo: PropTypes.any;
        onPress: PropTypes.func;
        super(prop);
        this.state = {
            productInfo: {}
        }
    }

    hideAn() {
        let parent = this.props.parent;
        if (this.state.isShowAll) {
            parent.refs["header"].hide();
            this.setState({
                isShowAll: false,
            });
        } else {
            parent.refs["header"].show();
            this.setState({
                isShowAll: true,
            });
        }
    }
    endAnimation() {
        Animated.timing(
            this.state.fadeAnim,
            { toValue: this.state.currentAlpha }
        ).start();
    }
    startAnimation() {
        Animated.sequence([
            Animated.spring(this.state.pan, {
                ...SPRING_CONFIG,
                toValue: { x: this.state.seat == 0 ? SPRING_SPEACE : 0, y: 0 } //animate to top right
            }),
        ]).start();
        this.state.seat = this.state.seat == 0 ? SPRING_SPEACE : 0;
    }
    //产品规格
    getProductLHW(productInfo) {
        if (Number(productInfo.SizeLength) > 0 && Number(productInfo.SizeWidth) > 0 && Number(productInfo.SizeHeight) > 0) {
            return productInfo.SizeLength + '*' + productInfo.SizeWidth + '*' + productInfo.SizeHeight;
        }
    }
    getStyle() {
        return [styles.righViewShowWap, {
            transform: this.state.pan.getTranslateTransform()
        }];
    }
    showOrHiddenCostPrice() {
        if (this.state.showCostPrice) {
            this.setState({ showCostPrice: false });
        } else {
            if (true) {  //预留  判断是否有权限
                this.setState({ showCostPrice: true });
            }
        }
    }
    showCostPrice() {
        global.storage.load(
            {
                key: 'loginState',
                autoSync: false
            }).then(auth => {
                //  console.log(auth);
            }).catch(err => {
                //  console.log(err);
            });
    }
    //获取产品规格属性
    getProductSpecStr() {
        let productService = new ProductService();
        return productService.getProductSpecStr(this.props.model.Properties, this.props.model.GroupProperties);
    }
    render() {
        setStyle();
        let model = this.props.model;
        let bortherObj = this.props.parent;
        let ProductName = '';
        if (this.props.model.ProductName && this.props.model.ProductName.length > 17) {
            ProductName = this.props.model.ProductName.substring(0, 16) + '...';
        } else {
            ProductName = this.props.model.ProductName;
        }
        if (this.state.isShowAll) {
            return (
                <Animated.View style={this.getStyle()}>
                    <View style={styles.AnimatedView}>
                        <View style={styles.right}>
                            <TouchableOpacity activeOpacity={0.8} style={styles.righttextwap} onPress={() => {
                                this.startAnimation();
                            }}>
                                <Text style={styles.righttext} >介绍</Text>
                            </TouchableOpacity>

                        </View>
                        <View style={styles.description}>
                            <View >
                                <View style={styles.ViewBorder}>
                                    <Text style={styles.productName}>{ProductName}</Text>
                                </View>
                                <View style={styles.VenterView}>
                                    {(this.props.model.PromotionPrice == null || this.props.model.PromotionPrice == 0) ? (
                                        <Text onLongPress={() => this.showCostPrice()} style={styles.price}>售价：
                                        {(this.props.model.SalePrice > 0) ? this.props.model.SalePrice : '未设置价格'}</Text>
                                    ) :
                                        (this.props.model.PromotionPrice < this.props.model.SalePrice) ? (
                                            <View>
                                                <Text onLongPress={() => this.showCostPrice()} style={[styles.descriptionText, { textDecorationLine: 'line-through' }]}>售价：
                                                    {(this.props.model.SalePrice > 0) ? this.props.model.SalePrice : '未设置价格'}</Text>
                                                <Text style={styles.descriptionText}>优惠价：{this.props.model.PromotionPrice}</Text>
                                            </View>

                                        ) : (<Text style={styles.descriptionText}>售价：{this.props.model.PromotionPrice}</Text>)}
                                    {(this.state.showCostPrice) ? (
                                        <Text style={styles.descriptionText}>成本：{this.props.model.CostPrice}</Text>
                                    ) : null}
                                    <Text style={styles.descriptionText}>规格：{this.getProductSpecStr()}</Text>
                                    <Text style={styles.descriptionText}>风格：{this.props.model.StyleName}</Text>
                                    <Text style={styles.descriptionText}>系列：{this.props.model.SeriesName}</Text>
                                    <Text style={styles.descriptionText}>材质：{this.props.model.Material}</Text>
                                    <Text style={styles.descriptionText}>卖点：</Text>
                                    <ScrollView
                                        automaticallyAdjustContentInsets={false}
                                        horizontal={true}
                                        horizontal={false}
                                        style={[styles.scrollView, styles.horizontalScrollView]}>
                                        <Text numberOfLines={10} style={styles.miaosuText}>       {this.props.model.ProductNote}</Text>
                                    </ScrollView>
                                </View>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            )
        } else {
            return null;
        }
    }
}