/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

#import <IQKeyboardManager/IQKeyboardManager.h>
#import <CodePush/CodePush.h>
#import <SDWebImage/SDImageCache.h>
#import <SDWebImage/SDWebImageDownloader.h>

#import "NthCBPushHelper.h" /**<处理推送事件 */
#import <Bugly/Bugly.h> /**<腾讯Bugly，崩溃分析 */
#import "NthCUmengConfig.h" /** 友盟统计分享 */

@interface AppDelegate ()
@end
 
@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  	///程序初始化的时候做一些配置
  	[self doSometingAfterApplication:application didFinishLaunchingWithOptions:launchOptions];
  
  /// 防止文件被备份
  NSString *documentPath = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES)[0];
  NSString *cachePath = [documentPath stringByAppendingString:@"/yjj"];
  NSLog(@"🔴 dbPath：%@", cachePath);
  
    ///FIXED:在打包的时候注意：DEBUG或者RELEASE模式下需要访问不同文件包`http://www.jianshu.com/p/ce71b4a8a246`
    ///打包请运行命令：npm run bundle-ios
    NSURL *jsCodeLocation;
#ifdef DEBUG
    jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
  #else
    jsCodeLocation = [CodePush bundleURL];
#endif      
    RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                        moduleName:@"YJJApp"
                                                 initialProperties:nil
                                                     launchOptions:launchOptions];
    rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    UIViewController *rootViewController = [UIViewController new];
    rootViewController.view = rootView;
    self.window.rootViewController = rootViewController;
    [self.window makeKeyAndVisible];
  
    return YES;
}

- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings {
    [NthCBPushHelper registerForApplication:application didRegisterUserNotificationSettings:notificationSettings];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
    [NthCBPushHelper registerForApplication:application
               didReceiveRemoteNotification:userInfo
                     fetchCompletionHandler:completionHandler];
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    [NthCBPushHelper registerForApplication:application didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
    [NthCBPushHelper registerForApplication:application didFailToRegisterForRemoteNotificationsWithError:error];
}

#pragma mark -
///////////////////////////////////////////////////////////////////////

- (void)doSometingAfterApplication:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
/// 禁止显示键盘上边`Toolbar`
  [[IQKeyboardManager sharedManager] setEnableAutoToolbar:NO];
  
/// Reigster for remote notifications.
  [NthCBPushHelper registerForApplication:application didFinishLaunchingWithOptions:launchOptions];
  
/// 腾讯Bugly，崩溃分析
  [Bugly startWithAppId:@"025d4fd4bc"];

///友盟统计分析
  [NthCUmengConfig invokeThisMethodToInitialUmentConfig];
  
  // Pod更新时请务必确保`shouldDecompressImages = NO`，否则如果图片分辨率太大会导致闪退
  [[SDWebImageDownloader sharedDownloader] setShouldDecompressImages:NO];
}

@end
