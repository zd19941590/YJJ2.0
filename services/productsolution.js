import SQLiteBase from './sqlite.js';
import FileHelper from '../helpers/fileHelper.config.js';
import companyConfig from '../config/company.config.js';

//const defaultImageUrl=`${envConfig.imageBaseUrl}/tn1/3960e13a-4661-48fc-b745-088b2fb52728.png`;
const defaultImageUrl = companyConfig.CompanyBGImg;



export default class ProductSolutionService extends SQLiteBase {

    log(msg) {
        // console.log(msg);
    }
    AddContent() {
        super.Example_Add();
    }
    GetSolutionList(startNo, pageSize, searchObj, menuSeriesSysNo, resultHandler) {


        let base = this;
        let db = this.open();

        base.GetSolutionList_GetSqlText(startNo, pageSize, searchObj, menuSeriesSysNo).then((sql) => {

            db.transaction((tx) => {
                tx.executeSql(sql, null, (tx, result) => {

                    if (result != null) {

                        // var arrayResult = base.ResultToArray(result);
                        // resultHandler(arrayResult);
                        // base.ResultToArray(result).then((data)=>{
                        //     resultHandler(data);
                        // });
                        let data = base.checkProductToArray(result);
                        resultHandler(data);
                    }
                }, (err) => {
                    //   console.log(err);
                });
            }, (error) => {
                // console.log('Transaction Error:', error);
                // db.close();
            }, () => {
                // db.close();
            });
        });
    }
    async GetSolutionList_GetSqlText(startNo, pageSize, searchObj, menuSeriesSysNo, resultHandler) {

        var sqlText = "select * from ProductSolution where companyId='" + this.GetCompanyID() + "'  ";

        // if (searchObj.SearchText != null && searchObj.SearchText != '') {
        //     sqlText += " and Name like '%" + searchObj.SearchText + "%'";
        // }
        // if (searchObj.SearchStyleSysNo != null) {
        //     sqlText += " and StyleSysNo = " + searchObj.SearchStyleSysNo + "";
        // }
        // if (searchObj.SearchSeriesSysNo != null) {
        //     sqlText += " and SeriesSysNo = " + searchObj.SearchSeriesSysNo + "";
        // }

        // await this.SearchSeriesUnionPermissionSeries(null).then((seriesNos) => {
        //     sqlText += " and SeriesSysNo in( " + seriesNos + ")";
        // });

        if (menuSeriesSysNo != null) {
            sqlText += "AND SeriesSysNo=" + menuSeriesSysNo;
        }

        sqlText += " order by  CASE when DefaultImage is null OR  LENGTH(trim(DefaultImage))<1 then 1 else 0 end asc , IFNULL(ProductSolution.priority,999) asc limit " + startNo + "," + pageSize + ";";
        //  console.log(sqlText);
        return sqlText;
    };
    GetSolutionDetail(SysNo, resultHandler) {
        let db = this.open();
        let base = this;
        db.transaction((tx) => {
            tx.executeSql("select * from  ProductSolution  where SysNo = " + SysNo, null, (tx, result) => {
                if (result != null && result.rows.length > 0) {
                    let conInfo = result.rows.item(0);
                    if (conInfo.ProductList) {
                        conInfo.ProductList = JSON.parse(conInfo.ProductList);
                    }
                    base.checkeProduct(conInfo, resultHandler);
                }
            }, (err) => {
                this.log("Get Content Data Failed.");
                this.log(err);
            });
        }, (error) => {
            // db.close();
        }, () => {
            // db.close();
        });
    }
    checkeProduct(conInfo, resultHandler) {
        if (conInfo != undefined) {
            conInfo['ProductImgList'] = [];
            conInfo['RealViewImgList'] = [];
            conInfo['InstallationImgList'] = [];

            if (conInfo.Name != null && conInfo.Name.length > 10) {
                conInfo.Name = conInfo.Name.substring(0, 9) + "..."
            } else if (conInfo.ProductCommonName != null && conInfo.ProductCommonName.length > 10) {
                conInfo.ProductCommonName = conInfo.ProductCommonName.substring(0, 9) + "..."
            }
            if (typeof (conInfo.ProductList) == 'string') {
                conInfo.ProductList = JSON.parse(conInfo.ProductList);
            }
            if (conInfo.ProductList && conInfo.ProductList.length > 0) {
                if (typeof (conInfo.ProductList) == 'string') {
                    conInfo.ProductList = JSON.parse(conInfo.ProductList);
                }
                let ProductList = conInfo.ProductList;
                let db = this.open();
                let base = this;
                let SysNo = "";
                let index = 1;
                let emptyArr = [];

                if (ProductList && ProductList.length > 0) {
                    ProductList.forEach((info) => {
                        if (info.SysNo > 0) {
                            if (index == 1) {
                                SysNo += info.SysNo;
                                index++;
                            } else {
                                SysNo += "," + info.SysNo;
                            }
                        }
                    });
                    db.transaction((tx) => {
                        var sqlText = "select product.*,productcommon.ImageList ProductCommonImageList,productcommon.StyleName,productcommon.SeriesName,productcommon.CategoryName from product left join productcommon " +
                            "on productcommon.sysNo=product.productcommonsysNo where product.sysno in (" + SysNo + ") ;";
                        tx.executeSql(sqlText, null, (tx, result) => {
                            if (result != null) {
                                base.ArrangeProductImagesAsync(result).then((data) => {
                                    conInfo.SalePrice = 0;
                                    for (var i = 0; i < data.length; i++) {
                                        data[i].PromotionPrice = Number(data[i].PromotionPrice);
                                        data[i].SalePrice = Number(data[i].SalePrice);
                                        if (data[i].PromotionPrice && data[i].PromotionPrice != 0 && data[i].PromotionPrice < data[i].SalePrice) {
                                            conInfo.SalePrice += data[i].PromotionPrice;
                                        } else {
                                            conInfo.SalePrice += data[i].SalePrice;
                                        }
                                        let solutionItemPriority = 1;
                                        conInfo.ProductList.forEach(function (value, index, array) {
                                            if (value.SysNo == data[i].SysNo) {
                                                solutionItemPriority = index;
                                            }
                                        });

                                        data[i]["SolutionItemPriority"] = solutionItemPriority;
                                    }
                                    conInfo.ProductList = data.sort(function (a, b) {
                                        return a.SolutionItemPriority - b.SolutionItemPriority
                                    });
                                    conInfo.SalePrice = conInfo.SalePrice;
                                    resultHandler(conInfo);
                                });
                            } else {
                                conInfo.ProductList = emptyArr;
                                resultHandler(conInfo);
                            }
                        }, (err) => {
                            this.log("Get Content Data Failed.");
                            this.log(err);
                        });
                    }, (error) => {
                        // db.close();
                    }, () => {
                        // db.close();
                    });
                }
            } else {
                conInfo.SalePrice = 0;
                conInfo.ProductList = [];
                resultHandler(conInfo);
            }
        }
    }
    GetProductDetail(sysNo, resultHandler) {
        let base = this;
        let db = this.open();
        //var sqlText="select * from productcommon where sysno=1004";
        var sqlText = "select product.*,productcommon.ImageList ProductCommonImageList,productcommon.StyleName,productcommon.SeriesName,productcommon.CategoryName from product left join productcommon " +
            "on productcommon.sysNo=product.productcommonsysNo where product.sysno='" + sysNo + "'";
        db.transaction((tx) => {
            tx.executeSql(sqlText, null, (tx, result) => {
                if (result != null) {

                    base.ArrangeProductImagesAsync(result.rows.item(0)).then((data) => {
                        // console.log('afterarrage');
                        // console.log(data);
                        resultHandler(data);
                    });
                }
            }, (err) => {
                //    console.log(err);
            });
        }, (error) => {
            //   console.log('Transaction Error:', error);

        }, () => {

        });
    }
    //将商品图片分组整理   且加载图片url
    async ArrangeProductImagesAsync(products) {
        let resultList = [];
        if (products.rows.length > 0) {
            for (var j = 0; j < products.rows.length; j++) {
                const imageGroup = {
                    Product: 'Product',    //商品图片组
                    Installation: 'Installation', //安装图片组
                    RealView: 'RealView'    //实景图片组
                };
                let product = products.rows.item(j);
                product["Name"] = product.ProductName;
                if (product.ProductName && product.ProductName.length > 10) {
                    product.ProductName = product.ProductName.substring(0, 9) + "...";
                }
                product['ProductImgList'] = [];
                product['RealViewImgList'] = [];
                product['InstallationImgList'] = [];
                product['Url'] = [];
                product.ImageList = JSON.parse(product.ImageList);
                if (typeof (product.ImageList) != 'object') {
                    product.ImageList = JSON.parse(product.ImageList);
                }
                if (typeof (product.ProductCommonImageList) != 'object') {
                    product.ProductCommonImageList = JSON.parse(product.ProductCommonImageList);
                }
                if (product.ImageList == null) {
                    product.ImageList = [];
                }
                if (product.ProductCommonImageList != null && product.ProductCommonImageList.length > 0) {
                    product.ImageList = product.ImageList.concat(product.ProductCommonImageList);
                }
                for (var i = 0; i < product.ImageList.length; i++) {
                    var item = product.ImageList[i];
                    await FileHelper.fetchFile(item.Path).then((uri) => {
                        if (uri != null && uri != '') {
                            // item["Url"] = uri;
                            product['Url'].push(uri);
                        }
                        if (item.GroupID == imageGroup.Product) {
                            product["ProductImgList"].push({ uri: uri, Path: item.Path });
                        }
                        if (item.GroupID == imageGroup.Installation) {
                            product["InstallationImgList"].push({ uri: uri, Path: item.Path });

                        }
                        if (item.GroupID == imageGroup.RealView) {
                            product["RealViewImgList"].push({ uri: uri, Path: item.Path });
                        }
                    });
                }
                resultList.push(product)
            }
        }
        return resultList;
    }
    //获取空间方案的销售价格
    //空间方案暂不需要批发价
    getSolutionSalePrice(conInfo, resultHandler) {
        var productSysNos = [0];
        if (conInfo.ProductList != null) {
            for (var i = 0; i < conInfo.ProductList.length; i++) {
                productSysNos.push(conInfo.ProductList[i].SysNo);
            }

        }

        let db = this.open();
        let base = this;
        db.transaction((tx) => {
            tx.executeSql("select ifnull(sum(SalePrice),0) Price from Product where SysNo in(" + productSysNos.join(",") + ")", null, (tx, result) => {
                if (result != null && result.rows.length > 0) {
                    var data = result.rows.item(0);
                    if (data[i].PromotionPrice != null && data[i].PromotionPrice != undefined) {
                        conInfo.SalePrice += data.PromotionPrice;
                    } else {
                        if (data[i].PromotionPrice == null && data[i].PromotionPrice == undefined) {
                            conInfo.SalePrice += 0;
                        } else {
                            conInfo.SalePrice += data.SalePrice;
                        }
                    }
                    resultHandler(conInfo);
                }
            }, (err) => {
                this.log("Get ProductSolution Price.");
                this.log(err);
            });
        }, (error) => {
            // db.close();
        }, () => {
            // db.close();
        });

    }

    getNextOrUpDetail(productSolution, searchObj, NextOrUp, resultHandler) {
        let base = this;
        let db = this.open();
        // let order = 'asc ';

        let sqlSearchObjText = "";
        if (typeof (searchObj) != 'undefined' && searchObj != null && typeof (searchObj.MenuSeriesSysNo) != 'undefined' && searchObj.MenuSeriesSysNo != null) {
            sqlSearchObjText += " and ProductSolution.SeriesSysNo=" + searchObj.MenuSeriesSysNo;
        }

        let sqlText = '';
        if (NextOrUp == '<') {
            // order = 'desc';
            //查询下一个
            sqlText = "select ProductSolution.SysNo SysNo from ProductSolution " +
                " where ProductSolution.companyId='" + this.GetCompanyID() + "' and ((ifnull(ProductSolution.priority,999) =ifnull(" + productSolution.Priority + ",999) and ProductSolution.SysNo <" + productSolution.SysNo + ") or ( ifnull(ProductSolution.priority,999) >ifnull( " + productSolution.Priority +
                ",999) ) ) " + sqlSearchObjText + "  order by IFNULL(ProductSolution.priority, 999), ProductSolution.SysNo desc limit 1 ";
        } else {
            //查询上一个
            sqlText = "select ProductSolution.SysNo SysNo from ProductSolution" +
                " where ProductSolution.companyId='" + this.GetCompanyID() + "' and ((ifnull(ProductSolution.priority,999)=ifnull(" + productSolution.Priority + ",999) and ProductSolution.SysNo >" + productSolution.SysNo + ") or ( ifnull(ProductSolution.priority,999) <ifnull(" + productSolution.Priority +
                ",999)) ) " + sqlSearchObjText + " order by IFNULL(ProductSolution.priority, 999) desc, ProductSolution.SysNo limit 1";
        }

        db.transaction((tx) => {
            tx.executeSql(sqlText, null, (tx, result) => {
                if (result != null) {
                    let data = result.rows.item(0);

                    if (typeof (data) == 'undefined') {
                    } else {
                        base.GetSolutionDetail(data.SysNo, resultHandler);
                    }
                }
            }, (err) => {
            });
        }, (error) => {
        }, () => {
        });
    }
    async  ResultToArray(result, resultHandler) {
        var datas = [];
        for (var i = 0; i < result.length; i++) {
            var item = result[i];
            item["ImagePathList"] = [];
            if (item.ImageList && item.ImageList != null) {
                if (typeof (item.ImageList) == 'string') {
                    item.ImageList = JSON.parse(item.ImageList);
                }
                if (item.ImageList != null && item.ImageList.length > 0) {
                    for (var j = 0; j < item.ImageList.length; j++) {
                        if (typeof (item.ImageList[j]) == 'string') {
                            item.ImageList[j] = JSON.parse(item.ImageList[j]);
                        }
                        let img = item.ImageList[j];
                        await FileHelper.GetLocalFileOrHttpUri(
                            img.Path,()=>{
                            // FileHelper.fetchFile(img.Path);
                        }).then((uri) => {
                            if (uri != null && uri != '') {
                                item.ImagePathList.push(uri);
                            }
                        });
                    }
                } else {
                    // item.ImagePathList.push("../../assets/images/pic-loading.jpg");
                }
            }
            datas.push(item);
        }
        return datas;
    }
    checkProductToArray(result) {
        var datas = [];
        for (var i = 0; i < result.rows.length; i++) {
            var item = result.rows.item(i);
            // item["Name"] = item.ProductName;
            datas.push(item);
        }
        return datas;
    }
}