//
//  NthCBPushHelper.m
//  YJJApp
//
//  Created by 张锋 on 20/11/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import "NthCBPushHelper.h"
#import "NthCConstants.h"
#ifdef NSFoundationVersionNumber_iOS_9_x_Max
  #import <UserNotifications/UserNotifications.h>
#endif
#import <RNBaiduPush.h>
//#import "BPush.h"
#import <BPush.h>

#import "CompanyConfigurationManager.h"

NSString * const kNthRegisterApplicationTagKey = @"com.zz.yjj.tag.device.remote";

NSString * const kNthCReceivedRemoteNotificationApsKey = @"aps";
NSString * const kNthCReceivedRemoteNotificationAlertKey = @"alert";
NSString * const kNthCReceivedRemoteNotificationBodyKey = @"body";
NSString * const kNthCReceivedRemoteNotificationSoundKey = @"sound";
NSString * const kNthCReceivedRemoteNotificationBadgeKey = @"badge";

@implementation NthCBPushHelper

#pragma mark - Public Methods

+ (void)registerForApplication:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  	// Register For Remote Notifications.
    if (NSFoundationVersionNumber >= NSFoundationVersionNumber10_0) {
      // For iOS 10 and later.
      UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
      [center requestAuthorizationWithOptions:UNAuthorizationOptionBadge | UNAuthorizationOptionSound | UNAuthorizationOptionAlert
                            completionHandler:^(BOOL granted, NSError * _Nullable error) {
                              if (granted) {
                                  dispatch_async(dispatch_get_main_queue(), ^{
                                      [application registerForRemoteNotifications];
                                  });
                                }
                            }];
    } else if (NSFoundationVersionNumber >= NSFoundationVersionNumber_iOS_8_0) {
      // For iOS 8 and later.
      UIUserNotificationSettings *settings = [UIUserNotificationSettings settingsForTypes:UIUserNotificationTypeBadge | UIUserNotificationTypeSound | UIUserNotificationTypeAlert
                                                                               categories:nil];
      [[UIApplication sharedApplication] registerUserNotificationSettings:settings];
    } else {
      // Less than iOS 8.
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
      [[UIApplication sharedApplication] registerForRemoteNotificationTypes:UIRemoteNotificationTypeBadge | UIRemoteNotificationTypeAlert | UIRemoteNotificationTypeSound];
#pragma clang diagnostic pop
    }
  
  
  NSDictionary *configs = [[CompanyConfigurationManager new] constantsToExport];
  NSString *apiKey = configs[@"CompanyAppConfig"][@"BaiduPushAPIKey"][@"ios"];
  
  
  [[UIApplication sharedApplication] setApplicationIconBadgeNumber:0];
  [BPush registerChannel: launchOptions apiKey:apiKey pushMode:BPushModeDevelopment withFirstAction:@"打开" withSecondAction:@"关闭" withCategory:@"test" useBehaviorTextInput:YES isDebug:YES];
  // 禁用地理位置推送 需要再绑定接口前调用。
//  [BPush disableLbs];
  // App 是用户点击推送消息启动
  NSDictionary *userInfo = [launchOptions objectForKey:UIApplicationLaunchOptionsRemoteNotificationKey];
  if (userInfo) {
    [BPush handleNotification:userInfo];
  }
  
  	// TODO:如果获取到消息，可能要做些处理
  	if (userInfo) {
    		[BPush handleNotification:userInfo];
      	[self updateApplicationStatus:application forRemoteNotificication:userInfo];
  	}
}

+ (void)registerForApplication:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
  	completionHandler(UIBackgroundFetchResultNewData);
  
    if (!userInfo) {
        return;
    }
    NthCLog(@"%@", userInfo);
  	// TODO:如果获取到消息，可能要做些处理
    UIApplicationState state = application.applicationState;
  
    if (state == UIApplicationStateActive) {
      	[BPush handleNotification:userInfo];
      	[self updateApplicationStatus:application forRemoteNotificication:userInfo];
      
      	/* FIXME: 取消接收到通知之后显示弹窗
        //NSString *sound = userInfo[kNthCReceivedRemoteNotificationApsKey][kNthCReceivedRemoteNotificationSoundKey];
        //NSString *badge = [userInfo[kNthCReceivedRemoteNotificationApsKey][kNthCReceivedRemoteNotificationBadgeKey] unsignedInteger/Users/zhangfengValue];
        NSString *title = userInfo[kNthCReceivedRemoteNotificationApsKey][kNthCReceivedRemoteNotificationAlertKey];
        NSString *body = userInfo[kNthCReceivedRemoteNotificationApsKey][kNthCReceivedRemoteNotificationBodyKey];
    
        // Handler received message here.
        UIAlertController *controller = [UIAlertController alertControllerWithTitle:title message:body preferredStyle:UIAlertControllerStyleAlert];
        UIAlertAction *cancelAction = [UIAlertAction actionWithTitle:@"取消"
                                                               style:UIAlertActionStyleCancel
                                                             handler:NULL];
        [controller addAction:cancelAction];
        UIAlertAction *okAction = [UIAlertAction actionWithTitle:@"确定"
                                                           style:UIAlertActionStyleDefault
                                                         handler:^(UIAlertAction *action) {
        }];
        [controller addAction:okAction];
        [[UIApplication sharedApplication].keyWindow.rootViewController presentViewController:controller
                                                                                     animated:YES
                                                                                   completion:nil]; */
    } else if (state == UIApplicationStateInactive || state == UIApplicationStateBackground) {
     	 [self updateApplicationStatus:application forRemoteNotificication:userInfo];
    }
}

+ (void)registerForApplication:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    NSLog(@"🔴 deviceToken：%@", [[NSString alloc] initWithData:deviceToken encoding:NSUTF8StringEncoding]);
  
    [BPush registerDeviceToken:deviceToken];
    [BPush bindChannelWithCompleteHandler:^(id result, NSError *error) {
        if (!error) {
            if ([result[@"error_code"] integerValue] == 0) {
                NthCLog(@"🔴 获取到设备channelId = %@", [BPush getChannelId]);
                [[RNBaiduPush shareInstance] receivedChannelID:[BPush getChannelId]];
            }
        } else { }
    }];
  
    [BPush listTagsWithCompleteHandler:^(id result, NSError *error) {
        if (!error) {
            NthCLog(@"🔴 %@", result);
        }
    }];
  
    [BPush setTag:kNthRegisterApplicationTagKey withCompleteHandler:^(id result, NSError *error) {
        if (!error) {
            NthCLog(@"🔴 方法：%s，设置TAG成功。", __FUNCTION__);
        }
    }];
}

+ (void)registerForApplication:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  	NthCLog(@"🔴 方法：%s，失败原因：%@", __FUNCTION__, error.userInfo[NSLocalizedDescriptionKey]);
}

+ (void)registerForApplication:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings {
  	[application registerForRemoteNotifications];
}

+ (void)registerForApplication:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {
		[BPush handleNotification:userInfo];
  	[self updateApplicationStatus:application forRemoteNotificication:userInfo];
}

#pragma mark - Private Methods

+ (void)updateApplicationStatus:(UIApplication *)application forRemoteNotificication:(NSDictionary *)userInfo {
  	if (!userInfo) {
				return;
  	}
  	NSMutableDictionary *updatedUserInfo = userInfo.mutableCopy;
  	[updatedUserInfo setValue:@(application.applicationState) forKey:NSStringFromSelector(@selector(applicationState))];
  
  	[[RNBaiduPush shareInstance] receivedRemoteNotification:updatedUserInfo.copy];
}

@end
