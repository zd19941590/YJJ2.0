import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
  UIManager,
  findNodeHandle, 
  Platform, 
  Image,
  WebView,
  Alert
} from 'react-native';
import PropTypes from "prop-types";

import ProductService from '../../services/product.js';
import { getResponsiveValue, getResponsiveFontSize } from "../../assets/default.theme";
import CompanyConfig from '../../config/company.config.js';
import StyleConfig from '../../config/style.config.js';
import Share from '../../helpers/shareHelper.config.js'
import SvgUri from '../../components/svguri.js';
import CustomHeader from '../../components/CustomHeader.js';
import OperationMessage from '../../components/OperationMessage.js';
import ProductsCheck from '../../components/ProductsCheck.js';
import { joinstr } from "../../helpers/utils";
import AnalyticsUtil from '../../services/AnalyticsUtil';
import CommonService from '../../services/common.js';
import FileHelper from '../../helpers/fileHelper.config.js';
import { GetCompanyID } from "../../helpers/utils";
// import ImgScrillView from '../common/ImgScrollView.js';
import PhotoBrowser from '../../components/HorizonVerticalView/Sliding.js';
import KeepAwake from "react-native-keep-awake";


const SPRING_CONFIG = { tension: 5, friction: 4.5 };//定义动画我们给弹性动画设置了 SPRING_CONFIG 配置，包括 tension（张力）和 friction（摩擦）值，会有一个小小回弹动画。
const SPRING_SPEACE = -getResponsiveValue(252);
var { width, height } = Dimensions.get('window');

export default class ProductDetails extends Component {
  static propTypes = {
    sysno: PropTypes.number
  }
  constructor(props) {
    super(props);
    setStyle();
  }
  state = {
    shouldRefreshMenu: true,
    isShow: false,
    isShowProductDetail: false,
    selectSysNo: 0,
    isShowAll: true,
    pan: new Animated.ValueXY(),
    seat: 0,//记录动画的初始位置
    imgType: 2,//2 实景图(幻灯片)3图纸
    productInfo: {
      ProductName: '',
      SKUModel: '',
      SalePrice: 0.0,
      Material: '',//材质
      SizeLength: '',//长
      SizeWidth: '',//宽
      SizeHeight: '',//高
      PromotionTitle: '',//卖点
      ImageList: [],
      HasSo: false,
    },
    FirstLoad: false,//首次不渲染
    ShowImages: [],//当前展示的图片
    imageSize: 0,
    SearchObj: {},
    isReady: false,
    ProductCommonList: [],
    startnum: 0,
    resultImageList: [],
    ProductCommon: {},
    photos: [], // photo browser数据源 
    currentSection: 0,
    previousSection: 0,

    isAotuScroll: false
  };
  currenPath = "";
  isAndroid = 'android' === Platform.OS;
  TempProductSysNos = [];
  currentIndex = 0;
  static navigationOptions = ({ navigation, screenProps }) => ({
    header: null,
  });
  UNSAFE_componentWillMount() {
    KeepAwake.activate();
    AnalyticsUtil.onEventWithLabel('ProductDetail', global.AppAuthentication ? global.AppAuthentication.APPCompanyName : global.APPCompanyName);
  }
  componentWillUnmount() {
    KeepAwake.deactivate();
  }

  async downFileList(fileList) {
    if (fileList != null && fileList.length > 0) {

      for (let i = fileList.length - 1; i >= 0; i--) {
        let f = fileList[i];
        let reg = /(\.png|\.jpg|\.jpeg|\.gif|\.bmp)$/i;
        // 删除非图片文件。
        if (!reg.test(f.Path)) {
          fileList.splice(i, 1);
        }
      }

      if (fileList.length == 0) return;

      let alist = [];

      for (let fi = 0; fi < fileList.length; fi++) {
        let p = fileList[fi].Path;
        alist.push(FileHelper.GetLocalFileOrHttpUri(p,()=>{
          // FileHelper.fetchFile(p);
      }));
        // alist.push(FileHelper._checkFileIsAndGetLoacUrl(p));
      }
      let imgs = await Promise.all(alist);
      if (imgs.length == 0) {
        imgs = []
      }

      return imgs;
    }
    return [];
  }
  componentDidMount() {
    let thisObj = this;
    thisObj.state.FirstLoad = true;
    let params = this.props.navigation.state.params;

    if (params) {
      if (params.sysno != null) {
        proudctsysno = params.sysno;//ProductCommonSysNo
        productcommonsysNo = params.ProductCommonSysNo;//ProductCommonSysNo
        this.state.SearchObj = params.SearchObj;
      } else {
        proudctsysno = this.props.sysno;
      }
      let resultList = [];
      let photos = [];
      if (params.ProductList) {
        let productImgList = [];
        params.ProductList.forEach((item) => {
          if (item.ImageList && typeof (item.ImageList) == 'string') {
            item.ImageList = JSON.parse(item.ImageList);
          }
          resultList.push(item.ImageList);
          let prodctImg = thisObj.downFileList(item.ImageList)
          productImgList.push(prodctImg);
        });
        Promise.all(productImgList).then((ps) => {
          photos = ps;
          photos.forEach((item, index) => {
            if (item == null || item == undefined || item.length == 0) {
              photos[index] = ['pic-404'];
            }
          });
          this.setState({
            startnum: params.index,
            ProductCommonList: params.ProductList,
            resultImageList: resultList,
            photos: photos
          });
          if (photos[params.index] && photos[params.index].length > 0) {
            this.currenPath = photos[params.index][0];
          } else {
            this.currenPath = null;
          }
        });
      }
      for (i = 0; i <= params.index; i++) {
        this.TempProductSysNos.push(0);//临时存放 选中的SysNO
      }
      let pInfo = params.ProductList[params.index].CommonProductList[0];
      this.state.productInfo = pInfo;
      this.state.ProductCommon = params.ProductList[params.index];
      this.currentIndex = params.index;
    }
  }

  hiddenOrShow() {
    if (this.refs['AnimatedWap']) {
      this.refs['AnimatedWap'].hiddenOrShow();
    }
    if (this.refs['LeftMenu']) {
      this.refs['LeftMenu'].hiddenOrShow();
    }
  }
  hidden() {
    if (this.refs['AnimatedWap']) {
      this.refs['AnimatedWap'].hidden();
    }
    if (this.refs['LeftMenu']) {
      this.refs['LeftMenu'].hidden();
    }
  }
  /**  this.currenPath*/
  shareImage() {
    if (this.currenPath && this.currenPath.length > 0) {
      const info = this.state.productInfo
      Alert.alert('分享', '亲，分享图片还是链接呢？', [
        {
          text: '图片',
          onPress: () => {
            Share.open({
              url: this.currenPath,
              status: 0
            })
          }
        },
        {
          text: '链接',
          onPress: () => {
            Share.open({
              url: `http://www.lixiantuce.com/company/productDetial?sysNo=${info.SysNo}&merchantSysNo=${info.MerchantSysNo}`,
              status: 1
            })
          }
        }
      ])
    } else {
      Alert.alert('没有选中图片', [
        {
          text: '确定',
          style: 'cancle'
        }
      ])
    }
  }
  updateAnimatedModel(index, IsHasImage) {
    let SysNo = 0;
    if (this.TempProductSysNos && this.TempProductSysNos.length >= index) {
      SysNo = this.TempProductSysNos[index]
    }
    // changeProductModel
    if (this.state.ProductCommonList && index < this.state.ProductCommonList.length) {
      let p = this.state.ProductCommonList[index];
      if (p) {
        let pInfo = {};
        if (SysNo > 0) {
          pInfo = p.CommonProductList.find((a) => {
            return a.SysNo == SysNo
          })
        } else {
          pInfo = p.CommonProductList[0];
        }

        if (IsHasImage == undefined) {
          IsHasImage = pInfo.ImageList ? pInfo.ImageList.length > 0 : false
        }
        if (this.refs['AnimatedWap']) {
          this.refs['AnimatedWap'].changeProductModel(pInfo, p.CommonProductList, IsHasImage, SysNo);
        }
        if (this.refs['LeftMenu']) {
          this.refs['LeftMenu'].changeProductModel(pInfo, p.CommonProductList, IsHasImage, SysNo);
        }
        // if (this.refs['AnimatedWap']) {
        //     this.refs['AnimatedWap'].changeProductModel(pInfo, p.CommonProductList, IsHasImage, SysNo);
        // }
      }
    }
  }

  setPageList(productImgs, SysNo) {

    if (productImgs == null || productImgs.length == 0) {
      return;
    }

    if (this.TempProductSysNos && this.TempProductSysNos.length >= this.currentIndex) {
      this.TempProductSysNos[this.currentIndex] = SysNo;
    } else {
      this.TempProductSysNos.push(SysNo);
    }
    if (this.isAndroid) {
      this.downFileList(productImgs).then((result) => {
        this._photoBrowser.changeCurrent(result);
        if (result && result.length > 0) {
          this.currenPath = result[0];
        } else {
          this.currenPath = null;
        }
      })
    } else {
      var filePath = this.downFileList(productImgs)
      var filterArray = [];
      var filterPhotos = [];
      filterArray.push(filePath);
      Promise.all(filterArray).then((result) => {
        this.state.photos.forEach((array, index) => {
          if (index != this.state.currentSection) {
            filterPhotos.push(array);
          } else {
            filterPhotos.push(result[0]);
          }
        });
        this.state.shouldRefreshMenu = false;
        this._photoBrowser.setNativeProps({
          photos: filterPhotos
        });
        // this._photoBrowser.resetPhotos(filterPhotos)
      });
    }
  }
  startCarousel(times) {
    if (this._photoBrowser) {
      this._photoBrowser.startCarousel(times);
    }
    this.hidden();
    this.setState({ isAotuScroll: true })
  }
  cancelCarousel() {
    if (this._photoBrowser) {
      this._photoBrowser.cancelCarousel();
    }
    this.hiddenOrShow();
    this.setState({ isAotuScroll: false });
  }
  render() {
    setStyle();
    let self = this;
    let { navigate } = this.props.navigation;
    window.console.log(self.state.photos)
    return (
      <View style={styles.bgimg}>
        <OperationMessage ref="messageBar" />
        {
          !this.state.isAotuScroll ?
            <CustomHeader sourceColor={StyleConfig.Secondary} sourceBackGroundColor={StyleConfig.Main} ref="header" navigation={this.props.navigation}></CustomHeader> : null
        }
        {self.state.photos == null || self.state.photos.length == 0 ? null : (
          <PhotoBrowser style={styles.photoBrowser}
            dataList={self.state.photos}
            onPageHorizonScroll={(index, ImagePath) => {
              this.currenPath = ImagePath;
              this.state.currentSection = index;
              this.currentIndex = index;
              this.updateAnimatedModel(index, this.currenPath && this.currenPath.length > 10)
              if (this.TempProductSysNos.length <= index) {
                this.TempProductSysNos.push(0);
              }
            }}
            onVerticalPageScroll={(hIndex, vIndex, currPath) => {
              this.currenPath = currPath;
            }}
            defaultIndex={this.state.startnum}
            onPagePress={() => {
              if (this.state.isAotuScroll) {
                this.cancelCarousel();
              } else {
                this.hiddenOrShow()
              }
            }}
            ref={(e) => this._photoBrowser = e} />
        )}
        {
          self.state.FirstLoad && self.state.photos.length > 0 ? (
            <LeftMenu ref="LeftMenu" shareImage={() => { self.shareImage() }} tochart={() => { navigatenavigate('ShoppingCart') }} model={self.state.productInfo}
              navigation = { this.props.navigation }
              startCarousel={() => { this.startCarousel(1800) }}
              pList={self.state.ProductCommon.CommonProductList} parent={self}
              // onProductClick={(productImgs, shouldfetchFile, SysNo) => { this.setPageList(productImgs, shouldfetchFile, SysNo) }}
              imgList={this.state.resultImageList[this.state.startnum]} />) : null
        }
        {
          self.state.FirstLoad && self.state.photos.length > 0 ? (
            <AnimatedWap ref="AnimatedWap" shareImage={() => { self.shareImage() }} tochart={() => { navigate('ShoppingCart') }} model={self.state.productInfo}
              pList={self.state.ProductCommon.CommonProductList} parent={self}
              onProductClick={(productImgs, SysNo) => { this.setPageList(productImgs, SysNo) }}></AnimatedWap>
          ) : null
        }
      </View >
    )
  }
}

export class LeftMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShow: null,
      selectSysNo: 0,
      isShowAll: true,
      pan: new Animated.ValueXY(),//动画初始化值
      seat: 0,//记录动画的初始位置
      imgType: 2,//2 实景图(幻灯片)3图纸
      showCostPrice: false,
      isSlectInfoTitle: true,
      oldselectProperties: [],//上次选择的
      selectProperties: [],//当前选择的
      isReload: false,//仅用于 重新reader
      singleNumber: 0,//单品数量
      IsShowSpec: false,
      slectCommonSpec: [],//用于多商品多规格 记录商品的 规格 和commonSysno [[commonSysno:int, spec:[]]]
      selectCommonSysno: [],//用于多商品时 存储选中的商品的commonSysno
      productInfo: null,
      chartNum: 0,
      productList: [],
      ChartInfo: [],
      ImageList: {},
      hasOrder: false,
      ShowImages: {},
      showTip: false,
      agreeShare: false,
      IsHasImage: true,
      isLogin: true,
    };
    this.tipsStyle = null;
    this.tipsText = null;
    this.productProlist = null;
    this.proCommprops = null;
    this.renderproCommprops = null;

    setStyle();
  }

  ChangeRender(chooseSpecProduct) {
    if (chooseSpecProduct) {
      this.setState({ productInfo: chooseSpecProduct });
    }
  }
  componentDidMount() {
    let model = this.props.model;
    if (model.Properties) {
      let PropertiesInfo = null;
      if (typeof (model.Properties) == 'string') {

        PropertiesInfo = JSON.parse(model.Properties);
      } else {
        PropertiesInfo = model.Properties
      }
      if (PropertiesInfo) {
        let temp = [];
        PropertiesInfo.map((item, index) => {
          // = [{ pSysNo: item.pSysNo, cSysNo: item.ValueSysNo, Name: item.Name }]
          temp.push({ pSysNo: item.pSysNo, cSysNo: item.ValueSysNo, Name: item.Name })
          // this.state.selectProperties.push({ pSysNo: item.pSysNo, cSysNo:item.ValueSysNo, Name: item.Name })
        });
        // this.state.selectProperties = temp;
        // this.state.selectSysNo = model.SysNo;
      }
    }

    let permissionList = null;
    global.storage.load(
      {
        key: 'loginState',
        autoSync: false
      }).then(auth => {
        permissionList = auth.PermissionList;
        let share = permissionList.find(a => a.PermissionKey == "APP_ShareProductPicture");
        let order = permissionList.find(a => a.PermissionKey == "APP_SOManager");
        if (share && order) {
          this.setState({
            agreeShare: true,
            hasOrder: true,
            isLogin: true
          });
        } else if (share && !(order)) {
          this.setState({
            agreeShare: true,
            hasOrder: false,
            isLogin: true

          });
        } else if ((!share) && order) {
          this.setState({
            agreeShare: false,
            hasOrder: true,
            isLogin: true

          });
        } else {
          this.setState({
            isLogin: false
          });
        }
      }).catch(err => {
        this.setState({
          isLogin: false
        });
      });

  }
  //操作动画界面显示隐藏
  hiddenOrShow() {
    if (this.state.isShowAll) {
      this.setState({
        isShowAll: false, isShow: null, seat: 0
      });
    } else {
      this.setState({
        isShowAll: true, isShow: null, seat: 0
      });
    }
  }
  hidden() {
    this.setState({
      isShowAll: false, isShow: null, seat: 0
    });
  }
  //改变  【介绍】 【规格】选中状态
  checkSlectInfoTitle(bool) {
    this.props.parent.refs["AnimatedWap"].checkSlectInfoTitle(bool);
  }
  startAnimation() {
    this.props.parent.refs["AnimatedWap"].startAnimation();
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
      }).catch(err => {
        //   console.log(err);
      });
  }
  //判断规格是否被选中 返回值 true false
  checkIsSelect(sysno) {
    if (this.state.selectProperties && this.state.selectProperties.length > 0) {
      //   let result =  this.state.selectProperties.filter((item)=>{ })
      let result = this.state.selectProperties.filter((item) => { return item.cSysNo == sysno });
      if (result && result.length > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  //获取产品规格属性
  getProductSpecStr() {
    let productService = new ProductService();
    return productService.getProductSpecStr(this.props.model.Properties, this.props.model.GroupProperties);
  }
  productNumber(number) {
    this.state.singleNumber = number;
  }
  //判断是否多规格   传入 【商品信息】 返回【bool】  
  isManySpec(productInfo) {

    if (this.state.productList.length === 1) {
      return false;
    }
    if (typeof productInfo.GroupProperties === 'string') {

      productInfo.GroupProperties = JSON.parse(productInfo.GroupProperties);
    }
    if (productInfo && productInfo.GroupProperties) {
      if (productInfo.GroupProperties && productInfo.GroupProperties.length == 0) {
        this.state.IsShowSpec = true;
        return false;
      } else if (productInfo.GroupProperties && productInfo.GroupProperties.length == 1 && ((!productInfo.GroupProperties[0].ValueList) || productInfo.GroupProperties[0].ValueList.length <= 1)) {
        this.state.IsShowSpec = true;
        return false;
      } else {
        this.state.IsShowSpec = false;
        return true;
      }
    } else {
      this.state.IsShowSpec = true;
      return false;
    }
  }
  checkSpecIsExit(ProItems, VSysNo) {
    let self = this;
    let Productlist = self.productProlist;
    //let
    if (self.state.selectProperties.length === 0) {
      self.renderproCommprops = self.proCommprops;
      return true;
    };


    if (self.state.selectProperties.length > 0) {
      let selectProductlis = [];
      Productlist.map(e => {
        let sel = self.state.selectProperties.every(sp => {
          return e.Properties.some(ep => ep.PCSysNo === sp.pSysNo && ep.ValueSysNo === sp.cSysNo);
        });
        if (sel) {
          selectProductlis.push(e);
        }
      });
      let leavePr = [];
      if (selectProductlis.length <= 0) {
        let prlistPros = [];
        Productlist.map(e => {
          let temp = e.Properties.some(ep => ep.PCSysNo === ProItems.PCSysNo && ep.ValueSysNo === VSysNo);
          if (temp) {
            prlistPros.push(e.Properties);
          }
        });
        if (prlistPros.length > 0) {
          let renderproCommpropsTemp = [].concat([], self.renderproCommprops);
          let temp = renderproCommpropsTemp.findIndex(e => e.PCSysNo === ProItems.PCSysNo);
          renderproCommpropsTemp.splice(temp, 1);
          let selectp = null;
          renderproCommpropsTemp.some(e => {
            return e.ValueList.some(ev => {
              let selectemp = self.state.selectProperties.find(sel => sel.cSysNo === ev.SysNo);
              if (selectemp) {
                selectp = selectemp;
                return true;
              } else {
                return false;
              }
            })
          });
          if (selectp !== null) {
            let prlisitlist = prlistPros.filter(e => {
              return e.some(ee => ee.ValueSysNo === selectp.cSysNo);
            });
            if (prlisitlist.length > 0) {
              let sl = self.state.selectProperties.find(sel => sel.pSysNo !== selectp.pSysNo && sel.pSysNo !== ProItems.PCSysNo);
              if (sl) {
                let prlisitlistlist = prlisitlist.filter(e => {
                  return e.some(ee => ee.ValueSysNo === sl.cSysNo);
                });
                if (prlisitlistlist.length > 0) {

                } else {
                  let tempnum = self.state.selectProperties.findIndex(sel => sel.pSysNo === sl.pSysNo);
                  self.state.selectProperties.splice(tempnum, 1);
                  self.checkSpecIsExit(ProItems, VSysNo);
                }
              }
            } else {
              let sl = self.state.selectProperties.find(sel => sel.pSysNo !== selectp.pSysNo);
              if (sl) {
                let prlisitlist = prlistPros.filter(e => {
                  return e.some(ee => ee.ValueSysNo === sl.cSysNo);
                });
                if (prlisitlist) {
                  let tempnum = self.state.selectProperties.findIndex(sel => sel.pSysNo !== sl.pSysNo && sel.pSysNo !== ProItems.PCSysNo);
                  self.state.selectProperties.splice(tempnum, 1);
                  self.checkSpecIsExit(ProItems, VSysNo);
                } else {

                }
              } else {

              }
            }
          } else {

          }
        }
      } else {
        selectProductlis.map(e => {
          let le = e.Properties.filter(fi => {
            return fi.PCSysNo !== ProItems.PCSysNo;
          });
          if (le && le.length > 0) {
            if (leavePr.length === 0) {
              le.map(l => {
                let temp = {
                  Name: l.Name,
                  PCSysNo: l.PCSysNo,
                  ValueList: [{
                    SysNo: l.ValueSysNo,
                    Value: l.Value
                  }]
                };
                leavePr.push(temp);
              })
            } else {
              le.map(l => {
                let le = leavePr.find(lp => lp.PCSysNo === l.PCSysNo);
                if (le) {
                  let les = le.ValueList.some(lev => lev.SysNo === l.ValueSysNo);
                  if (les) {
                  } else {
                    let temp = {
                      SysNo: l.ValueSysNo,
                      Value: l.Value
                    }
                    le.ValueList.push(temp);
                  }
                }
              });
            }
          }
        });
        let temp = null;
        self.renderproCommprops.map(e => {
          if (leavePr.length > 0) {
            temp = leavePr.find(le => le.PCSysNo === e.PCSysNo);
            if (temp) {
              var exit = self.state.selectProperties.find(s => s.pSysNo === temp.PCSysNo);
              if (exit) {

                e.ValueList.map(ee => {
                  ee.disable = false;
                });
              } else {
                e.ValueList.map(ee => {
                  var ttt = temp.ValueList.some(t => t.SysNo === ee.SysNo);
                  if (ttt) {
                    ee.disable = false;
                  } else {
                    ee.disable = true;
                  }
                });

              }
            } else {
              e.ValueList.map(ee => {
                ee.disable = false;
              });
            }
          }
        });
      };
      // self.state.oldselectProperties = [].concat([], self.state.selectProperties);
    }

  }
  getProductBySpec(productInfo, isShowTips) {
    let bortherObj = this.props.parent;
    if (typeof productInfo.GroupProperties === 'string') {

      productInfo.GroupProperties = JSON.parse(productInfo.GroupProperties);
    }
    if (this.state.selectSysNo == 0 && productInfo && this.state.selectProperties.length === 0 || this.state.selectProperties.length < productInfo.GroupProperties.length && isShowTips) {
      if (bortherObj && bortherObj.refs['messageBar']) {
        bortherObj.refs['messageBar'].show("请选择规格", 3);
      }
    } else if (this.state.selectProperties && this.state.selectProperties.length >= productInfo.GroupProperties.length) {
      let list = this.state.productList;
      let result = {};
      if (list && list.length > 0) {
        list.forEach((item) => {
          let isAllTrue = true;
          if (item.Properties && typeof (item.Properties) === 'string') {

            item.Properties = JSON.parse(item.Properties)
          }
          if (item.Properties) {
            item.Properties.forEach((p, index) => {
              let info = this.state.selectProperties.find(x => x.cSysNo == p.ValueSysNo);
              isAllTrue = isAllTrue && (info != null);
              if (index + 1 == item.Properties.length && index + 1 == this.state.selectProperties.length && isAllTrue) {
                result = item;
              }
            })
          }
        })
        if (result && result.SysNo > 0) {
          this.setState({
            productInfo: result
          })
          return result;
        } else {
          if (bortherObj && bortherObj.refs['messageBar']) {

            bortherObj.refs['messageBar'].show("未找到商品信息，请更新数据，或该商品已下架！", 2);
          }
          return null;
        }
      } else {
        return null;
      }
    } else {
      return null;
    }

  }
  getProductmodel() {
    if (!this.state.productInfo) {
      let info = {};
      if (this.props.model && this.props.model.SysNo > 0) {
        info = this.props.model;
      }

      this.state.productInfo = info;
      if (info.ProductList && typeof (info.ProductList) == 'string') {
        info.ProductList = JSON.parse(info.ProductList);
      }
      // this.state.productList = this.props.pList;
      if (info.Properties) {
        if (typeof (info.Properties) == 'string') {
          info.Properties = JSON.parse(info.Properties);
          if (info.Properties && info.Properties.length > 0) {
            info.Properties.forEach((item, index) => {
              // this.state.selectProperties.push({ pSysNo: item.PCSysNo, cSysNo: item.ValueSysNo, Name: item.Name })
            })
          }
        }
      }
      let showimgList = this.props.imgList;
      this.state.IsHasImage = showimgList ? showimgList.length > 0 : false;
    }
    if (this.state.productList && this.state.productList.length == 0) {
      this.state.productList = this.props.pList;
    }

  }

  ShowProductsCheck() {
    if (this.refs['ProductsCheck']) {
      this.refs['ProductsCheck'].Controllmodal(true);
    }
  }
  setDefultSpec(model) {

    if (model && model.Properties) {
      if (typeof (model.Properties) == 'string') {
        model.Properties = JSON.parse(model.Properties);
      }
      let temp = [];
      model.Properties.map((item, index) => {
        temp.push({ pSysNo: item.pSysNo, cSysNo: item.ValueSysNo, Name: item.Name });
      })
      //
      this.state.selectProperties = temp;
    }
  }

  getProductProperties(productList) {
    let Productlistpros = [];
    let ProCommprops = [];

    if (productList) {
      productList.map(pro => {
        pro.Properties = pro.GroupProperties;
        if (pro.Properties.length > 0) {
          if (typeof pro.Properties === 'string') {
            pro.Properties = JSON.parse(pro.Properties);
          }
          pro.Properties.map(ppro => {
            if (ProCommprops.length > 0) {
              let comm = ProCommprops.find(p => p.Name === ppro.Name);
              if (comm && comm !== null) {
                let tempcomm = {
                  SysNo: ppro.ValueSysNo,
                  Value: ppro.Value
                };
                if (comm.ValueList.length > 0) {
                  var ex = comm.ValueList.every(x => x.SysNo !== ppro.ValueSysNo);
                  if (ex) {
                    comm.ValueList.push(tempcomm);
                  }
                } else {
                  comm.ValueList.push(tempcomm);
                }
              } else {
                let comm = {
                  Name: ppro.Name,
                  ValueList: [{
                    SysNo: ppro.ValueSysNo,
                    Value: ppro.Value
                  }],
                  PCSysNo: ppro.PCSysNo
                }
                ProCommprops.push(comm);
              }
            } else {
              let comm = {
                Name: ppro.Name,
                ValueList: [{
                  SysNo: ppro.ValueSysNo,
                  Value: ppro.Value
                }],
                PCSysNo: ppro.PCSysNo
              }
              ProCommprops.push(comm);
            }
          })
        }
        pro.CommonGroupProperties = ProCommprops;
      });
      productList.map(pro => {
        let p = {
          SysNo: pro.SysNo,
          Properties: pro.Properties
        };
        Productlistpros.push(p);
      });
      this.productProlist = Productlistpros;
      this.proCommprops = this.renderproCommprops = ProCommprops;
    }
  }

  _showTips(dom, infotext) {
    let self = this;
    UIManager.measure(findNodeHandle(dom), (x, y, width, height, pageX, pageY) => {
      self.tipsStyle = {
        left: pageX + width + getResponsiveValue(9),
        top: pageY + height / 2 - getResponsiveValue(38) / 2
      };
      self.tipsText = infotext;
      self.setState({ showTip: true });
      self.timeout && clearTimeout(self.timeout);
      self.timeout = setTimeout(() => {

        self.setState({ showTip: false });
      }, 2000);
    });
  }
  shareImage() {
    this.props.shareImage();
  }
  componentWillUnmount() {
    this.timeout && clearTimeout(this.timeout);
  }
  setShare(show) {
    this.setState({ IsHasImage: show });
  }
  _getPro(propes) {

    if (typeof propes === 'string') {
      propes = JSON.parse(propes);
    }
    let prlist = [];
    if (propes.length > 0) {
      propes.map(e => {
        prlist.push(e.Value);
      });
      return joinstr(prlist, " ");
    }
  }
  //获取长图
  gotoLongImageDetail(productSysNo){
    const { navigate } = this.props.navigation
    let menuItem = {
      PathParams:
      {
        LinkPath:`http://www.lixiantuce.com/company/productDetial?sysNo=${productSysNo}&merchantSysNo=${GetCompanyID()}`
    }}
    navigate("Product720", { menu: menuItem });
    // let imageList = []  
    // productService.GetLongImageDetails(productSysNo).then((res)=>{
    //   let imageInfoList = res.data
    //   // imageInfoList.forEach((a)=>{
    //   //   imageList.push(a.ImageDefaultUrl)
    //   // })     
    //   // 配置长图的链接接口
    //   // console.error(imageInfoList,"我要看的内容")
    //   navigate("ImageListScroll",{ImageList:imageInfoList})
    //   // navigate("Product720",{menu:{PathParams:{CategorySysNo:0,DetailSysNo:0,SeriesSysNo:0,LinkPath:'http://www.lixiantuce.com/company/productDetial?sysNo=1409882&nerchantSysNo=1431'}}})
    //   // navigate('Product720', { menu: {SysNo:1025965,ParentSysNo:0,ParentName:null,MenuName:'商品链接',LinkCode:'Product720',LinkPath:null,PathParams:{CategorySysNo:0,DetailSysNo:0,SeriesSysNo:0,LinkPath:'http://www.lixiantuce.com/company/productDetial?sysNo=1409882&nerchantSysNo=1431'},ParamsName:null,SortIndex:1,Memo:null,defaultImage:null,MouseOverImage:null,Children:[]} })
    // });

  }

  changeProductModel(changemodel, changemodellist, IsHasImage, SysNo) {
    if (changemodel && changemodel.Properties && typeof (changemodel.Properties) == 'string') {
      changemodel.Properties = JSON.parse(changemodel.Properties);
    } else {
      changemodel.Properties = {};
    }
    let t = changemodel.Properties;
    let Properties = []
    if (t && t.length > 0 && SysNo > 0) {
      t.forEach((item) => {
        let P = {
          pSysNo: item.PCSysNo,
          Name: item.Name,
          cSysNo: item.ValueSysNo
        }
        Properties.push(P)
      })
    }

    this.state.selectProperties = Properties;
    this.state.productList = changemodellist;
    // this.setState({ productInfo: changemodel, IsHasImage: IsHasImage, isReload: false, isShow: null, showTip: false });
    if (this.state.isShow) {
      this.setState({ productInfo: changemodel, IsHasImage: IsHasImage, isShow: 1, isReload: false, showTip: false });
    } else {
      this.setState({ productInfo: changemodel, IsHasImage: IsHasImage, isReload: false, showTip: false });
    }
  }

  render() {
    setStyle();
    this.getProductmodel();
    let model = this.state.productInfo;
    if ((!model.ProductImages) && this.state.ImageList && this.state.ImageList.data && this.state.ImageList.SysNo == model.SysNo) {
      model.ProductImages = this.state.ImageList.data;
    }
    this.getProductProperties(this.state.productList);
    if (this.renderproCommprops === null || this.renderproCommprops.length === 0) {
      GroupPropertiesStr = this.renderproCommprops = this.proCommprops;
    } else {
      GroupPropertiesStr = this.renderproCommprops;
    }
    if (model.ProductName && model.ProductName.length > 15) {
      ProductName = model.ProductName.substring(0, 14) + '...';
    } else {
      ProductName = model.ProductName;
    }
    if (model.ProductTag && typeof (model.ProductTag) == 'string') {
      model.ProductTag = model.ProductTag.split(',')
    }

    if (model.ProductList && typeof model.ProductList == 'string') {
      model.ProductList = JSON.parse(model.ProductList);
    };
    // debugger
    if (this.state.isShowAll) {
      return (
        <View style={{ position: 'absolute', width: getResponsiveValue(190) }}>
          {
            model.ProductList && model.ProductList.length > 0 && this.state.hasOrder ?
              <ProductsCheck ref='ProductsCheck'
                title="自由组合套件"
                key={'ProductsCheck' + model.SysNo}
                ChartInfo={this.state.ChartInfo}
                dataSource={model.ProductList}
                chartNum={this.state.chartNum}
                tochart={() => {
                  this.props.tochart()
                }}
                model={model}
              ></ProductsCheck> : null
          }
          <View style={{}}>
            {this.state.showTip ? (
              <View style={[{
                position: "absolute",
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }, this.tipsStyle]}>
                <SvgUri width={getResponsiveValue(5)} height={getResponsiveValue(12)} fill={"#ffffff"} source={"leftarrow"} />
                <Text style={{
                  fontSize: getResponsiveFontSize(24),
                  color: "#222222",
                  textAlign: 'center',
                  backgroundColor: '#ffffff',
                  borderRadius: getResponsiveValue(10),
                  paddingVertical: getResponsiveValue(2),
                  paddingHorizontal: getResponsiveValue(10),
                  overflow: 'hidden'
                }} >
                  {this.tipsText}
                </Text>
              </View>
            ) : null}
            <TouchableOpacity
              activeOpacity={0.8}
              ref={(ref) => this.Touch_info = ref}
              style={[styles.introducebtn, { marginTop: getResponsiveValue(114), backgroundColor: this.state.isShow === 1 ? CompanyConfig.AppColor.ButtonBg : StyleConfig.Main }]}
              onPress={() => {
                if (this.state.isShow === null) {
                  this.state.isShow = 1;
                  this._showTips(this.Touch_info, "详情");
                  this.startAnimation();
                } else {
                  if (Math.abs(this.state.isShow) == 1) {
                    // this.state.isShow = -this.state.isShow;
                    //this.state.isShow = null;
                    this.setState({ isShow: null });
                    this.startAnimation();
                  } else {
                    this.state.isShow = 1;
                    this._showTips(this.Touch_info, "详情");

                  }
                };
                this.checkSlectInfoTitle(true);
              }}>
                <SvgUri width={getResponsiveValue(36)} height={getResponsiveValue(36)} fill={
                  this.state.isShow === 1 ? CompanyConfig.AppColor.Secondary : StyleConfig.SecondaryFront
                } source={"productinfo"} />
            </TouchableOpacity>
            {
              this.state.productList && this.state.productList.length > 1 ?
                <TouchableOpacity
                  ref={(ref) => this.Touch_spec = ref}
                  activeOpacity={0.8} style={[styles.introducebtn, { backgroundColor: this.state.isShow === 2 ? CompanyConfig.AppColor.ButtonBg : StyleConfig.Main }]} onPress={() => {
                    if (this.state.isShow === null) {
                      this.state.isShow = 2;
                      this._showTips(this.Touch_spec, "规格");
                      this.startAnimation();
                    } else {
                      if (Math.abs(this.state.isShow) === 2) {
                        this.setState({ isShow: null });
                        this.startAnimation();
                      } else {
                        this.state.isShow = 2;
                        this._showTips(this.Touch_spec, "规格");

                      }
                    };
                    this.checkSlectInfoTitle(false);
                  }}>
                  <View style={{
                    width: getResponsiveValue(80),
                    height: getResponsiveValue(80),
                    justifyContent: "center",
                    alignItems: 'center'
                  }}>
                    <View style={{
                      position: 'absolute', top: 0, right: 0, backgroundColor: '#ffffff',
                      width: getResponsiveValue(28),
                      height: getResponsiveValue(28),
                      borderRadius: getResponsiveValue(14),
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Text style={{
                        fontSize: getResponsiveFontSize(18),
                        color: "#222222",
                        textAlign: 'center',
                      }}>
                        {this.productProlist.length}
                      </Text>
                    </View>
                    <SvgUri width={getResponsiveValue(36)} height={getResponsiveValue(36)} fill={
                      this.state.isShow === 2 ? CompanyConfig.AppColor.Secondary : StyleConfig.SecondaryFront
                    } source={"spec"} />
                  </View>
                </TouchableOpacity>
                : null
            }

            {
              model.ProductList && model.ProductList != 'null' && model.ProductList != null && model.ProductList.length > 0 && this.state.selectSysNo == 0 && this.state.isLogin ?
                <TouchableOpacity activeOpacity={0.8} style={[styles.introducebtn, { backgroundColor: StyleConfig.Main }]} onPress={() => {
                  this.ShowProductsCheck();
                }}>
                  <SvgUri width={getResponsiveValue(36)} height={getResponsiveValue(36)} fill={StyleConfig.SecondaryFront} source={"combination"} />
                </TouchableOpacity> : null
            }
            {/* 幻灯片 */}
            <TouchableOpacity activeOpacity={0.8} style={[styles.introducebtn, { backgroundColor: StyleConfig.Main }]} onPress={() => {
              if (this.props.startCarousel) {
                this.props.startCarousel()
              }
            }}>
              {/* <SvgUri width={getResponsiveValue(36)} height={getResponsiveValue(36)} fill={StyleConfig.SecondaryFront} source={"combination"} /> */}
              <Image style={{ width: getResponsiveValue(36), height: getResponsiveValue(36) }}
                source={require(`../../assets/icons/slide.png`)}
              />
            </TouchableOpacity>
            {/** back to index page */}
            {/* <TouchableOpacity activeOpacity={0.8} style={[styles.introducebtn, { backgroundColor: StyleConfig.Main }]} onPress={() => {
              navigate('Home')
            }}>
              <Image style={{ width: getResponsiveValue(45), height: getResponsiveValue(45) }}
                source={require(`../../assets/icons/indexBtn.png`)}
              />
            </TouchableOpacity> */}
            {/* 分享 */}
            {this.state.agreeShare && this.state.IsHasImage ? <TouchableOpacity activeOpacity={0.8} style={[styles.introducebtn, { backgroundColor: StyleConfig.Main }]} onPress={() => {
              this.shareImage()
              //this.startAnimation();
            }}>
              <SvgUri width={getResponsiveValue(36)} height={getResponsiveValue(36)} fill={StyleConfig.SecondaryFront} source={"share"} />
            </TouchableOpacity> : null}
            {/* 长图 */}
            <TouchableOpacity activeOpacity={0.8} style={[styles.introducebtn, { backgroundColor: StyleConfig.Main }]} onPress={() => {
                this.gotoLongImageDetail(model.SysNo)
              }}>
                <SvgUri width={getResponsiveValue(36)} height={getResponsiveValue(36)} fill={StyleConfig.SecondaryFront} source={"longimage"} />
            </TouchableOpacity> 
          </View>
        </View>
      );
    } else {
      return null;
    }
  }
}

export class AnimatedWap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShow: null,
      selectSysNo: 0,
      isShowAll: true,
      pan: new Animated.ValueXY(),//动画初始化值
      seat: 0,//记录动画的初始位置
      imgType: 2,//2 实景图(幻灯片)3图纸
      showCostPrice: false,
      isSlectInfoTitle: true,
      oldselectProperties: [],//上次选择的
      selectProperties: [],//当前选择的
      isReload: false,//仅用于 重新reader
      singleNumber: 0,//单品数量
      IsShowSpec: false,
      slectCommonSpec: [],//用于多商品多规格 记录商品的 规格 和commonSysno [[commonSysno:int, spec:[]]]
      selectCommonSysno: [],//用于多商品时 存储选中的商品的commonSysno
      productInfo: null,
      chartNum: 0,
      productList: [],
      ChartInfo: [],
      ImageList: {},
      hasOrder: false,
      ShowImages: {},
      showTip: false,
      agreeShare: false,
      seeCompanyStock: false, //查看商品详情厂商库存信息
    };
    this.tipsStyle = null;
    this.tipsText = null;
    this.productProlist = null;
    this.proCommprops = null;
    this.renderproCommprops = null;
    setStyle();
  }

  componentDidMount() {
    let self = this;
    let model = this.props.model;

    if (model.Properties) {
      let PropertiesInfo = null;
      if (typeof (model.Properties) == 'string') {
        PropertiesInfo = JSON.parse(model.Properties);
      } else {
        PropertiesInfo = model.Properties
      }
      if (PropertiesInfo) {
        let temp = [];
        PropertiesInfo.map((item, index) => {
          temp.push({ pSysNo: item.pSysNo, cSysNo: item.ValueSysNo, Name: item.Name })
        });
      }
    }

    var commonService = new CommonService();
    commonService.IsPossessPermission("APP_ProductDetailStock", () => {
      self.setState({ seeCompanyStock: true });
    }, () => {
      self.setState({ seeCompanyStock: false });
    });

    let permissionList = null;
    global.storage.load(
      {
        key: 'loginState',
        autoSync: false
      }).then(auth => {
        permissionList = auth.PermissionList;
        let share = permissionList.find(a => a.PermissionKey == "APP_ShareProductPicture");
        let order = permissionList.find(a => a.PermissionKey == "APP_SOManager");
        if (share && order) {
          this.setState({
            agreeShare: true,
            hasOrder: true
          });
        } else if (share && !(order)) {
          this.setState({
            agreeShare: true,
            hasOrder: false
          });
        } else if ((!share) && order) {
          this.setState({
            agreeShare: false,
            hasOrder: true
          });
        }
      }).catch(err => {
      });

  }
  //操作动画界面显示隐藏
  hiddenOrShow() {
    if (this.state.isShowAll) {
      this.setState({
        isShowAll: false, isShow: null, seat: 0
      });
    } else {
      this.setState({
        isShowAll: true, isShow: null, seat: 0
      });
    }
  }
  hidden() {
    this.setState({
      isShowAll: false, isShow: null, seat: 0
    });
  }
  //改变  【介绍】 【规格】选中状态
  checkSlectInfoTitle(bool) {
    if (bool != this.state.isSlectInfoTitle) {
      this.setState({
        isSlectInfoTitle: bool
      })
    }
  }
  startAnimation() {
    Animated.sequence([
      Animated.spring(this.state.pan, {
        ...SPRING_CONFIG,
        toValue: { x: 0, y: this.state.seat == 0 ? SPRING_SPEACE : 0 },//animate to top right
        useNativeDriver: true
      }),
    ]).start();
    this.state.seat = this.state.seat == 0 ? SPRING_SPEACE : 0;
  }
  endAnimationd() {
    Animated.sequence([
      Animated.spring(this.state.pan, {
        ...SPRING_CONFIG,
        toValue: { x: 0, y: 0 },//animate to top right
        useNativeDriver: true
      }),
    ]).start();
    this.state.seat = 0;
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
      }).catch(err => {
        //   console.log(err);
      });
  }
  //判断规格是否被选中 返回值 true false
  checkIsSelect(sysno) {
    if (this.state.selectProperties && this.state.selectProperties.length > 0) {
      let result = this.state.selectProperties.filter((item) => { return item.cSysNo == sysno });
      if (result && result.length > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //操作 规格选中数据
  checkInfoMater(items, pSysNo, cSysNo, Name, productInfo) {

    if (this.state.selectProperties && this.state.selectProperties.length > 0) {
      let index = this.state.selectProperties.findIndex(item => item.Name === Name && item.cSysNo === cSysNo);
      if (index >= 0) {
        this.state.selectProperties.splice(index, 1);
      } else {
        let e = this.state.selectProperties.findIndex(item => item.Name === Name);
        if (e >= 0) {
          this.state.selectProperties.splice(e, 1);
        }
        this.state.selectProperties.push({ pSysNo: pSysNo, cSysNo: cSysNo, Name: Name });
      }
    } else {
      this.state.selectProperties.push({ pSysNo: pSysNo, cSysNo: cSysNo, Name: Name });
    }
    this.checkSpecIsExit(items, cSysNo);
    if (productInfo) {
      let result = this.getProductBySpec(productInfo);
      if (result && result.SysNo > 0) {
        this.props.parent.refs["LeftMenu"].ChangeRender(result);
        this.state.productInfo = result;
        if (this.props.onProductClick && typeof (this.props.onProductClick) == 'function') {
          this.props.onProductClick(result.ImageList, result.SysNo)
        }
      }
    }
    //是否需要更改商品信息
    this.setState({
      isReload: true,
      singleNumber: 1
    })
  }

  //获取产品规格属性
  getProductSpecStr() {
    let productService = new ProductService();
    return productService.getProductSpecStr(this.props.model.Properties, this.props.model.GroupProperties);
  }
  productNumber(number) {
    this.state.singleNumber = number;
  }
  //判断是否多规格,和是否是 多规格只有一个商品   传入 【商品信息】 返回【bool】  
  isManySpec(productInfo) {

    if (typeof productInfo.GroupProperties === 'string') {
      productInfo.GroupProperties = JSON.parse(productInfo.GroupProperties);
    }
    if (productInfo && productInfo.GroupProperties) {
      if (productInfo.GroupProperties && productInfo.GroupProperties.length == 0) {
        this.state.IsShowSpec = true;
        return false;
      } else if (productInfo.GroupProperties && productInfo.GroupProperties.length == 1 && ((!productInfo.GroupProperties[0].ValueList) || productInfo.GroupProperties[0].ValueList.length <= 1)) {
        this.state.IsShowSpec = true;
        return false;
      } else {
        this.state.IsShowSpec = false;
        return true;
      }
    } else {
      this.state.IsShowSpec = true;
      return false;
    }
  }
  checkSpecIsExit(ProItems, VSysNo) {
    let self = this;
    let Productlist = self.productProlist;
    if (self.state.selectProperties.length === 0) {
      self.proCommprops.map(e => {
        e.ValueList.map(ee => {
          ee.disable = false;
        })
      });
      self.renderproCommprops = self.proCommprops;
      return true;
    };


    if (self.state.selectProperties.length > 0) {
      let selectProductlis = [];
      Productlist.map(e => {
        let sel = self.state.selectProperties.every(sp => {
          return e.Properties.some(ep => ep.PCSysNo === sp.pSysNo && ep.ValueSysNo === sp.cSysNo);
        });
        if (sel) {
          selectProductlis.push(e);
        }
      });
      let leavePr = [];
      if (selectProductlis.length <= 0) {
        let prlistPros = [];
        Productlist.map(e => {
          let temp = e.Properties.some(ep => ep.PCSysNo === ProItems.PCSysNo && ep.ValueSysNo === VSysNo);
          if (temp) {
            prlistPros.push(e.Properties);
          }
        });
        if (prlistPros.length > 0) {
          let renderproCommpropsTemp = [].concat([], self.renderproCommprops);
          let temp = renderproCommpropsTemp.findIndex(e => e.PCSysNo === ProItems.PCSysNo);
          renderproCommpropsTemp.splice(temp, 1);
          let selectp = null;
          renderproCommpropsTemp.some(e => {
            return e.ValueList.some(ev => {
              let selectemp = self.state.selectProperties.find(sel => sel.cSysNo === ev.SysNo);
              if (selectemp) {
                selectp = selectemp;
                return true;
              } else {
                return false;
              }
            })
          });
          if (selectp !== null) {
            let prlisitlist = prlistPros.filter(e => {
              return e.some(ee => ee.ValueSysNo === selectp.cSysNo);
            });
            if (prlisitlist.length > 0) {
              let sl = self.state.selectProperties.find(sel => sel.pSysNo !== selectp.pSysNo && sel.pSysNo !== ProItems.PCSysNo);
              if (sl) {
                let prlisitlistlist = prlisitlist.filter(e => {
                  return e.some(ee => ee.ValueSysNo === sl.cSysNo);
                });
                if (prlisitlistlist.length > 0) {

                } else {
                  let tempnum = self.state.selectProperties.findIndex(sel => sel.pSysNo === sl.pSysNo);
                  self.state.selectProperties.splice(tempnum, 1);
                  self.checkSpecIsExit(ProItems, VSysNo);
                }
              }
            } else {
              let sl = self.state.selectProperties.find(sel => sel.pSysNo !== selectp.pSysNo);
              if (sl) {
                let prlisitlist = prlistPros.filter(e => {
                  return e.some(ee => ee.ValueSysNo === sl.cSysNo);
                });
                if (prlisitlist) {
                  let tempnum = self.state.selectProperties.findIndex(sel => sel.pSysNo !== sl.pSysNo && sel.pSysNo !== ProItems.PCSysNo);
                  self.state.selectProperties.splice(tempnum, 1);
                  self.checkSpecIsExit(ProItems, VSysNo);
                } else {

                }
              } else {

              }
            }
          } else {

          }
        }
      } else {
        selectProductlis.map(e => {
          let le = e.Properties.filter(fi => {
            return fi.PCSysNo !== ProItems.PCSysNo;
          });
          if (le && le.length > 0) {
            if (leavePr.length === 0) {
              le.map(l => {
                let temp = {
                  Name: l.Name,
                  PCSysNo: l.PCSysNo,
                  ValueList: [{
                    SysNo: l.ValueSysNo,
                    Value: l.Value
                  }]
                };
                leavePr.push(temp);
              })
            } else {
              le.map(l => {
                let le = leavePr.find(lp => lp.PCSysNo === l.PCSysNo);
                if (le) {
                  let les = le.ValueList.some(lev => lev.SysNo === l.ValueSysNo);
                  if (les) {
                  } else {
                    let temp = {
                      SysNo: l.ValueSysNo,
                      Value: l.Value
                    }
                    le.ValueList.push(temp);
                  }
                }
              });
            }
          }
        });
        let temp = null;
        self.renderproCommprops.map(e => {
          if (leavePr.length > 0) {
            temp = leavePr.find(le => le.PCSysNo === e.PCSysNo);
            if (temp) {
              var exit = self.state.selectProperties.find(s => s.pSysNo === temp.PCSysNo);
              if (exit) {

                e.ValueList.map(ee => {
                  ee.disable = false;
                });
              } else {
                e.ValueList.map(ee => {
                  var ttt = temp.ValueList.some(t => t.SysNo === ee.SysNo);
                  if (ttt) {
                    ee.disable = false;
                  } else {
                    ee.disable = true;
                  }
                });

              }
            } else {
              e.ValueList.map(ee => {
                ee.disable = false;
              });
            }
          }
        });
      };
      // self.state.oldselectProperties = [].concat([], self.state.selectProperties);
    }

  }
  getProductBySpec(productInfo, isShowTips) {
    let bortherObj = this.props.parent;
    if (typeof productInfo.GroupProperties === 'string') {
      productInfo.GroupProperties = JSON.parse(productInfo.GroupProperties);
    }
    if (this.state.selectSysNo == 0 && productInfo && productInfo.GroupProperties && this.state.selectProperties == null || this.state.selectProperties.length < productInfo.GroupProperties.length && isShowTips) {
      if (bortherObj && bortherObj.refs['messageBar']) {
        bortherObj.refs['messageBar'].show("请选择规格", 3);
        return false;
      }
    } else if (this.state.selectProperties && this.state.selectProperties.length >= productInfo.GroupProperties.length) {
      let list = this.state.productList;
      let result = {};
      if (list && list.length > 0) {
        list.forEach((item) => {
          let isAllTrue = true;

          if (item.Properties && typeof (item.Properties) === 'string') {
            item.Properties = JSON.parse(item.Properties)
          }
          if (item.Properties) {
            item.Properties.forEach((p, index) => {
              let info = this.state.selectProperties.find(x => x.cSysNo == p.ValueSysNo);
              isAllTrue = isAllTrue && (info != null);
              if (index + 1 == item.Properties.length && index + 1 == this.state.selectProperties.length && isAllTrue) {
                result = item;
              }
            })
          }
        })
        if (result && result.SysNo > 0) {
          this.state.productInfo = result;
          // this.setState({
          //     productInfo: result
          // })
          return result;
        } else {
          if (bortherObj && bortherObj.refs['messageBar']) {

            bortherObj.refs['messageBar'].show("未找到商品信息，请更新数据，或该商品已下架！", 2);
          }
          return null;
        }
      } else {
        return null;
      }
    } else {
      return null;
    }

  }
  getProductmodel() {
    if (!this.state.productInfo) {
      let info = {};
      if (this.props.model && this.props.model.SysNo > 0) {
        info = this.props.model;
      }
      this.state.productInfo = info;

      // if (info.ProductList && typeof (info.ProductList) == 'string') {
      //     info.ProductList = JSON.parse(info.ProductList);
      // }
      this.state.productList = this.props.pList;
      if (info.Properties) {
        if (typeof (info.Properties) == 'string') {
          info.Properties = JSON.parse(info.Properties);
          // if (info.Properties && info.Properties.length > 0) {
          //     info.Properties.forEach((item, index) => {
          //         // this.state.selectProperties.push({ pSysNo: item.PCSysNo, cSysNo: item.ValueSysNo, Name: item.Name })
          //     })
          // }
        }
      }
    }
    if (this.state.productList && this.state.productList.length == 0) {
      this.state.productList = this.props.pList;
    }

  }

  ShowProductsCheck() {
    this.refs['ProductsCheck'].Controllmodal(true);
  }
  setDefultSpec(model) {
    if (model && model.Properties) {
      if (typeof (model.Properties) == 'string') {

        model.Properties = JSON.parse(model.Properties);
      }
      let temp = [];
      model.Properties.map((item, index) => {
        temp.push({ pSysNo: item.pSysNo, cSysNo: item.ValueSysNo, Name: item.Name });
      })
      this.state.selectProperties = temp;
    }

  }

  getProductProperties(productList) {
    let Productlistpros = [];
    let ProCommprops = [];
    productList.map(pro => {
      if (pro.Properties && pro.Properties.length > 0) {
        if (typeof pro.Properties === 'string') {

          pro.Properties = JSON.parse(pro.Properties);
        }
        pro.Properties.map(ppro => {
          if (ProCommprops.length > 0) {
            let comm = ProCommprops.find(p => p.Name === ppro.Name);
            if (comm && comm !== null) {
              let tempcomm = {
                SysNo: ppro.ValueSysNo,
                Value: ppro.Value,
                Priority:pro.Priority|0
              };
              if (comm.ValueList.length > 0) {
                var ex = comm.ValueList.every(x => x.SysNo !== ppro.ValueSysNo);
                if (ex) {
                  comm.ValueList.push(tempcomm);
                }
              } else {
                comm.ValueList.push(tempcomm);
              }
            } else {
              let comm = {
                Name: ppro.Name,
                ValueList: [{
                  SysNo: ppro.ValueSysNo,
                  Value: ppro.Value,
                  Priority:pro.Priority|0
                }],
                PCSysNo: ppro.PCSysNo
              }
              ProCommprops.push(comm);
            }
          } else {
            let comm = {
              Name: ppro.Name,
              ValueList: [{
                SysNo: ppro.ValueSysNo,
                Value: ppro.Value,
                Priority:pro.Priority|0
              }],
              PCSysNo: ppro.PCSysNo
            }
            ProCommprops.push(comm);
          }
        })
      }
    });
    productList.map(pro => {
      let p = {
        SysNo: pro.SysNo,
        Properties: pro.Properties,
      };
      Productlistpros.push(p);
    });
    this.productProlist = Productlistpros;
    this.proCommprops = this.renderproCommprops = ProCommprops;
    
    // if(this.proCommprops&&this.proCommprops[0]&&this.proCommprops[0].ValueList){
    //   let ValueList = this.proCommprops[0].ValueList;
    //   ValueList.sort(function(a,b){
    //     　　return a.Priority - b.Priority
    //     })
    //     this.proCommprops[0].ValueList = ValueList;
    // }
  }
  
//  bubbleArra(arr) {
//   console.log("begin=========>")
//   console.log(arr)
//     let length = arr.length;
//     while (length) {
//         for (let j = 0; j < length; j++) {
//             let left = arr[j];
//             let right = arr[j + 1];
//             if (left > right) {
//                 arr[j] = right;
//                 arr[j + 1] = left;
//             }
//         }
//         length--;
//       }
//       console.log("end=========>")
//       console.log(arr)
//     return arr;
// }

  _showTips(dom, infotext) {
    let self = this;
    UIManager.measure(findNodeHandle(dom), (x, y, width, height, pageX, pageY) => {
      self.tipsStyle = {
        left: pageX + width + getResponsiveValue(9),
        top: pageY + height / 2 - getResponsiveValue(38) / 2
      };
      self.tipsText = infotext;
      self.setState({ showTip: true });
      self.timeout && clearTimeout(self.timeout);
      self.timeout = setTimeout(() => {
        self.setState({ showTip: false });
      }, 1000);
    });
  }
  shareImage() {
    this.props.shareImage();
  }
  componentWillUnmount() {
    this.timeout && clearTimeout(this.timeout);
  }
  _getPro(propes) {
    if (typeof propes === 'string') {
      propes = JSON.parse(propes);
    }
    let prlist = [];
    if (propes.length > 0) {
      propes.map(e => {
        prlist.push(e.Value);
      });
      return joinstr(prlist, " ");
    }
  }
  changeProductModel(changemodel, changemodellist, IsHasImage, SysNo) {
    if (changemodel && changemodel.Properties && typeof (changemodel.Properties) == 'string') {
      changemodel.Properties = JSON.parse(changemodel.Properties);
    }
    let t = changemodel.Properties;
    let Properties = []
    if (t && t.length > 0 && SysNo > 0) {
      t.forEach((item) => {
        let P = {
          pSysNo: item.PCSysNo,
          Name: item.Name,
          cSysNo: item.ValueSysNo
        }
        Properties.push(P)
      })
    };
    this.state.selectProperties = Properties;
    this.state.productList = changemodellist;
    this.setState({ productInfo: changemodel, IsHasImage: IsHasImage, isReload: false, isSlectInfoTitle: true });
  }

  sqldateToString(date) {
    if (!date)
      return "";

    var tdate = new Date(date);
    return tdate.getFullYear() + "-" + (tdate.getMonth() + 1) + "-" + tdate.getDate();
  }
  getContextStr(model) {
    let str = "";
    if (model.SeriesName) {
      str += "系列：" + model.SeriesName + "  "
    }
    str += "型号：" + model.SKUModel + "  "
    if (model.Properties.length > 0) {
      str += "规格：" + this._getPro(model.GroupProperties)
    } else if (model.GroupProperties && model.GroupProperties.length > 0) {
      if (typeof (model.GroupProperties) == 'string') {
        model.GroupProperties = JSON.parse(model.GroupProperties);
        let pStr = this._getPro(model.GroupProperties);
        if (pStr) {
          str += "规格：" + pStr;
        }
      }
    }
    return str;
  }
  getSalePoint(model) {
    let str = "";
    if (model.Material) {
      str += "材质：" + model.Material + "  "
    }
    if (model.StyleName) {
      str += "风格：" + model.StyleName + "  "
    }
    return str;
  }

  render() {
    setStyle();
    this.getProductmodel();
    let model = this.state.productInfo;

    if ((!model.ProductImages) && this.state.ImageList && this.state.ImageList.data && this.state.ImageList.SysNo == model.SysNo) {
      model.ProductImages = this.state.ImageList.data;
    }

    if (!this.state.isReload) {
      this.getProductProperties(this.state.productList);
    }

    let GroupPropertiesStr = [];
    if (this.renderproCommprops === null || this.renderproCommprops.length === 0) {
      GroupPropertiesStr = this.renderproCommprops = this.proCommprops;
    } else {
      GroupPropertiesStr = this.renderproCommprops;
    }
    if (model.ProductName && model.ProductName.length > 15) {
      ProductName = model.ProductName.substring(0, 14) + '...';
    } else {
      ProductName = model.ProductName;
    }
    if (model.ProductTag && typeof (model.ProductTag) == 'string') {
      model.ProductTag = model.ProductTag.split(',')
    }

    // if (model.ProductList && typeof model.ProductList == 'string') {
    //     model.ProductList = JSON.parse(model.ProductList);
    // }

    if (typeof model.Properties === 'string') {
      model.Properties = JSON.parse(model.Properties);
    }

    if (this.state.isShowAll) {
      return (
        // 图片详情
        <Animated.View style={this.getStyle()}>
          <View style={[styles.AnimatedView]}>
            <View style={styles.description}>
              <View style={styles.VenterView}>
                {
                  this.state.isSlectInfoTitle ? (<ScrollView
                    automaticallyAdjustContentInsets={false}
                    horizontal={false}
                    key={model.ProductName}
                    style={[styles.scrollView, styles.horizontalScrollView, { marginTop: getResponsiveValue(20), width: getResponsiveValue(968), marginBottom: getResponsiveValue(10) }]}>
                    <View style={{
                      marginLeft: getResponsiveValue(30),
                      flexDirection: "column",

                    }}>
                      <Text style={[styles.descriptionText, {
                        marginLeft: 0,
                        fontSize: getResponsiveFontSize(32),
                        fontWeight: "bold",
                        maxWidth: getResponsiveValue(968), color: StyleConfig.FocalFront
                      }]}
                        numberOfLines={1}
                      >{model.ProductName}</Text>
                      <Text style={[styles.descriptionText, { marginRight: getResponsiveValue(26), fontSize: getResponsiveFontSize(24), color: '#3a90e7', paddingTop: getResponsiveValue(6) }]}>{this.getContextStr(model)}</Text>
                      <Text style={[styles.descriptionText, { marginRight: getResponsiveValue(26), fontSize: getResponsiveFontSize(24), color: '#3a90e7', paddingTop: getResponsiveValue(6) }]}>
                        { this.getSalePoint(model) }
                      </Text>
                    </View>
                    <Text style={[styles.miaosuText,]}>
                      { model.ProductNote && "产品特点: " + model.ProductNote }
                      { /*"产品特点: " + model.ProductNote */}
                    </Text>
                  </ScrollView>)// 规格
                    : (
                      <ScrollView
                        automaticallyAdjustContentInsets={false}
                        horizontal={false}
                        key={'spec'}
                        style={[styles.scrollView, styles.horizontalScrollView, { marginTop: getResponsiveValue(30), width: getResponsiveValue(968), maxHeight: getResponsiveValue(222), }]}>
                        <View style={{ flexDirection: 'row' }}>
                          {
                            GroupPropertiesStr && GroupPropertiesStr.length > 0 ?
                              <View style={{ flexDirection: 'column', }}>
                                {
                                  GroupPropertiesStr.map((item, index) => {
                                    return (
                                      item.Name && item.ValueList && item.ValueList.length > 0 ?
                                        <View key={'vp' + index} style={[styles.GroupPropertiesItemswap,]}>
                                          <Text style={styles.GroupPropertiesItemsTitle}>{item.Name}： </Text>
                                          <View style={{ flexWrap: "wrap", flex: 1, flexDirection: 'row' }}>
                                            {
                                              item.ValueList.map((vItem, vIndex, data) => {
                                                return <TouchableOpacity style={{ marginVertical: getResponsiveValue(2) }} key={index + 'vc' + vIndex} activeOpacity={0.8} onPress={() => {
                                                  // if (typeof vItem.disable === 'undefined' || !vItem.disable) {
                                                  this.checkInfoMater(item, item.PCSysNo, vItem.SysNo, item.Name, model);
                                                  // }
                                                }}>{
                                                    typeof vItem.disable === 'undefined' || !vItem.disable ? (
                                                      <Text style={this.checkIsSelect(vItem.SysNo) ? styles.GroupPropertiesSelectItems : styles.GroupPropertiesItems}>
                                                        {vItem.Value}
                                                      </Text>
                                                    ) : (
                                                        <Text style={styles.GroupPropertiesDisabledItems}>
                                                          {vItem.Value}
                                                        </Text>
                                                      )
                                                  }

                                                </TouchableOpacity>
                                              })
                                            }
                                          </View>
                                        </View>
                                        : null
                                    )
                                  })
                                }
                              </View>
                              : null
                          }
                        </View>
                      </ScrollView>

                    )
                }
              </View>
              <View style={styles.productContentRiht}>
                <View style={{
                  height: getResponsiveValue(222),
                  flexDirection: "column",
                  //justifyContent: 'space-around',
                  alignItems: 'center',
                  borderLeftWidth: getResponsiveValue(1),
                  borderLeftColor: '#b2b2b2b3',

                }}>
                  <View style={{
                    flexDirection: 'row',
                    height: getResponsiveValue(105),
                    alignItems: 'center',
                    marginBottom: getResponsiveValue(20)
                  }} >
                    <View style={{ flexDirection: 'column', marginLeft: getResponsiveValue(20), }}>
                      <View style={[styles.productNameAndPrice, { alignItems: 'center' }]}>
                        <Text style={styles.productName}>价格：</Text>
                        <View style={{ flexDirection: 'column', width: getResponsiveValue(180) }}>
                          <Text style={[styles.priceText, { color: 'red' }]}>￥{
                            model.PromotionPrice && model.PromotionPrice > 0 ?
                              // Math.min(model.PromotionPrice, model.SalePrice) : (model.SalePrice > 0 ? model.SalePrice : '未设置')
                              model.PromotionPrice : (model.SalePrice > 0 ? model.SalePrice : '未设置')
                          }
                          </Text>
                          {
                            model.PromotionPrice && model.PromotionPrice > 0 && model.SalePrice > 0 && model.PromotionPrice < model.SalePrice ?
                              <Text style={[styles.priceText, { textDecorationLine: 'line-through', fontSize: getResponsiveFontSize(25) }]}>￥{model.SalePrice}</Text> : null
                          }
                          {(this.state.showCostPrice) ? (
                            <Text style={styles.priceText}>成本：{model.CostPrice}</Text>
                          ) : null}

                        </View>
                      </View>


                    </View>
                  </View>
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

let styles = null;
function setStyle() {
  if (styles != null && !CompanyConfig.isGeneral()) return styles;
  let config = CompanyConfig;
  styles = StyleSheet.create({
    photoBrowser: {
      width: width,
      height: height
    },
    righViewShowWap: {
      position: "absolute",
      zIndex: 3000,
      top: height,
      height: getResponsiveValue(500),
      width: width,
      opacity: 0.9,
    },
    productContentRiht: {
      height: getResponsiveValue(252),
      width: getResponsiveValue(365),

      position: "absolute",
      justifyContent: 'flex-end',
      right: 0,
    },
    productTieleImg: {
      marginTop: getResponsiveValue(20),
      marginLeft: getResponsiveValue(40),
      width: getResponsiveValue(160),
      height: getResponsiveValue(110),
      borderRadius: getResponsiveValue(10),
      resizeMode: 'contain'
    },
    detailShow: {
      position: "absolute",
      height: getResponsiveValue(44),
      width: getResponsiveValue(60),
      borderRadius: getResponsiveValue(22),
      zIndex: 150,
    },
    fordetailShow: {
      height: getResponsiveValue(44),
      width: getResponsiveValue(44),
      borderRadius: getResponsiveValue(22),
      alignItems: "center",
      justifyContent: "center",
    },
    introducewap: {
      backgroundColor: 'red',
      top: 0,
      height: 100,
    },
    introducebtn: {
      marginVertical: getResponsiveValue(7),
      marginLeft: getResponsiveValue(20),
      alignItems: "center",
      justifyContent: "center",
      width: getResponsiveValue(80),
      height: getResponsiveValue(80),
      opacity: 0.7,
      borderRadius: getResponsiveValue(40),
      backgroundColor: StyleConfig.SecondaryFront,
    },
    solid: {
      width: getResponsiveValue(1),
      height: getResponsiveValue(40),
      backgroundColor: "#ffffff",
      borderStyle: "solid",
      borderWidth: getResponsiveValue(1),
      borderColor: "#ffffff",
      margin: getResponsiveValue(20),
    },
    shopBarImg: {
      width: getResponsiveValue(52),
      height: getResponsiveValue(52),
      borderWidth: getResponsiveValue(1),
      borderStyle: "solid",
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: "#3a90e7",
      borderRadius: getResponsiveValue(26),
    },
    shopBarNumWapbyTochat: {
      alignItems: "center",
      justifyContent: 'center',
      width: getResponsiveValue(65),
      height: getResponsiveValue(65),

    },
    shopBarNumWap: {
      position: "absolute",
      right: getResponsiveValue(0),
      top: getResponsiveValue(0),
      alignItems: "center",
      justifyContent: 'center',
      width: getResponsiveValue(40),
      height: getResponsiveValue(30),
      borderRadius: getResponsiveValue(15),
      backgroundColor: "#fd180d",
      shadowColor: "rgba(0, 0, 0, 0.2)",
      shadowOffset: {
        width: 1,
        height: 1
      },
      shadowRadius: getResponsiveValue(7),
      shadowOpacity: getResponsiveValue(1)
    },
    shopBarNumbyTochart: {
      fontSize: getResponsiveValue(20),
      color: "#ffffff",
      textAlign: 'center',
      backgroundColor: 'transparent'
    },
    shopBarNum: {
      fontSize: getResponsiveValue(20),
      lineHeight: getResponsiveValue(30),
      color: "#ffffff",
      lineHeight: getResponsiveValue(30)
    },
    leftViewwap: {
      position: "absolute",
      flexDirection: "row",
      top: getResponsiveValue(10),
      right: getResponsiveValue(0),
      alignItems: "center",
      justifyContent: "center",
      height: getResponsiveValue(90),
      zIndex: 12
    },
    leftBackViewwap: {
      height: getResponsiveValue(90),
      borderTopLeftRadius: getResponsiveValue(30),
      borderBottomLeftRadius: getResponsiveValue(30),
      backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    leftDetailViewwap: {
      borderTopLeftRadius: getResponsiveValue(30),
      borderBottomLeftRadius: getResponsiveValue(30),
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      height: getResponsiveValue(90),
      backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    AnimatedView: {
      flexDirection: "row",
      position: "absolute",
      width: width,
      height: getResponsiveValue(500)
    },
    Pagenumber: {
      flexDirection: "row",
      borderRadius: getResponsiveValue(19),
      color: StyleConfig.SecondaryFront,
      textAlign: "center",
      textAlignVertical: 'center',
      fontSize: getResponsiveValue(18),
    },
    productNameAndPrice: {
      flexDirection: "row",
    },
    productNameDownText: {
      fontSize: getResponsiveValue(20),
      color: "#444444",
      textAlign: 'center',
      backgroundColor: 'transparent',
    },
    Shopping: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
      top: getResponsiveValue(40),
      right: getResponsiveValue(100),
      width: getResponsiveValue(200),
      height: getResponsiveValue(70),
      borderRadius: getResponsiveValue(35),
      backgroundColor: "#0071e0",
      shadowColor: "rgba(2, 49, 96, 0.2)",
      shadowOffset: {
        width: 3,
        height: 4
      },
      shadowRadius: getResponsiveValue(10),
      shadowOpacity: 1
    },
    priceText: {
      fontSize: getResponsiveValue(28),
      backgroundColor: 'transparent'
    },
    tagText: {
      color: '#0071e0',
      fontSize: getResponsiveValue(24)

    },
    tagTextwap: {
      alignItems: "center",
      justifyContent: "center",
      height: getResponsiveValue(36),
      borderRadius: getResponsiveValue(18),
      borderColor: '#0071e0',
      borderWidth: 1,
      paddingHorizontal: getResponsiveValue(14),
      marginLeft: getResponsiveValue(20),
    },
    VenterView: {
      flexDirection: "column",
      height: getResponsiveValue(252)
    },
    VenterImageViewWap: {
      marginTop: getResponsiveValue(4),
      flexDirection: "row",
    },
    VenterImageView: {
      width: getResponsiveValue(534),
      height: getResponsiveValue(276),
      resizeMode: 'stretch',
      marginLeft: getResponsiveValue(6)
    },
    VenterViewTiele: {
      flexDirection: "row",
      marginTop: getResponsiveValue(10),
      alignItems: "center",
    },
    VenterViewTieleText: {
      marginLeft: getResponsiveValue(39),
      fontSize: getResponsiveValue(30),
      color: "#969ca2"
    },
    VenterViewTieleSelectText: {
      marginLeft: getResponsiveValue(39),
      fontSize: getResponsiveValue(36),
      color: "#3a3a3a"
    },

    GroupPropertiesItemswap: {
      flexDirection: 'row',
      width: getResponsiveValue(885),
      marginLeft: getResponsiveValue(30),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: getResponsiveValue(20)
    },
    GroupPropertiesItemsTitle: {
      fontSize: getResponsiveValue(28),
      color: "#3a3a3a",
      textAlign: 'center',
      backgroundColor: 'transparent',
    },
    GroupPropertiesSelectItems: {
      overflow: "hidden",
      fontSize: getResponsiveValue(28),
      borderRadius: getResponsiveValue(10),
      minWidth: getResponsiveValue(70),
      borderWidth: getResponsiveValue(1.5),
      paddingVertical: getResponsiveValue(6),
      marginHorizontal: getResponsiveValue(7),
      paddingHorizontal: getResponsiveValue(18),
      backgroundColor: "#3a90e7",
      borderColor: "#3a90e7",
      textAlign: 'center',
      color: "#ffffff"
    },
    GroupPropertiesItems: {
      fontSize: getResponsiveValue(28),
      borderWidth: getResponsiveValue(1.5),
      borderStyle: "solid",
      marginHorizontal: getResponsiveValue(7),
      paddingVertical: getResponsiveValue(6),
      paddingHorizontal: getResponsiveValue(18),
      borderColor: "#b2b2b2",
      borderRadius: getResponsiveValue(12),
      minWidth: getResponsiveValue(70),
      textAlign: 'center',
      color: "#383838",
    },
    GroupPropertiesDisabledItems: {
      fontSize: getResponsiveValue(28),
      borderRadius: getResponsiveValue(12),
      minWidth: getResponsiveValue(70),
      borderWidth: getResponsiveValue(1.5),
      marginHorizontal: getResponsiveValue(7),
      paddingHorizontal: getResponsiveValue(18),
      paddingVertical: getResponsiveValue(6),
      backgroundColor: "#dedede",
      textAlign: 'center',
      borderStyle: 'dashed',
      color: "#999999",
      borderColor: '#eeeeee',
      overflow: "hidden"
    },
    sureButton: {
      flexDirection: 'row',
      width: getResponsiveValue(1110),
      height: getResponsiveValue(90),
      alignItems: "flex-end",
      justifyContent: "center",
      backgroundColor: "#ffffff",
      borderBottomLeftRadius: getResponsiveValue(10),
    },
    shopBarWap: {
      position: "absolute",
      bottom: getResponsiveValue(20),
      right: getResponsiveValue(280),
      width: getResponsiveValue(60)
    },
    taojianWap: {
      position: "absolute",
      bottom: 0,
      right: getResponsiveValue(380),
      flexDirection: 'row',
      alignItems: "center",
      height: getResponsiveValue(90),
    },
    taojianText: {
      fontSize: getResponsiveValue(28),
      color: "#0071e0"
    },
    sureTextWap: {
      width: getResponsiveValue(305),
      height: getResponsiveValue(60),
      borderRadius: getResponsiveValue(14),
      backgroundColor: "#fd180d",
      alignItems: "center",
      justifyContent: "center",
    },
    sureText: {
      textAlign: 'center',
      fontSize: getResponsiveValue(28),
      color: "#ffffff",
      backgroundColor: 'transparent'
    },
    productName: {
      fontSize: getResponsiveValue(24),
      color: "#444444",
      textAlign: 'center',
      backgroundColor: 'transparent',
    },
    back: {
      marginVertical: getResponsiveFontSize(20),
      marginLeft: getResponsiveValue(20),
      height: getResponsiveValue(86),
      borderRadius: getResponsiveValue(86),
      width: getResponsiveValue(86),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: StyleConfig.OnPressMain
    },
    backImg: {
      width: getResponsiveValue(21),
      height: getResponsiveValue(37)
    },
    bgimg: {
      flex: 1,
    },
    NotFondbgimg: {
      flex: 1,
    },
    closewap: {
      width: getResponsiveValue(60),
      height: getResponsiveValue(60),
      opacity: 0.7,
      backgroundColor: "rgba(150, 156, 162, 0.7)",
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: getResponsiveValue(10),
      borderRadius: getResponsiveValue(40),
      marginLeft: getResponsiveValue(80),
    },
    righttextwap: {
      borderBottomLeftRadius: getResponsiveValue(60),
      opacity: 0.9,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: getResponsiveValue(10),
      marginLeft: getResponsiveValue(4)
    },
    righttext: {
      position: "absolute",
      includeFontPadding: false,//清除TextView字体周边空白
      textAlign: 'center',
      textAlignVertical: 'center',
      backgroundColor: 'transparent',
      fontSize: getResponsiveFontSize(26),
    },
    left: {
      flexDirection: "column",
      height: getResponsiveFontSize(750),
      width: getResponsiveValue(110),
    },
    contentleft: {
      flexDirection: "column",
      width: getResponsiveValue(1334),
      height: getResponsiveValue(height),
    },
    content: {
      flexDirection: "row",
      width: getResponsiveValue(612),
      height: getResponsiveValue(height),
    },
    right: {
      borderBottomLeftRadius: getResponsiveValue(60),
      flexDirection: "column",
      width: getResponsiveValue(140)
    },
    description: {
      flexDirection: "column",
      width: width,
      height: getResponsiveValue(500),
      backgroundColor: '#ffffff'
    },
    descriptionText: {
      fontSize: getResponsiveValue(28),
      color: StyleConfig.ContentFront,
    },
    miaosuText: {
      fontSize: getResponsiveValue(28),
      width: getResponsiveValue(885),
      marginLeft: getResponsiveValue(30),
      lineHeight: getResponsiveValue(44),
      color: '#383838',
      marginTop: getResponsiveValue(4)
    },
    pageIndexWap: {
      position: "absolute",
      zIndex: 2,
      bottom: getResponsiveValue(20),
      left: getResponsiveValue(-660),
      backgroundColor: StyleConfig.Main,
      height: getResponsiveValue(40),
      width: getResponsiveValue(110),
      opacity: 0.8,
      borderRadius: getResponsiveValue(20),
      flexDirection: "column",
      alignItems: "center",
      justifyContent: 'center'
    },
    selectLeftWap: {
      height: getResponsiveValue(50),
      width: getResponsiveValue(128),
      borderRadius: getResponsiveValue(25),
      marginLeft: getResponsiveFontSize(21),
      marginVertical: getResponsiveFontSize(10),
      backgroundColor: CompanyConfig.formatColor(StyleConfig.SecondaryFront, "e6"),
      alignItems: "center",
      justifyContent: 'center',
    },
    selectLeftText: {
      textAlign: 'center',
      fontSize: getResponsiveFontSize(24),
      color: StyleConfig.Main,
      backgroundColor: "transparent",
      height: getResponsiveValue(30),
      lineHeight: getResponsiveValue(30),
      overflow: "hidden"
    },
    LeftWap: {
      height: getResponsiveValue(50),
      borderRadius: getResponsiveValue(25),
      width: getResponsiveValue(128),
      marginLeft: getResponsiveFontSize(21),
      marginVertical: getResponsiveFontSize(10),
      backgroundColor: CompanyConfig.formatColor(StyleConfig.Main, "e6"),
      alignItems: "center",
      justifyContent: 'center',
    },
    lefttext: {
      color: StyleConfig.SecondaryFront,
      textAlign: 'center',
      fontSize: getResponsiveFontSize(24),
      textAlignVertical: 'center',
      backgroundColor: "transparent",
      height: getResponsiveValue(30),
      lineHeight: getResponsiveValue(30),
      overflow: "hidden"
    },

  })
}