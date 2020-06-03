import React, { PureComponent, Component } from 'react';
import PropTypes, { func } from "prop-types";
import {
     Image,
} from 'react-native';
import { getResponsiveValue, getResponsiveFontSize } from '../assets/default.theme';
// import { DefaultCompanyConfig } from "../config/company.config";
import AppConfig from '../config/app.config.js';
import FileHelper from '../helpers/fileHelper.config.js';




export default class SyncImgFetch extends PureComponent {
    static defaultProps = {
        imgStyle: {
            width: getResponsiveValue(210), height: getResponsiveValue(146)
        },
        imgSource: AppConfig.defaultNoImage,
        imgSize: 120
    };
    constructor(props, context) {
        super(props, context);
        this.imgStyle = props.imgStyle;
        this.imgSource = props.imgSource;
        this.imgSize = props.imgSize;
        this.state = {
            imgStyle: props.imgStyle,
            imgSource: AppConfig.defaultNoImage,
        };
        this.reloadImgSoure = false;
        this.reloadImgSoureNum = 0;
        this.ComponentIsMounted = true;
    };
    static propTypes = {
        imgStyle: PropTypes.object,
        imgSource: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.string]),
    };

    PRratio(imgSource, callback) {
        let self = this;
        Image.getSize(imgSource, (width, height) => {
            // let PRratio = width / height;
            // let currentPRratio = self.imgStyle.width / self.imgStyle.height;
            //目前不做处理
            // if (PRratio > currentPRratio) {
            //     self.state.imgStyle.height = self.state.imgStyle.width / PRratio;
            // }
            // if (PRratio < currentPRratio) {
            //     self.state.imgStyle.width = self.state.imgStyle.height / PRratio;
            // }
            self.reloadImgSoure = true;
            callback();
        }, (error) => {
            self.state.imgSource = null;
            self.setState({ imgSource: AppConfig.defaultFailImage });
            self.reloadImgSoure = true;
        });

    }
    initData() {
        let self = this;
        if (self.reloadImgSoureNum <= 3) {
            if (!self.imgSource || self.imgSource === '' || self.imgSource === null || self.imgSource.length <= 0) {
                self.state.imgSource = AppConfig.defaultNoImage;
            } else if (typeof self.imgSource === 'number') {
                self.reloadImgSoure = true;
                self.setState({ imgSource: self.imgSource });
                // self.PRratio(self.imgSource, () => {
                //     self.setState({ imgSource: self.imgSource });
                // });
            }
            else {//需要请求下载的图片
                if (typeof self.imgSource === 'string') {//网络图片  
                    if (self.imgSource.startsWith("http")) {
                        self.PRratio(self.imgSource, () => {
                            self.setState({ imgSource: { uri: self.imgSource } });
                        });
                    } else {

                        FileHelper.fetchFile(self.imgSource, self.imgSize).then((URL) => {
                            if (self.ComponentIsMounted) {
                                if (URL != null && URL != '') {
                                    self.PRratio(URL, () => {
                                        self.setState({ imgSource: { uri: URL } });
                                    });

                                } else {
                                    self.PRratio(AppConfig.defaultFailImage, () => {
                                        self.setState({ imgSource: AppConfig.defaultFailImage });
                                    });
                                }
                            }
                        }).catch((r) => {
                            if (self.ComponentIsMounted) {
                                self.PRratio(AppConfig.defaultFailImage, () => {
                                    self.setState({ imgSource: AppConfig.defaultFailImage });
                                });
                            }
                        });
                    }
                }
            }
        } else {
            self.PRratio(AppConfig.defaultFailImage, () => {
                self.setState({ imgSource: AppConfig.defaultFailImage });
            });
        }
    }

    componentDidMount() {
        this.ComponentIsMounted = true;
        this.initData();
    }
    componentWillUnmount() {
        this.ComponentIsMounted = false;
    }

    render() {
        let self = this;
        return (
            <Image
                {...self.props}
                style={this.state.imgStyle}
                onLoad={(event) => {
                    if (self.reloadImgSoure) {
                        self.reloadImgSoure = false;
                    }
                }}
                onLoadEnd={(event) => {
                    //  console.log("--------------");
                    //  console.log(event);
                    //   console.log(event.nativeEvent);
                    //   console.log("++++++++++++++");
                    if (self.reloadImgSoure) {
                        self.reloadImgSoureNum++;
                        self.initData();
                    }
                }}
                source={self.state.imgSource}
                resizeMethod="auto"
                defaultSource={AppConfig.defaultLoadingImage}
                resizeMode="cover"

            />
        );
    }
}

//#region   子组件的事件不生效:--> 目前没用，
// export class SyncImageBackground extends PureComponent {
//     static defaultProps = {
//         style: {
//             flex: 1
//         },
//         source: DefaultCompanyConfig.CompanyBGImgWithLogo,
//     };
//     constructor(props) {
//         super(props);
//         this.state = {
//             style: props.style,
//             source: props.source,
//             renderData: null,
//         };
//         this.children = props.children;
//         this.ComponentIsMounted = true;
//         this.GetRenderData = this.GetRenderData.bind(this);
//     }

//     componentDidMount() {
//         this.ComponentIsMounted = true;
//     }
//     componentWillUnmount() {
//         this.ComponentIsMounted = false;
//     }


//     GetRenderData(childrens) {
//         if (React.isValidElement(childrens)) {
//             return childrens;
//         } else if (childrens === null) {
//             return null;
//         } else {
//             return childrens.map((data, index) => {
//                 return this.GetRenderData(data);
//             })
//         }
//     }

//     render() {
//         let self = this;
//         let childrens = self.children;
//         return (
//             <ImageBackground
//                 style={self.state.style}
//                 source={self.state.source}
//             >
//                 {
//                     self.GetRenderData(childrens)
//                 }
//             </ImageBackground>
//         );
//     }
// }
//#endregion

