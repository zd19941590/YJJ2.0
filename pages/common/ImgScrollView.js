import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image,
    TouchableWithoutFeedback,Dimensions
} from 'react-native';
import PropTypes from "prop-types";
import StyleConfig from '../../config/style.config.js';

import ImageZoom from 'react-native-image-pan-zoom';
const { width, height } = Dimensions.get('window');
import CustomHeader from '../../components/CustomHeader.js';
import { getResponsiveValue, getResponsiveFontSize, FontSize, Colors, BgColors } from "../../assets/default.theme";
import FileHelper from '../../helpers/fileHelper.config.js';
import CompanyConfig from '../../config/company.config.js';
import AppConfig from '../../config/app.config.js';
var screenWidth = getResponsiveValue(1334);
let styles = null;
// export default class ProductSolutionList extends Component {
//     constructor(props) {
//         super(props);
//         setStyle();
//     }
//     state = {
//     };
//     getImgList(PSysNo, model) {
//         // let list = [];
//         let temp = [];
//         if (PSysNo > 0) {
//             temp = this.state.productInfo.ImageList;
//         } else {
//             temp = model.ImageList;
//         }
//         return temp;
//     }
//     imgonpress(){
//         let self = this;
//         self.refs["Pageindex"].hidePageIndex();
//     }
//     onMomentumScrollEnd(e){
//         this.refs["Pageindex"].onAnimationEnd(e);
//     }
//     getSize(ImgList){
//         let sizeList = ImgList.filter((item)=>{
//             return item.GroupID === 'Product'
//         })
//         return sizeList.length;
//     }
//     render() {
//         let model = this.props.navigation.state.params.model;
//         let ImageList = this.getImgList(this.state.selectSysNo, model);
//         let thisObj = this;
//         const { goBack } = this.props.navigation;
//         let ProductList = JSON.parse(model.ProductList);
//         return (
//             <View style={styles.bgimg}>
//                 <ImgScrollView ImageList={ImageList} ref="imgBackGround" onPress={()=>{this.imgonpress()}} onMomentumScrollEnd={(e)=>{this.onMomentumScrollEnd(e)}} parent={this}></ImgScrollView>
//                 <Pageindex ref="Pageindex" size={this.getSize(model.ImageList)}></Pageindex>
//             </View>
//         );
//     }
// }
export default  class ImgScrollView extends Component {
    static propTypes = {
        onPress:PropTypes.func,
        ImageList:PropTypes.any,
        onMomentumScrollEnd:PropTypes.func,
    };

    static defaultProps = {

    };
    
    constructor(props) {
        super(props);
        this.state = {
            isShowPageIndex: true,
            imgType:"Product",
        };
    }
    _scroll;
    componentWillUnmount() {
    }
    componentDidMount() {
    }
    hidden() {
        // Alert.alert("11");
        if (this.state.isShowPageIndex) {
            this.setState({
                isShowPageIndex: false
            });
        } else {
            this.setState({
                isShowPageIndex: true
            });
        }
    }
    setImgList(ImgList){
        this.setState({
            ImageList: ImgList 
        });
    }
    setImgType(imgtype){
        this.setState({
            imgType:imgtype
        });
    }
    getImgList(){
        let parent = this.props.parent;
        if(this.state.ImageList!=null&&this.state.ImageList.length>0){
            let list = this.state.ImageList.filter((item)=>{return item.GroupID == this.state.imgType });
            // parent.refs["Pageindex"].setSize(list.length);
            parent.refs["Pageindex"].setSize(list.length)
            return list;
        }else{
            console.log("this.props.ImageList");
            console.log(this.props.ImageList);
            let list = this.props.ImageList.filter((item)=>{return item.GroupID == this.state.imgType });
            console.log(list);
            if(list==null||list.length===0){
                return this.props.ImageList;
            }
            if(parent.refs["Pageindex"]!=null){
                parent.refs["Pageindex"].setSize(list.length)
            }
            return list;
        }
    }
    render() {
        setStyle();
        let ImageList =   this.props.navigation.state.params.ImageList;
        if(ImageList !=null)
        {
        return (
            <View style={styles.bgimg}>
            <CustomHeader sourceColor={StyleConfig.Secondary} sourceBackGroundColor={StyleConfig.Main} ref="header" navigation={this.props.navigation}></CustomHeader> 

                <ScrollView
                    ref={(scroll) => this._scroll = scroll}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                   // maximumZoomScale={2}    // 子组件(图片)放大倍数
                   // minimumZoomScale={1.0}  // 子组件(图片)缩小倍数
                    scrollEnabled={true}
                    pagingEnabled={true}
                    horizontal={false}
                    removeClippedSubviews={true}
                    onMomentumScrollEnd={(e)=>{
                        if(this.props.onMomentumScrollEnd!=null){
                            this.props.onMomentumScrollEnd(e);
                        }
                    }}>
                    {
                        ImageList.map((item, index) => {
                            return (
                                <ImageZoom key={index} style={{ overflow: 'hidden', backgroundColor : "#ffffff" }} cropWidth={width}
                                cropHeight={height}
                                imageWidth={width}
                                imageHeight={height}
                                onDoubleClick={() => {
                                }}
                                clickDistance={100}
                                onClick={() => {
                                
                                }}
                                doubleClickInterval={200}
                            >
                                <Image style={{ width: width, height: height, resizeMode: 'stretch' }}
                                    source={{uri:item.ImageDefaultUrl}}
                                    />
                            </ImageZoom>
                            )
                        })
                    }
                </ScrollView>
            </View>
        )
    }
    else
        {
            <Image style={{ width: width, height: height, resizeMode: 'stretch' }}
                                    source={require(`../../assets/images/404X3.png`)}
                                    />
        }
    }
}
export class BackGroundItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowPageIndex: true,
        };
    }
    componentDidMount() {
        let self = this;
        let img = this.props.imgInfo;
        // console.log("imgiteminfo");
        // console.log(img);
        // FileHelper.fetchFile(img.Path).then(path => {
        //     img.DefaultImageRealUri = { uri: path };
        //     self.forceUpdate();
        // });
    }
    // createPage() {
    //     let pageInfo = this.props.pageInfo;
    //     return (pageInfo.index + 1) + "/" + pageInfo.size;
    // }

    render() {
        setStyle()
        let img = this.props.imgInfo;
        //const { navigate } = this.props.navigation;
        let bimg = CompanyConfig.CompanyBGImg;// require("../../assets/icons/default.png");
        if (img.ImageDefaultUrl!=null&&img.ImageDefaultUrl!='') {
            bimg ={uri:img.ImageDefaultUrl} ;
        }
        return (
            <Image style={[styles.bgimg]} resizeMode="contain" source={bimg} >
               {/* {this.state.isShowPageIndex ? <View style={styles.bgimg} >
                    <View style={styles.contentleft}>
                        <Text style={styles.Pagenumber}>{this.createPage()}</Text>
                    </View>
                </View> : null}
                 <TipModelItem  navigation={this.props.navigation} item={model} pgaeInfo={{length:ImageList.length,index:index}} ref={"tip" + index} key={item.SysNo}></TipModelItem> */}
            </Image>
        )
    }
}
export class Pageindex extends Component{
    constructor(props) {
        super(props);
        this.state = {
            isShowPageIndex:true,
            index:1,
            size:0,
        };
    }
    hidePageIndex() {
        if (this.state.isShowPageIndex) {
            this.setState({
                isShowPageIndex: false,
            });
        } else {
            this.setState({
                isShowPageIndex: true,
            });
        }
    }
    onAnimationEnd(e) {
        let offsetX = e.nativeEvent.contentOffset.x;
        let pageIndex = Math.round(offsetX / screenWidth);
        this.setState({
            index:pageIndex+1
        });
    }
    setSize(size){
        if(size>0){
            this.setState({
                size:size,
            });
        }else{
            this.setState({
                size: this.props.size
            }); 
        }
    }
    getsize(){
        if(this.state.size>0){
            return this.state.size
        }
        return this.props.size
    }
    render(){
       let size =  this.getsize()
        return(
            <View>
                {this.state.isShowPageIndex&&size>0 ? 
                    <View style={styles.pageIndexWap}>
                        <Text style={styles.Pagenumber}>{this.state.index+"/"+size}</Text>
                    </View>
                 : null}
            </View>
        )
        
    }
}
function setStyle(){
    if(styles!=null && !CompanyConfig.isGeneral()) return styles;
    styles = StyleSheet.create({
        
        righViewShowWap: {
            position: "absolute",
            flexDirection: "column",
            zIndex: 100,
            top: 0,
            left: getResponsiveValue(1200),
            height: getResponsiveValue(AppConfig.design.height),
            width: getResponsiveValue(585),
        },
        leftViewwap: {
            position: "absolute",
            flexDirection: "column",
            zIndex: 100,
            top: 0,
            left: 0,
            height: getResponsiveValue(AppConfig.design.height),
            width: getResponsiveValue(107),
        },
        AnimatedView: {
            flexDirection: "row",
            width: getResponsiveValue(612),
            height: getResponsiveValue(AppConfig.design.height),
            //marginLeft:getResponsiveValue(472)
        },
        Pagenumber: {
            width: getResponsiveValue(94),
            height: getResponsiveValue(40),
            flexDirection: "row",
            borderRadius: getResponsiveValue(19),
            color: "#ffffff",
            textAlign: 'center',
            textAlignVertical: 'center',
            fontSize:getResponsiveValue(18),
        },
        SelectProuuct: {
            marginVertical: getResponsiveValue(20),
            flexDirection: "column",
            height: getResponsiveValue(60),
            textAlign: 'center',
            textAlignVertical: 'center',
            color: '#FFFFFF',
            fontSize: getResponsiveFontSize(26),
            borderRadius: getResponsiveFontSize(5),
            backgroundColor: '#0093de',
            opacity: 0.8,
        },
        ViewBorder: {
            borderColor: "#7b7b7b",
            borderBottomWidth: getResponsiveValue(2),
        },
        VenterView: {
            height: getResponsiveValue(520),
            borderColor: "#7b7b7b",
            borderBottomWidth: getResponsiveValue(2),
        },
        productName: {
            height: getResponsiveValue(80),
            fontSize: getResponsiveValue(34),
            color: "#ffffff",
            textAlign: 'center',
            textAlignVertical: 'center',
        },
        back: {
            marginVertical: getResponsiveFontSize(20),
            // zIndex:999,
            marginLeft: getResponsiveValue(20),
            height: getResponsiveValue(86),
            borderRadius: getResponsiveValue(86),
            width: getResponsiveValue(86),
            // marginLeft: getResponsiveValue(20),
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: CompanyConfig.AppColor.PopupBackground,
            opacity: 0.4,
        },
        backImg: {
            width: getResponsiveValue(21),
            height: getResponsiveValue(37)
        },
        bgimg: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: "row",
            width: getResponsiveValue(1334),
            height: getResponsiveValue(AppConfig.design.height),
        },
        containImage:{

            resizeMode: Image.resizeMode.contain
        },
        backtext: {
            marginVertical: getResponsiveValue(20),
            flexDirection: "column",
            height: getResponsiveValue(86),
            color: '#FFFFFF',
            borderRadius: getResponsiveValue(86),
            width: getResponsiveValue(86),
            backgroundColor: CompanyConfig.AppColor.PopupBackground,
            textAlign: 'center',
            textAlignVertical: 'center',
            marginLeft: getResponsiveValue(20),
            opacity: 0.4,
        },
        selectLeftText:{
            textAlign: 'center',
            color: '#FFFFFF',
            height: getResponsiveValue(86),
            borderRadius: getResponsiveValue(86),
            width: getResponsiveValue(86),
            fontSize: getResponsiveFontSize(26),
            backgroundColor: '#0093de',
            textAlignVertical: 'center',
            opacity: 0.8,
            marginLeft: getResponsiveFontSize(21),
            marginVertical: getResponsiveFontSize(20),
        },
        lefttext: {
            //marginVertical: getResponsiveValue(20),
            textAlign: 'center',
            color: '#FFFFFF',
            height: getResponsiveValue(86),
            borderRadius: getResponsiveValue(86),
            width: getResponsiveValue(86),
            fontSize: getResponsiveFontSize(26),
            backgroundColor: CompanyConfig.AppColor.PopupBackground,
            textAlignVertical: 'center',
            opacity: 0.4,
            marginLeft: getResponsiveFontSize(21),
            marginVertical: getResponsiveFontSize(20),
        },
        righttext: {
            opacity: 0.4,
            marginVertical: getResponsiveValue(20),
            flexDirection: "column",
            height: getResponsiveValue(60),
            textAlign: 'center',
            textAlignVertical: 'center',
            color: '#FFFFFF',
            fontSize: getResponsiveFontSize(26),
            borderRadius: getResponsiveFontSize(5),
            backgroundColor: CompanyConfig.AppColor.PopupBackground,
        },
        left: {
            flexDirection: "column",
            height: getResponsiveFontSize(750),
            width: getResponsiveValue(110),
        },
        contentleft: {
            position: "absolute",
            zIndex: 100,
            flexDirection: "column",
            width: getResponsiveValue(1334),
            height: getResponsiveValue(AppConfig.design.height),
        },
        content: {
            flexDirection: "row",
            width: getResponsiveValue(612),
            height: getResponsiveValue(AppConfig.design.height),
        },
        right: {
            height: getResponsiveValue(AppConfig.design.height),
            flexDirection: "column",
            width: getResponsiveValue(140),
        },
        description: {
            flexDirection: "column",
            width: getResponsiveValue(472),
            height: getResponsiveValue(AppConfig.design.height),
            opacity: 0.6,
            backgroundColor: CompanyConfig.AppColor.PopupBackground,
            shadowColor: "rgba(16, 19, 34, 0.96)",
            shadowOffset: {
                width: getResponsiveValue(-4),
                height: 0
            },
            shadowRadius: getResponsiveValue(70),
            shadowOpacity: 1,
        },
        descriptionText: {
            fontSize: getResponsiveValue(26),
            lineHeight: getResponsiveValue(60),
            marginLeft: getResponsiveValue(20),
            color: "#FFFFFF",
        },
        pageIndexWap:{
            position: "absolute",
            zIndex: 100,
            top: getResponsiveValue(300),
            left: getResponsiveValue(-660),
            backgroundColor: CompanyConfig.AppColor.PopupBackground,
            height: getResponsiveValue(40),
            width: getResponsiveValue(107),
            opacity: 0.4,
            borderRadius: 19,
            flexDirection: "column",
        },
    })
}