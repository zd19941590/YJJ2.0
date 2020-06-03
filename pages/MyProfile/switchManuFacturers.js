import React, { PureComponent } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Alert,
    TouchableOpacity,
    TouchableHighlight,
    FlatList,
    TextInput,
} from 'react-native';
import PropTypes from "prop-types";
import CommonService, { formatMenu } from '../../services/common';
import { NavigationActions } from 'react-navigation';
import CompanyConfig, { CompanyConfigHelper } from '../../config/company.config.js';
import OperationMessage, { showMessage } from '../../components/OperationMessage.js';
import Spinner2 from '../../components/Spinner2';
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme';
import SvgUri from '../../components/svguri.js';
import AppConfig, { clearStorage } from '../../config/app.config.js';
import axios from "axios";
import SyncImg from '../../components/SyncImgFetch';
import Services from '../../services/loginregisterService';
import { formatStr } from "../../helpers/utils";
import AlertModal from "../../components/AlertModal";
import DeviceInfo from 'react-native-device-info';
import FileHelper from "../../helpers/fileHelper.config";
import StyleConfig from '../../config/style.config'
import VersionUpdateService from '../../services/versionupdate'
import config from '../../config/company.config'
let styles = null;
let { height, width } = Dimensions.get('window');
const resetAction = NavigationActions.reset({
    index: 0,
    actions: [
        NavigationActions.navigate({ routeName: 'Home' })
    ]
});

let initdataSMFunc;
let swNavigation;
let alertModal;
let Spinnercomp;

export function InitSWData(data: Array) {
    if (initdataSMFunc) {
        initdataSMFunc(data);
    }
}
let common = new CommonService();

const DEFAULT_ARRAY_SIZE = 5;
// switch company
export default class switchManuFacturers extends PureComponent {
    constructor(prop) {
        super(prop);
        this.state = {
            UserManuFacturers: [],
            IsShow: false,//显示切换厂商确定对话框
            dataItems: [], // 临时存放
            refresh: 0,
            searchText: '',
        }
        const Cancel = axios.CancelToken.source();
        this.cancelaxios = Cancel;
        this.service = new Services(Cancel);
        this.initdata = this.initdata.bind(this);
        initdataSMFunc = (data) => {
            this.initdata(data);
        };
        swNavigation = prop.navigation;
        this._mounted = true;
        this.inputComponents = [];
        this.pureList = [];
    }
    componentWillUnmount() {
        this._mounted = false;
        this.cancelaxios.cancel();
    }
    componentDidMount() {
        this._mounted = true;
        let self = this;
        if (this._mounted && self.state.UserManuFacturers.length <= 0) {
            self.service.GetFacturers((result) => {
                let hadmessagebar = typeof self.refs["messageBar"] !== "undefined";
                let rresult = result.data;
                if (rresult.success) {
                    let csdata = rresult.data;

                    if (csdata.length > 0) {
                        let sysnos = [];
                        csdata.map((da, index, obj) => {
                            sysnos.push(da.SysNo);
                        });
                        sysnos.push(0);
                        common.GetCompanyParameterList(sysnos).then((result) => {
                            var data = result.data;
                            if (data !== null && data.length > 0) {
                                data.map((d, index, obj) => {
                                    FileHelper.fetchFile(d.Value);
                                })
                            }
                        })
                    }
                    self.initdata(csdata);
                    self.setState({dataItems: csdata});
                } else {
                    if (hadmessagebar) {
                        Alert.alert("提示", rresult.message, [
                            { text: '确定', onPress: () => console.log(''), style: 'cancel' },
                        ],
                            { cancelable: false })
                    }
                }
            }, (error) => {
                if (hadmessagebar) {
                    Alert.alert("提示", rresult.message, [
                        { text: '确定', onPress: () => console.log(''), style: 'cancel' },
                    ],
                        { cancelable: false })
                }
            });
        }
    }

    initdata(data) {
        let self = this;
        let renderdata = [];
        let page = Math.floor(data.length / 10);
        let leavepage = data.length % 10;
        for (let index = 0; index < page; index++) {
            let formatpagedata = [];
            if ((index + 1) * 10 > data.length) {
                let pagedata = data.slice(index * 10);
                if (pagedata.length > 5) {
                    formatpagedata.push(pagedata.slice(0, 5));
                    formatpagedata.push(pagedata.slice(5));
                } else {
                    formatpagedata.push(pagedata.slice(5));
                }
            } else {
                let pagedata = data.slice(index * 10, (index + 1) * 10);
                formatpagedata.push(pagedata.slice(0, 5));
                formatpagedata.push(pagedata.slice(5, 10));
            }
            renderdata.push(formatpagedata);
        }
        if (leavepage > 0) {
            if (leavepage <= 5) {
                let formatpagedata = [];
                let pagedata = data.slice(page * 10);
                formatpagedata.push(pagedata);
                renderdata.push(formatpagedata);
            } else {
                let formatpagedata = [];
                let pagedata = data.slice(page * 10, page * 10 + 5);
                formatpagedata.push(pagedata);
                pagedata = data.slice(page * 10 + 5);
                formatpagedata.push(pagedata);
                renderdata.push(formatpagedata);
            }
        }
        self.setState({ UserManuFacturers: renderdata }, () => {
        });
    }

    // search
    search = () => {
        const text = this.input._lastNativeText;
        let search = [];
        const allItems = this.state.dataItems;
        for (let index = 0; index < allItems.length; index++) {
            if (allItems[index].Name.indexOf(text) != -1) {
                search.push(allItems[index]);
            }
        }
        this.initdata(search);
        this.setState({refresh: this.state.refresh++});
    }

    _inputOnLayout(event) {
        this.inputComponents.push(event.nativeEvent.target)
    }

    render() {
        let self = this;
        setStyle();
        return (
            <View style={styles.baseView} >
                <OperationMessage ref="messageBar" />
                <Spinner2 ref={(ref) => Spinnercomp = ref} />
                <AlertModal ref={(al) => {
                    alertModal = al;
                }} />
                <View style={styles.headerView}>
                    <TouchableHighlight style={styles.back} onPress={() => { this.props.navigation.goBack(); }} activeOpacity={0.8} underlayColor={CompanyConfig.AppColor.OnPressSecondary} >
                        <View><SvgUri width={getResponsiveValue(40)} height={getResponsiveValue(40)} fill={StyleConfig.Main} source="back" /></View>
                    </TouchableHighlight>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', }}>
                        <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                            <Text style={{ fontSize: getResponsiveValue(32), color: StyleConfig.FocalFront, paddingLeft: getResponsiveValue(210) }}>切换厂商</Text>
                        </View>
                    </View>
                    <View style={ styles.searchTextView }>
                        <View style = {{ marginStart: getResponsiveValue(10)}}>
                                <SvgUri
                                    width = { getResponsiveValue(40) }
                                    height = { getResponsiveValue(40) }
                                    fill = { StyleConfig.Main }
                                    source = 'search'
                                />
                            </View>
                        <TextInput
                            ref = { (input) => { this.input = input}}
                            style= { styles.inputView }
                            autoCapitalize = 'none'
                            autoCorrect = {false}
                            returnKeyType = {'done'}
                            placeholderTextColor={CompanyConfig.formatColor(StyleConfig.Main, "b3")}
                            underlineColorAndroid="transparent"
                            disableFullscreenUI = {true}
                            placeholder = { '搜索' }
                            onChangeText = { (text) => {
                                this.setState({searchText: text})
                            }}
                            value = {this.state.searchText}
                            onEndEditing={ self.search }
                        />
                    </View>
                </View>
                <View style={{
                    width: width,
                    height: height - getResponsiveValue(90),
                    backgroundColor: StyleConfig.PopupBackground
                }}>
                    <FlatList style={{
                        flex: 1
                    }}
                        removeClippedSubviews={true}//用于将屏幕以外的视图卸载
                        horizontal={true}
                        pagingEnabled={true}
                        showsHorizontalScrollIndicator={false}
                        data={ self.state.UserManuFacturers }
                        extraData={ self.state.refresh }
                        getItemLayout={(data, index) => ({ length: width, offset: width * index, index })}
                        initialNumToRender={1}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index}) => (
                            <View style={{
                                width: width,
                                height: height - getResponsiveValue(90),
                                backgroundColor: '#9999FF40'
                            }}
                                key={index}
                            >
                                <ManuFacturers PageManuFacturers={item} />
                            </View>
                        )}
                        refreshing = {true}
                    />
                </View>

            </View>
        );
    }
}

export class ManuFacturers extends PureComponent {
    constructor(props) {
        super(props);
    }
    static defaultProps = {
        PageManuFacturers: []
    };

    render() {
        let self = this;
        let data = self.props.PageManuFacturers;
        if (data.length > 0)
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', }} >
                        {data.map((pagedata, index) => {
                            return (
                                <View key={index} style={{ maxHeight: getResponsiveValue(550), flexDirection: 'column', }}>
                                    {pagedata.map((Mitemdata, num) => {
                                        return (<ManuFactureItem key={(index + 1) * (num + 1)} itemdatas={Mitemdata} />);
                                    })}
                                </View>
                            );
                        })}
                    </View>

                </View>
            );
        return null;
    }
}

export class ManuFactureItem extends PureComponent {
    constructor(props) {
        super(props);
        const Cancel = axios.CancelToken.source();
        this.cancelaxios = Cancel;
        this.service = new Services(Cancel);
    }
    static defaultProps = {
        itemdatas: null
    };
    static propTypes = {
        itemdatas: PropTypes.object
    };

    componentWillUnmount() {
        this.cancelaxios.cancel();
    }
    render() {
        let self = this;
        let data = self.props.itemdatas;
        let style = {
            backgroundColor: '#ffffffb3',
        };
        if (data.IsSelected) {
            style.backgroundColor = "#18a9ed";
            style.borderStyle = "solid";
            style.borderWidth = getResponsiveValue(1);
            style.borderColor = "#18a9ed";
        }
        return (
            <TouchableOpacity
                style={[{
                    height: getResponsiveValue(90),
                    width: getResponsiveValue(437),
                    backgroundColor: '#ffffffb3',
                    borderRadius: getResponsiveValue(18),
                    marginVertical: getResponsiveValue(7),
                    marginHorizontal: getResponsiveValue(35),
                }, style]}
                onPress={() => {
                    if (!data.IsSelected && data.SysNo !== 0) {
                        alertModal.Show("提示", "确定切换到“" + data.Name + "”?", [
                            {
                                text: "确定",
                                onPress: () => {
                                    // 清除缓存数据
                                    global.storage.remove({ key: 'productSeries' });
                                    global.storage.remove({ key: "Styles" });
                                    global.storage.remove({ key: "Series" });
                                    global.storage.remove({ key: "Categorys" });
                                    global.storage.remove({ key: "ProductTag" });

                                    let devicesinfo = {
                                        DeviceUniqueID: DeviceInfo.getUniqueID(),
                                        DeviceModel: DeviceInfo.getModel(),
                                        DeviceManufacturer: DeviceInfo.getManufacturer(),
                                        DeviceSystemName: DeviceInfo.getSystemName(),
                                        DeviceIsTable: DeviceInfo.isTablet() === null ? "" : DeviceInfo.isTablet().toString()
                                    };

                                    // let cacheKey = Constaints.STORAGE_FILE_DOWNLOAD_LIST_ID_KEY();
                                    // global.storage.remove({ key: cacheKey });
                                    global.storage.remove({ key: 'SelectedShoppingCarCustomer' });
                                    let tempCompanyID = global.AppAuthentication.AppCompanyID;
                                    let tempuser = Object.assign({}, global.AppAuthentication);
                                    global.AppAuthentication.AppCompanyID = data.AuthID;
                                    Spinnercomp.showLoading();
                                    this.service.switchManuFacturer(devicesinfo, (result) => {
                                        let rresult = result.data;
                                        if (rresult.success) {
                                            global.storage.remove({ key: 'ProductSearchHistory' });//SelectedShoppingCarCustomer
                                            var serv = new VersionUpdateService();
                                            serv.checkLoginUser(tempuser, rresult.data);
                                            global.storage.save({
                                                key: 'loginState',
                                                data: rresult.data
                                            });
                                            global.AppAuthentication = rresult.data;
                                            // global.storage.load({
                                            //     key: 'BaiduPushChannelID',
                                            //     autoSync: false
                                            // }).then(channelid => {
                                            //     common.AddDeviceToBaiduPushTag(channelid).then((result) => { })
                                            // });
                                            let menuList = rresult.data.MenuList;
                                            formatMenu(menuList);
                                            global.storage.save({ key: "AppMenu", data: menuList });

                                            if (rresult.data.CompanyConfigList.length > 0) {
                                                global.storage.save({ key: "CompanyParameters", data: rresult.data.CompanyConfigList });
                                                CompanyConfigHelper.forceUpdate(() => {
                                                    if (swNavigation) {
                                                        global.storage.save({ key: "DataDownloadAlert", data: 0 });
                                                        Spinnercomp.hideLoading();
                                                        swNavigation.dispatch(resetAction);
                                                    }
                                                }, () => {
                                                    if (swNavigation) {
                                                        global.storage.save({ key: "DataDownloadAlert", data: 0 });
                                                        Spinnercomp.hideLoading();
                                                        swNavigation.dispatch(resetAction);
                                                    }
                                                });
                                            }
                                        } else {
                                            showMessage(rresult.message, 3);
                                            global.AppAuthentication.AppCompanyID = tempCompanyID;
                                            Spinnercomp.hideLoading();
                                        }
                                    }, (error) => {
                                        showMessage(error.message, 3);
                                        global.AppAuthentication.AppCompanyID = tempCompanyID;
                                        Spinnercomp.hideLoading();
                                    });
                                }
                            },
                            {
                                text: "取消",
                                onPress: () => { }
                            }]);
                    }
                }}>
                {data.SysNo > 0 ? (
                    <View style={{
                        flex: 1,
                        alignItems: 'center',
                        flexDirection: 'row',
                    }}>
                        {/* <-- todo bug here --> */}
                        <SyncImg imgSize={120} imgSource={data.Logo} imgStyle={{ height: getResponsiveValue(72), width: getResponsiveValue(72), borderRadius: getResponsiveValue(36), marginLeft: getResponsiveValue(21) }} />
                        <Text style={{
                            fontSize: getResponsiveFontSize(32),
                            backgroundColor: 'transparent',
                            marginLeft: getResponsiveValue(15),
                            color: data.IsSelected ? "#ffffff" : "#222222"
                        }}>{formatStr(data.Name, 5)}</Text>

                        {data.IsSelected ? (<View style={{
                            position: 'absolute',
                            right: getResponsiveValue(21),
                            width: getResponsiveValue(30),
                            height: getResponsiveValue(30),
                            borderRadius: getResponsiveValue(15),
                            backgroundColor: '#ffffff',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <SvgUri width={getResponsiveValue(18)} height={getResponsiveValue(18)} fill={CompanyConfig.AppColor.PopupFront} source={"sure"} />
                        </View>) : (
                                <View style={{
                                    position: 'absolute',
                                    right: getResponsiveValue(21),
                                    width: getResponsiveValue(30),
                                    height: getResponsiveValue(30),
                                }} />
                            )}
                    </View>
                ) : (
                        <View style={{
                            flex: 1,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'center'
                        }}>
                            <Text style={{
                                fontSize: getResponsiveFontSize(32),
                                color: "#18a9ed",
                                textAlign: 'center'
                            }}>
                                添加厂商
                            </Text>
                        </View>
                    )}
            </TouchableOpacity>
        );
    }
}

function setStyle() {
    if (styles != null && !CompanyConfig.isGeneral()) return styles;
    styles = StyleSheet.create({
        baseView: {
            backgroundColor: StyleConfig.PopupBackground,
            flex: 1
        },
        buttonView: {
            width: getResponsiveValue(140),
            height: getResponsiveValue(48),
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: StyleConfig.Main,
            borderRadius: getResponsiveValue(8),
            marginLeft: getResponsiveValue(10),
            marginRight: getResponsiveValue(10)
        },
        headerView: {
            height: getResponsiveValue(90),
            width: getResponsiveValue(AppConfig.design.width),
            backgroundColor: StyleConfig.PopupBackground,
            flexDirection: 'row',
            alignItems: 'center',

        },
        back: {
            height: getResponsiveValue(69),
            width: getResponsiveValue(73),
            borderRadius: getResponsiveValue(40),
            marginLeft: getResponsiveValue(12),
            justifyContent: "center",
            alignItems: 'center'
        },
        Text: {
            fontSize: getResponsiveFontSize(32),
            color: CompanyConfig.AppColor.ContentFront,
            marginRight: getResponsiveValue(30)
        },
        TextView: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: 'auto',
            height: getResponsiveValue(88),
            borderBottomWidth: getResponsiveValue(1),
            borderStyle: 'solid',
            borderColor: CompanyConfig.AppColor.OnPressLine,
            alignItems: "center",
            paddingRight: getResponsiveValue(30)
        },
        Image: {
            borderRadius: getResponsiveValue(74),
            width: getResponsiveValue(148),
            height: getResponsiveValue(148),
        },
        View: {
            width: getResponsiveValue(AppConfig.design.width / 2),
            height: getResponsiveValue(AppConfig.design.height - 90),
            flexDirection: 'column',
            alignItems: "center",
            justifyContent: 'center',
        },
        Name: {
            fontSize: getResponsiveFontSize(32),
            color: CompanyConfig.AppColor.ContentFront,
            marginTop: getResponsiveValue(20),
        },
        Phone: {
            fontSize: getResponsiveFontSize(24),
            color: CompanyConfig.AppColor.ContentFront,
        },
        clickView: {
            width: getResponsiveValue(AppConfig.design.width / 2 - 80),
            height: getResponsiveValue(444),
            marginTop: getResponsiveValue(20),
            marginLeft: getResponsiveValue(20)

        },
        searchTextView: {
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: getResponsiveValue(300),
            height: getResponsiveValue(69),
            // opacity: 0.2,
            borderRadius: 10,
            backgroundColor: CompanyConfig.formatColor(CompanyConfig.AppColor.DescriptionFront, "4d")
        },
        inputView: {
            marginLeft: getResponsiveValue(27),
            // marginTop: getResponsiveValue(5),
            width: getResponsiveValue(250),
            height: getResponsiveValue(69),
            borderColor: 'transparent',
            padding: 0,
            fontSize: getResponsiveFontSize(32),
            textAlignVertical: 'center',
            color: StyleConfig.Main,
        }
    });
    return styles;
}
