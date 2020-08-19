
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Keyboard,
    Alert,
    TouchableOpacity,
    ScrollView,
    TouchableHighlight,
    Animated,
    TextInput,
    Image,
    UIManager,
    Modal,
    Dimensions,
} from 'react-native';
import AlertModal from "../../components/AlertModal";
import ProductService from '../../services/product.js';
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme';
import CompanyConfig from '../../config/company.config.js';
import OperationMessage from '../../components/OperationMessage.js';
import Spinner from '../../components/Spinner.js';
import SvgUri from '../../components/svguri.js';
import SingleModifyPrice from '../../pages/product/singleModifyPrice';
import FileHelper from '../../helpers/fileHelper.config.js';
import Checkbox from '../../components/Checkbox.js'
import AppConfig from '../../config/app.config.js';
import NotFond from '../../components/NotFond.js';
import DataDownloadService from '../../services/datadownload.js';
import CommonServices from '../../services/common.js';
import { StyleConfig } from '../../config/style.config';

const SPRING_SPEACE = getResponsiveValue(-AppConfig.design.width);
let Style = null;

let { width } = Dimensions.get('window');
const windowWidth = width;
export default class ModifyPrice extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modifyPriceWayId: 'coefficient',
            pan: new Animated.ValueXY(),
            seat: 0,//记录动画的初始位置
            searchData: '',
            SeriesSysNo: null,
        };
    }

    getStyle() {
        return [Style.searchView, {
            transform: this.state.pan.getTranslateTransform()
        }];
    }

    startAnimation() {
        Animated.sequence([
            Animated.timing(this.state.pan, {
                toValue: { x: this.state.seat == 0 ? SPRING_SPEACE : 0, y: 0 },
                duration: 400,
                useNativeDriver: true
            }),
        ]).start();
        this.state.seat = this.state.seat == 0 ? SPRING_SPEACE : 0;
    }

    closeSearch() {
        let self = this;
        self.startAnimation();
        self.state.searchData = '';

        setTimeout(() => {
            self.searchProduct();
        }, 400);
    }

    searchProduct() {
        Keyboard.dismiss();
        let self = this;
        self.refs["singlemodify"].state.ProductName.SearchText = self.state.searchData;
        self.refs["singlemodify"].findProduct();
    }

    renderContent() {
        let component = null;

        if (this.state.modifyPriceWayId == "single") {
            component =
                <SingleModifyPrice
                    ref="singlemodify"
                    SeriesSysNo={this.state.SeriesSysNo}
                    showMessage={(message, n) => {
                        this.refs["messageBar"].show(message, n)
                    }}
                    navigation={this.props.navigation}
                />
        } else if (this.state.modifyPriceWayId == "coefficient") {
            component =
                <CoefficientModifyPrice
                    searchProduct={(ProductSeriesSysNo) => {
                        this.setState({ modifyPriceWayId: "single", SeriesSysNo: ProductSeriesSysNo })
                    }}
                    showMessage={(message, n) => this.refs["messageBar"].show(message, n)}
                    navigation={this.props.navigation}
                />
        }

        return component;
    }

    renderHeader() {
        return (
            <View style={Style.headerView}>
                <TouchableHighlight
                    style={Style.back}
                    onPress={() => { this.props.navigation.goBack(); }}
                    activeOpacity={0.8}
                    underlayColor={CompanyConfig.AppColor.OnPressSecondary} >
                    <View><SvgUri width={getResponsiveValue(40)} height={getResponsiveValue(40)} fill={StyleConfig.Main} source="back" /></View>
                </TouchableHighlight>
                <View style={[Style.InputView]}>
                    <TouchableOpacity
                        onPress={() => this.setState({ modifyPriceWayId: "coefficient", SeriesSysNo: null })}
                        style={[Style.multiple, this.state.modifyPriceWayId == "coefficient" ? { backgroundColor: CompanyConfig.AppColor.ButtonBg } : { backgroundColor: StyleConfig.Main }]}>
                        <Text style={[Style.Text, this.state.modifyPriceWayId == "coefficient" ? { color: CompanyConfig.AppColor.ButtonFront } : { color: StyleConfig.SecondaryFront }]}>
                            按系数修改 </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => this.setState({ modifyPriceWayId: "single", SeriesSysNo: null })}
                        style={[Style.product, this.state.modifyPriceWayId == "single" ? { backgroundColor: CompanyConfig.AppColor.ButtonBg } : { backgroundColor: StyleConfig.Main }]}>
                        <Text
                            style={[Style.Text, this.state.modifyPriceWayId == "single" ? { color: CompanyConfig.AppColor.ButtonFront } : { color: StyleConfig.SecondaryFront }]}
                        > 按商品修改 </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    render() {
        setStyle();
        return (
            <View style={Style.BackColor} >
                <OperationMessage ref="messageBar" />
                {this.renderHeader()}
                <View style={{ flex: 1, width: windowWidth }}>
                    {this.renderContent()}
                </View>
            </View>
        );
    }
}

export class CoefficientModifyPrice extends Component {
    constructor(props) {
        super(props);
        this.state = {
            seriesList: [],
            ProductList: [],
            saveProductList: [],
            isShowModal: false,
            allSelected: false,
            NotFond: false,
            productMultiple: {
                Multiple: 0,
                ProductSeriesSysNo: 0,
            }
        };
    }

    componentDidMount() {
        let self = this;
        let Service = new ProductService();
        global.storage.load(
            {
                key: 'productSeries',
                autoSync: false
            }).then(auth => {
                if (auth.length > 0) {
                    self.setState({
                        seriesList: auth,
                    });
                } else {
                    Service.GitDistributorSeries().then(result => {
                        if (result.data.success) {
                            global.storage.save({
                                key: 'productSeries',
                                data: result.data.data,
                            });
                            series = result.data.data;
                            if (result.data.data.length > 0) {
                                self.setState({
                                    seriesList: result.data.data
                                })

                            } else {
                                self.setState({
                                    NotFond: true,
                                });
                            }
                        } else {
                            self.setState({
                                NotFond: true,

                            });
                        }
                    })
                }

            }).catch(err => {
                Service.GitDistributorSeries().then(result => {
                    if (result.data.success) {
                        global.storage.save({
                            key: 'productSeries',
                            data: result.data.data,
                        });
                        series = result.data.data;
                        self.setState({
                            seriesList: result.data.data
                        })
                    } else {
                        self.setState({
                            NotFond: true,

                        });
                    }
                })
            });
    }

    saveMultiple(newMultiple, SeriesSysNo) {
        let self = this;
        let productService = new ProductService();

        if (newMultiple != null) {
            if (!(/(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/).test(newMultiple)) {
                self.props.showMessage("价格系数为最多保留2位小数的数字！", 3);
                return null;
            }
            if (newMultiple < 0) {
                self.props.showMessage("价格系数不能为零或负数！", 3);
                return null;
            }

            self.state.productMultiple.Multiple = newMultiple;
            self.state.productMultiple.ProductSeriesSysNo = SeriesSysNo;
            productService.GetProductsList(0, 9999999999, null, null, SeriesSysNo, null, (data) => {
                let productList = [];
                for (let i = 0; i < data.length; i++) {
                    if (data[i].PromotionPrice > 0) {
                        let info = { SysNo: null, PromotionPrice: null, ProductSysNo: null, DefaultImage: null, ProductName: null, SalePrice: null, CostPrice: null, isSelected: null };
                        info.isSelected = false;
                        info.SysNo = data[i].SysNo;
                        info.DefaultImage = data[i].DefaultImage;
                        info.ProductName = data[i].ProductName;
                        info.ProductSysNo = data[i].SysNo;
                        info.SalePrice = data[i].SalePrice;
                        info.CostPrice = data[i].CostPrice;
                        info.PromotionPrice = data[i].PromotionPrice;
                        productList.push(info)
                    }
                }
                if (productList != null && productList.length > 0) {
                    self.setState({
                        ProductList: productList,
                        isShowModal: true
                    })
                } else {
                    self.save();
                }
            });
        }
    }

    save() {
        let Service = new ProductService();
        let self = this;
        let productList = self.state.saveProductList;
        let list = [];
        let series = self.state.seriesList;
        for (let i = 0; i < productList.length; i++) {
            if (productList[i].isSelected) {
                productList[i].SalePrice = 0;
                list.push(productList[i]);
            }
        }
        Service.DistributorUpdateProductSaleInfo(list).then(result => {
            if (result.data.success) {
                Service.InsertDistributorProductMultiple(self.state.productMultiple).then(result_multiple => {
                    if (result_multiple.data.success) {
                        self.setState({
                            allSelected: false,
                            saveProductList: [],
                            isShowModal: false
                        });
                        let dlService = new DataDownloadService();
                        dlService.onlyDownloadData(true, null, (dataType, entity, ds) => {

                            let isSuccess = ds.completionProduct;
                            if (isSuccess)
                                self.props.showMessage("修改成功！", 1);
                            return true;
                        }, null);

                        for (let i = 0; i < series.length; i++) {
                            if (series[i].ProductSeriesSysNo == self.state.productMultiple.ProductSeriesSysNo) {
                                series[i].Multiple = self.state.productMultiple.Multiple;
                            }
                        };
                        global.storage.save({
                            key: 'productSeries',
                            data: series,
                        });
                        self.setState({
                            seriesList: series,
                        });
                    } else if (!result_multiple.data.success) {
                        self.setState({
                            allSelected: false,
                            saveProductList: [],
                            isShowModal: false
                        });
                        self.props.showMessage(result_multiple.data.message, 2);
                    } else {
                        self.setState({
                            saveProductList: [],
                            isShowModal: false
                        });
                        this.AlertModal.Show(
                            '提示',
                            "修改失败，请检查网络后再试！",
                            [
                                { text: '确定', onPress: () => console.log(''), style: 'cancel' },
                            ],
                            { cancelable: false }
                        );
                    }
                });
            } else if (!result.data.success) {
                self.setState({
                    saveProductList: [],
                    isShowModal: false
                });
                Alert.alert(
                    '提示',
                    result.data.message,
                    [
                        { text: '确定', onPress: () => console.log(''), style: 'cancel' },
                    ],
                    { cancelable: false }
                )
            } else {
                self.setState({
                    saveProductList: [],
                    isShowModal: false
                });
                this.AlertModal.Show(
                    '提示',
                    "修改失败，请检查网络后再试！",
                    [
                        { text: '确定', onPress: () => console.log(''), style: 'cancel' },
                    ],
                    { cancelable: false }
                );
            }
        })
    }

    changeSelected() {
        let self = this;
        let productList = self.state.ProductList;
        for (let i = 0; i < productList.length; i++) {
            if (!productList[i].isSelected) {

                self.state.allSelected = false;

            }
        }
        if (!self.state.allSelected) {
            for (let i = 0; i < productList.length; i++) {
                productList[i].isSelected = true;
                self.refs[productList[i].SysNo].check(true);
            }
            self.state.allSelected = true;
            self.refs["checkbox"].setCheckState(true);
        } else {
            for (let i = 0; i < productList.length; i++) {
                productList[i].isSelected = false;
                self.refs[productList[i].SysNo].check(false);
            }
            self.state.allSelected = false;
            self.refs["checkbox"].setCheckState(false);
        }
        self.state.ProductList = productList;
    }

    selectedItem(itemInfo) {
        let self = this;
        let product = self.state.ProductList;
        for (let i = 0; i < product; i++) {
            if (product[i].SysNo == itemInfo.SysNo) {
                product[i].isSelected = itemInfo.isSelected;
            }
            if (product[i].isSelected == false) {
                self.state.allSelected = false
            }
        }
        self.state.ProductList = product;
        self.refs["checkbox"].setCheckState(false);
    }

    resetPrice() {
        let self = this;
        let productList = self.state.ProductList;
        let newList = self.state.saveProductList;
        let showList = [];
        let isHaveSelected = false;
        for (let i = 0; i < productList.length; i++) {
            if (productList[i].isSelected) {
                productList[i].SalePrice = 0;
                newList.push(productList[i]);
                isHaveSelected = true;
            } else {
                showList.push(productList[i])
            }
        }
        if (!isHaveSelected) {
            self.refs["messageBar"].show("请勾选商品！", 3);
        }
        self.setState({
            ProductList: showList,
            saveProductList: newList
        })
        if (!showList.length > 0) {
            self.save();
        }
    }

    keppPrice() {
        let self = this;
        let productList = self.state.ProductList;
        let showList = [];
        let isHaveSelected = false;
        for (let i = 0; i < productList.length; i++) {
            if (!productList[i].isSelected) {
                showList.push(productList[i]);
            } else {
                isHaveSelected = true;
            }
        }
        if (!isHaveSelected) {
            self.refs["messageBar"].show("请勾选商品！", 3);
        }
        self.setState({
            ProductList: showList
        })
        if (!showList.length > 0) {
            self.save();
        }
    }

    render() {
        setStyle();
        let self = this;

        return (
            <View>
                <AlertModal ref={(al) => this.AlertModal = al} />
                <Modal visible={this.state.isShowModal}
                    onRequestClose={() => this.setState({ isShowModal: false })}
                    transparent={true}
                    animationType="slide"
                    ///修复一个问题：https://github.com/facebook/react-native/issues/7708
                    supportedOrientations={['portrait', 'landscape']}
                >
                    <View style={{ width: getResponsiveValue(1334), height: getResponsiveValue(AppConfig.design.height), backgroundColor: '#0e0e0e50', }}>
                        <OperationMessage ref="messageBar" />
                        <View style={Style.ModelViewBackground}>
                            <View style={Style.ModalHeader}>
                                <Text style={Style.memoText}>*以下商品单独设置过价格，请勾选商品后重新设置。</Text>
                            </View>
                            <ScrollView
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                            >
                                {this.state.ProductList.map((item, index) => {
                                    return (<ProductItem onpress={(itemInfo) => self.selectedItem(itemInfo)} key={item.SysNo} ref={item.SysNo} isSe model={item} />)
                                })}
                            </ScrollView>
                            <View style={Style.ModalHeader}>
                                <TouchableOpacity {...this.props} style={Style.touchAllCheck} onPress={() => self.changeSelected()}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Checkbox clickCallback={() => { self.changeSelected() }} ref='checkbox' isSelected={self.state.allSelected} ></Checkbox>
                                        <Text style={Style.touchText}>全选</Text>
                                    </View>
                                </TouchableOpacity>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity  {...this.props} style={Style.touchTextView} onPress={() => self.resetPrice()}>
                                        <Text style={Style.touchText}>{self.state.productMultiple.Multiple == 0 ? "重置为默认价" : "按" + self.state.productMultiple.Multiple + "倍重设价格"}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity  {...this.props} style={Style.touchTextView} onPress={() => { self.keppPrice() }}>
                                        <Text style={Style.touchText}>保持不变</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                    <Spinner label={"销售价更新中..."} />
                </Modal>
                {self.state.NotFond == false ? (<ScrollView bounces={false} style={{ marginTop: getResponsiveValue(10) }}>
                    <View style={{ flexWrap: "wrap", flexDirection: "row", justifyContent: 'flex-start', width: getResponsiveValue(1334) }}>
                        {self.state.seriesList.map((item, index) => {
                            return (
                                <SeriesItem searchProduct={(ProductSeriesSysNo) => self.props.searchProduct(ProductSeriesSysNo)} saveMultiple={(newMultiple, SeriesSysNo) => self.saveMultiple(newMultiple, SeriesSysNo)} model={item} key={index} />
                            )
                        })}
                    </View>
                </ScrollView>) : (<NotFond />)}
                <Spinner label={"销售价更新中..."} />
            </View>
        );
    }
}

export class ProductItem extends Component {
    constructor(prop) {
        super(prop);
        this.state = {
            ImageUrl: AppConfig.defaultLoadingImage,
            IsInput: false,
            model: { ProductSysNo: 0, SalePrice: '', },
            autofocus: false,
            backShow: false,
            IsShowPurchasePrice: false
        };
        setStyle();
    }
    IsMounted = false;
    CharCount = 12;//显示商品名称的前12个字符
    UNSAFE_componentWillMount() {
        let self = this;
        self.IsMounted = true;
    }
    componentDidMount() {
        let self = this;
        let services = new CommonServices();
        services.IsPossessPermission("APP_PurchasePrice", () => this.setState({
            IsShowPurchasePrice: true
        }));
        self.getImageUrl();
    }
    componentWillUnmount() {
        let self = this;
        self.IsMounted = false;
    }
    getImageUrl() {
        let thisObj = this;
        if (this.props.model.DefaultImage == null || this.props.model.DefaultImage == "") {
            thisObj.setState({ ImageUrl: AppConfig.defaultNoImage });

        } else {
            FileHelper.fetchFile(this.props.model.DefaultImage).then((uri) => {
                if (thisObj.IsMounted) {
                    if (uri != null && uri != '') {
                        thisObj.setState({ ImageUrl: { uri: uri } });
                    } else {
                        thisObj.setState({ ImageUrl: AppConfig.defaultFailImage });
                    }
                }
            });
        }
    }
    check(isSelecked) {
        this.refs['checkbox'].setCheckState(isSelecked);
        if (isSelecked) {
            this.setState({
                backShow: true
            })
        } else {
            this.setState({
                backShow: false
            })
        }
    }
    selectedItem(itemInfo) {
        let self = this;
        let checked = self.refs['checkbox'].getCheckState();
        self.refs['checkbox'].setCheckState(!checked);
        itemInfo.isSelected = !checked;
        self.props.onpress(itemInfo);
        if (!checked) {
            this.setState({
                backShow: true
            })
        } else {
            this.setState({
                backShow: false
            })
        }
    }
    render() {
        setStyle();
        let self = this;
        let item = self.props.model;

        return (
            <View style={{
                flex: 1,
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: getResponsiveValue(30)
            }}>
                <TouchableHighlight style={{ width: getResponsiveValue(410), }} onPress={() => self.selectedItem(item)} underlayColor={'#ffffff00'}>
                    <View style={{
                        position: 'relative',
                        width: getResponsiveValue(410),
                        height: getResponsiveValue(313),
                    }}>
                        <View style={[{
                            right: getResponsiveValue(10),
                            top: getResponsiveValue(10),
                            zIndex: 10,
                            position: 'absolute',
                            width: getResponsiveValue(38),
                            height: getResponsiveValue(38),
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: getResponsiveValue(24),

                        }, self.state.backShow ? { backgroundColor: StyleConfig.Main } : { backgroundColor: '#ffffff00' }]}>
                            <Checkbox isShowNotSelectImg={false} clickCallback={() => self.selectedItem(item)} ref='checkbox' isSelected={item.isSelected} ></Checkbox>
                        </View>
                        <Image style={{
                            zIndex: 10,
                            height: getResponsiveValue(50),
                            width: getResponsiveValue(410),
                            position: 'absolute',
                            bottom: 0,
                            left: 0
                        }} source={require('../../assets/icons/title_bg_white.png')}></Image>
                        <Image style={Style.DefaultImage} source={this.state.ImageUrl} >
                        </Image>
                    </View>
                </TouchableHighlight>
                <View style={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fff',
                    width: getResponsiveValue(410),
                    borderBottomLeftRadius: getResponsiveValue(10),
                    borderBottomRightRadius: getResponsiveValue(10)
                }}>
                    <Text numberOfLines={1} style={{
                        width: getResponsiveValue(410),
                        paddingLeft: getResponsiveFontSize(20),
                        fontSize: getResponsiveFontSize(28),
                        color: '#252525'
                    }}>{item.ProductName}</Text>
                    <View style={{ width: getResponsiveValue(410), flexDirection: 'row', marginBottom: getResponsiveValue(20) }}>
                        {this.state.IsShowPurchasePrice ? <Text style={Style.priceText}>进货价:{item.CostPrice}</Text> : null}
                        <Text style={Style.priceText}>销售价:{item.PromotionPrice}</Text>
                    </View>
                </View>
            </View >
        )
    }
}

UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

export class SeriesItem extends Component {
    constructor(prop) {
        super(prop);
        this.state = {
            isWriting: false,
            newMultiple: 0,
            SeriesSysNo: 0,
            showReset: false
        };
        MoveStartX = null;
        setStyle();
    }

    writeMultiple() {
        let self = this;
        if (self.state.isWriting) {
            self.setState({
                isWriting: false
            });
        } else {
            self.setState({
                isWriting: true
            });
        }
    }
    saveMultiple() {
        let self = this;
        let item = self.props.model;
        if (self.state.newMultiple != null && self.state.SeriesSysNo != null) {
            self.props.saveMultiple(self.state.newMultiple, self.state.SeriesSysNo);

        }
    }
    onMoveRelease(event) {
        let self = this;
        let MoveEndX = event.nativeEvent.pageX;
        if (self.MoveStartX > MoveEndX - 30) {

            self.setState({ showReset: true });

        } else if (self.MoveStartX < MoveEndX + 30) {   //手势右滑

            self.setState({ showReset: false });

        }

    }
    reset() {
        let item = this.props.model;
        this.state.newMultiple = 0;
        this.state.SeriesSysNo = item.ProductSeriesSysNo
        this.saveMultiple();
        this.setState({
            showReset: false
        })
    }

    render() {
        setStyle();
        let self = this;
        let item = self.props.model;
        let width = this.state.Changewidth;
        return (
            <TouchableHighlight style={{
                flexDirection: "row",
                width: getResponsiveValue(636),
                backgroundColor: StyleConfig.Secondary,
                // backgroundColor: '#342',
                marginLeft: getResponsiveValue(21),
                marginTop: getResponsiveValue(10),
                borderRadius: getResponsiveValue(5),
                height: getResponsiveValue(110),
                justifyContent: 'space-between',
                alignItems: 'center',
            }} key={item.MasterID}
                underlayColor={"#ffffffb3"}
            >

                <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: 'space-between', flex: 1 }}

                >
                    <TouchableOpacity onPress={() => self.props.searchProduct(item.ProductSeriesSysNo)}>
                        <Text numberOfLines={1} style={{
                            fontSize: getResponsiveFontSize(32),
                            color: StyleConfig.FocalFront,
                            marginLeft: getResponsiveFontSize(30),
                            width: getResponsiveFontSize(300),
                        }}>{item.SeriesName}</Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: "row", alignItems: 'center' }}>
                        <Text style={{
                            fontSize: getResponsiveFontSize(20),
                            color: StyleConfig.FocalFront,

                        }}>进货价×</Text>
                        <TouchableOpacity style={{
                            width: 'auto',
                            flexDirection: "row",
                            alignItems: 'center',
                            height: getResponsiveValue(110),
                            marginRight: getResponsiveValue(40)
                        }} onPress={() => self.writeMultiple()}>
                            {self.state.isWriting ? <TextInput
                                autoCapitalize="none"
                                autoCorrect={false}
                                onBlur={() => self.writeMultiple()}
                                placeholderTextColor={CompanyConfig.AppColor.ContentFront}
                                underlineColorAndroid="transparent"
                                style={{
                                    padding: 0,
                                    width: getResponsiveValue(80),
                                    borderBottomWidth: getResponsiveValue(2),
                                    fontSize: getResponsiveFontSize(32),
                                    color: StyleConfig.FocalFront,
                                    borderColor: StyleConfig.PopupFront,
                                    height: getResponsiveValue(40),
                                }}
                                keyboardType="numeric"
                                returnKeyType={'done'}
                                returnKeyLabel={"确定"}
                                underlineColorAndroid="transparent"
                                blurOnSubmit={true}
                                autoFocus={true}
                                disableFullscreenUI={true}
                                onChangeText={newValue => { self.state.newMultiple = newValue; self.state.SeriesSysNo = item.ProductSeriesSysNo }}
                                defaultValue={item.Multiple > 0 ? item.Multiple.toString() : null}
                                maxLength={4}
                                selectTextOnFocus={true}
                                onSubmitEditing={() => this.saveMultiple()}
                            />
                                : <Text style={
                                    {
                                        padding: 0,
                                        fontSize: getResponsiveFontSize(32),
                                        color: StyleConfig.FocalFront,
                                        marginRight: getResponsiveValue(10),
                                        marginLeft: getResponsiveValue(10),
                                    }
                                }>{item.Multiple > 0 ? item.Multiple : null}</Text>}
                            <SvgUri width={getResponsiveValue(30)} height={getResponsiveValue(30)} fill={StyleConfig.DescriptionFront} source={"quanxian"} />
                        </TouchableOpacity>
                        <TouchableOpacity style={{
                            width: 'auto',
                            flexDirection: "row",
                            alignItems: 'center',
                            height: getResponsiveValue(110),
                            marginRight: getResponsiveValue(30)
                        }} onPress={() => Alert.alert("提示", "重置" + item.SeriesName + "的价格系数吗？", [
                            {
                                text: "取消",
                                onPress: () => { }
                            },
                            {
                                text: "确定",
                                onPress: () => {
                                    this.reset()
                                }
                            }
                        ])}>
                            <SvgUri width={getResponsiveValue(31)} height={getResponsiveValue(31)} fill={StyleConfig.DescriptionFront} source={"resetPrice"} />
                        </TouchableOpacity>
                    </View>
                </View>

            </TouchableHighlight>
        )
    }
}

function setStyle() {
    if (Style != null && !CompanyConfig.isGeneral()) return Style;
    Style = StyleSheet.create({
        ModalHeader: {
            flexDirection: 'row',
            width: getResponsiveValue(1104),
            justifyContent: 'space-between'
            // marginTop: getResponsiveValue(30)
        },
        cancelstyle:{
            backgroundColor:'white'
        },
        resetView: {
            height: getResponsiveValue(110),
            width: getResponsiveValue(110),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: CompanyConfig.formatColor(CompanyConfig.AppColor.FocalFront, "b3"),
            borderTopRightRadius: getResponsiveValue(5),
            borderBottomRightRadius: getResponsiveValue(5),
        },
        resetText: {
            fontSize: getResponsiveFontSize(28),
            color: CompanyConfig.AppColor.ButtonFront,
        },
        back: {
            height: getResponsiveValue(69),
            width: getResponsiveValue(73),
            borderRadius: getResponsiveValue(40),
            // alignItems: "center",
            paddingLeft: getResponsiveValue(22),
            justifyContent: "center"
        },
        priceText: {
            marginLeft: getResponsiveValue(20),
            fontSize: getResponsiveFontSize(24),
            color: '#848484'
        },
        headerView: {
            height: getResponsiveValue(90),
            width: getResponsiveValue(AppConfig.design.width),
            flexDirection: 'row',
            alignItems: 'center',
            // backgroundColor: CompanyConfig.AppColor.OnPressSecondary,
        },
        Text: {
            fontSize: getResponsiveFontSize(32),
            color: CompanyConfig.AppColor.ContentFront,
        },
        touchText: {
            fontSize: getResponsiveFontSize(26),
            color: '#00a2e9',
        },
        memoText: {
            marginBottom: getResponsiveFontSize(20),
            fontSize: getResponsiveFontSize(28),
            color: '#252525',
            width: getResponsiveValue(1104),
            textAlign: "center",
        },
        touchTextView: {
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: getResponsiveValue(2),
            borderStyle: "solid",
            borderRadius: getResponsiveValue(5),
            borderColor: '#00a2e9',
            paddingLeft: getResponsiveValue(12),
            paddingRight: getResponsiveValue(12),
            marginLeft: getResponsiveValue(20),
            paddingTop: getResponsiveValue(7),
            paddingBottom: getResponsiveValue(7),
        },
        searchHeaderView: {
            backgroundColor: CompanyConfig.AppColor.Main,
            height: getResponsiveValue(110),
            flexDirection: 'row',
            alignItems: 'center'
        },
        touchAllCheck: {
            // width: getResponsiveValue(70),
            justifyContent: 'center',
            alignItems: 'center',
        },
        headerSearchInput: {
            paddingLeft: getResponsiveFontSize(20),
            fontSize: getResponsiveFontSize(32),
            padding: 0,
            width: getResponsiveValue(1154),
            height: getResponsiveValue(70),
            backgroundColor: CompanyConfig.formatColor(CompanyConfig.AppColor.SecondaryFront, "4d"),
            borderRadius: getResponsiveValue(10),
            color: CompanyConfig.AppColor.ContentFront,
        },
        headerTouchView: {
            width: getResponsiveValue(90),
            alignItems: 'center',
            justifyContent: 'center',
        },
        searchView: {
            position: "absolute",
            zIndex: 190,
            top: 0,
            right: getResponsiveValue(-AppConfig.design.width),
            flexDirection: "column-reverse",
            // width: getResponsiveValue(AppConfig.design.width),
        },
        multiple: {
            // marginTop: getResponsiveValue(11),
            // marginBottom: getResponsiveValue(11),
            borderTopLeftRadius: getResponsiveValue(10),
            borderBottomLeftRadius: getResponsiveValue(10),
            height: getResponsiveValue(70),
            backgroundColor: CompanyConfig.AppColor.MainFront,
            width: getResponsiveFontSize(610),
            justifyContent: 'center',
            alignItems: 'center',
            // borderRightWidth: getResponsiveValue(4),
            // borderColor: CompanyConfig.AppColor.Line,
        },
        DefaultImage: {
            // marginLeft: getResponsiveValue(20),
            width: getResponsiveValue(410),
            height: getResponsiveValue(313),
            borderTopLeftRadius: getResponsiveValue(10),
            borderTopRightRadius: getResponsiveValue(10),
        },
        product: {
            // marginTop: getResponsiveValue(11),
            // marginBottom: getResponsiveValue(11),
            height: getResponsiveValue(70),
            width: getResponsiveFontSize(610),
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: CompanyConfig.AppColor.MainFront,
            borderTopRightRadius: getResponsiveValue(10),
            borderBottomRightRadius: getResponsiveValue(10)
        },
        InputView: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            zIndex: 110,
            // marginTop: getResponsiveValue(26),
            width: getResponsiveValue(1222),
            height: getResponsiveValue(72.5),
            borderWidth: getResponsiveValue(1),
            // padding: getResponsiveValue(0.5),
            borderColor: CompanyConfig.AppColor.ButtonBg,
            borderRadius: getResponsiveValue(10)
        },
        BackColor: {
            backgroundColor: StyleConfig.PageBackground,
            flex: 1,
            alignItems: 'center',
        },
        ModelViewBackground: {
            flex: 1,
            backgroundColor: '#e4e4e4',
            marginTop: getResponsiveValue(50),
            marginBottom: getResponsiveValue(50),
            marginLeft: getResponsiveValue(75),
            marginRight: getResponsiveValue(75),
            borderRadius: getResponsiveValue(10),
            paddingLeft: getResponsiveValue(40),
            paddingRight: getResponsiveValue(40),
            paddingTop: getResponsiveValue(20),
            paddingBottom: getResponsiveValue(20),
            justifyContent: 'space-between',
        }
    })
    return Style;
}
