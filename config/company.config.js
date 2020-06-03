import CompanyAppConfig from './company.app.js';
import FileHelper from '../helpers/fileHelper.config.js'
//import { Object } from 'core-js/library/web/timers';
global.CompanyConfigIsReady = global.CompanyConfigIsReady || false;

// App颜色配置合并：合并默认设置和系统设置
CompanyAppConfig.AppColor = Object.assign({
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
    FocalFront: "#000000", //重点文字颜色
}, CompanyAppConfig.AppColor);


// App设置合并:合并默认设置和系统设置
export const DefaultCompanyConfig = Object.assign(
    {
        CompanyID: '00000000-0000-0000-0000-000000000000',// 云家居通用版本
        AppStyle: "C",//A:A版本-复古，B:B版本-文艺，C:C版本-流行
        Compatibility: 0,//兼容性设置： 1：表示兼容云家居1.* 版本。否则为最当前版本。
        CompanyBGImg: require("../assets/images/private/bg.jpg"),//打包时，直接下载新文件到对应位置，打到包中。
        CompanyBGImgWithLogo: require("../assets/images/private/bglogo.jpg"),//打包时，直接下载新文件到对应位置，打到包中。
        CompanyLogo: require("../assets/images/logo.png"),//打包时，直接下载新文件到对应位置，打到包中。
        LoginBGImg: require("../assets/images/private/loginbg.jpg"),//打包时，直接下载新文件到对应位置，打到包中。
        companySysNo: 0,
        IOSAppID: "",// 从服务器配置中读取
        StyleColor: {
            TitleBackground: null, //标题栏背景
            TitleFront: null,//标题栏文字
            MainButtonBackground: null,//按钮背景
            MainButtonOnPressBackground: null,
            MainButtonFront: null,//按钮文字
            DisableButtonBackground: null, // 禁用按钮背景
            ContentFront: null, // 内容文字
            DescriptionFront: null, // 描述
            ImgBackgroundPageFront: null, // 有背景图的页面的文件颜色，如首页，登录页，注册页面
            PopupBackground: null,
            SelectedTapBackground: null,
            TabFront: null,
            HomePageA: {
                MenuFront: null,
                MenuItemPressBackground: null
            }
        },
        //如果color 中有opacity 的设置，将直接返回,否则要加上opacity。color格式:#000000到#FFFFFF之间的值,opacity格式:00到FF的值
        formatColor: function (color, opacity) {
            if (opacity == null || opacity == "") {
                if (color.length > 7) {
                    return color.substring(0, 7);
                }
                return color;
            }
            if (color.length > 7) { return color; }
            else { return color + opacity; }
        },
        isGeneral: function () {
            return CompanyAppConfig.CompanyID == '00000000-0000-0000-0000-000000000000';
        }
    }, CompanyAppConfig);

const CompanyConfig = global.CompanyConfig;


export const CompanyConfigHelper = {
    findParameterValueByName(parameters, name, hasHandler, noHandler) {
        name = new String(name).toLocaleLowerCase();
        for (let i = 0; i < parameters.length; i++) {
            let p = parameters[i];
            let pname = new String(p.Name).toLowerCase();
            if (pname == name) {
                if (hasHandler != null) {
                    hasHandler(p.Value);
                }
                break;
            }
        }
        if (noHandler != null) {
            noHandler();
        }
    },
    getFileName(path) {
        let tli = path.lastIndexOf('/');
        let filename = tli >= 0 ? path.substring(tli + 1) : path;
        return filename;
    },
    _getConfig(readyCallback, errorCallback) {
        global.storage.load({ key: "CompanyParameters" }).then(parameters => {
            CompanyConfigHelper.findParameterValueByName(parameters, "AppStyle", (v) => { CompanyConfig.AppStyle = v; });
            CompanyConfigHelper.findParameterValueByName(parameters, "IOSAppID", (v) => { CompanyConfig.IOSAppID = v; });
            CompanyConfigHelper.findParameterValueByName(parameters, "Compatibility", (v) => { CompanyConfig.Compatibility = v; });

            CompanyConfigHelper.findParameterValueByName(parameters, "PageBackground", (v) => { CompanyConfig.AppColor.PageBackground = v; });
            CompanyConfigHelper.findParameterValueByName(parameters, "Main", (v) => {
                CompanyConfig.AppColor.Main = v;
                CompanyConfig.AppColor.OnPressMain = CompanyConfig.formatColor(CompanyConfig.AppColor.Main, "b3");
            });
            CompanyConfigHelper.findParameterValueByName(parameters, "MainFront", (v) => { CompanyConfig.AppColor.MainFront = v; });
            CompanyConfigHelper.findParameterValueByName(parameters, "Secondary", (v) => {
                CompanyConfig.AppColor.Secondary = v;
                CompanyConfig.AppColor.OnPressSecondary = CompanyConfig.formatColor(CompanyConfig.AppColor.Secondary, "66");
            });
            CompanyConfigHelper.findParameterValueByName(parameters, "Warning", (v) => { CompanyConfig.AppColor.Warning = v; });
            CompanyConfigHelper.findParameterValueByName(parameters, "SecondaryFront", (v) => { CompanyConfig.AppColor.SecondaryFront = v; });
            CompanyConfigHelper.findParameterValueByName(parameters, "ContentFront", (v) => {
                CompanyConfig.AppColor.ContentFront = v;

                CompanyConfig.AppColor.Line = v;
                CompanyConfig.AppColor.OnPressLine = CompanyConfig.formatColor(CompanyConfig.AppColor.Line, "66");
            });
            CompanyConfigHelper.findParameterValueByName(parameters, "DescriptionFront", (v) => { CompanyConfig.AppColor.DescriptionFront = v; });
            CompanyConfigHelper.findParameterValueByName(parameters, "ButtonBg", (v) => { CompanyConfig.AppColor.ButtonBg = v; });
            CompanyConfigHelper.findParameterValueByName(parameters, "ButtonFront", (v) => { CompanyConfig.AppColor.ButtonFront = v; });
            CompanyConfigHelper.findParameterValueByName(parameters, "FocalFront", (v) => { CompanyConfig.AppColor.FocalFront = v; });
            CompanyConfigHelper.findParameterValueByName(parameters, "PopupBackground", (v) => { CompanyConfig.AppColor.PopupBackground = v; });
            CompanyConfigHelper.findParameterValueByName(parameters, "PopupFront", (v) => { CompanyConfig.AppColor.PopupFront = v; });
            CompanyConfigHelper.findParameterValueByName(parameters, "PopupBackgroundSelectedItem", (v) => { CompanyConfig.AppColor.PopupBackgroundSelectedItem = v; });

            CompanyConfig.StyleColor.TitleBackground = CompanyConfig.AppColor.Main; //标题栏背景
            CompanyConfig.StyleColor.TitleFront = CompanyConfig.AppColor.MainFront;//标题栏文字
            CompanyConfig.StyleColor.MainButtonBackground = CompanyConfig.AppColor.Main;//按钮背景
            CompanyConfig.StyleColor.MainButtonOnPressBackground = CompanyConfig.AppColor.OnPressMain;//按钮背景
            CompanyConfig.StyleColor.MainButtonFront = CompanyConfig.AppColor.MainFront;//按钮文字
            CompanyConfig.StyleColor.DisableButtonBackground = CompanyConfig.AppColor.DescriptionFront; // 禁用按钮背景
            CompanyConfig.StyleColor.ContentFront = CompanyConfig.AppColor.ContentFront; // 内容文字
            CompanyConfig.StyleColor.DescriptionFront = CompanyConfig.AppColor.DescriptionFront; // 描述
            CompanyConfig.StyleColor.ImgBackgroundPageFront = CompanyConfig.AppColor.MainFront; // 有背景图的页面的文件颜色，如首页，登录页，注册页面
            CompanyConfig.StyleColor.PopupBackground = CompanyConfig.AppColor.PopupBackground;
            CompanyConfig.StyleColor.PopupFront = CompanyConfig.AppColor.PopupFront;
            CompanyConfig.StyleColor.SelectedTapBackground = CompanyConfig.AppColor.Main;
            CompanyConfig.StyleColor.TabFront = CompanyConfig.AppColor.MainFront;
            CompanyConfig.StyleColor.HomePageA.MenuFront = CompanyConfig.AppColor.MainFront;
            CompanyConfig.StyleColor.HomePageA.MenuItemPressBackground = CompanyConfig.AppColor.OnPressSecondary;

            let plist = [];
            let imgNameList = []
            CompanyConfigHelper.findParameterValueByName(parameters, "CompanyBGImg", (v) => {
                if (v != null && v != "") {
                    // 如果名称相同，表示已经打到包中，则不用在线取得图片
                    var imgName = CompanyConfigHelper.getFileName(v).toLowerCase();
                    if (CompanyConfig["CompanyBGImg_Name"]) {
                        if (imgName == CompanyConfig["CompanyBGImg_Name"].toLowerCase()) {
                            return;
                        }
                    }
                    imgNameList.push("CompanyBGImg");
                    plist.push(FileHelper.fetchFile(v));
                    FileHelper.fetchFile(v);//.then(uri => {  if (uri != null && uri != "")  CompanyConfig.CompanyBGImg = { uri: uri }; });
                }
            });
            CompanyConfigHelper.findParameterValueByName(parameters, "CompanyBGImgWithLogo", (v) => {
                if (v != null && v != "") {
                    var imgName = CompanyConfigHelper.getFileName(v).toLowerCase();
                    if (CompanyConfig["CompanyBGImgWithLogo_Name"]) {
                        if (imgName == CompanyConfig["CompanyBGImgWithLogo_Name"].toLowerCase()) {
                            return;
                        }
                    }
                    imgNameList.push("CompanyBGImgWithLogo");
                    plist.push(FileHelper.fetchFile(v));
                    FileHelper.fetchFile(v);//.then(uri => { if (uri != null && uri != "") CompanyConfig.CompanyBGImgWithLogo = { uri: uri }; });
                }
            });
            CompanyConfigHelper.findParameterValueByName(parameters, "CompanyLogo", (v) => {
                if (v != null && v != "") {
                    var imgName = CompanyConfigHelper.getFileName(v).toLowerCase();
                    if (CompanyConfig["CompanyLogo_Name"]) {
                        if (imgName == CompanyConfig["CompanyLogo_Name"].toLowerCase()) {
                            return;
                        }
                    }
                    imgNameList.push("CompanyLogo");
                    plist.push(FileHelper.fetchFile(v));
                    FileHelper.fetchFile(v);//.then(uri => { if (uri != null && uri != "") CompanyConfig.CompanyLogo = { uri: uri }; });
                }
            });

            CompanyConfigHelper.findParameterValueByName(parameters, "LoginBGImg", (v) => {
                if (v != null && v != "") {
                    var imgName = CompanyConfigHelper.getFileName(v).toLowerCase();
                    if (CompanyConfig["LoginBGImg_Name"]) {
                        if (imgName == CompanyConfig["LoginBGImg_Name"].toLowerCase()) {
                            return;
                        }
                    }
                    imgNameList.push("LoginBGImg");
                    plist.push(FileHelper.fetchFile(v));
                    FileHelper.fetchFile(v);
                }
            });

            global.CompanyConfig = CompanyConfig;
            Promise.all(plist).then(r => {
                for (let i = 0; i < r.length; i++) {
                    let uri = r[i];
                    let imgName = imgNameList[i];
                    if (uri != null && uri != "") CompanyConfig[imgName] = { uri: uri };
                }
                global.CompanyConfigIsReady = true;
                global.CompanyConfig = CompanyConfig;
                if (readyCallback != null) {
                    readyCallback(CompanyConfig);
                }
            }).catch(e => {
                for (let i = 0; i < plist.length; i++) {
                    let imgName = imgNameList[i];
                    let p = plist[i];
                    (function (p, imgName) {
                        p.then(uri => {
                            if (uri != null && uri != "") CompanyConfig[imgName] = { uri: uri };
                        });
                    })(p, imgName);
                }
                global.CompanyConfigIsReady = true;
                global.CompanyConfig = CompanyConfig;
                if (readyCallback != null) {
                    readyCallback(CompanyConfig);
                }
            });
        }).catch((e) => {
            global.CompanyConfigIsReady = true;
            global.CompanyConfig = CompanyConfig;
            if (errorCallback != null) {
                errorCallback(CompanyConfig);
            }
        });
    },
    ready(readyCallback, errorCallback) {
        if (global.CompanyConfigIsReady) {
            if (readyCallback) {
                readyCallback(CompanyConfig);
            }
            return;
        }
        this._getConfig(readyCallback, errorCallback)
    },
    forceUpdate(readyCallback, errorCallback) {
        global.CompanyConfigIsReady = false;
        this.ready(readyCallback, errorCallback);
    }
}

if (CompanyConfig == null || CompanyConfig.CompanyID == null) {
    CompanyConfig = Object.assign({}, DefaultCompanyConfig);
    CompanyConfig.AppColor = Object.assign({}, DefaultCompanyConfig.AppColor);
    CompanyConfig.StyleColor = Object.assign({}, DefaultCompanyConfig.StyleColor);

    //CompanyConfig.formatColor = DefaultCompanyConfig.formatColor
    CompanyConfig.AppColor.OnPressMain = CompanyConfig.formatColor(CompanyConfig.AppColor.Secondary, "66");
    CompanyConfig.AppColor.OnPressSecondary = CompanyConfig.formatColor(CompanyConfig.AppColor.Secondary, "66");
    CompanyConfig.AppColor.OnPressLine = CompanyConfig.formatColor(CompanyConfig.AppColor.Line, "33");

    CompanyConfig.StyleColor.TitleBackground = CompanyConfig.AppColor.Main; //标题栏背景
    CompanyConfig.StyleColor.TitleFront = CompanyConfig.AppColor.MainFront;//标题栏文字
    CompanyConfig.StyleColor.MainButtonBackground = CompanyConfig.AppColor.Main;//按钮背景
    CompanyConfig.StyleColor.MainButtonOnPressBackground = CompanyConfig.AppColor.OnPressMain;//按钮背景
    CompanyConfig.StyleColor.MainButtonFront = CompanyConfig.AppColor.MainFront;//按钮文字
    CompanyConfig.StyleColor.DisableButtonBackground = CompanyConfig.AppColor.DescriptionFront; // 禁用按钮背景
    CompanyConfig.StyleColor.ContentFront = CompanyConfig.AppColor.ContentFront; // 内容文字
    CompanyConfig.StyleColor.DescriptionFront = CompanyConfig.AppColor.DescriptionFront; // 描述
    CompanyConfig.StyleColor.ImgBackgroundPageFront = CompanyConfig.AppColor.MainFront; // 有背景图的页面的文件颜色，如首页，登录页，注册页面
    CompanyConfig.StyleColor.PopupBackground = CompanyConfig.AppColor.PopupBackground;
    CompanyConfig.StyleColor.SelectedTapBackground = CompanyConfig.AppColor.Main;
    CompanyConfig.StyleColor.TabFront = CompanyConfig.AppColor.MainFront;
    CompanyConfig.StyleColor.HomePageA.MenuFront = CompanyConfig.AppColor.MainFront;
    CompanyConfig.StyleColor.HomePageA.MenuItemPressBackground = CompanyConfig.AppColor.OnPressSecondary;
    CompanyConfigHelper.ready();
}
export default CompanyConfig; 
