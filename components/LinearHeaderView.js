/**
 * Created by jean.h.ma on 14/06/2017.
 */
import React, {Component} from "react";
import {
	View,
	Platform,
	Dimensions
} from "react-native";
import BaseComponent from "./BaseComponent";
import {Linear} from "./LinearView";

export const IOS_HEADER_HEIGHT = 44;
export const IOS_HEADER_WIDTH = 44;
export const ANDROID_HEADER_HEIGHT = 56;
export const ANDROID_HEADER_WIDTH = 44;
export const IOS_STATUS_BAR_HEIGHT = 20;

export const headerButtonWidthStyle = Platform.select({
	android: {
		width: ANDROID_HEADER_WIDTH
	},
	ios: {
		width: IOS_HEADER_WIDTH
	}
});

export const headerHeightStyle = Platform.select({
	ios: {
		height: IOS_HEADER_HEIGHT + IOS_STATUS_BAR_HEIGHT
	},
	android: {
		height: ANDROID_HEADER_HEIGHT
	}
})


export default class LinearColorHeaderView extends BaseComponent {
	render() {
		const {width}=Dimensions.get("window");
		return (
			<View
				style={[headerHeightStyle]}>
				<Linear width={Platform.OS==="ios"?"100%":width}/>
				{this.props.children}
			</View>
		);
	}
}