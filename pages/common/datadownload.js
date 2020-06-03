import React, { Component, PureComponent } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import DataDownloadService from '../../services/datadownload.js';
import CompanyConfig from '../../config/company.config.js';
import FileHelper from '../../helpers/fileHelper.config.js';
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme';
import CustomHeader from '../../components/CustomHeader.js';
import SvgUri from '../../components/svguri.js';
import OperationMessage from '../../components/OperationMessage.js';
import CommonService from '../../services/common.js';
import { unique, fileFromPath } from "./FileManager";
import constaints from "../../config/Constaints";
import KeepAwake from "react-native-keep-awake";
import { md5StringFromPath } from "./FileManager";
import DictionaryService from '../../services/dictionary.js';
import iCloudHelper from '../../ios/ThirdParty/RCT/RCTiCloudHelper';

let styles = null;
const TIMES = 99999999;

const resetActionToHome = NavigationActions.reset({
  index: 0,
  actions: [
    NavigationActions.navigate({ routeName: 'Home' })
  ]
});

const RegExpKey = /(\.png|\.jpg|\.jpeg|\.gif|\.bmp)$/

export default class DataDownload extends PureComponent {
  constructor() {
    super();

    this.state = {
      operation: "updating",
      updating: false,
      excuting: false,

      updatingComplete: false,
      excutionComplete: false,

      hasWarning: false,

      dataCount: 0,
      saveCount: 0,
      isDownloadData: false
    };

    this.downloader = new DataDownloadService();
    this.showError = this.showError.bind(this);
    this.updateState = this.updateState.bind(this);
    this.rowDataSaved = this.rowDataSaved.bind(this);
    this.getMenuImage = this.getMenuImage.bind(this);
    this.getAllMenuImage = this.getAllMenuImage.bind(this);
    this.getLocalAllFileData = this.getLocalAllFileData.bind(this);
    this.checkAllFile = this.checkAllFile.bind(this);
  }

  /// 这个对象存储了所有与数据更新相关的信息
  data = {
    isDownloadData: false, //表示是否正在更新数据
    total: 0, // 进入下载页面，点击暂停前取得的数据条数
    dataCount: 0,  // 进入下载页面或暂停后，点击开始下载取得需要更新最新的数据条数
    saveCount: 0,  // 在取得最新更新数据数据上，已经更新的数据条数
    completionProduct: true,
    completionSolution: true,
    completionContent: true
  };

  /// 描述：这个对象存储了所有与文件下载相关的信息，其中有几个参数：
  /// 参数`files` 最重要的属性，表示所有需要下载的文件数组，当有新文件/某个文件下载完/本地存储文件进度时，都是更新的这个数组
  /// 参数`current` 表示当前正在下载的文件，此属性值为`文件名.文件格式`
  file = {
    files: [],
    total: 0,
    success: 0,
    failure: 0,
    current: ""
  }

  downloader;
  menuReplicationDate = null;

  renderProcess() {
    let files = this.file.files;
    let total = this.file.total;
    let success = this.file.success;
    let failure = this.file.failure;
    let current = this.file.current;

    let message = "请稍后...";
    let saved = this.data.saveCount;
    let count = this.data.dataCount;

    let operation = this.state.operation;
    let updating = (operation == "updating");

    let ratio = (count) ? (parseFloat(saved / count).toFixed(2)) : 0;
    let process = `${(ratio * 100).toFixed(0)}%`;

    if (updating) {
      if (count) {
        message = `共有 ${count} 条数据需要更新，已经更新 ${saved} 条`;
      }
    } else {
      if (files.length) {
        message = `共有 ${total} 个文件需要更新，更新成功 ${success} 个\n正在更新 ${current} `;
        process = `${(success / total * 100).toFixed(0)}%`;
      } else {
        let key = constaints.STORAGE_CHECK_UPDATE_TIME_ID_KEY(); // 存储新版本流程走过标识key
        global.storage.save({ key: key, data: true });
        this.state.excuting = false;
      }
    }

    if (process == '100') {
      this.downloader.checkData();
      message = "数据校验中...请稍后...";
    }
    if (this._indicator) {
      this._indicator.setNativeProps({
        process: process,
        hint: message
      });
    }

    this.backIfNeeded();
  }

  render() {
    setStyle();

    let saved = this.data.saveCount;
    let count = this.data.dataCount;

    let ratio = (count) ? (parseFloat(saved / count).toFixed(2)) : 0;
    let display = (ratio != 1);
    let pause;

    if (display) {
      pause = (
        <TouchableOpacity
          onPress={_ => this.onResumePressed()}
          style={styles.controlContainer}
          activeOpacity={0.8}
          underlayColor={CompanyConfig.AppColor.Main}
        >
          <OperationImage ref={c => (this._resume = c)} parent={this} />
        </TouchableOpacity>
      )
    }

    return (
      <ImageBackground style={styles.bgimg} source={CompanyConfig.CompanyBGImg} >
        <OperationMessage ref={c => (this._messageBar = c)} />
        <CustomHeader navigation={this.props.navigation} leftButtonOnPress={() => this.backAction()} />
        <View style={styles.container}>
          <ProgressIndicator
            ref={c => (this._indicator = c)}
            style={styles.indicator}
            processStyle={styles.process}
            hintStyle={styles.hint}
          />
          <AnimatedWap ref="animate" />
          {pause}
        </View>
      </ImageBackground>);
  }

  // MARK: - Life Circle

  componentDidMount() {
    this.fetchUndownloadedFileList();

    let service = new DictionaryService();
    let downloader = this.downloader;

    downloader.GetDictionaryData().then(function (result) {
      let rd = result.data;
      let data = service.resetModelData(rd);
      downloader.SaveDictionaryDataToLocation(rd);
      service.saveConditionDbDataToStorage(data);
    });

    this.downloadData();
  }

  componentWillMount() {
    KeepAwake.activate();
  }

  componentWillUnmount() {
    KeepAwake.deactivate();
  }

  onResumePressed() {
    if (this.state.operation == "updating") {
      this.state.updating = !this.state.updating;
      this._resume.change(this.state.updating);
    } else {
      this.state.excuting = !this.state.excuting;
      this._resume.change(this.state.excuting);
    }

    this.cacheUndownloadedFileList();
    this.updateDownload();
  }

  updateDownload() {
    let operation = this.state.operation;
    let updating = this.state.updating;
    let excuting = this.state.excuting;

    if (operation == "updating") {
      if (updating) {
        this.downloadData();
      }
    } else {
      if (excuting) {
        this.downloadFilesRolling();
      }
    }
  }

  downloadData() {
    this.state.operation = "updating";
    this.state.updating = true;
    this.downloader.DeleteNoPermissionProductData();

    let self = this;
    let menuUpdateKey = self.downloader.getMenuReplicationDateKey();
    global.storage.load({ key: menuUpdateKey }).then(d => {
      self.menuReplicationDate = d;
    }).catch(_ => {
      self.menuReplicationDate = null;
    });

    this.getAllMenuImage(() => {
      self.checkAllFile(() => {
        self.downloader.onlyDownloadData(true, null, self.rowDataSaved, self.showError);
      });
    });
  }

  getAllMenuImage(callbackHandler) {
    let self = this;
    let cService = new CommonService();
    cService.GetMenuList().then(response => {
      let menus = response.data;
      if (menus && menus.length) {
        this.getMenuImage(menus);
        global.storage.save({ key: "AppMenu", data: menus });
      }
      let menuUpdateKey = self.downloader.getMenuReplicationDateKey();
      global.storage.save({ key: menuUpdateKey, data: new Date() });
      if (callbackHandler) {
        callbackHandler();
      }
    }).catch(() => {
      if (callbackHandler) {
        callbackHandler();
      }
    });
  }

  getMenuImage(menus) {
    if (!menus || !menus.length) {
      return
    };

    let array = [];
    menus.forEach((menu, idx) => {
      let children = menu.Children;
      let defaultImage = menu.DefaultImage;
      let editDate = !menu.EditDate || menu.EditDate == "" ? null : new Date(menu.EditDate);
      let rDate = !this.menuReplicationDate ? null : new Date(this.menuReplicationDate);
      if ((editDate > rDate) &&
        defaultImage && defaultImage.length) {
        array.push({ Path: defaultImage });
      }
      if (children && children.length) {
        this.getMenuImage(children);
      }
    });

    array.forEach(elm => {
      this.filterFilesToBeDownload(elm, "menu");
    })
  }

  getLocalAllFileData(completeHandler) {
    let self = this;
    let dlService = self.downloader;
    let key = constaints.STORAGE_CHECK_UPDATE_TIME_ID_KEY();
    dlService.getAllFile(
      function (dataType, list, isCompleted) {
        if (list != null) {
          for (let i = 0; i < list.length; i++) {
            entity = list[i];
            self.filterFilesToBeDownload(entity, dataType);
          }
        }
        if (isCompleted == true) {
          global.storage.save({ key: key, data: true });
          if (completeHandler) completeHandler();
        }
      },
      function () {
        global.storage.save({ key: key, data: false });
        if (completeHandler) completeHandler();
      }
    );
  }

  /// 为兼容数据下载时新版本和旧版本以及确保新版本之前的用户更新数据能够全部更新完整，现增加数据完整性校验功能
  /// 用户更新数据时机分为以下几种情况(以下情况只适用于假定用户拿到的是最新版，旧版本不在考虑范围)：
  /// 一、旧版本
  ///   1、用户没有做过数据更新，则不考虑数据完整性，直接更新；
  ///   👉 2、用户更新过，则测试客户端不会提示用户更新数据，数据更新时也不会把未下载的数据下载。
  /// 二、新版本
  ///   1、用户没有做过数据更新，则不考虑数据完整性，直接更新；
  ///   2、数据为最新，不考虑。
  checkAllFile(completeHandler) {
    let self = this;
    let key = constaints.STORAGE_CHECK_UPDATE_TIME_ID_KEY();
    global.storage.load({ key: key }).then(ck => {
      if (!ck) {
        self.getLocalAllFileData(completeHandler);
      }
      else {
        if (completeHandler) completeHandler();
      }
    }).catch(() => {
      global.storage.save({ key: key, data: false });
      self.getLocalAllFileData(completeHandler);
    });
  }

  async rowDataSaved(dataType, entity, downloader) {
    let _total = downloader.total;
    let total = this.data.total;

    let _saved = downloader.saveCount;

    if (total == 0) {
      this.data.total = _total;
    }
    if (total == _total) {
      this.data.saveCount = _saved;
    } else {
      this.data.saveCount = total - _total + _saved;
    }
    if (this.data.saveCount < 0) {
      this.data.saveCount = 0;
    }
    this.data.dataCount = total;

    this.data.isDownloadData = true;
    this.data.completionProduct = downloader.completionProduct;
    this.data.completionSolution = downloader.completionSolution;
    this.data.completionContent = downloader.completionContent;

    this.filterFilesToBeDownload(entity, dataType);

    this.updateState(this.data);
    return this.state.updating;
  }

  filterFilesToBeDownload(json: Object, type: String) {
    if (json == null || json == undefined) {
      return;
    }

    let ps = json.ProductStatus, ss = json.ProductSolutionStatus
    let path = json.Path;
    let defaultImage = json.DefaultImage;
    let commonList = json.ProductCommonImageList;
    let commonDefaultImage = json.ProductCommonDefaultImage;
    let imageList = json.ImageList, fileList = json.FileList;
    let md5List = json.ImageMd5List;
    var datas = [];

    if (md5List && md5List.length) {
      md5List.forEach(elm => {
        datas.push({
          path: elm.Path,
          md5: elm.Md5Value,
          size: elm.Size
        });
      });
    }

    if ((type == "product" && (ps == 10 || ps == 30)) ||
      (type == "productsolution" && ss == 1)) {
      if (imageList && imageList.length) {
        imageList.forEach(elm => {
          datas.push({
            path: elm.Path
          });
        });
      }

      if (defaultImage && defaultImage.length) {
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
      }

      if (commonList && commonList.length) {
        commonList.forEach(elm => {
          datas.push({
            path: elm.Path
          });
        });
      }

      if (commonDefaultImage && commonDefaultImage.length) {
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
          }
        );
      }
    } else if (type == "content" && json.TopicStatus == 1) {
      if (fileList && fileList.length && json.TopicContentType == 1) {
        fileList.forEach(elm => {
          datas.push({
            path: elm.Path
          });
        });
      }
      if (defaultImage && defaultImage != "") {
        datas.push(
          {
            path: defaultImage
          }, {
            path: defaultImage,
            size: 450,
            hut: true
          });
      }
    } else if (type == "menu") {
      if (path != null && path.length) {
        datas.push({
          path: path
        })
      } else if (defaultImage && defaultImage.length) {
        datas.push({
          path: defaultImage
        });
      }
    }

    datas.forEach((elm, idx) => {
      if (!RegExpKey.test(elm.path)) {
        datas.splice(idx, 1)
      }
    })

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

      this.file.files.push({
        path: path,
        md5: md5,
        size: size,
        hut: hut
      });
    })


  }

  downloadFilesRolling() {
    if (!this.state.excuting) {
      return;
    }

    let files = this.file.files;
    if (files.length == 0) {
      return;
    }

    let elm = files[0];
    this.startDownloadFile(elm);
  }

  // MARK: - 增加了超时时间设置
  timeoutPromise(promise: Promise, timoutInterval: number) {
    var timeout = new Promise(function (resolve) {
      setTimeout(resolve, timoutInterval);
    }).then(function () {
      return Promise.reject(new Error('Operation timed out after ' + timoutInterval + ' ms'));
    });
    return Promise.race([promise, timeout]);
  }

  async startDownloadFile(elm: Object) {
    if (!this.hasWarning) {
      this._messageBar.show("文件下载过程中，您可以返回其他界面，并不影响App正常使用", 2);
      this.hasWarning = true;
    }
    this.file.current = fileFromPath(elm.path);

    /// Set 30 seconds timeout.
    this.timeoutPromise(FileHelper.downloadFileWithElm(elm, true), 30000)
      .then((result) => {
        let isRemotePath = result.indexOf("http") == 0
        if (!isRemotePath) {
          if (Platform.OS === 'ios') {
            iCloudHelper.voidBackup(result);
          }

          // this.file.failure = 0;
          this.file.success += 1;
          this.file.files.splice(0, 1);
        }
        else {
          this.file.failure = this.file.failure + 1;
          let t = this.file.files[0];
          this.file.files.splice(0, 1);
          this.file.files.push(t);
        }

        /// 注意：此方法如果频繁操作会导致内存急剧升高，所以在这里做了判断
        /// 每插入100条数据的时候进行一次数据存储以及当数据更新完之后再进行一次存储
        let shouldCache = (this.file.files.length % 100) == 0;
        if (shouldCache) {
          this.cacheUndownloadedFileList();
        }

        this.renderProcess();

        let mtm = (this.file.files.length == 0) ? 0 : (this.file.failure / this.file.files.length);
        if (this.file.files.length) {
          if (mtm < 1) {
            this.downloadFilesRolling();
          } else {
            this.cacheUndownloadedFileList();
            this.props.navigation.dispatch(resetActionToHome);
          }
        }
      })
      .catch(() => {
        this.file.failure = this.file.failure + 1;
        let t = this.file.files[0];
        this.file.files.splice(0, 1);
        this.file.files.push(t);

        this._messageBar.show("您的网络环境很差，建议更换网络环境或者网络通畅后更新！", 2);
        this.downloadFilesRolling();
      });
  }

  finishDownloadFiles(): Boolean {
    let finished = this.finishDownloadData();
    let files = this.file.files;
    let total = this.file.total;
    let success = this.file.success;
    let failure = this.file.failure;

    if (!finished) {
      return finished;
    }

    if (files.length) {
      return false;
    };

    finished = (total == success + failure);
    return finished;
  }

  finishDownloadData(): Boolean {
    let completionContent = this.data.completionContent;
    let completionProduct = this.data.completionProduct;
    let completionSolution = this.data.completionSolution;

    return (completionContent
      && completionProduct
      && completionSolution);
  }

  lastInUpdateDateTime = null;

  updateState(newState) {
    let completion = this.finishDownloadData();
    let files = this.file.files;

    let completionContent = this.data.completionContent;
    let completionProduct = this.data.completionProduct;
    let completionSolution = this.data.completionSolution;

    this.data.dataCount = newState.dataCount;
    this.data.saveCount = newState.saveCount;
    this.data.isDownloadData = newState.isDownloadData;
    let downloadCompleted = (
      completionContent &&
      completionProduct &&
      completionSolution
    );
    this.state.updatingComplete = downloadCompleted;

    // TODO: 现在优先更新数据，然后再更新菜单。当菜单更新完了再去做去重以及下载图片操作
    // 在这里做了判断，取了一个不是方法的方法，如果数据之前更新完了那么不更新菜单，
    // 只要数据需要更新的条数 > 0，那么就更新菜单.
    if (completion && files.length && !this.state.excuting) {
      this.getAllMenuImage(() => {
        this.file.files = unique(files)
        this.file.total = this.file.files.length;

        this.state.operation = "excuting";
        this.state.excuting = true;
        this.state.updating = false;

        this.cacheUndownloadedFileList();
        this.downloadFilesRolling();
      });
    }

    this.renderProcess();
  }

  fetchUndownloadedFileList() {
    let key = constaints.STORAGE_FILE_DOWNLOAD_LIST_ID_KEY();
    global.storage.load({ key: key })
      .then(results => {
        if (results == null) {
          results = [];
        }
        this.file.files = results;
      }).catch(_ => { });
  }

  cacheUndownloadedFileList() {
    let key = constaints.STORAGE_FILE_DOWNLOAD_LIST_ID_KEY();
    // console.log('🔴 ' + key);
    global.storage.save({ key: key, data: this.file.files });
  }

  showError(error) {
    if (error == null || error == "") {
      error = "数据更新出错,请联网后重试，是否回到首页？";
    }

    Alert.alert("数据更新提示", error, [
      { text: '取消', style: 'cancel' },
      {
        text: '确定', onPress: () => {
          this.props.navigation.dispatch(resetActionToHome);
        }
      }
    ]);
  }

  backIfNeeded() {
    let operation = this.state.operation;

    if (operation == "updating") {
      let files = this.file.files;
      if (this.finishDownloadData() && !files.length) {
        this.back();
      }
    } else {
      let finished = this.finishDownloadFiles();
      if (finished) {
        this.back();
      }
    }
  }

  back() {
    this.cacheUndownloadedFileList();

    this.state.updating = false;
    this.state.excuting = false;

    this.props.navigation.dispatch(resetActionToHome);
  }

  backAction() {
    this.cacheUndownloadedFileList();

    this.state.updating = false;
    this.state.excuting = false;

    this.props.navigation.goBack();;
  }
}

class ProgressIndicator extends PureComponent {
  constructor() {
    super();
    this.state = {
      process: "0%",
      hint: "请稍后..."
    }
  }

  setNativeProps = (props) => {
    this.setState({
      process: props.process,
      hint: props.hint
    });
  }

  render() {
    return (
      <View style={[indicatorStyle.container, this.props.style]}>
        <Text style={[this.props.processStyle]}>{this.state.process}</Text>
        <Text style={[this.props.hintStyle]}>{this.state.hint}</Text>
      </View >
    )
  }
}

export class OperationImage extends Component {
  _root;
  constructor(props) {
    super(props);
    this.state = {
      start: true
    };
  }

  change(isDownloading) {
    this.setState({
      start: isDownloading
    });
  }

  stopAn() {
    let parent = this.props.parent
    parent.refs['animate'].setToStop();
  }

  startAn() {
    let parent = this.props.parent
    if (parent.refs['animate']) {
      parent.refs['animate'].startAn();
    }
  }

  render() {
    setStyle();
    let stopImg = "stop";
    let startImg = "start";
    let controlImg = null;
    if (this.state.start) {
      controlImg = stopImg;
      this.startAn();
    }
    else {
      controlImg = startImg;
      this.stopAn();
    }
    let sizeWidth = getResponsiveValue(60);
    return (
      <View >
        <SvgUri width={sizeWidth} height={sizeWidth} fill={CompanyConfig.AppColor.ContentFront} source={controlImg} />
      </View>
    );
  }
}

export class AnimatedWap extends Component {
  _animated;
  constructor(props) {
    super(props);
    this.state = {
      rotateValue: new Animated.Value(0),
      rotateValueMini: new Animated.Value(0),
      toValue: 360,
      isStop: false
    };
  }

  setToStop() {
    Animated.parallel([
      Animated.timing(this.state.rotateValue, {
        toValue: this.state.toValue * TIMES,
        duration: 2160 * TIMES,
        easing: Easing.linear
      }),
      Animated.timing(this.state.rotateValueMini, {
        toValue: 0 * TIMES,
        duration: 2160 * TIMES,
        easing: Easing.linear
      })
    ]).stop();
  }

  startAn() {
    Animated.parallel([
      Animated.timing(this.state.rotateValue, {
        toValue: this.state.toValue * TIMES,
        duration: 2160 * TIMES,
        easing: Easing.linear
      }),
      Animated.timing(this.state.rotateValueMini, {
        toValue: -this.state.toValue * TIMES,
        duration: 800 * TIMES,
        easing: Easing.linear
      })
    ]).start();
  }

  UNSAFE_componentWillMount() {
    if (this.state.isStop) {
      this.setState({
        toValue: 0
      });
    }
  }

  componentDidMount() {
    this.startAn();
  }

  render() {
    setStyle();
    let width = getResponsiveValue(360);
    let height = getResponsiveValue(360);

    return (
      <View style={{ width: getResponsiveValue(360), height: getResponsiveValue(360) }}>
        <Animated.View
          style={[{
            transform: [{
              rotate: this.state.rotateValue
                .interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] })
            }]
          }]}>
          <View ><SvgUri width={width} height={height} fill={CompanyConfig.AppColor.SecondaryFront} source="loading2" /></View>
        </Animated.View>
        <Animated.View
          style={[{ position: "absolute" }, {
            transform: [{
              rotate: this.state.rotateValueMini
                .interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] })
            }]
          }]}>
          <View ><SvgUri width={width} height={height} fill={CompanyConfig.AppColor.SecondaryFront} source="loading1" /></View>
        </Animated.View>
      </View>
    )
  }
}

function setStyle() {
  if (styles != null && !CompanyConfig.isGeneral()) return styles;
  styles = StyleSheet.create({
    bgimg: {
      flex: 1,
      flexDirection: "row",
      alignItems: 'center',
      justifyContent: 'center'
    },

    container: {
      flexDirection: "column",
      position: "absolute",
      alignItems: 'center',
      justifyContent: 'center',
      width: getResponsiveValue(900),
      top: getResponsiveValue(130)
    },

    process: {
      position: "absolute",
      top: getResponsiveFontSize(150),
      fontSize: getResponsiveFontSize(50),
      color: CompanyConfig.AppColor.SecondaryFront,
      width: getResponsiveValue(200),
      textAlign: 'center',
      fontWeight: '500'
    },

    hint: {
      position: "absolute",
      fontSize: getResponsiveFontSize(24),
      height: getResponsiveValue(75),
      width: getResponsiveValue(900),
      textAlign: "center",
      textAlignVertical: "center",
      color: CompanyConfig.AppColor.ContentFront,
      bottom: 0
    },

    indicator: {
      position: "absolute",
      top: 0,
      bottom: 0,
      width: getResponsiveValue(900),
      height: getResponsiveValue(460)
    },

    controlContainer: {
      marginTop: getResponsiveValue(110),
      height: getResponsiveValue(80),
      width: getResponsiveValue(80),
      borderRadius: getResponsiveValue(40),
      alignItems: 'center',
      justifyContent: 'center'
    }

  });
  return styles;
}

const indicatorStyle = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center"
  }
});