#import "AFPageScrollView.h"

@interface AFPageScrollView () {
    
    // Data
    NSUInteger _photoCount;
    NSMutableArray *_photos;
    NSMutableArray *_thumbPhotos;
    NSArray *_fixedPhotosArray; // Provided via init
    
    // View
    UIScrollView *_pagingScrollView;
    UIPageControl *_pagingIndicator;
    
    // Paging & layout
    NSMutableSet *_visiblePages, *_recycledPages;
    CGRect _previousLayoutBounds;
    NSUInteger _currentPageIndex;
    NSUInteger _previousPageIndex;
    
    BOOL _rotating;
    BOOL _performingLayout;
    BOOL _viewIsActive; // active as in it's in the view heirarchy
    
}

// Data
- (UIImage *)imageForPhoto:(id<AFPhoto>)photo;

- (void)singleTap:(AFZoomingScrollView *)view;
- (void)doubleTap:(AFZoomingScrollView *)view;

@end
