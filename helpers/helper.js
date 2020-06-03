/**
 * Created by jean.h.ma on 02/06/2017.
 */
import React from "react";
import { View, Alert, Platform, Linking, PixelRatio, DeviceEventEmitter } from "react-native";
import config from "../config/app.config";
import RNFetchBlob from "react-native-fetch-blob";
import update from "immutability-helper";
import CompanyAppConfig from '../config/company.app.js';
type FormatterType = {
	name: String,
	params: Array
};

export async function fetchImage(uri: String): String {
	const slashLastIndex = uri.lastIndexOf('/');
	const filename = uri.substring(slashLastIndex + 1);
	const dirs = RNFetchBlob.fs.dirs;
	const path = `${dirs.CacheDir}/${filename}`;
	const exists = await RNFetchBlob.fs.exists(path).catch(() => false);
	if (exists) {
		return `file://${path}`;
	}
	else {
		return RNFetchBlob
			.config({
				path
			})
			.fetch('GET', uri)
			.then(() => {
				return `file://${path}`;
			})
			.catch(err => uri);
	}
}

const DENSITY = PixelRatio.get();


const Formatter = {
	money: (value: Number, fixed: Number = 2) => {
		let fixedValue = value.toFixed(fixed);
		if (fixed === 0) {
			fixedValue += '.';
			let fv = fixedValue.replace(/(\d)(?=(\d{3})+\.)/g, '$1,').replace('.', '');
			return fv;
		}
		return value.toFixed(fixed).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	},
	fixed: (value: Number, fixed: Number = 0) => {
		return value.toFixed(fixed);
	}
};

function formatData(value: any, formatter: String | Function | FormatterType) {
	const typeName = formatter.constructor.name;
	switch (typeName) {
		case "Function":
			return formatter(value);
		case "Object":
			if (!Formatter[formatter.name]) {
				throw new Error(`formatter ${formatter.name} is not defined`);
			}
			return Formatter[formatter.name](value, ...formatter.params);
		default:
			if (!Formatter[formatter]) {
				throw new Error(`formatter ${formatter} is not defined`);
			}
			return Formatter[formatter](value);
	}
}


export function confirm(message, callback, title = "确认！", okLabel = "确定") {
	Alert.alert(title, message, [{
		text: "取消",
		onPress() {
			if (callback) {
				callback(false);
			}
		}
	}, {
		text: okLabel,
		onPress() {
			if (callback) {
				callback(true);
			}
		}
	}]);
}

export function alert(message, callback, title = "提示！") {
	Alert.alert(title, message, [{
		text: "确定",
		onPress() {
			if (callback) {
				callback();
			}
		}
	}]);
}

export function callPhone(phoneNumber: String) {
	const openLink = (url, cb) => {
		return Linking.canOpenURL(url).then(canOpen => {
			if (!canOpen) {
				return Promise.reject(new Error(`The URL is invalid: ${url}`))
			} else {
				return Linking.openURL(url).catch((err) => Promise.reject(err))
			}
		})
	}
	return openLink(`tel:${phoneNumber}`)
}

/*
 * @param {string} url - 项目封面图的fullurl
 * @param {number} pxWidthWith1X - 项目封面的宽度,单位px,1x的尺寸
 * @return {string} 格式化后的url
 * */
export function formatProjectCoverImageUrl(url: String, pxWidthWith1X: Number) {
	const width = getMatchProjectCoverImageWidth(pxWidthWith1X);
	const index = url.indexOf('?');
	if (index < 0) {
		return `${url}?format=P${width}`;
	}
	return `${url}&format=P${width}`;
}


export function formatHyphenData(value: any, formatter: Function | String | FormatterType) {
	if (value === null || value === undefined) {
		return '--'
	}
	if (formatter) {
		return formatData(value, formatter);
	}
	return value
}


export function formatNaData(value: any, formatter: Function | String | FormatterType) {
	if (value === null || value === undefined) {
		return 'N/A'
	}
	if (formatter) {
		return formatData(value, formatter);
	}
	return value
}

export function formatEmptyData(value: any) {
	return value || ''
}


export function hasValue(value) {
	if (value === null || value === undefined || value === '') {
		return false
	}

	return true
}

export function formatTemperature(value: any) {
	if (value) {
		return `${value}°`
	}
	return null
}
function getMatchProjectCoverImageWidth(pxWidthWith1X: Number) {
	let configImageWidthCount = config.projectCoverImageWidth.length
	let minDiff = 9999;
	let targetIndex = 0;
	config.projectCoverImageWidth.forEach((width, index) => {
		const diff = Math.abs(width - pxWidthWith1X);
		if (diff < minDiff) {
			minDiff = diff;
			targetIndex = index
		}
	});
	return config.projectCoverImageWidth[targetIndex < configImageWidthCount - 1 ? targetIndex + 1 : targetIndex];
}

export function createDatePickerNavigation(Router) {
	return class DatePickerNavigation extends React.PureComponent {
		static router = Router.router

		constructor(props) {
			super(props);
			this.state = {
				datePickerProps: {
					visible: false
				}
			};
			this.onShowDatePicker = props => {
				this.setState({
					datePickerProps: props
				});
			}
		}

		render() {
			return (
				<View style={{ flex: 1 }}>
					<Router navigation={this.props.navigation}></Router>
					<DatePicker {...this.state.datePickerProps}
						onValueChange={date => {
							DeviceEventEmitter.emit('datepickerchange', {
								date,
								mode: this.state.datePickerProps.mode
							});
							this.setState(update(this.state, {
								datePickerProps: {
									visible: { $set: false }
								}
							}));
						}}
						onCancel={() => {
							this.setState(update(this.state, {
								datePickerProps: {
									visible: { $set: false }
								}
							}));
						}} />
				</View>
			);
		}

		componentDidMount() {

			DeviceEventEmitter.addListener('showdatepicker', this.onShowDatePicker);
		}

		componentWillUnmount() {
			DeviceEventEmitter.removeListener('showdatepicker', this.onShowDatePicker);
		}

		componentDidUpdate(preProps, preState) {
			const preIndex = preProps.navigation.state.index;
			const index = this.props.navigation.state.index;
			if (preIndex !== index) {
				this.setState(update(this.state, {
					datePickerProps: {
						visible: { $set: false }
					}
				}));
			}
		}
	}
}