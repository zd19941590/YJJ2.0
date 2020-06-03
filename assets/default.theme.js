/**
 * Created by jean.h.ma on 19/05/2017.
 */
import { StyleSheet, Dimensions, PixelRatio, Platform } from "react-native";
import config from "../config/app.config";
import { OrientationEnum } from "../enmus";

const deviceSize = Dimensions.get("window");

const density = PixelRatio.get();

export const navigationBarStyle = {
	navigationBar: {},
	titleView: {},
	title: {},
	backButtonView: {}
};

// export function getDP(pxValue: Number) {
// 	let design = config.design[density];
// 	if (design) {
// 		return PixelRatio.roundToNearestPixel(pxValue / density);
// 	}
// 	return PixelRatio.roundToNearestPixel(pxValue / config.designDensity);
// }

/*
 * @params value:Number
 * @params orientation:OrientationEnum [OrientationEnum.PORTRAIT]
 * */
export function getResponsiveValue(value: Number, orientation: OrientationEnum = OrientationEnum.LANDSCAPE) {
	let r = deviceSize.height / config.design.width;
	if (orientation === 'LANDSCAPE') {
		r = deviceSize.height / config.design.height;
	}
	return PixelRatio.roundToNearestPixel(value * r);
}

export function createResponsiveIcon(options) {
	for (let key in options) {
		let icon = options[key];
		let width = icon.width / config.iconDensity;
		let height = icon.height / config.iconDensity;
		icon.width = getResponsiveValue(width);
		icon.height = getResponsiveValue(height);
		icon.Landscape = {
			width: getResponsiveValue(width, "LANDSCAPE"),
			height: getResponsiveValue(height, "LANDSCAPE")
		};
	}
	return options;
}

export function getResponsiveFontSize(value: Number, density: Number = density) {
	return getResponsiveValue(value);
}

const fontSizeConfiguration = {
	"2": StyleSheet.create({
		bold: { fontWeight: "bold" },
		ft10: { fontSize: 10 },
		ft11: { fontSize: 11 },
		ft12: { fontSize: 12 },
		ft13: { fontSize: 13 },
		ft14: { fontSize: 14 },
		ft15: { fontSize: 15 },
		ft16: { fontSize: 16 },
		ft17: { fontSize: 17 },
		ft18: { fontSize: 18 },
		ft19: { fontSize: 19 },
		ft20: { fontSize: 20 },
		ft21: { fontSize: 21 },
		ft22: { fontSize: 22 },
		ft24: { fontSize: 24 },
		ft25: { fontSize: 25 },
		ft30: { fontSize: 30 },
		ft36: { fontSize: 36 },
		ft40: { fontSize: 40 },
		ft45: { fontSize: 45 },
	}),
	"3": StyleSheet.create({
		bold: { fontWeight: "bold" },
		ft10: { fontSize: 10 },
		ft11: { fontSize: 11 },
		ft12: { fontSize: 12 },
		ft13: { fontSize: 13 },
		ft14: { fontSize: 14 },
		ft15: { fontSize: 15 },
		ft16: { fontSize: 16 },
		ft17: { fontSize: 17 },
		ft18: { fontSize: 18 },
		ft19: { fontSize: 19 },
		ft20: { fontSize: 20 },
		ft21: { fontSize: 21 },
		ft24: { fontSize: 24 },
		ft25: { fontSize: 25 },
		ft30: { fontSize: 30 },
		ft36: { fontSize: 36 },
		ft40: { fontSize: 40 },
		ft45: { fontSize: 45 },
	})
};
export const Colors = StyleSheet.create({
	$000000: { color: "#000000" },
	$2198CC: { color: "#2198CC" },
	$2499D1: { color: "#2499D1" },
	$FFFFFF: { color: "#FFFFFF" },
	$848484: { color: "#848484" },
	$8C8C8C: { color: "#8C8C8C" },
	$4A4A4A: { color: "#4A4A4A" },
	$1F1F1F: { color: "#1F1F1F" },
	$4F4F4F: { color: "#4F4F4F" },
	$333333: { color: "#333333" },
	$666666: { color: "#666666" },
	$979797: { color: "#979797" },
	$9B9B9B: { color: "#9B9B9B" },
	$2598D2: { color: "#2598D2" },
	$42ACDD: { color: "#42ACDD" },
	$1CA6F3: { color: "#1CA6F3" },
	$161616: { color: "#161616" },
	$464646: { color: "#464646" },
	$2F3449: { color: "#2F3449" },
	$BBBBBB: { color: "#BBBBBB" },
	$D4E8FF: { color: "#D4E8FF" },
	$101010: { color: "#101010" },
	$DA4453: { color: "#DA4453" },
	$62AAFC: { color: "#62AAFC" },
	$656D78: { color: "#656D78" },
	$F6BB42: { color: "#F6BB42" },
	$8CC152: { color: "#8CC152" },
	$434A54: { color: "#434A54" },
	$3BAFDA: { color: "#3BAFDA" },
	$8E909D: { color: "#8E909D" },
	$888888: { color: "#888888" },
	$828592: { color: "#828592" }
});
export const BgColors = StyleSheet.create({
	$FFFFFF: { backgroundColor: "#FFFFFF" },
	$2799D5: { backgroundColor: "#2799D5" },
	$D8D8D8: { backgroundColor: "#D8D8D8" },
	$EAEAEA: { backgroundColor: "#EAEAEA" },
	$F3F3F3: { backgroundColor: "#F3F3F3" },
	$193A59: { backgroundColor: "#193A59" },
	$0C243A: { backgroundColor: "#0C243A" },
	$9B9B9B: { backgroundColor: "#9B9B9B" },
	$EEEEEE: { backgroundColor: "#EEEEEE" },
	$E8E8E8: { backgroundColor: "#E8E8E8" },
	$EDEDED: { backgroundColor: "#EDEDED" },
	$F7F6F8: { backgroundColor: "#F7F6F8" },
	$F5F7FA: { backgroundColor: "#F5F7FA" },
	$62AAFC: { backgroundColor: "#62AAFC" },
	$656D78: { backgroundColor: "#656D78" },
	$F6BB42: { backgroundColor: "#F6BB42" },
	$2F3449: { backgroundColor: "#2F3449" },
	$DA4453: { backgroundColor: "#DA4453" },
	$FF4158: { backgroundColor: "#FF4158" },
	$FF802E: { backgroundColor: "#FF802E" },
	$5A9AEF: { backgroundColor: "#5A9AEF" },
	$transparent: { backgroundColor: "transparent" }
});

export const CommonForm = StyleSheet.create({
	formContainer: {
		flexDirection: "column",
		marginTop: getResponsiveValue(20),
	},
	captionRow: {
		flexDirection: 'row',
		height: getResponsiveValue(88),
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: '#e6e6e6',
		alignItems: "center",
	},
	caption: {
		paddingLeft: getResponsiveValue(30)
	},
	formItem: {
		flexDirection: 'row',
		height: getResponsiveValue(88),
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: '#e6e6e6',
		alignItems: "center",
		backgroundColor: '#ffffff'
	},
	formLabel: {
		paddingLeft: getResponsiveValue(30),
		width: getResponsiveValue(170),
	},
	formValue: {
		flex: 1,
		paddingLeft: getResponsiveValue(10),
	},
	textInput: {
		flex: 1,
		paddingLeft: getResponsiveValue(10),
		height: getResponsiveValue(88),
	}
});

export default StyleSheet.create({
	button: {
		textAlign: "center",
		backgroundColor: "gray",
		paddingVertical: 10,
		borderRadius: 10,
		color: "white"
	},
	buttonDisabled: {
		color: "silver"
	},
	buttonPrimary: {
		backgroundColor: "blue",
		color: "white"
	},
	TextInput: {
		...Platform.select({
			android: {
				padding: 0
			}
		})
	}
});

export const FontSize = fontSizeConfiguration[density] || fontSizeConfiguration['2'];

export const PanelMarginTop = getResponsiveValue(20);
