import React, { PureComponent } from 'react';

import {
    StyleSheet,
    Text,
    ImageBackground,
    View,
    TouchableOpacity,
    FlatList,
    Image
} from 'react-native';
import PropTypes from "prop-types";
import AppConfig from '../config/app.config.js';
import CompanyConfig from '../config/company.config.js';
import { getResponsiveValue, getResponsiveFontSize } from '../assets/default.theme.js';
import FileHelper from '../helpers/fileHelper.config.js';
import SvgUri from '../components/svguri.js';

let productStyles = null;

function setStyle() {
    if (productStyles != null && !CompanyConfig.isGeneral()) return productStyles;

    productStyles = StyleSheet.create({
        /**
         * 产品图片
         */
        imageContainer: {
            width: getResponsiveValue(410),
            height: getResponsiveValue(313),
            marginLeft: getResponsiveValue(24),
            marginTop: getResponsiveValue(24),
        },
        defaultImage: {
            // 默认将图片设置得很大， 取得图片完成后Render时,将重新设置大小，此处解决一下Bug: 列表中图片不显示问题
            width: getResponsiveValue(410),
            height: getResponsiveValue(313),
            flexDirection: "column",
            justifyContent: 'flex-end',
            alignItems: 'center',
            overflow: "hidden"
        },

        /**
        * 产品名称 
        */
        productnameblock: {
            zIndex: 2,
            //opacity: 0.7,
            position: "absolute",
            // marginBottom: getResponsiveValue(0),
            width: getResponsiveValue(410),
            height: getResponsiveValue(63),
        },
        productname: {
            color: "#ffffff",
            //  marginBottom: getResponsiveValue(10),
            marginLeft: getResponsiveFontSize(10),
            fontSize: getResponsiveFontSize(28),
            backgroundColor: 'transparent',
        },

        /**
         * 产品类型
         */
        productTypeText: {
            color: "white",
            fontSize: getResponsiveFontSize(22),
            // includeFontPadding: false,
            textAlign: 'center',
            textAlignVertical: 'center',
            backgroundColor: 'transparent',
            marginLeft: getResponsiveValue(15),
            marginRight: getResponsiveValue(15),
        },
        ProductTypeWap: {
            width: getResponsiveValue(88),
            height: getResponsiveValue(34),
            backgroundColor: '#00000040',
            zIndex: 3,
            marginTop: getResponsiveValue(8),
            marginLeft: getResponsiveValue(310),
            justifyContent: 'space-around',
            /** 控制以下三个属性裁剪圆角边框 */
            borderRadius: getResponsiveValue(15),
            borderColor: 'transparent',
            overflow: 'hidden'
        },

        ProductTypeWapNew: {
            position: 'absolute',
            // width: getResponsiveValue(88),
            height: getResponsiveValue(34),
            backgroundColor: '#00000040',
            zIndex: 3,
            top: getResponsiveValue(20),
            right: getResponsiveValue(10),
            justifyContent: 'space-around',
            /** 控制以下三个属性裁剪圆角边框 */
            borderRadius: getResponsiveValue(15),
            borderColor: 'transparent',
            overflow: 'hidden'
        },

        ProductStatusWap: {
            width: getResponsiveValue(105),
            height: getResponsiveValue(40),
            borderRadius: getResponsiveValue(20),
            marginBottom: getResponsiveValue(262),
            marginLeft: getResponsiveValue(280),
            justifyContent: 'center',
            flexDirection: "row",
            backgroundColor: '#00000040',
        },

        ProductStatusText: {
            includeFontPadding: false,
            fontSize: getResponsiveValue(25),
            marginLeft: getResponsiveValue(3),
            color: "white",
            zIndex: 2,
            textAlign: "center",
            textAlignVertical: "center",
            lineHeight: 15,
            backgroundColor: 'transparent'
        },
        ProductStatusIcon: {
            width: getResponsiveValue(25),
            height: getResponsiveValue(25),
            marginLeft: getResponsiveValue(-5),
            marginTop: getResponsiveValue(5),
            opacity: 1,
            zIndex: 2,
        },

        TagView: {
            position: 'absolute',
            width: getResponsiveValue(200),
            height: getResponsiveValue(44),
            left: getResponsiveValue(17),
            top: getResponsiveValue(28),
            zIndex: 4,
            // backgroundColor: 'gray',
        },
        TagBgView: {
            position: 'absolute',
            // left: getResponsiveValue(17),
            // top: getResponsiveValue(28),
            zIndex: 1,
        },
        TagViewText: {
            color: 'white',
            position: 'absolute',
            left: getResponsiveValue(20),
            top: getResponsiveValue(0),
            width: getResponsiveValue(150),
            height: getResponsiveValue(36),
            zIndex: 2,
            fontSize: getResponsiveFontSize(24),
            textAlign: 'center',
            textAlignVertical: 'center',
            includeFontPadding: false,
            backgroundColor: 'transparent',
        },
        tagContainer: {
            position: 'absolute',
            left: getResponsiveValue(17),
            top: getResponsiveValue(28),
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'flex-start'
        },
    });

    return productStyles;
}


export default class ProductListItem extends PureComponent {
    constructor(prop) {
        backgrandImage: PropTypes.string;
        title: PropTypes.string;
        productTag: PropTypes.string;
        subscript: PropTypes.string;
        onPress: PropTypes.func;
        isShowImage: PropTypes.bool;
        isShouldSubString: PropTypes.bool;
        super(prop);
        this.state = {
            ProductImage: AppConfig.defaultLoadingImage,
            isLive: true,
            imgLoaded: false,
            isShowImage: true
        }

    }
    componentDidMount() {
        this.getImageUrl();
        this.props.productTag = this.getProductTag();
    }
    UNSAFE_componentWillMount() {
        this.isLive = false;
    }
    getImageUrl() {
        if (this.state.isLive) {
            let thisObj = this;
            if (this.props.backgrandImage == null || this.props.backgrandImage == "") {
                thisObj.setState({ ProductImage: AppConfig.defaultNoImage, imgLoaded: true });

            } else {
                FileHelper.fetchFile(this.props.backgrandImage, 450).then((uri) => {
                    if (uri != null && uri != '') {
                        thisObj.setState({ ProductImage: { uri: uri }, imgLoaded: true });
                    } else {
                        thisObj.setState({ ProductImage: AppConfig.backgrandImage, imgLoaded: true });
                    }
                }).catch(function (error) {
                    thisObj.setState({ ProductImage: AppConfig.backgrandImage, imgLoaded: true });
                });
            }
        }
    }

    getProductTag() {
        let productTag = this.props.productTag;
        if (productTag) {
            if (productTag.indexOf(',') > -1) {
                return productTag.split(',')[0];
            }
        }
        return productTag;
    }

    render() {
        setStyle();
        let CharCount = 7;
        let imgUri = this.state.ProductImage;
        let newimgStyle = {};
        let title = this.props.title;
        if (this.props.isShouldSubString && this.props.title.length > 15) {
            title = this.props.title.substring(0, 14) + "...";
        }
        if (this.state.imgLoaded) {
            //  默认将图片设置得很大， 取得图片完成后Render时,将重新设置大小，此处解决一下Bug: 列表中图片不显示问题
            newimgStyle = { width: getResponsiveValue(410), height: getResponsiveValue(313) };
        }
        return (
            <View>
                <TouchableOpacity style={productStyles.imageContainer} activeOpacity={0.8} onPress={() => {
                    if (this.props.onPress) {
                        this.props.onPress();
                    }
                }}>
                    {this.state.isShowImage ? <ImageBackground source={this.state.ProductImage} style={[productStyles.defaultImage, newimgStyle]} >
                        <ImageBackground source={require("../assets/icons/title_bg.png")} style={[productStyles.productnameblock]}>
                            <View style={[productStyles.productnameblock, { justifyContent: "flex-end", paddingBottom: getResponsiveValue(8) }]}>
                                <Text numberOfLines={1} style={productStyles.productname} >{title}</Text>
                            </View>
                            {/* {
                                this.props.subscript ? (<View>
                                    <View style={productStyles.ProductTypeWapNew}>
                                        <Text style={productStyles.productTypeText} >{this.props.subscript && this.props.subscript.length > 20 ? this.props.subscript.substring(0, 2) + "..." : this.props.subscript}</Text>
                                    </View>
                                </View>) : null
                            } */}
                        </ImageBackground>
                    </ImageBackground> : null}
                </TouchableOpacity>
                {
                    this.props.productTag ?
                        (<View style={productStyles.TagView}>
                            <View style={productStyles.TagBgView}>
                                <Image 
                                    source = { require('../assets/icons/redtag.png')}
                                    style = {{ width: getResponsiveValue(290), height: getResponsiveValue(36)}}
                                />
                            </View>
                            <Text style={productStyles.TagViewText}>{this.getProductTag()}</Text>
                        </View>) : null
                }
            </View>)
    }
}
