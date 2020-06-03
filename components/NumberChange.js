import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    
    TouchableOpacity,
} from 'react-native';
import PropTypes from "prop-types";
// import AppConfig from '../config/app.config.js';
import CompanyConfig from '../config/company.config.js';
import { getResponsiveValue, getResponsiveFontSize } from '../assets/default.theme.js';
import SvgUri from '../components/svguri.js';
import { StyleConfig } from '../config/style.config.js';


let pageStyles = null;

function setStyle() {
    if (pageStyles != null && !CompanyConfig.isGeneral()) return pageStyles;

    pageStyles = StyleSheet.create({
        baseView: {
            width: getResponsiveValue(184),
            height: getResponsiveValue(52),
            flexDirection: 'row',
            // backgroundColor: 'gray'
        },
        // tempText: {
        //     width: getResponsiveValue(50),
        //     backgroundColor: "rgba(255, 255, 255, 0.15)",
        // },

        addOrReduce: {
            width: getResponsiveValue(50),
            justifyContent: 'center',
            alignItems: 'center',
            //backgroundColor: CompanyConfig.formatColor(CompanyConfig.AppColor.Secondary, "4D"),
            // borderRadius: 8,
            borderTopRightRadius: getResponsiveValue(8),
            borderBottomRightRadius: getResponsiveValue(8),
            borderWidth: getResponsiveValue(1),
            borderColor: StyleConfig.PopupFront,
        },
        decreaseOrReduce: {
            width: getResponsiveValue(50),
            justifyContent: 'center',
            alignItems: 'center',
            // backgroundColor: CompanyConfig.formatColor(CompanyConfig.AppColor.Secondary, "4D"),
            // borderRadius: 8,
            borderTopLeftRadius: getResponsiveValue(8),
            borderBottomLeftRadius: getResponsiveValue(8),
            borderWidth: getResponsiveValue(1),
            borderColor: StyleConfig.PopupFront,
        },

        inputNumber: {
            width: getResponsiveValue(80),
            // backgroundColor: CompanyConfig.formatColor(CompanyConfig.AppColor.Main, "4D"),
            borderRadius: getResponsiveValue(1),
            textAlign: 'center',
            color: StyleConfig.PopupFront,
            padding: 0,
            borderColor: StyleConfig.PopupFront,
            borderWidth: getResponsiveValue(1)
        },

        marginLeft: {
            marginLeft: getResponsiveValue(1),
        },
    });

    return pageStyles;
}


export default class NumberChange extends Component {
    propStyle = null;
    static propTypes = {
        defaultNumber: PropTypes.any,  //初始Number值
        style: PropTypes.any,  //样式
        onNumberChange: PropTypes.func,  //Number值改变事件
        onNumberChangeZero: PropTypes.func,  //Number值变为0事件
        isShouldLagerZero: PropTypes.bool,
    }
    constructor(prop) {
        super(prop);
        this.state = {
            Number: 1,
        }
    }

    UNSAFE_componentWillMount() {
        if (typeof (this.props.style) != 'undefined' && this.props.style != null) {
            this.propStyle = this.props.style;
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        if (typeof (nextProps.defaultNumber) != 'undefined' && nextProps.defaultNumber != null) {
            this.setState({ Number: nextProps.defaultNumber });
        }
    }

    componentDidMount() {
        if (typeof (this.props.defaultNumber) != 'undefined' && this.props.defaultNumber != null) {
            this.setState({ Number: this.props.defaultNumber });
        }
    }
    onNumberChange(number) {
        if (typeof (this.props.onNumberChange) != 'undefined' && this.props.onNumberChange != null) {
            let intNumber = parseInt(number);
            if (isNaN(intNumber)) {

                this.setState({ Number: 1 });
                this.props.onNumberChange(1);
            } else {
                if (this.props.isShouldLagerZero && intNumber == 0) {
                    intNumber = 1;
                }
                this.setState({ Number: intNumber });
                this.props.onNumberChange(intNumber);
            }
        }
    }

    addNumber() {

        let newNumber = this.state.Number + 1;
        this.setState({ Number: newNumber });
        if (this.props.onNumberChange) {
            this.props.onNumberChange(newNumber);
        }
    }
    reduceNumber() {

        if (this.state.Number > 1) {
            let newNumber = this.state.Number - 1;
            this.setState({ Number: newNumber });
            if (this.props.onNumberChange) {
                this.props.onNumberChange(newNumber);
            }
        } else {
            if (typeof (this.props.onNumberChangeZero) == 'function') {
                this.props.onNumberChangeZero();
            }
        }
    }



    render() {
        setStyle();
        return (
            <View style={[(this.propStyle != null) ? this.propStyle : pageStyles.baseView]}

            >
                <TouchableOpacity

                    ref={(add) => {
                        if (typeof this.props.addlayout === 'function')
                            this.props.addlayout(add)
                    }}
                    style={pageStyles.decreaseOrReduce} onPress={() => { this.reduceNumber() }} >
                    {/* <Text style={pageStyles.tempText}>-</Text> */}

                    <SvgUri width={getResponsiveValue(20)} height={getResponsiveValue(20)} fill={StyleConfig.PopupFront} source="reduce" />
                </TouchableOpacity>
                <View style={{ width: getResponsiveValue(2) }}></View>
                <TextInput autoCapitalize="none"
                    autoCorrect={false} ref="productSearch"
                    keyboardType="numeric"
                    value={this.state.Number.toString()} onChangeText={(newText) => this.onNumberChange(newText)} disableFullscreenUI={true}
                    underlineColorAndroid="transparent" style={[pageStyles.inputNumber]} selectTextOnFocus={true} />
                <View style={{ width: getResponsiveValue(2) }}></View>
                <TouchableOpacity
                    ref={(reduce) => {
                        if (typeof this.props.reducelayout === 'function')
                            this.props.reducelayout(reduce)
                    }}
                    style={pageStyles.addOrReduce} onPress={() => { this.addNumber() }} >
                    {/* <Text style={[pageStyles.tempText, , pageStyles.marginLeft]}>+</Text> */}

                    <SvgUri width={getResponsiveValue(20)} height={getResponsiveValue(20)} fill={StyleConfig.PopupFront} source="add2" />
                </TouchableOpacity>
            </View>
        );
    }


}





