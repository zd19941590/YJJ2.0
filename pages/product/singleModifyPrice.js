import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Alert,
    TouchableOpacity,
    FlatList,
    TextInput,
    TouchableHighlight,
    Image,
} from 'react-native';
import ProductService from '../../services/product.js';
import CommonServices from '../../services/common.js';
import FileHelper from '../../helpers/fileHelper.config.js';
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme';
import CompanyConfig from '../../config/company.config.js';
import OperationMessage from '../../components/OperationMessage.js';
import Spinner from '../../components/Spinner.js';
import envConfig from '../../config/app.config.js';
import SvgUri from '../../components/svguri.js';
import NotFond from '../../components/NotFond.js';
import AppConfig from '../../config/app.config.js';
import PropTypes from "prop-types";
import { StyleConfig } from '../../config/style.config.js';
let Style = null;
export class Product extends Component {
    static propTypes = {
        object: PropTypes.any,
    }
    constructor(prop) {
        super(prop);
        this.state = {
            ImageUrl: envConfig.defaultLoadingImage,
            IsInput: false,
            model: { ProductSysNo: 0, SalePrice: 0, },
            autofocus: false,
            IsShowPurchasePrice: false
        };
        setStyle();
    }
    IsMounted = false;

    UNSAFE_componentWillMount() {
        this.IsMounted = true;

    }
    componentDidMount() {
        let services = new CommonServices();
        services.IsPossessPermission("APP_PurchasePrice", () => this.setState({
            IsShowPurchasePrice: true
        }));
        this.getImageUrl();
    }
    componentWillUnmount() {
        this.IsMounted = false;
    }
    getImageUrl() {
        let thisObj = this;
        if (this.props.model.DefaultImage == null || this.props.model.DefaultImage == "") {
            thisObj.setState({ ImageUrl: envConfig.defaultNoImage });

        } else {
            FileHelper.fetchFile(this.props.model.DefaultImage, 120).then((uri) => {
                if (thisObj.IsMounted) {
                    if (uri != null && uri != '') {
                        thisObj.setState({ ImageUrl: { uri: uri } });
                    } else {
                        thisObj.setState({ ImageUrl: envConfig.defaultFailImage });
                    }
                }
            });
        }
    }
    writePrice = () => {
        this.setState({
            IsInput: true
        })
    }
    writeEnd = () => {
        this.setState({
            IsInput: false
        })
    }
    UpdateSalePrice() {
        let self = this;
        let price = this.props.model.PromotionPrice > 0 ? this.props.model.PromotionPrice : this.props.model.SalePrice;
        this.props.model.PromotionPrice = this.state.model.SalePrice;
        if (this.state.model.SalePrice == '' || this.state.model.SalePrice == null) {
            self.props.showMessage("请输入修改后的销售价格！", 3);
            this.props.model.PromotionPrice = price;
        } else {
            if (!(/(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/).test(this.state.model.SalePrice)) {
                self.props.showMessage("销售价格为最多保留2位小数的数字！", 3);
                this.props.model.PromotionPrice = price;
            } else {
                let productService = new ProductService();
                let list = [];
                list.push(this.state.model)
                productService.DistributorUpdateProductSaleInfo(list).then(result => {
                    if (result.data.success) {
                        productService.UpdateSalePrice(this.state.model.ProductSysNo, this.state.model.SalePrice, (data) => { })
                        self.props.showMessage("修改成功！", 1);
                    } else {
                        if (!result.data.success) {
                            // self.props.showMessage(result.data.message, 2);
                            Alert.alert(
                                '提示',
                                result.data.message,
                                [
                                    { text: '确定', onPress: () => console.log(''), style: 'cancel' },
                                ],
                                { cancelable: false }
                            );
                            this.props.model.PromotionPrice = price;
                            this.props.model.SalePrice = price;
                            this.forceUpdate()
                        } else {
                            // self.props.showMessage("修改失败，请稍后再试！", 2);
                            Alert.alert(
                                '提示',
                                "修改失败，请稍后再试！",
                                [
                                    { text: '确定', onPress: () => console.log(''), style: 'cancel' },
                                ],
                                { cancelable: false }
                            );
                            this.props.model.PromotionPrice = price;
                            this.props.model.SalePrice = price;
                            this.forceUpdate();
                        }
                    }
                })
            }
        }
    }
    render() {
        setStyle();
        let self = this;
        let price = self.props.model.SalePrice;
        let width = this.state.Changewidth;
        let { navigate } = self.props.navigation;
        let PromotionPrice = parseFloat(this.props.model.PromotionPrice).toFixed(2);
        let SalePrice = parseFloat(this.props.model.SalePrice).toFixed(2);
        if (this.props.model.Properties && typeof (this.props.model.Properties) == 'string') {
            this.props.model.Properties = JSON.parse(this.props.model.Properties);
        }
        let prices = PromotionPrice > 0 ? PromotionPrice : SalePrice;
        return (
            <View style={Style.TextView}>
                <OperationMessage ref="messageBar" />
                <View style={{
                    width: getResponsiveValue(180),
                    height: getResponsiveValue(110),
                }}>
                    <TouchableHighlight underlayColor={'#ffffff00'} onPress={() => {
                        //  navigate('ProductDetail', { index: this.props.index, ProductList: this.props.productList });
                        let list = [this.props.model];
                        let productList = [this.props.model];
                        productList[0].CommonProductList = list;
                        navigate('ProductDetail', { index: 0, ProductList: productList });
                    }}>
                        <Image style={Style.DefaultImage} source={this.state.ImageUrl} />
                    </TouchableHighlight>
                    <View style={{
                        backgroundColor: '#00000080',
                        borderBottomLeftRadius: getResponsiveValue(12),
                        borderBottomRightRadius: getResponsiveValue(12),
                        width: getResponsiveValue(160),
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
                        }}>{this.props.model.SKUModel}</Text>
                    </View>
                </View>
                <View style={Style.ViewRow} >
                    <View style={{ width: getResponsiveValue(1120), flexDirection: 'column', justifyContent: 'space-around' }}>
                        <View style={{ height: getResponsiveValue(45), flexDirection: 'row', justifyContent: 'space-between', marginTop: getResponsiveValue(20) }}>
                            <Text numberOfLines={1} style={Style.productNameText} >{this.props.model.ProductName}</Text>
                            <View style={{ height: getResponsiveValue(45), flexDirection: 'row', justifyContent: 'flex-end', }}>
                                <Text style={Style.SalePriceText}>{prices > 0 ? "销售价格：￥" : "销售价格："}</Text>

                                <TouchableOpacity style={{ alignItems: 'center', height: getResponsiveValue(45), zIndex: 100, flexDirection: 'row', }} onPress={() => self.writePrice()}>
                                    {this.state.IsInput ?
                                        <TextInput
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            keyboardType="numeric"
                                            // onFocus={this.writePrice}
                                            onBlur={this.writeEnd}
                                            onChangeText={(newValue) => { this.state.model.SalePrice = newValue; this.state.model.ProductSysNo = this.props.model.SysNo }}
                                            onSubmitEditing={() => this.UpdateSalePrice()}
                                            disableFullscreenUI={true}
                                            underlineColorAndroid="transparent"
                                            selectTextOnFocus={true}
                                            blurOnSubmit={true}
                                            autoFocus={true}
                                            returnKeyType={'done'}
                                            returnKeyLabel={"确定"}
                                            defaultValue={PromotionPrice > 0 ? PromotionPrice.toString() : SalePrice.toString()}
                                            style={[Style.Input, { width: getResponsiveValue(200), borderBottomWidth: getResponsiveValue(2) }]} />
                                        : <Text style={[Style.Input, { marginTop: getResponsiveValue(-2) }]}>{prices > 0 ? prices : "未设置价格"}</Text>}
                                    <SvgUri width={getResponsiveValue(30)} height={getResponsiveValue(30)} fill={StyleConfig.PopupFront} source={"quanxian"} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                            <View style={Style.MorePriceView}>
                                <Text style={[Style.SKUText, { color: StyleConfig.PopupFront }]}>{this.props.model.SeriesName != null ? (this.props.model.SeriesName) : null}</Text>
                                <View style={{ flexDirection: 'row' }}>
                                    {this.props.model.Properties.map((item, index) => {
                                        return (
                                            <Text style={[Style.priceText, { marginRight: getResponsiveValue(14) }]} key={index}>{item.Name}：{item.Value}</Text>
                                        )
                                    }
                                    )}

                                </View>
                            </View>
                            <View style={Style.MorePriceView}>
                                <Text style={Style.priceText}>{this.state.IsShowPurchasePrice ? (this.props.model.CostPrice == 0 ? "进货价格：未设置价格" : "进货价格：￥" + this.props.model.CostPrice) : null}</Text>
                                <Text style={[Style.priceText]}>建议价格：{this.props.model.RetailPrice == 0 ? "未设置价格" : "￥" + this.props.model.RetailPrice}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        )
    }
}
export default class SingleModifyPrice extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ProductName: { SearchText: '', SearchSeriesSysNos: this.props.SeriesSysNo == null ? null : [this.props.SeriesSysNo] },
            ProductList: [],
            pageSize: 20,
            startNo: 0,
            isNoproduct: false
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        this.state.ProductName.SearchSeriesSysNos = nextProps.SeriesSysNo == null ? null : [nextProps.SeriesSysNo];
    }
    componentDidMount() {
        let productService = new ProductService();
        let thisObj = this;
        productService.GetProductsList(this.state.startNo, this.state.pageSize, this.state.ProductName, null, null, null, (data) => {
            if (!data.length > 0) {
                thisObj.setState({
                    isNoproduct: true,
                    ProductList: []
                });
            } else {
                let list = data;
                for (let i = 0; i < data.length; i++) {
                    data[i].CommonProductList = list;
                }
                thisObj.setState({
                    ProductList: data,
                });
            }


        });

        var newStartNo = this.state.startNo + this.state.pageSize;
        this.state.startNo = newStartNo;

    }
    renderSignleProduct(productModel, index) {
        return (
            <Product index={index} productList={this.state.ProductList} model={productModel} object={this.state.ProductName} showMessage={(message, n) => this.props.showMessage(message, n)} navigation={this.props.navigation} />
        )
    }
    findProduct() {
        this.state.ProductName.SearchSeriesSysNos = null;
        this.state.startNo = 0;
        let productService = new ProductService();
        let thisObj = this;
        if (this.state.ProductList.length > 0) {
            this.refs["productList"].scrollToIndex({ animated: true, index: 0 });
        }
        productService.GetProductsList(this.state.startNo, this.state.pageSize, this.state.ProductName, null, null, null, (data) => {
            if (!data.length > 0) {
                thisObj.setState({
                    isNoproduct: true,
                    ProductList: []
                });
            } else {

                thisObj.setState({
                    ProductList: data,
                });
            }

        });
        var newStartNo = this.state.startNo + this.state.pageSize;
        this.state.startNo = newStartNo;

    }
    page = () => {
        let productService = new ProductService();
        let thisObj = this;
        productService.GetProductsList(this.state.startNo, this.state.pageSize, this.state.ProductName, null, null, null, (data) => {
            var newProductList = thisObj.state.ProductList.concat(data);
            let list = newProductList;
            for (let i = 0; i < newProductList.length; i++) {
                newProductList[i].CommonProductList = list;
            }
            thisObj.setState({
                ProductList: newProductList,
            });

        });
        var newStartNo = this.state.startNo + this.state.pageSize;
        this.state.startNo = newStartNo;
    }
    _headerComponent() {
        return (
            <View style={Style.headerView}>
                <View style={Style.searchView}>
                    <SvgUri style={{ marginLeft: getResponsiveValue(20) }} width={getResponsiveValue(39)} height={getResponsiveValue(38)} opacity={0.7} fill={StyleConfig.DescriptionFront} source="search" />
                    <TextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={Style.headerSearchInput}
                        onChangeText={(newValue) => { this.state.ProductName.SearchText = newValue; }}
                        onSubmitEditing={() => this.findProduct()}
                        disableFullscreenUI={true}
                        underlineColorAndroid="transparent"
                        selectTextOnFocus={true}
                        blurOnSubmit={true}
                        returnKeyType={'search'}
                        returnKeyLabel={"查找"}
                        placeholder="商品名称/商品型号/商品系列"
                        defaultValue={this.state.ProductName.SearchText}
                        ref="searchInput"
                        placeholderTextColor={StyleConfig.Main}
                    />
                </View>
            </View>
        )
    }
    render() {
        setStyle();
        let self = this;
        const { navigate } = this.props.navigation;
        let user = this.state.user;
        return (
            <View style={Style.BackColor} >
                {this.state.ProductList.length > 0 ? (<FlatList
                    ListHeaderComponent={this._headerComponent()}
                    removeClippedSubviews={true}//用于将屏幕以外的视图卸载
                    onEndReachedThreshold={0.1}
                    onEndReached={self.page}
                    bounces={false}
                    getItemLayout={(data, index) => ({ length: getResponsiveValue(155), offset: getResponsiveValue(155) * index, index })}
                    data={this.state.ProductList}
                    ref="productList"
                    extraData={this.state}
                    keyExtractor={(intem, index) => "p" + intem.SysNo}
                    renderItem={({ item, index }) => this.renderSignleProduct(item, index)}
                    style={{ marginTop: getResponsiveValue(20) }}
                />) : (this.state.isNoproduct ? (
                    <View style={{ marginTop: getResponsiveValue(20) }}>
                        <View style={{ marginTop: getResponsiveValue(-90) }}>
                            <NotFond />
                        </View>
                        <View style={{ position: 'absolute', top: 0, zIndex: 20 }}>
                            {this._headerComponent()}
                        </View>

                    </View>
                ) : null)}
                <Spinner />
            </View>
        );
    }
}
function setStyle() {
    if (Style != null && !CompanyConfig.isGeneral()) return Style;
    Style = StyleSheet.create({
        BackColor: {
            flex: 1,
        },
        SKUText: {
            fontSize: getResponsiveValue(24),
            color: CompanyConfig.AppColor.DescriptionFront,
        },
        PriceView: {
            marginTop: getResponsiveValue(35),
            width: 'auto',
            flexDirection: 'column',
            marginRight: getResponsiveValue(50),
        },
        // writeImage: {
        //     opacity: 0.4,
        //     width: getResponsiveValue(30),
        //     height: getResponsiveValue(30)
        //     // marginTop: getResponsiveValue(-15)
        // },
        DefaultImage: {
            marginLeft: getResponsiveValue(20),
            width: getResponsiveValue(160),
            height: getResponsiveValue(110),
            borderRadius: getResponsiveValue(12)
        },
        SalePriceText: {
            fontSize: getResponsiveValue(28),
            color: StyleConfig.PopupFront,
        },
        headerView: {
            width: getResponsiveValue(AppConfig.design.width),
            alignItems: 'center',
            justifyContent: 'center',
            height: getResponsiveValue(60),
            marginBottom: getResponsiveValue(16)
        },
        headerSearchInput: {
            paddingLeft: getResponsiveFontSize(20),
            fontSize: getResponsiveFontSize(32),
            padding: 0,
            width: getResponsiveValue(1154),
            height: getResponsiveValue(60),
            // backgroundColor: CompanyConfig.formatColor(CompanyConfig.AppColor.SecondaryFront, "40"),
            borderRadius: getResponsiveValue(10),
            color: StyleConfig.DescriptionFront,
        },
        searchView: {
            width: getResponsiveValue(1294),
            height: getResponsiveValue(60),
            borderRadius: getResponsiveValue(30),
            backgroundColor: CompanyConfig.formatColor(StyleConfig.DescriptionFront, "11"),
            flexDirection: 'row',
            alignItems: 'center'
        },
        priceText: {
            // width: getResponsiveValue(300),
            fontSize: getResponsiveValue(24),
            color: StyleConfig.DescriptionFront,
            textAlign: 'right'
        },
        MorePriceView: {
            flexDirection: "column",
            alignItems: 'flex-start',
            // justifyContent: 'center',
            marginBottom: getResponsiveValue(20),
            // marginLeft: getResponsiveValue(50)
        },
        productNameText: {
            width: getResponsiveValue(400),
            fontSize: getResponsiveValue(28),
            color: StyleConfig.FocalFront,
        },
        ViewRow: {
            flex: 1,
            height: getResponsiveValue(145),
            marginLeft: getResponsiveValue(20),
            height: 'auto',
            width: 'auto',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        Input: {
            borderColor: StyleConfig.FocalFront,
            marginTop: getResponsiveValue(5),
            height: getResponsiveValue(40),
            fontSize: getResponsiveValue(28),
            color: StyleConfig.PopupFront,
            padding: 0,
            marginRight: getResponsiveValue(10)

        },
        TextView: {
            // justifyContent: 'space-between',
            flexDirection: 'row',
            width: 'auto',
            height: getResponsiveValue(145),
            backgroundColor: StyleConfig.Secondary,
            alignItems: 'center',
            marginBottom: getResponsiveValue(10),
        },

    })
    return Style;
}
