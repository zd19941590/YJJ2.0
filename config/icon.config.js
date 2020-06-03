/**
 * Created by jean.h.ma on 14/06/2017.
 */
import {createResponsiveIcon} from '../assets/default.theme'

/*
	width/height?
		宽度/高度就是图片的真实宽度/高度
	配置那种倍数的图片宽高?
		根据app.config.js designDensity 来决定,如果是2就配置2x的宽高,如果是3就配置3x的宽高
		这里我们都是配置的2x的宽高
 */
export default icons=createResponsiveIcon({
	//通用
	"close-o":{source:require('../assets/icons/icon_close_o.png'),width:56,height:54},
    "close-w":{source:require('../assets/icons/icon_close_w.png'),width:50,height:50},
	"icon-back": {source: require('../assets/icons/icon_back.png'),width:38,height:63},

	//登录页
	user:{source:require('../assets/icons/icon_user.png'),width:75,height:75},
	lock:{source:require('../assets/icons/icon_lock.png'),width:75,height:75},
	captcha:{source:require('../assets/icons/icon_captcha.png'),width:75,height:75},
	logo:{source:require('../assets/img/logo.png'),width:606,height:606},

	//搜索
	search:{source:require('../assets/icons/icon_search.png'),width:66,height:66},
	trash:{source:require('../assets/icons/icon_trash.png'),width:42,height:42},

	//工程图
	all:{source:require('../assets/icons/icon_all.png'),width:75,height:75},
	"all-active":{source:require('../assets/icons/icon_all_active.png'),width:75,height:75},
	"to-landscape":{source:require('../assets/icons/icon_orientation_landscape.png'),width:75,height:75},
	"to-portrait":{source:require('../assets/icons/icon_orientation_portrait.png'),width:75,height:75},
	"icon-tangle-right": {source: require('../assets/icons/icon_tangle_right.png'),width:38,height:74},
	"icon-tangle-down": {source: require('../assets/icons/icon_tangle_down.png'),width:93,height:30},

    "icon-moisture": {source: require('../assets/icons/icon_moisture.png'),width:75,height:75},
    "icon-temperature": {source: require('../assets/icons/icon_temperature.png'),width:75,height:75},
    "icon-arrow-down-white": {source: require('../assets/icons/icon_arrow_down_white.png'),width:39,height:39},
    "icon-arrow-down-gray": {source: require('../assets/icons/icon_arrow_down_gray.png'),width:60,height:36},
    "icon-arrow-right-gray": {source: require('../assets/icons/icon_arrow_right_gray.png'),width:90,height:81},
    "icon-water-blue": {source: require('../assets/icons/icon_water_blue.png'),width:75,height:75},
    "icon-electricity-blue": {source: require('../assets/icons/icon_electricity_blue.png'),width:75,height:75},
    "icon-building-white": {source: require('../assets/icons/icon_building.png'),width:66,height:66},
    "icon-list-white": {source: require('../assets/icons/icon_list_white.png'),width:66,height:66},
    "icon-map-white": {source: require('../assets/icons/icon_map_white.png'),width:66,height:66},
    "icon-project-camera": {source: require('../assets/icons/icon_project_camera.png'),width:186,height:186},
    "icon-project-lifter": {source: require('../assets/icons/icon_project_lifter.png'),width:186,height:186},
    "icon-project-tower": {source: require('../assets/icons/icon_project_tower.png'),width:186,height:186},
    "icon-project-fav": {source: require('../assets/icons/icon_project_fav.png'),width:75,height:75},
    "icon-project-unfav": {source: require('../assets/icons/icon_project_unfav.png'),width:75,height:75},
    "icon_alert": {source: require('../assets/icons/icon_alert.png'),width:66,height:66},
    "icon_heart_2_f": {source: require('../assets/icons/icon_heart_2_f.png'),width:75,height:75},
    "icon_heart": {source: require('../assets/icons/icon_heart.png'),width:66,height:66},
    "icon_heart_f": {source: require('../assets/icons/icon_heart_f.png'),width:66,height:66},
    "icon_tabbar_account": {source: require('../assets/icons/icon_tabbar_account.png'),width:75,height:75},
    "icon_tabbar_account_s": {source: require('../assets/icons/icon_tabbar_account_s.png'),width:75,height:75},
    "icon_tabbar_distribution": {source: require('../assets/icons/icon_tabbar_distribution.png'),width:75,height:75},
    "icon_tabbar_distribution_s": {source: require('../assets/icons/icon_tabbar_distribution_s.png'),width:75,height:75},
    "icon_tabbar_monitor": {source: require('../assets/icons/icon_tabbar_monitor.png'),width:75,height:75},
    "icon_tabbar_monitor_s": {source: require('../assets/icons/icon_tabbar_monitor_s.png'),width:75,height:75},
    "icon_tabbar_rank": {source: require('../assets/icons/icon_tabbar_rank.png'),width:75,height:75},
    "icon_tabbar_rank_s": {source: require('../assets/icons/icon_tabbar_rank_s.png'),width:75,height:75},
    "icon_arrow_right": {source: require('../assets/icons/icon_arrow_right.png'),width:21,height:36},
    "icon_weather": {source: require('../assets/icons/icon_weather.png'),width:144,height:147},
    "icon_building": {source: require('../assets/icons/icon_building.png'),width:66,height:66},
    "addpic":{source: require('../assets/icons/addpic.png'),width:360,height:360},
    "icon_about": {source: require('../assets/icons/icon_about.png'),width:160,height:140},
    "icon_feedback": {source: require('../assets/icons/icon_feedback.png'),width:160,height:156},
    "icon_password": {source: require('../assets/icons/icon_password.png'),width:128,height:160},
    "icon_service": {source: require('../assets/icons/icon_service.png'),width:144,height:160},
    "icon_Hochbau":{source: require('../assets/icons/icon_Hochbau.png'),width:75,height:75},
    "icon_Humidity":{source: require('../assets/icons/icon_Humidity.png'),width:90,height:90},
    "icon_Temperature":{source: require('../assets/icons/icon_temperature_o.png'),width:60,height:60},
    "icon_WindScale":{source: require('../assets/icons/icon_Windscale.png'),width:60,height:60},
    "icon_env_warning":{source: require('../assets/icons/icon_env_Warning.png'),width:75,height:75},
    "tip-gray":{source: require('../assets/icons/icon_tip_gray.png'),width:167,height:167},
    "icon_env_location":{source: require('../assets/icons/icon_env_Location.png'),width:75,height:75},
    "icon_tabbar_statistic_s":{source: require('../assets/icons/icon_tabbar_statistic_s.png'),width:75,height:75},
    "icon_tabbar_statistic":{source: require('../assets/icons/icon_tabbar_statistic.png'),width:75,height:75},
    "icon_tabbar_env_s":{source: require('../assets/icons/icon_tabbar_env_s.png'),width:75,height:75},
    "icon_tabbar_env":{source: require('../assets/icons/icon_tabbar_env.png'),width:75,height:75},
    "icon_tabbar_energy_s":{source: require('../assets/icons/icon_tabbar_energy_s.png'),width:75,height:75},
    "icon_tabbar_energy":{source: require('../assets/icons/icon_tabbar_energy.png'),width:75,height:75},
    "icon_tabbar_energy_stat_s":{source: require('../assets/icons/icon_tabbar_energy_stat_s.png'),width:75,height:75},
    "icon_tabbar_energy_stat":{source: require('../assets/icons/icon_tabbar_energy_stat.png'),width:75,height:75},
    "bg_water":{source: require('../assets/icons/bg_water.png'),width:563,height:330},
    "bg_elect":{source: require('../assets/icons/bg_elect.png'),width:563,height:330},
    "icon_day":{source: require('../assets/icons/icon_day.png'),width:75,height:75},
    "icon_day_w":{source: require('../assets/icons/icon_day_w.png'),width:75,height:75},
    "icon_night":{source: require('../assets/icons/icon_night.png'),width:75,height:75},
    "icon_night_w":{source: require('../assets/icons/icon_night_w.png'),width:75,height:75},
    "icon_cur_location":{source: require('../assets/icons/icon_cur_location.png'),width:51,height:51},

    "icon_monitor_Eco-w":{source: require('../assets/icons/icon_monitor_Eco-w.png'),width:75,height:75},
    "icon_monitor_health-w":{source: require('../assets/icons/icon_monitor_health-w.png'),width:75,height:75},
    "icon_monitor_qual-w":{source: require('../assets/icons/icon_monitor_qual-w.png'),width:75,height:75},
    "icon_monitor_secur-w":{source: require('../assets/icons/icon_monitor_secur-w.png'),width:75,height:75},
    "icon_monitor_alreadyday":{source: require('../assets/icons/icon_monitor_alreadyday.png'),width:105,height:105},
    "icon_monitor_leftday":{source: require('../assets/icons/icon_monitor_leftday.png'),width:105,height:105},
    "icon_monitor_today_alert":{source: require('../assets/icons/icon_monitor_today_alert.png'),width:105,height:105},

    //智慧指数
    "icon_monitor_1":{source: require('../assets/icons/icon_monitor_1.png'),width:60,height:80},
    "icon_monitor_2":{source: require('../assets/icons/icon_monitor_2.png'),width:60,height:80},
    "icon_monitor_3":{source: require('../assets/icons/icon_monitor_3.png'),width:60,height:80},
    "icon_monitor_data":{source: require('../assets/icons/icon_monitor_data.png'),width:50,height:50},
    "icon_monitor_Eco":{source: require('../assets/icons/icon_monitor_Eco.png'),width:50,height:50},
    "icon_monitor_health":{source: require('../assets/icons/icon_monitor_health.png'),width:50,height:50},
    "icon_monitor_qual":{source: require('../assets/icons/icon_monitor_qual.png'),width:50,height:50},
    "icon_monitor_secur":{source: require('../assets/icons/icon_monitor_secur.png'),width:50,height:50},

    "icon_arrow_down":{source: require('../assets/icons/icon_arrow_down.png'),width:26,height:16},
    "icon_arrow_up":{source: require('../assets/icons/icon_arrow_up.png'),width:26,height:16},
    "icon_index_bg":{source: require('../assets/icons/icon_index_bg.png'),width:402,height:401},

    "icon_play":{source: require('../assets/icons/icon_play.png'),width:150,height:150},
    // 天气ICON：
    "icon_weather_type_1":{source: require('../assets/icons/icon_weather_type_1.png'),width:120,height:120},
    "icon_location":{source: require('../assets/icons/icon_location.png'),width:74,height:84},

    "icon_back_chaos":{source: require('../assets/icons/icon_back_chaos.png'),width:102,height:102},
    "bg_movie":{source: require('../assets/img/bg_movie.png'),width:495,height:360},
    "tower_normal_bg":{source:require('../assets/img/tower-normal-bg.png'),width:1125,height:345},
    "tower_abnormal_bg":{source:require('../assets/img/tower-abnormal-bg.png'),width:1125,height:345},
    "tower_act":{source:require('../assets/icons/tower/tower_act.png'),width:75,height:75},
    "tower_inact":{source:require('../assets/icons/tower/tower_inact.png'),width:75,height:75},
    "tower_offline_stat_act":{source:require('../assets/icons/tower/tower_offline_stat_act.png'),width:75,height:75},
    "tower_offline_stat_inact":{source:require('../assets/icons/tower/tower_offline_stat_inact.png'),width:75,height:75},
    "tower_crane_inact":{source:require('../assets/icons/tower/tower_crane_inact.png'),width:50,height:50},
    "tower_crane_act":{source:require('../assets/icons/tower/tower_crane_act.png'),width:50,height:50},

    //雨水
    "bg_temperature":{source:require('../assets/icons/bg_temperature.png'),width:563,height:300},
    "bg_humidity":{source:require('../assets/icons/bg_humidity.png'),width:563,height:300},
    "in":{source:require('../assets/icons/in.png'),width:45,height:42},
    "out":{source:require('../assets/icons/out.png'),width:41,height:45}
});