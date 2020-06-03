import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    ImageBackground,
    View,
    FlatList,
    TouchableWithoutFeedback,
    Dimensions,
    TouchableOpacity,
    Image
} from 'react-native';
import PropTypes from "prop-types";
import ProductService from '../../services/productsolution.js';
import AppConfig from '../../config/app.config.js';
import CompanyConfig from '../../config/company.config.js';
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme.js';
// import { StackNavigator } from 'react-navigation';
import ProductListItem from '../../components/ProductListItem.js';

import CustomHeader from '../../components/CustomHeader.js';
import FileHelper from '../../helpers/fileHelper.config.js';
import NotFond from '../../components/NotFond.js';

let productStyles = null;

function setStyle() {
    if (productStyles != null && !CompanyConfig.isGeneral()) return productStyles;

    productStyles = StyleSheet.create({

        baseView: {
            flex: 1,
            backgroundColor: CompanyConfig.AppColor.PageBackground,
        },

        emptyView: {
            height: getResponsiveValue(90),
            width: getResponsiveValue(1334),
            opacity: 0,
        },
        bgimg: {
            flex: 1,
            flexDirection: "row",
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            marginTop: getResponsiveValue(90),
        },


        productimage: {
            width: getResponsiveValue(410),
            height: getResponsiveValue(313),
            borderColor: "#FFFFFF99",
            marginLeft: getResponsiveValue(24),
            marginTop: getResponsiveValue(11),
            flexDirection: "column",
            justifyContent: 'flex-end',
            alignItems: 'center'
        },

        productnametransblock: {
            width: getResponsiveValue(410),
            height: getResponsiveValue(63),
            opacity: 0.5,
            zIndex: 1,
            position: "absolute",
        },

        productnameblock: {
            zIndex: 2,
            opacity: 1,
            position: "absolute",
            marginBottom: getResponsiveValue(100),
            width: getResponsiveValue(410),
            height: getResponsiveValue(63),
            backgroundColor: 'transparent',
        },
        productname: {
            color: "#ffffff",
            marginBottom: getResponsiveValue(10),
            marginLeft: getResponsiveFontSize(10),
            fontSize: getResponsiveFontSize(34),
            backgroundColor: 'transparent',
        },
        productTypeText: {
            color: "#ffffff",
            fontSize: getResponsiveFontSize(22),
            // top: getResponsiveValue(17),
            // zIndex: 14,
            // width: getResponsiveValue(88),
            // left: getResponsiveValue(313),
            margin: 0,
            padding: 0,
            // backgroundColor:'red',
            includeFontPadding: false,
            textAlign: 'center',
            textAlignVertical: 'center',
        },
        ProductTypeWap: {
            width: getResponsiveValue(88),
            height: getResponsiveValue(34),
            // opacity: 0.3,
            borderRadius: getResponsiveValue(16),
            backgroundColor: "#000000",
            zIndex: 3,
            marginTop: getResponsiveValue(19),
            marginLeft: getResponsiveValue(310)
        },
        //商品图片区域样式
        imageblock: {
            flex: 1,
            flexDirection: "row",
            alignItems: 'center',
            justifyContent: 'center',
            /*backgroundColor:'gray',*/
        },


        //搜索按钮样式
        searchStyle: {
            marginRight: getResponsiveValue(10),
            width: getResponsiveValue(50),
            height: getResponsiveValue(50),
        },

        productListView: {
            flex: 1,
            flexDirection: "row",
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            width: getResponsiveValue(1334),
            height: getResponsiveValue(AppConfig.design.height),
        }
    });

    return productStyles;
}


export default class ProductSolutionPage extends Component {
    static propTypes = {
        leftButtonImageSource: PropTypes.any,
        leftButtonOnPress: PropTypes.func,
        menu: PropTypes.any
    };
    status;
    constructor(prop) {
        super(prop);
        this.state = {
            ProductList: [],
            DefaultPageSize: 999,
            StartNo: 0,
            SearchText: null,
            SearchObj: {
                SearchText: '',
                SearchStyleSysNo: null,
                SearchSeriesSysNo: null,
            },
            ShowSearchView: false,
            Title: '空间方案',
            Menu: null,
        }
        setStyle();
    }
    static navigationOptions = ({ navigation, screenProps }) => ({
        header: null,
    });
    CheckLogin() {
        const { navigate } = this.props.navigation;
        global.storage.load(
            {
                key: 'loginState',
                autoSync: false
            }).then(auth => {
                if (auth != null) {

                }
                else {
                    navigate("Login");
                }
            }).catch(err => {
                navigate("Login");
            });
    }
    GetMenuInfo() {
        const { state } = this.props.navigation;
        var menu = this.props.menu;
        if (typeof (menu) != 'undefined' && menu != null) {
            return menu;
        }

        if (typeof (state.params) != 'undefined' && state.params != null) {
            if (typeof (state.params.menu) != 'undefined' && state.params.menu != null) {
                return state.params.menu;
            }
        }

        return null;
    }

    render() {
        setStyle();
        let marginStyles = { marginTop: getResponsiveValue(0) };
        let menu = this.GetMenuInfo();
        return (
            <ImageBackground style={productStyles.baseView} source={CompanyConfig.CompanyBGImg}>
                <CustomHeader title={this.state.Title}
                    leftButtonImageSource={this.props.leftButtonImageSource}
                    leftButtonOnPress={this.props.leftButtonOnPress}
                    navigation={this.props.navigation} />
                <ImageBackground style={[productStyles.bgimg, marginStyles]}  >
                    <ProductSolutionList ref="productlist" menu={menu} navigation={this.props.navigation} useListHeader={true} />
                </ImageBackground>
            </ImageBackground>
        );
    }
}

DefaultPageSize = 999;
export class ProductSolutionList extends Component {
    static propTypes = {
        menu: PropTypes.any,
        ProductList: PropTypes.any,
        onEndReached: PropTypes.func,
        navigation: PropTypes.any,
        useListHeader: PropTypes.bool,   //是否使用list在header处的空白
        onViewableItemsChanged: PropTypes.func,   //显示行变更事件
        // resetHeaderText: PropTypes.func,   //重置 headerText
    }
    StartNo = 0;
    IsMounted = false;
    MenuSeriesSysNo = null;   //导航菜单SeriesSysNo
    UseSelfData = true;
    GetAllData = false;   //是否已查询出所有空间方案数据
    constructor(prop) {
        super(prop);
        this.state = {
            ProductList: [],
            SearchObj: null,
            GetDataOver: false
        }
        this.onEndReached = this.onEndReached.bind(this);
        setStyle();
    }
    UNSAFE_componentWillMount() {
        this.IsMounted = true;
        if (typeof (this.props.ProductList) != 'undefined' && this.props.ProductList != null) {
            this.UseSelfData = false;
        }
    }
    componentDidMount() {
        this.LoadMenuInfo();
        this.appendProducts();
    }
    componentWillUnmount() {
        this.IsMounted = false;
    }

    onEndReached() {
        if (this.UseSelfData) {
            this.appendProducts();
        }
        else {
            if (typeof (this.props.onEndReached) != 'undefined') {
                this.props.onEndReached();
            }
        }
    }

    onViewableItemsChanged = (e) => {
        if (typeof (this.props.onViewableItemsChanged) != 'undefined') {
            this.props.onViewableItemsChanged(e);
        }
    }

    appendProducts = (startNo) => {
        let thisObj = this;
        let productService = new ProductService();

        if (typeof (startNo) != 'undefined' && startNo != null && startNo > -1) {
            this.state.StartNo = startNo;
        }

        let searchStartNo = this.StartNo;
        thisObj.StartNo = thisObj.GetAllData ? thisObj.StartNo : this.StartNo + DefaultPageSize;

        if (!thisObj.GetAllData) {

            productService.GetSolutionList(searchStartNo, DefaultPageSize, this.state.SearchObj, this.MenuSeriesSysNo, (data) => {
                if (typeof (data) == 'undefined' || data == null || data.length == 0) {
                    thisObj.GetAllData = true;
                }

                var newProductList = thisObj.state.ProductList.concat(data);

                if (thisObj.IsMounted) {
                    thisObj.setState({
                        ProductList: newProductList,
                        GetDataOver: true
                    });
                }
            });
        }
    }

    LoadMenuInfo() {
        if (typeof (this.props.menu) != 'undefined' && this.props.menu != null) {
            let menu = this.props.menu;
            this.setMenuData(menu);
        }
    }

    setMenuData(menu) {
        if (menu.PathParams != null) {
            let mparmars = JSON.parse(menu.PathParams);
            if (typeof (mparmars.SeriesSysNo) != 'undefined' && mparmars.SeriesSysNo != null && mparmars.SeriesSysNo > 0) {
                if (this.IsMounted) {
                    this.MenuSeriesSysNo = mparmars.SeriesSysNo;
                }
            }
        }
    }

    getData() {
        if (this.UseSelfData) {
            return this.state.ProductList;
        } else {
            return this.props.ProductList;
        }
    }

    getOffset() {
        return Dimensions.get('window')
      }
    
    disabled() {
        return this.getData().length > 9;
    }
    
    viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 }
    render() {
        setStyle();
        let { navigate } = this.props.navigation;
        let marginStyles = { marginTop: getResponsiveValue(0) };
        let ProductSolutionLists = this.getData();
        if(!ProductSolutionLists||ProductSolutionLists.length<=0){ProductSolutionLists=null}
        if (global.NeedLogin) {
            ProductSolutionLists = []
        }
        return (
            <View style={[productStyles.productListView]} >
                <FlatList
                    key={'shows'}
                    ref = {(list) => this.productList = list }
                    numColumns={3}
                    data={ProductSolutionLists}
                    columnWrapperStyle={{ justifyContent: 'flex-start' }}
                    keyExtractor={(item, index) => index}
                    removeClippedSubviews={true}//用于将屏幕以外的视图卸载
                    renderItem={({ item, index }) => (
                        <ProductListItem
                            isShouldSubString={true}
                            backgrandImage={item.DefaultImage}
                            title={item.Name}
                            subscript={item.SeriesName}
                            onPress={
                                () => navigate('ProductsolutionDetail', { sysno: item.SysNo, index: index, ProductsolutionList: this.state.ProductList, searchObj: { MenuCategoryCode: this.MenuCategoryCode, MenuSeriesSysNo: this.MenuSeriesSysNo, SearchObj: this.state.SearchObj } })
                            }
                        />
                        // <ProductSolutionItem searchObj={{ MenuSeriesSysNo: this.MenuSeriesSysNo }} navigation={this.props.navigation} model={item} />
                    )}
                    onEndReached={this.onEndReached}
                    onEndReachedThreshold='0.1'
                    onViewableItemsChanged={this.onViewableItemsChanged}
                    viewabilityConfig={this.viewabilityConfig}
                    refreshing={true}
                    ListEmptyComponent={(
                        (this.state.GetDataOver ? (<NotFond />) : null)
                    )}
                />
                {/* Move Offset */}
                {/* <TouchableOpacity
                    style = {{ position: 'absolute', top: this.getOffset().height - 50, left: this.getOffset().width - 50, zIndex: 100}}
                    activeOpacity = { 0.8 }
                    onPress = { () => {
                        this.productList.scrollToIndex({viewPosition: 0, index: 0});
                    }}
                    setOpacityTo = {{ value: 10, duration: 0.5}}
                >
                <Image
            source = { require('../../assets/icons/baktoindex.png')}
            style = {{ width: getResponsiveFontSize(50), height: getResponsiveValue(50)}}
          />
                </TouchableOpacity> */}
                {/* Move Offset */}
        { 
          this.disabled() && <TouchableOpacity
            style = {{ position: 'absolute', top: this.getOffset().height - 50, left: this.getOffset().width - 50, zIndex: 100}}
            activeOpacity = { 0.8 }
            onPress = { () => {
                this.productList.scrollToIndex({viewPosition: 0, index: 0});
            }}
            setOpacityTo = {{ value: 10, duration: 0.5}}
          >
            <Image
              source = { require('../../assets/icons/baktoindex.png')}
              style = {{ width: getResponsiveFontSize(50), height: getResponsiveValue(50)}}
            />
          </TouchableOpacity>
        }
        {/* {
            <TouchableOpacity 
                activeOpacity={0.8} 
                style = {{ position: 'absolute', top: this.getOffset().height - 50, left: this.getOffset().width, zIndex: 100}} 
                onPress={() => {
                navigate('Home')
                }}
                setOpacityTo = {{ value: 10, duration: 0.5}}>
                <Image style={{ width: getResponsiveFontSize(50), height: getResponsiveValue(50) }}
                  source={require(`../../assets/icons/indexBtn.png`)}
                />
              </TouchableOpacity>
        } */}
            </View>
        )
    }
}
// ListHeaderComponent={(
//     (typeof (this.props.useListHeader) == 'undefined' || this.props.useListHeader) ?
//         <View style={productStyles.emptyView}></View> : null
// )}

// ListEmptyComponent={(
//     (typeof (this.props.useListHeader) != 'undefined' && this.props.useListHeader) ?
//         <NotFond /> : null
// )}
export class ProductSolutionItem extends Component {

    constructor(prop) {
        super(prop);
        this.state = {
            // ImageUrl: AppConfig.defaultImage,
            ProductImage: AppConfig.defaultLoadingImage,
        }
        setStyle();
    }
    IsMounted = false;
    CharCount = 7;//显示商品名称的前12个字符
    UNSAFE_componentWillMount() {
        this.IsMounted = true;

    }
    componentDidMount() {
        this.getImageUrl();
    }
    componentWillUnmount() {
        this.IsMounted = false;
    }
    getImageUrl() {
        let thisObj = this;
        if (this.props.model.DefaultImage == null || this.props.model.DefaultImage == "") {
            thisObj.setState({ ProductImage: AppConfig.defaultNoImage });

        } else {
            FileHelper.fetchFile(this.props.model.DefaultImage).then((uri) => {
                if (thisObj.IsMounted) {
                    if (uri != null && uri != '') {
                        thisObj.setState({ ProductImage: { uri: uri } });
                    } else {
                        thisObj.setState({ ProductImage: AppConfig.defaultFailImage });
                    }
                }
            }).catch(function (error) {
                thisObj.setState({ ProductImage: AppConfig.defaultFailImage });
            });
        }
    }

    render() {
        setStyle();
        let { navigate } = this.props.navigation;
        return (
            <TouchableWithoutFeedback onPress={() => navigate('ProductsolutionDetail', { sysno: this.props.model.SysNo, searchObj: this.props.searchObj })}  >
                <ImageBackground resizeMode="cover" source={this.state.ProductImage} style={productStyles.productimage}  >
                    <View style={productStyles.productnametransblock}>
                    </View>
                    <ImageBackground source={require("../../assets/icons/title_bg.png")} style={productStyles.productnameblock}>
                        <View style={productStyles.productnameblock}>
                            <Text style={productStyles.productname} >{this.props.model.Name.substring(0, this.CharCount)}</Text>
                        </View>
                        {
                            this.props.model.SeriesName ? (<View>
                                <View style={productStyles.ProductTypeWap}>
                                    <Text style={productStyles.productTypeText} >{this.props.model.SeriesName.length > 3 ? this.props.model.SeriesName.substring(0, 2) + "..." : this.props.model.SeriesName}</Text>
                                </View>
                            </View>) : null
                        }
                    </ImageBackground>
                </ImageBackground>
            </TouchableWithoutFeedback>
        )
    }
}





