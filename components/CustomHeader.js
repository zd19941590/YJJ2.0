import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View, Image, 
    TextInput,
    TouchableHighlight, TouchableOpacity, Animated, ImageBackground,Dimensions
} from 'react-native';
import { getResponsiveValue, getResponsiveFontSize } from '../assets/default.theme';
import CompanyConfig from '../config/company.config.js';
import PropTypes from "prop-types";
import FileHelper from '../helpers/fileHelper.config.js';
import SvgUri from '../components/svguri.js';
import AppConfig from '../config/app.config.js';
let pageStyles = null;
export default class CustomHeader extends Component {
    static propTypes = {
        title: PropTypes.any,
        leftButtonImageSource: PropTypes.any,
        leftButtonOnPress: PropTypes.func,
        rightButtonTitle: PropTypes.any,
        rightButtonImageSource: PropTypes.any,
        rightButtonOnPress: PropTypes.func,
        moreButton: PropTypes.bool,
        rightButtonEnabled: PropTypes.bool,
        buttonHasBackgroundColor: PropTypes.bool,
        sourceColor:PropTypes.string,
        sourceBackGroundColor:PropTypes.string,
    };
    static defaultProps = {
        rightButtonTitle: "确定",
        moreButton: false,
        rightButtonEnabled: true,
        buttonHasBackgroundColor: true
        // menuList: []
    };
    constructor(prop) {
        super(prop);
        this.state = {
            enabled: true,
        }

    }
    componentWillUnmount() {
    }
    componentDidMount() {
    }

    show() {
        if (!this.state.enabled) {
            this.setState({ enabled: true });
        }
    }
    hide() {
        if (this.state.enabled) {
            this.setState({ enabled: false });
        }
    }
    getOffset() {
        return Dimensions.get('window')
      }
    render() {
        setStyle();
        if (!this.state.enabled) return null;
        let operationContentComponent = null;
        let operationComponent = null;
        let sizeWidth = getResponsiveValue(40);
        let leftBtnStyle = [pageStyles.back];
        let indexbtm =[pageStyles.indexbtn]
        let rightBtnStyle = [pageStyles.operation];
        let headerStyle = [pageStyles.header]
        if (!this.props.buttonHasBackgroundColor) {
            leftBtnStyle.push({ backgroundColor:this.props.sourceBackGroundColor?this.props.sourceBackGroundColor: "#FFFFFF00" });
            indexbtm.push({ backgroundColor:this.props.sourceBackGroundColor?this.props.sourceBackGroundColor: "#FFFFFF00" });
            rightBtnStyle.push({ backgroundColor:this.props.sourceBackGroundColor?this.props.sourceBackGroundColor: "#FFFFFF00" });
        }else{
            if(this.props.sourceBackGroundColor){
                leftBtnStyle.push({ backgroundColor:this.props.sourceBackGroundColor });
                indexbtm.push({ backgroundColor:this.props.sourceBackGroundColor });
                rightBtnStyle.push({ backgroundColor:this.props.sourceBackGroundColor });
            }
        }
        if (this.props.rightButtonEnabled) {
            let rightButtonTitle = "确定";
            if (this.props.rightButtonTitle != "" && this.props.rightButtonTitle != null) {
                rightButtonTitle = this.props.rightButtonTitle;
            }
            if (this.props.rightButtonOnPress != null) {
                let imgSource = "sure";
                // operationContentComponent = (<Text style={pageStyles.ok}>{rightButtonTitle}</Text>);
                if (this.props.moreButton || this.props.rightButtonImageSource != null) {
                    imgSource = "more";
                    if (this.props.rightButtonImageSource != null) {
                        imgSource = this.props.rightButtonImageSource;
                    }
                }
                operationContentComponent = (<View ><SvgUri width={sizeWidth} height={sizeWidth} fill={this.props.sourceColor?this.props.sourceColor:CompanyConfig.formatColor(CompanyConfig.AppColor.SecondaryFront)} source={imgSource} /></View>);
            }
            if (operationContentComponent != null) {
                operationComponent = (<TouchableHighlight style={rightBtnStyle} onPress={(p) => {
                    if (this.props.rightButtonOnPress != null) {
                        this.props.rightButtonOnPress(p);
                    }
                }} activeOpacity={0.8}
                    underlayColor={CompanyConfig.AppColor.OnPressSecondary}>
                    {operationContentComponent}
                </TouchableHighlight>);
            }
        }

        if (operationComponent == null) {
            headerStyle.push({ width: getResponsiveValue(1000), left: 0 });
        }
        const { goBack,navigate } = this.props.navigation;
        let leftButtonImageSource = "back";
        if (this.props.leftButtonImageSource) {
            leftButtonImageSource = this.props.leftButtonImageSource;
        }
        let leftButtonOnPress = () => {
            goBack();
       
        };
        if (this.props.leftButtonOnPress != null) {
            leftButtonOnPress = this.props.leftButtonOnPress;
        }
        return (
            <View style={headerStyle} >
                <TouchableHighlight style={leftBtnStyle} onPress={leftButtonOnPress} underlayColor={CompanyConfig.AppColor.OnPressSecondary} >
                    <View  ><SvgUri width={sizeWidth} height={sizeWidth} fill={this.props.sourceColor?this.props.sourceColor: CompanyConfig.formatColor(CompanyConfig.AppColor.SecondaryFront)} source={leftButtonImageSource} /></View>
                </TouchableHighlight>
                <View style={pageStyles.title}>
                </View>
                {operationComponent}
                {
            <TouchableOpacity 
                activeOpacity={0.8} 
                underlayColor={CompanyConfig.AppColor.OnPressSecondary}
                style={indexbtm}
                onPress={() => {
                navigate('Home')
                }}
                setOpacityTo = {{ value: 10, duration: 0.5}}>
                {/* <Image style={{ width: getResponsiveFontSize(50), height: getResponsiveValue(50) }}
                    source={require(`../assets/icons/indexBtn.png`)}
                /> */}
                <Text style={{color: this.props.sourceColor?this.props.sourceColor: CompanyConfig.formatColor(CompanyConfig.AppColor.SecondaryFront),fontWeight: "bold",fontSize: 14}}>首页</Text>
                </TouchableOpacity>
}
            </View>
        );
    }
}

export class HeaderMenuItem extends Component {
    static propTypes = {
        index: PropTypes.number,
        menu: PropTypes.any,
        isFirst: PropTypes.bool,
        isLast: PropTypes.bool,
        onPress: PropTypes.func,
        showIcon: PropTypes.bool
    };
    static defaultProps = {
        isFirst: false,
        isFirst: false,
        showIcon: false
    };
    constructor(props) {
        super(props);
        this.state = {
            selected: false
        }
    }
    componentDidMount() {

        let self = this;
        let menu = self.props.menu;
        if (this.props.showIcon) {
            let alist = [];
            if (menu.DefaultImage != null && menu.DefaultImage != "") {
                if (typeof (menu.DefaultImageUri) == "undefined" || menu.DefaultImageUri == null) {
                    alist.push(FileHelper.fetchFile(menu.DefaultImage));
                }
            }
            if (menu.MouseOverImage != null && menu.MouseOverImage != "") {
                if (typeof (menu.DefaultImageUri) == "undefined" || menu.DefaultImageUri == null) {
                    alist.push(FileHelper.fetchFile(menu.MouseOverImage));
                }
            }
            if (alist.length > 0) {
                Promise.all(alist).then(function (r) {
                    let i = 0;
                    if (menu.DefaultImage != null && menu.DefaultImage != "") {
                        menu.DefaultImageUri = r[i];
                        i = i + 1;
                    }
                    if (menu.MouseOverImage != null && menu.MouseOverImage != "") {
                        menu.MouseOverImageUri = r[i];
                    }
                    self.forceUpdate();
                });
            }
        }
    }
    unselect() {
        this.setState({ selected: false });
    }
    render() {
        let index = this.props.index;
        let menu = this.props.menu;
        let itemStyle = [pageStyles.menuItem]
        let self = this; pageStyles.menuItem
        let selected = self.state.selected;
        let menuTextStyle = [pageStyles.menuText];
        let menuIcon = require('../assets/icons/close_black.png');
        if (menu.DefaultImageUri) {
            menuIcon = { uri: menu.DefaultImageUri };
        }
        if (selected) {
            itemStyle.push(pageStyles.selectedMenuItem);
            menuTextStyle.push(pageStyles.selectedMenuText);
            if (menu.MouseOverImageUri) {
                menuIcon = { uri: menu.MouseOverImageUri };
            }
        }
        if (index == 0) {
            itemStyle.push(pageStyles.firstMenuItem);
        }
        if (this.props.isLast) {
            menuTextStyle.push(pageStyles.lastMenuItem);
        }
        let showIcon = this.props.showIcon;
        return <TouchableHighlight style={itemStyle} onPress={(p) => {
            if (self.props.onPress != null) {
                self.props.onPress(menu);
            }
            self.setState({ selected: true });
        }} activeOpacity={0.8}
            underlayColor={CompanyConfig.AppColor.OnPressSecondary}>
            <View style={{ flexDirection: "row" }} >
                {showIcon ? (<Image style={pageStyles.menuItemIcon} source={menuIcon} />) : null}
                <Text style={menuTextStyle} >{menu.MenuName}</Text>
            </View>
        </TouchableHighlight>
    }
}
export class HeaderMenu extends Component {
    static propTypes = {
        menuList: PropTypes.array,
        showIcon: PropTypes.bool
    };

    static defaultProps = {
        menuList: [],
        showIcon: false
    };
    SPRING_SPEACE = getResponsiveValue(-300);
    constructor(prop) {
        super(prop);
        this.state = {
            pan: new Animated.ValueXY(),
            seat: 0,//记录动画的初始位置
            SelectedMenu: null
        }
        this.toggle = this.toggle.bind(this);
        this.hide = this.hide.bind(this);
        this.show = this.show.bind(this);
        this.menuItemOnPress = this.menuItemOnPress.bind(this);
        setStyle();
    }
    setMenuList(menuList) {
        this.props.menuList = menuList;
        this.forceUpdate();
    }
    enabled = false;
    show() {
        let self = this;
        this.enabled = true;
        Animated.sequence([
            Animated.timing(this.state.pan, {
                // ...SPRING_CONFIG,
                toValue: { x: this.state.seat == 0 ? self.SPRING_SPEACE : 0, y: 0 }, //animate to top right
                duration: 400,
            }),
        ]).start();
        this.state.seat = this.state.seat == 0 ? self.SPRING_SPEACE : 0;
    }
    hide() {
        // let self = this;
        this.enabled = false;
        Animated.sequence([
            Animated.timing(this.state.pan, {
                // ...SPRING_CONFIG,
                toValue: { x: 0, y: 0 }, //animate to top right
                duration: 400,
            }),
        ]).start();
        this.state.seat = 0;
        this.props.onPress;
        this.setState({
            SelectedMenu: null
        });
    }
    toggle() {
        if (this.enabled) {
            this.hide();
        }
        else {
            this.show();
        }
    }
    componentDidMount() {
    }

    getStyle() {
        return [pageStyles.menuContainer, {
            transform: this.state.pan.getTranslateTransform()
        }];
    }
    selectedMenu = null;
    menuItemOnPress(menu, key) {
        let self = this;
        if (self.selectedMenu != null) {
            self.selectedMenu.unselect();
        }
        self.selectedMenu = self.refs[key];
        if (menu.onPress != null) {
            menu.onPress(menu);
        }
        self.hide();
    }
    render() {
        // if (!this.enabled) return null;
        let self = this;
        let menuList = this.props.menuList;
        let showIcon = this.props.showIcon
        let sizeWidth = getResponsiveValue(40)
        if (menuList == null || menuList.length == 0) return null;
        return (
            <Animated.View style={this.getStyle()}>
                <ImageBackground style={pageStyles.menuBGImg} source={CompanyConfig.CompanyBGImg}>
                    <View style={[pageStyles.menu]}>
                        <TouchableOpacity style={pageStyles.btnMenuClose} onPress={() => self.hide()}>
                            <View><SvgUri width={sizeWidth} height={sizeWidth} fill={CompanyConfig.formatColor(CompanyConfig.AppColor.PopupFront)} source="close" /></View>
                        </TouchableOpacity>
                        {
                            menuList.map((menuItem, index, menuList) => {
                                let isLast = index == (menuList.length - 1);
                                return <HeaderMenuItem key={"RightMenuKey" + index} ref={"RightMenuKey" + index}
                                    menu={menuItem} showIcon={showIcon} index={index} isLast={isLast}
                                    onPress={(menu) => { self.menuItemOnPress(menu, "RightMenuKey" + index); }} />
                            })
                        }
                    </View>
                </ImageBackground>
            </Animated.View>);
    }
}


export class SearchHeader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            textValue: "",
            placeholder: this.props.placeholder || "查找",
            textposition: 'center'
        };
    };
    static propTypes = {
        style: PropTypes.any,
        display: PropTypes.bool,
        placeholder: PropTypes.string,
        Search: PropTypes.func
    };
    render() {
        setStyle();
        let { onSubmit, display, style } = this.props;
        let self = this;
        if (self.state.textValue.trim() === "") {
            self.state.textposition = 'center';
        }
        if (display === false) {
            return (
                <View style={pageStyles.header}>
                    <TouchableHighlight style={[pageStyles.back, { backgroundColor: '#00000000' }]} onPress={() => {
                        self.props.navigation.goBack();
                    }} underlayColor={CompanyConfig.AppColor.OnPressSecondary} >
                        <View><SvgUri width={getResponsiveValue(40)} height={getResponsiveValue(40)} fill={CompanyConfig.formatColor(CompanyConfig.AppColor.MainFront)} source={"back"} /></View>
                    </TouchableHighlight>
                </View>
            );
        }
        return (
            <View style={pageStyles.header} >
                <TouchableHighlight style={[pageStyles.back, { backgroundColor: '#00000000' }]} onPress={() => {
                    self.props.navigation.goBack();
                }} underlayColor={CompanyConfig.AppColor.OnPressSecondary} >
                    <View><SvgUri width={getResponsiveValue(40)} height={getResponsiveValue(40)} fill={CompanyConfig.formatColor(CompanyConfig.AppColor.SecondaryFront)} source={"back"} /></View>
                </TouchableHighlight>
                <View style={{
                    width: getResponsiveValue(1220),
                    height: getResponsiveValue(75),
                    borderRadius: 10,
                    backgroundColor: CompanyConfig.AppColor.OnPressMain,
                    opacity: 0.9,
                    flexDirection: "row",
                    alignItems: 'center',
                    paddingLeft: getResponsiveValue(10)
                }}>
                    <SvgUri width={getResponsiveValue(40)} opacity={0.5} height={getResponsiveValue(40)} fill={CompanyConfig.formatColor(CompanyConfig.AppColor.SecondaryFront)} source={"search"} />
                    <TextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={[{
                            width: getResponsiveValue(1180),
                            borderColor: "transparent",
                            marginLeft: getResponsiveValue(70),
                            height: getResponsiveValue(75),
                            borderRadius: getResponsiveValue(10),
                            textAlign: self.state.textposition,
                            zIndex: 100,
                            position: "absolute",
                            fontSize: getResponsiveFontSize(32),
                            color: CompanyConfig.AppColor.SecondaryFront,
                            padding: 0
                        }, style]}
                        disableFullscreenUI={true}
                        placeholder={self.state.placeholder}
                        returnKeyType={'search'}
                        keyboardType={'default'}
                        value={self.state.textValue}
                        caretHidden={false}
                        onChangeText={(textValue) => {
                            self.setState({ textValue, textposition: 'left' });
                        }}
                        autoCapitalize="none"
                        autoCorrect={false}
                        underlineColorAndroid={'transparent'}
                        placeholderTextColor={CompanyConfig.formatColor(CompanyConfig.AppColor.SecondaryFront, '50')}
                        onSubmitEditing={() => {
                            this.props.Search(this.state.textValue);
                        }}
                    >
                    </TextInput>

                </View>


            </View >
        );
    }
}


function setStyle() {
    if (pageStyles != null && !CompanyConfig.isGeneral()) return pageStyles;
    pageStyles = StyleSheet.create({
        header: {
            flexDirection: "row",
            marginTop: getResponsiveValue(20),
            height: getResponsiveValue(80),
            width: getResponsiveValue(1334),
            alignItems: 'center',
            justifyContent: 'flex-start',
            position: "absolute",
            // backgroundColor: CompanyConfig.AppColor.OnPressMain,
            top: 0, zIndex: 10
        },
        back: {
            backgroundColor: CompanyConfig.AppColor.OnPressMain,
            marginLeft: getResponsiveValue(20),
            height: getResponsiveValue(80),
            width: getResponsiveValue(80),
            borderRadius: getResponsiveValue(40),
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100
        },
        indexbtn: {
            backgroundColor: CompanyConfig.AppColor.OnPressMain,
            position: "absolute",
            left: getResponsiveValue(110),
            height: getResponsiveValue(80),
            width: getResponsiveValue(80),
            borderRadius: getResponsiveValue(40),
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100
        },
        backImg: {
            height: getResponsiveValue(40),
            resizeMode: Image.resizeMode.contain
        },
        operation: {
            backgroundColor: CompanyConfig.AppColor.OnPressMain,
            alignItems: "center",
            justifyContent: "center",
            marginRight: getResponsiveValue(20),
            height: getResponsiveValue(80),
            width: getResponsiveValue(80),
            borderRadius: getResponsiveValue(40),
            zIndex: 100
        },
        ok: {
            color: CompanyConfig.StyleColor.MainButtonFront,
            height: getResponsiveValue(60),
            fontSize: getResponsiveFontSize(32)
        },
        title: {
            flex: 1,
            alignItems: "flex-start",
            justifyContent: "flex-start",
            marginLeft: getResponsiveValue(38)
        },
        text: {
            color: CompanyConfig.AppColor.MainFront,
            fontSize: getResponsiveFontSize(32),
            marginLeft: getResponsiveValue(20),
            fontWeight: "bold",
        },
        menuContainer: {
            width: getResponsiveValue(300),
            height: getResponsiveValue(AppConfig.design.height),
            position: "absolute",
            top: 0,
            left: getResponsiveValue(1334),
            zIndex: 120,
            alignItems: "flex-start",
            justifyContent: "flex-start"
        },
        menuBGImg: {
            width: getResponsiveValue(1334),
            height: getResponsiveValue(AppConfig.design.height),
            flex: 1
        },
        menu: {
            width: getResponsiveValue(300),
            height: getResponsiveValue(AppConfig.design.height),
            flexDirection: "column",
            backgroundColor: CompanyConfig.AppColor.PopupBackground
        },
        menuCloseImg: {
            opacity: 0.5,
            width: getResponsiveValue(40),
            height: getResponsiveValue(40),
            resizeMode: Image.resizeMode.contain
        },
        btnMenuClose: {
            height: getResponsiveValue(80),
            width: getResponsiveValue(80),
            borderRadius: getResponsiveValue(40),
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            top: 10,
            left: 10
        },

        menuItem: {
            flexDirection: "row",
            width: getResponsiveValue(300),
            height: getResponsiveValue(112),
            alignItems: "center",
            justifyContent: "center"
        },
        firstMenuItem: {
            marginTop: getResponsiveValue(100)
        },
        lastMenuItem: {
            borderBottomWidth: 0
        },
        menuItemIcon: {
            height: getResponsiveValue(112),
            width: getResponsiveValue(30),
            alignItems: "center",
            justifyContent: "center",
            marginLeft: getResponsiveValue(30),
            resizeMode: Image.resizeMode.contain
        },
        menuText: {
            color: CompanyConfig.AppColor.PopupFront,
            fontSize: getResponsiveFontSize(32),
            textAlign: "center",
            textAlignVertical: "center",
            height: getResponsiveValue(40),
            lineHeight: getResponsiveValue(40),
            borderBottomWidth: getResponsiveValue(1),
            borderColor: CompanyConfig.AppColor.PopupFront,
        },

        selectedMenuItem: {
            backgroundColor: CompanyConfig.AppColor.PopupFront,
        },
        selectedMenuText: {
            color: CompanyConfig.AppColor.PopupBackground,
            fontSize: getResponsiveFontSize(32),
            textAlign: "center",
            textAlignVertical: "center",
        },

        btnImg: {
            height: getResponsiveValue(40),
            resizeMode: Image.resizeMode.contain
        }
    });
    return pageStyles;
}
