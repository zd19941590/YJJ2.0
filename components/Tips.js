import React from 'react';
import PropTypes from "prop-types";
import { View, Text, TouchableOpacity, Animated, Vibration, Easing, InteractionManager } from 'react-native';
import { getResponsiveValue, getResponsiveFontSize } from '../assets/default.theme';

//let timeouts = [];

export default class Tips extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tipsDirection: 'top',
            tipsTime: 3000,
            isShow: null,
            tipDIY: false,   //用户DIY内容 ，默认false
            tipsScale: new Animated.Value(0.5)//0.5的效果最好，其它的好像首次加载页面后点击动画 会出现 放大一闪 的bug
        };
        let tipsContent = null;
        let tipsStyle = {
            width: getResponsiveValue(170),
            height: getResponsiveValue(87)
        };
        let _clickdom = null;
        let _nextime = 0;
        this.tipsStyle = tipsStyle;
        this.tipsContent = tipsContent;
        this._nextime = _nextime;
        this._clickdom = _clickdom;

        this.timeouts = [];

        this.showTipinit = this.showTipinit.bind(this);
        this._showAction = this._showAction.bind(this);
        this._hideAction = this._hideAction.bind(this);
    }
    static propTypes = {
        tipsStyle: PropTypes.object,
        tipsTextStyle: Text.propTypes.style,
        tipsTime: PropTypes.number,
        tipsContent: PropTypes.oneOf([PropTypes.string, PropTypes.element]),
        tipsDirection: PropTypes.string
    };
    showTipinit(tipprops) {
        let self = this;
        self.state.isShow = null;
        self.state.tipDIY = null;
        self._clickdom = null;
        self._clickdom = tipprops;
        if (self._clickdom !== null) {
            // let tipsposition = {};
            //x:距父组件的左边的距离 y:距父组件的上面的距离 width:组件的宽 height:组件的高 left:距屏幕的左边的距离 top:距屏幕的上边的距离
            self._clickdom.measure((x, y, width, height, left, top) => {
                let leftt = left - Math.abs((self.tipsStyle.width - width) / 2);
                let topp = top - Math.abs((self.tipsStyle.height - height) / 2) - getResponsiveValue(87) * 3 / 4;
                self.tipsStyle["left"] = leftt;
                self.tipsStyle["top"] = topp;
                if (self._clickdom.props.tipsStyle) {
                    self.tipsStyle["width"] = self._clickdom.props.tipsStyle.width;
                    self.tipsStyle["height"] = self._clickdom.props.tipsStyle.height;
                }
                let tipprop = tipprops.props;
                let _tipDiy = tipprops.props.tipsContent;

                if (_tipDiy != null && _tipDiy != undefined && _tipDiy.props != null) {//用户自定义内容
                    self.tipsContent = {};
                    self.state.tipDIY = true;
                    self.tipsContent = _tipDiy;
                } else {

                    self.tipsContent = tipprops.props.tipsContent;
                    if (self.tipsContent === undefined) {
                        self.tipsContent = "";
                    }
                    self.state.tipDIY = false;
                }
                if (tipprop) {
                    if (tipprop.tipsDirection) {
                        self.state.tipsDirection = tipprop.tipsDirection;
                    };
                    if (tipprop.tipsTime) {
                        self.state.tipsTime = tipprop.tipsTime;
                    };
                }
                self._showAction();
                //self.forceUpdate();
            })
        }

    };

    _hideAction() {
        let self = this;
        self.timeouts.push(setTimeout(() => {
            self._hideAnimated();
            InteractionManager.runAfterInteractions(() => {
                self.setState({ isShow: false });
                self._nextime = 0;
            });
            // self.timeouts.push(setTimeout(() => {
            //     self.setState({ isShow: false });
            //     self._nextime = 0;

            // }, self.state.tipsTime / 50));//  self.state.tipsTime / 15
        }, self.state.tipsTime));
    }
    _showAction() {
        let self = this;
        // if (timeouts.length > 0) {
        //     timeouts.map(e => {
        //         clearTimeout(e);
        //     });
        //     timeouts = [];
        // };
        if (self._nextime !== 0) {
            return;
            if (self._nextime + self.state.tipsTime < Date.now()) {
                //clearTimeout(timeouts[0]);
                self.setState({ isShow: true });
                self._hidefastAnimated();
                //setTimeout(() => {
                self._nextime = Date.now();
                self.setState({ isShow: false });
                self._showAnimated();
                //}, 300);
                // setTimeout(() => {
                //     self.setState({ isShow: true });
                // }, 300);

            } else {
                //setTimeout(() => {
                self.setState({ isShow: true });
                self._nextime = Date.now();
                self._showAnimated();
                //}, 300);
            }
        } else if (self.tipsContent !== null && self.tipsContent !== "") {
            self.setState({ isShow: true });
            self._nextime = Date.now();
            self._showAnimated();
        }
        // if (self.state.isShow) {
        //     self._hidefastAnimated();
        //     self._showAnimated();
        // } else {
        //     self._showAnimated();
        // }
    }
    _hidefastAnimated() {
        let self = this;
        Animated.parallel([
            Animated.timing(self.state.tipsScale, {
                toValue: 0.001,
                duration: 20,
                easing: Easing.linear,
                useNativeDriver: true
            }),]).start();
    }
    _hideAnimated() {
        let self = this;
        Animated.parallel([
            Animated.timing(self.state.tipsScale, {
                toValue: 0,
                duration: 150,
                easing: Easing.linear,
                useNativeDriver: true
            }),]).start();
    }
    _showAnimated() {
        let self = this;
        Animated.parallel([
            Animated.timing(self.state.tipsScale, {
                toValue: 1,
                duration: 150,
                easing: Easing.linear,
                useNativeDriver: true
            }),]).start();
        self._hideAction();
    }
    componentWillUnmount() {
        let self = this;
        if (self.timeouts.length > 0) {
            self.timeouts.map((timeout) => clearTimeout(timeout));
        }
    }
    componentDidMount() {
    }
    _autorender() {
        let self = this;
        self.state.tipsScale.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 10]
        });
        if (self.state.isShow !== null && self.state.isShow && self.tipsContent !== null && self.tipsContent !== "") {
            return (
                <Animated.View style={[{ position: "absolute", flexDirection: 'row', backgroundColor: '#000000b3', alignItems: 'center', justifyContent: 'center', borderRadius: getResponsiveValue(10), zIndex: 100, transform: [{ scale: self.state.tipsScale }] }, self.tipsStyle]}>
                    {self._rendertip()}
                </Animated.View>
            );
        }
        return null;
    }

    _rendertip() {
        let self = this;
        let contents = self.tipsContent;
        if (self.state.tipDIY) {
            return contents;
        }
        return (
            <Text style={{ fontSize: getResponsiveFontSize(24), textAlign: 'center', textAlignVertical: 'center', color: '#FFF' }}>{contents}</Text>
        );
    }

    render() {
        let tipsdom = this.props.children;
        let oneDom = false;
        if (React.isValidElement(tipsdom)) {
            oneDom = true;
        }
        let self = this;
        return (
            <View style={{ position: 'absolute' }} {...self.props} >
                {oneDom ?
                    (tipsdom) : tipsdom.map(edom => {
                        return edom;
                    })
                }
                {
                    self._autorender()
                }
            </View>
        );

    }
}