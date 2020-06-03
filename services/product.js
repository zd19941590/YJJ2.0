import SQLiteBase from './sqlite.js';
import axios from "axios";
import envConfig from '../config/app.config.js';
import FileHelper from '../helpers/fileHelper.config.js';
import companyConfig from '../config/company.config.js';

const defaultImageUrl = companyConfig.CompanyBGImg;

export default class ProductService extends SQLiteBase {
    log(msg) {
        console.log(msg);
    }

    GitDistributorSeries() {
        return axios.post("/Product/GitDistributorSeries")
    }
    //根据商品编号获取商品长图
    GetLongImageDetails(productSysNo)
    {
         return axios.get(`/Common/GetProductLongImages?productSysNo=${productSysNo}`);
        //return axios.get(`/Common/GetProductLongImages?productSysNo=1409882`);
    }
    InsertDistributorProductMultiple(entity) {
        return axios.post("/Product/InsertDistributorProductMultiple", entity)
    }
    // check out products  on no-login state, just show a part of items with having auth,
    // those items could be set in manager system by company application manager;
    // if user had been signed in, plz break this method. only in this way can application
    // do normal download; 
    /**
     * get product list on no-logined state
     * @param {company unique key} CompanySysNo 
     */
    getProducts_NoLogin(CompanySysNo,SeriesSysNo) {
        return axios.post(`/Product/GetproductListByCompanySysNo?CompanySysNo=${CompanySysNo}&SeriesSysNo=${SeriesSysNo}`);
    }

    GetProductDetail(productcommonsysNo, SysNo, resultHandler) {
        let base = this;
        let db = this.open();
        let sqlStr = "";
        if (SysNo && SysNo.length > 0) {
            sqlStr = "on productcommon.sysNo=product.productcommonsysNo where product.SysNo in (" + SysNo.join(",") + ")";
        } else {
            sqlStr = "on productcommon.sysNo=product.productcommonsysNo where product.ProductCommonSysNo='" + productcommonsysNo + "  '  ORDER BY IFNULL(product.priority,999)";
            // sqlStr = "on productcommon.sysNo=product.productcommonsysNo where product.SysNo='" + sysNo + "'";
        }
        //,productcommon.GroupProperties as GroupProperties
        var sqlText = "select product.*,productcommon.ImageList ProductCommonImageList,productcommon.StyleName,productcommon.SeriesName,productcommon.CategoryName from product left join productcommon " + sqlStr;
        db.transaction((tx) => {
            tx.executeSql(sqlText, null, (tx, result) => {
                if (result.rows.length > 0) {
                    base.ArrangeProductImagesAsync(result).then((data) => {
                        if (resultHandler) {
                            resultHandler(data);
                        }
                    });
                } else {
                    resultHandler(null);
                }
            }, (err) => {
                //   console.log(err);
            });
        }, (error) => {
            //   console.log('Transaction Error:', error);

        }, () => {

        });
    }
    //通过商品productcommonsysNo  确定 商品
    getProductByCommSysNo(productcommonsysNo, resultHandler) {
        let base = this;
        let db = this.open();
        let sqlStr = "";
        sqlStr += "select product.* from product where productcommonsysNo = " + productcommonsysNo;
        db.transaction((tx) => {
            tx.executeSql(sqlStr, null, (tx, result) => {
                if (result && result.rows.length > 0) {
                    let products = this.ConvertResultToArray(result);
                    if (products && products.length > 0) {
                        // products.forEach(product => {
                        //     // if(product.Properties){
                        //     //     let Properties = JSON.parse(product.Properties);

                        //     // }
                        // });
                        resultHandler(products);
                    }
                }
            })
        })
    }
    AddContent() {
        super.Example_Add();
    }
    GetContent(sysNo, resultHandler) {
        let self = this;
        super.Example_Get(sysNo, resultHandler);
        return;
        let db = this.openDB();
        db.transaction((tx) => {
            tx.executeSql("select SysNo,TopicCategorySysNo,Title,SubTitle,DefaultImage,Summary,Content,TopicContentType,Keywords,Tag,IsRed,IsTop,PageViews,StartTime,EndTime,TopicStatus,FileList,LastReplicationDate "
                + " from  AppContent where companyId='" + self.GetCompanyID() + "'", null, (tx, result) => {
                    this.log("Get Content Data Success.");

                    this.log("Result: " + JSON.stringify(result));
                    this.log("Result Executes: " + JSON.stringify(result.executes));
                    this.log("Result Length: " + result.rows.length);
                    let conInfo = result.rows.item(0);
                    if (resultHandler != null) {
                        this.log("Hanldler result content; SysNo=" + conInfo.SysNo);
                        resultHandler(conInfo);
                    }
                }, (err) => {
                    this.log("Get Content Data Failed.");
                    this.log(err);
                });
        }, (error) => {

        }, () => {

        });
    }

    UpdateSalePrice(SysNo, SalePrice, resultHandler) {
        let base = this;
        let db = this.open();
        var sqlText = "update product set PromotionPrice=" + SalePrice + " where sysno=" + SysNo;
        db.transaction((tx) => {
            tx.executeSql(sqlText, null, (tx, result) => {

                resultHandler(base.ConvertResultToArray(result));
            }, (err) => {
                this.log(err);
            });

        }, (error) => {

        }, () => {

        });
    }
    DistributorUpdateProductSaleInfo(model) {
        return axios.post("/Product/DistributorUpdateProductSaleInfo", model)
    }
    GetProducts(startNo, pageSize, searchObj, menuCategoryCode, menuSeriesSysNo, menuTag, resultHandler) {

        let base = this;
        let db = this.open();
        base.GetProducts_GetSqlText(startNo, pageSize, searchObj, menuCategoryCode, menuSeriesSysNo, menuTag).then((sql) => {
            db.transaction((tx) => {
                tx.executeSql(sql, null, (tx, result) => {
                    if (result != null) {
                        base.masterProductListAndDetailInfo(result, resultHandler);
                    }
                }, (err) => {
                    //    console.log(err);
                });
            }, (error) => {
                //  console.log('Transaction Error:', error);

            }, () => {

            });
        });
    }

    async GetProducts_GetSqlText(startNo, pageSize, searchObj, menuCategoryCode, menuSeriesSysNo, menuTag) {
        //,productcommon.SeriesName as product[SeriesName]
        var sqlText = "select * from (SELECT Product.SysNo as SysNo , ProductCommon.ProductCommonName ProductName,  Product.priority , ifnull( ProductCommon.DefaultImage,Product.DefaultImage) as DefaultImage , ";
        sqlText += " ProductCommon.CategorySysNo,ProductCommon.CategoryCode,ProductCommon.CategoryName, ProductCommon.BrandSysNo, ProductCommon.SeriesSysNo, ProductCommon.StyleSysNo,";
        sqlText += " ProductCommon.BrandName,ProductCommon.SeriesName,ProductCommon.StyleName, ProductCommon.PromotionTitle, ProductCommon.MerchantSysNo, ProductCommon.GroupProperties,";
        sqlText += " ProductCommon.ImageList ,";
        sqlText += " Product.ProductCommonSysNo,Product.ProductTag FROM ProductCommon  INNER JOIN Product  on  Product.ProductCommonSysNo = ProductCommon.SysNo ";
        sqlText += " where productcommon.CompanyId='" + super.GetCompanyID() + "' ";
        var tagText = "";
        // sqlText += " and productcommon.StyleSysNo=-1 ";
        if (searchObj != null && sqlText != '') {
            if (searchObj.SearchText != null && searchObj.SearchText != '') {
                sqlText += " and (productcommon.productcommonName like '%" + searchObj.SearchText + "%' or Product.SKUModel like '%" + searchObj.SearchText + "%')";
            }
            if (searchObj.SearchStyleSysNos != null && searchObj.SearchStyleSysNos.length > 0) {
                sqlText += " and productcommon.StyleSysNo in(" + searchObj.SearchStyleSysNos + ")";
            }

            if (searchObj.SearchSeriesSysNos != null && searchObj.SearchSeriesSysNos.length > 0) {


                sqlText += " and productcommon.SeriesSysNo in(" + searchObj.SearchSeriesSysNos + ")";
            }
            if (searchObj.SearchProductTag != null && searchObj.SearchProductTag.length > 0) {
                var tag = "";
                searchObj.SearchProductTag.forEach((tagStr, index) => {
                    if (index == searchObj.SearchProductTag.length - 1) {
                        tag += "'" + tagStr + "'"
                    } else {
                        tag += "'" + tagStr + "',"
                    }
                })
                tagText = " where trim(temptable.ProductTag) in(" + tag + ")";
            }
            if (searchObj.SearchCategoryCodes != null && searchObj.SearchCategoryCodes.length > 0) {
                sqlText += " and ("
                for (var i = 0; i < searchObj.SearchCategoryCodes.length; i++) {
                    if (i != 0) {
                        sqlText += " or";
                    }
                    sqlText += " productcommon.CategoryCode like '" + searchObj.SearchCategoryCodes[i] + "%'";
                }
                sqlText += ")";
            }
        } else {
            if (typeof (menuCategoryCode) != 'undefined' && menuCategoryCode != null && menuCategoryCode != "") {
                sqlText += " and productcommon.CategoryCode like '" + menuCategoryCode + "%'";
            }

            if (typeof (menuSeriesSysNo) != 'undefined' && menuSeriesSysNo != null && menuSeriesSysNo != "") {
                sqlText += " and productcommon.SeriesSysNo =" + menuSeriesSysNo + "";
            }

            if (typeof (menuTag) != 'undefined' && menuTag != null) {
                sqlText += " and (product.ProductTag ='" + menuTag + "' or product.ProductTag like '%"+menuTag+",%'" + "or product.ProductTag like '%,"+menuTag+"%')";
            }
        }

        // sqlText += " and product.priority=40 ";
        /* sqlText+=" order by priority,tag,LastReplicationDate desc limit "+startNo+","+pageSize+";"; */
        sqlText += " ORDER BY    case when ProductTag is null then 1 else 0 end asc, IFNULL(Product.priority,999)   DESC limit " + startNo + "," + pageSize + ") as temptable ";
        sqlText += tagText
        sqlText += " GROUP BY temptable.ProductCommonSysNo ORDER BY case when DefaultImage is null OR  LENGTH(trim(DefaultImage))<1 then 1 else 0 end asc ,IFNULL(temptable.priority,999) asc , "
        sqlText += "case when ProductTag is null then 1 else 0 end  asc ";
        return sqlText;
    };
    GetProductsList(startNo, pageSize, searchObj, menuCategoryCode, menuSeriesSysNo, menuTag, resultHandler) {

        let base = this;
        let db = this.open();
        base.GetProductsList_GetSqlText(startNo, pageSize, searchObj, menuCategoryCode, menuSeriesSysNo, menuTag).then((sql) => {
            db.transaction((tx) => {
                tx.executeSql(sql, null, (tx, result) => {
                    if (result != null) {
                        resultHandler(base.ConvertResultToArray(result));
                    }
                }, (err) => {
                    //    console.log(err);
                });
            }, (error) => {
                //   console.log('Transaction Error:', error);

            }, () => {

            });
        });
    }

    async GetProductsList_GetSqlText(startNo, pageSize, searchObj, menuCategoryCode, menuSeriesSysNo, menuTag) {
        //,productcommon.SeriesName as product[SeriesName]
        var sqlText = "select product.* ,productcommon.SeriesName from product LEFT JOIN productcommon on productcommon.SysNo=product.productCommonSysNo ";

        sqlText += " where product.CompanyId='" + super.GetCompanyID() + "' ";

        // sqlText += " and productcommon.StyleSysNo=-1 ";
        if (searchObj != null && sqlText != '') {
            if (searchObj.SearchText != null && searchObj.SearchText != '') {
                sqlText += " and (product.ProductName like '%" + searchObj.SearchText + "%' or product.SKUModel like '%" + searchObj.SearchText + "%' or productcommon.SeriesName like '%" + searchObj.SearchText + "%')";
            }
            if (searchObj.SearchStyleSysNos != null && searchObj.SearchStyleSysNos.length > 0) {
                sqlText += " and productcommon.StyleSysNo in(" + searchObj.SearchStyleSysNos + ")";
            }
            if (searchObj.SearchSeriesSysNos != null && searchObj.SearchSeriesSysNos.length > 0) {
                sqlText += " and productcommon.SeriesSysNo in(" + searchObj.SearchSeriesSysNos + ")";
            }

            if (searchObj.SearchCategoryCodes != null && searchObj.SearchCategoryCodes.length > 0) {
                sqlText += " and ("
                for (var i = 0; i < searchObj.SearchCategoryCodes.length; i++) {
                    if (i != 0) {
                        sqlText += " or";
                    }
                    sqlText += " productcommon.CategoryCode like '" + searchObj.SearchCategoryCodes[i] + "%'";
                }
                sqlText += ")";
            }
        } else {
            if (typeof (menuCategoryCode) != 'undefined' && menuCategoryCode != null && menuCategoryCode != "") {
                sqlText += " and productcommon.CategoryCode like '" + menuCategoryCode + "%'";
            }

            if (typeof (menuSeriesSysNo) != 'undefined' && menuSeriesSysNo != null && menuSeriesSysNo != "") {
                sqlText += " and productcommon.SeriesSysNo =" + menuSeriesSysNo + "";
            }

            if (typeof (menuTag) != 'undefined' && menuTag != null) {
                //连接字符串使用||
                sqlText += " and (product.ProductTag||',') like '%" + menuTag + ",%' ";
            }
        }

        // sqlText += " and product.priority=40 ";
        /* sqlText+=" order by priority,tag,LastReplicationDate desc limit "+startNo+","+pageSize+";"; */
        sqlText += " order by productcommon.SeriesSysNo ,IFNULL(product.priority,999) ASC limit " + startNo + "," + pageSize + ";";//IFNULL(product.priority,999) ,product.SysNo

        return sqlText;
    };


    //将数据库查询出的结果保存为数组
    ConvertResultToArray(result) {
        var datas = [];
        for (var i = 0; i < result.rows.length; i++) {
            var item = result.rows.item(i);
            datas.push(item);
        }
        // this.getProductByCommSysNos(result);
        return datas;
    }
    //在查询商品；list的时候 将商品详情的数据同时查询出来
    masterProductListAndDetailInfo(result, resultHandler) {

        var datas = [];
        let CommonSysNos = [];
        let ProductList = [];
        for (var i = 0; i < result.rows.length; i++) {
            var item = result.rows.item(i);
            if (!item.CommonProductList) {
                item.CommonProductList = [];
            }
            datas.push(item);
            CommonSysNos.push(item.ProductCommonSysNo)
        }
        let base = this;
        let db = this.open();
        let sqlStr = "";
        sqlStr += "select product.* from product where productcommonsysNo  in (" + CommonSysNos.join(',') + ")";
        db.transaction((tx) => {
            tx.executeSql(sqlStr, null, (tx, results) => {
                if (results && results.rows.length > 0) {
                    for (var i = 0; i < results.rows.length; i++) {
                        var item = results.rows.item(i);
                        ProductList.push(item);
                    }
                    datas.forEach((item, index) => {
                        // let CommonP = ProductList.find((a)=>{
                        //     return a.ProductCommonSysNo == item.ProductCommonSysNo
                        // })
                        let info = item;
                        let commImgList = info.ImageList;
                        if (item.ImageList && typeof (item.ImageList) == 'string') {
                            item.ImageList = JSON.parse(item.ImageList);
                        }
                        let coommInstallationImage = [];
                        let coommRealViewImage = []
                        let commProductImage = [];
                        if (item.ImageList && item.ImageList.length > 0) {
                            item.ImageList.forEach((img) => {
                                if (img.GroupID == 'RealView') {
                                    coommRealViewImage.push(img)
                                } else if (img.GroupID == 'Installation') {
                                    coommInstallationImage.push(img);
                                }
                            })
                        }
                        // if (!item.ImageList) {
                        // }
                        item.ImageList = [];
                        ProductList.forEach((p) => {
                            if (p.ProductCommonSysNo == item.ProductCommonSysNo) {
                                if (typeof (p.ImageList) == 'string') {
                                    p.ImageList = JSON.parse(p.ImageList);
                                }
                                if (p.ImageList && typeof (p.ImageList) == 'string') {
                                    p.ImageList = JSON.parse(p.ImageList);
                                } else if (!p.ImageList) {
                                    p.ImageList = [];
                                }
                                let pImgList = p.ImageList;

                                let RealViewImage = [];
                                let ProductImage = [];
                                let InstallationImage = [];
                                if (pImgList && pImgList.length > 0) {
                                    pImgList.forEach((pitem) => {
                                        if (pitem.GroupID == 'Product') {
                                            ProductImage.push(pitem);
                                            if (commProductImage) {
                                                let exitPath = commProductImage.find((a) => {
                                                    return a.Path == pitem.Path
                                                })
                                                if (!exitPath) {
                                                    commProductImage.push(pitem);
                                                }
                                            }
                                        } else if (pitem.GroupID == 'RealView') {
                                            RealViewImage.push(pitem)

                                        } else if (pitem.GroupID == 'Installation') {
                                            InstallationImage.push(pitem);
                                        }

                                    });
                                }
                                if (p.ImageList) {
                                    p.ImageList = [];
                                    p.ImageList = p.ImageList.concat(ProductImage);
                                    p.ImageList = p.ImageList.concat(RealViewImage);
                                    p.ImageList = p.ImageList.concat(InstallationImage);
                                    if (coommRealViewImage && coommRealViewImage.length > 0) {
                                        p.ImageList = p.ImageList.concat(coommRealViewImage);
                                    } else {
                                        coommRealViewImage = coommRealViewImage.concat(RealViewImage);
                                    }
                                    if (coommInstallationImage && coommInstallationImage.length > 0) {
                                        p.ImageList = p.ImageList.concat(coommInstallationImage);
                                    } else {
                                        coommInstallationImage = coommInstallationImage.concat(InstallationImage);
                                    }
                                }
                                // p.GroupProperties = item.GroupProperties;
                                p['SeriesName'] = item.SeriesName;
                                p['StyleName'] = item.StyleName;
                                item.CommonProductList.push(p);
                                if ((item.DefaultImage == null || item.DefaultImage == undefined || item.DefaultImage == "") && (p.DefaultImage != undefined && p.DefaultImage != null && p.DefaultImage.length > 0)) {
                                    item.DefaultImage = p.DefaultImage;
                                }
                            }
                        })
                        // if(commImgList&&typeof commImgList == 'string'){
                        //     commImgList = JSON.parse(commImgList);
                        // }
                        // if(commImgList&&commImgList.length>0){
                        //     item.ImageList = item.ImageList.concat(commImgList);
                        // }
                        if (commProductImage && commProductImage.length > 0) {
                            item.ImageList = item.ImageList.concat(commProductImage);
                        }
                        if (coommRealViewImage && coommRealViewImage.length > 0) {
                            item.ImageList = item.ImageList.concat(coommRealViewImage);
                        }
                        if (coommInstallationImage && coommInstallationImage.length > 0) {
                            item.ImageList = item.ImageList.concat(coommInstallationImage);
                        }
                    })
                    resultHandler(datas);
                } else {
                    resultHandler(datas);
                }
            })
        })
    }
    //将数据库查询出的结果保存为数组  且加载图片url地址
    async ResultToArray(result) {

        var datas = [];

        for (var i = 0; i < result.rows.length; i++) {
            var item = result.rows.item(i);

            await FileHelper.fetchFile(item.DefaultImage).then((uri) => {

                if (uri != null && uri != '') {
                    item['DefaultImageUrl'] = uri;
                } else {
                    item['DefaultImageUrl'] = defaultImageUrl;
                }

                datas.push(item);

            });

        }

        return datas;
    }

    //将商品图片分组整理   且加载图片url
    async ArrangeProductImagesAsync(products) {
        const imageGroup = {
            Product: 'Product',    //商品图片组
            Installation: 'Installation', //安装图片组
            RealView: 'RealView'    //实景图片组
        };
        let result = [];
        if (products) {
            for (var j = 0; j < products.rows.length; j++) {
                let product = products.rows.item(j);
                product[imageGroup.Product + "Images"] = [];
                product['IsProductdefult'] = false;
                product[imageGroup.Installation + "Images"] = [];
                product['IsInstallationfult'] = false;
                product[imageGroup.RealView + "Images"] = [];
                product['IsRealViewfult'] = false;
                product['defaulImage'] = defaultImageUrl;
                product['productDefaultImage'] = null;
                //由于存在缓存第一次转为json对象后  返回再进入详情 便ImageList已经是json对象
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
                        if (item.GroupID == imageGroup.Product) {
                            if (product[imageGroup.Product + "Images"]) {
                                product[imageGroup.Product + "Images"].push({ uri: uri, Path: item.Path });
                            }
                        }
                        if (item.GroupID == imageGroup.Installation) {
                            if (product[imageGroup.Installation + "Images"]) {
                                product[imageGroup.Installation + "Images"].push({ uri: uri, Path: item.Path });
                            }
                        }
                        if (item.GroupID == imageGroup.RealView) {
                            if (product[imageGroup.RealView + "Images"]) {
                                product[imageGroup.RealView + "Images"].push({ uri: uri, Path: item.Path });
                            }
                        }
                    });
                }
                if (product.DefaultImage) {
                    await FileHelper.fetchFile(product.DefaultImage).then((uri) => {
                        if (uri != null && uri && uri != '') {
                            product['productDefaultImage'] = { uri: uri }
                            // product['defaulImage'] == {uri:uri}
                            // product.DefaultImage = {uri:uri};
                        } else {
                            product['productDefaultImage'] = defaultImageUrl;
                            // product['defaulImage']== {uri:uri}
                            // product.DefaultImage = defaultImageUrl;
                        }
                    })
                } else {
                    product['productDefaultImage'] = envConfig.defaultNoImage;
                    product.DefaultImage = envConfig.defaultNoImage;
                }
                result.push(product);
            }
        }
        return result;
    }



    //获取产品规格属性
    /**
     * 
     * @param {商品规格属性} Properties 
     * @param {商品组规格属性} GroupProperties 
     * @param {是否是购物车} IsShopping 
     */
    getProductSpecStr(Properties, GroupProperties, IsShoppingCart = null) {
        var propertyArray = [];
        if (typeof (GroupProperties) != 'undefined' && GroupProperties != null) {
            let groupProperties = typeof (GroupProperties) == 'string' ? JSON.parse(GroupProperties) : GroupProperties;
            propertyArray = propertyArray.concat(groupProperties);
        }
        if (typeof (Properties) != 'undefined' && Properties != null) {
            let properties = typeof (Properties) == 'string' ? JSON.parse(Properties) : Properties;
            propertyArray = propertyArray.concat(properties);
        }

        let set = new Set();
        var propertyStr = "";
        if (IsShoppingCart) {
            propertyArray.map((result) => {
                if (typeof result.Value !== 'undefined') {
                    set.add(result.Value);
                }
            });
        } else {
            for (var i = 0; i < propertyArray.length; i++) {
                // propertyStr += propertyArray[i].Name;
                // propertyStr += ':';
                if (typeof propertyArray[i].ValueList !== 'undefined' && propertyArray[i].ValueList instanceof Array) {
                    propertyArray[i].ValueList.map((e) => {
                        set.add(e.Value);
                    })
                }
                if (typeof propertyArray[i].Value !== 'undefined') {
                    set.add(propertyArray[i].Value);
                }
                // console.log(set);

                // propertyStr += propertyArray[i].Value;
                // if (i != propertyArray.length - 1)
                //     propertyStr += ','
            }
        }
        let arrry = Array.from(set);
        propertyStr = arrry.join(",");
        return propertyStr;
    }
    GetDetailUpOrNext(product, UpOrNext, SearchObj, resultHandler) {

        let base = this;
        let db = this.open();

        let sql = '';
        var sqlText = '';
        sqlText = "select * from (SELECT ProductCommon.ProductCommonName ProductName, ProductCommon.*,Product.ProductCommonSysNo,Product.ProductTag FROM ProductCommon  INNER JOIN Product  on  Product.ProductCommonSysNo = ProductCommon.SysNo "
        sqlText += " where productcommon.CompanyId='" + super.GetCompanyID() + "' ";
        if (SearchObj != null) {

            if (typeof (SearchObj.SearchObj) != 'undefined' && SearchObj.SearchObj != null) {
                if (SearchObj.SearchObj.SearchText != null && SearchObj.SearchObj.SearchText != '') {
                    sql += " and (product.ProductName like '%" + SearchObj.SearchObj.SearchText + "%' or product.SKUModel like '%" + SearchObj.SearchObj.SearchText + "%')";
                }
                if (SearchObj.SearchObj.SearchStyleSysNos != null && SearchObj.SearchObj.SearchStyleSysNos.length > 0) {
                    sql += " and productcommon.StyleSysNo in(" + SearchObj.SearchObj.SearchStyleSysNos + ")";
                }

                if (SearchObj.SearchObj.SearchSeriesSysNos != null && SearchObj.SearchObj.SearchSeriesSysNos.length > 0) {
                    sql += " and productcommon.SeriesSysNo in(" + SearchObj.SearchObj.SearchSeriesSysNos + ")";
                }

                if (SearchObj.SearchObj.SearchCategoryCodes != null && SearchObj.SearchObj.SearchCategoryCodes.length > 0) {
                    sql += " and ("
                    for (var i = 0; i < SearchObj.SearchObj.SearchCategoryCodes.length; i++) {
                        if (i != 0) {
                            sql += " or";
                        }
                        sql += " productcommon.CategoryCode like '" + SearchObj.SearchObj.SearchCategoryCodes[i] + "%'";
                    }

                    sql += ")";
                }
            } else {
                if (typeof (SearchObj.MenuCategoryCode) != 'undefined' && SearchObj.MenuCategoryCode != null && SearchObj.MenuCategoryCode != "") {
                    sql += " and productcommon.CategoryCode like '" + SearchObj.MenuCategoryCode + "%'";
                }

                if (typeof (SearchObj.MenuSeriesSysNo) != 'undefined' && SearchObj.MenuSeriesSysNo != null && SearchObj.MenuSeriesSysNo != "") {
                    sql += " and productcommon.SeriesSysNo =" + SearchObj.MenuSeriesSysNo + "";
                }
            }
        }


        // if (UpOrNext == '<') {
        //     console.log('searchnext');
        //     //查询下一个
        //     sqlText = "select *  from productcommon " +
        //         " inner join product on productcommon.sysNo=product.productcommonsysNo where product.companyId='" + this.GetCompanyID() + "' and ((ifnull(product.priority,999) =ifnull(" + product.Priority + ",999) and product.ProductCommonSysNo <" + product.ProductCommonSysNo + ") or ( ifnull(product.priority,999) >ifnull( " + product.Priority +
        //         ",999) ) ) " + sql + " order by IFNULL(product.priority, 999), product.SysNo desc limit 1 ";
        // } else {
        //     //查询上一个
        //     sqlText = "select *  from  productcommon" +
        //         " inner join product on productcommon.sysNo=product.productcommonsysNo where product.companyId='" + this.GetCompanyID() + "' and ((ifnull(product.priority,999)=ifnull(" + product.Priority + ",999) and product.ProductCommonSysNo >" + product.ProductCommonSysNo + ") or ( ifnull(product.priority,999) <ifnull(" + product.Priority +
        //         ",999)) ) " + sql + " order by IFNULL(product.priority, 999) desc, product.SysNo limit 1";
        // }
        if (UpOrNext == '<') {
            sqlText += sql + " and ProductCommon.SysNo < " + product.ProductCommonSysNo
            sqlText += " ORDER BY IFNULL(product.priority,999), product.ProductTag desc ) as temptable GROUP BY temptable.ProductCommonSysNo  ORDER BY temptable.SysNo  desc limit 1 ";

        } else {
            sqlText += sql + " and ProductCommon.SysNo > " + product.ProductCommonSysNo
            sqlText += " ORDER BY IFNULL(product.priority,999), product.ProductTag desc ) as temptable GROUP BY temptable.ProductCommonSysNo  ORDER BY temptable.SysNo   limit 1 ";

        }

        db.transaction((tx) => {
            tx.executeSql(sqlText, null, (tx, result) => {
                if (result != null) {
                    let info = result.rows.item(0);

                    if (typeof (info) == 'undefined') {
                    } else {
                        base.GetProductDetail(info.ProductCommonSysNo, '', resultHandler);
                    }
                }
            }, (err) => {
                //    console.log(err);
            });
        }, (error) => {
            //   console.log('Transaction Error:', error);

        }, () => {

        });
    }

    //获取商品组
    GetProductCommon(productSysNo, resultHandler) {
        db.transaction((tx) => {
            tx.executeSql('select * from ProductCommon pc left join product p on p.ProductCommonSysNo=pc.SysNo', null, (tx, result) => {
                if (result != null && result.rows.length > 0) {
                    resultHandler(result.rows.item(0));
                }
            }, (err) => {
                //   console.log(err);
            });
        }, (error) => {
            //   console.log('GetProductCommon Error:', error);
        }, () => { });
    }

    GetProductCommonProperty(ni) {


    }

    //获取商品售价
    GetSalePrice(product) {
        let price = product.PromotionPrice && product.PromotionPrice > 0
            // && product.PromotionPrice < product.SalePrice
            ?
            product.PromotionPrice : product.SalePrice;
        return price;
    }

    GetProductImageByCompanyId(resultHandler){
        let CompanyId = this.GetCompanyID();
        let base = this;
        let sql = "select DefaultImage ,ImageList from Product where MerchantSysNo  = "+CompanyId;
        sql+=" union select DefaultImage ,ImageList from ProductCommon where MerchantSysNo  = "+CompanyId;
        let db = this.open();
        db.transaction((tx)=>{
            tx.executeSql(sql, null, (tx, result) => {
                resultHandler(base.ToArray(result));
            }, (err) => {
                //   console.log(err);
            });
        });        
    }
    ToArray(result) {
        var datas = [];
        for (var i = 0; i < result.rows.length; i++) {
            var item = result.rows.item(i);
            // item["Name"] = item.ProductName;
            datas.push(item);
        }
        return datas;
    }
}