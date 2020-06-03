import SQLiteBase from './sqlite.js';
import axios from "axios";
import { Netaxios } from './common';

export default class SalesService extends SQLiteBase {
    constructor(cancel) {
        super();
        this.cancelToken = (typeof cancel !== 'undefined' ? cancel.token : null);
    };
    FetchSalesOrderList(SOStatus, index, size, condition, succeed, failure) {
        axios.get('SalesOrders/QuerySoList?FilterInfo=' + encodeURIComponent(condition) + '&SOStatus=' + encodeURIComponent(SOStatus) + '&PageIndex=' + encodeURIComponent(index) + '&PageSize=' + encodeURIComponent(size))
            .then(succeed)
            .catch(failure);
    }
    LoadInstallationInfo(SOSysNo) {
        return axios.get("/SalesOrders/LoadInstallationInfo?soSysNo=" + encodeURIComponent(SOSysNo));
    }
    Install(productList, user, time, soSysNo) {
        return axios.post("/SalesOrders/Install", { ProductList: productList, User: user, EstimatedInstallDate: time, SOSysNo: soSysNo });
    }
    SetOrderOutStock(SOSysNo, succeed, failure) {
        return axios.get("/SalesOrders/SetOrderOutStock?soSysNo=" + encodeURIComponent(SOSysNo))
            .then(succeed)
            .catch(failure);
    }
    ///待安装：status=1,安装完成：status=2
    FetchInstallationList(status, index, size, succeed, failure) {
        axios.get('SalesOrders/LoadInstallationList?status=' + encodeURIComponent(status) + '&PageIndex=' + encodeURIComponent(index) + '&PageSize=' + encodeURIComponent(size))
            .then(succeed)
            .catch(failure);
    }

    //上传安装图片
    UploadInstallationImage(SOInstallationItemSysNo, ImagePath) {
        return axios.get('SalesOrders/UploadInstallationImage?SOInstallationItemSysNo=' + encodeURIComponent(SOInstallationItemSysNo) + '&ImagePath=' + encodeURIComponent(ImagePath));
    }
    //安装完成
    FinishInstallation(installationSysNo) {
        return axios.get('SalesOrders/FinishInstallation?installationSysNo=' + encodeURIComponent(installationSysNo));
    }

    updateInstallerProfile(paramaters: JSON, succeed: Function, failure: Function) {
        return axios.post('SalesOrders/InsertInstallContact', paramaters)
            .then(succeed)
            .catch(failure);
    }


    //替换安装图片
    UpdateInstallationImage(sysNo, imagePath) {
        return axios.get('SalesOrders/UpdateInstallationImage?sysNo=' + encodeURIComponent(sysNo) + '&imagePath=' + encodeURIComponent(imagePath));
    }

    GetSOInfoMore(sosysno, resolve = () => { }, reject = () => { }) {
        Netaxios('SalesOrders/GetSOInfoMore?sosysno=' + encodeURIComponent(sosysno), null, "get", { cancelToken: this.cancelToken }, resolve, reject);
    }

    getInstallHistory(sysNo: String) {
        return new Promise((resove, reject) => {
            Netaxios(
                "SalesOrders/GetInstallContactByMasterSysNo?MasterSysNo=" + encodeURIComponent(sysNo),
                null,
                "get",
                { cancelToken: this.cancelToken },
                resove,
                reject
            )
        });
    }

    //#region  意向订单

    //收款信息
    GetReceiptInfo(sosysno, resolve = () => { }, reject = () => { }) {
        Netaxios('SalesOrders/GetReceiptInfo?sosysno=' + encodeURIComponent(sosysno), null, "get", { cancelToken: this.cancelToken }, resolve, reject);
    }

    PostReceiptInfo(data, resolve = () => { }, reject = () => { }) {
        Netaxios('SalesOrders/Receipt', data, "post", { cancelToken: this.cancelToken }, resolve, reject);
    }

    GetBluetoothPrintData(SOSysNo, resolve = () => { }, reject = () => { }) {
        Netaxios("/SalesOrders/GetBluetoothPrintData?soSysNo=" + encodeURIComponent(SOSysNo), null, "get", { cancelToken: this.cancelToken }, resolve, reject);
    }

    //新增意向订单
    InsertIntentionOrder(order, resultHandler) {
        global.storage.load(
            {
                key: 'loginState',
                autoSync: false
            }).then(auth => {
                let thisObj = this;
                let db = thisObj.open();

                if (order.Products && order.Products.length > 0) {
                    for (let i = 0; i < order.Products.length; i++) {
                        let product = order.Products[i];
                        if (typeof (product.ProductNum) == 'undefined') {
                            product["ProductNum"] = 1;
                        }
                    }
                }

                db.transaction((tx) => {
                    let sql = "insert into IntentionOrder (CustomerName,CustomerPhone,ProvinceName,CityName,DistrictName,ReceiveAddress,Floor,HasElevator,CompanyID,UserSysNo,"
                        + "Products,EditDate,InDate) values(?,?,?,?,?,?,?,?,?,?,?,?,?);";

                    let now = thisObj.GetNowFormatDateTime();
                    let data = [order.CustomerName
                        , order.CustomerPhone
                        , order.ProvinceName
                        , order.CityName
                        , order.DistrictName
                        , order.ReceiveAddress
                        , order.Floor
                        , order.HasElevator
                        , thisObj.GetCompanyID()
                        , auth.UserSysNo
                        , JSON.stringify(order.Products)
                        , now
                        , now
                    ];
                    tx.executeSql(sql, data, (tx, result) => {
                        order["SysNo"] = result.insertId;
                        if (!order.Products) {
                            order.Products = [];
                        }

                        thisObj.SaveIntentionOrderToCache(order);

                        resultHandler(order);
                    }, (error) => { });
                }, (error) => {
                }, () => {
                });
            }).catch(err => {
            });
    }

    //修改意向订单
    UpdateIntentionOrder(order, resultHandler) {
        let thisObj = this;
        let db = thisObj.open();
        db.transaction((tx) => {
            let sql = "update IntentionOrder set CustomerName=?,CustomerPhone=?,ProvinceName=?,CityName=?,DistrictName=?,ReceiveAddress=?,Floor=?,HasElevator=?,EditDate=?";
            let dataPara = [
                order.CustomerName,
                order.CustomerPhone,
                order.ProvinceName,
                order.CityName,
                order.DistrictName,
                order.ReceiveAddress,
                order.Floor,
                order.HasElevator,
                thisObj.GetNowFormatDateTime(),
            ];

            if (typeof (order.Products) != 'undefined') {
                sql += " ,Products=?";
                if (order.Products && order.Products.length > 0) {
                    order.Products.forEach((item) => {
                        if (item.CommonProductList && item.CommonProductList.length > 0) {
                            item.CommonProductList = null;
                        }
                    })
                }
                dataPara.push(JSON.stringify(order.Products));
            }

            sql += " where SysNo=" + order.SysNo + "  ;";

            tx.executeSql(sql, dataPara, (tx) => {

                thisObj.SaveIntentionOrderToCache(order);
                resultHandler(order);
            }, (error) => { });
        }, (error) => {
        }, () => {
        });
    }

    //删除意向订单
    DeleteIntentionOrder(SysNo, resultHandler) {
        let thisObj = this;
        let db = thisObj.open();
        db.transaction((tx) => {
            let sql = "delete from IntentionOrder where sysno=" + SysNo;

            tx.executeSql(sql, null, (tx) => {
                resultHandler();
            }, (error) => { });
        }, (error) => {
        }, () => {
        });
    }

    //查询意向订单
    QueryIntentionOrder(startNo, pageSize, filterDate, resultHandler) {
        global.storage.load(
            {
                key: 'loginState',
                autoSync: false
            }).then(auth => {
                let thisObj = this;
                let db = this.open();
                db.transaction((tx) => {
                    let data = [];
                    let sql = "select * from IntentionOrder where CompanyID='" + thisObj.GetCompanyID() + "' and UserSysNo=" + auth.UserSysNo;
                    if (filterDate) {
                        sql += " and date(indate)=date(?) ";
                        data.push(filterDate);
                    }

                    sql += " order by EditDate desc limit " + startNo + "," + pageSize;
                    // console.log(sql);
                    tx.executeSql(sql, data, (tx, result) => {
                        if (result != null) {
                            var resultArray = thisObj.ConvertResultToArray(result);
                            if (resultArray.length > 0) {
                                resultArray.forEach((value, index) => {
                                    if (value.Products) {
                                        value.Products = JSON.parse(value.Products);
                                        let list = [];
                                        for (let i = 0; i < value.Products.length; i++) {
                                            list.push(value.Products[i].SysNo)
                                        }
                                        this.LoadProductsBySysNos(list, (data) => {
                                            let products = [];
                                            for (let i = 0; i < value.Products.length; i++) {
                                                for (let j = 0; j < data.length; j++) {
                                                    if (value.Products[i].SysNo == data[j].SysNo) {
                                                        data[j].ProductNum = value.Products[i].ProductNum;
                                                        products.push(data[j]);
                                                    }
                                                }
                                            }
                                            value.Products = products;
                                            if (!value["ProductNum"]) {
                                                value["ProductNum"] = 1;
                                            }
                                            resultHandler(resultArray);
                                        })
                                    } else {
                                        value.Products = [];
                                        resultHandler(resultArray);
                                    }
                                });
                            } else {
                                resultHandler(resultArray);
                            }
                        }
                    }, (err) => {
                    });
                }, (error) => {

                }, () => {

                });
            }).catch(err => {
            });
    }
    LoadProductsBySysNos(sysnos, resultHandler) {
        let thisObj = this;
        let list = sysnos;
        let str = '';
        for (let i = 0; i < list.length; i++) {
            str = str + "," + list[i];
        }
        let str2 = str.substring(1);
        let db = this.open();
        db.transaction((tx) => {
            tx.executeSql("select * from Product where sysno in (" + str2 + ") ", null, (tx, result) => {

                if (result != null) {
                    var resultArray = thisObj.ConvertResultToArray(result);
                    resultHandler(resultArray);
                }
            }, (err) => {
                // console.log(err);
            });
        }, (error) => {
            // console.log('Transaction Error:', error.message);

        }, () => {

        });
    }

    //获取意向订单
    GetIntentionOrder(sysno, resultHandler) {
        let thisObj = this;
        let db = this.open();
        db.transaction((tx) => {
            tx.executeSql("select * from IntentionOrder where sysno=" + sysno + " ", null, (tx, result) => {

                if (result.rows.length > 0) {
                    let value = result.rows.item(0);
                    if (value.Products) {
                        value.Products = JSON.parse(value.Products);
                        let list = [];
                        for (let i = 0; i < value.Products.length; i++) {
                            list.push(value.Products[i].SysNo)
                        }
                        this.LoadProductsBySysNos(list, (data) => {
                            let products = [];
                            for (let i = 0; i < value.Products.length; i++) {
                                for (let j = 0; j < data.length; j++) {
                                    if (value.Products[i].SysNo == data[j].SysNo) {
                                        data[j].ProductNum = value.Products[i].ProductNum;
                                        products.push(data[j]);
                                    }
                                }
                            }
                            value.Products = products;
                            if (!value["ProductNum"]) {
                                value["ProductNum"] = 1;
                            }
                            resultHandler(value);
                        })
                    } else {
                        value.Products = [];
                        resultHandler(value);
                    }
                }
            }, (err) => {
            });
        }, (error) => {
        }, () => {
        });
    }

    CommitShoppingCarInfo(paramater, ssucceed, failure) {
        axios.post('/SalesOrders/CreateSalesOrder', paramater)
            .then(ssucceed)
            .catch(failure);
    }

    //添加商品到购物车
    AddProductToShoppintCar(products, resultHandler) {
        products = this.ConvertProductToSimple(products);
        let thisObj = this;
        thisObj.loadFromStorage('SelectedShoppingCarCustomer').then((result) => {
            if (result) {
                result.Products = thisObj.addProductToOrderProducts(result.Products, products);
                thisObj.UpdateIntentionOrder(result, () => {
                });
                if (typeof (resultHandler) == "function") {
                    resultHandler();
                }
            } else {
                thisObj.QueryIntentionOrder(0, 1, null, (result) => {
                    if (result.length == 0) {
                        thisObj.CreateDefaultIntentionOrder((order) => {
                            order.Products = thisObj.addProductToOrderProducts(order.Products, products);
                            thisObj.UpdateIntentionOrder(order, () => {
                                thisObj.SaveIntentionOrderToCache(order);
                                if (typeof (resultHandler) == "function") {
                                    resultHandler();
                                }
                            });
                        })
                    } else {
                        var order = result[0];
                        order.Products = thisObj.addProductToOrderProducts(order.Products, products);
                        thisObj.UpdateIntentionOrder(order, () => {
                            thisObj.SaveIntentionOrderToCache(order);
                            if (typeof (resultHandler) == "function") {
                                resultHandler();
                            }
                        });
                    }
                });


            }

        });
    }

    addProductToOrderProducts(orderProducts, products) {

        for (var j = 0; j < products.length; j++) {
            let product = products[j];

            let exists = false;
            for (var i = 0; i < orderProducts.length; i++) {
                let tmpProduct = orderProducts[i];
                if (tmpProduct.SysNo == product.SysNo) {
                    if (!tmpProduct.ProductNum) { tmpProduct["ProductNum"] = 1; }
                    tmpProduct.ProductNum = tmpProduct.ProductNum + product.ProductNum;
                    exists = true;
                    break;
                }
            }

            if (!exists) {
                orderProducts.push(product);
            }
        }
        return orderProducts;
    }

    ConvertProductToSimple(products) {

        for (var i = 0; i < products.length; i++) {
            let product = products[i];
            if (product.ImageList) {
                delete product.ImageList;
            }
            if (product.InstallationImages) {
                delete product.InstallationImages;
            }
            if (product.ProductImages) {
                delete product.ProductImages;
            }
            if (product.RealViewImages) {
                delete product.RealViewImages;
            }

            if (typeof (product.ProductNum) == 'undefined') {
                product["ProductNum"] = 1;
            }
        }
        return products;
    }

    //创建默认客户订单
    CreateDefaultIntentionOrder(resultHandler) {

        let newOrder = {
            CustomerName: "临时客户",
            CustomerPhone: 0,
            ProvinceName: null,
            CityName: null,
            DistrictName: null,
            ReceiveAddress: null,
            Products: [],
            ProductNum: 1,
        };
        this.InsertIntentionOrder(newOrder, (order) => {
            resultHandler(order);
        });
    }

    //获取当前客户订单信息
    GetCurrentCustomerOrder(resultHandler) {
        let thisObj = this;
        thisObj.loadFromStorage('SelectedShoppingCarCustomer').then((result) => {
            if (result) {
                resultHandler(result);
            } else {
                thisObj.QueryIntentionOrder(0, 1, null, (result) => {
                    if (result.length == 0) {
                        resultHandler();
                    } else {
                        var order = result[0];
                        thisObj.SaveIntentionOrderToCache(order);
                        resultHandler(order);
                    }
                });

            }

        });
    }

    //将数据库查询出的结果保存为数组
    ConvertResultToArray(result) {
        var datas = [];
        for (var i = 0; i < result.rows.length; i++) {
            var item = result.rows.item(i);
            datas.push(item);
        }
        return datas;
    }

    //获取当前时间，格式YYYY-MM-DD hh:mm:dd
    GetNowFormatDateTime() {
        var date = new Date();
        var seperator1 = "-";
        var seperator2 = ":";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }

        var hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        var minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        var second = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();


        var currentdatetime = year + seperator1 + month + seperator1 + strDate;
        // + " " + hour + seperator2 + minute + seperator2 + second;
        return currentdatetime;
    }

    async loadFromStorage(key) {
        let data = null;
        await global.storage.load({
            key: key,
            autoSync: false,
        }).then(result => {
            data = result;

        }).catch(err => {
            switch (err.name) {
                case 'NotFoundError':
                    break;
                case 'ExpiredError':
                    break;
            }
        });

        return data;
    }

    SaveIntentionOrderToCache(data) {
        global.storage.save({
            key: 'SelectedShoppingCarCustomer',
            data: data,
            expires: (1000 * 3600 * 24) * 30 * 3
        });
    }
}