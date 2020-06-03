/**
 * Created by jean.h.ma on 07/06/2017.
 */
import React, {Component} from 'react'
import {
	View,
	StyleSheet,
	TextInput,
	Text,
	Platform,
	ListView,
	TouchableWithoutFeedback,
	Image
} from 'react-native'
import BaseComponent from './BaseComponent'
import {Header} from 'react-navigation'
import LinearColorHeaderView from './LinearHeaderView'

export const IOS_HEADER_HEIGHT = 44;
export const ANDROID_HEADER_HEIGHT = 56;
export const IOS_STATUS_BAR_HEIGHT = 20;
export const HEADER_HEIGHT=Platform.select({
	ios:IOS_HEADER_HEIGHT+IOS_STATUS_BAR_HEIGHT,
	android:ANDROID_HEADER_HEIGHT
})

export default class LinearHeader extends BaseComponent {
	render() {
		return (
			<LinearColorHeaderView>
				<Header {...this.props}/>
			</LinearColorHeaderView>
		);
	}
}