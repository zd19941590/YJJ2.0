//
//  NthCPushMessageBridge.m
//  YJJApp
//
//  Created by 张锋 on 21/11/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import "NthCPushMessageBridge.h"

@implementation NthCPushMessageBridge

+ (instancetype)sharedBridge {
 	 	static NthCPushMessageBridge *bridge = nil;
  	static dispatch_once_t onceToken;
  	dispatch_once(&onceToken, ^{
  		  bridge = [[NthCPushMessageBridge allocWithZone:NULL] init];
 	 	});
 	 return bridge;
}

- (void)didReceiveRemoteNotificationEvent:(NSString *)event identifier:(NSString *)identifier completionHandler:(NthCIdResultBlock)completionHandler {
  
}

@end


































