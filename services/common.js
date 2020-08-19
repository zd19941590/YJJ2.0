import axios, { AxiosRequestConfig } from "axios";

export function formatMenu(menuList) {
    if (menuList == null || menuList.length == 0) return;
    for (let i = 0; i < menuList.length; i++) {
        menuItem = menuList[i];
        let menuCode = new String(menuItem.LinkCode).toLowerCase();
        if (menuCode == "productlistbycategory") {
            menuItem.LinkCode = "ProductList";
        }
        else if (menuCode == "productlistbyseries") {
            menuItem.LinkCode = "ProductList";
        }
        else if (menuCode == "dispatchmenu") {
            menuItem.LinkCode = "DispatchMenuAsList";
            if (menuItem.PathParams != null && menuItem.PathParams != "") {
                let mp = JSON.parse(menuItem.PathParams);
                if (mp.CategorySysNo == 1) {
                    menuItem.LinkCode = "DispatchMenuAsList";
                }
                else if (mp.CategorySysNo == 2) {
                    menuItem.LinkCode = "DispatchMenuAsDetail";
                } else if (mp.CategorySysNo == 3) {
                    menuItem.LinkCode = "DispatchMenuAsLattice";
                } else if (mp.CategorySysNo == 4) {
                    menuItem.LinkCode = "DispatchMenuAsGrid";
                }
            }
        }
        formatMenu(menuItem.Children);
    }
}

type BooleanResultCallback = (result: {
    valid?: Boolean,
    error?: Error,
}) => void;

export default class CommonService {
    async  GetMenuList() {
        let response = await axios.get("/Common/GetMenuList", null);
        let datas = response.data;
        if (datas && datas.length) {
            formatMenu(datas);
        }
        return response;
    }

    GetCompanyParameters() {
        return axios.get("/Common/GetCompanyConfig", null);
    }

    GetCompanyParameterList(data) {
        return axios.post("/Common/GetCompanyConfigList", data);
    }

    getAppCompanyName() {
        return axios.get("/Common/getAppCompanyName", null);
    }

    QueryMessageList(pageIndex, pageSize) {
        return axios.get("/Message/GetPushedMessage?pageIndex=" + encodeURIComponent(pageIndex) + "&pageSize=" + encodeURIComponent(pageSize))
    }
    GetMessageDetail(messageSysNo) {
        return axios.get("/Message/MessageView?messageSysNo=" + encodeURIComponent(messageSysNo))
    }

    GetUnViewdMessageCount() {
        return axios.get("/Message/QueryUnViewdMessageCount")
    }

    // AddDeviceToBaiduPushTag(channelID) {
    //     return axios.get("/Message/BaiduPushAddDeviceToTag?channelID=" + encodeURIComponent(channelID))
    // }

    BindCompanyChannel(channelID) {
        return axios.get("/Message/BindCompanyChannel?channelID=" + encodeURIComponent(channelID))
    }

    update(version, platform, isGeneral) {
        return axios.get('/Common/Getupdate?version=' + encodeURIComponent(version) + '&platform=' + platform + '&isGeneral=' + encodeURIComponent(isGeneral));
    }
    //判断权限
    IsPossessPermission(permissionKey, callBack, noCallBack) {
        global.storage.load({
            key: 'loginState',
            autoSync: false
        }).then(auth => {
            let permissionList = auth.PermissionList;
            let IsMessage = false;
            if (permissionList && permissionList.length > 0) {
                for (let i = 0; i < permissionList.length; i++) {
                    if (permissionList[i].PermissionKey == permissionKey) {
                        IsMessage = true;
                    };
                };
            }
            if (IsMessage) {
                callBack();
            } else {
                if (noCallBack != null && typeof (noCallBack) == "function") {
                    noCallBack();
                }
            }
        }).catch(() => { });
    }

    /**
     *  Return fetched value for some `key`
     *  Paramater `valid`: value for some `key`
     *  Paramater `error`: catch an error if exist
     */

    fetchAuthorityForKey(key: String, completionHandler: BooleanResultCallback) {
        global.storage.load({
            key: 'loginState',
            autoSync: false
        }).then(auth => {
            let auths = auth.PermissionList;
            let valid = false;
            if (auths && auths.length) {
                for (let idx = 0; idx < auths.length; idx++) {
                    if (auths[idx].PermissionKey == key) {
                        valid = true;
                    };
                };
            }
            completionHandler(valid);
        }).catch((error) => {
            completionHandler(error);
        });
    }
}

export function Netaxios(url: string, data?: object, type: string, axioconfig?: AxiosRequestConfig, resolve: (result) => Function, reject: (error) => Function) {
    type = type.toLowerCase();
    //toggleSpinner(true);
    window.console.log(url)
    window.console.log(data)
    window.console.log(axioconfig)
    switch (type) {
        case "get":
            axios.get(url, axioconfig).then((result) => {
                window.console.log(result)
                resolve(result);
            }).catch((error) => {
                reject(error);
            });
            break;
        case "post":
            axios.post(url, data, axioconfig).then((result) => {
                window.console.log(result)
                resolve(result);
            }).catch((error) => {
                reject(error);
            });
            break;
        default:
            break;
    }
}
