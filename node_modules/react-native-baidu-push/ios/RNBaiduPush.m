
#import "RNBaiduPush.h"
#import "BDPush-SDK-IOS-1.4.9.2/BPush.h"
#import <React/RCTRootView.h>

@implementation RNBaiduPush

@synthesize bridge = _bridge;
static RNBaiduPush* _instance = nil;
+(instancetype) shareInstance
{
    static dispatch_once_t onceToken ;
    dispatch_once(&onceToken, ^{
        _instance = [[super allocWithZone:NULL] init] ;
    }) ;
    return _instance ;
}


- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}


+(id) allocWithZone:(struct _NSZone *)zone
{
    return [RNBaiduPush shareInstance] ;
}

-(id) copyWithZone:(struct _NSZone *)zone
{
    return [RNBaiduPush shareInstance] ;
}


RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(fetchLastClickedNotification:(RCTResponseSenderBlock)callback){
    RCTRootView *rootView = (RCTRootView *)[UIApplication sharedApplication].delegate.window.rootViewController.view;
    NSDictionary *launchOptions =  rootView.bridge.launchOptions;
    if(launchOptions)
    {
        NSDictionary *userInfo = [launchOptions objectForKey:UIApplicationLaunchOptionsRemoteNotificationKey];
        if (userInfo) {
            callback(@[userInfo]);
        }
        
    }
}
RCT_EXPORT_METHOD(startPushWork:(NSString *)apiKey){
    if(apiKey)
    {
        //角标清0
        [[UIApplication sharedApplication] setApplicationIconBadgeNumber:0];
        RCTRootView *rootView = (RCTRootView *)[UIApplication sharedApplication].delegate.window.rootViewController.view;
        NSDictionary *launchOptions =  rootView.bridge.launchOptions;
        [BPush registerChannel: launchOptions apiKey:apiKey pushMode:BPushModeDevelopment withFirstAction:@"打开" withSecondAction:@"关闭" withCategory:@"test" useBehaviorTextInput:YES isDebug:YES];
        // 禁用地理位置推送 需要再绑定接口前调用。
        [BPush disableLbs];
        // App 是用户点击推送消息启动
        NSDictionary *userInfo = [launchOptions objectForKey:UIApplicationLaunchOptionsRemoteNotificationKey];
        if (userInfo) {
            [BPush handleNotification:userInfo];
        }
    }
    
}

RCT_EXPORT_METHOD(setPushTags:(NSArray *)tags){
    if (tags && tags.count > 0) {
        [BPush setTags:tags withCompleteHandler:nil];
    }
    
}

RCT_EXPORT_METHOD(removePushTags:(NSArray *)tags){
    if (tags && tags.count > 0) {
        [BPush delTags:tags withCompleteHandler:nil];
    }
    
}

-(void)receivedRemoteNotification:(NSDictionary *)data
{
    [self.bridge.eventDispatcher sendAppEventWithName:@"OnReceivedRemoteNotification"
                                                 body:data];
}

-(void)receivedChannelID:(NSString *)channelID
{
    [self.bridge.eventDispatcher sendAppEventWithName:@"OnBPushRegistered"
                                                 body:@{@"channelID":channelID}];
}

@end
