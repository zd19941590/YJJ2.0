#if __has_include(<React/RCTViewManager.h>)
#import <React/RCTViewManager.h>
#import <React/RCTConvert.h>
#else
#import "RCTViewManager.h"
#import "RCTConvert.h"
#endif
#import "RCTPhotoBrowser.h"

@class AFPhotoBrowser;

typedef void (^RCTModalViewInteractionBlock)(UIViewController *reactViewController, UIViewController *viewController, BOOL animated, dispatch_block_t completionBlock);

@interface RCTPhotoBrowserManager : RCTViewManager <RCTPhotoBrowserInteractor>

@property (nonatomic, strong) RCTModalViewInteractionBlock presentationBlock;
@property (nonatomic, strong) RCTModalViewInteractionBlock dismissalBlock;

@end
