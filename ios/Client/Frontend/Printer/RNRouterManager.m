//
//  NthCReactNativeBridge.m
//  YJJApp
//
//  Created by 张锋 on 21/11/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import "RNRouterManager.h"
#import "AppDelegate.h"
#import "PrinterListViewController.h"


@implementation RNRouterManager

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(print:(id)data) {
    RCTLog(@"👉方法：%s，参数：%@。", __FUNCTION__, data);
    dispatch_async(dispatch_get_main_queue(), ^{
      PrinterListViewController *printer = [[PrinterListViewController alloc] initWithPrintParameters:data];
      UINavigationController *nav = [[UINavigationController alloc] initWithRootViewController:printer];
      [[self topViewController] presentViewController:nav animated:YES completion:nil];
    });
}

- (UIViewController *)topViewController {
    UIViewController *resultVC;
    resultVC = [self _topViewController:[[UIApplication sharedApplication].keyWindow rootViewController]];
    while (resultVC.presentedViewController) {
        resultVC = [self _topViewController:resultVC.presentedViewController];
    }
  
    return resultVC;
}

- (UIViewController *)_topViewController:(UIViewController *)vc {
    if ([vc isKindOfClass:[UINavigationController class]]) {
        return [self _topViewController:[(UINavigationController *)vc topViewController]];
    } else if ([vc isKindOfClass:[UITabBarController class]]) {
        return [self _topViewController:[(UITabBarController *)vc selectedViewController]];
    } else {
        return vc;
    }
  
    return nil;
}


@end
