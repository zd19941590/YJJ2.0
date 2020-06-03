import React, { Component } from 'react';
import { View, Image, StyleSheet, Text, TouchableHighlight } from 'react-native';
import PropTypes from 'prop-types';
import { getResponsiveValue, getResponsiveFontSize } from '../assets/default.theme';
// import CompanyConfig from '../config/company.config.js';
import SvgUri from '../components/svguri.js';
import { StyleConfig } from '../config/style.config';

const style = StyleSheet.create({
    checkbox: {
        width: getResponsiveValue(30),
        height: getResponsiveValue(30),
    },
    text: {
        width: getResponsiveValue(146),
        height: getResponsiveValue(27),
        // fontFamily: "NotoSansCJKsc-DemiLight",
        fontSize: getResponsiveFontSize(28),
        lineHeight: getResponsiveValue(89),
        color: "#ffffff",
        opacity: 0.7
    },
    checkImage: {
        width: getResponsiveValue(30),
        height: getResponsiveValue(30),
        opacity: 0.6
    }

});
export default class Checkbox extends Component {
    static propTypes = {
        ...Image.propTypes,
        isShowNotSelectImg: PropTypes.bool,
        isSelected: PropTypes.bool,
        clickCallback: PropTypes.func,
        fill: PropTypes.any,
    }
    static defaultProps = {
        isShowNotSelectImg: true,
        isSelected: 0,
        clickCallback: null
    }
    constructor(props) {
        super(props);
        this.state = {
            isSelected: this.props.isSelected
        }
    }

    _setState(flag) {
        this.setState({
            isSelected: flag
        });
        if (this.props.clickCallback) {
            this.props.clickCallback(flag);
        }
    }

    setCheckState(flag, callBack = null) {
        this.setState({
            isSelected: flag
        }, () => {
            if (callBack) {
                callBack();
            }
        });
    }

    getCheckState() {
        return this.state.isSelected;
    }

    getShowFill() {
        if (typeof (this.props.fill) != 'undefined') {
            return this.props.fill;
        } else {
            return StyleConfig.FocalFront;
        }

    }

    renderCheckIcon() {
        if (this.state.isSelected) {
            return (<View><SvgUri width={typeof (this.props.style) !== 'undefined' && typeof (this.props.style.width) !== 'undefined' ? this.props.style.width : getResponsiveValue(30)} height={typeof (this.props.style) !== 'undefined' && typeof (this.props.style.height) !== 'undefined' ? this.props.style.height : getResponsiveValue(30)} fill={this.getShowFill()} source={"check2"} /></View>)
        }
        else if (!this.state.isSelected && this.props.isShowNotSelectImg) {
            return (<View><SvgUri width={typeof (this.props.style) !== 'undefined' && typeof (this.props.style.width) !== 'undefined' ? this.props.style.width : getResponsiveValue(30)} height={typeof (this.props.style) !== 'undefined' && typeof (this.props.style.height) !== 'undefined' ? this.props.style.height : getResponsiveValue(30)} fill={this.getShowFill()} source={"check1"} /></View>)
        }
        else if (!this.state.isSelected && !this.props.isShowNotSelectImg) {
            return <View></View>;
        }
    }
    render() {

        return (
            <TouchableHighlight {...this.props} style={[{ width: getResponsiveValue(30), height: getResponsiveValue(30) }, typeof (this.props.style) != 'undefined' ? this.props.style : null]} underlayColor="#00000000" onPress={() => { this._setState(!this.state.isSelected) }} >
                {
                    this.renderCheckIcon()
                }
            </TouchableHighlight>
        )
    }
}