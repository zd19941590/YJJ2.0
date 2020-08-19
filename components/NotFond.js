import React, { Component } from 'react';
import PropTypes from "prop-types";
import {
    StyleSheet,
    Image,
    View,
    PanResponder,
} from 'react-native';
import AppConfig from '../config/app.config.js';
import CompanyConfig from '../config/company.config.js';
import { getResponsiveValue } from '../assets/default.theme.js';
import SvgUri from '../components/svguri.js';
let pageStyles = null;

function setStyle() {
    if (pageStyles != null && !CompanyConfig.isGeneral()) return pageStyles;

    pageStyles = StyleSheet.create({
        baseView: {
            height: getResponsiveValue(AppConfig.design.height),
            alignItems: "center",
            justifyContent: "center",
        },
        emptyContainer: {
            width: getResponsiveValue(870),
            height: getResponsiveValue(500),
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: getResponsiveValue(20),
        },
        nothinhContainer: {
            width: getResponsiveValue(870),
            height: getResponsiveValue(500),
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: getResponsiveValue(20),
        },
        nothing: {
            width: getResponsiveValue(870),
            height: getResponsiveValue(500),
            borderRadius: getResponsiveValue(20),

        }
    });

    return pageStyles;
}

gestureResponder = undefined;
export default class NotFond extends Component {
    static propTypes = {
        downMove: PropTypes.func,
        upMove: PropTypes.func,
        onPress: PropTypes.func,
        style: PropTypes.any,    //样式
        // onSingleTapConfirmed:PropTypes.func,
        ShowNothing: PropTypes.bool,
        src:PropTypes.any,
        loadingstyle:PropTypes.object,
    }
    constructor(prop) {
        super(prop);
        this.state = {

        }
    }
    gestureResponder = undefined;
    UNSAFE_componentWillMount() {
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
            },
            onPanResponderMove: (evt, gs) => {
            },
            onPanResponderRelease: (evt, gs) => {
                if (gs.dx > 0 && gs.dx > 40) {
                    if (this.props.downMove) {
                        this.props.downMove();
                    }
                }
                else if (gs.dx < 0 && gs.dx < -40) {
                    if (this.props.upMove) {
                        this.props.upMove();
                    }
                } else {
                    if (this.props.onSingleTapConfirmed) {
                        this.props.onSingleTapConfirmed();
                    }
                }
            },

        })
    }

    getBaseStyleArray() {
        var array = [pageStyles.baseView];
        if (typeof (this.props.style) == 'object') {
            array.push(this.props.style);
        }
        return array;
    }

    render() {
        let gestureResponder = this.gestureResponder;
        setStyle();
        let sizeWidth = getResponsiveValue(275);

        return (<View style={this.getBaseStyleArray()}
        >
            {
                this.props.ShowNothing ?
                    <View style={pageStyles.emptyContainer} {...this._panResponder.panHandlers}>
                        <Image source={this.props.src?this.props.src: AppConfig.defaultNoImage} style={[pageStyles.nothing, { resizeMode: 'stretch' },this.props.loadingstyle?this.props.loadingstyle:'']}></Image>
                    </View>
                    :
                    <View style={pageStyles.nothinhContainer} {...this._panResponder.panHandlers}>
                        <SvgUri width={sizeWidth} fill={CompanyConfig.AppColor.DescriptionFront} source={"404"} />
                    </View>
            }
        </View>);
    }
}
