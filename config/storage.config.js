import Storage from 'react-native-storage';
import { AsyncStorage } from 'react-native';
import FileHelper from '../helpers/fileHelper.config.js';
import CompanyAppConfig from './company.app.js';

import CommonService from '../services/common.js';

function saveMenuImage(menuList) {
  if (menuList == null || menuList.length == 0) return;
  for (let i = 0; i < menuList.length; i++) {
    let menu = menuList[i];
    FileHelper.downloadFile(menu.DefaultImage);
    FileHelper.downloadFile(menu.MouseOverImage);
    saveMenuImage(menu.Children);
  }
}
// 使用文档地址 https://github.com/sunnylqm/react-native-storage/blob/master/README-CHN.md
export default storage = new Storage({
  // 最大容量，默认值1000条数据循环存储
  size: 1000,

  // 存储引擎：对于RN使用AsyncStorage，对于web使用window.localStorage
  // 如果不指定则数据只会保存在内存中，重启后即丢失
  storageBackend: AsyncStorage,

  // 数据过期时间，默认一整天（1000 * 3600 * 24 毫秒），设为null则永不过期
  // defaultExpires: 8640000000,//1000*3600*24*100
  defaultExpires:null,
  // 读写时在内存中缓存数据。默认启用。
  enableCache: true,

  // 如果storage中没有相应数据，或数据已过期，
  // 则会调用相应的sync方法，无缝返回最新数据。
  // sync方法的具体说明会在后文提到
  // 你可以在构造函数这里就写好sync的方法
  // 或是在任何时候，直接对storage.sync进行赋值修改
  // 或是写到另一个文件里，这里require引入
  sync: {
    AppMenu(params) {
      let { id, resolve, reject } = params;
      let service = new CommonService();
      service.GetMenuList().then(requestObj => {
        var menuList = requestObj.data;
        if (typeof (menuList.success) != undefined && menuList.success == false) {
          // storage.remove({ key: "AppMenu" });
          if (reject) {
            reject(menuList);
          }
        } else {
          storage.save({ key: "AppMenu", data: menuList });
          saveMenuImage(menuList);
          if (resolve) {
            resolve(menuList);
          }
        }
      }).catch(error => {
        if (reject) {
          reject(error);
        }
      });
    },
    CompanyParameters(params) {
      let { id, resolve, reject } = params;
      let service = new CommonService();

      service.GetCompanyParameters().then(requestObj => {
        var cparameters = requestObj.data;
        if (typeof (cparameters.success) != undefined && cparameters.success == false) {
          if (reject) {
            reject(cparameters);
          }
        } else {
          storage.save({ key: "CompanyParameters", data: cparameters});
          if (resolve) {
            resolve(cparameters);
          }
        }
      }).catch((error) => {
        if (reject) {
          reject(error);
        }
      });
    },
    DataDownloadAlert(params) {
      let { id, resolve, reject } = params;
      //0：表示未提示， 1:表示稍后提示（应用启动时提示）,2:表示不再提示
      storage.save({ key: "DataDownloadAlert", data: 0 , expires: 86400000 });
      if (resolve) {
        resolve(0);
      }
    },
    AppUpdateAlert(params) {
      let { id, resolve, reject } = params;
      //0：表示未提示， 1:表示稍后提示（应用启动时提示） 
      storage.save({ key: "AppUpdateAlert", data: 0 , expires: 86400000});
      if (resolve) {
        resolve(0);
      }
    }
  }
});

// if (CompanyAppConfig.isGeneral()) {
//   let authentication = global.AppAuthentication;
//   let authid = null;
//   if (authentication) {
//     authid = authentication.AppCompanyID;
//   }
//   if (!(authid == null || authid == "" || authid == "00000000-0000-0000-0000-000000000000")) {
//     storage.load({ key: "CompanyParameters" });
//   }
// }