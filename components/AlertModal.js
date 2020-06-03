import React from 'react';
// import PropTypes from "prop-types";
import { View, Text, Dimensions, Modal, StyleSheet, TouchableOpacity, Animated, Vibration, Easing, InteractionManager } from 'react-native';
import { getResponsiveValue, getResponsiveFontSize } from '../assets/default.theme';


let _alertmodal;
export function showModal(
    title: String = "提示",
    message: String = "这是一个alert",
    content: Array = [
        { text: 'ok', onPress: Function = () => { } }
    ]
) {
    if (_alertmodal) {
        let alert = new AlertModal()
        _alertmodal(title, message, content);
    }
}

let { height, width } = Dimensions.get('window');
export default class AlertModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            title: null,
            message: null,
            content: null
        };
        //  this._alertmodal = this._alertmodal.bind(this);
        _alertmodal = (title: String = "提示", message: String = "这是一个alert", content: Array = [
            { text: 'ok', onPress: Function = () => { } }
        ]) => {
            //this.setState({ showModal: true, title: title, message: message, content: content });
            this.Show(title: String = "提示", message: String = "这是一个alert", content: Array = [
                { text: 'ok', onPress: Function = () => { } }
            ]);
        }
    }

    Show(title: String = "提示", message: String = "这是一个alert", content: Array = [
        { text: 'ok', onPress: Function = () => { } }
    ]) {
        this.setState({ showModal: true, title: title, message: message, content: content });
    }


    _rendermodel() {
        let self = this;
        if (self.state.content !== null && self.state.content.length > 0) {
            let content = self.state.content;
            switch (content.length) {
                case 1:
                    return (
                        <TouchableOpacity
                            style={{
                                width: getResponsiveValue(233),
                                height: getResponsiveValue(70),
                                justifyContent: 'center'
                            }}
                            onPress={(event) => {
                                content[0].onPress(event);
                                self.setState({ showModal: false });
                            }}
                            activeOpacity={0.8}
                        >
                            <Text style={{
                                fontSize: getResponsiveValue(32),
                                color: "#3a3a3a",
                                textAlign: 'center'
                            }}>{content[0].text}</Text>
                        </TouchableOpacity>
                    );
                case 2:
                    return (
                        <View style={{ flexDirection: 'row', flex: 1 }}>
                            <TouchableOpacity
                                style={{
                                    borderTopWidth: getResponsiveValue(1),
                                    borderTopColor: "#dcdfe3",
                                    borderRightWidth: getResponsiveValue(1),
                                    borderRightColor: "#dcdfe3",
                                    width: getResponsiveValue(233),
                                    height: getResponsiveValue(70),
                                    justifyContent: 'center'
                                }}
                                onPress={(event) => {
                                    content[0].onPress(event);
                                    self.setState({ showModal: false });
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={{
                                    fontSize: getResponsiveValue(32),
                                    color: "#3a3a3a",
                                    textAlign: 'center'
                                }}>{content[0].text}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    borderTopWidth: getResponsiveValue(1),
                                    borderTopColor: "#dcdfe3",
                                    borderLeftWidth: getResponsiveValue(1),
                                    borderLeftColor: "#dcdfe3",
                                    width: getResponsiveValue(233),
                                    height: getResponsiveValue(70),
                                    justifyContent: 'center'
                                }}
                                onPress={(event) => {
                                    content[1].onPress(event);
                                    self.setState({ showModal: false });
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={{
                                    fontSize: getResponsiveValue(32),
                                    color: "#3a3a3a",
                                    textAlign: 'center',
                                }}>{content[1].text}</Text>
                            </TouchableOpacity>
                        </View>
                    );
                case 3:
                    return (
                        <View style={{ flexDirection: 'row', flex: 1 }}>
                            <TouchableOpacity
                                style={{
                                    borderTopWidth: getResponsiveValue(1),
                                    borderTopColor: "#dcdfe3",
                                    borderRightWidth: getResponsiveValue(1),
                                    borderRightColor: "#dcdfe3",
                                    flex: 1,
                                    height: getResponsiveValue(70),
                                    justifyContent: 'center'
                                }}
                                onPress={(event) => {
                                    content[0].onPress(event);
                                    self.setState({ showModal: false });
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={{
                                    fontSize: getResponsiveValue(32),
                                    color: "#3a3a3a",
                                    textAlign: 'center'
                                }}>{content[0].text}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    borderTopWidth: getResponsiveValue(1),
                                    borderTopColor: "#dcdfe3",
                                    borderLeftWidth: getResponsiveValue(1),
                                    borderLeftColor: "#dcdfe3",
                                    borderRightWidth: getResponsiveValue(1),
                                    borderRightColor: "#dcdfe3",
                                    flex: 1,
                                    height: getResponsiveValue(70),
                                    justifyContent: 'center'
                                }}
                                onPress={(event) => {
                                    content[1].onPress(event);
                                    self.setState({ showModal: false });
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={{
                                    fontSize: getResponsiveValue(32),
                                    color: "#3a3a3a",
                                    textAlign: 'center',
                                }}>{content[1].text}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    borderTopWidth: getResponsiveValue(1),
                                    borderTopColor: "#dcdfe3",
                                    borderLeftWidth: getResponsiveValue(1),
                                    borderLeftColor: "#dcdfe3",
                                    flex: 1,
                                    height: getResponsiveValue(70),
                                    justifyContent: 'center'
                                }}
                                onPress={(event) => {
                                    content[2].onPress(event);
                                    self.setState({ showModal: false });
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={{
                                    fontSize: getResponsiveValue(32),
                                    color: "#3a3a3a",
                                    textAlign: 'center',
                                }}>{content[2].text}</Text>
                            </TouchableOpacity>
                        </View>
                    );

                default:
                    break;
            }
        }
    }


    render() {
        let self = this;
        if (self.state.showModal) {
            return (
                // <View style={{
                //     ...StyleSheet.absoluteFillObject,
                //     backgroundColor: "#000000",
                //     opacity: 0.7
                // }}>
                <Modal
                    animationType={'fade'}
                    visible={self.state.showModal}
                    transparent={true}
                    supportedOrientations={['portrait', 'landscape']}
                    onRequestClose={() => {
                        self.setState({ showModal: false });
                    }}
                >
                    <View style={{ flex: 1, backgroundColor: '#000000b3' }}>
                        <View style={{
                            width: getResponsiveValue(468),
                            height: getResponsiveValue(253),
                            borderRadius: getResponsiveValue(20),
                            backgroundColor: "#ffffff",
                            shadowColor: "#0b11241a",
                            alignSelf: 'center',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: (height - getResponsiveValue(253)) / 2,
                            //paddingTop: getResponsiveValue(30),
                            elevation: 20,
                            shadowOffset: {
                                width: 0,
                                height: getResponsiveValue(10)
                            },
                            shadowRadius: getResponsiveValue(80),
                            shadowOpacity: getResponsiveValue(1)
                        }}>
                            <Text style={{
                                fontSize: getResponsiveFontSize(37),
                                color: "#3a3a3a",
                                marginTop: getResponsiveValue(30),

                            }}>
                                {self.state.title}
                            </Text>
                            <Text style={{
                                width: getResponsiveValue(400),
                                fontSize: getResponsiveFontSize(32),
                                color: "#3a3a3a"
                            }}>
                                {self.state.message}
                            </Text>
                            <View style={{ flexDirection: 'row', }}>
                                {self._rendermodel()}
                            </View>
                        </View>
                    </View>
                </Modal>
                // </View>
            );
        }
        return null;
    }
}