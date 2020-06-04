import React, { Component } from 'react';
import {
  StyleSheet,
  ImageBackground,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import PropTypes from "prop-types";
import ProductService from '../../services/product.js';
import AppConfig from '../../config/app.config.js';
import CompanyConfig from '../../config/company.config.js';
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme.js';
import ProductSearch from '../product/search.js';
import CustomHeader from '../../components/CustomHeader.js';
import NotFond from '../../components/NotFond.js';
import ProductListItem from '../../components/ProductListItem.js';
import SvgUri from '../../components/svguri.js';
let productStyles = null;

function setStyle() {
  if (productStyles != null && !CompanyConfig.isGeneral()) return productStyles;

  productStyles = StyleSheet.create({

    baseView: {
      flex: 1,
      backgroundColor: CompanyConfig.AppColor.PageBackground
    },

    bgimg: {
      flex: 1,
      flexDirection: "row",
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      zIndex: 2,
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
      width: getResponsiveValue(410),
      height: getResponsiveValue(63),
      backgroundColor: 'transparent',
    },
    productname: {
      color: "#FFFFFF",
      fontSize: getResponsiveFontSize(30),
      textAlign: 'left',
      textAlignVertical: 'center',
      marginLeft: getResponsiveFontSize(10),
      backgroundColor: 'transparent',
      marginTop: getResponsiveFontSize(6),
    },
    ProductStatusWap: {
      width: getResponsiveValue(105),
      height: getResponsiveValue(40),
      borderRadius: getResponsiveValue(18),
      marginBottom: getResponsiveValue(262),
      marginLeft: getResponsiveValue(288),
      justifyContent: 'center',
      flexDirection: "row",
    },
    ProductStatusSpace: {
      position: "absolute",
      width: getResponsiveValue(105),
      height: getResponsiveValue(40),
      borderRadius: getResponsiveValue(18),
      borderColor: "#caccd8",
      borderWidth: 1,
      opacity: 0.7,
      borderStyle: "solid",
      backgroundColor: "#000000",
      flexDirection: "row",
      zIndex: 1,
    },
    ProductStatusTextWap: {
      height: getResponsiveValue(40),
    },
    ProductStatusText: {
      includeFontPadding: false,
      fontSize: getResponsiveValue(25),
      marginLeft: getResponsiveValue(3),
      // lineHeight: getResponsiveValue(76),
      color: "#ffffff",
      zIndex: 2,
      textAlignVertical: 'center',
    },
    ProductStatusIcon: {
      width: getResponsiveValue(20),
      height: getResponsiveValue(21),
      marginLeft: getResponsiveValue(12),
      marginTop: getResponsiveValue(8),
      opacity: 1,
      zIndex: 2,
    },
    ProductTypeWap: {
      width: getResponsiveValue(94),
      // height: getResponsiveValue(34),
      opacity: 0.3,
      borderRadius: getResponsiveValue(16),
      backgroundColor: "#000000",
      zIndex: 3,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: getResponsiveValue(22),
      marginLeft: getResponsiveValue(310),
      padding: 0,
    },
    productTypeText: {
      color: "#ffffff",
      fontSize: getResponsiveFontSize(22),
      margin: 0,
      padding: 0,
      includeFontPadding: false,
      textAlign: 'center',
      textAlignVertical: 'center',
    },
    //商品图片区域样式
    imageblock: {
      flex: 1,
      flexDirection: "row",
      alignItems: 'center',
      justifyContent: 'center',
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
      zIndex: 3
    }
  });

  return productStyles;
}

const defaultImageUrl = AppConfig.defaultImage;
DefaultPageSize = 12;
const defaultMarginTop = 90;

//包含Header
export default class ProductListAll extends Component {
  status;

  static propTypes = {
    leftButtonImageSource: PropTypes.any,
    leftButtonOnPress: PropTypes.func,
    menu: PropTypes.any,
    searchViewBackHandler: PropTypes.func,  //搜索页返回事件
    searchViewSearchHandler: PropTypes.func,  //搜索页搜索事件
    showSearchViewHandler: PropTypes.func,  //加载搜索页事件
  };

  constructor(prop) {
    super(prop);
    this.isShowSearchView = this.isShowSearchView.bind(this);
    this.state = {
      ProductList: [],
      SearchObj: null,
      ShowSearchView: false,
      MarginTop: 0,
      Refreshing: true,
      HeaderText: '',
    }

    setStyle();
  }
  StartNo = 0
  IsMounted = false;
  ViewItemIndex = 0;    //滑动前的item编号
  IsShowHeader = true;
  MenuCategoryCode = null;   //导航菜单CategoryCode
  Title = '';
  UNSAFE_componentWillMount() {
    this.IsMounted = true;

    this.LoadMenuInfo();

    if (this.IsShowHeader) {
      this.setState({ MarginTop: defaultMarginTop });
    }
  }
  componentDidMount() {
    //默认显示搜索与否
    if (typeof (this.props.navigation.state.params) != 'undefined') {
      let showSearch = this.props.navigation.state.params.ShowSearch;
      if (typeof (showSearch) == "boolean" && showSearch) {

        this.isShowSearchView(true);
        this.refs["productlist"].setSearchViewBackAddress("Home");
      }
    }

    this.appendProducts();
  }

  componentWillUnmount() {
    this.IsMounted = false;
  }

  getMenu() {
    const { state } = this.props.navigation;
    let menu = this.props.menu;
    if ((typeof (menu) == 'undefined' || menu == null) && state.params) {
      if (typeof (state.params.menu) != 'undefined' && state.params.menu != null) {
        menu = state.params.menu;
      }
    }
    return menu;
  }

  LoadMenuInfo() {
    let menu = this.getMenu();
    if (menu != null) {
      this.Title = menu.MenuName;
    }
  }

  isShowSearchView(isShow) {
    this.refs["productlist"].isShowSearchView(isShow);
    this.isShowHeader(!isShow);

    if (isShow) {
      if (typeof (this.props.showSearchViewHandler) == 'function') {
        this.props.showSearchViewHandler();
      }
    }
  }

  isShowHeader(showHeader) {
    if (showHeader) {
      this.refs["customerheader"].show();
    } else {
      this.refs["customerheader"].hide();
    }
  }

  hiddenSearchViewAndSearch(searchObj) {
    this.state.ProductList = [];
    this.state.SearchObj = searchObj;
    this.appendProducts(0);
  }

  //上划下划事件
  viewItemChanged(e) {
    if (this.IsMounted) {
      if (e.viewableItems.length <= 0) {
        return;
      }

      let currentShowHeader = false;
      let currentViewItemIndex = e.viewableItems[0].index;

      if (currentViewItemIndex == 0) {
        currentShowHeader = true;
      }
      else if (currentViewItemIndex < this.ViewItemIndex) {
        currentShowHeader = true;
      }
      else if (currentViewItemIndex == this.ViewItemIndex) {
        return;
      }
      else {
        currentShowHeader = false;
      }

      this.ViewItemIndex = currentViewItemIndex;


      if (this.IsShowHeader == currentShowHeader) {
      } else {
        this.IsShowHeader = currentShowHeader;
        if (currentShowHeader) {
          this.refs["customerheader"].show();
        } else {
          this.refs["customerheader"].hide();
        }
      }
    }
  }

  appendProducts = (startNo) => {
  }

  searchViewBackHandler() {
    this.isShowHeader(true);
    if (typeof (this.props.searchViewBackHandler) == 'function') {
      this.props.searchViewBackHandler();
    }
  }

  searchViewSearchHandler() {
    this.isShowHeader(true);
    if (typeof (this.props.searchViewSearchHandler) == 'function') {
      this.props.searchViewSearchHandler();
    }
  }

  render() {
    setStyle();
    let marginStyles = { marginTop: getResponsiveValue(0) };
    let menu = this.getMenu();
    debugger;
    return (
      <ImageBackground style={productStyles.baseView} source={CompanyConfig.CompanyBGImg}>
        <ImageBackground style={[productStyles.bgimg, marginStyles]}  >
          <ProductList
            ref="productlist"
            menu={menu}
            navigation={this.props.navigation}
            onEndReached={this.appendProducts}
            useListHeader={false}
            searchViewBackHandler={() => this.searchViewBackHandler()}
            searchViewSearchHandler={() => this.searchViewSearchHandler()}
          />
        </ImageBackground>

        <CustomHeader title={this.state.HeaderText} ref="customerheader"
          leftButtonImageSource={this.props.leftButtonImageSource}
          leftButtonOnPress={this.props.leftButtonOnPress}
          rightButtonOnPress={() => this.isShowSearchView(true)} rightButtonImageSource="search"
          navigation={this.props.navigation} />
      </ImageBackground>
    );
  }
}


/// Product list view
export class ProductList extends Component {
  static propTypes = {
    menu: PropTypes.any,
    ProductList: PropTypes.any,
    onEndReached: PropTypes.func,
    navigation: PropTypes.any,
    useListHeader: PropTypes.bool,   //是否使用list在header处的空白
    handleViewableItemsChanged: PropTypes.func,   //显示行变更事件

    searchViewBackHandler: PropTypes.func,   //搜索页返回 事件
    searchViewSearchHandler: PropTypes.func,  //搜索页搜索 事件
    onViewableItemsChanged: PropTypes.func
  }
  StartNo = 0;
  IsMounted = false;
  MenuCategoryCode = null;   //导航菜单CategoryCode
  MenuSeriesSysNo = null;   //导航菜单SeriesSysNo
  MenuTag = null;   //导航菜单SeriesSysNo
  UseSelfData = true;
  DefaultPageSize = 100000;
  GetAllData = false;   //是否已查询出所有商品数据
  
  newer = {
		//CompanyID: "f54bc5fc-a541-4fd2-825e-2c41c1081a93"
		//CostPrice: 0
		DefaultImage: null,
		//DeliveryDate: null
		GroupProperties: "[]",
		ImageList: [],
		IsDownloadImg: 1,
		LastReplicationDate: "2019-08-15T15:36:29",
		Material: "其它",
		MerchantSysNo: 1431,
		Priority: 1339497,
		ProductCommonName: "RUI",
		ProductCommonSysNo: 1305301,
		ProductID: "",
		ProductList: "null",
		ProductName: "RUI",
		ProductNote: "",
		ProductStatus: 10,
		ProductTag: null,
		ProductType: 0,
		ProductionCycle: 0,
		PromotionPrice: 0,
		PromotionTitle: null,
		Properties: "[]",
		RetailPrice: 0,
		SKUModel: "r",
		SalePrice: 0,
		SeriesName: "R系列",
		SizeHeight: null,
		SizeLength: null,
		SizeWidth: null,
		Stock: 0,
		StyleName: null,
		SysNo: 1339497,
		Weight: null
	}
  constructor(prop) {
    super(prop);
    this.state = {
      ProductList: [],
      SearchText: null,
      SearchObj: null,
      ShowSearchView: false,
      MarginTop: 0,
      SearchHeaderText: '',
      Refreshing: true,
      MenuCode: null,
      GetDataOver: false
    }
    setStyle();
  }
  
  UNSAFE_componentWillMount() {
    
    if (!global.NeedLogin) {
      this.IsMounted = true;

    this.LoadMenuInfo();
    if (typeof (this.props.ProductList) != 'undefined' && this.props.ProductList != null) {
      this.UseSelfData = false;
    }
    this.appendProducts();
    } else {
      this.getProduct_NoLogined();
    }
  }

  componentWillUnmount() {
    this.IsMounted = false;
  }

  onEndReached = () => {
    
    if (!global.NeedLogin) {
      if (this.UseSelfData) {
        this.appendProducts();
      } else {
        if (typeof (this.props.onEndReached) != 'undefined') {
          this.props.onEndReached();
        }
      }
    } else {
      this.getProduct_NoLogined();
    }
    
  }

  getProduct_NoLogined() {
    let productService = new ProductService();
    let self = this;
    let SeriesSysNo = this.props.menu.PathParams;
    if(SeriesSysNo != null)
      SeriesSysNo = JSON.parse(SeriesSysNo).SeriesSysNo;
    productService.getProducts_NoLogin(global.CompanyConfig.companySysNo, SeriesSysNo).then(response => {
      let data = response.data;
      self.asingn(data)
      self.setState({ProductList: data})
    })
  }

  // This function is mainly used to assemble the same structure
  // as the original data. It has been considered for a long time, 
  // and no solution has been found. Therefore, it can only be assembled 
  // by overlapping itself by itself. If there are other better methods,
  // please change it. Very inefficient
  asingn(data) {
    if (data) {
      for (let index = 0; index < data.length; index++) {
        let outer = (data[index]);
        if (outer.ProductCommonImageList != null && outer.ProductCommonImageList.length > 0) {

          outer['ImageList'] = outer['ImageList'].concat(outer.ProductCommonImageList);
        }
        (data[index])['CommonProductList'] = [];
        ((data[index])['CommonProductList'])[0] = outer;
      }
    }
  }

  onViewableItemsChanged = (e) => {
    if (typeof (this.props.handleViewableItemsChanged) != 'undefined') {
      this.props.onViewableItemsChanged(e);
    }
  }

  appendProducts = (startNo) => {
    let thisObj = this;
    let productService = new ProductService();

    if (typeof (startNo) != 'undefined' && startNo != null && startNo > -1) {
      this.StartNo = startNo;
    }

    let searchStartNo = this.StartNo;
    thisObj.StartNo = thisObj.GetAllData ? thisObj.StartNo : this.StartNo + this.DefaultPageSize;

    if (!thisObj.GetAllData) {
      productService.GetProducts(searchStartNo, this.DefaultPageSize, this.state.SearchObj, this.MenuCategoryCode, this.MenuSeriesSysNo, this.MenuTag, (data) => {
        if (typeof (data) == 'undefined' || data == null || data.length == 0) {
          thisObj.GetAllData = true;
        }
        var newProductList = thisObj.state.ProductList.concat(data);
        if (thisObj.IsMounted) {
          thisObj.setState({
            ProductList: newProductList,
            GetDataOver: true
          });

          if (thisObj.state.SearchObj != null && typeof (thisObj.state.SearchObj.SearchHeaderText) != 'undefined' && thisObj.state.SearchObj.SearchHeaderText != null) {
            thisObj.setState({
              SearchHeaderText: thisObj.state.SearchObj.SearchHeaderText
            });
          }
        }
      });

    }

  }

  LoadMenuInfo() {
    let menu = this.props.menu;

    if (menu != null) {
      this.setMenuData(menu);
    }
  }

  isShowSearchView(isShow) {
    if (isShow && this.refs["productSearch"]) {
      this.refs["productSearch"].show();
    }
    else {
      if (this.refs["productSearch"]) {
        this.refs["productSearch"].hide();
      }
    }


    this.isShowHeader(!isShow);
  }

  isShowHeader(isShow) {
    if (typeof (this.props.isShowHeader) != 'undefined') {
      this.props.isShowHeader(isShow);
    }
  }

  setMenuData(menu) {
    if (menu.PathParams != null) {
      let mparmars = JSON.parse(menu.PathParams);
      if (typeof (mparmars.CategorySysNo) != 'undefined' && mparmars.CategorySysNo != null && mparmars.CategorySysNo > 0) {
        if (this.IsMounted) {
          this.MenuCategoryCode = mparmars.CategorySysNo;
        }

      }
      else if (typeof (mparmars.SeriesSysNo) != 'undefined' && mparmars.SeriesSysNo != null && mparmars.SeriesSysNo > 0) {
        if (this.IsMounted) {
          this.MenuSeriesSysNo = mparmars.SeriesSysNo;
        }

      }
      else if (typeof (mparmars.Tag) != 'undefined' && mparmars.Tag != null) {
        if (this.IsMounted) {
          this.MenuTag = mparmars.Tag;
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

  searchViewBackHandler() {
    this.isShowSearchView(false);

    if (typeof (this.props.searchViewBackHandler) != 'undefined') {
      this.props.searchViewBackHandler();
    }
  }

  searchViewSearchHandler(searchObj) {
    if (this.IsMounted) {
      this.state.ProductList = [];
      this.state.SearchObj = searchObj;
      this.isShowSearchView(false);   //隐藏搜索页

      this.setState({ GetDataOver: false });
    }

    this.GetAllData = false;
    this.appendProducts(0);
    if (typeof (this.props.searchViewSearchHandler) != 'undefined') {
      this.props.searchViewSearchHandler();
    }
  }

  setSearchViewBackAddress(address) {
    this.refs["productSearch"].setBackAddress(address);
  }
  
  getOffset() {
    return Dimensions.get('window')
  }

  disabled() {
    return this.getData().length > 9;
  }

  swapArr(arr, index1, index2) {
    arr[index1] = arr.splice(index2, 1, arr[index1])[0];
    return arr;
}
  render() {
    let productList = null
    let self = this
    let isDefList = [];
    let NonDefList = [];
    let NewproductList = [];
    productList = this.getData();
    if (productList.length > 0) {
      debugger;
      productList.forEach(i =>{
        if(i.DefaultImage !=""){
          NewproductList.push(i)
          NewproductList.sort((a,b) => b.priority-a.priority)
        }else
        {
          NonDefList.push(i);
          NonDefList.sort((a,b) => b.priority-a.priority);
        }
      })
      productList = null;
      productList = NewproductList.concat(NonDefList);
       productList.forEach(a => {
         a.CommonProductList.sort((c,d) => d.Priority-c.Priority)
         let tag = true;
         for(let i=0;i<a.ImageList.length;i++){
           if(a.ImageList[i].Path == null){
             continue;
           }
          if(a.ImageList[i].Path.indexOf(a.DefaultImage) != -1){
            a.ImageList = this.swapArr(a.ImageList,0,i);
            tag = false
          }   
         }
         if(tag){
           if(a.ImageList[0] != null){
              let img = JSON.parse(JSON.stringify(a.ImageList[0]))
              img.Path = a.CommonProductList[0].DefaultImage
              img.SysNo = 0
             a.ImageList.unshift(img)
           }
         }
       });
    }

    if (!productList || productList.length <= 0) productList = null
    setStyle();
    let { navigate } = this.props.navigation;
    return (
      <View style={[productStyles.productListView]} >
        {/* {
  <TouchableOpacity 
      activeOpacity={0.8} 
      style = {{ position: 'absolute', top: this.getOffset().height+200, left: this.getOffset().width+200, zIndex: 100}} 
      onPress={() => {
      navigate('Home')
      }}
      setOpacityTo = {{ value: 10, duration: 0.5}}>
      <Image style={{ width: getResponsiveFontSize(50), height: getResponsiveValue(50) }}
        source={require(`../../assets/icons/indexBtn.png`)}
      />
    </TouchableOpacity>
} */}
        <FlatList
          key={'shows'}
          ref = {(list) => this.productList = list }
          numColumns={3}
          data={productList}
          columnWrapperStyle={{ justifyContent: 'flex-start' }}
          keyExtractor={(item, index) => index}
          removeClippedSubviews={true}//用于将屏幕以外的视图卸载
          renderItem={({ item, index }) => (
            <ProductListItem
              backgrandImage={item.DefaultImage}
              isShouldSubString={false}
              title={item.ProductName}
              productTag={item.ProductTag}
              subscript={(item.SKUModel && item.SKUModel.length) > 20 ? item.SKUModel.substring(0, 2) + "..." : item.SKUModel}
              onPress={
                () => navigate('ProductDetail', { sysno: item.SysNo, index: index, ProductList: productList, ProductCommonSysNo: item.ProductCommonSysNo, SearchObj: { MenuCategoryCode: this.MenuCategoryCode, MenuSeriesSysNo: this.MenuSeriesSysNo, SearchObj: this.state.SearchObj } })
              }
            />
          )}
          onEndReached={this.onEndReached}
          onEndReachedThreshold='0.1'
          handleViewableItemsChanged={(e => this.onViewableItemsChanged(e))}
          refreshing={true}
          ListEmptyComponent={(
            (this.state.GetDataOver ? (<NotFond />) : null)
          )}
        />
        <ProductSearch
          ref="productSearch"
          backHandler={() => this.searchViewBackHandler()}
          searchHandler={(searchObj) => this.searchViewSearchHandler(searchObj)}
          navigation={this.props.navigation}
        />
        {/* Move Offset */}
        { this.disabled() && <TouchableOpacity
            style = {{ position: 'absolute', top: this.getOffset().height - 50, left: this.getOffset().width - 50, zIndex: 100}}
            activeOpacity = { 0.8 }
            onPress = { () => {
              if (this.disabled()) {
                this.productList.scrollToIndex({viewPosition: 0, index: 0});
              }
            }}
            setOpacityTo = {{ value: 10, duration: 0.5}}
          >
            <Image
              source = { require('../../assets/icons/scrollToIndex.png')}
              style = {{ width: getResponsiveFontSize(50), height: getResponsiveValue(50)}}
            />
            {/* <SvgUri width={getResponsiveValue(50)} height={getResponsiveValue(50)} fill={CompanyConfig.AppColor.PopupFront} source={require('../../assets/svg/scrollToIndex.svg')} /> */}
          </TouchableOpacity>}
      </View>
    )
  }
}

export class product {
  
  getProduct() {
    return pros = {
      BrandName: null,
      BrandSysNo: 0,
      CategoryCode: '',
      CategoryName: '',
      CommonProductList: [],
      DefaultImage: "",
      MerchantSysNo: 1431,
      ProductCommonSysNo: 0,
      ProductName: '',
      ProductTag: null,
      PromotionTitle: null,
      SeriesName: '',
      SeriesSysNo: 0,
      StyleName: null,
      StyleSysNo: 0,
      SysNo: 0,
      priority: 0
    }
  }
}