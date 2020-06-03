
#if __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#import "RCTEventDispatcher.h"
#else
#import <React/RCTBridgeModule.h>
#endif


@interface RNBaiduPush : NSObject <RCTBridgeModule>
+(instancetype) shareInstance;
-(void)receivedRemoteNotification:(NSDictionary *)data;
-(void)receivedChannelID:(NSString *)channelID;
@end

