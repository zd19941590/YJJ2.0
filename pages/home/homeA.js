import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    Animated,
    TouchableOpacity,
    ImageBackground,
    ScrollView, TouchableHighlight, Alert
} from 'react-native';
import CommonService from '../../services/common.js';
import AppConfig from '../../config/app.config.js';
import CompanyConfig, { CompanyConfigHelper } from '../../config/company.config.js';
import PropTypes from "prop-types";
import { getResponsiveValue, getResponsiveFontSize } from '../../assets/default.theme';
import FileHelper from '../../helpers/fileHelper.config.js'
import SvgUri from '../../components/svguri.js';

//const SPRING_CONFIG = { tension: 7, friction: 6 };//定义动画我们给弹性动画设置了 SPRING_CONFIG 配置，包括 tension（张力）和 friction（摩擦）值，会有一个小小回弹动画。
const SPRING_SPEACE = getResponsiveValue(440);
let homeStyles = null;
//商品
import ProductList from '../../pages/product/productlist.js';
//一品多图
import ProductSolutionList from '../../pages/productsolution/list.js';
import ContentListPage from '../../pages/appcontent/list.js';
import { ContentDetail } from '../../pages/appcontent/detail.js';
import DispatchMenuAsDetail from '../../pages/common/DispatchMenuAsDetail';
import DispatchMenuAsList from '../../pages/common/DispatchMenuAsList';
import DispatchMenuAsLattice from '../../pages/common/DispatchMenuAsLattice';
import Product720 from '../../pages/product/product720';


function setStyle(config) {
    if (config == undefined || config == null) {
        if (homeStyles != null) return homeStyles;
        config = CompanyConfig;
    }
    homeStyles = StyleSheet.create({
        splashImg: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            resizeMode: Image.resizeMode.contain,
            backgroundColor: config.AppColor.PageBackground
        },
        bgimg: {
            flex: 1,
            //flexDirection: "column",
            alignItems: 'center',
            justifyContent: 'center',
        },
        menu: {
            flex: 1,
            flexDirection: "row",
            position: "absolute",
            bottom: getResponsiveValue(230)
        },
        menuItem: {
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: getResponsiveValue(440),

            // marginLeft: getResponsiveValue(20),
            // marginRight: getResponsiveValue(20),
        },
        childrenMenuItem: {
            // marginLeft:getResponsiveValue(100),
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: getResponsiveValue(400),
            height: getResponsiveValue(100),
            // marginLeft: getResponsiveValue(20),
            // marginRight: getResponsiveValue(20),
            borderRadius: getResponsiveValue(30)
        },
        menuItemContainer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            width: getResponsiveValue(250),
            height: getResponsiveValue(80),
            marginBottom: getResponsiveValue(20)
            // paddingLeft: getResponsiveValue(23),
            // borderLeftWidth: getResponsiveValue(5)

        },
        menuItemImg: {
            width: getResponsiveValue(40),
            height: getResponsiveValue(40)
        },
        menuItemTextContainer: {
            flex: 1,
            flexDirection: "column",
            // alignItems: "center",
            justifyContent: "center",
            paddingTop: getResponsiveValue(10),
            paddingBottom: getResponsiveValue(10),
            // height: getResponsiveValue(80),
            marginLeft: getResponsiveValue(10),

        },
        menuItemText: {
            // width: getResponsiveValue(150),
            color: CompanyConfig.AppColor.MainFront,
            // textAlign: "center",
            // textAlignVertical: "center",
            fontSize: getResponsiveFontSize(30),
        },
        menuItemTextEn: {
            marginTop: getResponsiveValue(-10),
            color: CompanyConfig.AppColor.MainFront,
            // textAlign: "center",
            // textAlignVertical: "center",
            fontSize: getResponsiveFontSize(14)
        },
        topbar: {
            position: "absolute",
            right: getResponsiveValue(48),
            top: getResponsiveValue(15),
            height: getResponsiveValue(80),
            width: getResponsiveValue(200),
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
        },
        topbarItem: {
            width: getResponsiveValue(80),
            height: getResponsiveValue(80),
            borderRadius: getResponsiveValue(40),
            alignItems: "center",
            justifyContent: "center",
        },
        more: {
            marginLeft: getResponsiveValue(50),
        },
        topbarItemImg: {
            width: getResponsiveValue(42),
            height: getResponsiveValue(42)
        },
        notice: {
            position: 'absolute',
            left: getResponsiveValue(30),
            top: getResponsiveValue(0),
            width: getResponsiveValue(20),
            height: getResponsiveValue(20),
            backgroundColor: '#e60012',
            borderRadius: 100
        },
        header: {
            flexDirection: "row",
            height: getResponsiveValue(90),
            width: getResponsiveValue(150),
            alignItems: 'center',
            justifyContent: 'flex-start',
            position: "absolute",
            backgroundColor: CompanyConfig.AppColor.OnPressMain,
            zIndex: 100,
            top: 0,
        },
        back: {
            marginLeft: getResponsiveValue(20),
            height: getResponsiveValue(80),
            width: getResponsiveValue(80),
            borderRadius: getResponsiveValue(40),
            alignItems: "center",
            justifyContent: "center"
        },
        LeftViewShowWap: {
            position: "absolute",
            flexDirection: "column",
            zIndex: 300,
            // top: 0,
            top: getResponsiveValue((AppConfig.design.height * 0.25) / 2 + 30),
            left: getResponsiveValue(-440),
            height: getResponsiveValue(AppConfig.design.height * 0.75),
            // width: getResponsiveValue(1344),
        },
        menuStyle: {
            marginTop: getResponsiveValue(20),
            justifyContent: "center",
            alignItems: "center",
            marginLeft: getResponsiveValue(20),
            position: "absolute",
            width: getResponsiveValue(80),
            height: getResponsiveValue(80),
            zIndex: 500
        },
        menuTouchHeight: {
            justifyContent: "center",
            alignItems: "center",
            width: getResponsiveValue(80),
            height: getResponsiveValue(80),
            borderRadius: getResponsiveValue(40),
            //backgroundColor: CompanyConfig.AppColor.OnPressMain,
        },
        View: {
            position: "absolute",
            flexDirection: "column",
            zIndex: 300,
            // top: 0,
            // left: getResponsiveValue(0),
            width: getResponsiveValue(1334),
            height: getResponsiveValue(AppConfig.design.height),
            // flex: 1
        },

        clickView: {
            width: getResponsiveValue(934),
            height: getResponsiveValue(AppConfig.design.height * 0.75),
        }
    });
    return homeStyles;
}
export default class HomeA extends Component {
    static propTypes = {
        MenuList: PropTypes.array,
        navigation: PropTypes.any,
        hasNotice: PropTypes.number
    };
    constructor(prop) {
        super(prop);
        this.state = {
            menuItem: null,
            component: '',
            scalePan: new Animated.Value(1),
            Leftpan: new Animated.Value(0),
            bottomPan: new Animated.Value(0),
            // hasNotice: false,
            ShowShoppingCart: false,
            seat: 1,//记录动画的初始位置
            needlogin: prop.needlogin,
            isGuest: true


        };
        this.takeMenuItemCode = this.takeMenuItemCode.bind(this);
        this.startAnimation = this.startAnimation.bind(this);
    }

    refreshShoppingCar() {
        let service = new CommonService();
        service.fetchAuthorityForKey('APP_SOManager', (valid) => {
            this.setState({
                ShowShoppingCart: valid,
            });
        });
    }
    componentDidMount() {
        setStyle();
        let self = this;
        global.storage.load(
            {
                key: 'loginState',
                autoSync: false
            }).then(auth => {
                if (auth) {
                    this.state.isGuest = auth.IsGuest
                }
            }).catch(err => {
            });
        let cService = new CommonService();
        cService.IsPossessPermission("APP_SOManager", () => this.setState({
            ShowShoppingCart: true
        }))
    }
    UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.MenuList != null && nextProps.MenuList.length > 0) {
            this.state.menuItem = nextProps.MenuList[0]
            // this.setState({
            //     menuItem: nextProps.MenuList[0]
            // });
            this.refs["LeftMenu"].state.menuClecked = nextProps.MenuList[0].SysNo
        }
    }
    takeMenuItemCode(menuItem) {
        if (this.state.menuItem == null || this.state.menuItem.SysNo != menuItem.SysNo) {
            if (this.state.menuItem != null && menuItem.LinkCode == this.state.menuItem.LinkCode) {
                this.setState({
                    menuItem: null
                }, function () {
                    this.setState({
                        menuItem: menuItem
                    });
                });
            }
            else {
                this.setState({
                    menuItem: menuItem
                });
            }
        }
    }
    getComponent() {
        // const { navigate } = this.props.navigation;
        let menuItem = this.state.menuItem;
        let self = this;
        if (menuItem == null) return null
        let menuItemCode = menuItem.LinkCode;
        let component = null;
        let menuCode = new String(menuItemCode).toLowerCase();
        if (menuCode == "dispatchmenuaslist") {
            component = (<DispatchMenuAsList navigation={this.props.navigation} menu={menuItem}
                leftButtonImageSource=" "
                leftButtonOnPress={this.startAnimation} />)
        }
        else if (menuCode == "dispatchmenuasdetail") {
            component = (<DispatchMenuAsDetail navigation={this.props.navigation} menu={menuItem}
                leftButtonImageSource=" "
                leftButtonOnPress={this.startAnimation} />)
        }
        else if (menuCode == "productlist") {
            component = (<ProductList navigation={this.props.navigation} menu={menuItem}
                leftButtonImageSource=" "
                leftButtonOnPress={this.startAnimation}
                showSearchViewHandler={() => this.hide()}
                searchViewSearchHandler={() => this.hide()}
                searchViewBackHandler={() => this.hide()}
            />);
        }
        else if (menuCode == "productsolutionlist") {
            component = (<ProductSolutionList navigation={this.props.navigation} menu={menuItem}
                leftButtonImageSource=" "
                leftButtonOnPress={this.startAnimation} />);
        }
        else if (menuCode == "contentlist") {
            component = (<ContentListPage menu={menuItem} navigation={this.props.navigation} menu={menuItem}
                leftButtonImageSource=" "
                leftButtonOnPress={this.startAnimation}
            />);
        }
        else if (menuCode == "contentdetail") {
            component = (<ContentDetail sysno={menuItem.Params.DetailSysNo} navigation={this.props.navigation} menu={menuItem}
                leftButtonImageSource=" "
                leftButtonOnPress={this.startAnimation} />);
        } else if (menuCode == "dispatchmenuaslattice") {
            component = (<DispatchMenuAsLattice navigation={this.props.navigation} menu={menuItem}
                leftButtonImageSource=" "
                leftButtonOnPress={this.startAnimation} />)
        } else if (menuCode == "product720") {
            component = (<Product720 navigation={this.props.navigation} menu={menuItem}
                leftButtonImageSource=" "
                leftButtonOnPress={this.startAnimation} />)
        }
        else {
            return null;
        }
        return component;

    }
    getStyle() {
        setStyle();
        return [homeStyles.View,
        {
            transform: [{ scale: this.state.scalePan }, { translateX: this.state.Leftpan }, { translateY: this.state.bottomPan }],
        },
        ];
    }


    hide() {
        let self = this;
        self.refs["MenuButton"].hideMenu();
    }
    startAnimation() {
        let scaleValue = 0.75;
        let LeftValue = getResponsiveValue(330);
        let bottomPan = getResponsiveValue(40);
        Animated.parallel([
            Animated.timing(this.state.scalePan, {
                toValue: this.state.seat == 1 ? scaleValue : 1,
                duration: 300,
                useNativeDriver: true
            }),
            Animated.timing(this.state.Leftpan, {
                toValue: this.state.seat == 1 ? LeftValue : 0,
                duration: 300,
                useNativeDriver: true
            }),
            Animated.timing(this.state.bottomPan, {
                toValue: this.state.seat == 1 ? bottomPan : 0,
                duration: 300,
                useNativeDriver: true
            }),
        ]).start();
        this.refs["MenuButton"].startAnimation();
        this.refs["LeftMenu"].startAnimation();
        this.state.seat = this.state.seat == 1 ? scaleValue : 1;
    }
    render() {
        setStyle();
        const { navigate } = this.props.navigation;
        let self = this;
        let sizeWidth = getResponsiveValue(42);
        let height = AppConfig.design.height;
        let viewHeight = (height * 0.25) / 2 + 30
        return (
            <ImageBackground style={{ width: getResponsiveValue(1334), height: getResponsiveValue(AppConfig.design.height) }} source={CompanyConfig.CompanyBGImgWithLogo} >
                <MenuButton ref="MenuButton" opress={() => this.startAnimation()} />
                <Animated.View style={this.getStyle()}>
                    {self.getComponent()}
                </Animated.View>
                <View style={{
                    height: getResponsiveValue(viewHeight), width: getResponsiveValue(1334), flexDirection: "row", alignItems: "center",
                    position: "absolute",
                    top: 0,
                    zIndex: 150,
                    justifyContent: 'flex-end'
                }}>
                    <TouchableHighlight style={[homeStyles.topbarItem, { marginRight: getResponsiveValue(30) }]} onPress={() => navigate("MessageCenter")} activeOpacity={0.8} underlayColor={CompanyConfig.StyleColor.HomePageA.MenuItemPressBackground} >
                        <View style={{ height: getResponsiveValue(50), width: getResponsiveValue(50), alignItems: 'center', justifyContent: 'center' }}><SvgUri width={sizeWidth} height={sizeWidth} fill={CompanyConfig.AppColor.SecondaryFront} source="message" />
                            {this.props.hasNotice > 0 ?
                                <View style={homeStyles.notice}>
                                    <Text style={{ fontSize: getResponsiveFontSize(20), borderRadius: getResponsiveValue(12), backgroundColor: 'transparent' }}>{this.props.hasNotice}
                                    </Text>
                                </View> : <View />}
                        </View>
                    </TouchableHighlight>
                    {this.state.ShowShoppingCart ? <TouchableHighlight style={[homeStyles.topbarItem, { marginRight: getResponsiveValue(30) }]} onPress={() => navigate("ShoppingCart", { ShowSearch: true })} activeOpacity={0.8} underlayColor={CompanyConfig.StyleColor.HomePageA.MenuItemPressBackground} >
                    </TouchableHighlight> : null}


                    <View style={[homeStyles.topbarItem, { marginRight: getResponsiveValue(30) }]}>
                        <TouchableHighlight style={[homeStyles.topbarItem]} onPress={() => {
                            storage.load(
                                {
                                    key: 'loginState',
                                    autoSync: false
                                }).then(auth => {
                                    if (auth != null) {
                                        navigate("CustomerIndex");
                                    }
                                    else {
                                        navigate("Login");
                                    }
                                }).catch(err => {
                                    navigate("Login");
                                });
                        }} activeOpacity={0.8} underlayColor={CompanyConfig.StyleColor.HomePageA.MenuItemPressBackground} >

                            <View >
                                <SvgUri width={sizeWidth} height={sizeWidth} fill={CompanyConfig.AppColor.SecondaryFront} source="user" />
                            </View>

                        </TouchableHighlight>
                        {typeof global.NeedLogin === 'undefined' || global.NeedLogin ? (
                            <View style={{
                                position: 'absolute', right: getResponsiveValue(20), top: getResponsiveValue(15), backgroundColor: 'red', width: getResponsiveValue(20), height: getResponsiveValue(20), borderRadius: getResponsiveValue(10), alignItems: 'center', justifyContent: 'center'
                            }} >
                                <SvgUri width={getResponsiveValue(10)} height={getResponsiveValue(10)} fill={"#FFF"} source="needlogin" />
                            </View>
                        ) : null}

                    </View>
                    
                    {this.state.isGuest ? null : <TouchableHighlight style={[homeStyles.topbarItem, { marginRight: getResponsiveValue(30) }]} onPress={() => navigate("ProductList", { ShowSearch: true })} activeOpacity={0.8} underlayColor={CompanyConfig.StyleColor.HomePageA.MenuItemPressBackground} >
                        <View ><SvgUri width={sizeWidth} height={sizeWidth} fill={CompanyConfig.AppColor.SecondaryFront} source="search" /></View>
                    </TouchableHighlight>}
                    <TouchableHighlight style={[homeStyles.topbarItem, { marginRight: getResponsiveValue(30) }]} onPress={() => navigate("More", { refresh: () => this.refreshShoppingCar() })} activeOpacity={0.8} underlayColor={CompanyConfig.StyleColor.HomePageA.MenuItemPressBackground} >
                        <View ><SvgUri width={sizeWidth} height={sizeWidth} fill={CompanyConfig.AppColor.SecondaryFront} source="homemore" /></View>
                    </TouchableHighlight>
                </View>
                <LeftMenu MenuList={self.props.MenuList} ref="LeftMenu" startAnimation={this.startAnimation} menuOnPress={this.takeMenuItemCode} navigation={this.props.navigation}></LeftMenu>
            </ImageBackground>
        );
    }
}

export class LeftMenu extends Component {
    static propTypes = {
        menuOnPress: PropTypes.func,
        MenuList: PropTypes.array,
        navigation: PropTypes.any
    };
    constructor(props) {
        super(props);
        this.state = {
            ShowMenu: true,
            pan: new Animated.ValueXY(),
            seat: 0,//记录动画的初始位置
            oldChecked: '',
            IsclickViewShow: false,
            menuClecked: null
        };
    }
    startAnimation() {
        Animated.sequence([
            Animated.timing(this.state.pan, {
                toValue: { x: this.state.seat == 0 ? SPRING_SPEACE : 0, y: 0 },
                duration: 300,
                useNativeDriver: true
            }),
        ]).start();
        this.state.seat = this.state.seat == 0 ? SPRING_SPEACE : 0;
        setTimeout(() => {
            if (this.state.seat == 0) {
                this.setState({
                    IsclickViewShow: false
                })
            } else {
                this.setState({
                    IsclickViewShow: true
                })
            }
        }, 300);
    }
    getStyle() {
        setStyle();
        return [homeStyles.LeftViewShowWap, {
            transform: this.state.pan.getTranslateTransform()
        }];
    }
    componentDidMount() {

        let self = this;
        CompanyConfigHelper.ready(function (companyConfig) {
            setStyle(companyConfig);
            self.forceUpdate();
        }, error => {
        });
    }

    render() {
        let menuList = [];
        let self = this;
        if (self.props.MenuList != null && self.props.MenuList.length > 0) {
            menuList = this.props.MenuList;
        };
        // const { navigate } = this.props.navigation;
        let height = AppConfig.design.height * 0.75;
        return (
            <Animated.View style={this.getStyle()}>
                <View style={{ height: getResponsiveValue(height), flexDirection: "row", }}>
                    <View style={{ flexDirection: "column", width: getResponsiveValue(440), alignItems: "center", justifyContent: "center", justifyContent: "center", }}>
                        {/* <View style={{ flexDirection: "column", justifyContent: "center", height: getResponsiveValue(90), }}>
                        </View> */}
                        <View style={{ height: getResponsiveValue(height), width: getResponsiveValue(440), }}>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {menuList.map((menuItem, index, list) => {
                                    return (
                                        <View key={menuItem.SysNo} style={homeStyles.menuItem}>
                                            <HomeMenuItem menuOnPress={(sender, menuItem) => {
                                                self.props.menuOnPress(menuItem);
                                                // self.props.startAnimation();
                                                // setTimeout(() => {
                                                // }, 200);
                                                this.state.menuClecked = menuItem.SysNo;
                                            }} menuClecked={this.state.menuClecked} menu={menuItem} ref={"imgBtn" + index} key={menuItem.SysNo} navigation={this.props.navigation} ></HomeMenuItem>
                                            {/* <View style={{ width: getResponsiveFontSize(360), borderTopWidth: getResponsiveFontSize(1), height: 0, borderColor: CompanyConfig.AppColor.Line }}></View> */}
                                        </View>
                                    );
                                })
                                }
                            </ScrollView>
                        </View>

                    </View>
                    {this.state.IsclickViewShow ? <TouchableOpacity style={homeStyles.clickView} onPress={() => this.props.startAnimation()}>
                        <View style={homeStyles.clickView}>
                        </View>
                    </TouchableOpacity> : null}
                </View>
            </Animated.View>
        )
    }
}

export class HomeMenuItem extends Component {
    static propTypes = {
        menuOnPress: PropTypes.func,
        menu: PropTypes.any
    };
    _root;
    constructor(props) {
        super(props);
        this.state = {
            // currentMenu: null
        };
    }
    componentDidMount() {
        let self = this;
        let menu = this.props.menu;
        if (menu.DefaultImage != null && menu.DefaultImage != "") {
            FileHelper.fetchFile(menu.DefaultImage).then(path => {
                menu.DefaultImageUri = path;
                self.forceUpdate();
            });
        }
        if (menu.MouseOverImage != null && menu.MouseOverImage != "") {
            FileHelper.fetchFile(menu.MouseOverImage).then(path => {
                menu.MouseOverImageUri = path;
            });
        }
    }
    showChildrenList() {
    }
    menuItemOnPress(menuItem) {
        let self = this;
        self.props.menuOnPress(self, menuItem);
    }
    render() {
        setStyle();
        let menuItem = this.props.menu;
        // let childrenList = menuItem.Children;
        // const { navigate } = this.props.navigation;

        let iconName = "home";
        let menuCode = new String(menuItem.LinkCode).toLowerCase();
        if (menuCode == "home") {
            iconName = "home";
            menuItem.LinkCode = "MenuDispatcher";
        }
        else if (menuCode == "productlist") {
            iconName = "product";
        }
        else if (menuCode == "productsolutionlist") {
            iconName = "product";
        }
        if (menuItem.DefaultImageUri) {
            iconName = menuItem.DefaultImageUri;
        }
        return (
            <View style={{ flexDirection: "row", }}  >
                <TouchableHighlight underlayColor={'#ffffff00'} onPress={() => this.menuItemOnPress(menuItem)}>
                    <View style={[homeStyles.menuItemContainer, this.props.menuClecked == menuItem.SysNo ? null : { opacity: 0.5 }]}  >
                        <Image resizeMode="cover" source={{ uri: iconName }} style={homeStyles.menuItemImg} key={menuItem.SysNo} >
                        </Image>
                        <View style={homeStyles.menuItemTextContainer}>
                            <Text style={homeStyles.menuItemText}>{menuItem.MenuName}</Text>
                            <Text style={homeStyles.menuItemTextEn}>{menuItem.Memo}</Text>
                        </View>
                    </View>
                </TouchableHighlight>
            </View>
        );
    }
}
export class MenuButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: true,
            rotateZ: new Animated.Value(0),
            seat: 1,//记录动画的初始位置
        };
    }
    menuStyle() {
        return [homeStyles.menuStyle, { transform: [{ rotateZ: this.state.rotateZ.interpolate({ inputRange: [0, 90], outputRange: ['0deg', '90deg'] }) }] }]
    }
    startAnimation() {
        Animated.parallel([
            Animated.timing(this.state.rotateZ, {
                toValue: this.state.seat == 1 ? 90 : 0,
                duration: 300,
            }),
        ]).start();
        this.state.seat = this.state.seat == 1 ? 0 : 1;
    }
    hideMenu() {
        if (this.state.show) {
            this.setState({
                show: false
            })
        } else {
            this.setState({
                show: true
            })
        }
    }
    render() {
        return (<View>
            {this.state.show ? <Animated.View style={this.menuStyle()}>
                <TouchableHighlight underlayColor={CompanyConfig.AppColor.OnPressSecondary} style={homeStyles.menuTouchHeight} onPress={() => this.props.opress()}>
                    <View>
                        <SvgUri width={getResponsiveValue(40)} height={getResponsiveValue(40)} fill={CompanyConfig.AppColor.SecondaryFront} source="menu" />
                    </View>
                </TouchableHighlight>
            </Animated.View> : null}
        </View>
        )
    }
}
