//
//  NthCUmengConfig.m
//  YJJApp
//
//  Created by bluestone on 2018/5/2.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "NthCUmengConfig.h"
#import "RNUMConfigure.h"
#import <UMCAnalytics/UMAnalytics/MobClick.h>

@implementation NthCUmengConfig

+ (void)invokeThisMethodToInitialUmentConfig {
  [UMConfigure setLogEnabled:YES]; //允许控制台打印
  [RNUMConfigure initWithAppkey:@"5ae931c1a40fa3529800000c" channel:@"App Store"];
  
  [MobClick setScenarioType:E_UM_NORMAL]; //设置场景
}

@end
