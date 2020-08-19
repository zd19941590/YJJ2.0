import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    LayoutAnimation,
    TouchableOpacity
} from 'react-native';
import { getResponsiveValue, getResponsiveFontSize } from '../assets/default.theme';
import CompanyConfig from '../config/company.config.js';
import PropTypes from "prop-types";
let msgStyles = null;

let messagebarShow;
export function showMessage(message: String, messageType: Number) {
    if (messagebarShow) {
        messagebarShow(message, messageType);
    }
};

export default class OperationMessage extends Component {
    static propTypes = {
        showMilliseconds: PropTypes.any,
        width: PropTypes.number,
        show: PropTypes.func
    };

    static defaultProps = {
        showMilliseconds: 3000
    };
    constructor(prop) {
        super(prop);
        this.state = {
            enabled: true,
            message: "",
            height: 0,
            messageType: 1 //1: 表示成功，2：表示失败，3：表示警告
        };
        this.show = this.show.bind(this);
        messagebarShow = (message: String, messageType: Number) => {
            this.show(message, messageType);
        }
    }
    timeoutId;
    setTimeoutHide() {
        let outTime = this.props.showMilliseconds;
        if (outTime == null) {
            outTime = 3000;
        }
        let self = this;
        this.timeoutId = setTimeout(function () {
            self.setState({ enabled: false, height: 0 });
            self.timeoutId = null;
        }, outTime);
    }
    show(message, messageType) {
        // 清楚自动关闭记时器 
        if (this.timeoutId != null) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        LayoutAnimation.spring();
        // 设置状态
        this.setState({
            enabled: true,
            message: message,
            messageType: messageType,
            height: getResponsiveValue(90)
        });
        // 重新设置计时器
        this.setTimeoutHide();
    }
    hide() {
        if (this.timeoutId != null) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
            this.setState({ enabled: false, height: 0 });
        }
    }
    componentWillUnmount() {
        if (this.timeoutId != null) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }
    componentDidMount() {
        this.setTimeoutHide();
    }
    render() {
        setStyle();
        if (!this.state.enabled || this.state.message == null || this.state.message == "") {
            return null;
        }
        let bg = null;
        let messageType = this.state.messageType;
        bg = msgStyles.successbg;
        if (messageType == 2) {
            bg = msgStyles.errorbg;
        }
        else if (messageType == 3) {
            bg = msgStyles.warningbg;
        }
        let size = { height: this.state.height }
        if (this.props.width && this.props.width > 0) {
            size = { height: this.state.height, width: this.props.width };
        }
        return (<TouchableOpacity style={[msgStyles.msgbar, bg, size]} onPress={() => {
            this.hide();
        }} ><Text style={msgStyles.text}>{this.state.message}</Text></TouchableOpacity>);
    }
}
function setStyle() {
    if (msgStyles != null && !CompanyConfig.isGeneral()) return msgStyles;
    msgStyles = StyleSheet.create({
        msgbar: {
            flexDirection: "row",
            height: getResponsiveValue(0),
            width: getResponsiveValue(1334),
            alignItems: 'center',
            justifyContent: 'flex-start',
            position: "absolute",
            top: 0,
            zIndex: 200
        },
        msgicon: {
            width: getResponsiveValue(48),
            height: getResponsiveValue(48),
            borderRadius: getResponsiveValue(24),
            marginLeft: getResponsiveValue(30)
        },
        errorbg: {
            backgroundColor: CompanyConfig.formatColor(CompanyConfig.AppColor.Warning)
        },
        warningbg: {
            backgroundColor: CompanyConfig.formatColor(CompanyConfig.AppColor.Warning)
        },
        successbg: {
            backgroundColor: CompanyConfig.formatColor(CompanyConfig.AppColor.Main)
        },
        menu: {
            flex: 1,
            flexDirection: "column",
            marginTop: getResponsiveValue(54),
        },
        text: {
            flex: 1,
            color: CompanyConfig.AppColor.SecondaryFront,
            textAlign: "center",
            textAlignVertical: "center",
            fontSize: getResponsiveFontSize(32),
            marginLeft: getResponsiveValue(20)
        }
    });
    return msgStyles;
} 
