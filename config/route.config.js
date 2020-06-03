/**
 * Created by jean.h.ma on 19/05/2017.
 */
import React, { Component } from "react";
import {
	AppRegistry,
	StyleSheet,
	Text,
	View,
	Platform,
	Dimensions, Image,
	Button, FlatList, TouchableHighlight
} from "react-native";
import { StackNavigator, TabNavigator } from "react-navigation";
//商品
import ProductDetail from '../pages/product/detail.js';
import ProductList from '../pages/product/list.js';
import ProductSearch from '../pages/product/search.js';
import ImageListScroll from '../pages/common/ImgScrollView.js'
//一品多图
import ProductSolutionList from '../pages/productsolution/list.js';
import ProductsolutionDetail from '../pages/productsolution/detail.js';
//个人中心
import CustomerIndex from '../pages/MyProfile/index.js';
import Personnel from '../pages/MyProfile/personnel';
import UpdateUserInfo from '../pages/MyProfile/updateUserInfo.js';
import UpdatePassword from '../pages/MyProfile/updatePassword.js';
import AddPersonnel from '../pages/MyProfile/addPersonnel.js';
import BindingPersonnel from '../pages/MyProfile/bindingPersonnel.js';
import Feedback from '../pages/common/feedback.js';
import SwitchManuFacturers from '../pages/MyProfile/switchManuFacturers.js';
import ProfileSwitcher from '../pages/MyProfile/ProfileSwitcher';

import SplashScreen, { DefaultHome } from '../pages/home/home.js';
import DataDownload from '../pages/common/datadownload.js';
import More from '../pages/common/more.js';
import ContentListPage from '../pages/appcontent/list.js';
import HomeA from '../pages/home/homeA.js';

import DispatchMenuAsDetail from '../pages/common/DispatchMenuAsDetail.js';
import DispatchMenuAsList from '../pages/common/DispatchMenuAsList.js';
import DispatchMenuAsLattice from '../pages/common/DispatchMenuAsLattice.js';
import DispatchMenuAsGrid from '../pages/common/DispatchMenuAsGrid';

import Login from '../pages/loginregister/login';
import ContentDetailPage from '../pages/appcontent/detail.js';
import GridBrowser from '../pages/appcontent/GridBrowser.js';
import CompanyConfig from '../config/company.config.js';
import UserAuth from '../pages/MyProfile/userAuth.js';
import ContentSearch from '../pages/appcontent/search.js';
import ModifyPrice from '../pages/product/modifyPrice.js';
import Product720 from '../pages/product/product720.js';





import MessageCenter from '../pages/common/message.js';
import { getResponsiveValue, getResponsiveFontSize } from '../assets/default.theme';

const DEVICE_SIZE = Dimensions.get("window");

export const TAB_NAVIGATOR_HEIGHT = Platform.select({
	android: 48,
	ios: 48
});

const defaultTabNavigationStyle = {
	showIcon: true,
	tabStyle: {
		...Platform.select({
			android: {
				paddingVertical: 3,
				paddingTop: 3,
				padding: 0
			}
		})
	},
	labelStyle: {
		...Platform.select({
			ios: {
				marginBottom: 5
			},
			android: {
				padding: 0,
				margin: 0
			}
		})
	}
};
function getStyle() {
	return StyleSheet.create({
		headerStyle: {
			height: getResponsiveValue(90),
			backgroundColor: CompanyConfig.AppColor.OnPressMain,
			// alignItems: 'center',
			// justifyContent: 'center',
			position: "absolute",
			top: 0,
			width: getResponsiveValue(1334),
			zIndex: 100
		},
		headerTitleStyle: {
			marginLeft: getResponsiveValue(40),
			textAlign: "center",
			textAlignVertical: "center",
			color: CompanyConfig.AppColor.MainFront,
			alignItems: 'center',
			justifyContent: 'center',
			fontSize: getResponsiveFontSize(32)
		},
		headerBackTitleStyle: {
			position: "absolute",
			color: CompanyConfig.AppColor.MainFront,
			left: getResponsiveValue(20),
			width: getResponsiveValue(30)
		},

		back: {
			marginLeft: getResponsiveValue(20),
			height: getResponsiveValue(80),
			width: getResponsiveValue(80),
			borderRadius: getResponsiveValue(40),
			alignItems: "center",
			justifyContent: "center",
			//backgroundColor: CompanyConfig.AppColor.Main
		},
		backImg: {
			height: getResponsiveValue(40),
			resizeMode: Image.resizeMode.contain
		},
		title: {
			alignItems: "center",
			justifyContent: "center",
			marginLeft: getResponsiveValue(20)
		}
	});
}

export default StackNavigator(
	{
		// 入口过渡
		SplashScreen: {
			screen: SplashScreen,
			navigationOptions: {
				header: null
			}
		},
		// 首页
		Home: {
			screen: DefaultHome,
			navigationOptions: {
				header: null
			}
		},
		DispatchMenuAsDetail: {
			screen: DispatchMenuAsDetail,
			navigationOptions: {
				header: null
			}
		},
		HomeA: {
			screen: HomeA,
			navigationOptions: {
				header: null
			}
		},
		DispatchMenuAsList: {
			screen: DispatchMenuAsList,
			navigationOptions: {
				header: null
			}
		},
		DispatchMenuAsGrid: {
			screen: DispatchMenuAsGrid,
			navigationOptions: {
				header: null
			}
		},
		DispatchMenuAsLattice: {
			screen: DispatchMenuAsLattice,
			navigationOptions: {
				header: null
			}
		},
		// 个人中心
		CustomerIndex: {
			screen: CustomerIndex,
		},
		Personnel: {
			screen: Personnel,
			navigationOptions: {
				header: null
			}
		},
		UpdateUserInfo: {
			screen: UpdateUserInfo,
			navigationOptions: {
				header: null
			}
		},
		UpdatePassword: {
			screen: UpdatePassword,
			navigationOptions: {
				header: null
			}
		},
		AddPersonnel: {
			screen: AddPersonnel,
			navigationOptions: {
				header: null
			}
		},
		BindingPersonnel: {
			screen: BindingPersonnel,
			navigationOptions: {
				header: null
			}
		},
		DataDownload: {
			screen: DataDownload,
			navigationOptions: {
				header: null
			}
		},

		Login: {
			screen: Login,
			navigationOptions: {
				header: null
			}
		},
		ProductDetail: { screen: ProductDetail },
		// 商品列表
		ProductList: {
			screen: ProductList, navigationOptions: {
				header: null
			}
		},
		// 长图
		ImageListScroll:{
			screen: ImageListScroll, navigationOptions: {
				header: null
			}
		},
		ProductSearch: { screen: ProductSearch },
		ContentList: { screen: ContentListPage },
		ContentDetail: {
			screen: ContentDetailPage,
			navigationOptions: {
				header: null
			}
		},
		GridBrowser: {
			screen: GridBrowser,
			navigationOptions: {
				header: null
			}
		},
		ContentSearch: { screen: ContentSearch },
		ProductSolutionList: { screen: ProductSolutionList },
		ProductsolutionDetail: {
			screen: ProductsolutionDetail,
			navigationOptions: {
				header: null
			}
		},
		More: {
			screen: More,
			navigationOptions: {
				headerMode: "none",
			}
		},
		UserAuth: { screen: UserAuth },
		ModifyPrice: {
			screen: ModifyPrice,
			navigationOptions: {
				header: null,
			}
		},
		Feedback: { screen: Feedback },
		Product720: { screen: Product720 },
		MessageCenter: { screen: MessageCenter },
		/// @param: Navigator跳转使用，@param：上边export的名字

		SwitchManuFacturers: { screen: SwitchManuFacturers },
		ProfileSwitcher: { screen: ProfileSwitcher },
	}
	, {
		headerMode: 'float',
		navigationOptions: function (navigation) {
			let navigateStyles = getStyle();
			return {
				header: null,
				headerStyle: navigateStyles.headerStyle,
				headerTitleStyle: navigateStyles.headerTitleStyle,
				headerBackTitleStyle: navigateStyles.headerBackTitleStyle,
				headerTintColor: "#FFFFFF",
				//全局后退
				headerLeft: (<TouchableHighlight style={navigateStyles.back} onPress={() => {
					navigation.navigation.goBack();
				}} underlayColor={CompanyConfig.AppColor.OnPressSecondary} >
					<Image style={navigateStyles.backImg} source={require("../assets/icons/back.png")} />
				</TouchableHighlight>),
			};
		}
	}
);


