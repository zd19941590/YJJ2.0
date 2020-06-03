import React, { Component, PureComponent } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated, Platform,
  Image
} from 'react-native';
import ProductService from '../../services/product.js';
import ProductSolutionService from '../../services/productsolution.js';
import { getResponsiveValue, getResponsiveFontSize } from "../../assets/default.theme";
import CompanyConfig from '../../config/company.config.js';
import StyleConfig from '../../config/style.config.js';
import AppConfig from '../../config/app.config.js';
import Share from '../../helpers/shareHelper.config.js';
import CustomHeader from '../../components/CustomHeader.js';
import ProductsCheck from '../../components/ProductsCheck.js';
import AnalyticsUtil from '../../services/AnalyticsUtil';
import HorizonVerticalView from '../../components/HorizonVerticalView/Sliding.js';
import KeepAwake from "react-native-keep-awake";

const SPRING_CONFIG = { tension: 1, friction: 3 };//定义动画我们给弹性动画设置了 SPRING_CONFIG 配置，包括 tension（张力）和 friction（摩擦）值，会有一个小小回弹动画。
const SPRING_SPEACE = getResponsiveValue(-451);
let styles = null;
let ImageIndex = 0;
export default class ProductSolutionDetail extends Component {
  constructor(props) {
    super(props);
    setStyle();
  }
  state = {
    model: {
      ImageList: [],
      ProductList: [],
      ProductImgList: [],
      RealViewImgList: [],
      InstallationImgList: [],
      isReady: false
    },
    ProductsolutionList: [],
    resultImageList: [],
    startNum: 0,
    isCanShare: true,
    agreeShare: false,
    isShowShare: true,
    ImagePathList: [],
    dataList: [],
    isAotuScroll: false,

  };
  upDetal = null;
  NextDetail = null;
  SearchObj = {};
  ImagePath = "";
  TempProductSysNos = [];
  currIndex = 0;
  isAndroid = 'android' === Platform.OS;

  componentDidMount() {
    AnalyticsUtil.onEventWithLabel('ProductsolutionDetail', global.AppAuthentication ? global.AppAuthentication.APPCompanyName : global.APPCompanyName);
    if (this.props.navigation.state.params != null) {
      var listPageSearchObj = this.props.navigation.state.params.searchObj;
      if (typeof (listPageSearchObj) != 'undefined' && listPageSearchObj != null && typeof (listPageSearchObj.MenuSeriesSysNo) != 'undefined') {
        this.SearchObj = listPageSearchObj;
      }
      let index = this.props.navigation.state.params.index;
      let datalist = this.props.navigation.state.params.ProductsolutionList;
      if (datalist && datalist.length > 0) {
        let SolutionService = new ProductSolutionService();
        SolutionService.ResultToArray(datalist).then((data) => {
          let tempImageList = [];
          data.forEach((item) => {
            if (typeof (item.ImagePathList) == 'string') {
              item.ImagePathList = JSON.parse(item.ImageList);
            }
            tempImageList.push(item.ImagePathList);
          });
          // FIXED: Load empty image.
          tempImageList.forEach((item, index) => {
            if (item.length == 0 || item == null || item == undefined) {
              tempImageList[index] = ['pic-404'];
            }
          });
          this.setState({
            ProductsolutionList: data,
            resultImageList: tempImageList,
            startNum: index
          });
          this.currIndex = index;
          if (data[index]) {
            this.ImagePath = tempImageList[index][0];
          }
          let ImageList = this.state.ProductsolutionList[this.state.startNum].ImageList;
          let length = 0;
          if (!ImageList) {
            ImageList = [];
          }
          if (typeof (ImageList) == 'string') {
            ImageList = JSON.parse(ImageList);
          }
          length = ImageList.length;
          let permissionList = null;
          for (i = 0; i <= this.state.startNum; i++) {
            this.TempProductSysNos.push(0); //临时存放 选中的SysNO
          }
          global.storage.load({
            key: 'loginState',
            autoSync: false
          }).then(auth => {
            permissionList = auth.PermissionList;
            if (permissionList != null) {
              for (let i = 0; i < permissionList.length; i++) {
                if (permissionList[i].PermissionKey == "APP_ShareProductPicture") {
                  this.setState({
                    agreeShare: true,
                    isCanShare: length > 0
                  })
                };
              };
            }
          }).catch(err => {
            if (length <= 0) {
              this.setState({
                isCanShare: false
              });
            }
          });
        })
      }
    }
  }
  imgonpress() {
    let self = this;
    let isShow = self.refs["AnimatedWap"].hideAn();
    if (this.state.isShowShare) {
      this.setState({ isShowShare: isShow })
    } else {
      this.setState({ isShowShare: isShow })
    }

  }
  updateAnimatedModel(index) {
    let SysNo = 0;
    if (this.TempProductSysNos && this.TempProductSysNos.length >= index) {
      SysNo = this.TempProductSysNos[index]
    }
    if (this.refs['AnimatedWap']) {
      this.refs['AnimatedWap'].updateproductInfo(this.state.ProductsolutionList[index], SysNo)
    }
  }
  setPageList(productImgs, SysNo) {
    if (this.isAndroid) {
      if (this.refs["hvView"]) {
        this.refs["hvView"].changeCurrent(productImgs);
      }
    } else {
      var filterPhotos = [];
      this.state.resultImageList.forEach((array, index) => {
        if (index != this.currIndex) {
          filterPhotos.push(array);
        } else {
          filterPhotos.push(productImgs);
        }
      });
      filterPhotos.forEach((item, index) => {
        if (item.length == 0 || item == null || item == undefined) {
          filterPhotos[index] = ['pic-404'];
        }
      });
      this.refs['hvView'].setNativeProps({
        photos: filterPhotos
      });

    }
    if (!productImgs || productImgs.length == 0) {
      if (this.state.isCanShare) {
        this.setState({ isCanShare: false });
      }
    } else {
      if (!this.state.isCanShare) {
        this.setState({ isCanShare: true });
      }
    }
    if (this.TempProductSysNos && this.TempProductSysNos.length >= this.currIndex) {
      this.TempProductSysNos[this.currIndex] = SysNo;
    } else {
      this.TempProductSysNos.push(SysNo);
    }
    this.setShareImagePath(productImgs[0]);
  }
  setShowShare(isShow) {
    if (isShow != this.state.isCanShare) this.setState({ isCanShare: isShow });
  }
  setShareImagePath(currPath) {
    this.ImagePath = currPath;
    if (!this.ImagePath || this.ImagePath.length < 10) {
      this.setState({ isCanShare: false });
    } else {
      this.setState({ isCanShare: true });
    }
  }
  shareImage() {
    // const pro = this.state.ProductsolutionList
    // window.console.log(this.state)
    // window.console.log(pro)
    // window.console.log(ImageIndex)
    if (this.ImagePath) {
      Share.open({
        url: this.ImagePath,
        status: 0
      })
    }
  }

  startCarousel(times) {
    this.refs["AnimatedWap"].hideAn();
    this.setState({ isAotuScroll: true })
    if (this.refs["hvView"]) {
      this.refs["hvView"].startCarousel(times);
    }
  }
  cancelCarousel() {
    if (this.refs["AnimatedWap"]) {
      this.refs["AnimatedWap"].hideAn();
    }
    this.setState({ isAotuScroll: false, isCanShare: this.ImagePath && this.ImagePath.length > 10 })
    if (this.refs["hvView"]) {
      this.refs["hvView"].cancelCarousel();
    }
  }
  render() {
    setStyle();
    let { navigate } = this.props.navigation;
    return (
      <View style={styles.container}>
        {
          !this.state.isAotuScroll ?
            <CustomHeader sourceColor={StyleConfig.Secondary} sourceBackGroundColor={StyleConfig.Main} ref="header" navigation={this.props.navigation}></CustomHeader> : null
        }
        {
          this.state.ProductsolutionList != null && this.state.ProductsolutionList.length > 0 ?
            <HorizonVerticalView
              ref={"hvView"}
              style={styles.instructions}
              dataList={this.state.resultImageList}
              defaultIndex={this.state.startNum}
              onPagePress={() => {
                if (this.state.isAotuScroll) {
                  this.cancelCarousel();
                } else {
                  this.imgonpress();
                }
              }}
              onPageHorizonScroll={(index, ImagePath) => {
                if (this.TempProductSysNos.length <= index) {
                  this.TempProductSysNos.push(0);
                }
                this.currIndex = index;
                this.setShareImagePath(ImagePath);
                this.updateAnimatedModel(index, ImagePath);
              }}
              onVerticalPageScroll={(hIndex, vIndex, currPath) => {
                this.ImagePath = currPath;
              }}
            /> : null
        }
        {
          !this.state.isAotuScroll && this.state.isShowShare ?
            <View style={styles.LeftWap}>
              {
                this.state.isCanShare && this.state.agreeShare && this.state.isShowShare ? <TouchableOpacity activeOpacity={0.8} onPress={() => this.shareImage()} style={styles.Leftbutton}>
                  <Text style={styles.lefttext}>分享</Text>
                </TouchableOpacity> : null
              }
              <TouchableOpacity activeOpacity={0.8} style={styles.Leftbutton} onPress={() => {
                this.startCarousel(2000);
              }}>
                <Text style={styles.lefttext}>幻灯片</Text>
              </TouchableOpacity>
              {/** back to index page */}
              {/* <TouchableOpacity activeOpacity={0.8} style={styles.Leftbutton} onPress={() => {
                navigate('Home')
              }}>
                <Image style={{ width: getResponsiveValue(45), height: getResponsiveValue(45) }}
                  source={require(`../../assets/icons/indexBtn.png`)}
                />
              </TouchableOpacity> */}
            </View> : null
        }
        {
          this.state.ProductsolutionList != null && this.state.ProductsolutionList.length > 0 ?
            <AnimatedWap ref='AnimatedWap' model={this.state.ProductsolutionList[this.state.startNum]}
              tochart={() => { navigate('ShoppingCart') }} parent={this} onProductClick={(productImgs, SysNo) => { this.setPageList(productImgs, SysNo) }}
              setShowShare={(isShow) => { this.setShowShare(isShow) }}
            >
            </AnimatedWap> : null
        }
      </View>
    );
  }
}

export class AnimatedWap extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isShow: false,
      isShowProductDetail: false,
      selectSysNo: -1,
      isShowAll: true,
      pan: new Animated.ValueXY(),
      seat: 0,//记录动画的初始位置
      productInfo: {},
      chartNum: 0,
      hasOrder: false,
      productSoutionInfo: {},
      IsCanSwatch: true,
      ProductList: [],
      sultionInfo: {}
    };
    setStyle();
  }
  hideAn() {
    if (this.state.isShowAll) {
      this.setState({
        isShowAll: false,
      });
      return false;
    } else {
      this.setState({
        isShowAll: true,
      });
      return true;
    }
  }

  updateproductInfo(model, SysNo) {
    this.state.selectSysNo = SysNo;
    let SolutionService = new ProductSolutionService();
    SolutionService.checkeProduct(model, (data) => {
      this.setState({
        sultionInfo: data,
        productInfo: model,
        ProductList: data.ProductList,
        selectSysNo: SysNo,
        isShowProductDetail: SysNo != 0,
      });
    })
  }
  endAnimation() {
    Animated.sequence([
      Animated.spring(this.state.pan, {
        ...SPRING_CONFIG,
        toValue: { x: 0, y: 0 } //animate to top right
      }),
    ]).start();
    //this.state.seat = 1;
    this.setState({seat: 1});
  }


  UNSAFE_componentWillMount() {
    KeepAwake.activate();
    this.setState({
      productInfo: this.props.model,
      sultionInfo: this.props.model
    })
    // this.state.productInfo = this.props.model
    // this.state.sultionInfo = this.props.model
  }

  componentWillUnmount() {
    KeepAwake.deactivate();
  }

  componentDidMount() {
    this.checkeProduct();
    let permissionList = null;
    global.storage.load(
      {
        key: 'loginState',
        autoSync: false
      }).then(auth => {
        permissionList = auth.PermissionList;
        let order = permissionList.find(a => a.PermissionKey == "APP_SOManager");
        if (order) {
          this.setState({
            hasOrder: true
          })
        }
      }).catch(err => {
      });
  }
  checkeProduct() {
    let SolutionService = new ProductSolutionService();
    SolutionService.checkeProduct(this.props.model, (data) => {
      this.setState({
        ProductList: data.ProductList,
      });
    })
  }
  startAnimation(PSysNo) {
    if (PSysNo === this.state.selectSysNo) {
      this.state.seat = this.state.seat == 0 ? SPRING_SPEACE : 0;
      Animated.sequence([
        Animated.spring(this.state.pan, {
          ...SPRING_CONFIG,
          toValue: { x: this.state.seat, y: 0 } //animate to top right
        }),
      ]).start();
      return null;
    }
    else {
      let parentObj = this.props.parent;
      if (PSysNo > 0) {
        let model = this.props.model;
        let data = {};
        let ProductList = model.ProductList;
        if (model.ProductList) {
          if (typeof (ProductList) == 'string') {
            ProductList = JSON.parse(ProductList);
          }
          data = ProductList.find((item) => {
            return item.SysNo == PSysNo;
          })
          if (!data) {
            data = {};
          }
        }
        this.setState({
          productInfo: data,
          selectSysNo: PSysNo
        });
      } else {
        let model = this.props.model;
        this.setState({
          selectSysNo: PSysNo
        });
      }

      Animated.sequence([
        Animated.spring(this.state.pan, {
          ...SPRING_CONFIG,
          toValue: { x: SPRING_SPEACE, y: 0 } //animate to top right
        }),
      ]).start();
      this.state.seat = SPRING_SPEACE;
    }
  }
  //产品规格
  getProductLHW(productInfo) {
    let productService = new ProductService();
    return productService.getProductSpecStr(productInfo.Properties, productInfo.GroupProperties);
  }
  getStyle() {
    return [styles.righViewShowWap, {
      transform: this.state.pan.getTranslateTransform()
    }];
  }
  getmodel() {
    let model = this.state.sultionInfo;
     if(model.ProductList.length > 0)
        {
          for(let i = 0; i < model.ProductList.length; i++){
            if(model.ProductList[i].Url == null || model.ProductList[i].Url.length <=0){
              model.ProductList[i].Url = [model.ImagePathList[0]];
            }
          }
        }
    if (!model) {
      model = this.props.model;
      this.state.sultionInfo = model;
      return model;
    }
    //    return  this.state.IsCanSwatch? this.props.model:this.state.productInfo;
    if (this.state.selectSysNo > 0) {
      let data = {};
      if (typeof (model.ProductList) == 'string') model.ProductList = JSON.parse(model.ProductList);
      if (model && model.ProductList && model.ProductList.length > 0) {
        data = model.ProductList.find((item) => {
          return item.SysNo == this.state.selectSysNo;
        })
        return data;
      }
    }
    return this.state.productInfo;
  }

  getSpaceCountPrice() {
    let model = this.getmodel();
    if (model) {
      let productList = model.ProductList;
      let countPrice = 0;
      productList.forEach(item => {
        if (item.PromotionPrice == null || item.PromotionPrice == 0) {
          countPrice = countPrice + item.SalePrice;
        } else {
          countPrice = countPrice + item.PromotionPrice;
        }
        // if (item.PromotionPrice != item.SalePrice && item.PromotionPrice != 0) {
          
        // }
      })
      if (model.SalePrice < countPrice) {
        return countPrice;
      }
    }
    return model.SalePrice;
  }

  render() {
    setStyle();
    let model = this.getmodel();
    if (!model) model = {};
    let ProductList = this.state.ProductList;
    if (typeof (ProductList) == 'string') {
      ProductList = JSON.parse(ProductList);
    }
    if (ProductList == null || ProductList == undefined) {
      ProductList = [];
    }
    if (typeof (model.ProductList) == 'string') {
      model.ProductList = JSON.parse(model.ProductList);
    }
    if (this.state.isShowAll) {
      return (
        <Animated.View style={this.getStyle()}>
          {
            model && model.ProductList && model.ProductList.length > 0 && this.state.selectSysNo <= 0 ? <ProductsCheck
              ref={'ProductsCheck'}
              key={'ProductsCheck' + model.SysNo}
              title="自由组合方案"
              dataSource={model.ProductList}
              ChartInfo={this.state.ChartInfo}
              tochart={() => {
                this.props.tochart()
              }}
              chartNum={this.state.chartNum}
            ></ProductsCheck> : null
          }
          {/* space solution (right bar) and plz check the rule that is workspace */}
          <View style={styles.AnimatedView}>
            <View style={styles.right}>
              <TouchableOpacity activeOpacity={0.8} style={(this.state.selectSysNo <= 0 ? styles.SelectProuuctWap : styles.righttextwap)} onPress={() => {
                this.setState({
                  selectSysNo: 0,
                  IsCanSwatch: true,
                  isShowProductDetail: false,
                  productInfo: this.state.sultionInfo
                });
                if (model.ImageList && model.ImageList.length > 0) {
                  this.props.setShowShare(true);
                }
                if (this.props.onProductClick && this.state.selectSysNo > 0) {
                  // let re_ = this.props.model
                  this.props.onProductClick(this.state.sultionInfo.ImagePathList, 0);
                }
                this.startAnimation(0);
              }}>
                <Text style={(this.state.selectSysNo <= 0 ? styles.rightSelecttext : styles.righttext)} >空间方案</Text>
              </TouchableOpacity>
              {<ScrollView
                automaticallyAdjustContentInsets={false}
                horizontal={true}
                horizontal={false}
                style={[styles.scrollView, styles.horizontalScrollView]}>
                {
                  ProductList.map((product, index) => {
                    return <TouchableOpacity style={(this.state.selectSysNo == product.SysNo ? styles.SelectProuuctWap : styles.righttextwap)} key={product.Name + product.SysNo} activeOpacity={0.8} onPress={() => {
                      if (this.state.selectSysNo != product.SysNo) {
                        ImageIndex = index
                        this.setState({
                          isShow: true,
                          isShowProductDetail: true,
                          IsCanSwatch: false
                        });
                        if (model.ImageList && model.ImageList.length > 0) {
                          this.props.setShowShare(true);
                        }
                        if (this.props.onProductClick) {
                          this.props.onProductClick(product.Url, product.SysNo);
                        }
                      }
                      this.startAnimation(product.SysNo);
                    }}>
                      <Text numberOfLines={3} flex={3} key={product.Name + product.SysNo} style={this.state.selectSysNo == product.SysNo ? styles.selectrighttext : styles.righttext} >
                        {product.Name}
                      </Text>
                    </TouchableOpacity>
                  })
                }
              </ScrollView>}
            </View>
            <View style={[{ flexDirection: "column" }]}>
              <View style={styles.description}>
                {this.state.isShowProductDetail ? (
                  <View >
                    <View style={styles.ViewBorder}>
                      <Text style={styles.productName}>{model.ProductCommonName}</Text>
                    </View>
                    <View style={styles.VenterView}>

                      {(model.PromotionPrice == null || model.PromotionPrice == 0) ? (
                        <Text style={[styles.price, { marginTop: getResponsiveValue(8) }]}>售价：
                                                {(model.SalePrice > 0) ? model.SalePrice : '未设置价格'}</Text>
                      ) :
                        (model.PromotionPrice < model.SalePrice) ? (
                          <View>
                            <Text style={[styles.price, { textDecorationLine: 'line-through' }]}>售价：
                                                        {(model.SalePrice > 0) ? model.SalePrice : '未设置价格'}</Text>
                            <Text style={styles.descriptionText}>优惠价：{model.PromotionPrice}</Text>
                          </View>

                        ) : (<Text style={styles.price}>售价：{model.PromotionPrice}</Text>)}
                      <Text style={styles.descriptionText}>型号：{model.SKUModel}</Text>
                      <Text style={styles.descriptionText}>规格：{this.getProductLHW(model)}</Text>
                      <Text style={styles.descriptionText}>风格：{model.StyleName}</Text>
                      <Text style={styles.descriptionText}>系列：{model.SeriesName}</Text>
                      <Text style={styles.descriptionText}>材质：{model.Material}</Text>
                      <Text style={styles.miaosuText}>卖点：</Text>
                      <ScrollView
                        horizontal={false}
                        style={[styles.scrollView, styles.horizontalScrollView, { height: getResponsiveValue(506) }]}>
                        <Text style={styles.miaosuText}>       {model.ProductNote}</Text>

                      </ScrollView>
                    </View>
                  </View>) : (
                    <View>
                      <View style={styles.ViewBorder}>
                        <Text style={styles.productName}>{model ? model.Name : ''}</Text>
                      </View>
                      <View style={styles.VenterView}>
                        <Text style={styles.price}>售价：{model ? this.getSpaceCountPrice() : ''}</Text>
                        <Text style={styles.descriptionText}>系列：{model ? model.SeriesName : ''}</Text>
                        <Text style={styles.descriptionText}>风格：{model ? model.StyleName : ''}</Text>
                        <Text style={styles.descriptionText}>卖点：</Text>
                        <ScrollView
                          horizontal={false}
                          style={[styles.scrollView, styles.horizontalScrollView, { height: getResponsiveValue(506) }]}>
                          <Text style={styles.miaosuText}>       {model ? model.Description : ''}</Text>
                        </ScrollView>
                      </View>
                    </View>
                  )}
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

function setStyle() {
  if (styles != null && !CompanyConfig.isGeneral()) return styles;
  let config = CompanyConfig;
  styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: StyleConfig.Secondary,
    },
    welcome: {
      fontSize: 20,
      textAlign: 'center',
      margin: 10,
    },
    instructions: {
      height: getResponsiveValue(AppConfig.design.height),
      width: getResponsiveValue(AppConfig.design.width),
      backgroundColor: 'white',
    },
    shopBarImg: {
      width: getResponsiveValue(52),
      height: getResponsiveValue(52),
      borderWidth: getResponsiveValue(1),
      borderStyle: "solid",
      justifyContent: 'center',
      alignItems: 'center',
      // borderColor: StyleConfig.ButtonBg,
      borderColor: '#3a90e7',
      borderRadius: getResponsiveValue(26),
    },
    righViewShowWap: {
      position: "absolute",
      flexDirection: "column",
      zIndex: 100,
      top: 0,
      left: getResponsiveValue(1200),
      height: getResponsiveValue(AppConfig.design.height),
      width: getResponsiveValue(585),
    },
    leftViewwap: {
      position: "absolute",
      flexDirection: "column",
      top: getResponsiveValue(110),
      left: 0,
      height: getResponsiveValue(AppConfig.design.height),
      width: getResponsiveValue(107),
    },
    AnimatedView: {
      flexDirection: "row",
      width: getResponsiveValue(612),
      height: getResponsiveValue(AppConfig.design.height),
      //marginLeft:getResponsiveValue(472)
    },
    taojianText: {
      fontSize: getResponsiveValue(26),
      color: '#3a90e7',
    },
    shopBarNumWapbyTochat: {
      alignItems: "center",
      justifyContent: 'center',
      width: getResponsiveValue(65),
      height: getResponsiveValue(65),
      marginTop: getResponsiveValue(7),
      marginHorizontal: getResponsiveValue(10),
    },
    shopBarNumbyTochart: {
      fontSize: getResponsiveValue(20),
      color: "#ffffff",
      textAlign: 'center',
      backgroundColor: '#00000000'
      // marginBottom:getResponsiveValue(10),
    },
    Pagenumber: {
      flexDirection: "row",
      borderRadius: getResponsiveValue(19),
      color: StyleConfig.SecondaryFront,
      textAlign: "center",
      textAlignVertical: 'center',
      fontSize: getResponsiveValue(18),
    },
    SelectProuuct: {
      height: getResponsiveValue(60),
      textAlign: 'center',
      textAlignVertical: 'center',
      color: StyleConfig.MainFront,
      fontSize: getResponsiveFontSize(26),
    },
    ViewBorder: {
      borderColor: StyleConfig.OnPressLine,
      borderBottomWidth: getResponsiveValue(1),
      height: getResponsiveValue(80),
      alignItems: "center",
      justifyContent: "center",
      marginBottom: getResponsiveValue(8)
    },
    VenterView: {
      height: getResponsiveValue(AppConfig.design.height - 160),
    },
    productName: {
      // height: getResponsiveValue(80),
      // lineHeight: getResponsiveValue(80), // iOS增加两个这个属性，否则文字没有中间对齐
      fontSize: getResponsiveValue(34),
      color: StyleConfig.FocalFront,
      textAlign: 'center',
      textAlignVertical: 'center',
      paddingRight: getResponsiveValue(30)
    },
    back: {
      marginVertical: getResponsiveFontSize(20),
      // zIndex:999,
      marginLeft: getResponsiveValue(20),
      height: getResponsiveValue(86),
      borderRadius: getResponsiveValue(43),
      width: getResponsiveValue(86),
      // marginLeft: getResponsiveValue(20),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: StyleConfig.OnPressMain,
      // opacity: 0.4,
    },
    backImg: {
      width: getResponsiveValue(21),
      height: getResponsiveValue(37)
    },
    bgimg: {
      flex: 1,
      flexDirection: "row",
      width: getResponsiveValue(AppConfig.design.width),
      height: getResponsiveValue(AppConfig.design.height),
    },
    scrollStyle: {
      width: getResponsiveValue(AppConfig.design.width),
      height: getResponsiveValue(AppConfig.design.height),
    },
    NotFondbgimg: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: "row",
      width: getResponsiveValue(AppConfig.design.width),
      height: getResponsiveValue(AppConfig.design.height),
    },
    gallerbgimg: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: "column",
      width: getResponsiveValue(AppConfig.design.width),
      height: getResponsiveValue(AppConfig.design.height),
    },
    // backtext: {
    //     marginVertical: getResponsiveValue(20),
    //     flexDirection: "column",
    //     height: getResponsiveValue(86),
    //     color: '#FFFFFF',
    //     borderRadius: getResponsiveValue(43),
    //     width: getResponsiveValue(86),
    //     backgroundColor: StyleConfig.PopupBackground,
    //     textAlign: 'center',
    //     textAlignVertical: 'center',
    //     marginLeft: getResponsiveValue(20),
    //     opacity: 0.4,
    // },
    Leftbutton: {
      // position: 'absolute',
      // top: getResponsiveFontSize(120),
      // left: getResponsiveFontSize(0),
      height: getResponsiveValue(86),
      width: getResponsiveValue(86),
      borderRadius: getResponsiveValue(43),
      alignItems: 'center',
      justifyContent: 'center',
      // marginLeft: getResponsiveFontSize(21),
      marginVertical: getResponsiveFontSize(10),
      backgroundColor: CompanyConfig.formatColor(StyleConfig.Main, "e6"),
    },
    LeftWap: {
      flexDirection: "column",
      position: 'absolute',
      height: getResponsiveValue(400),
      width: getResponsiveValue(86),
      borderRadius: getResponsiveValue(43),
      // alignItems: 'center',
      // justifyContent: 'center',
      marginLeft: getResponsiveFontSize(21),
      top: getResponsiveFontSize(120),
      left: getResponsiveFontSize(0),
    },
    lefttext: {
      height: getResponsiveValue(30),
      textAlign: "center",
      textAlignVertical: "center",
      color: StyleConfig.SecondaryFront,
      fontSize: getResponsiveFontSize(24),
      lineHeight: getResponsiveValue(30),
      overflow: "hidden",
    },
    SelectProuuctWap: {
      borderTopLeftRadius: getResponsiveValue(10),
      borderBottomLeftRadius: getResponsiveValue(10),
      marginVertical: getResponsiveValue(10),
      backgroundColor: CompanyConfig.AppColor.ButtonBg,
      opacity: 0.9,
    },
    righttextwap: {
      borderTopLeftRadius: getResponsiveValue(10),
      borderBottomLeftRadius: getResponsiveValue(10),
      opacity: 0.9,
      marginVertical: getResponsiveValue(10),
      backgroundColor: StyleConfig.Main,
      // backgroundColor:CompanyConfig.formatColor(StyleConfig.PopupBackground, "40"),
    },
    selectrighttext: {

      marginVertical: getResponsiveValue(10),
      textAlign: 'center',
      textAlignVertical: 'center',
      color: CompanyConfig.AppColor.ButtonFront,
      fontSize: getResponsiveFontSize(16),
      //height: getResponsiveFontSize(108),
    
      // backgroundColor:CompanyConfig.formatColor(StyleConfig.PopupBackground, "40"),
    },
    righttext: {
      marginVertical: getResponsiveValue(10),
      textAlign: 'center',
      textAlignVertical: 'center',
      color: StyleConfig.SecondaryFront,
      fontSize: getResponsiveFontSize(16),
      //height: getResponsiveFontSize(108)

      // backgroundColor:CompanyConfig.formatColor(StyleConfig.PopupBackground, "40"),
    },
    rightSelecttext: {
      marginVertical: getResponsiveValue(10),
      textAlign: 'center',
      textAlignVertical: 'center',
      color: CompanyConfig.AppColor.ButtonFront,
      fontSize: getResponsiveFontSize(26),
      height: getResponsiveFontSize(36)

      // backgroundColor:CompanyConfig.formatColor(StyleConfig.PopupBackground, "40"),
    },
    left: {
      flexDirection: "column",
      height: getResponsiveFontSize(750),
      width: getResponsiveValue(110),
    },
    contentleft: {
      position: "absolute",
      zIndex: 100,
      width: getResponsiveValue(AppConfig.design.width),
      height: getResponsiveValue(AppConfig.design.height),
    },
    content: {
      flexDirection: "row",
      width: getResponsiveValue(612),
      height: getResponsiveValue(AppConfig.design.height),
    },
    right: {
      height: getResponsiveValue(AppConfig.design.height),
      flexDirection: "column",
      width: getResponsiveValue(140),
      
    },
    description: {
      flex: 1,
      flexDirection: "column",
      width: getResponsiveValue(472),
      height: getResponsiveValue(AppConfig.design.height),
      // opacity: 0.6,
      backgroundColor: StyleConfig.PopupBackground,
      shadowColor: "rgba(16, 19, 34, 0.96)",
      shadowOffset: {
        width: getResponsiveValue(-4),
        height: 0
      },
      shadowRadius: getResponsiveValue(70),
      shadowOpacity: 1,
      opacity: 0.95
    },
    descriptionText: {
      fontSize: getResponsiveValue(24),
      lineHeight: getResponsiveValue(38),
      marginLeft: getResponsiveValue(20),
      color: StyleConfig.FocalFront,
      paddingRight: getResponsiveValue(20)
    },
    price: {
      fontSize: getResponsiveValue(24),
      lineHeight: getResponsiveValue(38),
      marginLeft: getResponsiveValue(20),
      color: "red",
      paddingRight: getResponsiveValue(20)
    },
    shoppingWap: {
      flexDirection: "row",
      height: getResponsiveValue(80),
      width: getResponsiveValue(450),
      backgroundColor: StyleConfig.PopupBackground,
    },
    shoppingWapTextWap: {
      position: "absolute",
      right: 0,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "red",
      height: getResponsiveValue(80),
      width: getResponsiveValue(160)
    },
    miaosuText: {
      fontSize: getResponsiveValue(24),
      lineHeight: getResponsiveValue(38),
      width: getResponsiveValue(400),
      marginLeft: getResponsiveValue(20),
      color: StyleConfig.FocalFront,
    },
    pageIndexWap: {
      position: "absolute",
      zIndex: 100,
      bottom: getResponsiveValue(20),
      left: getResponsiveValue(-660),
      backgroundColor: StyleConfig.Main,
      height: getResponsiveValue(40),
      width: getResponsiveValue(110),
      opacity: 0.8,
      borderRadius: getResponsiveValue(20),
      flexDirection: "column",
      alignItems: "center",
      justifyContent: 'center',
    },
  })
  return styles;
}