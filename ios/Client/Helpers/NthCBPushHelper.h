//
//  NthCBPushHelper.h
//  YJJApp
//
//  Created by 张锋 on 20/11/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//  https://www.cnblogs.com/cxchanpin/p/7044990.html

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

FOUNDATION_EXTERN NSString * const kNthRegisterApplicationTagKey;

FOUNDATION_EXTERN NSString * const kNthCReceivedRemoteNotificationApsKey;
FOUNDATION_EXTERN NSString * const kNthCReceivedRemoteNotificationAlertKey;
FOUNDATION_EXTERN NSString * const kNthCReceivedRemoteNotificationBodyKey;
FOUNDATION_EXTERN NSString * const kNthCReceivedRemoteNotificationSoundKey;
FOUNDATION_EXTERN NSString * const kNthCReceivedRemoteNotificationBadgeKey;

@interface NthCBPushHelper : NSObject

/**
 在`application:didFinishLaunchingWithOptions:`中注册此方法，用于开启应用推送权限，用户启动时有推送也会从这里获取推送内容

 @param application application对象
 @param launchOptions 启动信息，可能包含了之前推送的消息
 */
+ (void)registerForApplication:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions;

/**
 在`application:didReceiveRemoteNotification:fetchCompletionHandler:`中注册此方法，iOS7以上收到通知走这个方法
 		注意：推送到来时会有两种特殊情况：(iOS7以上)
 		- 1、应用在后台运行，此时会调用`application:didReceiveRemoteNotification:fetchCompletionHandler:`方法。这里有个前提，就是用户必须是点击推送弹框/通知栏的消息框进来，如果用户通过点击程序图标的方式进来，这时候是没有办法获取到推送消息的。而且如果手机的通知栏有多条消息记录，那么用户点击哪一条，才会拿到哪条数据。
 		- 2、应用未启动，当之后启动应用时会调用`application:didFinishLaunchingWithOptions:`以及`application:didReceiveRemoteNotification:fetchCompletionHandler:`方法。(这就涉及到一个问题：可能就反复处理同一个push消息)

 关于这个方法更多信息，可以参考苹果官方文档：https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1623013-application?language=objc
 
 @param application application对象
 @param userInfo 通知推送过来的字典，里边包含了所有推送内容
 @param completionHandler 回调给后台的Block，这个方法应该尽快调用
 */
+ (void)registerForApplication:(UIApplication *)application
  didReceiveRemoteNotification:(NSDictionary *)userInfo
        fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler;

/**
 此方法获取设备`deviceToken`

 @param application application对象
 @param deviceToken 获取到的`deviceToken`
 */
+ (void)registerForApplication:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken;

/**
 注册推送服务注册失败

 @param application application对象
 @param error 错误信息
 */
+ (void)registerForApplication:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error;

/**
 在`application:didRegisterUserNotificationSettings:`中注册此方法，获取用户注册的通知类型

 @param application application对象
 @param notificationSettings 注册过的程序通知类型
 */
+ (void)registerForApplication:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings;

/**
 iOS6 及以下，程序在前/后台收到通知会走这个方法。由于程序最低部署版本在 iOS7+，所以暂时不考虑这个方法

 @param application application对象
 @param userInfo 通知推送过来的字典，里边包含了所有推送内容
 */
+ (void)registerForApplication:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo NS_UNAVAILABLE;

@end
