#import "AFPhotoBrowser.h"

@class AFPageIndicator;

@interface AFPhotoBrowser () {
    
    // Views
    UIScrollView *_pagingScrollView;
    AFPageIndicator *_pagingIndicator;
    
    // Datas
    NSArray *_fixedPhotosArray; // Provided via init
    NSMutableArray *_photos;
    NSMutableArray *_thumbPhotos;
    
    // Paging & layout
    NSMutableSet *_visiblePages, *_recycledPages;
    
    // Index
    NSUInteger _sectionCount;
    NSUInteger _currentSectionIndex;
    NSUInteger _currentPhotoIndex;
    NSUInteger _previousSectionIndex;
    
    // Navigation & controls
    NSTimer *_controlVisibilityTimer;
    NSTimer *_carouselTimer;
    
    BOOL _isVCBasedStatusBarAppearance;
    BOOL _statusBarShouldBeHidden;
    BOOL _performingLayout;
    BOOL _rotating;
    BOOL _viewIsActive; // active as in it's in the view heirarchy
    BOOL _carousel;
}

@end
