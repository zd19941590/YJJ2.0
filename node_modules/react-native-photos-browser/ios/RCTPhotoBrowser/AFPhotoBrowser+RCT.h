#if __has_include(<AFPhotoBrowser/AFPhotoBrowser.h>)
	#import <AFPhotoBrowser/AFPhotoBrowser.h>
#else
	#import "AFPhotoBrowser.h"
#endif

@interface AFPhotoBrowser (RCT)

#if !TARGET_OS_TV
@property (nonatomic, assign) UIInterfaceOrientationMask supportedInterfaceOrientations;
#endif

@end
