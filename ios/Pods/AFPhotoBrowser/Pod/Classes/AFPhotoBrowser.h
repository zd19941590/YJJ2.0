#import <UIKit/UIKit.h>
#import "AFPageScrollView.h"

@protocol AFPhotoBrowserDelegate;

@interface AFPhotoBrowser : UIViewController <UIScrollViewDelegate, AFPageScrollViewDelegate>

@property (nonatomic, weak) IBOutlet id<AFPhotoBrowserDelegate> delegate;
@property (nonatomic) UIColor *backgroundColor;
@property (nonatomic) BOOL zoomPhotosToFill;
@property (nonatomic) BOOL displayNavigationBar;
@property (nonatomic) BOOL disableIndicator; // Determine if show pageControl, default is `NO`
@property (nonatomic) BOOL alwaysShowControls;
@property (nonatomic, assign) NSUInteger delayToHideElements;
@property (nonatomic, assign) NSUInteger carouselInterval;
@property (nonatomic, strong) UIColor *currentIndicatorColor;
@property (nonatomic, strong) UIColor *IndicatorTintColor;

// Initial
- (id)initWithPhotos:(NSArray *)photosArray;
- (id)initWithDelegate:(id<AFPhotoBrowserDelegate>)delegate;

- (void)reloadData;
- (void)setCurrentPhotoIndex:(NSUInteger)index section:(NSUInteger)section;

- (void)startCarousel;
- (void)cancelCarousel;

@end

@protocol AFPhotoBrowserDelegate <NSObject>

- (NSUInteger)numberOfSectionsInPhotoBrowser:(AFPhotoBrowser *)photoBrowser;
- (NSUInteger)photoBrowser:(AFPhotoBrowser *)photoBrowser numberOfPagesInSection:(NSUInteger)section;
- (id<AFPhoto>)photoBrowser:(AFPhotoBrowser *)photoBrowser photoAtIndex:(NSUInteger)index section:(NSUInteger)section;

@optional

- (id<AFPhoto>)photoBrowser:(AFPhotoBrowser *)photoBrowser thumbPhotoAtIndex:(NSUInteger)index section:(NSUInteger)section;
- (void)photoBrowser:(AFPhotoBrowser *)photoBrowser didDisplaySectionAtIndex:(NSUInteger)index;
- (void)photoBrowser:(AFPhotoBrowser *)photoBrowser didDisplayPhotoAtIndex:(NSUInteger)index section:(NSUInteger)section;
- (void)photoBrowser:(AFPhotoBrowser *)photoBrowser didEndDisplaySectionAtIndex:(NSUInteger)index;
- (NSString *)photoBrowser:(AFPhotoBrowser *)photoBrowser titleForPhotoAtIndex:(NSUInteger)index section:(NSUInteger)section;
- (void)photoBrowser:(AFPhotoBrowser *)photoBrowser singleTapAtIndex:(NSUInteger)index section:(NSUInteger)section;
- (void)photoBrowser:(AFPhotoBrowser *)photoBrowser doubleTapAtIndex:(NSUInteger)index section:(NSUInteger)section;
- (void)photoBrowserDidFinishModalPresentation:(AFPhotoBrowser *)photoBrowser NS_UNAVAILABLE;

@end
