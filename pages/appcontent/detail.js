import React, { PureComponent } from 'react';
import BaseComponent from '../../components/BaseComponent.js';
import ReactNative, {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  WebView,
  Alert,
  Platform,
  Image,
  TouchableHighlight,
} from 'react-native';
import ContentService from '../../services/appcontent.js';
import FileHelper from '../../helpers/fileHelper.config.js';
import PropTypes from "prop-types";
import CustomHeader from '../../components/CustomHeader.js';
import CompanyConfig from '../../config/company.config.js';
import { getResponsiveValue, getResponsiveFontSize } from "../../assets/default.theme";
import AppConfig from '../../config/app.config.js';
import HorizonVerticalView from '../../components/HorizonVerticalView/Sliding.js';
import Share from '../../helpers/shareHelper.config.js'
import VideoPlayer from 'react-native-af-video-player';
import RNFetchBlob from 'react-native-fetch-blob';
import Icon from '../../components/svguri.js';
const rootDir = Platform.OS === 'ios' ? `${RNFetchBlob.fs.dirs.DocumentDir}/yjj` : `${RNFetchBlob.fs.dirs.SDCardDir}/yjj`;

let contentStyles = null;
export class ContentDetail extends BaseComponent {
  status;
  _gallery;
  static propTypes = {
    sysno: PropTypes.any,
    content: PropTypes.any,
    style: PropTypes.any,
    defaultIndex: PropTypes.number
  }

  constructor(prop) {
    super(prop);
    this.state = {
      content: null,
      imagesList: [],
      imageUri: "",
      showindex: 0,
      resultImageList: [],
      VideoPath: "",
      
    }
    imgPath = "";
  }

  componentDidMount() {
    let self = this;
    if (this.props.sysno && !this.props.content) {
      let contentService = new ContentService();
      contentService.GetContentDetail(this.props.sysno, (info) => {
        if (info) {
          let isSetState = true;
          if (info.TopicContentType == 3) {
            FileHelper._checkFileIsAndGetLoacUrl(info.FileList && info.FileList[0] ? info.FileList[0].Path : "").then((path) => {
              self.setState({ content: info, VideoPath: path });
            });
          } else if (info.TopicContentType == 1) {
            let fileList = info.FileList;
            info.imagesLists = [];
            if (fileList != null && fileList.length > 0) {
              for (var i = 0; i < fileList.length; i++) {
                let file = fileList[i];
                FileHelper.fetchFile(file.Path).then(path => {
                  let imgobj = { uri: path };
                  info.imagesLists.push(imgobj);
                  self.setState({ content: info });
                });
              }
            }
          }
          if (isSetState) {
            self.setState({ content: info });
          }
        }
      });
    } else if (this.props.sysno == null && this.props.content != null) {
      let info = this.props.content;
      if (info.TopicContentType == 3) {
        if (Platform.OS === 'android' && rootDir) {
          FileHelper._checkFileIsAndGetLoacUrl(info.FileList && info.FileList[0] ? info.FileList[0].Path : "", rootDir, (path) => {
            self.setState({ content: info, VideoPath: path });
          })
        } else {
          FileHelper._checkFileIsAndGetLoacUrl(info.FileList && info.FileList[0] ? info.FileList[0].Path : "", null, (path) => {
            self.setState({ content: info, VideoPath: path });
          });
        }
      } else if (info.TopicContentType == 1) {
        let fileList = info.FileList;
        let photos = [];

        info.imagesLists = [];
        if (fileList != null && fileList.length > 0) {
          let productImgList = [];
          let index = 0;//验证图片fetchFile完成
          for (var i = 0; i < fileList.length; i++) {
            let file = fileList[i];
            FileHelper.fetchFile(file.Path).then(path => {
              // index++;
              // info.imagesLists.push([path]);
              // if (index == 1) {
              //   this.imgPath = path;
              // }
              // if (index == fileList.length) {
          
              // }
            });
          }

          let prodctImg = this.downFileList(fileList)
          productImgList.push(prodctImg);
          Promise.all(productImgList).then((ps) => {
            photos = ps;
  
            const photoResules = [];
            photos.forEach((item, index) => {
              if (item == null || item == undefined || item.length == 0) {
                photos[index] = ['pic-404'];
              } else {  
                for (let index = 0; index < item.length; index++) {
                  photoResules.push([item[index]])
                }
              }
            });

            info.imagesLists = photoResules;
            this.setState({
              content: info
            });
          });

        }
      }
    }
  }

  async downFileList(fileList) {
    if (fileList != null && fileList.length > 0) {

      for (let i = fileList.length - 1; i >= 0; i--) {
        let f = fileList[i];
        let reg = /(\.png|\.jpg|\.jpeg|\.gif|\.bmp)$/i;
        // 删除非图片文件。
        if (!reg.test(f.Path)) {
          fileList.splice(i, 1);
        }
      }

      if (fileList.length == 0) return;

      let alist = [];

      for (let fi = 0; fi < fileList.length; fi++) {
        let p = fileList[fi].Path;
        alist.push(FileHelper.GetLocalFileOrHttpUri(p,()=>{
          // FileHelper.fetchFile(p);
      }));
        // alist.push(FileHelper._checkFileIsAndGetLoacUrl(p));
      }
      let imgs = await Promise.all(alist);
      if (imgs.length == 0) {
        imgs = []
      }

      return imgs;
    }
    return [];
  }


  shareImage() {
    if (!this.imgPath) {
      // Solve the reason why the first picture cannot be shared
      let co =this.state.content.imagesLists;
      if (this.state.content.imagesLists.length > 0) {
        // cause there are two way using this component,but one is page-menu level coming in,
        // another one is page-list level coming in , so the index would be different;
        if (this.props.navigation.state.params.defaultIndex) {
          this.imgPath = co[this.props.navigation.state.params.defaultIndex][0];
        } else {
          // and when page-menu level component import this component,the first image index would not
          // be undefind
          this.imgPath = co[0][0]
        }
      }
    }
    this.goShare();
  }

  goShare() {
    Share.open({
      url: this.imgPath,
      status: 0
    })
  }

  render() {
    setStyle();
    let content = this.props.content;
    if (this.state.content != null) {
      content = this.state.content;
    }
    const { navigate } = this.props.navigation;
    const defaultIndex = this.props.navigation.state.params.defaultIndex;
    if (content == null) return null;
    // company description(picture)
    if (content.TopicContentType == 1) {//图片轮滑
      if (content.imagesLists) {
        return (
          <View style={contentStyles.imgbgimg}>
            {(content != null && content.imagesLists.length > 0) ?
              <View style={contentStyles.imgbgimg}>
                <HorizonVerticalView style={contentStyles.imgbgimg}
                  defaultIndex={defaultIndex ? defaultIndex : 0}
                  dataList={this.state.content.imagesLists}
                  onPageHorizonScroll={(index, imgPath) => {
                    this.imgPath = imgPath;
                  }}
                  onPagePress={() => {
                  }}
                >
                </HorizonVerticalView>
                <TouchableOpacity activeOpacity={0.8} onPress={() => this.shareImage()} style={contentStyles.Leftbutton}>
                  <Text style={contentStyles.lefttext}>分享</Text>
                </TouchableOpacity>
                {/** back to index page */}
                {/* <TouchableOpacity activeOpacity={0.8} style={[contentStyles.Leftbutton, { marginTop: getResponsiveValue(130)}]} onPress={() => {
                  navigate('Home')
                }}>
                  <Image style={{ width: getResponsiveValue(45), height: getResponsiveValue(45) }}
                    source={require(`../../assets/icons/indexBtn.png`)}
                  />
                </TouchableOpacity> */}
              </View>
              : null}
          </View >
        );
      } // company description(video)
    } else if (content.TopicContentType == 3) {
      let videPath = this.state.VideoPath;
      if (!videPath) {
        return null;
      }
      return (
        <View style={{ flex: 1, justifyContent: "center" }}>
          {/* <CustomHeader navigation={this.props.navigation} /> */}
          <TouchableOpacity activeOpacity={0.8} onPress={() => this.props.navigation.goBack()} style={contentStyles.backBarButton}>
            <Image
              style={{width: getResponsiveValue(45), height: getResponsiveValue(45)}}
              source={require('../../assets/icons/back.png')}
            />
          {/* <Text style={contentStyles.lefttext}>分享</Text> */}
          </TouchableOpacity>
          <VideoPlayer
            lockPortraitOnFsExit={true}
            autoPlay={true}
            fullScreenOnly={true}
            inlineOnly={true}
            url={videPath}
            onerror={() => {
              Alert.alert("播放失败，请稍后再试！")
            }} />
        </View>);
    }
    else {
      return (
        <View style={contentStyles.contentStyle}>
          <WebView style={{ backgroundColor: "white" }} dataDetectorTypes={'none'} source={{
            html: `
                        <h2 align="center"><font color="black">${content.Title}</font></h2><p align="center"><font color="black">${content.PublishDate.replace("T", "  ")}</font></p>${content.Content}
                    `, baseUrl: ''
          }} />
        </View>
      );

    }
    return null;
  }
}

export default class ContentDetailPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      content: null
    }
  }
  CharCount = 30;//显示内容名称的前20个字符
  componentDidMount() {
    let contentService = new ContentService();
    const { state } = this.props.navigation;
    let sysno = state.params.sysno;
    let menu = state.params.menu;

    if (menu != null) {
      let mparmars = JSON.parse(menu.PathParams);
      if (mparmars != null && mparmars != "") {
        if (sysno == null || sysno == "" || sysno == 0) {
          sysno = mparmars.DetailSysno;
        }
      }
    }

    contentService.GetContentDetail(sysno, (info) => {
      if (info != null) {
        this.setState({ content: info });
      }
    });
  }
  render() {
    setStyle();
    let headTitle = "内容详细";
    let content = null;
    if (this.state.content != null) {
      headTitle = this.state.content.Title;
      content = (<ContentDetail content={this.state.content} navigation={this.props.navigation} />);
    }
    if (this.state.content != null && this.state.content.TopicContentType == 4) {
      return (
        <View style={[contentStyles.bgimg, { backgroundColor: '#fff' }]} >
          <CustomHeader title={headTitle.substring(0, this.CharCount)} navigation={this.props.navigation} />
          {/* <TouchableOpacity activeOpacity={0.8} onPress={() => this.shareImage()} style={contentStyles.Leftbutton}>
                  <Text style={contentStyles.lefttext}>分享</Text>
                </TouchableOpacity> */}
          {content}
        </View>);
        // <TouchableOpacity activeOpacity={0.8} onPress={() => this.props.navigation.goBack()} style={contentStyles.backBarButton}>
        //     {/* <Image
        //       style={{width: getResponsiveValue(45), height: getResponsiveValue(45)}}
        //       source={require('../../assets/icons/back.png')}
        //     /> */}
        //   <Text style={contentStyles.lefttext}>分享</Text>
        //   </TouchableOpacity>
          // );
    } else {
      {/** pic */}
      return (
        <ImageBackground style={contentStyles.bgimg} source={CompanyConfig.CompanyBGImg}>
          <CustomHeader title={headTitle.substring(0, this.CharCount)} navigation={this.props.navigation} />
          {content}
        </ImageBackground>);
    }
  }

}
function setStyle() {
  if (contentStyles != null && !CompanyConfig.isGeneral()) return contentStyles;
  contentStyles = StyleSheet.create({
    bgimg: {
      flex: 1
    },
    imgbgimg: {
      flex: 1,
      flexDirection: "row",
      width: getResponsiveValue(1334),
      height: getResponsiveValue(AppConfig.design.height),
    },
    Leftbutton: {
      position: 'absolute',
      top: getResponsiveFontSize(120),
      left: getResponsiveFontSize(20),
      height: getResponsiveValue(86),
      width: getResponsiveValue(86),
      borderRadius: getResponsiveValue(43),
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: getResponsiveFontSize(10),
      backgroundColor: CompanyConfig.formatColor(CompanyConfig.AppColor.ButtonBg, "e6"),
      zIndex: 40,
    },
    lefttext: {
      height: getResponsiveValue(30),
      textAlign: "center",
      textAlignVertical: "center",
      color: CompanyConfig.AppColor.ButtonFront,
      fontSize: getResponsiveFontSize(24),
      lineHeight: getResponsiveValue(30),
      overflow: "hidden",
    },
    backStyle: {
      backgroundColor: '#DBDBDB',
    },
    titleStyle: {
      fontSize: 30,
      textAlign: 'center',
    },
    dateStyle: {
      textAlign: 'center',
    },
    contentStyle: {
      flex: 1,
      width: getResponsiveValue(1334)
    },
    imagesStyle: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: "row",
      width: getResponsiveValue(1334),
      height: getResponsiveValue(AppConfig.design.height),
    },
    fullScreen: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    },
    pageIndexWap: {
      position: "absolute",
      zIndex: 100,
      bottom: getResponsiveValue(20),
      left: getResponsiveValue(-AppConfig.design.width / 2),
      backgroundColor: CompanyConfig.AppColor.Main,
      height: getResponsiveValue(40),
      width: getResponsiveValue(110),
      opacity: 0.8,
      borderRadius: 20,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: 'center',
    },
    Pagenumber: {
      flexDirection: "row",
      borderRadius: getResponsiveValue(19),
      color: CompanyConfig.AppColor.SecondaryFront,
      textAlign: "center",
      textAlignVertical: 'center',
      fontSize: getResponsiveValue(18),
    },

    navigationBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      top: getResponsiveValue(0),
      width: getResponsiveValue(1334),
      height: getResponsiveValue(90),
      backgroundColor: CompanyConfig.AppColor.Secondary,
      marginBottom: getResponsiveValue(16)
    },
    navigationBarTitle: {
      color: "black",
      fontSize: 25,
      fontWeight: "500"
    },
    backBarButton: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      width: getResponsiveValue(86),
      height: getResponsiveValue(86),
      borderRadius: getResponsiveValue(43),
      backgroundColor: 'white',
      zIndex:100,
      top: getResponsiveFontSize(20),
      left: getResponsiveFontSize(20),
      opacity: 0.5
    },
  });
  return contentStyles;
}

