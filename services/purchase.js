import SQLiteBase from './sqlite.js';
import axios from "axios";
import companyConfig from '../config/company.config.js';
import { Netaxios } from './common';

export default class PurchaseService extends SQLiteBase {
    constructor(cancel) {
        super();
        this.cancelToken = (typeof cancel !== 'undefined' ? cancel.token : null);
    }
    log(msg) {
        // console.log(msg);
    }
    LoadPOInfoBySysNo(sysNo, resolve = () => { }, reject = () => { }) {
        Netaxios('/PurchaseOrders/LoadPOInfoBySysNo?sysNo=' + sysNo, null, "get", { cancelToken: this.cancelToken }, resolve, reject);
    }

    FetchPruchaseList(SOStatus, index, size, condition, succeed, failure) {
        axios.get('/PurchaseOrders/QueryPOList?FilterInfo=' + encodeURIComponent(condition) + '&SOStatus=' + encodeURIComponent(SOStatus) + '&PageIndex=' + encodeURIComponent(index) + '&PageSize=' + encodeURIComponent(size))
            .then(succeed)
            .catch(failure);
    }

    QueryProductList(pageIndex, pageSize, searchText) {
        return axios.get("/PurchaseOrders/QueryProductList?searchText=" + encodeURIComponent(searchText) + "&pageIndex=" + pageIndex + "&pageSize=" +
            pageSize)
    }

    QueryProductListData(pageIndex, pageSize, searchText, resultHandler) {
        this.QueryProductList(pageIndex, pageSize, searchText).then((result) => {
            if (result.status == 200) {
                resultHandler(result.data.data.data);
            }
        });
    }

    getAreaData(resultHandler) {
        let thisObj = this;
        thisObj.loadFromStorage("AreaData").then((result) => {
            if (result == null || result.length == 0) {

                thisObj.GetAreaDataHttp((data) => {
                    if (data.length && data.length > 0) {
                        global.storage.save({
                            key: 'AreaData',
                            data: data,
                            expires: (1000 * 3600 * 24) * 30 * 3
                        });
                        resultHandler(data);
                    }
                });
            }
            else { resultHandler(result); }
        });

    }

    GetAreaDataHttp(resultHandler) {
        let thisObj = this;
        axios.get("/PurchaseOrders/GetAppAreaData").then((result) => {
            var data = thisObj._createAreaData(result.data);
            resultHandler(data);
        });
    }

    _createAreaData(area) {
        let data = [];
        let len = area.length;
        for (let i = 0; i < len; i++) {
            let city = [];
            for (let j = 0, cityLen = area[i]['city'].length; j < cityLen; j++) {
                let _city = {};
                _city[area[i]['city'][j]['name']] = area[i]['city'][j]['area'];
                city.push(_city);
            }

            let _data = {};
            _data[area[i]['name']] = city;
            data.push(_data);
        }
        return data;
    }

    FetchPruchaseLogisticsList(SysNo, succeed, failure) {
        axios.get('/PurchaseOrders/LoadLogistics?sysNo=' + encodeURIComponent(SysNo))
            .then(succeed)
            .catch(failure);
    }

    LoadNewOrder(resultHandler) {
        let thisObj = this;
        this.loadFromStorage('NewPurchaseOrder').then((cacheOrder) => {
            if (cacheOrder == null) {
                cacheOrder = {
                    Products: []
                };
            }

            if (typeof (cacheOrder["ReceiveInfo"]) == 'undefined' || cacheOrder["ReceiveInfo"] == null) {
                thisObj.GetHistoryReceiveInfo((receiveInfo) => {
                    cacheOrder["ReceiveInfo"] = receiveInfo;
                    resultHandler(cacheOrder);
                });
            } else {
                resultHandler(cacheOrder);
            }
        });
    }

    GetHistoryReceiveInfo(resultHandler) {
        let thisObj = this;
        axios.get("/PurchaseOrders/LoadReceiveAddressInfo").then((result) => {
            var receiveData = {
                ReceivePhone: '',
                ReceiveAddress: '',
                PlanDeliveryDate: '',
                ReceiveProvinceName: '',
                ReceiveCityName: '',
                ReceiveDistrictName: '',
            };

            if (result.data && result.data.data) {
                receiveData = result.data.data;
            }

            resultHandler(receiveData);
        });
    }

    CreateOrder(order, resultHandler) {
        axios.post('/PurchaseOrders/CreatePurchaseOrder', order).then((result) => {
            resultHandler(result);
        });

    }

    UpdateOrder(order, resultHandler) {
        axios.post('/PurchaseOrders/UpdatePurchaseOrder', order).then((result) => {
            resultHandler(result);
        });

    }
    DeleteOrder(posysno, deletereason, resolve = () => { }, reject = () => { }) {

        Netaxios('/PurchaseOrders/CancelPurchaseOrder?posysno=' + posysno + '&cancelreason=' + encodeURIComponent(deletereason), null, "get", { cancelToken: this.cancelToken }, resolve, reject);


        // toggleSpinner(true);
        // axios.get('/PurchaseOrders/CancelPurchaseOrder?posysno=' + posysno + '&cancelreason=' + encodeURIComponent(deletereason), { cancelToken: this.cancelToken }).then((result) => {
        //     toggleSpinner(false);
        //     resolve(result);
        // }).catch((error) => {
        //     toggleSpinner(false);
        //     reject(error);
        // });
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


    //库存查询
    QueryStockList(pageIndex, pageSize, searchText, resultHandler, errHandler) {
        axios.get("/PurchaseOrders/QueryStockList?searchText=" + searchText + "&pageIndex=" + pageIndex + "&pageSize=" +
            pageSize).then((result) => {
                result = result.data;
                if (result.success) {
                    resultHandler(result.data);
                } else {
                    errHandler(result)
                }
            });
    }

    //加载库存
    LoadProductInventoryList(productSysNos, resultHandler, errHandler) {
        axios.post("/PurchaseOrders/LoadProductInventoryList", productSysNos).then((result) => {
            result = result.data;
            if (result.success) {
                resultHandler(result.data);
            } else {
                errHandler(result)
            }
        });
    }

    //调整库存
    InsertInvCheckingMaster(model, resultHandler) {
        axios.post('/PurchaseOrders/InsertInvCheckingMaster', model).then((result) => {
            if (result.status == 200) {
                resultHandler(result.data);
            }
        });
    }

    //商品库存变更记录查询
    QueryProductInvCheckingItems(pageIndex, pageSize, productSysNo, resultHandler) {
        axios.get("/PurchaseOrders/QueryProductInvCheckingItems?productSysNo=" + productSysNo + "&pageIndex=" + pageIndex + "&pageSize=" +
            pageSize).then((result) => {
                if (result.status == 200) {
                    resultHandler(result.data);
                }
            });
    }

    // orderSysNo：物流单号 
    ReceivingProducts(sysno, resultHandler) {
        axios.get('/PurchaseOrders/ReceiveGoods?sysno=' + sysno).then(resultHandler).catch();
    }


    //销售订单转采购单
    GetPurchaseOrderFromSale(resultHandler) {
        axios.get("/PurchaseOrders/GetPurchaseOrderFromSale").then((result) => {
            result = result.data;
            if (result.success) {
                resultHandler(result.data);
            }
        });
    }


    GetSaleBillProductsPurchasePrice(sosysno, resultHandler, failhandler) {
        axios.get("/PurchaseOrders/GetSaleBillProductsPurchasePrice?sosysno=" + sosysno).then((result) => {
            result = result.data;
            if (result.success) {
                resultHandler(result.data);
            } else {
                failhandler(result)
            }
        });
    }
}