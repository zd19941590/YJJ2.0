/**
 * 分享帮助类
 * open(options) 打开系统分享弹出框
 * {
 *  url:图片相对路径
 * }
 * 目前只支持url图片分享
 */
import RNFetchBlob from 'react-native-fetch-blob';
import Share from 'react-native-share'
import EnvConfig from '../config/app.config.js'

export default class ShareHelper {
    static open(options) {
        let defaultOptions = {
            url: '',
            title: '分享'
        }
        options = Object.assign({}, defaultOptions, options);
        
        if (options.status == 0) {
            if (options.url && options.url != '') {

                if (options.url.toLowerCase().indexOf("file") >= 0) {//本地文件
                    Share.open({
                        url: options.url,
                        title: '分享'
                    }).then(() => {
                    }).catch((error) => {
                    })
                }
                else {
                    RNFetchBlob.fetch('GET', options.url.toLowerCase().indexOf("http") >= 0 ? options.url : (EnvConfig.imageBaseUrl + options.url), {}).then((res) => {
                        let base64Str = res.base64();
                        options.url = 'data:image/png;base64,' + base64Str;
                        Share.open({
                            url: options.url,
                            title: '分享'
                        }).then(() => {
                        }).catch((error) => {
                        })
                    }).catch((errorMessage, statusCode) => {
                    })
                }
    
            }
            else {
                Share.open(options).then(() => {
                }).catch((error) => {
                })
            }
        } else {
            Share.open(options).then( (res) => {
                window.console.log(res)
            }).catch((err) => {
                window.console.log(err)
            })
        }
    }
}