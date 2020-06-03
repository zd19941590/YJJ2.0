import DeviceInfo from "react-native-device-info";
import { Platform, Dimensions, PixelRatio } from "react-native";
import CompanyAppConfig from "./company.app.js";
import axios from "axios";
import config from "./app.config";
import { toggleSpinner } from "../components/Spinner";
//import strings from "../assets/languages";

const { width, height } = Dimensions.get("window");

const headers = {
	"x-platform": Platform.OS,
	"Accept": "application/json",
	"x-companyid": CompanyAppConfig.CompanyID,
	"x-channelid": "",
	"Content-Type": 'application/json;charset=utf-8',
	"x-platform-version": DeviceInfo.getSystemVersion(),
	"x-dimension": `${width}*${height}*${PixelRatio.get()}`,
	"x-version": DeviceInfo.getVersion(),
	"x-local": DeviceInfo.getDeviceLocale(),
	"x-timezone": DeviceInfo.getTimezone(),
	"x-tablet": DeviceInfo.isTablet()
};
const storage = global.storage;
axios.defaults.baseURL = config.baseURL;
axios.defaults.timeout = config.requestTimeout;
global.AppAuthentication = null;
(function setAuth() {
	storage.load(
		{
			key: 'loginState',
			autoSync: false
		}).then(auth => {
			global.AppAuthentication = auth;
		}).catch(err => {
			//如果没有找到数据且没有sync方法，
			//或者有其他异常，则在catch中返回
			//console.warn(err.message);
			switch (err.name) {
				case 'NotFoundError':
					// TODO;
					break;
				case 'ExpiredError':
					// TODO
					break;
			}
		});
})();

// (function setChannelID() {
// 	storage.load(
// 		{
// 			key: 'BaiduPushChannelID',
// 			autoSync: false
// 		}).then(channelid => {
// 			headers["x-channelid"] = channelid
// 		}).catch(err => {

// 		});
// })();

axios.interceptors.request.use(function (configuration) {
	//let {authentication}=store.getState(); 
	let authentication = global.AppAuthentication;

	// storage.load({
	// 	key: 'loginState',
	// 	autoSync: true,// autoSync(默认为true)意味着在没有找到数据或数据过期时自动调用相应的sync方法
	// 	syncInBackground: true,// syncInBackground(默认为true)意味着如果数据过期，  在调用sync方法的同时先返回已经过期的数据。 设置为false的话，则等待sync方法提供的最新数据(当然会需要更多时间)。
	// 	syncParams: {// 你还可以给sync方法传递额外的参数
	// 		extraFetchOptions: {
	// 			// 各种参数
	// 		},
	// 		someFlag: true,
	// 	},
	// }).then(authentication => {
	// 	// 如果找到数据，则在then方法中返回
	// 	// 注意：这是异步返回的结果（不了解异步请自行搜索学习）
	// 	// 你只能在then这个方法内继续处理ret数据
	// 	// 而不能在then以外处理
	// 	// 也没有办法“变成”同步返回
	// 	// 你也可以使用“看似”同步的async/await语法
	// 	console.log(authentication.user.token);
	// }).catch(err => {
	// 	//如果没有找到数据且没有sync方法，
	// 	//或者有其他异常，则在catch中返回
	// 	console.warn(err.message);
	// 	switch (err.name) {
	// 		case 'NotFoundError':
	// 			// TODO;
	// 			break;
	// 		case 'ExpiredError':
	// 			// TODO
	// 			break;
	// 	}
	//   });

	let token = null;
	let authid;
	if (authentication) {
		token = authentication.Token;
	}
	if (authentication && CompanyAppConfig.isGeneral()) {
		authid = authentication.AppCompanyID;
		if (authid) {
			configuration.headers["x-companyid"] = authid;
		}
	}
	if (configuration.$enableSpinner === undefined || configuration.$enableSpinner === null) {
		configuration.$enableSpinner = true;
	}
	if (configuration.$enableSpinner) {
		const spinnerParams = configuration.$spinnerParams || [];
		toggleSpinner(true, ...spinnerParams);
	}
	configuration.headers = Object.assign({}, headers, configuration.headers || {});
	if (token) {
		configuration.headers["x-auth-token"] = token;
	}
	return configuration;
}, function (error) {
	return Promise.reject(error);
});



axios.interceptors.response.use(function (response) {
	toggleSpinner(false);
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(response);
		}, 500);
	})
}, function (err) {
	toggleSpinner(false);
	let message = "网络加载失败！请联网后重试。";//strings['SystemError'];
	if (err.message) {
		if (/Error: Network Error/gi) {
			message = "网络加载失败！请联网后重试。";//strings['NetworkError'];
		}
		else if (config.env === "development") {
			message = err.message;
		}
	}
	return new Promise(resolve => {
		setTimeout(() => {
			resolve({
				data: {
					success: false,
					message: message,
					data: err
				}
			});
		}, 500);
	});
});