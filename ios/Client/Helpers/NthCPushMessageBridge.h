//
//  NthCPushMessageBridge.h
//  YJJApp
//
//  Created by 张锋 on 21/11/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "NthCConstants.h"

@interface NthCPushMessageBridge : NSObject

+ (instancetype)sharedBridge;

- (void)didReceiveRemoteNotificationEvent:(NSString *)event identifier:(NSString *)identifier completionHandler:(NthCIdResultBlock)completionHandler;

@end
