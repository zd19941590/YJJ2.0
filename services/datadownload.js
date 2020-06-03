import SQLiteBase from './sqlite.js';
import axios from "axios";
import FileHelper from '../helpers/fileHelper.config.js';
const DEFAULT_SYSNO = 9527;
export default class DataDownloadService extends SQLiteBase {
    downStatus = {
        completionProduct: false, //商品据更新是否完成
        completionSolution: false,
        completionContent: false,
        isDownloadImg: false, // 是否需要下载图片
        startDownloadHandler: function () { },
        downloadErrorHandler: function () { },
        rowSavedHandler: function () { },
        total: 0, // 需要下载的数据总数量
        saveCount: 0, // 已经下载的数据总数量
        productCount: 0,  // 需要更新的商品数量
        productSolutionCount: 0,
        contentCount: 0,
        saveProductCount: 0, // 已经更新的商品数量
        saveProductSolutionCount: 0,
        saveContentCount: 0,
        productList: [],
        productSlutionList: [],
        ContentList: [],
    };
    constructor(props) {
        super(props);
        this.GetDataDownloadStartTime = this.GetDataDownloadStartTime.bind(this);
        this.FlowSaveProductCommonToLocation = this.FlowSaveProductCommonToLocation.bind(this);
        this.FlowSaveProductToLocation = this.FlowSaveProductToLocation.bind(this);
        this.FlowSaveProductSolutionToLocation = this.FlowSaveProductSolutionToLocation.bind(this);
        this.FlowSaveContentToLocation = this.FlowSaveContentToLocation.bind(this);
        this.SaveDictionaryDataToLocation = this.SaveDictionaryDataToLocation.bind(this);
        this.DeleteNoPermissionProductData = this.DeleteNoPermissionProductData.bind(this);


        this.GetProduct = this.GetProduct.bind(this);
        this.GetProductCommon = this.GetProductCommon.bind(this);
        this.GetProductSolution = this.GetProductSolution.bind(this);
        this.GetContent = this.GetContent.bind(this);

        this.saveProductCallback = this.saveProductCallback.bind(this);
        this.dlProduct = this.dlProduct.bind(this);

        this.saveContentCallback = this.saveContentCallback.bind(this);
        this.dlContent = this.dlContent.bind(this);

        this.saveProductSolutionCallback = this.saveProductSolutionCallback.bind(this);
        this.dlProductSolution = this.dlProductSolution.bind(this);

        this.__downloadDataRowSaved = this.__downloadDataRowSaved.bind(this);
        this.onlyDownloadData = this.onlyDownloadData.bind(this);
        this.checkData = this.checkData.bind(this);
        this.getAllFile = this.getAllFile.bind(this);
    }
    // 从本地取得上次下载数据的最后时间，作为本次下载数据的开始时间
    GetDataDownloadStartTime(resultHandler) {
        let db = this.open();
        let companyID = this.GetCompanyID();
        return db.transaction((tx) => {
            tx.executeSql("select CompanyID,MasterName,LastReplicationDate as StartTime,LastSysNo"
                + " from  DataReplicationInfo where CompanyID=?", [companyID], (tx, result) => {
                    if (resultHandler != null) {
                        let dataCount = result.rows.length
                        let list = [];
                        for (let i = 0; i < dataCount; i++) {
                            list.push(result.rows.item(i));
                        }
                        return resultHandler(list);
                    }
                }, (err) => {
                    this.log(err);
                });
        }, (error) => {
            this.log('Transaction Error:', error);
        }, () => {
        });
    }
    GetDataDownloadInfo(resultHandler, errorHandler) {
        return this.GetDataDownloadStartTime((list) => {
            let startTime = JSON.stringify(list);
            return axios.post("/DataDownload/GetDataDownloadInfo", startTime).then(resultHandler).catch(errorHandler);
        });
    }
    // 
    GetProductCommon(startTime, lastSysNo) {
        // axios.get("/DataDownload/GetProductCommon?startTime=" + encodeURIComponent(startTime) + "&lastSysNo=" + lastSysNo).then((res) => {
        //     window.console.log(res)
        // })
        let promise = axios.get("/DataDownload/GetProductCommon?startTime=" + encodeURIComponent(startTime) + "&lastSysNo=" + lastSysNo);
        window.console.log(promise)
        return promise;
        // let formData = new FormData();
        // formData.append('StartTime', startTime);
        //   return  fetch("http://192.168.1.7:9001/home/ProductDetail", {body:formData,method:'post'}).then(response => { 
        //         return response.json();
        //     });
    }

    FlowSaveProductCommonToLocation(entityList, i, saveDataStep, rowSuccessHandler, rowErrorHandler) {
        let self = this;
        if (i >= entityList.length) return;
        let db = self.open();
        let entity = entityList[i];
        let companyID = this.GetCompanyID();
        if (typeof (saveDataStep) == "undefined" || saveDataStep == null || saveDataStep < 1) {
            saveDataStep = 1;
        }
        db.transaction((tx) => {
            let pcSql = "insert or replace  into ProductCommon (CompanyID,SysNo,ProductCommonName,CategorySysNo,CategoryCode,CategoryName,BrandSysNo,SeriesSysNo,StyleSysNo,BrandName"
                + " ,SeriesName,StyleName,PromotionTitle,DefaultImage,MerchantSysNo,GroupProperties,ImageList,LastReplicationDate,IsDownloadImg)"
                + " values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);";

            let isDownloadImg = (entity.IsDownloadImg == true || entity.IsDownloadImg == 1) ? 1 : 0;
            let pcData = [companyID
                , entity.SysNo
                , entity.ProductCommonName
                , entity.CategorySysNo
                , entity.CategoryCode
                , entity.CategoryName
                , entity.BrandSysNo
                , entity.SeriesSysNo
                , entity.StyleSysNo
                , null //entity.BrandName
                , entity.SeriesName
                , entity.StyleName
                , entity.PromotionTitle
                , entity.DefaultImage
                , entity.MerchantSysNo
                , JSON.stringify(entity.GroupProperties)
                , JSON.stringify(entity.ImageList)
                , entity.LastReplicationDate
                , isDownloadImg
            ];
            tx.executeSql(pcSql, pcData, (tx) => {
                lastReplicationDate = entity.LastReplicationDate;
                // 此数据的时间作为最后数据同步的时间
                // let updateDateSql = "insert  or replace  into DataReplicationInfo(CompanyID,MasterName,LastReplicationDate,LastSysNo) values(?,'ProductCommon',?,?); ";
                let updateDateSql = "UPDATE DataReplicationInfo SET LastReplicationDate='" + lastReplicationDate + "',LastSysNo= " + entity.SysNo + " WHERE MasterName = 'Product' "
                updateDateSql += " and CompanyID='" + companyID + "' and ( LastReplicationDate< '" + lastReplicationDate + "' OR LastReplicationDate ISNULL  OR LastSysNo< " + entity.SysNo + ") ;"
                tx.executeSql(updateDateSql, null, (tx) => { }, (error) => { console.log(error) });
            }, (error) => { console.log(error) });
        }, (error) => {
            if (rowErrorHandler) rowErrorHandler(error);
        }, () => {
            (async function () {
                let isContinue = true;
                if (rowSuccessHandler) {
                    isContinue = await rowSuccessHandler(entity, i, entityList);
                }
                if (!isContinue) return;
                let next = i + saveDataStep;
                self.FlowSaveProductCommonToLocation(entityList, next, saveDataStep, rowSuccessHandler, rowErrorHandler);
            })();
        });


    }

    // 保存商品组数据到本地数据库
    SaveProductCommonToLocation(entityList, rowSavedHandler, saveDataStep) {
        if (entityList == null || entityList.length == 0) return;
        let self = this;
        if (typeof (saveDataStep) == "undefined" || saveDataStep == null || saveDataStep < 1) {
            saveDataStep = 2;
        }
        for (let i = 0; i < saveDataStep; i++) {
            self.FlowSaveProductCommonToLocation(entityList, i, saveDataStep, rowSavedHandler);
        }
    }

    GetProduct(startTime, lastSysNo) {
        return axios.get("/DataDownload/GetProduct?startTime=" + encodeURIComponent(startTime) + "&lastSysNo=" + lastSysNo);
    }

    FlowSaveProductToLocation(entityList, i, saveDataStep, rowSuccessHandler, rowErrorHandler) {
        let self = this;
        if (i >= entityList.length) {
            return;
        };

        let db = self.open();
        let entity = entityList[i];
        let companyID = this.GetCompanyID();
        let isSuccess = false;
        db.transaction((tx) => {
            let entity = entityList[i];
            //删除无效的数据
            if (entity.ProductStatus != 10 && entity.ProductStatus != 30) {
                let sql = "delete from product where sysno=" + entity.SysNo;
                tx.executeSql(sql, null, (tx) => {
                    lastReplicationDate = entity.LastReplicationDate;
                    // 此数据的时间作为最后数据同步的时间
                    // let updateDateSql = "insert  or replace  into DataReplicationInfo(CompanyID,MasterName,LastReplicationDate,LastSysNo) values(?,'Product',?,?); ";
                    let updateDateSql = "UPDATE DataReplicationInfo SET LastReplicationDate='" + lastReplicationDate + "',LastSysNo= " + entity.SysNo + " WHERE MasterName = 'Product' "
                    updateDateSql += " and CompanyID='" + companyID + "' and ( LastReplicationDate< '" + lastReplicationDate + "' OR LastReplicationDate ISNULL  OR LastSysNo< " + entity.SysNo + ") ;"
                    tx.executeSql(updateDateSql, null, (tx) => { }, (error) => { console.log(error) });
                }, (error) => { });
                return;
            }
            let pcSql = "insert or replace  into ProductCommon (CompanyID,SysNo,ProductCommonName,CategorySysNo,CategoryCode,CategoryName,BrandSysNo,SeriesSysNo,StyleSysNo,BrandName"
                + " ,SeriesName,StyleName,PromotionTitle,DefaultImage,MerchantSysNo,GroupProperties,ImageList,LastReplicationDate,IsDownloadImg)"
                + " values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);";

            let isDownloadImg = (entity.IsDownloadImg == true || entity.IsDownloadImg == 1) ? 1 : 0;
            let pcData = [companyID
                , entity.ProductCommonSysNo
                , entity.ProductCommonName
                , entity.CategorySysNo
                , entity.CategoryCode
                , entity.CategoryName
                , 0//entity.BrandSysNo
                , entity.SeriesSysNo
                , entity.StyleSysNo
                , null //entity.BrandName
                , entity.SeriesName
                , entity.StyleName
                , entity.PromotionTitle
                , entity.ProductCommonDefaultImage
                , entity.MerchantSysNo
                , JSON.stringify(entity.ProductCommonProperties)
                , JSON.stringify(entity.ProductCommonImageList)
                , entity.LastReplicationDate
                , isDownloadImg
            ];
            tx.executeSql(pcSql, pcData, (tx) => { }, (error) => { });

            let sql = "insert or replace  into Product (CompanyID,SysNo,ProductCommonSysNo,ProductCommonName,ProductID,ProductName,"
                + "SKUModel,SizeLength,SizeWidth,SizeHeight,Weight,ProductNote,DefaultImage,ProductStatus,MerchantSysNo,CostPrice,RetailPrice"
                + ",SalePrice,PromotionPrice,PromotionTitle,Priority,Material,Stock,ProductTag,GroupProperties,ImageList,ProductList,Properties,LastReplicationDate,IsDownloadImg"
                + ",ProductType,DeliveryDate,ProductionCycle)"
                + " values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);";

            let data = [companyID
                , entity.SysNo
                , entity.ProductCommonSysNo
                , entity.ProductCommonName
                , entity.ProductID
                , entity.ProductName
                , entity.SKUModel
                , entity.SizeLength
                , entity.SizeWidth
                , entity.SizeHeight
                , entity.Weight
                , entity.ProductNote
                , entity.DefaultImage
                , entity.ProductStatus
                , entity.MerchantSysNo
                , entity.CostPrice
                , entity.RetailPrice
                , entity.SalePrice
                , entity.PromotionPrice
                , entity.PromotionTitle
                , entity.Priority
                , entity.Material
                , entity.Stock
                , entity.ProductTag
                , JSON.stringify(entity.GroupProperties)
                , JSON.stringify(entity.ImageList)
                , JSON.stringify(entity.ProductList)
                , JSON.stringify(entity.Properties)
                , entity.LastReplicationDate
                , isDownloadImg
                , entity.ProductType
                , entity.DeliveryDate
                , entity.ProductionCycle
            ];
            tx.executeSql(sql, data, (tx) => {
                lastReplicationDate = entity.LastReplicationDate;
                // 此数据的时间作为最后数据同步的时间
                // let updateDateSql = "insert  or replace  into DataReplicationInfo(CompanyID,MasterName,LastReplicationDate,LastSysNo) values(?,'Product',?,?); ";
                let updateDateSql = "UPDATE DataReplicationInfo SET LastReplicationDate='" + lastReplicationDate + "',LastSysNo= " + entity.SysNo + " WHERE MasterName = 'Product' "
                updateDateSql += " and CompanyID='" + companyID + "' and ( LastReplicationDate< '" + lastReplicationDate + "' OR LastReplicationDate ISNULL  OR LastSysNo< " + entity.SysNo + ") ;"
                tx.executeSql(updateDateSql, null, (tx) => { }, (error) => { });
            }, (error) => { });
        }, (error) => {
            if (rowErrorHandler) rowErrorHandler(error);
        }, () => {
            (async function () {
                let isContinue = true;
                if (rowSuccessHandler) {
                    isContinue = await rowSuccessHandler(entity, i, entityList);
                }
                if (!isContinue) return;
                let next = i + saveDataStep;
                self.FlowSaveProductToLocation(entityList, next, saveDataStep, rowSuccessHandler, rowErrorHandler);
            })();
        });
    }

    // 保存商品数据到本地数据库
    SaveProductToLocation(entityList, rowSavedHandler, saveDataStep) {
        if (entityList == null || entityList.length == 0) return;
        let self = this;
        if (typeof (saveDataStep) == "undefined" || saveDataStep == null || saveDataStep < 1) {
            saveDataStep = 2;
        }
        for (let i = 0; i < saveDataStep; i++) {
            self.FlowSaveProductToLocation(entityList, i, saveDataStep, rowSavedHandler);
        }
    }

    GetProductSolution(startTime, lastSysNo) {
        return axios.get("/DataDownload/GetProductSolution?startTime=" + encodeURIComponent(startTime) + "&lastSysNo=" + lastSysNo);
    }

    FlowSaveProductSolutionToLocation(entityList, i, saveDataStep, rowSuccessHandler, rowErrorHandler) {
        let self = this;
        if (i >= entityList.length) return;
        let db = self.open();
        let entity = entityList[i];
        let companyID = this.GetCompanyID();
        db.transaction((tx) => {
            let entity = entityList[i];

            //删除无效的数据
            if (entity.ProductSolutionStatus != 1) {
                let sql = "delete from productSolution where sysno=" + entity.SysNo;
                tx.executeSql(sql, null, (tx) => {
                    lastReplicationDate = entity.LastReplicationDate;
                    // 此数据的时间作为最后数据同步的时间
                    // let updateDateSql = "insert  or replace  into DataReplicationInfo(CompanyID,MasterName,LastReplicationDate,LastSysNo) values(?,'ProductSolution',?,?); ";
                    let updateDateSql = "UPDATE DataReplicationInfo SET LastReplicationDate='" + lastReplicationDate + "',LastSysNo= " + entity.SysNo + " WHERE MasterName = 'ProductSolution' "
                    updateDateSql += " and CompanyID='" + companyID + "' and ( LastReplicationDate< '" + lastReplicationDate + "' OR LastReplicationDate ISNULL  OR LastSysNo< " + entity.SysNo + ") ;"
                    tx.executeSql(updateDateSql, null, (tx) => { }, (error) => { });
                }, (error) => { });

                return;
            }

            let sql = "insert or replace  into ProductSolution (CompanyID,SysNo,Name,DefaultImage,ProductList,SalePrice,SeriesSysNo,SeriesName"
                + ",StyleSysNo,StyleName,ImageList,Priority,Description,LastReplicationDate,IsDownloadImg)"
                + " values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);";

            let isDownloadImg = (entity.IsDownloadImg == true || entity.IsDownloadImg == 1) ? 1 : 0;
            let data = [companyID
                , entity.SysNo
                , entity.Name
                , entity.DefaultImage
                , JSON.stringify(entity.ProductList)
                , entity.SalePrice
                , entity.SeriesSysNo
                , entity.SeriesName
                , entity.StyleSysNo
                , entity.StyleName
                , JSON.stringify(entity.ImageList)
                , entity.Priority
                , entity.Description
                , entity.LastReplicationDate
                , isDownloadImg
            ];
            tx.executeSql(sql, data, (tx) => {
                lastReplicationDate = entity.LastReplicationDate;
                // 此数据的时间作为最后数据同步的时间
                // let updateDateSql = "insert  or replace  into DataReplicationInfo(CompanyID,MasterName,LastReplicationDate,LastSysNo) values(?,'ProductSolution',?,?); ";

                let updateDateSql = "UPDATE DataReplicationInfo SET LastReplicationDate='" + lastReplicationDate + "',LastSysNo= " + entity.SysNo + " WHERE MasterName = 'ProductSolution' "
                updateDateSql += " and CompanyID='" + companyID + "' and ( LastReplicationDate< '" + lastReplicationDate + "' OR LastReplicationDate ISNULL  OR LastSysNo< " + entity.SysNo + ") ;"
                tx.executeSql(updateDateSql, null, (tx) => { }, (error) => { });
            }, (error) => { });
        }, (error) => {
            if (rowErrorHandler) rowErrorHandler(error);
        }, () => {
            (async function () {

                let isContinue = true;
                if (rowSuccessHandler) {
                    isContinue = await rowSuccessHandler(entity, i, entityList);
                }
                if (!isContinue) return;

                let next = i + saveDataStep;
                self.FlowSaveProductSolutionToLocation(entityList, next, saveDataStep, rowSuccessHandler, rowErrorHandler);
            })();
        });
    }


    // 保存商品数据到本地数据库
    SaveProductSolutionToLocation(entityList, rowSavedHandler, saveDataStep) {
        if (entityList == null || entityList.length == 0) return;
        let self = this;

        if (typeof (saveDataStep) == "undefined" || saveDataStep == null || saveDataStep < 1) {
            saveDataStep = 2;
        }
        for (let i = 0; i < saveDataStep; i++) {
            self.FlowSaveProductSolutionToLocation(entityList, i, saveDataStep, rowSavedHandler);
        }
    }

    GetContent(startTime, lastSysNo) {
        return axios.get("/DataDownload/GetContent?startTime=" + encodeURIComponent(startTime) + "&lastSysNo=" + lastSysNo);
    }

    FlowSaveContentToLocation(entityList, i, saveDataStep, rowSuccessHandler, rowErrorHandler) {

        let self = this;
        if (i >= entityList.length) return;
        let db = self.open();
        let entity = entityList[i];
        let companyID = this.GetCompanyID();
        db.transaction((tx) => {
            let entity = entityList[i];
            //删除无效的数据
            if (entity.TopicStatus != 1) {
                let sql = "delete from AppContent where sysno=" + entity.SysNo;
                tx.executeSql(sql, null, (tx) => {
                    lastReplicationDate = entity.LastReplicationDate;
                    // 此数据的时间作为最后数据同步的时间
                    // let updateDateSql = "insert  or replace  into DataReplicationInfo(CompanyID,MasterName,LastReplicationDate,LastSysNo) values(?,'Content',?,?); ";

                    let updateDateSql = "UPDATE DataReplicationInfo SET LastReplicationDate='" + lastReplicationDate + "',LastSysNo= " + entity.SysNo + " WHERE MasterName = 'Content' "
                    updateDateSql += " and CompanyID='" + companyID + "' and ( LastReplicationDate< '" + lastReplicationDate + "' OR LastReplicationDate ISNULL  OR LastSysNo< " + entity.SysNo + ") ;"
                    tx.executeSql(updateDateSql, null, (tx) => { }, (error) => { });
                }, (error) => { });
                return;
            }

            let sql = "insert or replace  into AppContent (CompanyID,SysNo,TopicCategorySysNo,TopicCategoryName,Title,SubTitle,DefaultImage,"
                + "Summary,Content,TopicContentType,Keywords,Tag,IsRed,IsTop,PageViews,StartTime,EndTime,FileList,LastReplicationDate,PublishDate,IsDownloadImg,Priority)"
                + " values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);";
            let isDownloadImg = (entity.IsDownloadImg == true || entity.IsDownloadImg == 1) ? 1 : 0;
            let data = [companyID
                , entity.SysNo
                , entity.TopicCategorySysNo
                , entity.TopicCategoryName
                , entity.Title
                , entity.SubTitle
                , entity.DefaultImage
                , entity.Summary
                , entity.Content
                , entity.TopicContentType
                , entity.Keywords
                , entity.Tag
                , entity.IsRed
                , entity.IsTop
                , entity.PageViews
                , entity.StartTime
                , entity.EndTime
                , JSON.stringify(entity.FileList)
                , entity.LastReplicationDate
                , entity.PublishDate
                , isDownloadImg
                ,entity.Priority
            ];
            tx.executeSql(sql, data, (tx) => {
                lastReplicationDate = entity.LastReplicationDate;
                // 此数据的时间作为最后数据同步的时间
                // let updateDateSql = "insert  or replace  into DataReplicationInfo(CompanyID,MasterName,LastReplicationDate,LastSysNo) values(?,'Content',?,?); ";
                let updateDateSql = "UPDATE DataReplicationInfo SET LastReplicationDate='" + lastReplicationDate + "',LastSysNo= " + entity.SysNo + " WHERE MasterName = 'Content' "
                updateDateSql += " and CompanyID='" + companyID + "' and ( LastReplicationDate< '" + lastReplicationDate + "'OR LastReplicationDate ISNULL ) ;"
                tx.executeSql(updateDateSql, null, (tx) => { }, (error) => { });
            }, (error) => { });
        }, (error) => {
            if (rowErrorHandler) rowErrorHandler(error);
        }, () => {
            (async function () {

                let isContinue = true;
                if (rowSuccessHandler) {
                    isContinue = await rowSuccessHandler(entity, i, entityList);
                }
                if (!isContinue) return;

                let next = i + saveDataStep;
                self.FlowSaveContentToLocation(entityList, next, saveDataStep, rowSuccessHandler, rowErrorHandler);
            })();
        });
    }

    // 保存商品数据到本地数据库
    SaveContentToLocation(entityList, rowSavedHandler, saveDataStep) {
        if (entityList == null || entityList.length == 0) return;
        let self = this;
        if (typeof (saveDataStep) == "undefined" || saveDataStep == null || saveDataStep < 1) {
            saveDataStep = 2;
        }
        for (let i = 0; i < saveDataStep; i++) {
            self.FlowSaveContentToLocation(entityList, i, saveDataStep, rowSavedHandler);
        }
    }

    GetDictionaryData() {
        this.initDataReplicationInfo()
        return axios.get("/DataDownload/GetDictionaryData");
    }
    // 保存Dictionary数据到本地数据库
    SaveDictionaryDataToLocation(entityList, successHandler) {
        if (entityList == null || entityList.length == 0) return;
        let self = this;
        let db = this.open();
        let dataCount = entityList.length;
        let lastReplicationDate = null;
        let companyID = this.GetCompanyID();
        db.transaction((tx) => {
            let sql = "insert or replace into DictionaryData (companyID,Key,Value,LastReplicationDate) values (?,?,?,?);";
            // 此数据的时间作为最后数据同步的时间
            for (let i = 0; i < entityList.length; i++) {
                let entity = entityList[i];
                let data = [companyID, entity.Key
                    , entity.Value
                    , entity.LastReplicationDate
                ];
                tx.executeSql(sql, data, () => { }, (err) => { this.log(err); });
                lastReplicationDate = entity.LastReplicationDate;
            }
        }, (error) => {
            this.log('Save DictionaryData error:' + error);
        }, () => {
            if (successHandler != null) {
                let arg = {
                    LastReplicationDate: lastReplicationDate,
                    SaveCount: dataCount
                };
                successHandler(arg, lastReplicationDate);
            }
        });
    }


    // //获取经销商可查看的系列
    GetAuthSeriesSysNos() {
        return axios.get("/DataDownload/GetAuthSeriesSysNos", null);
    }

    //及时查询并删除经销商没有权限的商品
    ClearData(successHandler, errorHandler) {
        let companyID = this.GetCompanyID();
        let db = this.open();
        db.transaction((tx) => {
            let sql = "delete from product where companyID='" + companyID + "'";
            let sql1 = "delete from productcommon where companyID='" + companyID + "'";
            let sql2 = "delete from productsolution where companyID='" + companyID + "'";
            let sql3 = "delete from AppContent where CompanyID='" + companyID + "'";
            let sql4 = "delete from DataReplicationInfo where CompanyID='" + companyID + "'";
            tx.executeSql(sql, null, (tx, result) => { }, (err) => { console.log(err); });
            tx.executeSql(sql1, null, (tx, result) => { }, (err) => { console.log(err); });
            tx.executeSql(sql2, null, (tx, result) => { }, (err) => { console.log(err); });
            tx.executeSql(sql3, null, (tx, result) => { }, (err) => { console.log(err); });
            tx.executeSql(sql4, null, (tx, result) => { }, (err) => { console.log(err); });

        }, (error) => {
            if (errorHandler) errorHandler();
        }, () => {
            if (successHandler) successHandler();
        });
    }

    //及时查询并删除经销商没有权限的商品
    DeleteNoPermissionProductData() {
        let companyID = this.GetCompanyID();
        this.GetAuthSeriesSysNos().then((result) => {
            if (typeof (result.data.success) != 'undefined' && result.data.success == false) {
                return;
            }

            if (result != null && result.data != null) {
                if (result.data.length == 0) {
                    return null;
                }
                let db = this.open();
                db.transaction((tx) => {
                    let sysno_str = result.data.join(',');
                    let sql = "delete from product where companyID='" + companyID + "' and productcommonSysNo in(select sysno from productcommon where seriessysno not in(" + sysno_str + "))";
                    let sql2 = "delete from productcommon where companyID='" + companyID + "' and seriessysno not in(" + sysno_str + ")";
                    let sql3 = "delete from productsolution where companyID='" + companyID + "' and seriessysno not in(" + sysno_str + ")";
                    tx.executeSql(sql, null, (tx, result) => {
                        tx.executeSql(sql2, null, (tx, result) => { }, (err) => { });
                    }, (err) => { });

                    tx.executeSql(sql3, null, (tx, result) => { }, (err) => { });
                }, (error) => {
                    this.log('Save DictionaryData error:' + error);
                }, () => { });
            }
        });
    }
    async __downloadDataRowSaved(dataType, entity) {
        let isContinue = true;
        if (this.downStatus.rowSavedHandler) {
            isContinue = await this.downStatus.rowSavedHandler(dataType, entity, this.downStatus);
            if (!isContinue) {
                return isContinue;
            }
        }
        let isCompleted = this.downStatus.completionContent
            && this.downStatus.completionProduct
            && this.downStatus.completionSolution;
        if (isCompleted) {
            isContinue = false;
        }
        return isContinue;
    }
    async saveProductCallback(entity, index, entityList) {
        let item = entity;
        let maxIndex = entityList.length - 1;
        let lastReplicationDate = entity.LastReplicationDate;
        let self = this;
        this.downStatus.saveCount += 1;
        self.downStatus.saveProductCount += 1;
        if (index == maxIndex) {
            if (maxIndex >= 99) {
                self.dlProduct(lastReplicationDate, item.SysNo);
            }
            else {
                self.downStatus.completionProduct = true;
            }
        }
        let isContinue = await self.__downloadDataRowSaved("product", entity);
        return index != maxIndex && isContinue;
    }
    dlProduct(startTime, lastSysNo) {
        let self = this;
        self.GetProduct(startTime, lastSysNo).then(function (result) {
            if (typeof (result.data.success) != 'undefined' && result.data.success == false) {
                if (self.downStatus.downloadErrorHandler) {
                    self.downStatus.downloadErrorHandler(result.data.message);
                }
                return;
            }
            let saveCount = 0;
            if (result != null && result.data != null) {
                saveCount = result.data.length;
            }

            // console.log("🔴 ", result.data);

            if (saveCount == 0) {
                self.downStatus.completionProduct = true;
                self.__downloadDataRowSaved("product", null);
                return;
            }
            for (let i = 0; i < result.data.length; i++) {
                result.data[i].IsDownloadImg = self.downStatus.isDownloadImg;
            }
            let currList = result.data.filter(a => a.ProductStatus == 10);
            self.downStatus.productList = self.downStatus.productList.concat(currList);
            self.SaveProductToLocation(result.data, self.saveProductCallback, 5);
        }).catch(error => {

        });
    }

    async saveProductSolutionCallback(entity, index, entityList) {
        let item = entity;
        let maxIndex = entityList.length - 1;
        let lastReplicationDate = entity.LastReplicationDate;
        let self = this;
        this.downStatus.saveCount += 1;
        self.downStatus.saveProductSolutionCount += 1;
        if (index == maxIndex) {
            if (maxIndex >= 99) {
                self.dlProductSolution(lastReplicationDate, item.SysNo);
            }
            else {
                self.downStatus.completionSolution = true;
            }
        }
        let isContinue = await self.__downloadDataRowSaved("productsolution", entity);
        return index != maxIndex && isContinue;
    }
    dlProductSolution(startTime, lastSysNo) {
        let self = this;
        self.GetProductSolution(startTime, lastSysNo).then(function (result) {
            if (typeof (result.data.success) != 'undefined' && result.data.success == false) {
                if (self.downStatus.downloadErrorHandler) {
                    self.downStatus.downloadErrorHandler(result.data.message);
                }
                return;
            }
            let saveCount = 0;
            if (result != null && result.data != null) {
                saveCount = result.data.length;
            }

            if (saveCount == 0) {
                self.downStatus.completionSolution = true;
                self.__downloadDataRowSaved("productsolution", null);
                return;
            }
            for (let i = 0; i < result.data.length; i++) {
                result.data[i].IsDownloadImg = self.downStatus.isDownloadImg;
            }
            self.downStatus.productSlutionList = result.data.filter(a => a.ProductSolutionStatus == 1);
            self.SaveProductSolutionToLocation(result.data, self.saveProductSolutionCallback, 5);
        }).catch(error => {

        });
    }
    async saveContentCallback(entity, index, entityList) {
        let item = entity;
        let maxIndex = entityList.length - 1;
        let lastReplicationDate = entity.LastReplicationDate;
        let self = this;
        this.downStatus.saveCount += 1;
        self.downStatus.saveContentCount += 1;
        if (index == maxIndex) {
            if (maxIndex >= 99) {
                self.dlContent(lastReplicationDate, item.SysNo);
            }
            else {
                self.downStatus.completionContent = true;
            }
        }
        let isContinue = await self.__downloadDataRowSaved("content", entity);
        return index != maxIndex && isContinue;
    }
    dlContent(startTime, lastSysNo) {
        let self = this;
        self.GetContent(startTime, lastSysNo).then(function (result) {
            if (typeof (result.data.success) != 'undefined' && result.data.success == false) {
                if (self.downStatus.downloadErrorHandler) {
                    self.downStatus.downloadErrorHandler(result.data.message);
                }
                return;
            }
            let saveCount = 0;
            if (result != null && result.data != null) {
                saveCount = result.data.length;
            }

            if (saveCount == 0) {
                self.downStatus.completionContent = true;
                self.__downloadDataRowSaved("content", null);
                return;
            }
            for (let i = 0; i < result.data.length; i++) {
                result.data[i].IsDownloadImg = self.downStatus.isDownloadImg;
            }
            let currList = result.data.filter(a => a.TopicStatus == 1);
            self.downStatus.ContentList = self.downStatus.ContentList.concat(currList);
            self.SaveContentToLocation(result.data, self.saveContentCallback, 5);
        }).catch(error => {

        });
    }

    onlyDownloadData(isDownloadImg, startDownloadHandler, rowSavedHandler, errorHandler) {
        this.downStatus.startDownloadHandler = startDownloadHandler;
        this.downStatus.isDownloadImg = isDownloadImg;
        this.downStatus.downloadErrorHandler = errorHandler;
        this.downStatus.rowSavedHandler = rowSavedHandler;
        this.downStatus.completionProduct = false;
        this.downStatus.completionSolution = false;
        this.downStatus.completionContent = false;
        this.downStatus.total = 0;
        this.downStatus.saveCount = 0;
        this.downStatus.productCount = 0;
        this.downStatus.productSolutionCount = 0;
        this.downStatus.contentCount = 0;
        this.downStatus.saveProductCount = 0;
        this.downStatus.saveProductSolutionCount = 0;
        this.downStatus.saveContentCount = 0;
        if (startDownloadHandler) {
            startDownloadHandler();
        }
        let self = this;
        self.GetDataDownloadInfo(result => {
            if (result.data.success == false) {
                if (errorHandler) {
                    errorHandler(result.data.message);
                }
                return;
            }
            let dataCount = 0;
            let dlInfo = result.data;
            let productStartTime = null;
            let contentStartTime = null;
            let productSolutionStartTime = null;

            let productLastSysNo = null;
            let contentLastSysNo = null;
            let productSolutionLastSysNo = null;

            let productCount = null;
            let contentCount = null;
            let productSolutionCount = null;
            for (let i = 0; i < dlInfo.length; i++) {
                let tdl = dlInfo[i];
                dataCount += tdl.DataCount;
                let mn = new String(tdl.MasterName).toLocaleLowerCase();
                if (mn == "product") {
                    productStartTime = tdl.StartTime;
                    productLastSysNo = tdl.LastSysNo;
                    productCount = tdl.DataCount;
                }
                else if (mn == "content") {
                    contentStartTime = tdl.StartTime;
                    contentLastSysNo = tdl.LastSysNo;
                    contentCount = tdl.DataCount;
                }
                else if (mn == "productsolution") {
                    productSolutionStartTime = tdl.StartTime;
                    productSolutionLastSysNo = tdl.LastSysNo;
                    productSolutionCount = tdl.DataCount;
                }
            }
            this.downStatus.productCount = productCount;
            this.downStatus.productSolutionCount = productSolutionCount;
            this.downStatus.contentCount = contentCount;

            this.downStatus.completionContent = contentCount == 0;
            this.downStatus.completionProduct = productCount == 0;
            this.downStatus.completionSolution = productSolutionCount == 0;

            this.downStatus.total = dataCount;
            this.__downloadDataRowSaved(null, null);

            if (productCount > 0) {
                self.dlProduct(productStartTime, productLastSysNo);
            }

            if (contentCount > 0) {
                self.dlContent(contentStartTime, contentLastSysNo);
            }

            if (productSolutionCount > 0) {
                self.dlProductSolution(productSolutionStartTime, productSolutionLastSysNo);
            }

        }, () => {
            if (errorHandler) {
                errorHandler();
            }
        });

    }

    // 取得缓存到本地的数据相关的文件（图片）列表
    getAllFile(resultHandler, errorHandler) {
        let self = this;
        let db = self.open();
        let companyID = this.GetCompanyID();
        let isSuccess = false;
        db.transaction((tx) => {
            let cSql = "select CompanyID,SysNo,Title,DefaultImage,FileList  from AppContent where CompanyID=?;";
            let cData = [companyID];
            tx.executeSql(cSql, cData, (tx, result) => {
                if (resultHandler != null) {
                    let dataCount = result.rows.length
                    let list = [];
                    for (let i = 0; i < dataCount; i++) {
                        let info = result.rows.item(i);
                        info.FileList = JSON.parse(info.FileList);
                        info.TopicStatus = 1;
                        list.push(info);
                    }
                    return resultHandler("content", list, false);
                }
            }, (error) => {
                return resultHandler("content", [], false);
            });

            let pcSql = "select CompanyID,SysNo,MerchantSysNo,ProductCommonName,DefaultImage as ProductCommonDefaultImage,ImageList as ProductCommonImageList  from ProductCommon  where CompanyID=?;";
            let pcData = [companyID];
            tx.executeSql(pcSql, pcData, (tx, result) => {
                if (resultHandler != null) {
                    let dataCount = result.rows.length
                    let list = [];
                    for (let i = 0; i < dataCount; i++) {
                        let info = result.rows.item(i);
                        info.ProductCommonImageList = JSON.parse(info.ProductCommonImageList);
                        list.push(info);
                    }
                    return resultHandler("product", list, false);
                }
            }, (error) => {
                return resultHandler("product", [], false);
            });

            let pSql = "select CompanyID,SysNo,MerchantSysNo,ProductCommonSysNo,DefaultImage,ImageList from  Product where CompanyID=?;";
            let pData = [companyID];
            tx.executeSql(pSql, pData, (tx, result) => {
                if (resultHandler != null) {
                    let dataCount = result.rows.length
                    let list = [];
                    for (let i = 0; i < dataCount; i++) {
                        let info = result.rows.item(i);
                        info.ImageList = JSON.parse(info.ImageList);
                        info.ProductStatus = 10;
                        list.push(info);
                    }
                    return resultHandler("product", list, false);
                }
            }, (error) => {
                return resultHandler("product", [], false);
            });

            let psSql = "select CompanyID,SysNo,Name,DefaultImage,ImageList  from  ProductSolution where CompanyID=?;";
            let psData = [companyID];
            tx.executeSql(psSql, psData, (tx, result) => {
                if (resultHandler != null) {
                    let dataCount = result.rows.length
                    let list = [];
                    for (let i = 0; i < dataCount; i++) {
                        let info = result.rows.item(i);
                        info.ImageList = JSON.parse(info.ImageList);
                        info.ProductSolutionStatus = 1;
                        list.push(info);
                    }
                    return resultHandler("productsolution", list, false);
                }
            }, (error) => {
                return resultHandler("productsolution", [], false);
            });
        }, (error) => {
            if (errorHandler) errorHandler(error);
        }, () => {
            return resultHandler(null, null, true);
        });
    }
    ClearProductData(successHandler, errorHandler) {
        let companyID = this.GetCompanyID();
        let db = this.open();
        db.transaction((tx) => {
            let sql = "delete from product where companyID='" + companyID + "'";
            let sql1 = "delete from productcommon where companyID='" + companyID + "'";
            let sql2 = "delete from productsolution where companyID='" + companyID + "'";
            let sql3 = "update DataReplicationInfo set LastReplicationDate=null ,LastSysNo = 0  where  CompanyID='" + companyID + "';";
            tx.executeSql(sql, null, (tx, result) => { }, (err) => { console.log(err); });
            tx.executeSql(sql1, null, (tx, result) => { }, (err) => { console.log(err); });
            tx.executeSql(sql2, null, (tx, result) => { }, (err) => { console.log(err); });
            tx.executeSql(sql3, null, (tx, result) => { }, (err) => { console.log(err); });
            // tx.executeSql(sql3, null, (tx, result) => { }, (err) => { console.log(err); });
        }, (error) => {
            if (errorHandler) errorHandler();
        }, () => {
            if (successHandler) successHandler();
        });
    }
    //游客数据处理
    GustDateOpion(){
        let self = this;
        let db = self.open();
        let companyID = this.GetCompanyID();
        db.transaction((tx) => {
            let pcSql = "select DefaultImage ,ImageList from ProductCommon  where CompanyID='"+companyID;
            pcSql+="' union select DefaultImage,ImageList from  Product where CompanyID='"+companyID;
            pcSql+="' union select DefaultImage,ImageList from  ProductSolution where CompanyID='"+companyID+"';";
            tx.executeSql(pcSql, null, (tx, result) => {
                    let list = [];
                    let dataCount = result.rows.length
                    for (let i = 0; i < dataCount; i++) {
                        let info = result.rows.item(i);
                        if(typeof(info.ImageList)=='string'){
                            info.ImageList = JSON.parse(info.ImageList);
                            // info.ImageList = JSON.parse(ImageList);
                        }
                        if(info.ImageList&&info.ImageList.lenth>0){
                            info.ImageList.forEach((item)=>{
                                
                                list = list.concat(item.Path)
                            })
                        }
                        if(info.DefaultImage){
                            list.push(info.DefaultImage)
                        }
                    }
                    // FileHelper.deleteFileList(list,self.ClearProductData(null,null));
            }, (error) => {

            });
            // let pSql = "select DefaultImage,ImageList from  Product where CompanyID=?;";
            // let pData = [companyID];
            // tx.executeSql(pSql, pData, (tx, result) => {
            //     if (resultHandler != null) {
            //         let dataCount = result.rows.length
            //         let list = [];
            //         for (let i = 0; i < dataCount; i++) {
            //             let info = result.rows.item(i);
            //             info.ImageList = JSON.parse(info.ImageList);
            //             info.ImageList.push(info.DefaultImage);
            //             FileHelper.deleteFileList(info.ImageList);
            //         }
            //     }
            // }, (error) => {
            // });
            // let psSql = "select DefaultImage,ImageList  from  ProductSolution where CompanyID=?;";
            // let psData = [companyID];
            // tx.executeSql(psSql, psData, (tx, result) => {
            //     if (resultHandler != null) {
            //         let dataCount = result.rows.length
            //         for (let i = 0; i < dataCount; i++) {
            //             let info = result.rows.item(i);
            //             info.ImageList = JSON.parse(info.ImageList);
            //             info.ImageList.push(info.DefaultImage);
            //             FileHelper.deleteFileList(info.ImageList);
            //         }
            //     }
            // }, (error) => {
            // });
        }, (error) => {
            if (errorHandler) errorHandler(error);
        }, () => {
            // return resultHandler(null, null, true);
        });
    }
    // 菜单同步的缓存Key
    getMenuReplicationDateKey() {
        let menuUpdateKey = "MenuReplicationDate" + this.GetCompanyID();
        return menuUpdateKey;
    }
    //校验数据
    checkData() {
        let companyID = this.GetCompanyID();
        let DataReplicationInfoList = [];
        //校验商品
        let needSaveProduct = [];
        if (this.downStatus.productList && this.downStatus.productList.length > 0) {
            let productSysNo = [];
            this.downStatus.productList.forEach(item => {
                productSysNo.push(item.SysNo);
            });
            if (productSysNo && productSysNo.length > 0) {
                let sql = "SELECT p.SysNo FROM Product p INNER JOIN ProductCommon pc on p.CompanyID='" + companyID + "' and pc.SysNo=p.ProductCommonSysNo AND p.SysNo in(" + productSysNo.join(',') + ");"
                let db = this.open();
                db.transaction((tx) => {
                    tx.executeSql(sql, null, (tx, result) => {
                        if (result && result.rows.length > 0) {
                            if (result.rows.length < productSysNo.length) {
                                let savedProduct = [];
                                for (var i = 0; i < result.rows.length; i++) {
                                    var item = result.rows.item(i);
                                    savedProduct.push(item);
                                }
                                this.downStatus.productList.forEach(a => {
                                    let info = savedProduct.find(p => p.SysNo == a.SysNo);
                                    if (info == null || info == undefined) {
                                        needSaveProduct.push(a);
                                    }
                                });
                                if (needSaveProduct && needSaveProduct.length > 0) {
                                    for (i = 0; i < needSaveProduct.length; i++) {
                                        this.FlowSaveProductToLocation(needSaveProduct, i, 1);
                                    }
                                }
                            }
                        } else {
                            for (i = 0; i < this.downStatus.productList.length; i++) {
                                this.FlowSaveProductToLocation(this.downStatus.productList, i, 1);
                            }
                        }
                    }, (err) => {
                        console.log(err);
                    });
                });
            }
            let entity = this.downStatus.productList[this.downStatus.productList.length - 1];
            DataReplicationInfoList.push(
                { Key: 'Product', LastReplicationDate: entity.LastReplicationDate, LastSysNo: entity.SysNo }
            )
        }
        //一图多品
        if (this.downStatus.productSlutionList && this.downStatus.productSlutionList.length > 0) {
            let productSlutionSysNo = [];
            this.downStatus.productSlutionList.forEach(item => {
                productSlutionSysNo.push(item.SysNo);
            });
            if (productSlutionSysNo && productSlutionSysNo.length > 0) {
                let sql = "SELECT SysNo FROM ProductSolution WHERE CompanyID='" + companyID + "' and SysNo in(" + productSlutionSysNo.join(',') + ");"
                let db = this.open();
                db.transaction((tx) => {
                    tx.executeSql(sql, null, (tx, result) => {
                        if (result && result.rows.length > 0) {
                            let needSaveProductSlution = [];
                            if (result.rows.length < productSlutionSysNo.length) {
                                let savedProductSlution = [];
                                for (var i = 0; i < result.rows.length; i++) {
                                    var item = result.rows.item(i);
                                    savedProductSlution.push(item);
                                }
                                this.downStatus.productSlutionList.forEach(a => {
                                    let info = savedProductSlution.find(p => p.SysNo == a.SysNo);
                                    if (info == null || info == undefined) {
                                        needSaveProductSlution.push(a);
                                    }
                                });
                                if (needSaveProductSlution && needSaveProductSlution.length > 0) {
                                    for (i = 0; i < needSaveProductSlution.length; i++) {
                                        this.FlowSaveProductSolutionToLocation(needSaveProductSlution, i, 1);
                                    }
                                }
                            }
                        } else {
                            for (i = 0; i < this.downStatus.productSlutionList.length; i++) {
                                this.FlowSaveProductSolutionToLocation(this.downStatus.productSlutionList, i, 5);
                            }
                        }
                        let entity = this.downStatus.productSlutionList[this.downStatus.productSlutionList.length - 1];
                        DataReplicationInfoList.push(
                            { Key: 'ProductSolution', LastReplicationDate: entity.LastReplicationDate, LastSysNo: entity.SysNo }
                        )
                    }, (err) => {
                        console.log(err);
                    });
                });
            }
        }
        //校验内容
        if (this.downStatus.ContentList && this.downStatus.ContentList.length > 0) {
            let ContentListSysNo = [];
            this.downStatus.ContentList.forEach(item => {
                ContentListSysNo.push(item.SysNo);
            });
            if (ContentListSysNo && ContentListSysNo.length > 0) {
                let sql = "SELECT SysNo FROM AppContent WHERE CompanyID='" + companyID + "' and SysNo in(" + ContentListSysNo.join(',') + ");"
                let db = this.open();
                db.transaction((tx) => {
                    tx.executeSql(sql, null, (tx, result) => {
                        if (result && result.rows.length > 0) {
                            let needContentList = [];
                            if (result.rows.length < ContentListSysNo.length) {
                                let savedContent = [];
                                for (var i = 0; i < result.rows.length; i++) {
                                    var item = result.rows.item(i);
                                    savedContent.push(item);
                                }
                                this.downStatus.ContentList.forEach(a => {
                                    let info = savedContent.find(p => p.SysNo == a.SysNo);
                                    if (info == null || info == undefined) {
                                        needContentList.push(a);
                                    }
                                });
                                if (needContentList && needContentList.length > 0) {
                                    for (i = 0; i < needContentList.length; i++) {
                                        this.FlowSaveContentToLocation(needContentList, i, 1);
                                    }
                                }
                            }
                        } else {
                            for (i = 0; i < this.downStatus.ContentList.length; i++) {
                                this.FlowSaveContentToLocation(this.downStatus.ContentList, i, 5);
                            }
                        }
                        let entity = this.downStatus.ContentList[this.downStatus.ContentList.length - 1];
                        DataReplicationInfoList.push(
                            { Key: 'Content', LastReplicationDate: entity.LastReplicationDate, LastSysNo: entity.SysNo }
                        )
                    }, (err) => {
                        console.log(err);
                    });
                });
            }
        }
        //修改最后一次插入数据的时间和 sysno
        // if (DataReplicationInfoList == null || DataReplicationInfoList.length == 0) return;
        // let db = this.open();
        // db.transaction((tx) => {
        //     let sql = "insert or replace into DataReplicationInfo (companyID,MasterName,LastReplicationDate,LastSysNo) values (?,?,?,?);";
        //     // 此数据的时间作为最后数据同步的时间
        //     for (let i = 0; i < DataReplicationInfoList.length; i++) {
        //         let entity = DataReplicationInfoList[i];
        //         let data = [companyID, entity.Key
        //             , entity.LastReplicationDate
        //             , entity.LastSysNo
        //         ];
        //         tx.executeSql(sql, data, () => { }, (err) => { this.log(err); });
        //     }
        // }, (error) => {
        //     this.log('Save DataReplicationInfo error:' + error);
        // }, () => {

        // });
    }
    //初始化数据更新记录表
    initDataReplicationInfo() {
        let companyID = this.GetCompanyID();
        let db = this.open();
        db.transaction((tx) => {
            let sqlStr = "select * from DataReplicationInfo where companyID ='" + companyID + "'";
            tx.executeSql(sqlStr, null, (tx, result) => {
                if (result.rows.length < 3) {
                    let isNeedProduct = true;
                    let isNeedProductSlution = true;
                    let isNeedContent = true;
                    for (let index = 0; index < result.rows.length; index++) {
                        let item = result.rows.item(index);
                        if (item.MasterName == 'Product') {
                            isNeedProduct = false;
                        }
                        else if (item.MasterName == 'Content') {
                            isNeedContent = false;
                        }
                        else if (item.MasterName == 'ProductSolution') {
                            isNeedProductSlution = false;
                        }
                    }
                    let DataReplicationInfoList = [];
                    if (isNeedProduct) DataReplicationInfoList.push({ Key: 'Product', LastReplicationDate: null, LastSysNo: 0 });
                    if (isNeedProductSlution) DataReplicationInfoList.push({ Key: 'ProductSolution', LastReplicationDate: null, LastSysNo: 0 });
                    if (isNeedContent) DataReplicationInfoList.push({ Key: 'Content', LastReplicationDate: null, LastSysNo: 0 });
                    if (DataReplicationInfoList.length > 0) {
                        let sql = "insert or replace into DataReplicationInfo (companyID,MasterName,LastReplicationDate,LastSysNo) values (?,?,?,?);";
                        for (let i = 0; i < DataReplicationInfoList.length; i++) {
                            let entity = DataReplicationInfoList[i];
                            let data = [companyID, entity.Key
                                , entity.LastReplicationDate
                                , entity.LastSysNo
                            ];
                            tx.executeSql(sql, data, () => { }, (err) => { this.log(err); });
                        }
                    }
                }
            });
        }, (error) => {
            this.log('Save initDataReplicationInfo error:' + error);
        }, () => {

        })
    }

}



