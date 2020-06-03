import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  Image,
  View,
  TouchableOpacity, Modal, ScrollView
} from 'react-native';
import PropTypes from "prop-types";
// import AppConfig from '../config/app.config.js';
import CompanyConfig from '../config/company.config.js';
import { getResponsiveValue, getResponsiveFontSize } from '../assets/default.theme.js';
// import FileHelper from '../helpers/fileHelper.config.js';
import SvgUri from '../components/svguri.js';
import ProductService from '../services/product.js';
import NumberChange from '../components/NumberChange.js';
import SaleService from '../services/sales.js';
import OperationMessage from '../components/OperationMessage.js';
// import OrderInfo from '../pages/Order/Sales/orderInfo.js';

let productStyles = null;

function setStyle() {
  if (productStyles != null && !CompanyConfig.isGeneral()) return productStyles;

  productStyles = StyleSheet.create({

    modalStyle: {
      backgroundColor: "#ffffff",
      flex: 1,
    },
    titleWap: {
      shadowColor: "rgba(11, 24, 37, 0.05)",
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: getResponsiveValue(100),
    },
    titleText: {
      fontSize: getResponsiveValue(40),
      color: "#3a3a3a"
    },
    back: {
      position: "absolute",
      top: getResponsiveValue(20),
      left: getResponsiveValue(20),
      height: getResponsiveValue(80),
      width: getResponsiveValue(80),
      borderRadius: getResponsiveValue(40),
      alignItems: 'center',
      justifyContent: 'center',
      // borderRadius: getResponsiveValue(30),
      backgroundColor: CompanyConfig.AppColor.OnPressMain,
      // CompanyConfig.AppColor.Main
    },
    productListWap: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: getResponsiveValue(150),
      width: getResponsiveValue(1334),
      marginVertical: getResponsiveValue(20),
      backgroundColor: "#f3f6fb"
    },
    imgItemWap: {
      width: getResponsiveValue(160),
      height: getResponsiveValue(110),
      borderRadius: getResponsiveValue(10),
      marginHorizontal: getResponsiveValue(5)
    },
    imgItem: {
      width: getResponsiveValue(160),
      height: getResponsiveValue(110),
      borderRadius: getResponsiveValue(10),
    },
    select: {
      position: "absolute",
      width: getResponsiveValue(160),
      height: getResponsiveValue(110),
      right: 0,
      top: 0,
      backgroundColor: "#0071e0",
      borderRadius: getResponsiveValue(10),
      opacity: 0.4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    indexTextwap: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: getResponsiveValue(18),
      position: "absolute",
      top: getResponsiveValue(2),
      left: getResponsiveValue(2),
      width: getResponsiveValue(36),
      height: getResponsiveValue(36),
      opacity: 0.6,
      backgroundColor: "rgba(69, 69, 69, 0.6)"
    },
    IsShopping: {
      backgroundColor: '#00000000',
      position: "absolute",
      fontSize: getResponsiveValue(22),
      top: getResponsiveValue(2),
      left: getResponsiveValue(40),
      color: "rgba(69, 69, 69, 0.6)",
    },
    indexText: {
      fontSize: getResponsiveValue(22),
      color: "#ffffff"
    },
    nameWap: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: getResponsiveValue(160),
      height: getResponsiveValue(34),
      backgroundColor: "rgba(69, 69, 69, 0.6)",
      opacity: 0.8,
      alignItems: 'center',
      borderBottomLeftRadius: getResponsiveValue(10),
      borderBottomRightRadius: getResponsiveValue(10),
      justifyContent: 'center'
    },
    nameText: {
      color: "#ffffff",
    },
    specWap: {
      flexDirection: 'row',
      height: getResponsiveValue(300),
      width: getResponsiveValue(1334),
      marginVertical: getResponsiveValue(20),
    },
    bigImage: {
      width: getResponsiveValue(410),
      height: getResponsiveValue(300),
      borderRadius: getResponsiveValue(20),
      marginHorizontal: getResponsiveValue(28),
    },
    GroupPropertiesItemsTitle: {
      fontSize: getResponsiveValue(30),
      color: "#3a3a3a",
    },
    GroupPropertiesItemswap: {
      flexDirection: 'row',
      marginTop: getResponsiveValue(20),
      borderColor: '#eeeeee',
      borderBottomWidth: getResponsiveValue(2),
      height: getResponsiveValue(63),
    },
    GroupPropertiesItemsTitle: {
      fontSize: getResponsiveValue(30),
      color: "#3a3a3a",
    },
    GroupPropertiesSelectItems: {
      fontSize: getResponsiveValue(28),
      borderRadius: getResponsiveValue(10),
      minWidth: getResponsiveValue(70),
      borderWidth: getResponsiveValue(1.5),
      paddingVertical: getResponsiveValue(6),
      marginHorizontal: getResponsiveValue(7),
      paddingHorizontal: getResponsiveValue(18),
      //backgroundColor: "red",
      backgroundColor: "#3a90e7",
      borderColor: "#3a90e7",
      // marginRight: getResponsiveValue(10),
      textAlign: 'center',
      color: "#ffffff",
      overflow: "hidden"
    },
    GroupPropertiesItems: {
      fontSize: getResponsiveValue(28),
      // marginRight: getResponsiveValue(10),
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
      color: "#888888",
      borderColor: '#b2b2b2',
      overflow: "hidden"
    },
    sureButton: {
      flexDirection: 'row',
      position: "absolute",
      bottom: 0,
      right: 0,
      height: getResponsiveValue(80),
      // backgroundColor: "#0071e0",
      // alignItems: "flex-end",
      justifyContent: "center",
      // backgroundColor: 'transparent',
      backgroundColor: "#ffffff",
      borderBottomLeftRadius: getResponsiveValue(10),
      width: getResponsiveValue(400),

    },
    shopBarWap: {
      position: "absolute",
      bottom: getResponsiveValue(12),
      right: getResponsiveValue(280),
      width: getResponsiveValue(80),
      alignItems: "center",
      justifyContent: 'center',
      width: getResponsiveValue(60),
      height: getResponsiveValue(60),
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
    shopBarNumWap: {
      position: "absolute",
      right: getResponsiveValue(12),
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
    shopBarNum: {
      fontSize: getResponsiveValue(20),
      color: "#ffffff",
      //lineHeight: getResponsiveValue(30),
      backgroundColor: 'transparent',
      textAlign: 'center'
      // marginBottom:getResponsiveValue(10),
    },
    sureTextWap: {
      position: "absolute",
      alignItems: "center",
      justifyContent: 'center',
      right: getResponsiveValue(0),
      width: getResponsiveValue(240),
      height: getResponsiveValue(80),
      backgroundColor: "#fd180d",
      alignItems: "center",
    },
    sureText: {
      // includeFontPadding: false,//清除TextView字体周边空白
      fontSize: getResponsiveValue(32),
      color: "#ffffff",
      backgroundColor: 'transparent',
      // lineHeight: getResponsiveValue(60),
    },
  });
  return productStyles;
}


export default class ProductsCheck extends Component {
  constructor(prop) {
    isSHowModal: PropTypes.bool;
    title: PropTypes.string;
    dataSource: PropTypes.array;
    getChartOrder: PropTypes.func;
    changeChartNum: PropTypes.func;
    chartNum: PropTypes.string;
    tochart: PropTypes.func;
    ChartInfo: PropTypes.array;
    super(prop);
    this.state = {
      isSHowModal: false,
      dataSource: [],
      dataList: [],
      SelectInfo: {},
      selectProperties: [],
      singleNumber: 1,
      selectSysNo: 0,
      productList: [],//根据commonSysno查询出来的数据
      chartNum: 0,
      ChartInfo: [],
      isReload: true,
      isLive: true,
      defaultNumber: 1,
    }
    this.productProlist = null;
    this.proCommprops = null;
    this.renderproCommprops = null;
    this.issucced = true;
  }
  UNSAFE_componentWillMount() {
    this.state.isLive = false;
  }
  componentDidMount() {
    this.state.isLive = true;
    let dataSource = this.props.dataSource;
    if (dataSource && dataSource.length > 0 && dataSource[0].Quantity) {
      // this.setState({singleNumber:dataSource[0].Quantity})
      this.state.singleNumber = dataSource[0].Quantity;
    }
    this.GetDataSource();
  }
  getProductBySpec(productInfo, isShowTips) {
    let bortherObj = this;
    if (typeof productInfo.GroupProperties === 'string') {
      productInfo.GroupProperties = JSON.parse(productInfo.GroupProperties);
    }
    if (((productInfo && this.state.selectProperties == null) || this.state.selectProperties.length < productInfo.GroupProperties.length) && isShowTips) {
      if (bortherObj && bortherObj.refs['messageBar']) {
        bortherObj.refs['messageBar'].show("请选择规格", 3);
        this.issucced = false;
        return false;
      }
    } else if (this.state.selectProperties && this.state.selectProperties.length >= productInfo.GroupProperties.length) {
      let list = this.state.productList;
      let result = {};
      if (list != null && list.length > 0) {
        list.forEach((item) => {
          let isAllTrue = true;
          if (item.GroupProperties && typeof (item.GroupProperties) === 'string') {
            item.GroupProperties = JSON.parse(item.GroupProperties)
          }
          if (item.GroupProperties) {
            item.GroupProperties.forEach((p, index) => {
              let info = this.state.selectProperties.find(x => x.cSysNo == p.ValueSysNo);
              isAllTrue = isAllTrue && (info != null);
              if (index + 1 == item.GroupProperties.length && index + 1 == this.state.selectProperties.length && isAllTrue) {
                result = item;
              }
            })
          }
        })
        if (result && result.SysNo > 0) {
          this.setState({
            SelectInfo: result
          })
          return result;
        } else {
          return null;
        }
      } else {
        this.issucced = false;

        bortherObj.refs["messageBar"].show('未找到当前商品,请更新数据后重试，或该商品已下架', 2);
      }
    } else {
      return null;
    }
  }
  GetDataSource() {
    if (this.state.isLive) {
      let Source = this.props.dataSource;
      if (Source && Source != null) {
        let SysNos = [];
        // let Source = this.props.dataSource;
        if (typeof (Source) == 'string') {
          Source = JSON.parse(Source);
        }
        if (Source != null) {
          Source.map((item) => {
            SysNos.push(item.SysNo);
          })
          let productService = new ProductService();
          productService.GetProductDetail('', SysNos, (result) => {
            if (result && result.length > 0) {
              result.forEach((p) => {
                let sp = Source.find(a =>
                  a.SysNo == p.SysNo
                )
                if (sp) {
                  p.Quantity = sp.Quantity >= 1 ? sp.Quantity : 1;
                }
              });
              if (this.state.SelectInfo && this.state.SelectInfo.SysNo > 0) {

                this.setState({ dataList: result });
              } else {
                let selctProduct = result[0];
                if (selctProduct.Properties) {
                  if (typeof (selctProduct.Properties) == 'string') {
                    selctProduct.Properties = JSON.parse(selctProduct.Properties);
                  }

                }
                this.setState({
                  dataList: result,
                  SelectInfo: result[0]
                });
              }
              productService.GetProductDetail(this.state.SelectInfo.ProductCommonSysNo, '', (list) => {
                if (list) {
                  this.state.productList = list;
                }
              })
              // return result;
            }
          })
        }
      }
    }
  }
  onRequestClose() {
    this.setState({
      isSHowModal: false
    });
  }
  getChartOrder() {
    if (this.props.getChartOrder && typeof (this.props.getChartOrder) == 'function') {
      let chartInfo = this.props.getChartOrder();
    }
  }
  Controllmodal(isShow) {
    this.setState({
      isSHowModal: isShow,
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
    let result = null;
    if (productInfo) {
      let result = this.getProductBySpec(productInfo, false);
      if (result && result.SysNo > 0) {
        this.state.productInfo = result;
      }
    }
    if (this.state.singleNumber > 1) {
      //是否需要更改商品信息
      this.setState({
        singleNumber: 1
      })
    } else {
      this.setState({
        isReload: false
      })
    }
  }

  getProductProperties(productList) {
    let Productlistpros = [];
    let ProCommprops = [];
    productList.map(pro => {
      if (pro.GroupProperties.length > 0) {
        if (typeof pro.GroupProperties === 'string') {
          pro.GroupProperties = JSON.parse(pro.GroupProperties);
        }
        pro.GroupProperties.map(ppro => {
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
        Properties: pro.GroupProperties
      };
      Productlistpros.push(p);
    });
    this.productProlist = Productlistpros;
    this.proCommprops = this.renderproCommprops = ProCommprops;

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



  productNumber(number) {
    this.state.singleNumber = number;
  }
  isManySpec(productInfo) {
    if (typeof productInfo.GroupProperties === "string") {
      productInfo.GroupProperties = JSON.parse(productInfo.GroupProperties);
    }
    if (productInfo && productInfo.GroupProperties) {
      if (productInfo.GroupProperties.length == 0) {
        // this.state.IsShowSpec = true;
        return false;
      } else if (productInfo.GroupProperties.length == 1 && ((!productInfo.GroupProperties[0].ValueList) || productInfo.GroupProperties[0].ValueList.length <= 1)) {
        // this.state.IsShowSpec = true;
        return false;
      } else {
        // this.state.IsShowSpec = false;
        return true;
      }
    } else {
      // this.state.IsShowSpec = true;
      return false;
    }
  }

  //入参意义： 【商品信息】 【是否为组件】
  toShopping(productInfo, isProductGroup) {
    if (this.state.isLive) {
      let bortherObj = this;
      if (this.state.singleNumber < 1) {
        if (bortherObj && bortherObj.refs['messageBar']) {
          bortherObj.refs['messageBar'].show("商品数量应不小于1", 2);
        }
        return false;
      }
      productInfo['ProductNum'] = this.state.singleNumber;
      let sale = new SaleService();
      sale.AddProductToShoppintCar([productInfo], () => { this.getChartProuct() });
      this.issucced = true;
      if (bortherObj && bortherObj.refs['messageBar']) {
        bortherObj.refs['messageBar'].show("成功加入购物车！", 1);
        this.state.singleNumber = 1;
      }
      if (bortherObj && bortherObj.refs['detail']) {
        bortherObj.refs['detail'].getChartProuct();
      }
    }
  }
  addToCardBySureBtn(productInfo) {
    if (this.state.isLive) {
      let bortherObj = this;
      let isManySpec = this.isManySpec(productInfo);
      if (productInfo.CommonGroupProperties && productInfo.CommonGroupProperties.length > 0 && productInfo.CommonGroupProperties[0].ValueList &&
        productInfo.CommonGroupProperties[0].ValueList.length > 1 && this.state.selectProperties.length < productInfo.CommonGroupProperties.length && isManySpec) {
        if (this.setState.isSlectInfoTitle == undefined || this.setState.isSlectInfoTitle == true || this.setState.isSlectInfoTitle == null) {
          this.setState({ isSlectInfoTitle: false });
        }
        this.issucced = false;
        if (bortherObj && bortherObj.refs['messageBar']) {
          bortherObj.refs['messageBar'].show("请选择规格", 3);
        }
      } else if (!isManySpec) {
        this.toShopping(productInfo);

      }
      else {
        let result = this.getProductBySpec(productInfo, true);
        if (result) {
          let sale = new SaleService();
          // if (this.state.singleNumber <= 0) {
          //     if (bortherObj && bortherObj.refs['messageBar']) {
          //         bortherObj.refs['messageBar'].show("成功加入购物车！", 1);
          //     }
          //     return false;
          // }
          result['ProductNum'] = this.state.singleNumber == 0 ? 1 : this.state.singleNumber;
          sale.AddProductToShoppintCar([result]);
          this.issucced = true;
          if (this.state.chartNum == 0) {
            this.setState({
              chartNum: result['ProductNum']
            })
          } else {
            this.getChartProuct();
          }
          this.issucced = true;
          if (this.state.chartNum == 0) {
            this.setState({
              chartNum: result['ProductNum']
            })
          } else {
            this.getChartProuct();
          }
          if (bortherObj && bortherObj.refs['messageBar']) {
            bortherObj.refs['messageBar'].show("成功加入购物车！", 1);
            this.state.singleNumber = 1;
          }

          // this.getChartProuct();
          if (bortherObj && bortherObj.refs['detail']) {
            bortherObj.refs['detail'].getChartProuct();
          }
        } else if (result == null) {
          this.issucced = false;
          if (bortherObj && bortherObj.refs['messageBar']) {
            bortherObj.refs['messageBar'].show("未找到商品信息，请更新数据！", 3);
          }
        }
      }
    }
  }
  getChartProuct() {
    if (this.state.isLive) {
      let sale = new SaleService();
      sale.GetCurrentCustomerOrder((result) => {
        if (result && result.Products) {
          let length = 0;
          let Products = [];
          if (typeof (result.Products) == 'string') {
            Products = JSON.parse(result.Products);
          } else {
            Products = result.Products;
          }
          if (Products && Products.length > 0) {
            Products.map((item) => {
              length += Number(item.ProductNum);
            })
          }
          if (this.state.chartNum != length) {//如果展示的购物车数量与实际数量不一致则render
            this.state.ChartInfo = result;
            this.setState({
              chartNum: length
            });
            if (this.props.changeChartNum && typeof (this.props.changeChartNum) == 'function') {
              this.props.changeChartNum(length);
            }
          }
        } else {
          
        }
      })
    }
  }
  checkIsInChart(ProductCommonSysNo) {
    if (this.state.ChartInfo && this.state.ChartInfo.Products) {
      let list = this.state.ChartInfo.Products;
      let info = list.find(x => x.ProductCommonSysNo == ProductCommonSysNo);
      if (info && info.SysNo > 0) {
        return true
      } else {
        return false;
      }
    } else {
      if (this.props.ChartInfo) {
        let list = this.props.ChartInfo;
        let info = list.find(x => x.ProductCommonSysNo == ProductCommonSysNo);
        if (info && info.SysNo > 0) {
          return true
        } else {
          return false;
        }
      }
    }
  }

  setModel(model) {
    if (this.state.isLive) {
      let productService = new ProductService();
      productService.GetProductDetail(model.ProductCommonSysNo, '', (list) => {
        let result = {};
        if (list != null && list.length > 0) {
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
              SelectInfo: result, productList: list, selectProperties: [], singleNumber: model.Quantity, isReload: true
            })
            return result;
          } else {
            this.setState({
              SelectInfo: model, productList: list, selectProperties: [], singleNumber: model.Quantity, isReload: true
            })
            return null;
          }
        } else {
          this.issucced = false;
          this.setState({ SelectInfo: model, selectProperties: [], singleNumber: model.Quantity });
          thisObj.refs["messageBar"].show('未找到当前商品,请更新数据后重试', 2);
        }
      });
    }
  }
  setDefultSpec(model) {
    if (model && model.Properties) {
      if (typeof (model.Properties) == 'string') {
        model.Properties = JSON.parse(model.Properties);
      }
      let temp = [];
      model.Properties.map((item, index) => {
        temp.push({ pSysNo: item.PCSysNo, cSysNo: item.ValueSysNo, Name: item.Name });
      })
      this.state.selectProperties = temp;
    }
  }
  render() {
    setStyle();
    this.getChartProuct();
    let dataSource = this.state.dataList;
    let self = this;
    let model = this.state.SelectInfo;
    // let GroupPropertiesStr = model.GroupProperties;
    // if (GroupPropertiesStr && typeof (GroupPropertiesStr) == 'string') {
    //     model.GroupProperties = JSON.parse(GroupPropertiesStr);
    // }
    if (self.state.isReload) {
      this.setDefultSpec(model);
      self.getProductProperties(this.state.productList);
    }
    let GroupPropertiesStr = [];
    if (this.renderproCommprops === null || this.renderproCommprops.length === 0) {
      GroupPropertiesStr = this.renderproCommprops = this.proCommprops;
    } else {
      GroupPropertiesStr = this.renderproCommprops;
    }
    return (
      <Modal
        animationType='fade'
        transparent={true}
        visible={this.state.isSHowModal}
        supportedOrientations={['portrait', 'landscape']}
        onRequestClose={() => { this.onRequestClose() }}  // android必须实现
      >
        <OperationMessage ref="messageBar" />
        <View style={productStyles.modalStyle}>
          <View style={productStyles.titleWap}>
            <Text style={productStyles.titleText}>{this.props.title ? this.props.title : ''}</Text>
            <TouchableOpacity style={[productStyles.back]} onPress={() => {
              this.Controllmodal(false);
            }}>
              <View><SvgUri width={getResponsiveValue(40)} height={getResponsiveValue(40)} fill={CompanyConfig.formatColor(CompanyConfig.AppColor.SecondaryFront)} source={"back"} /></View>
              {/* <SvgUri width={getResponsiveValue(40)} height={getResponsiveValue(40)} fill={CompanyConfig.formatColor(CompanyConfig.AppColor.MainFront)} source={"back"} /> */}
            </TouchableOpacity>
          </View>
          <View style={productStyles.productListWap}>
            {
              dataSource && dataSource.length > 0 ?
                <ScrollView
                  automaticallyAdjustContentInsets={false}
                  horizontal={true}
                  style={[productStyles.scrollView, productStyles.horizontalScrollView, { marginTop: getResponsiveValue(20) }]}
                >
                  {
                    dataSource.map((item, index) => {
                      return (

                        <View style={productStyles.imgItemWap} key={'imagItem' + index}>
                          <TouchableOpacity activeOpacity={0.8} onPress={() => {
                            this.setModel(item);
                          }}>
                            <Image style={productStyles.imgItem} source={item.productDefaultImage}>
                            </Image>

                            <View style={productStyles.indexTextwap}>
                              <Text style={productStyles.indexText}>{index + 1}</Text>
                            </View>
                            {
                              this.checkIsInChart(item.ProductCommonSysNo) ?
                                <Text style={productStyles.IsShopping}>已选</Text> : null
                            }
                            <View style={productStyles.nameWap}>
                              <Text style={productStyles.nameText}>{item.ProductName.length > 5 ? item.ProductName.substring(0, 4) + '...' : item.ProductName}</Text>
                            </View>
                            {
                              this.state.SelectInfo.ProductCommonSysNo == item.ProductCommonSysNo ? <View style={productStyles.select}>
                              </View> : null
                            }
                          </TouchableOpacity>
                        </View>
                      )
                    })
                  }
                </ScrollView> : null
            }
          </View>
          <View style={productStyles.specWap}>
            <Image style={productStyles.bigImage} source={model.productDefaultImage}>


            </Image>
            <View style={{ flexDirection: 'column', width: getResponsiveValue(824), }}>
              {
                GroupPropertiesStr && GroupPropertiesStr.length > 0 ?
                  GroupPropertiesStr.map((item, index) => {
                    return (
                      item.Name && item.ValueList && item.ValueList.length > 0 ?
                        <View key={'vp' + index} style={productStyles.GroupPropertiesItemswap}>
                          <Text style={productStyles.GroupPropertiesItemsTitle}>{item.Name}： </Text>
                          <ScrollView
                            key={model.ProductCommonSysNo}
                            automaticallyAdjustContentInsets={false}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            style={[productStyles.scrollView, productStyles.horizontalScrollView,]}
                          >
                            {
                              item.ValueList.map((vItem, vIndex) => {
                                return <TouchableOpacity style={{ marginVertical: getResponsiveValue(2) }} key={index + 'vc' + vIndex} activeOpacity={0.8} onPress={() => {
                                  this.checkInfoMater(item, item.PCSysNo, vItem.SysNo, item.Name, model);
                                }}>

                                  {
                                    typeof vItem.disable === 'undefined' || !vItem.disable ? (
                                      <Text style={this.checkIsSelect(vItem.SysNo) ? productStyles.GroupPropertiesSelectItems : productStyles.GroupPropertiesItems}>
                                        {vItem.Value}
                                      </Text>
                                    ) : (
                                        <Text style={productStyles.GroupPropertiesDisabledItems}>
                                          {vItem.Value}
                                        </Text>
                                      )
                                  }
                                </TouchableOpacity>
                              })
                            }
                          </ScrollView>
                        </View>

                        : null
                    )
                  }) : null
              }
              <View style={productStyles.GroupPropertiesItemswap}>
                <Text style={productStyles.GroupPropertiesItemsTitle}>数量：</Text>
                <NumberChange addlayout={(a) => this._add = a}
                  reducelayout={(r) => this._reduce = r}
                  defaultNumber={this.state.singleNumber}
                  isShouldLagerZero={true}
                  onNumberChange={(number) => { this.productNumber(number) }}></NumberChange>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    )
  }
}





