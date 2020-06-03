import axios from "axios";
import { Netaxios } from './common';

export default class loginregisterService {
    constructor(cancel) {
        this.cancelToken = (typeof cancel !== 'undefined' ? cancel.token : null);
    }
    netlogin(formdata, resolve = () => { }, reject = () => { }) {
        Netaxios('/Login/Login', formdata, "post", { cancelToken: this.cancelToken }, resolve, reject);
    }

    static netAuthentication(data) {
        return axios.post('/login/UserAuth', data);
    }

    switchManuFacturer(data, resolve, reject) {
        Netaxios('/login/UserAuth', data, "post", { cancelToken: this.cancelToken }, resolve, reject);
    }

    getCapcha(userphone, findpwd, resolve = () => { }, reject = () => { }) {
        Netaxios('/login/getCapcha?userphone=' + encodeURIComponent(userphone) + '&findpwd=' + encodeURIComponent(findpwd), null, "get", { cancelToken: this.cancelToken }, resolve, reject);
    }

    netregister(formdata, resolve = () => { }, reject = () => { }) {
        Netaxios('/login/Register', formdata, "post", { cancelToken: this.cancelToken }, resolve, reject);
    }

    getallManuFacturer(resolve = () => { }, reject = () => { }) {
        Netaxios('/login/GetAllManuFacturers', null, "get", { cancelToken: this.cancelToken }, resolve, reject);
    }

    getFacturersByLogin(data, resolve, reject) {
        Netaxios('/login/GetFacturersByLogin', data, "post", { cancelToken: this.cancelToken }, resolve, reject);
    }
    isExistByLoginName(LoginName, resolve = () => { }, reject = () => { }) {
        Netaxios('/login/IsExistByLoginName?LoginName=' + encodeURIComponent(LoginName), null, "get", { cancelToken: this.cancelToken }, resolve, reject);
    }
    ApplyAgency(agency, resolve = () => { }, reject = () => { }) {
        Netaxios('/login/ApplyAgency', agency, "post", { cancelToken: this.cancelToken }, resolve, reject);
    };

    GetFacturers(resolve, reject) {
        Netaxios('/login/GetFacturers', null, "get", { cancelToken: this.cancelToken }, resolve, reject);
    };

}