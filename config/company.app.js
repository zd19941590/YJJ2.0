import { NativeModules } from 'react-native';
var config = NativeModules.CompanyConfigurationManager.CompanyAppConfig;
if(typeof(config)=='string'){
    config = JSON.parse(config);
}
// the configuration properties read from java native method
// and see detailed information plz open terminal and input cd android\app\src\main\java\com\yjjapp\configuration
// @see CompanyConfigurationManagerModule.java
export const CompanyAppConfig =  Object.assign({
    env: 'production',
    // baseURL : 'http://app-svc.lixiantuce.com',
    baseURL: 'http://app-svc.lixiantuce.com',
    uploadUrl : 'http://img2.lixiantuce.com',
    imageBaseUrl : 'http://img2.lixiantuce.com',
    appUpdateUrl : 'http://www.lixiantuce.com/Company/Index/',
    CompanyID: "00000000-0000-0000-0000-000000000000",
    CompanyBGImg_Name:'',
    CompanyBGImgWithLogo_Name:'',
    CompanyLogo_Name:'',
    LoginBGImg_Name:'',
    AppColor: {
        PageBackground: "#FFFFFF", // 整个页面背景色
        Main: "#4d5270", //背景：A3,// 主色 ：用于标题，导航栏背景
        OnPressMain: null, // 主色 ：用于标题，导航栏背景
        Secondary: "#FFFFFF", //背景：A4 // 辅色,按钮点击下的颜色
        OnPressSecondary: null, // 辅色 ：用于标题，导航栏背景
        MainFront: "#FFFFFF", // 文字：A1 // 主文字色：在主色背景上的文件色
        SecondaryFront: "#FFFFFF", // 文字：A2 // 主文字色：在主色背景上的文件色
        ContentFront: "#FFFFFF", //文字:A5 // 内容
        DescriptionFront: "#e1e1e1",//文字:A6 // 主要用于说明，描述
        Line: "#027FD6", // 列表数据分隔线
        OnPressLine: null,
        Warning: "#FAB13C",// 警示色
        PopupBackground: "#FFFFFFD0",
        PopupFront: "#444444",
        PopupBackgroundSelectedItem: "#00000070",
        ButtonBg: "#4d5270",
        ButtonFront: "#FFFFFF",
        FocalFront: "#000000" //重点文字颜色
    },
    isGeneral : function () {
        return CompanyAppConfig.CompanyID == '00000000-0000-0000-0000-000000000000';
    },
    CompanyBGImg: {uri:"companybgimg"},
    CompanyBGImgWithLogo:{uri:"companybgimgwithlogo"},
    CompanyLogo :{uri:"companylogo"},
    LoginBGImg:{uri:"loginbgimg"},
    companySysNo: 1394
}, config);
CompanyAppConfig.env='production';
export default CompanyAppConfig;
