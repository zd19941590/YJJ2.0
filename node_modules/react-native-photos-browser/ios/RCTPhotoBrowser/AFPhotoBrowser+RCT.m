#import "AFPhotoBrowser+RCT.h"

@implementation AFPhotoBrowser (RCT)
@dynamic supportedInterfaceOrientations;

#if !TARGET_OS_TV
#if RCT_DEV
- (UIInterfaceOrientationMask)supportedInterfaceOrientations {
  UIInterfaceOrientationMask appSupportedOrientationsMask = [RCTSharedApplication() supportedInterfaceOrientationsForWindow:[RCTSharedApplication() keyWindow]];
  if (!(_supportedInterfaceOrientations & appSupportedOrientationsMask)) {
    RCTLogError(@"Modal was presented with 0x%x orientations mask but the application only supports 0x%x."
                @"Add more interface orientations to your app's Info.plist to fix this."
                @"NOTE: This will crash in non-dev mode.",
                (unsigned)_supportedInterfaceOrientations,
                (unsigned)appSupportedOrientationsMask);
    return UIInterfaceOrientationMaskAll;
  }
  
  return _supportedInterfaceOrientations;
}
#endif // RCT_DEV
#endif // !TARGET_OS_TV

@end
