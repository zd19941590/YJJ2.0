import axios from "axios";

export default class CustomerService {
    constructor(cancel) {
        this.cancelToken = (typeof cancel !== 'undefined' ? cancel.token : null);
    };
    GetCompanyUser() {
        return axios.get("/MyProfile/GetCompanyUser", { cancelToken: this.cancelToken });
    }


    LoadUser(CommonStatus, pageIndex, pageSize) {
        return axios.get("/MyProfile/LoadUser?CommonStatus=" + encodeURIComponent(CommonStatus) + "&pageIndex=" + encodeURIComponent(pageIndex) + "&pageSize=" + encodeURIComponent(pageSize))
    }

    UpdateCompanyUserStatus(sysNo, commonStatus) {
        return axios.get("/MyProfile/UpdateCompanyUserStatus?sysNo=" + encodeURIComponent(sysNo) + "&CommonStatus=" + encodeURIComponent(commonStatus))
    }
    UpdateUserPassword(oldPassword, newPassword) {
        return axios.get("/MyProfile/UpdateUserPassword?oldPassword=" + encodeURIComponent(oldPassword) + "&newPassword=" + encodeURIComponent(newPassword))
    }
    ResetPassword(sysNo) {
        return axios.get("/MyProfile/ResetPassword?sysNo=" + encodeURIComponent(sysNo))
    }

    UpdateUserInfo(userSysNo, userFullName, cellphone, ProvinceName, CityName, DistrictName, Address) {
        return axios.post("/MyProfile/UpdateUserInfo", {
            UserSysNo: userSysNo,
            UserFullName: userFullName,
            CellPhone: cellphone,
            ProvinceName: ProvinceName,
            CityName: CityName,
            DistrictName: DistrictName,
            Address: Address

        })
    }

    GetAllUserInfo() {
        return axios.get("/MyProfile/GetDistributorAllUser")
    }
    GetUsersPermission(requestData) {
        return axios.post("/MyProfile/GetUsersPermission", requestData)
    }

    UpdateUserPermission(requestData) {
        return axios.post("/MyProfile/UpdateDistributorUserPermission", requestData)
    }

    AddCompanyUser(userFullName, cellPhone, loginPassword, ProvinceName, CityName, DistrictName, Address) {
        return axios.post("/MyProfile/AddCompanyUser", {
            LoginPassword: loginPassword,
            UserFullName: userFullName,
            CellPhone: cellPhone,
            ProvinceName: ProvinceName,
            CityName: CityName,
            DistrictName: DistrictName,
            Address: Address
        })
    }
    FindUser(cellPhone) {
        return axios.get("/MyProfile/FindUserByCellPhone?cellPhone=" + encodeURIComponent(cellPhone))
    }
    InsertCompanyUser(userSysNo) {
        return axios.get("/MyProfile/InsertCompanyUser?userSysNo=" + encodeURIComponent(userSysNo))
    }
    QueryFeedback(pageIndex, pageSize) {
        return axios.get("/MyProfile/QueryFeedback?pageIndex=" + encodeURIComponent(pageIndex) + "&pageSize=" + encodeURIComponent(pageSize))
    }
    InsertFeedback(description) {
        return axios.get("/MyProfile/InsertFeedback?description=" + encodeURIComponent(description))
    }
    //账户收支明细
    QueryAdvanceChargeStatementList(filter) {
        return axios.post("/PurchaseOrders/QueryAdvanceChargeStatementList", filter)
    }
    //充值明细
    QueryAdvanceChargeDetailList(filter) {
        return axios.post("/PurchaseOrders/QueryAdvanceChargeDetailList", filter)
    }
    //账户余额信息
    LoadAccountBalanceInfo() {
        return axios.get("/PurchaseOrders/LoadAccountBalanceInfo")
    }
    //充值
    Recharge(info) {
        return axios.post("/PurchaseOrders/Recharge", info)
    }
    //厂商银行信息
    LoadCompanyBankAccount() {
        return axios.post("/PurchaseOrders/LoadCompanyBankAccount")
    }
}
