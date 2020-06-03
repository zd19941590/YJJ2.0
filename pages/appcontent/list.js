import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  FlatList,
  TouchableHighlight,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import BaseComponent, { BasePureComponent } from '../../components/BaseComponent.js';
import ContentService from '../../services/appcontent.js';
import EnvConfig from '../../config/app.config.js';
import CompanyConfig from '../../config/company.config.js';
import PropTypes from "prop-types";
import RNFetchBlob from 'react-native-fetch-blob';
import FileHelper from '../../helpers/fileHelper.config.js';
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme.js';
import { ContentDetail } from '../appcontent/detail.js';
import NotFoundPage from '../../components/NotFond.js';
import OpenFile from 'react-native-doc-viewer';
import * as FileManager from '../common/FileManager';
import Icon from '../../components/svguri.js';
import GridBrowser from './GridBrowser.js';

const RNFetchBlobDownloadStorage = {};

let contentStyles = null;
const rootDir = Platform.OS === 'ios' ? `${RNFetchBlob.fs.dirs.DocumentDir}/yjj` : `${RNFetchBlob.fs.dirs.SDCardDir}/yjj`;
/**
 * company introduce doc;
 */
export class ContentList extends BaseComponent {
  static propTypes = {
    menu: PropTypes.any,
    ContentList: PropTypes.any,
    onEndReached: PropTypes.func,
    navigation: PropTypes.any,
    operationMessage: PropTypes.any,
  }

  constructor(prop) {
    super(prop);
    this.state = {
      ContentList: []
    }
  }
  pageInfo = {
    startIndex: 0,
    pageSize: 60
  }
  isDidMount = false;
  componentDidMount() {
    let self = this;
    let menu = this.props.menu;
    this.isDidMount = true;
    if (menu != null) {
      let categorySysNo = menu.SysNo;
      let contentService = new ContentService();
      contentService.GetAppContentList(self.pageInfo.startIndex, self.pageInfo.pageSize, null, categorySysNo, (data) => {
        var startIndex = self.pageInfo.startIndex + self.pageInfo.pageSize;
        var newContentList = self.state.ContentList.concat(data);
        self.setState({ ContentList: newContentList });
        self.pageInfo.startIndex = startIndex;
      });
    }
  }
  render() {
    setStyle();
    let contentList = this.props.ContentList;
    if (this.state.ContentList != null && this.state.ContentList.length > 0) {
      contentList = this.state.ContentList
    }
    let content = null;
    if (contentList != null && contentList.length == 1) {
      // 【Siege】单个直接显示详细页面 
      content = contentList[0];
      if (content.TopicContentType == 2) {
        content = null;
      }
    }
    if (content && content.TopicContentType != 3) {
      if (content && content.FileList && content.FileList.length > 6) {
        this.props.navigation.state.params.sysno = content.SysNo;
        return <GridBrowser navigation={this.props.navigation} style={{ flex: 1, backgroundColor: "green" }} />
      } else {
        return (<ContentDetail content={content} navigation={this.props.navigation} style={{ top: getResponsiveValue(120), right: getResponsiveValue(20) }} />);
      }
    }
    // company style, just about company work space
    else {
      if (contentList == null || contentList.length == 0) {
        return (this.isDidMount ? (<NotFoundPage />) : null);
      }
      return (
        <View style={contentStyles.imageblock}>
          <FlatList
            removeClippedSubviews={true}//用于将屏幕以外的视图卸载
            key={'shows'}
            numColumns={3}
            data={contentList}
            columnWrapperStyle={{ justifyContent: 'flex-start' }}
            keyExtractor={(item, index) => index}
            renderItem={({ item, index }) => (
              <ContentItem content={item}
                navigation={this.props.navigation}
                operationMessage={this.props.operationMessage}
                ref={"imgBtn" + index}
                key={item.SysNo}
              />
            )}
            onEndReached={this.props.onEndReached}
            onEndReachedThreshold='0.1'
          />
        </View>
      );
    }
  }
}

export default class ContentListPage extends BasePureComponent {
  static propTypes = {
    leftButtonImageSource: PropTypes.any,
    leftButtonOnPress: PropTypes.func,
    menu: PropTypes.any
  }

  DefaultPageSize = 60;
  constructor(prop) {
    super(prop);
    this.state = {
      ContentList: [],
      StartNo: 0
    }
  }

  getMenu() {
    if (this.props.menu) {
      return this.props.menu;
    }
    const { state } = this.props.navigation;
    return state.params.menu;
  }

  componentDidMount() {
    this.appendContent(this.state.StartNo);
  }

  appendContent = (startNo) => {
    let thisObj = this;
    const menu = thisObj.getMenu();
    let categorySysNo = null
    if (menu != null) {
      categorySysNo = menu.SysNo;
    }
    let contentService = new ContentService();

    if (typeof (startNo) != 'undefined' && startNo != null && startNo > -1) {
      this.state.StartNo = startNo;
    }
    contentService.GetAppContentList(this.state.StartNo, this.DefaultPageSize, null, categorySysNo, (data) => {
      // FIXED: If parameter `FileList` is null,the item my not be show in the list.
      let filterArray = []
      data.forEach((item, index) => {
        if ((item.FileList != null && item.FileList.length > 0) || (item.Content != null && item.Content.length > 0)) {
          filterArray.push(item)
        }
      })
      var newStartNo = thisObj.state.StartNo + thisObj.DefaultPageSize;
      var newContentList = thisObj.state.ContentList.concat(filterArray);
      thisObj.setState({ ContentList: newContentList, StartNo: newStartNo });
    });
  }

  renderContentList(contentList, menu) {
    return (<ContentList ContentList={contentList} onEndReached={() => this.appendContent} menu={menu} navigation={this.props.navigation} operationMessage={this.refs.messageBar}></ContentList>);
  }
  render() {
    const { navigation } = this.props;
    setStyle();
    let menu = this.getMenu();
    if (menu != null) {
      headTitle = menu.MenuName;
    }
    return (
      <ImageBackground style={contentStyles.baseView} source={CompanyConfig.CompanyBGImg}>
        {this.renderContentList(this.state.ContentList, null)}
        <TouchableHighlight style={[contentStyles.back, { backgroundColor: CompanyConfig.AppColor.OnPressMain }]}
          onPress={() => navigation.goBack()}
        >
          <Icon
            width={getResponsiveValue(40)}
            height={getResponsiveValue(40)}
            fill={'#3a90e7'}
            source={'back'}
          />
        </TouchableHighlight>
      </ImageBackground>
    );
  }

}

export class ContentItem extends Component {
  static propTypes = {
    content: PropTypes.any,
    navigation: PropTypes.any,
    operationMessage: PropTypes.any,
    fileDownloading: PropTypes.func,
    fileDownloaded: PropTypes.func
  }
  CharCount = 6;//显示商品名称的前12个字符
  constructor(props) {
    super(props);
    this.state = {
      selected: false,
      doloadCount: 0,
      showDownload: true,
      isDownloading: false,
      isFileExistLocal: false,
      isComponentAlive: true,
    };
  }

  handlePressLocalFile(realpath, fileName, extendNmae) {
    realurl = 'file://' + realpath
    try {
      if (Platform.OS === 'ios') {
        OpenFile.openDoc([{
          fileName: fileName,
          url: realpath,
          fileNameOptional: ""
        }], (error, url) => {
          if (error) {
            if (extendNmae == 'rar' || extendNmae == 'zip') {
              Alert.alert("请安装解压软件");
            } else {
              Alert.alert("请安装office或wps等相关软件查看文件");
            }
          }
        })
      } else {
        // Linking.openURL(realurl);
        OpenFile.openDoc([{
          url: realurl,
          // url: SavePath+fileName,
          fileName: fileName,
          fileType: extendNmae,
          cache: false,
        }], (error, url) => {
          if (error) {
            if (extendNmae == 'rar' || extendNmae == 'zip') {
              Alert.alert("请安装解压软件");
            } else {
              Alert.alert("请安装office或wps等相关软件查看文件");
            }
          }
        })
      }
    } catch (err) {
      if (err != null) {
        if (extendNmae == 'rar' || extendNmae == 'zip') {
          Alert.alert("请安装解压软件");
        } else {
          Alert.alert("请安装office或wps等相关软件查看文件");
        }
      }
    }
  }

  downloadContentFile(uri, fileName, type, sysNo) {
    if (uri == "" || uri == undefined || uri == null) {
      return;
    }
    const extendNmae = fileName.substring(fileName.lastIndexOf('.') + 1);//文件扩展名
    const md5FileName = FileManager.fileFromPath(uri);
    let path = `${rootDir}/${md5FileName}`;
    let self = this;
    if (self.props.fileDownloading) {
      self.props.fileDownloading();
    }

    const { navigate } = this.props.navigation;

    RNFetchBlob.fs.exists(path).then((exists) => {
      const downloadURL = uri.toLowerCase().indexOf("http") >= 0 ? uri : `${EnvConfig.imageBaseUrl + uri}`;
      if (!exists) {
        this.downloadFileFromURL(downloadURL, extendNmae, path, fileName, type);
      } else {
        FileManager.md5Valid(path, "", true, (valid, error) => {
          if (!valid) {
            RNFetchBlob.fs.unlink(path).then(() => {
              this.downloadFileFromURL(downloadURL, extendNmae, path, fileName, type);
            });
          } else {
            if (type == 2) {
              self.handlePressLocalFile(path, fileName, extendNmae);
            } else if (type == 3) {
              navigate('ContentDetail', { sysno: sysNo })
            }
          }
        });
      }
    })
  }

  downloadFileFromURL(downloadURL, extendNmae, path, fileName, type) {
    RNFetchBlobDownloadStorage[downloadURL] = true;
    this.refresh();

    RNFetchBlob
      .config({
        fileCache: true,
        appendExt: extendNmae,
        path: path
      })
      .fetch("GET", downloadURL)
      .progress({ count: 1 }, (received, total) => {
        let bili = (received / total) >= 1 ? 1 : (100 * (received / total)).toFixed(2);
        this.setState({ doloadCount: bili });
        if (received == total) {
          setTimeout(() => {
            this.setState({ showDownload: true, doloadCount: 100 });
          }, 1000)
        }
        this.state.doloadCount = bili;
      }).then((res) => {
        RNFetchBlobDownloadStorage[downloadURL] = false;

        this.refresh();

        setTimeout(() => {
          this.setState({ showDownload: true });
        }, 500)

        this.forceUpdate();
        // if (type == 2 && this.state.isComponentAlive) {
        //   this.handlePressLocalFile(path, fileName, extendNmae);
        // }
      }).catch((error) => {
        RNFetchBlobDownloadStorage[downloadURL] = false;
        if (this.props.fileDownloaded) {
          this.props.fileDownloaded(false);
        }
        this.refresh();
        setTimeout(() => {
          Alert.alert("提示", "网络连接出错，请稍后重试")
        }, 500);
      })
  }


  componentDidMount() {
    let self = this;
    let content = this.props.content;
    if (content.DefaultImage != null && content.DefaultImage.trim() != "") {
      FileHelper.fetchFile(content.DefaultImage, 450).then(path => {
        if (path) {
          content.DefaultImageUri = { uri: path };
          self.forceUpdate();
        }
      });
    }
    this.refresh();
  }

  componentWillUnmount() {
    this.state.isComponentAlive = false;
  }

  refresh() {
    let content = this.props.content;
    const fileInfo = content.FileList;
    const isVideo = content.TopicContentType == 3;
    const isfile = content.TopicContentType == 2;

    if (isVideo || isfile) {
      const uri = fileInfo[0].Path;
      const md5FileName = FileManager.fileFromPath(uri);
      let path = `${rootDir}/${md5FileName}`;

      RNFetchBlob.fs.exists(path).then((exists) => {
        //console.log("🔴 文件是否存在: ", exists);
        if (exists) {
          FileManager.md5Valid(path, "", true, (valid, error) => {
            //console.log("🔵 文件是否正确: ", valid);
            this.setState({ isFileExistLocal: valid })
          });
        } else {
          this.setState({ isFileExistLocal: false })
        }
      });

      const downloadURL = uri.toLowerCase().indexOf("http") >= 0 ? uri : `${EnvConfig.imageBaseUrl + uri}`;

      for (const key in RNFetchBlobDownloadStorage) {
        if (RNFetchBlobDownloadStorage.hasOwnProperty(key) && key === downloadURL) {
          const isDownloading = RNFetchBlobDownloadStorage[key];
          this.setState({ isDownloading: isDownloading })
        }
      }
    }
  }

  render() {
    setStyle();
    let content = this.props.content;
    let fileInfo = content.FileList;
    let bimg = null;

    if (content.DefaultImage == null || content.DefaultImage.trim() == "") {
      if (content.TopicContentType == 1) {
        bimg = require("../../assets/icons/img.jpg");
      } else if (content.TopicContentType == 4) {
        bimg = require("../../assets/icons/img-txt.png");
      } else if (content.TopicContentType == 3) {
        bimg = require("../../assets/icons/video.jpg");
      }
    }

    let fileType = "";
    if (content.DefaultImageUri) {
      bimg = content.DefaultImageUri;
    }
    if (content.videoSrc) {
      videoinfo = content.videoSrc;
    }
    let isFile = content.TopicContentType == 2;
    let isVideo = content.TopicContentType == 3;
    let titleBgImg = require("../../assets/icons/title_bg.png");

    const { isFileExistLocal, isDownloading } = this.state;

    let renderDownloadButton;
    if (!isFileExistLocal) {
      if (isDownloading) {
        renderDownloadButton = (
          <ActivityIndicator style={contentStyles.downloadIcon} color={"white"} animating={isDownloading} hidesWhenStopped={true} size={"small"} />
        );
      } else {
        renderDownloadButton = (
          <TouchableHighlight style={contentStyles.downloadIcon} onPress={() => {
            this.downloadContentFile(fileInfo[0].Path, fileInfo[0].Name, content.TopicContentType, content.SysNo);
          }}>
            <Image source={require("../../assets/icons/download.png")} style={contentStyles.downloadImage}></Image>
          </TouchableHighlight>
        );
      }
    }

    if (content.TopicContentType == 1 || content.TopicContentType == 4) { //图片，视频,文章
      return (
        <View style={contentStyles.contentItem}>
          <TouchableHighlight
            underlayColor={CompanyConfig.AppColor.OnPressMain}
            onPress={() => {
              this.didTappedPlayButton(content.SysNo)
            }}
          >
            <ImageBackground resizeMode="cover" source={bimg} style={contentStyles.contentItemImg}>
              {isVideo ? (<Image resizeMode="cover" source={require("../../assets/icons/start.png")} style={contentStyles.startImg}></Image>) : null}
              <ImageBackground source={titleBgImg} style={contentStyles.contentnametransblock}>
                <View style={contentStyles.contentnameblock}>
                  <Text style={contentStyles.contentname} >{content.Title.length > 7 ? content.Title.substring(0, this.CharCount) + '...' : content.Title}</Text>
                </View>
                {isVideo ? (<View style={contentStyles.contenTypeWap}>
                  <Text style={contentStyles.contenType} >video</Text>
                </View>) : null}
              </ImageBackground>
            </ImageBackground>
          </TouchableHighlight>
        </View>
      )
    } else if (isFile || isVideo) {
      if (fileInfo != null && fileInfo.length > 0) {
        fileType = fileInfo[0].Path.substring(fileInfo[0].Path.lastIndexOf('.') + 1);
        if (content.DefaultImage == null || content.DefaultImage.trim() == "") {
          bimg = require("../../assets/icons/file.png");
        }
        return (
          <View>
            <TouchableHighlight style={contentStyles.contentItem} underlayColor={CompanyConfig.AppColor.OnPressMain} onPress={() => {
              if (isVideo) {
                this.didTappedPlayButton(content.SysNo);
              } else {
                this.downloadContentFile(fileInfo[0].Path, fileInfo[0].Name, 2);
              }
            }
            }>
              <ImageBackground resizeMode="cover" source={bimg} style={contentStyles.contentItemImg}>
                {isVideo ? (<Image resizeMode="cover" source={require("../../assets/icons/start.png")} style={contentStyles.startImg}></Image>) : null}
                <ImageBackground source={titleBgImg} style={contentStyles.contentnametransblock}>
                  <View style={contentStyles.contentnameblock}>
                    <Text style={contentStyles.contentname} >{content.Title.substring(0, this.CharCount)}</Text>
                  </View>
                  <View style={contentStyles.contenTypeWap}>
                    <Text style={contentStyles.contenType} >{fileType}</Text>
                  </View>
                </ImageBackground>
              </ImageBackground>
            </TouchableHighlight>
            {renderDownloadButton}
          </View>
        );
      }
    }
    return null;
  }

  didTappedPlayButton(sysNo) {
    const { navigate } = this.props.navigation;
    (new ContentService()).GetContentDetail(sysNo,
      (result) => {
        if (result && result.FileList && result.FileList.length >=6) {
          navigate("GridBrowser", { sysno: sysNo })
        } else {
          navigate('ContentDetail', { sysno: sysNo });
        }
      });
  }

}
function setStyle() {
  if (contentStyles != null && !CompanyConfig.isGeneral()) return contentStyles;
  contentStyles = StyleSheet.create({
    baseView: {
      flex: 1,
    },
    bgimg: {
      flex: 1,
      flexDirection: "row",
      alignItems: 'flex-start',
      justifyContent: 'flex-start'
    },
    contentItem: {
      width: getResponsiveValue(410),
      height: getResponsiveValue(300),
      marginLeft: getResponsiveValue(22),
      marginTop: getResponsiveValue(22),
      backgroundColor: "#FFFFFF",

    },

    back: {
      justifyContent: 'center',
      alignItems: 'center',
      width: getResponsiveValue(80),
      height: getResponsiveValue(80),
      position: 'absolute',
      left: getResponsiveValue(20),
      top: getResponsiveValue(20),
      borderRadius: getResponsiveValue(40),
    },


    contentItemImg: {
      width: getResponsiveValue(410),
      height: getResponsiveValue(300),
      flexDirection: "column",
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    contentnametransblock: {
      flex: 1,
      width: getResponsiveValue(410),
      height: getResponsiveValue(63),
      zIndex: 1,
      position: "absolute",
    },
    contentnametransblockimg: {
      opacity: 0.7,
      width: getResponsiveValue(410),
      height: getResponsiveValue(63),
    },
    contentnameblock: {
      zIndex: 2,
      opacity: 1,
      position: "absolute",
      // bottom: getResponsiveValue(40),
      top: getResponsiveValue(15),
      alignItems: 'flex-end',
      flexDirection: "row",
      backgroundColor: "#FFFFFF00"
    },
    contentname: {
      color: "#FFFFFF",
      //marginBottom: getResponsiveValue(10),
      marginLeft: getResponsiveValue(10),
      fontSize: getResponsiveFontSize(28),
      overflow: "visible",
      textAlign: 'left'
    },
    contenTypeWap: {
      width: getResponsiveValue(76),
      height: getResponsiveValue(30),
      borderRadius: getResponsiveValue(14),
      borderColor: '#fff',
      borderWidth: getResponsiveValue(1),
      backgroundColor: "#00000000",
      zIndex: 3,
      marginTop: getResponsiveValue(19),
      marginLeft: getResponsiveValue(319)
    },
    contenType: {
      color: "#fff",
      fontSize: getResponsiveFontSize(20),
      textAlign: 'center'
    },
    //文章图片区域样式
    imageblock: {
      flex: 1,
      flexDirection: "row",
      alignItems: 'center',
      justifyContent: 'center'
    },
    //搜索按钮样式
    searchStyle: {
      marginRight: getResponsiveValue(10),
      width: getResponsiveValue(50),
      height: getResponsiveValue(50),
    },
    container: {
      flex: 1,
      paddingTop: 22,
      flexDirection: "row",
    },
    sectionHeader: {
      paddingTop: 2,
      paddingLeft: 10,
      paddingRight: 10,
      paddingBottom: 2,
      fontSize: 14,
      fontWeight: 'bold',
      backgroundColor: 'rgba(247,247,247,1.0)',
    },
    item: {
      padding: 10,
      fontSize: 18,
      height: 44,
    },

    startImg: {
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: getResponsiveValue(130),
      width: getResponsiveValue(100),
      height: getResponsiveValue(100),
    },
    downloadStyle: {
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: getResponsiveValue(110),
    },
    downloadIcon: {
      position: 'absolute',
      width: getResponsiveValue(60),
      height: getResponsiveValue(60),
      right: getResponsiveValue(20),
      top: getResponsiveValue(40),
      backgroundColor: 'rgba(150, 156, 162, 0.8)',
      borderRadius: 2,

    },
    downloadImage: {
      position: 'absolute',
      width: getResponsiveValue(44),
      height: getResponsiveValue(44),
      margin: 4,
    }

  });
  return contentStyles;
}