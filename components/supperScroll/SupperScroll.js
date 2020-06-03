/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {PureComponent, Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View, ScrollView, Dimensions, Image, Alert,TouchableWithoutFeedback
} from 'react-native';
import Pages from './Pages.js';
import PropTypes from 'prop-types';
import Swiper from '../supperScroll/Swiper.js';
const { width, height } = Dimensions.get('window');
import AppConfig from '../../config/app.config.js';
import NotFond from '../../components/NotFond.js';
import ImageZoom from 'react-native-image-pan-zoom';
import FileHelper from '../../helpers/fileHelper.config.js';
import { getResponsiveValue } from '../../assets/default.theme.js';

let showIndex = 0;
let isShouldHidden = false;
export default class SupperScroll extends PureComponent {
    static propTypes = {
        index: PropTypes.number,//第几页做为首页
        onClick: PropTypes.func,
        onDoubleClick: PropTypes.func,
        dataList: PropTypes.array,//传入数据二维数组 [[],[]]
        onIndexChanged: PropTypes.func,
        ImageZoombackgroundColor: PropTypes.string,
        indexStyle: PropTypes.object,
        afterRender:PropTypes.func,
        isShowItem:PropTypes.bool,
        resizeMode: PropTypes.oneOf([
            'cover',
            'contain',
            'stretch',
        ]),
    }
    static defaultProps = {
        onIndexChanged: () => null,
        ImageZoombackgroundColor: "#000000",
        index: 0,
    }
    //入参 ImageList：目标图片list对象 shouldfetchFile：是否需要重新去需找本地图片 selectContent：选择的图片组标识
    updatePageDataList(ImageList, shouldfetchFile, selectContent) {//修改某一个page页面的datalist
        let index = showIndex > 0 ? showIndex : this.props.index;
        let page_ = this.refs['page_' + index];
        if (page_) {
            page_.setPageList(ImageList, shouldfetchFile, selectContent);
        }
    }
    
    getSelectContent() {
        let page_ = this.refs['page_' + showIndex];
        if (page_) {
            return page_.state.selectContent;
        }
    }
    IsHasImage() {
        let page_ = this.refs['page_' + showIndex];
        if (page_) {
            return page_.IsHasImage();
        }
    }
    getShowImageUrlStr() {
        let page_ = this.refs['page_' + showIndex];
        if (page_) {
            return page_.getShowImageUrlStr();
        }
    }
    showItem(){
        let index = showIndex > 0 ? showIndex : this.props.index;
        if(showIndex>1){
            let lIndex  = Number(index)-1;
            let page_l = this.refs['page_' + lIndex];
            if (page_l) {
                page_l.showMe(false);
            }
        }
        let page_ = this.refs['page_' + index];
        if (page_) {
             page_.showMe(true);
        }

    }
    render() {
        const {
            ImageZoombackgroundColor,
            dataList,
            index,
            indexStyle,
        } = this.props;
        showIndex = this.props.index;
        let isShowItem =  isShouldHidden =   (dataList&&dataList.length<15);
        return (
            dataList ? <Swiper totalPage={21} bounces={true} ref='Swiper' style={styles.wrapper} indexStyle={indexStyle}
                index={index}
                loop={false}
                removeClippedSubviews={true}
                onIndexChanged={(index) => {
                    showIndex = index;
                    if (this.props.onIndexChanged) this.props.onIndexChanged(index, this.getSelectContent(), this.IsHasImage());
                    // if(dataList.length>=15){
                    //     this.showItem();
                    // }
                }}>
                {
                    dataList.map((item, pindex) => {
                        return <PageWap index = {pindex} isShowMe ={isShowItem} horizontal={false} resizeMode={this.props.resizeMode} onClick={() => {
                            if (this.props.onClick && typeof (this.props.onClick) == 'function') this.props.onClick()
                        }} ref={'page_' + pindex} key={'p' + pindex} pageList={item}></PageWap>
                    })
                }
            </Swiper> :
                null
        );
    }
}
export class PageWap extends PureComponent {
    static propTypes = {
        index: PropTypes.number,//第几页做为首页
        onClick: PropTypes.func,
        onDoubleClick: PropTypes.func,
        pageList: PropTypes.array,//传入数据二维数组 [[],[]]
        onIndexChanged: PropTypes.func,
        ImageZoombackgroundColor: PropTypes.string,
        resizeMode: PropTypes.string,
        selectContent: PropTypes.number,
    }
    
    state = {
        pageList: [],
        shouldfetchFile: true,
        isReload: false,
        selectContent: 0,
        showPageIndex : 0,
        isShowMe:isShouldHidden,
        isReadey:false,
    }
    static defaultProps = {
        onIndexChanged: () => null,
        ImageZoombackgroundColor: "#000000",
        shouldfetchFile: true,
        selectContent: 0,
    }
    
    componentDidMount() {

        if(!isShouldHidden){
            if(this.props.index==0){
                this.setState({
                    isShowMe:true,
                    pageList:this.props.pageList,
                    isReadey:true,
                });
            }else{
                this.setState({
                    isShowMe:showIndex==this.props.index,
                    pageList:this.props.pageList,
                    isReadey:true,
                });
            }
        }else{
            this.setState({
                pageList:this.props.pageList,
                isReadey:true,
            })
        }
    }
    setPageList(pageList, shouldfetchFile, selectContent) {
        let thisObj = this;
        if (pageList && pageList.length > 0) {
            thisObj.state.pageList = pageList;
            thisObj.state.selectContent = selectContent;
            thisObj.state.shouldfetchFile = shouldfetchFile;
            thisObj.forceUpdate();
        }
        thisObj.refs['page'].scrollToPage(0);
    }
    showMe(isShow) {
        if (isShow != this.state.isShowMe) {
            this.setState({
                isShowMe: isShow
            });
        }
    }
    IsHasImage() {
        if (this.state.pageList && this.state.pageList.length > 0) return true
        return false;
    }
    getdata() {
        if (this.state.pageList && this.state.pageList.length > 0) return this.state.pageList
        return this.props.pageList;
    }

    cleaner() {
        this.setState({ pageList: [] });
    }
    getShowImageUrlStr() {
        let image = this.refs[this.state.showPageIndex + 'image' + this.state.selectContent];
        if (image) {
            return image.state.imgUriStr;
        }
        return "";
    }
    render() {
        const {
            ImageZoombackgroundColor,
        } = this.props;
        let pageList = this.state.pageList;
        
        return (
            <Pages ref={'page'} horizontal={false} startPage={0}  style={{ overflow: 'hidden'}}
                onScrollEnd={(index) => { this.state.showPageIndex = index }} >
                {
                    pageList&& pageList.length > 0 ?
                        pageList.map((image, index) => {
                            return <PageItem ref={index + 'image' + this.state.selectContent} shouldfetchFile={this.state.shouldfetchFile} key={index + 'image' + this.state.selectContent} style={{ overflow: 'hidden', backgroundColor: ImageZoombackgroundColor ? ImageZoombackgroundColor : "#000000" }} cropWidth={width}
                                cropHeight={height}
                                imageWidth={width}
                                imageHeight={height}
                                imageUri={image?image.Path:''}
                                clickDistance={100}
                                onClick={() => {
                                    if (this.props.onClick) this.props.onClick();
                                }}
                                doubleClickInterval={200}
                            >
                            </PageItem>
                        }) 
                        : 
                         <NotFond ShowNothing={true} onSingleTapConfirmed={()=>{
                            if (this.props.onClick) this.props.onClick();
                        }} ></NotFond>
                }
            </Pages>
        )
    }
}
export class PageItem extends PureComponent {
    static propTypes = {
        onClick: PropTypes.func,
    }
    state = {
        imageUri: {},
        isLive: true,
        imgLoaded: false,
        imgUriStr: '',
        Scale:1
    }
    UNSAFE_componentWillMount() {
        this.isLive = false;
    }
    componentDidMount() {
        if (this.props.shouldfetchFile) { this.getImageUrl(); }
        else {
            this.setState({
                imageUri: this.props.imageUri ? { uri: this.props.imageUri } : { uri: AppConfig.defaultNoImage }
            });
        }
    }
    getImageUrl() {
        if (this.state.isLive) {
            let thisObj = this;
            let image = thisObj.props.imageUri;
            if (image) {
                FileHelper.fetchFile(image).then((uri) => {
                    if (uri != null && uri != '') {
                         let Scale = 1;
                        thisObj.setState({Scale:Scale, imageUri: { uri: uri }, imgUriStr: uri, imgLoaded: true });
                    } else {
                        // resultArr.push({ uri: uri })
                        thisObj.state.imageUri =   AppConfig.defaultNoImage ;
                        thisObj.setState({ imgUriStr: uri, imgLoaded: true });
                    }
                    thisObj.forceUpdate();
                }).catch(function (error) {
                    thisObj.setState({ imageUri: AppConfig.backgrandImage, imgLoaded: true });
                });
            } else {
                this.setState({ imageUri: AppConfig.backgrandImage, imgLoaded: true });
            }
        }
    }

    render() {
        const {
            ImageZoombackgroundColor,
            onClick,
        } = this.props;
        let thisObj = this;
        let sourceUri= thisObj.props.imageUri
        let imgUri =thisObj.state.imageUri? thisObj.state.imageUri.uri:'';
        return thisObj.state.imgLoaded ? <ImageZoom style={{ overflow: 'hidden', backgroundColor : "#ffffff" }} cropWidth={width}
            cropHeight={height}
            imageWidth={width}
            imageHeight={height}
            onDoubleClick={() => {
                if (thisObj.props.onDoubleClick) thisObj.props.onDoubleClick();
            }}
            clickDistance={100}
            onClick={() => {
                if (thisObj.props.onClick) {
                    thisObj.props.onClick();
                }
            }}
            centerOn={{ x:0, y: 0, scale: this.state.Scale, duration: 0} }
            doubleClickInterval={200}
        >
            <Image style={{ width: width, height: height, resizeMode: 'contain' }}
                source={thisObj.state.imageUri}
                onError={(e) => {
                    let reg = /http(s?):\/\//i;
                    if (imgUri && !reg.test(imgUri)) {
                        thisObj.state.imageUri.uri = FileHelper._getFileUrl(sourceUri);
                        thisObj.forceUpdate();
                    } }}/>
        </ImageZoom> :
        <NotFond ShowNothing={true} src={AppConfig.defaultLoadingImage} onSingleTapConfirmed={()=>{
            if (this.props.onClick) this.props.onClick();
        }} loadingstyle={{ width: getResponsiveValue(435), height: getResponsiveValue(250), borderRadius: getResponsiveValue(20)}} ></NotFond>
    }
}
const styles = StyleSheet.create({
    wrapper: {
    },
});
