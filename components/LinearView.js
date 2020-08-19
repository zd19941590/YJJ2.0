/**
 * Created by jean.h.ma on 19/05/2017.
 */
import React from "react";
import BaseComponent from "./BaseComponent";
import {View, Text, StyleSheet, Platform,} from "react-native";
import PropTypes from "prop-types";
import {IOS_HEADER_HEIGHT, IOS_STATUS_BAR_HEIGHT, ANDROID_HEADER_HEIGHT} from "./LinearHeader";
// import Svg, {Defs, LinearGradient, Stop, Rect} from "react-native-svg";

const style = StyleSheet.create({
	container: {
		flex: 1
	},
	image: {
		position: "absolute",
		left: 0,
		right: 0,
		...Platform.select({
			android: {
				top: -ANDROID_HEADER_HEIGHT
			},
			ios: {
				top: -(IOS_STATUS_BAR_HEIGHT + IOS_HEADER_HEIGHT)
			}
		})
	}
});

export class Linear extends BaseComponent {
	static propTypes = {
		colors: PropTypes.array,
		borderRadius: PropTypes.number,
		width:PropTypes.any,
		height:PropTypes.any
	};
	static defaultProps = {
		colors: [{
			offset: "9%",
			stopColor: "#2C99DC"
		}, {
			offset: "100%",
			stopColor: "#0597A1"
		}],
		borderRadius: 0,
		width:"100%",
		height:"100%"
	};

	get colors() {
		let colors = this.props.colors.map(c=> {
			if (!c.offset) {
				c.offset = "0%";
			}
			return c;
		});
		if (colors.length === 1) {
			return colors.concat(colors);
		}
		return colors;
	}

	render() {
		return (
			<View><Text>修改加载效果</Text></View>
		);
	}
}

export default class LinearView extends BaseComponent {
	static propTypes = {
		style: PropTypes.any,
		children: PropTypes.any,
		onLayout: PropTypes.func,
		colors: PropTypes.array,
		borderRadius: PropTypes.number
	};
	static defaultProps = {
		style: {},
		borderRadius: 0
	};

	render() {
		return (
			<View
				onLayout={this.props.onLayout}
				style={[style.container, this.props.style]}>
				<Linear
					borderRadius={this.props.borderRadius}
					colors={this.props.colors}/>
				{this.props.children}
			</View>
		);
	}
}
