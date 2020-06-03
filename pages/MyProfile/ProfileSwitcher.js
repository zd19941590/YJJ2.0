"use strict";

import React from 'react';
import PropTypes from 'prop-types';
import {
    Dimensions,
    StyleSheet,
    Alert,
    View,
    Text,
    TouchableHighlight,
    FlatList,
} from 'react-native';
import FileHelper from "../../helpers/fileHelper.config";
import SyncImg from '../../components/SyncImgFetch';
import SvgUri from '../../components/svguri.js';
import { formatStr } from "../../helpers/utils";

import * as MessageBar from '../../components/OperationMessage.js';
import Spinner2 from '../../components/Spinner2';

import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme';
import Constaints from '../../config/Constaints';
import DeviceInfo from 'react-native-device-info';

import axios from "axios";
import Services from '../../services/loginregisterService';
import CommonService, { formatMenu } from '../../services/common';

const { height, width } = Dimensions.get('window');

class ProfileSwitcher extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dataSource: PropTypes.array
        }
    }

    componentDidMount() {
        let service = new Services(axios.CancelToken.source());
        let cService = new CommonService();

        service.GetFacturers((result) => {
            let succeed = result.data.success;
            let data = result.data.data;

            if (succeed) {
                if (data.length) {
                    let sysNos = [];
                    data.map((d, idx, obj) => {
                        sysNos.push(d.SysNo);
                    });
                    sysNos.push(0);

                    cService.GetCompanyParameterList(sysNos)
                        .then((result) => {
                            var data = result.data;
                            if (data !== null && data.length > 0) {
                                data.map((d, idx, obj) => {
                                    FileHelper.fetchFile(d.Value);
                                })
                            }
                        })
                }

                this.initdata(data);
            } else {
                Alert.alert('提示', result.data.message, [
                    { text: '确定' }
                ])
            }
        }, (error) => {
            Alert.alert('提示', error.message, [
                { text: '确定' }
            ])
        });
    }

    initdata(data) {
        let pageCount = Math.floor(data.length / 10);
        let offset = data.length % 10;
        let dataSource = [];

        for (let index = 0; index < pageCount; index++) {
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
            dataSource.push(formatpagedata);
        }

        if (offset) {
            if (offset <= 5) {
                let formatpagedata = [];
                let pagedata = data.slice(pageCount * 10);
                formatpagedata.push(pagedata);
                dataSource.push(formatpagedata);
            } else {
                let formatpagedata = [];
                let pagedata = data.slice(pageCount * 10, pageCount * 10 + 5);
                formatpagedata.push(pagedata);
                pagedata = data.slice(pageCount * 10 + 5);
                formatpagedata.push(pagedata);
                dataSource.push(formatpagedata);
            }
        }
        this.setState({
            dataSource: dataSource
        });
    }

    renderHeader() {
        return (
            <View style={styles.header}>
                <TouchableHighlight
                    style={styles.backBtn}
                    onPress={() => this.props.navigation.goBack()}
                >
                    <SvgUri width={getResponsiveValue(40)} height={getResponsiveValue(40)} fill={'#969ca2'} source='back' />
                </TouchableHighlight>
                <Text style={styles.navTitle}>切换厂商</Text>
            </View >
        );
    }

    renderList() {
        let dataSource = this.state.dataSource;
        if (!dataSource || !dataSource.length) {
            return null;
        }

        return (
            <FlatList
                style={styles.table}
                removeClippedSubviews={true}
                horizontal={true}
                pagingEnabled={true}
                data={dataSource}
                getItemLayout={(data, index) => (
                    { length: width, offset: width * index, index }
                )}
                initialNumToRender={1}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <ProfileCell key={index} datas={item} />
                )}
            />
        );
    }

    render() {
        return (
            <View style={styles.background}>
                {this.renderHeader()}
                {this.renderList()}
            </View>
        )
    }
}

class ProfileCell extends React.Component {
    render() {
        let datas = this.props.datas;
        if (!datas || !datas.length) {
            return null;
        }

        return (
            <View style={[styles.cell, this.props.style]}> {
                datas.map((data, index) => {
                    return (
                        <View key={index} style={{ maxHeight: getResponsiveValue(550), flexDirection: 'column' }}> {
                            data.map((elm, idx) => {
                                return (
                                    <ProfileItem key={(index + 1) * (idx + 1)} data={elm} />
                                );
                            })
                        } </View>
                    );
                })
            } </View>
        );
    }
}

class ProfileItem extends React.Component {
    change() {
        let service = new Services(axios.CancelToken.source());
        let data = this.props.data;

        let devicesinfo = {
            DeviceUniqueID: DeviceInfo.getUniqueID(),
            DeviceModel: DeviceInfo.getModel(),
            DeviceManufacturer: DeviceInfo.getManufacturer(),
            DeviceSystemName: DeviceInfo.getSystemName(),
            DeviceIsTable: DeviceInfo.isTablet() === null ? "" : DeviceInfo.isTablet().toString()
        };

        let cacheKey = Constaints.STORAGE_FILE_DOWNLOAD_LIST_ID_KEY();
        global.storage.remove({ key: cacheKey });
        global.storage.remove({ key: 'SelectedShoppingCarCustomer' });
        let tempCompanyID = global.AppAuthentication.AppCompanyID;
        let tempuser = Object.assign({}, global.AppAuthentication);
        global.AppAuthentication.AppCompanyID = data.AuthID;
        this._spinner.showLoading();
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
                //     common.AddDeviceToBaiduPushTag(channelid).then((result) => {
                //     })
                // });
                let menuList = rresult.data.MenuList;
                formatMenu(menuList);
                global.storage.save({ key: "AppMenu", data: menuList });

                if (rresult.data.CompanyConfigList.length > 0) {
                    global.storage.save({ key: "CompanyParameters", data: rresult.data.CompanyConfigList });
                    CompanyConfigHelper.forceUpdate(() => {
                        if (swNavigation) {
                            global.storage.save({ key: "DataDownloadAlert", data: 0 });
                            this._spinner.hideLoading();
                            swNavigation.dispatch(resetAction);
                        }
                    }, () => {
                        if (swNavigation) {
                            global.storage.save({ key: "DataDownloadAlert", data: 0 });
                            this._spinner.hideLoading();
                            swNavigation.dispatch(resetAction);
                        }
                    });
                }
            } else {
                MessageBar.showMessage(rresult.message, 3);
                global.AppAuthentication.AppCompanyID = tempCompanyID;
                this._spinner.hideLoading();
            }
        }, (error) => {
            MessageBar.showMessage(error.message, 3);
            global.AppAuthentication.AppCompanyID = tempCompanyID;
            this._spinner.hideLoading();
        });
    }

    action() {
        let data = this.props.data;

        Alert.alert('提示', `确定切换到“${data.Name}”？`, [
            { text: '取消' },
            { text: '确定', onPress: () => this.change() }
        ]);
    }

    renderContent() {
        let data = this.props.data;
        let sysNo = data.SysNo;
        let selected = data.IsSelected;

        if (!sysNo) {
            return (
                <View style={styles.itemContent}>
                    <Text style={styles.addProfileTitle}>添加厂商</Text>
                </View>
            )
        }

        return (
            <View style={styles.itemContent}>
                <Spinner2 ref={c => (this._spinner = c)} />
                <SyncImg
                    imgStyle={{ height: getResponsiveValue(72), width: getResponsiveValue(72), borderRadius: getResponsiveValue(36), marginLeft: getResponsiveValue(21) }}
                    imgSize={120}
                    imgSource={data.Logo}
                />
                <Text style={[styles.itemProfileTitle, { color: selected ? "#ffffff" : "#222222" }]}>{formatStr(data.Name, 5)}</Text> {
                    selected ? (
                        <View style={styles.itemSelectContent}>
                            <SvgUri width={getResponsiveValue(18)} height={getResponsiveValue(18)} fill={CompanyConfig.AppColor.PopupFront} source={"sure"} />
                        </View>) : (
                            <View style={{
                                position: 'absolute',
                                right: getResponsiveValue(21),
                                width: getResponsiveValue(30),
                                height: getResponsiveValue(30),
                            }} />
                        )
                }
            </View>
        )
    }

    render() {
        let data = this.props.data;
        if (!data) {
            return null;
        }

        let renderStyle = data.IsSelected ? highlighted : normal;

        return (
            <TouchableHighlight
                style={[styles.item, renderStyle, this.props.style]}
                onPress={() => this.action()}
            >
                {this.renderContent()}
            </TouchableHighlight >
        );
    }
}

const highlighted = {
    backgroundColor: '#18a9ed',
    borderStyle: 'solid',
    borderWidth: getResponsiveValue(1),
    borderColor: '#18a9ed',
}
const normal = {
    backgroundColor: '#ffffffb3',
}

const styles = StyleSheet.create({
    background: {
        backgroundColor: "black",
        flex: 1,
    },

    header: {
        height: getResponsiveValue(90),
        width: width,
        backgroundColor: '#ffffffd0',
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtn: {
        height: getResponsiveValue(69),
        width: getResponsiveValue(73),
        borderRadius: getResponsiveValue(40),
        marginLeft: getResponsiveValue(12),
        justifyContent: "center",
        alignItems: 'center',
    },
    navTitle: {
        fontSize: getResponsiveValue(32),
        color: '#3a3a3a',
        marginLeft: getResponsiveValue(535),
    },

    table: {
        // backgroundColor: 'green'
    },

    cell: {
        width: width,
        height: height - getResponsiveValue(90),
        backgroundColor: '#9999FF40',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },

    item: {
        height: getResponsiveValue(90),
        width: getResponsiveValue(437),
        borderRadius: getResponsiveValue(18),
        marginVertical: getResponsiveValue(7),
        marginHorizontal: getResponsiveValue(35),
    },

    // Item content styles here

    itemContent: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
    },


    itemSelectContent: {
        position: 'absolute',
        right: getResponsiveValue(21),
        width: getResponsiveValue(30),
        height: getResponsiveValue(30),
        borderRadius: getResponsiveValue(15),
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
    },


    itemProfileTitle: {
        fontSize: getResponsiveFontSize(32),
        backgroundColor: 'transparent',
        marginLeft: getResponsiveValue(15),
    },

    addProfileTitle: {
        fontSize: getResponsiveFontSize(32),
        color: "#18a9ed",
        textAlign: 'center',
    },

});

export default ProfileSwitcher;