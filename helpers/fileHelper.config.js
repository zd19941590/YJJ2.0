/**
 * 文件帮助类
 * fetchFile(uri) 异步获取文件路径,uri文件相对路径
 * downloadFile(uri) 下载指定文件到sdcard/com.yjj, uri文件相对路径
 */
import RNFetchBlob from 'react-native-fetch-blob';
import EnvConfig from '../config/app.config.js';
import { Platform } from 'react-native';
import uuid from 'react-native-uuid'
import { completioness, compareMd5, md5StringFromPath, fileFromPath, md5Valid } from '../pages/common/FileManager'
import Common from '../services/common.js';
import Datadownload from '../services/datadownload.js';
import Constaints from '../config/Constaints';
import RNFS from "react-native-fs";
import * as FileManager from "../pages/common/FileManager";

/// Type definitions

type BooleanResultBlock = (result: {
  result?: Boolean,
  error?: Error,
}) => void;

type ArrayResultBlock = (result: {
  results?: Array,
  error?: Error,
}) => void;

const RegExpKey = /(\.png|\.jpg|\.jpeg|\.gif|\.bmp)$/

// FIXME:判断设备类型，获取平台存储文件夹
var rootDir = '';
if (Platform.OS == 'android') {
  rootDir = `${RNFetchBlob.fs.dirs.DocumentDir}/yjj`;
} else if (Platform.OS == 'ios') {
  rootDir = `${RNFetchBlob.fs.dirs.DocumentDir}/yjj`;
}

class FileHelper {
  constructor() {
    this._getFileUrl = this._getFileUrl.bind(this);
    this._getTempDir = this._getTempDir.bind(this);
    this._getTempPath = this._getTempPath.bind(this);
  }

  _getFileUrl(uri: String,size: Number) {
    let burl = EnvConfig.imageBaseUrl;
    let reg = new RegExp('[/\]+$');
    burl = burl.replace(reg, "");
    reg = new RegExp('^[/\]+', "i");
    uri = uri.replace(reg, "");
    if(size&&size>0){
      let  comboUrl  = this.getUrl(uri,size)
      return `${EnvConfig.imageBaseUrl+'/' + comboUrl}`;
    }
    uri = `${EnvConfig.imageBaseUrl + "/" + uri}`;
    return uri;
  }

  _getTempDir() {
    return rootDir + "/temp";
  }

  _getTempPath(uri: String) {
    let tli = uri.lastIndexOf('.');
    let extName = tli >= 0 ? uri.substring(tli) : uri;
    let fileName = uuid.v1() + extName;
    let path = this._getTempDir() + "/" + fileName;
    return path;
  }

  //组装文件本地地址 不论文件是否存在
  _getLocalPath(uri: String) {
    let tli = uri.lastIndexOf('/');
    let filename = tli >= 0 ? uri.substring(tli + 1) : uri;
    let path = `file://${rootDir}/${filename}`;
    return path;
  }
  async _checkFileIsYjjAndGetLoacUrl(uri: String, yjjrootPath: String, callback: (path: String) => void) {
    let self = this;
    if (uri == "" || uri == undefined || uri == null) {
      return "";
    }
    var tli = uri.lastIndexOf('/');
    let filename = tli >= 0 ? uri.substring(tli + 1) : uri;
    let path = `${yjjrootPath}/${filename}`;

    let exists = await RNFetchBlob.fs.exists(path);
    if (exists) {
      return `file://${path}`;
    } else {
      let fileUrl = self._getFileUrl(uri);
      return fileUrl;
    }
  }
  async _checkFileIsAndGetLoacUrl(uri: String, rootPath: String, callback: (path: String) => void) {
    let self = this;
    if (uri == "" || uri == undefined || uri == null) {
      return "";
    }

    if (!rootPath || !rootPath.length) {
      rootPath = rootDir;
    }

    var tli = uri.lastIndexOf('/');
    let filename = tli >= 0 ? uri.substring(tli + 1) : uri;
    let path = `${rootPath}/${filename}`;
    let exists = await RNFetchBlob.fs.exists(path);
    if (exists) {
      FileManager.md5Valid(path, "", true, (valid, error) => {
        if (valid) {
          callback(`file://${path}`);
        } else {
          let url = self._getFileUrl(uri);
          callback(url);
        }
      });
    } else {
      let url = self._getFileUrl(uri);
      callback(url);
    }
  }
  async GetLocalFileOrHttpUri(uri: String,callback: callback){
    let _this = this;
    if (uri == "" || uri == undefined || uri == null) {
      return "";
    }
    let reFetchUri = uri;
    var tli = uri.lastIndexOf('/');
    let filename = tli >= 0 ? uri.substring(tli + 1) : uri;
    let path = `${rootDir}/${filename}`;
    let filePath = `file://${path}`;
    let exists = await RNFetchBlob.fs.exists(path);
    let httpUri =  uri.toLowerCase().indexOf("http") >= 0 ? uri : this._getFileUrl(uri,1080);
    if(exists){
      md5Valid(filePath, "", true, (valid, error) => {
        if (valid) {
          return filePath;
        } else {
          return RNFS.unlink(path).then(() => {//如果md5比较错误 则删除这张图片
            this.fetchFile(reFetchUri);
            return httpUri;
          }).catch(() => {
            return httpUri;
          });
        }
      });
      return filePath;
    }else{
      if(callback){
        callback();
      }
      console.log(httpUri)
      return  httpUri;
    }
  }
  downloadImage(httpUri: String,uri:String){
    let extendNmae = uri.substring(httpUri.lastIndexOf('.') + 1);//文件扩展名
    let tempPath = this._getTempPath(uri);
    RNFetchBlob.config({
      // response data will be saved to this path if it has access right.
      fileCache: true,
      appendExt: extendNmae,
      path: tempPath,
      timeout: 60000 * 10,
      override: true,
    }).fetch('GET', httpUri, {
      //some headers ..
    }).then((result) => {
      if (typeof (result.respInfo) != 'undefined' && result.respInfo != null) {
        if (result.respInfo.rnfbEncode == "path") {
          // 表示返回的值是文件路径，同时下载成功；
          let tp = result.data; //表示文件路径
          if (tp == null || tp == "") {
            return RNFetchBlob.fs.unlink(tempPath).then(() => {
              return httpUri;
            }).catch(() => {
              return httpUri;
            });
          } else {
            return RNFetchBlob.fs.exists(tempPath).then((ise) => {
              if (ise) {
                /// TODO: Detect filepath format here.
                if (size == null || size == 0) {
                  // if (completioness(tempPath, filePath)) {}
                  return completioness(tempPath, filePath).then(function (r) {
                    if (r) {
                      return RNFetchBlob.fs.mv(tempPath, path).then(() => {
                        if (!size || size <= 0) {//如果是原图则 对下载的图片精选md5验证
                          md5Valid(filePath, "", true, (valid, error) => {
                            if (valid) {
                              return filePath;
                            } else {
                              return RNFetchBlob.fs.unlink(filePath).then(() => {//如果md5比较错误 则删除这张图片
                                return httpUri;
                              }).catch(() => {
                                return httpUri;
                              });
                            }
                          });
                        }
                        return filePath;
                      }).catch(() => {
                        return httpUri;
                      });
                    } else {
                      return RNFetchBlob.fs.unlink(tempPath).then(() => {
                        return httpUri;
                      }).catch(() => {
                        return httpUri;
                      });
                    }
                  }).catch(() => {
                    return httpUri;
                  });
                } else {

                  return RNFetchBlob.fs.mv(tempPath, path).then(() => {
                    return filePath;
                  }).catch(() => {
                    return httpUri;
                  });
                }
              }
              else {
                return httpUri;
              }
            }).catch(() => {
              return httpUri;
            });;
          }
        }
      }
      return httpUri;
    }).catch(() => {
      RNFetchBlob.fs.unlink(tempPath).then(() => {
        return httpUri;
      }).catch(() => {
        return httpUri;
      });  //下载失败  删除本地文件
    });
  }
  async fetchFile(uri: String, size: Number) {
      // return "http://img2.lixiantuce.com/yjj/1431/pdt/75b9d8005fffa67859daac2622aeb2a9.png";
    if (uri == "" || uri == undefined || uri == null) {
      return "";
    }

    let reFetchUri = uri;

    var tli = uri.lastIndexOf('/');
    let filename = tli >= 0 ? uri.substring(tli + 1) : uri;

    if (size && size > 0) {
      reg = /tn(\d+)\//i;
      let tn = filename;
      tn = "p" + size.toString() + "/" + tn;
      uri = uri.substring(0, tli + 1) + tn;
      filename = "p" + size.toString() + "_" + filename
    }

    let extendNmae = filename.substring(filename.lastIndexOf('.') + 1);//文件扩展名
    let path = `${rootDir}/${filename}`;

    let exists = await RNFetchBlob.fs.exists(path);
    let httpUri = uri.toLowerCase().indexOf("http") >= 0 ? uri : this._getFileUrl(uri);
    let filePath = `file://${path}`;
    let tempPath = this._getTempPath(uri);
    if (!exists) {
      let realPath = await RNFetchBlob.config({
        // response data will be saved to this path if it has access right.
        fileCache: true,
        appendExt: extendNmae,
        path: tempPath,
        timeout: 60000 * 10,
        override: true,
      }).fetch('GET', httpUri, {
        //some headers ..
      }).then((result) => {
        if (typeof (result.respInfo) != 'undefined' && result.respInfo != null) {
          if (result.respInfo.rnfbEncode == "path") {
            // 表示返回的值是文件路径，同时下载成功；
            let tp = result.data; //表示文件路径
            if (tp == null || tp == "") {
              return RNFetchBlob.fs.unlink(tempPath).then(() => {
                return httpUri;
              }).catch(() => {
                return httpUri;
              });
            } else {
              return RNFetchBlob.fs.exists(tempPath).then((ise) => {
                if (ise) {
                  /// TODO: Detect filepath format here.
                  if (size == null || size == 0) {
                    // if (completioness(tempPath, filePath)) {}
                    return completioness(tempPath, filePath).then(function (r) {
                      if (r) {
                        return RNFetchBlob.fs.mv(tempPath, path).then(() => {
                          if (!size || size <= 0) {//如果是原图则 对下载的图片精选md5验证
                            md5Valid(filePath, "", true, (valid, error) => {
                              if (valid) {
                                return filePath;
                              } else {
                                return RNFetchBlob.fs.unlink(filePath).then(() => {//如果md5比较错误 则删除这张图片
                                  return httpUri;
                                }).catch(() => {
                                  return httpUri;
                                });
                              }
                            });
                          }
                          return filePath;
                        }).catch(() => {
                          return httpUri;
                        });
                      } else {
                        return RNFetchBlob.fs.unlink(tempPath).then(() => {
                          return httpUri;
                        }).catch(() => {
                          return httpUri;
                        });
                      }
                    }).catch(() => {
                      return httpUri;
                    });
                  } else {

                    return RNFetchBlob.fs.mv(tempPath, path).then(() => {
                      return filePath;
                    }).catch(() => {
                      return httpUri;
                    });
                  }
                }
                else {
                  return httpUri;
                }
              }).catch(() => {
                return httpUri;
              });;
            }
          }
        }
        return httpUri;
      }).catch(() => {
        RNFetchBlob.fs.unlink(tempPath).then(() => {
          return httpUri;
        }).catch(() => {
          return httpUri;
        });  //下载失败  删除本地文件
      });
      return realPath;
    }
    if (!size || size <= 0) {//如果是原图则 对下载的图片进行md5验证
      md5Valid(filePath, "", true, (valid, error) => {
        if (valid) {
          return filePath;
        } else {
          return RNFS.unlink(path).then(() => {//如果md5比较错误 则删除这张图片
            this.fetchFile(reFetchUri);
            return httpUri;
          }).catch(() => {
            return httpUri;
          });
        }
      });
    }
    return filePath;
  }

  async downloadFileWithElm(elm: Object, unlinkIfInvalid: Boolean) {
    let size = elm.size;
    let uri = elm.path;
    let md5 = elm.md5;
    let hut = elm.hut;

    if (!uri || uri == '') {
      return '';
    }
    var tli = uri.lastIndexOf('/');
    let filename = tli >= 0 ? uri.substring(tli + 1) : uri;

    if (size && size > 0) {
      let tn = filename;
      tn = "p" + size.toString() + "/" + tn;

      uri = uri.substring(0, tli + 1) + tn;
      filename = "p" + size.toString() + "_" + filename
    }
    let extendNmae = filename.substring(filename.lastIndexOf('.') + 1);//文件扩展名
    let path = `${rootDir}/${filename}`;

    let exists = await RNFetchBlob.fs.exists(path);
    let httpUri = uri.toLowerCase().indexOf("http") >= 0 ? uri : this._getFileUrl(uri);
    let filePath = `file://${path}`;
    let tempPath = this._getTempPath(uri);

    if (!exists) {
      let realPath = await RNFetchBlob.config({
        // response data will be saved to this path if it has access right.
        fileCache: true,
        appendExt: extendNmae,
        path: tempPath,
        timeout: 60000 * 10,
      }).fetch('GET', httpUri, {
        //some headers ..
      }).then((result) => {
        if (result.respInfo) {
          if (result.respInfo.rnfbEncode == "path") {
            // 表示返回的值是文件路径，同时下载成功；
            let tp = result.data; //表示文件路径
            if (tp == null || tp == "") {
              return RNFetchBlob.fs.unlink(tempPath).then(() => {
                return httpUri;
              }).catch(() => {
                return httpUri;
              });
            } else {
              return RNFetchBlob.fs.exists(tempPath).then((ise) => {
                if (ise) {
                  let origin = (size == null || size == 0);
                  /// 有先根据hut字段做判断
                  if (hut) {
                    return RNFetchBlob.fs.mv(tempPath, path).then(() => {
                      return filePath;
                    }).catch(() => {
                      return httpUri;
                    });
                  } else {
                    return compareMd5(tempPath, filePath, origin, md5).then(function (r) {
                      if (r) {
                        return RNFetchBlob.fs.mv(tempPath, path).then(() => {
                          return filePath;
                        }).catch(() => {
                          return httpUri;
                        });
                      } else {
                        return RNFetchBlob.fs.unlink(tempPath).then(() => {
                          return httpUri;
                        }).catch(() => {
                          return httpUri;
                        });
                      }
                    }).catch(() => {
                      return httpUri;
                    });
                  }

                }
                else {
                  return httpUri;
                }
              }).catch(() => {
                return httpUri;
              });;
            }
          }
        }
        return httpUri;
      }).catch(() => {
        RNFetchBlob.fs.unlink(tempPath).then(() => {
          return httpUri;
        }).catch(() => {
          return httpUri;
        });  //下载失败  删除本地文件
      });
      return realPath;
    } else {
      if (unlinkIfInvalid) {
        md5Valid(path, md5, hut, (valid, error) => {
          if (!valid) {
            RNFS.unlink(path).then(() => {
              this.downloadFileWithElm(elm, true);
            }).catch(() => {
              return httpUri;
            });
          }
        });
      }
    }


    return filePath;
  }

  _downloadFile(uri: String) {
    if (uri == "" || uri == undefined || uri == null) {
      return;
    }

    let self = this;
    let reg = new RegExp('yjjv1[\/]', "i");
    let isV1 = reg.test(uri);

    var tli = uri.lastIndexOf('/');
    let filename = tli >= 0 ? uri.substring(tli + 1) : uri;
    //  let filename = uri.substring(uri.lastIndexOf('/') + 1);//文件名
    let extendNmae = filename.substring(filename.lastIndexOf('.') + 1);//文件扩展名
    let dirs = RNFetchBlob.fs.dirs;
    let path = `${rootDir}/${filename}`;

    if (isV1) {
      reg = new RegExp('^[/\]+', "i");
      let t1 = uri.replace(reg, "");
      path = `${rootDir}/${t1}`;
    }
    let tempPath = this._getTempPath(uri);

    RNFetchBlob.fs.exists(path).then((exists) => {

      if (!exists) {
        RNFetchBlob.config({
          // response data will be saved to this path if it has access right.
          fileCache: true,
          appendExt: extendNmae,
          path: tempPath
        }).fetch('GET', uri.toLowerCase().indexOf("http") >= 0 ? uri : this._getFileUrl(uri), {
          //some headers ..
        }).then((result) => {
          if (typeof (result.respInfo) != 'undefined' && result.respInfo != null && typeof (result.respInfo.status) != 'undefined') {
            if (result.respInfo.rnfbEncode == "path") {
              // 表示返回的值是文件路径，同时下载成功；
              let tp = result.data; //表示文件路径
              if (tp == null || tp == "") {
                RNFetchBlob.fs.unlink(tempPath);  //下载失败  删除本地文件
              }
              else {

                return RNFetchBlob.fs.exists(tempPath).then((ise) => {
                  if (ise) {
                    RNFetchBlob.fs.mv(tempPath, path);
                  }
                });
              }
            }
          }
        }).catch((error) => {
          RNFetchBlob.fs.unlink(tempPath);  //下载失败  删除本地文件
        })
      }
    }).catch((error) => {
    });
  }

  async  _downloadFileAsync(uri: String) {
    let filePath = await this.fetchFile(uri);
    return filePath;
  }

  downloadFile(uri: String) {

    if (uri == "" || uri == undefined || uri == null) {
      return;
    }

    var tli = uri.lastIndexOf('/');
    let filename = tli >= 0 ? uri.substring(tli + 1) : uri;
    // let filename = uri.substring(uri.lastIndexOf('/') + 1);//文件名
    let extendNmae = filename.substring(0, filename.lastIndexOf('.'));//文件扩展名
    let path = `${rootDir}/${filename}`;
    RNFetchBlob.fs.exists(rootDir).then((exists) => {
      if (!exists) { //路径不存在，新建文件路径
        RNFetchBlob.fs.mkdir(rootDir).then(() => {
          this._downloadFile(uri);
        })
      }
      else {
        this._downloadFile(uri);
      }
    }).catch(() => false);
  }

  async downloadFileAsync(uri: String) {
    try {
      if (uri == "" || uri == undefined || uri == null) {
        return;
      }

      var tli = uri.lastIndexOf('/');
      let filename = tli >= 0 ? uri.substring(tli + 1) : uri;
      // const filename = uri.substring(uri.lastIndexOf('/') + 1);//文件名
      let extendNmae = filename.substring(0, filename.lastIndexOf('.'));//文件扩展名

      let path = `${rootDir}/${filename}`;
      let exists = await RNFetchBlob.fs.exists(rootDir);

      if (!exists) { //路径不存在，新建文件路径
        await RNFetchBlob.fs.mkdir(rootDir);
        await this._downloadFileAsync(uri);
      } else {
        await this._downloadFileAsync(uri);
      }

    }
    catch (error) {

    }
  }

  downloadFileWithManager(uri: String) {
    var tli = uri.lastIndexOf('/');
    let filename = tli >= 0 ? uri.substring(tli + 1) : uri;
    // const filename = uri.substring(uri.lastIndexOf('/') + 1);
    let extendNmae = filename.substring(filename.lastIndexOf('.') + 1);//文件扩展名
    let path = `${rootDir}/${filename}`;
    RNFetchBlob.config({
      addAndroidDownloads: {
        useDownloadManager: true, // <-- this is the only thing required
        // Optional, override notification setting (default to true)
        notification: true,
        // Optional, but recommended since android DownloadManager will fail when
        // the url does not contains a file extension, by default the mime type will be text/plain
        mime: 'image/jpeg',
        description: 'File downloaded by download manager.'
      }
    }).fetch('GET', uri.toLowerCase().indexOf("http") >= 0 ? uri : this._getFileUrl(uri))
      .then((resp) => {
        // the path of downloaded file
        resp.path()
      }).catch((error) => {
        //    console.log(error);
      })
  }

  deleteTempFile(callback) {

    RNFetchBlob.fs.unlink(this._getTempDir()).then(() => {
      if (callback) callback();
    }).catch(() => {
      if (callback) callback();
    });
  }

  deleteAllFile(callback) {
    RNFetchBlob.fs.ls(rootDir).then((fileList) => {
      var pl = [];
      for (let i = 0; i < fileList.length; i++) {
        let file = fileList[i];
        let si = file.lastIndexOf('.');
        let extendName = si > 0 ? file.substring(si + 1) : "";//文件扩展名 
        // 数据文件不能删除，因为数据文件是在原生代码中创建的，这个删除后需要打开App才能生成，所以这里不能删除。
        if (extendName == "db" || extendName == "db-journal") {
          continue;
        }
        let p = RNFetchBlob.fs.unlink(rootDir + "/" + file);
        pl.push(p);
      }
      return Promise.all(pl);
    }).then(() => {
      if (callback) callback();
    }).catch(() => {
      if (callback) callback();
    });
  }
  deleteFileList(files,callback){
    if(files&&files.length>0){
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let si = file.lastIndexOf('.');
        let extendName = si > 0 ? file.substring(si + 1) : "";//文件扩展名 
        // 数据文件不能删除，因为数据文件是在原生代码中创建的，这个删除后需要打开App才能生成，所以这里不能删除。
        if (extendName == "db" || extendName == "db-journal") {
          continue;
        }
        let pathnameindex = file.lastIndexOf('/');
        pathname= si > 0 ? file.substring(pathnameindex + 1) : "";
        let p= RNFetchBlob.fs.unlink(rootDir + "/" + pathname);
        let p1 = RNFetchBlob.fs.unlink(rootDir + "/p450_" + pathname);
        let p2= RNFetchBlob.fs.unlink(rootDir + "/p120_" + pathname);
      }
    }
    if(callback)
    callback();
  }

  getFilePath(uri: String, size: Number) {
    if (uri == "" || uri == undefined || uri == null) {
      return "";
    }
    let self = this;
    // const dotLastIndex=uri.lastIndexOf('.');
    // const ext=uri.substring(dotLastIndex);
    // console.log(`fetch image from ${uri}`);

    var tli = uri.lastIndexOf('/');
    let filename = tli >= 0 ? uri.substring(tli + 1) : uri;
    let reg = new RegExp('yjjv1\/', "i");
    let isV1 = reg.test(uri);

    if (!isV1) {
      if (size && size > 0) {
        reg = /tn(\d+)\//i;
        let tn = filename;
        if (reg.test(uri)) {
          tn = "P" + size.toString() + "_" + tn;
        }
        else {
          tn = "p" + size.toString() + "/" + tn;
        }
        uri = uri.substring(0, tli + 1) + tn;
        filename = "p" + size.toString() + "_" + filename
      }
    }
    let path = `${rootDir}/${filename}`;
    if (isV1) {
      reg = new RegExp('^[/\]+', "i");
      let t1 = uri.replace(reg, "");
      path = `${rootDir}/${t1}`;
    }
    return path;

  }

  async fileHasDownLoad(uri) {
    var filepath = this.getFilePath(uri);
    let exists = await RNFetchBlob.fs.exists(filepath);
    return exists;
  }

  getUrl(uri: String, size: Number) {
    if (uri == "" || uri == undefined || uri == null) {
      return "";
    }
    var tli = uri.lastIndexOf('/');
    let filename = tli >= 0 ? uri.substring(tli + 1) : uri;
    let tn = filename;
    uri = uri.substring(0, tli + 1) + 'p' + size + '/' + tn;
    return uri;
  }

  fetchAndStoreImages(elms: Array, completeHandler: ?(done: Boolean, success: Array, failure: Array) => void) {
    if (!elms || !elms.length) {
      completeHandler(true, null);
      return;
    }

    let done = true;
    let success = [];
    let failure = [];

    elms.forEach((elm, idx) => {
      this.downloadFileWithElm(elm).then((uri) => {
        let failed = (uri.indexOf("http") == 0);
        if (!failed) {
          success.push(elm);
        } else {
          done = failed;
          failure.push(elm);
        }

        if ((idx + 1) == elms.length && completeHandler) {
          completeHandler(done, success, failure);
        }
      }).catch(() => {
        failure.push(elm);
        if ((idx + 1) == elms.length && completeHandler) {
          completeHandler(done, success, failure);
        }
      });
    });

  }

  menuReplicationDate = null;

  fetchStorageImagesWithMd5Parameter(completionHandler: FetchFileCompletionBlock) {
    this.storageHomeMenuImage(true, (results1, error) => {
      let results = [];
      if (!error) {
        results = this.filterHomeMenuImage(results1);
      } else {
        completionHandler(error);
        return;
      }

      this.fetchStorageImageIfNeeded(true, (results2, error) => {
        results2.forEach(elm => {
          results.push(elm);
        });
        completionHandler(results);
      });
    });
  }

  storageHomeMenuImage(cacheable: Boolean, completionHandler: ArrayResultBlock) {
    /// 首先获取全部菜单文件数据
    let downloader = new Datadownload();
    let service = new Common();

    let key = downloader.getMenuReplicationDateKey();
    global.storage.load({ key: key }).then(date => {
      this.menuReplicationDate = date;
    }).catch(() => {
      // Do nothing.
    });

    service.GetMenuList().then(result => {
      let results = result.data;
      let succeed = results.success;

      if (!succeed) {
        // 取得菜单失败，不作处理
      } else {
        if (cacheable) {
          global.storage.save({ key: "AppMenu", data: results });
        }
      }

      let vaule = new Date();
      global.storage.save({ key: key, data: vaule });
      completionHandler(results);

    }).catch((error) => {
      completionHandler(error);
    });
  }

  fetchStorageImageIfNeeded(filter: Boolean, completionHandler: ArrayResultBlock) {
    let key = Constaints.STORAGE_CHECK_UPDATE_TIME_ID_KEY();
    global.storage.load({ key: key }).then(ck => {
      if (!ck) {
        this.fetchStorageImage(filter, completionHandler);
      } else {
        completionHandler([], null);
      }
    }).catch(() => {
      global.storage.save({ key: key, data: false });
      this.fetchStorageImage(filter, completionHandler);
    });
  }

  fetchStorageImage(filter: Boolean, completionHandler: ArrayResultBlock) {
    let downloader = new Datadownload();
    let key = Constaints.STORAGE_CHECK_UPDATE_TIME_ID_KEY();

    let results = [];

    downloader.getAllFile((type, datas, finished) => {
      if (datas && datas.length) {
        datas.forEach(data => {
          if (filter) {
            let array = this.filterStorageImageIfNeeded(data, type, false);
            array.forEach(elm => {
              results.push(elm);
            });
          } else {
            results.push(data);
          }
        });
      }

      if (finished) {
        global.storage.save({ key: key, data: true });
        completionHandler(results);
      }

    }, (error) => {
      global.storage.save({ key: key, data: false });
      completionHandler(error);
    });
  }

  filterHomeMenuImage(datas: Array): Array {
    if (!datas || !datas.length) {
      return [];
    };

    let results = [];

    datas.forEach((elm, idx) => {
      let defaultImage = elm.DefaultImage;
      let children = elm.Children;
      let tempArray = [];

      if (defaultImage && defaultImage != '') {
        tempArray.push({
          Path: defaultImage,
        });
      }

      tempArray.forEach(child => {
        let array = this.filterStorageImageIfNeeded(child, 'menu', false);
        array.forEach(obj => {
          results.push(obj);
        });
      });

      if (children && children.length) {
        this.filterHomeMenuImage(children);
      }
    });

    return results;
  }

  /**
   * Filter the files that need to be download, this method provide origin images and both `120`/`450` image size filter.
   * You just need to change the `child` parameter to determine which function you want.
   * 
   * - `json`: Origin json object to be filtered.
   *
   * - `type`: Provide one of these ['product', 'productsolution', 'content', 'menu']
   *
   * - `child`: Should fileter `120` and `450` image, default is `true`
   * 
   * - `completionHandler`: Result callback.
   *
   */
  filterStorageImageIfNeeded(json: Object, type: String, child: Boolean): Array {
    if (!json) {
      return [];
    }

    let ps = json.ProductStatus, ss = json.ProductSolutionStatus
    let path = json.Path;
    let defaultImage = json.DefaultImage;
    let commonList = json.ProductCommonImageList;
    let commonDefaultImage = json.ProductCommonDefaultImage;
    let imageList = json.ImageList, fileList = json.FileList;
    let md5List = json.ImageMd5List;
    var datas = [];

    if (child) {
      if (md5List && md5List.length) {
        md5List.forEach(elm => {
          datas.push({
            path: elm.Path,
            md5: elm.Md5Value,
            size: elm.Size
          });
        });
      }
    }

    if ((type == 'product' && (ps == 10 || ps == 30)) ||
      (type == 'productsolution' && ss == 1)) {
      if (imageList && imageList.length) {
        imageList.forEach(elm => {
          datas.push({
            path: elm.Path
          });
        });
      }

      if (defaultImage && defaultImage.length) {
        if (child) {
          datas.push(
            {
              path: defaultImage
            }, {
              path: defaultImage,
              size: 120,
              hut: true
            }, {
              path: defaultImage,
              size: 450,
              hut: true
            });
        } else {
          datas.push({
            path: defaultImage
          });
        }
      }

      if (commonList && commonList.length) {
        commonList.forEach(elm => {
          datas.push({
            path: elm.Path
          });
        });
      }

      if (commonDefaultImage && commonDefaultImage.length) {
        if (child) {
          datas.push(
            {
              path: commonDefaultImage
            }, {
              path: commonDefaultImage,
              size: 120,
              hut: true
            }, {
              path: commonDefaultImage,
              size: 450,
              hut: true
            });
        } else {
          datas.push({
            path: commonDefaultImage
          });
        }
      }
    } else if (type == 'content' && json.TopicStatus == 1) {
      if (fileList && fileList.length && json.TopicContentType == 1) {
        fileList.forEach(elm => {
          datas.push({
            path: elm.Path
          });
        });
      }

      if (defaultImage && defaultImage != "") {
        if (child) {
          datas.push(
            {
              path: defaultImage
            }, {
              path: defaultImage,
              size: 450,
              hut: true
            });
        } else {
          datas.push({
            path: defaultImage
          });
        }

      }
    } else if (type == 'menu') {
      if (path && path.length) {
        datas.push({
          path: path
        })
      } else if (defaultImage && defaultImage.length) {
        datas.push({
          path: defaultImage
        });
      }
    }

    if (!datas.length) {
      return [];
    }

    datas.forEach((elm, idx) => {
      if (!RegExpKey.test(elm.path)) {
        datas.splice(idx, 1)
      }
    })

    let results = [];
    datas.forEach((elm) => {
      let path = elm.path;
      let md5 = elm.md5;
      let size = elm.size;
      let hut = elm.hut;

      if (!md5) {
        md5 = md5StringFromPath(path);
      }
      if (!size) {
        size = null;
      }
      if (!hut) {
        hut = false;
      }

      results.push({
        path: path,
        md5: md5,
        size: size,
        hut: hut
      });
    });

    return results;
  }

  /**
   * 判断文件完整性，如果文件不完整则移除且返回文件，如果不存在此文件则返回文件
   * @param {*} elms 
   * @param {*} completeHandler 
   *  valid: true表示所有文件均完整，false表示至少有一个文件不完整
   *  caches：存放的需要重新下载的文件
   */
  judgeInvalidImages(elms: Array, completeHandler: ?(valid: Boolean, caches: Array) => void) {
    if (!elms || !elms.length) {
      completionHandler(true, null);
      return;
    }

    let valid = true;
    let caches = [];

    let count = 0;

    elms.forEach((elm, idx) => {
      let path = elm.path;
      let md5 = elm.md5;
      let hut = elm.hut;
      let name = fileFromPath(path);
      let dir = `${rootDir}/${name}`;

      count++;

      md5Valid(dir, md5, hut, (result, error) => {
        if (error || !result) {
          valid = false;
          caches.push(elm);

          // 图片存在但是不完整，先将此文件移除然后暂存此文件
          RNFS.unlink(dir).then(() => {
            count--;
            if ((count == 0) && (idx + 1 == elms.length) && completeHandler) {
              completeHandler(valid, caches);
            }
          }).catch(() => {
            count--;
            if ((count == 0) && (idx + 1 == elms.length) && completeHandler) {
              completeHandler(valid, caches);
            }
          })

        } else {
          count--;
          if ((count == 0) && (idx + 1 == elms.length) && completeHandler) {
            completeHandler(valid, caches);
          }
        }

      });
    });
  }

}

async function remove(dir): Promise<void> {
  const installation = await RNFS.unlink(dir);
  await installation;
}

// const remove = await;

export default new FileHelper();