/**
 * Created by jean.h.ma on 19/05/2017.
 */
import { Platform, Dimensions } from "react-native";
import CompanyAppConfig from './company.app.js';
import FileHelper from '../helpers/fileHelper.config'
import Constaints from '../config/Constaints';
// import {getStartEnv} from "../WaitingForReady";
// export function getStartEnv() {
// 	return _env;
// }139.219.57.22:8033

const deviceSize = Dimensions.get("window");
const config = {
	env: CompanyAppConfig.env,
	// baseURL: 'http://10.21.21.107:9001',
	// baseURL: 'http://192.168.8.188:9001',
	// baseURL: 'http://139.219.57.22:8033',
	imageBaseUrl: CompanyAppConfig.imageBaseUrl,
	appUpdateUrl: CompanyAppConfig.appUpdateUrl,
	requestTimeout: 30 * 1000,
	toastTimeout: 2 * 1000,
	customerPhoneNumber: "400-100-3022",
	appName: '云家具',
	design: {
		width: 1334,
		height: 750,
		density: 2
	},
	iconDensity: 3,
	//baiduPushAPIKey: Platform.select(CompanyAppConfig.BaiduPushAPIKey),
	development: {
		baseURL: 'http://10.150.9.85:53080',
		// baseURL: 'http://192.168.8.21:8093'
		// baseURL:'http://192.168.2.105:53080'
	},
	qa: {
		// baseURL: 'http://10.150.9.85:53080',
		baseURL: 'http://10.150.9.88:9001',
	},
	pre: {
		baseURL: 'http://139.219.57.22:8033',
	},
	production: {
		baseURL: CompanyAppConfig.baseURL,
	},
	projectCoverImageWidth: [80, 110, 160, 240, 220, 600, 375, 750, 1125],

	defaultImage: require(`../assets/images/default.png`),
	defaultLoadingImage: require(`../assets/images/pic-loading.jpg`),
	defaultFailImage: require(`../assets/images/pic-fail.jpg`),
	defaultNoImage: require(`../assets/images/pic-404.jpg`),
};
export const env = config.env;
// export const env = (getStartEnv && getStartEnv()) || config.env;

let envConfig = Object.assign({}, config);

function resetScreen() {
	let r = deviceSize.height / deviceSize.width;
	envConfig.design.height = envConfig.design.width * r;
}
resetScreen();

envConfig = Object.assign(envConfig, config[env] || {});
delete envConfig["development"];
delete envConfig["qa"];
delete envConfig["pre"];
delete envConfig["production"];
export default envConfig;



export function clearStorage(shouldClearCompanyData: Boolean) {
	global.storage.remove({ key: "DataDownloadAlert" });
	global.storage.remove({ key: "Styles" });
	global.storage.remove({ key: "Series" });
	global.storage.remove({ key: "Categorys" });
	global.storage.remove({ key: "NewPurchaseOrder" });
	global.storage.remove({ key: "SelectedShoppingCarCustomer" });
	global.storage.remove({ key: "AreaData" });
	FileHelper.deleteTempFile();

	if (!shouldClearCompanyData) {
		let key = Constaints.STORAGE_FILE_DOWNLOAD_LIST_ID_KEY();
		global.storage.remove({ key: key });
		global.storage.remove({ key: "AppMenu" });
		global.storage.remove({ key: "CompanyParameters" });
	}
}