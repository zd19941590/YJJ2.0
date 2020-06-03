import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    Image,
    View,
    FlatList,
    TouchableOpacity,
    TouchableHighlight,
} from 'react-native';

import PropTypes from "prop-types";
import CompanyConfig from '../../config/company.config.js';
import AppConfig from '../../config/app.config.js';

import SimpleSearch from '../../components/Search.js';
import NumberChange from '../../components/NumberChange.js';
import SvgUri from '../../components/svguri.js';
import PurchaseService from '../../services/purchase.js';
import FileHelper from '../../helpers/fileHelper.config.js';
import NotFond from '../../components/NotFond.js';
import Dimensions from 'Dimensions';
import { getResponsiveValue, getResponsiveFontSize, FontSize, Colors, BgColors } from "../../assets/default.theme";
import { StyleConfig } from '../../config/style.config.js';
const dismissKeyboard = require('dismissKeyboard');

let pageStyles = null;

function setStyle() {
    if (pageStyles != null && !CompanyConfig.isGeneral()) return pageStyles;

    pageStyles = StyleSheet.create({

        baseView: {
            flex: 1,
            backgroundColor: StyleConfig.modelBackground,
            // width: getResponsiveValue(AppConfig.design.width),
            //height: getResponsiveValue(AppConfig.design.height),
            // backgroundColor: '#3E566E',
            position: 'absolute',
            zIndex: 20,
            width: getResponsiveValue(AppConfig.design.width),
            height: getResponsiveValue(AppConfig.design.height)
        },

        searchBackView: {
            width: getResponsiveValue(AppConfig.design.width),
            height: getResponsiveValue(88),
            backgroundColor: StyleConfig.modelBackground,
        },

        productsBgView: {
            alignItems: 'center',
            justifyContent: 'flex-start',

            marginTop: getResponsiveValue(20),

            // height: Dimensions.get('window').height - getResponsiveValue(120),
        },


        productsView: {
            width: getResponsiveValue(1294),
            // borderRadius: 10,
            // backgroundColor: CompanyConfig.formatColor(CompanyConfig.AppColor.Secondary, "20"),
            //backgroundColor: 'gray',

            //height: getResponsiveValue(AppConfig.design.width) - getResponsiveValue(54),
        },

        singleProductBgView: {
            width: getResponsiveValue(1294),
            height: getResponsiveValue(186),

            alignItems: 'center',
            justifyContent: 'center',
            // backgroundColor: 'red'
            // backgroundColor: CompanyConfig.formatColor(CompanyConfig.AppColor.Secondary, "B3"),
            backgroundColor: StyleConfig.Secondary
        },

        singleProductDataRow: {
            width: getResponsiveValue(1254),
            height: getResponsiveValue(126),
            flexDirection: 'row',
        },

        singleProductImage: {
            width: getResponsiveValue(180),
            height: getResponsiveValue(126),
            borderRadius: getResponsiveValue(12),

            // alignItems: 'flex-end',
            // justifyContent: 'flex-end',
        },

        singleProductUnderLine: {

            height: getResponsiveValue(1),
            backgroundColor: StyleConfig.PopupFront,
        },
        singleProductName: {
            // marginTop: getResponsiveValue(17),
            color: StyleConfig.PopupFront,
            fontSize: getResponsiveFontSize(32),
            // height: getResponsiveValue(32),
            backgroundColor: 'transparent',

            //设置文字在Text中垂直居中
            textAlignVertical: 'center',
            includeFontPadding: false,
        },

        singleProductPrice: {
            // marginTop: getResponsiveValue(17),
            color: CompanyConfig.formatColor(StyleConfig.PopupFront, "80"),
            fontSize: getResponsiveFontSize(28),
            // height: getResponsiveValue(32),
            // backgroundColor: 'red',

            marginLeft: getResponsiveValue(20),

            //设置文字在Text中垂直居中
            textAlignVertical: 'center',
            includeFontPadding: false,
            backgroundColor: 'transparent',


        },

        singleProductPrice2: {
            // marginTop: getResponsiveValue(17),
            color: CompanyConfig.formatColor(StyleConfig.FocalFront, "80"),
            fontSize: getResponsiveFontSize(28),
            // height: getResponsiveValue(32),
            // backgroundColor: 'red',

            // marginLeft: getResponsiveValue(20),

            marginTop: getResponsiveValue(8),


            //设置文字在Text中垂直居中
            textAlignVertical: 'center',
            includeFontPadding: false,
            backgroundColor: 'transparent',


        },

        singleProductCenterView: {
            marginLeft: getResponsiveValue(22),
            width: getResponsiveValue(655),
            // backgroundColor: 'gray',
        },

        singleProductDetailsRow: {
            width: getResponsiveValue(655),
            // height: getResponsiveValue(38),
            marginTop: getResponsiveValue(5),
            flexDirection: 'row',
            // backgroundColor: 'gray',
        },
        singleProductDetailsItem: {
            borderRadius: getResponsiveValue(19),
            backgroundColor: CompanyConfig.formatColor(StyleConfig.DescriptionFront, "33"),
            // height: getResponsiveValue(36),
            justifyContent: 'center',
        },
        singleProductDetailsItemText: {
            fontSize: getResponsiveFontSize(20),
            color: StyleConfig.FocalFront,
            // marginTop: getResponsiveValue(7),
            marginLeft: getResponsiveValue(20),
            marginRight: getResponsiveValue(20),
            marginTop: getResponsiveValue(5),
            marginBottom: getResponsiveValue(5),
            // marginBottom: getResponsiveValue(7),
            // height: getResponsiveValue(23),

            //设置文字在Text中垂直居中
            textAlignVertical: 'center',
            includeFontPadding: false,
            backgroundColor: 'transparent',
        },

        singleProductNumberBlock: {
            height: getResponsiveValue(126),
            justifyContent: 'center',
        },

        singleProductNumberRow: {
            width: getResponsiveValue(383),
            height: getResponsiveValue(52),
            flexDirection: 'row',
            alignItems: 'center',
        },

        singleProductNumberText: {
            width: getResponsiveValue(69),
            height: getResponsiveValue(29),
            textAlignVertical: 'center',
            includeFontPadding: false,
            color: StyleConfig.PopupFront,
            fontSize: getResponsiveFontSize(23),
            backgroundColor: 'transparent',
        },

        singleProductAddButton: {
            width: getResponsiveValue(52),
            height: getResponsiveValue(52),
            marginLeft: getResponsiveValue(40),
            backgroundColor: StyleConfig.Main,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
        },

        singleProductTypeWapNew: {
            position: 'absolute',
            // width: getResponsiveValue(88),
            height: getResponsiveValue(34),
            backgroundColor: '#00000040',
            zIndex: 3,
            // top: getResponsiveValue(8),
            right: getResponsiveValue(6),
            bottom: getResponsiveValue(6),
            justifyContent: 'space-around',
            /** 控制以下三个属性裁剪圆角边框 */
            borderRadius: getResponsiveValue(15),
            borderColor: 'transparent',
            overflow: 'hidden'
        },

        singleProductTypeText: {
            color: "white",
            fontSize: getResponsiveFontSize(20),
            // includeFontPadding: false,
            textAlign: 'center',
            textAlignVertical: 'center',
            backgroundColor: 'transparent',
            marginLeft: getResponsiveValue(15),
            marginRight: getResponsiveValue(15),
        },


        //#region ChoiceSpecProductStyle

        choiceBase: {
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
            // flex: 1,
            backgroundColor: 'transparent',
            flexDirection: 'row',
            zIndex: 9,
        },

        choiceBackView: {
            width: getResponsiveValue(185),
            height: Dimensions.get('window').height,
            backgroundColor: 'transparent',

            alignItems: 'flex-end',
        },

        choiceBackButton: {
            width: getResponsiveValue(46),
            height: getResponsiveValue(46),
            borderRadius: getResponsiveValue(23),
            backgroundColor: '#ffffff4d',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: getResponsiveValue(19),
            marginTop: getResponsiveValue(10)
        },

        choiceContent: {
            width: getResponsiveValue(1149),
            height: Dimensions.get('window').height,
            backgroundColor: 'white',

            borderTopLeftRadius: getResponsiveValue(10),
            borderBottomLeftRadius: getResponsiveValue(10),

        },

        choiceTitle: {
            width: getResponsiveValue(187),
            height: getResponsiveValue(46),
            marginLeft: getResponsiveValue(39),
            marginTop: getResponsiveValue(29),
            fontSize: getResponsiveValue(36),
            color: "#383838",
            // backgroundColor: 'gray',
            textAlignVertical: 'center',
            includeFontPadding: false,
        },

        choiceProductInfoRow: {
            width: Dimensions.get('window').width,
            height: getResponsiveValue(110),
            flexDirection: 'row',
            marginTop: getResponsiveValue(49),
            // marginLeft: getResponsiveValue(39),
            // marginTop: getResponsiveValue(29),
        },

        choiceProductImage: {
            width: getResponsiveValue(160),
            height: getResponsiveValue(110),
            borderRadius: getResponsiveValue(10),
            // marginLeft: getResponsiveValue(40),
            marginLeft: getResponsiveValue(39),
            // marginTop: getResponsiveValue(29),
        },

        choiceProductInfo: {
            width: getResponsiveValue(594),
            marginLeft: getResponsiveValue(31),
        },

        choiceProductName: {
            width: getResponsiveValue(339),
            height: getResponsiveValue(28),
            marginTop: getResponsiveValue(11),
            textAlignVertical: 'center',
            includeFontPadding: false,
            fontSize: getResponsiveFontSize(24),
            color: '#383838',
        },

        choiceProductPrice: {
            height: getResponsiveValue(30),
            flexDirection: 'row',
            marginTop: getResponsiveValue(26),
        },

        choicePriceNameText: {
            color: '#383838',
            fontSize: getResponsiveFontSize(22),
            textAlignVertical: 'center',
            includeFontPadding: false,
        },

        choicePriceValue: {
            color: 'red',
            fontSize: getResponsiveFontSize(22),
            textAlignVertical: 'center',
            includeFontPadding: false,
        },

        choiceLineView: {
            height: getResponsiveValue(20),
            backgroundColor: '#eeeeee',
            marginTop: getResponsiveValue(30),
        },

        choiceCarButton: {
            width: getResponsiveValue(280),
            height: getResponsiveValue(70),
            backgroundColor: '#0071e0',
            borderRadius: getResponsiveValue(34),
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        },

        choiceCarText: {
            width: getResponsiveValue(138),
            height: getResponsiveValue(27),
            textAlignVertical: 'center',
            includeFontPadding: false,
            color: '#ffffff',
            fontSize: getResponsiveFontSize(21),
        },

        choiceProductCount: {
            position: "absolute",
            zIndex: 15,
            width: getResponsiveValue(40),
            height: getResponsiveValue(30),
            right: getResponsiveValue(30),
            top: getResponsiveValue(5),
            textAlignVertical: 'center',
            includeFontPadding: false,
            color: '#ffffff',
            fontSize: getResponsiveFontSize(21),
            backgroundColor: 'red',
            borderRadius: getResponsiveValue(15),
            textAlign: 'center',

        }

        //#endregion

    });

    return pageStyles;
}


export default class SearchAddProducts extends Component {
    PageIndex = 0;
    SearchText = '';
    GetAllData = false;   //是否已查询出所有商品数据
    DefaultPageSize = 20;
    IsMounted = false;
    NewPurchaseOrder = {};
    SelectProducts = [];
    static propTypes = {
        addProductOver: PropTypes.func,   //添加商品结束
    }
    constructor(prop) {
        super(prop);
        this.state = {
            ProductList: [],
            GetDataOver: false,
            // ProductCount: 0,
            NoData: false,
            Visible: false,

        }
    }

    UNSAFE_componentWillMount() {
        this.IsMounted = true;
    }
    componentDidMount() {
        this.appendData(0);

        // this.initProductNumber();
    }
    componentWillUnmount() {
        this.IsMounted = false;
    }
    show(products) {
        var self = this;
        this.SelectProducts = products;
        self.setState({ Visible: true });
        setTimeout(() => {
            self.refs["simpleSearch"].initRightNumber(self.countProductNum(products));
        }, 500);
    }
    hide() {
        this.setState({ Visible: false });
    }

    appendData = (pageIndex) => {
        let thisObj = this;
        let purchaseService = new PurchaseService();

        thisObj.setState({ NoData: false });

        if (typeof (pageIndex) != 'undefined' && pageIndex != null && pageIndex > -1) {
            this.PageIndex = pageIndex;
        }


        let searchPageIndex = this.PageIndex;
        thisObj.PageIndex = thisObj.GetAllData ? thisObj.PageIndex : this.PageIndex + 1;

        if (!thisObj.GetAllData) {
            purchaseService.QueryProductListData(searchPageIndex, this.DefaultPageSize, this.SearchText, (data) => {
                // if (typeof (data) == 'undefined' || data == null || data.length == 0) {
                //     thisObj.GetAllData = true;
                // }
                //  console.log('searchadd');
                //    console.log(data);


                var newProductList = thisObj.state.ProductList.concat(data);
                if (thisObj.IsMounted) {
                    thisObj.setState({
                        ProductList: newProductList,
                        GetDataOver: true
                    });

                    if (newProductList != null && newProductList.length == 0) {
                        thisObj.setState({ NoData: true });
                    }

                }
            });

        }

    }

    onEndReached = () => {
        this.appendData();
    }

    onEnd() {
        this.appendData();
    }

    onSearch(searchText) {
        dismissKeyboard();
        // if (searchText == null || searchText == '')
        //     return;

        this.SearchText = searchText;

        if (this.IsMounted) {
            this.state.ProductList = [];
            this.setState({ GetDataOver: false });
        }

        this.GetAllData = false;
        this.appendData(0);
    }

    addToCar(product, number) {
        var selectProducts = this.SelectProducts;
        let existsProduct = false;
        for (var i = 0; i < selectProducts.length; i++) {
            var currentProduct = selectProducts[i];
            if (currentProduct.SysNo == product.SysNo) {
                currentProduct.Quantity += number;
                existsProduct = true;
            }
        }
        if (!existsProduct) {
            product["Quantity"] = number;
            selectProducts.push(product);
        }
        this.refs["simpleSearch"].initRightNumber(this.countProductNum(selectProducts));
        this.SelectProducts = selectProducts;
    }

    onRightButtonClick() {
        if (typeof (this.props.addProductOver) == 'function') {
            this.props.addProductOver(this.SelectProducts);
        }
        this.hide();
    }

    onBack() {
        if (typeof (this.props.addProductOver) == 'function') {
            this.props.addProductOver(this.SelectProducts);
        }
        this.hide();
    }

    countProductNum(products) {
        var count = 0;
        products.forEach((product, index) => {
            if (product.Quantity) {
                count += product.Quantity;
            }
        });
        return count;
    }


    render() {
        setStyle();
        if (!this.state.Visible) {
            return null;
        }


        return (
            <View style={pageStyles.baseView}>
                <ChoiceSpecProduct ref="choiceProduct" />
                <View style={pageStyles.searchBackView}>
                    <SimpleSearch ref='simpleSearch' onSearch={(searchText) => this.onSearch(searchText)}
                        onRightButtonClick={() => { this.onRightButtonClick(); }} onBack={() => { this.onBack() }} placeholder="输入名称,型号,风格,系列,材质" />
                </View>
                <View style={pageStyles.productsBgView}>
                    <View style={pageStyles.productsView}>
                        <FlatList
                            key={'shows'}
                            removeClippedSubviews={true}
                            height={Dimensions.get('window').height - getResponsiveValue(120)}
                            removeClippedSubviews={true}
                            numColumns={1}
                            data={this.state.ProductList}
                            keyExtractor={(item, index) => "p" + index}
                            renderItem={({ item, index }) => (
                                <SearchResultProductItem key={"productItem" + index} product={item} index={index} isNotBottomItem={(index != this.state.ProductList.length - 1) ? true : false}
                                    addToCar={(newPurchaseOrder, number) => { this.addToCar(newPurchaseOrder, number) }} navigation={this.props.navigation} />
                            )}
                            onEndReached={this.onEnd.bind(this)}
                            onEndReachedThreshold='0.1'
                            ListEmptyComponent={(
                                (this.state.NoData ? (<NotFond style={{ height: Dimensions.get('window').height - getResponsiveValue(120) }} />) : null)
                            )}
                        />
                    </View>
                </View>
            </View>
        );
    }
}

export class SearchResultProductItem extends Component {
    IsMounted = false;
    Product = null;
    Number = 1;
    LoadImageFile = false;
    static propTypes = {
        addToCar: PropTypes.func,   //添加商品到购物车
        index: PropTypes.any,  //Index
        isNotBottomItem: PropTypes.bool,   //非列表最后一项
        navigation: PropTypes.any,
    }
    constructor(prop) {
        super(prop);
        this.state = {
            ProductImage: AppConfig.defaultNoImage
        }

        setStyle();
    }

    UNSAFE_componentWillMount() {
        this.IsMounted = true;
        this.Product = this.props.product;

    }
    componentWillUnmount() {
        this.IsMounted = false;
    }

    getImageUrl() {
        if (this.IsMounted) {
            let thisObj = this;
            var imagePath = this.props.product.DefaultImage;
            if (imagePath == null || imagePath == "") {
                return;
            } else {
                FileHelper.fetchFile(imagePath, 200).then((uri) => {
                    if (this.IsMounted) {
                        if (uri != null && uri != '') {
                            thisObj.setState({ ProductImage: { uri: uri } });
                        } else {
                            thisObj.setState({ ProductImage: AppConfig.backgrandImage });
                        }
                    }
                }).catch(function (error) {
                });
            }
        }
        this.LoadImageFile = true;
    }

    getProductDetailsArray() {
        var array = [];
        if (this.Product != null) {
            if (typeof (this.Product.Spec) == 'string') {
                return [this.Product.Spec];
            }

            var spec = this.Product.Spec;
            if (spec != null && spec != "") {
                if (spec.indexOf(',') > -1) {
                    let specsArray = spec.split(',');
                    for (let i = 0; i < specsArray.length; i++) {
                        let specArray = specsArray[i].split(':');
                        array.push({ Name: specArray[0], Value: specArray[1] });
                    }

                } else {
                    let specArray = spec.split(':');
                    array.push({ Name: specArray[0], Value: specArray[1] });
                }
            }

            if (array.length > 5) {
                array.splice(5, array.length - 5);
            }
        }
        // return array;

        var spec = '';
        array.forEach(function (item) {
            spec += item.Name + ":" + item.Value + ",";
        });

        if (spec.length > 2) {
            spec = spec.substring(0, spec.length - 1);
        }

        if (spec.length > 70) {
            spec = spec.substring(0, 70);
            spec += "...";
        }

        return [spec];
    }

    onNumberChange(number) {
        this.Number = number;
    }

    addToCar() {
        if (typeof (this.props.addToCar) == 'function') {
            this.props.addToCar(this.Product, this.Number);
        }
    }

    getAddViewStyle() {
        if (typeof (this.props.index) != 'undefined' && this.props.index == 0) {
            return {
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
            };
        }
        if (typeof (this.props.isNotBottomItem) != 'undefined' && !this.props.isNotBottomItem) {
            return {
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
            };
        }

        return {};
    }

    render() {
        let navigate = this.props.navigation.navigate;

        if (this.Product == null) {
            return;
        }

        if (!this.LoadImageFile) {
            this.getImageUrl();
        }

        let addViewStyle = this.getAddViewStyle();

        return (
            <View>
                <View style={[addViewStyle, pageStyles.singleProductBgView]}>
                    <View style={pageStyles.singleProductDataRow}>
                        <TouchableHighlight
                            underlayColor={CompanyConfig.AppColor.OnPressSecondary}   >
                            <View>
                                <Image source={this.state.ProductImage} style={pageStyles.singleProductImage} />
                                <View style={{
                                    backgroundColor: '#00000080',
                                    borderBottomLeftRadius: getResponsiveValue(12),
                                    borderBottomRightRadius: getResponsiveValue(12),
                                    width: getResponsiveValue(180),
                                    paddingRight: getResponsiveValue(9),
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                }}>
                                    <Text style={{
                                        backgroundColor: '#00000000',
                                        color: "#fff",
                                        textAlign: 'center',
                                        fontSize: getResponsiveFontSize(20)
                                    }}>{this.Product.SKUModel}</Text>
                                </View>
                            </View>
                        </TouchableHighlight>

                        <View style={pageStyles.singleProductCenterView}>
                            <View style={{
                                height: getResponsiveValue(32), marginTop: getResponsiveValue(0), flexDirection: 'row', alignItems: 'center',
                                // backgroundColor: 'gray'
                            }}>
                                <Text style={pageStyles.singleProductName}>{this.Product.ProductName}</Text>
                            </View>

                            <Text style={pageStyles.singleProductPrice2}>￥{this.Product.Price}</Text>

                            <View style={pageStyles.singleProductDetailsRow}>
                                {
                                    this.getProductDetailsArray().map((item, index) => {
                                        return (
                                            <SearchResultProductDetailItem key={"productDetailsItem" + index} model={item}
                                                style={(index == 0 ? null : { marginLeft: getResponsiveValue(7) })} />
                                        )
                                    })
                                }
                            </View>

                        </View>
                        <View style={pageStyles.singleProductNumberBlock}>
                            <View style={pageStyles.singleProductNumberRow}>
                                <Text style={pageStyles.singleProductNumberText}>
                                    数量:
                                </Text>
                                <NumberChange onNumberChange={(number) => { this.onNumberChange(number) }} />
                                <TouchableOpacity onPress={() => { this.addToCar() }} style={pageStyles.singleProductAddButton}   >
                                    <SvgUri width={getResponsiveValue(30)} height={getResponsiveValue(40)} fill={StyleConfig.Secondary} source="add" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
                {(this.props.isNotBottomItem ? (
                    <View style={pageStyles.singleProductUnderLine}></View>
                ) : null)}
            </View>
        );
    }



}


export class SearchResultProductDetailItem extends Component {
    static propTypes = {
        model: PropTypes.any,  //需要显示的KeyValue对象
        style: PropTypes.any,  //样式
    }

    model = null;
    propStyle = null;
    constructor(prop) {
        super(prop);
        setStyle();
    }

    UNSAFE_componentWillMount() {
        this.model = this.props.model;

        if (typeof (this.props.style) != 'undefined' && this.props.style != null) {
            this.style = this.props.style;
        }
    }
    render() {

        if (this.model == null || this.model == "") {
            return null;
        }

        return (
            <View style={[pageStyles.singleProductDetailsItem, this.style]}>
                <Text style={pageStyles.singleProductDetailsItemText}>{this.model}</Text>
            </View>
        );
    }

}




export class ChoiceSpecProduct extends Component {
    IsMounted = false;
    constructor(prop) {
        super(prop);
        this.state = {
            show: false,
            product: {
                ProductName: '',
            },
            ProductImage: AppConfig.defaultNoImage,
        }
    }

    UNSAFE_componentWillMount() {
        this.IsMounted = true;
    }
    componentWillUnmount() {
        this.IsMounted = false;
    }

    show(product) {
        this.setState({ show: true, product: product });
        this.updateProductImage(product.DefaultImage);
    }
    hide() {
        this.setState({ show: false });
    }

    updateProductImage(imagePath) {

        if (typeof (imagePath) == 'undefined' || imagePath == null || imagePath == '') {
            return;
        }

        let thisObj = this;
        FileHelper.fetchFile(imagePath, 200).then((uri) => {
            if (uri != null && uri != '') {
                if (this.IsMounted) {
                    thisObj.setState({ ProductImage: { uri: uri } });
                }
            }
        }).catch(function (error) {
        });
    }

    render() {
        setStyle();
        if (!this.state.show) {
            return null;
        }

        return (
            <View style={pageStyles.choiceBase}>
                <View style={pageStyles.choiceBackView}>
                    <TouchableHighlight style={pageStyles.choiceBackButton} onPress={() => { this.hide() }} >
                        <View>
                            <SvgUri width={getResponsiveValue(21)} height={getResponsiveValue(21)} fill={'#fff'} source="close" />
                        </View>
                    </TouchableHighlight>
                </View>
                <View style={pageStyles.choiceContent}>
                    <Text style={pageStyles.choiceTitle}>添加商品</Text>
                    <View style={pageStyles.choiceProductInfoRow}>
                        <Image source={this.state.ProductImage} style={pageStyles.choiceProductImage} />
                        <View style={pageStyles.choiceProductInfo}>
                            <Text style={pageStyles.choiceProductName} >{this.state.product.ProductName}</Text>
                            <View style={pageStyles.choiceProductPrice}>
                                <Text style={pageStyles.choicePriceNameText}>进货价：</Text>
                                <Text style={pageStyles.choicePriceValue}>￥{this.state.product.Price}</Text>
                            </View>
                        </View>

                        <View style={pageStyles.choiceCarButton}>
                            <Text style={pageStyles.choiceCarText}>加入购物车</Text>
                            <SvgUri width={getResponsiveValue(38)} height={getResponsiveValue(40)} fill={CompanyConfig.AppColor.ContentFront} source="purchase" />
                            <Text style={pageStyles.choiceProductCount}>1</Text>
                        </View>
                    </View>

                    <View style={pageStyles.choiceLineView}>
                    </View>
                </View>
            </View>

        );
    }

}





