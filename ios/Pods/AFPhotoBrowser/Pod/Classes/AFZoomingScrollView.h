#import <UIKit/UIKit.h>
#import "AFPhotoProtocol.h"
#import "AFTapDetectingView.h"
#import "AFTapDetectingImageView.h"

@class AFPageScrollView;

@interface AFZoomingScrollView : UIScrollView <UIScrollViewDelegate, AFTapDetectingImageViewDelegate, AFTapDetectingViewDelegate>

@property () NSUInteger section;
@property () NSUInteger index;
@property (nonatomic) id <AFPhoto> photo;

- (id)initWithPageScrollView:(AFPageScrollView *)scrollView;
- (void)displayImage;
- (void)displayImageFailure;
- (void)setMaxMinZoomScalesForCurrentBounds;
- (void)prepareForReuse;

@end
