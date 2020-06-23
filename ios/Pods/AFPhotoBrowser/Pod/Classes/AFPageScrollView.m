#import <SDWebImage/SDImageCache.h>
#import "AFPageScrollView.h"
#import "AFPageScrollViewPrivate.h"
#import "AFPhotoBrowser.h"

#define PADDING                  10

@implementation AFPageScrollView

- (id)initWithDelegate:(id<AFPageScrollViewDelegate>)delegate {
    if (self == [self initWithFrame:CGRectZero]) {
        _delegate = delegate;
         [self initialProperties];
    }
    return self;
}

- (id)initWithPhotos:(NSArray *)photos {
    if (self == [self initWithFrame:CGRectZero]) {
        _fixedPhotosArray = photos;
         [self initialProperties];
    }
    return self;
}

- (id)initWithPhotoBrowser:(AFPhotoBrowser *)photoBrowser {
    if (self == [self initWithFrame:CGRectZero]) {
        _photoBrowser = photoBrowser;
        [self initialProperties];
    }
    return self;
}

- (instancetype)initWithFrame:(CGRect)frame {
    if (self == [super initWithFrame:frame]) {
		[self initialProperties];
    }
    return self;
}

- (instancetype)initWithCoder:(NSCoder *)aDecoder {
    if (self == [super initWithCoder:aDecoder]) {
        [self initialProperties];
    }
    return self;
}

- (void)dealloc {
    [self releaseAllUnderlyingPhotos:NO];
    [[SDImageCache sharedImageCache] clearMemory]; // clear memory
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)awakeFromNib {
    [self initialProperties];
    [super awakeFromNib];
}

- (void)initialProperties {
    
    _currentPageIndex = 0;
    _previousPageIndex = NSUIntegerMax;
    _previousLayoutBounds = CGRectZero;
    
    _rotating = NO;
    _performingLayout = NO;
    _viewIsActive = NO;
    
    _photoCount = NSNotFound;
    _photos = [[NSMutableArray alloc] init];
    _thumbPhotos = [[NSMutableArray alloc] init];
    
    _visiblePages = [[NSMutableSet alloc] init];
    _recycledPages = [[NSMutableSet alloc] init];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleAFPhotoLoadingDidEndNotification:)
                                                 name:AFPHOTO_LOADING_DID_END_NOTIFICATION
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(willTransitionToTraitCollection:)
                                                 name:AFPHOTOBROWSER_WILL_TRANSITION_TO_TRAINT_COLLECTION
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(didTransitionToTraitCollection:)
                                                 name:AFPHOTOBROWSER_DID_TRANSITION_TO_TRAINT_COLLECTION
                                               object:nil];
    
}

- (void)setup {
    self.backgroundColor = [UIColor blackColor];
    self.clipsToBounds = YES;
    self.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    
    CGRect pagingScrollViewFrame = [self frameForPagingScrollView];
    _pagingScrollView = [[UIScrollView alloc] initWithFrame:pagingScrollViewFrame];
    _pagingScrollView.backgroundColor = [UIColor blackColor];
    _pagingScrollView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    _pagingScrollView.delegate = self;
    _pagingScrollView.pagingEnabled = YES;
    _pagingScrollView.showsHorizontalScrollIndicator = NO;
    _pagingScrollView.showsVerticalScrollIndicator = NO;
    _pagingScrollView.contentSize = [self contentSizeForPagingScrollView];
    [self addSubview:_pagingScrollView];
    
    if (@available(iOS 11.0, *)) {
        _pagingScrollView.contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentNever;
    } else {
        // Fallback on earlier versions
    }
    
    if (!_disableIndicator) {
        CGPoint pagingIndicatorCenter = [self centerForPagingIndicator];
        _pagingIndicator = [[UIPageControl alloc] initWithFrame:CGRectZero];
        _pagingIndicator.transform = CGAffineTransformMakeRotation(M_PI/2);
        _pagingIndicator.backgroundColor = [UIColor orangeColor];
        _pagingIndicator.center = pagingIndicatorCenter;
        _pagingIndicator.pageIndicatorTintColor = self.IndicatorTintColor;
        _pagingIndicator.currentPageIndicatorTintColor = self.currentIndicatorColor;
        _pagingIndicator.numberOfPages = [self numberOfPhotos];
        [self addSubview:_pagingIndicator];
        [self bringSubviewToFront:_pagingIndicator];
    }
    
    // Update
    [self reloadData];
}

- (void)releaseAllUnderlyingPhotos:(BOOL)preserveCurrent {
    NSArray *copy = [_photos copy];
    for (id p in copy) {
        if (p != [NSNull null]) {
            if (preserveCurrent && p == [self photoAtIndex:self.currentIndex]) {
                continue;
            }
            [p unloadUnderlyingImage];
        }
    }
    copy = [_thumbPhotos copy];
    for (id p in copy) {
        if (p != [NSNull null]) {
            [p unloadUnderlyingImage];
        }
    }
}

- (void)prepareForReuse {
    _photoCount = NSNotFound;
    _currentPageIndex = 0;
    _previousPageIndex = NSUIntegerMax;

    _rotating = NO;
    _performingLayout = NO;
    _viewIsActive = NO;

    [_photos removeAllObjects];
    [_thumbPhotos removeAllObjects];
    
//    [_visiblePages removeAllObjects];
//    [_recycledPages removeAllObjects];
}

- (void)didMoveToSuperview {
    _viewIsActive = YES;
    [super didMoveToSuperview];
}

- (void)removeFromSuperview {
    _viewIsActive = NO;
    [super removeFromSuperview];
}

#pragma mark - Notifications

- (void)handleAFPhotoLoadingDidEndNotification:(NSNotification *)notification {
    id <AFPhoto> photo = [notification object];
    AFZoomingScrollView *page = [self pageDisplayingPhoto:photo];
    if (page) {
        if ([photo underlyingImage]) {
            [page displayImage];
            [self loadAdjacentPhotosIfNecessary:photo];
        } else {
            [page displayImageFailure];
        }
    }
}

- (void)willTransitionToTraitCollection:(NSNotification *)notify {
    _rotating = YES;
    [self layoutVisiblePages];
}

- (void)didTransitionToTraitCollection:(NSNotification *)notify {
    _rotating = NO;
}

#pragma mark - Layout

- (void)layoutSubviews {
    [self layoutVisiblePages];
    [super layoutSubviews];
}

- (void)performLayout {
    _performingLayout = YES;
    
    [_visiblePages removeAllObjects];
    [_recycledPages removeAllObjects];
    
    _pagingScrollView.contentOffset = [self contentOffsetForPageAtIndex:_currentPageIndex];
    [self tilePages];
    _performingLayout = NO;
}

- (void)layoutVisiblePages {
    _performingLayout = YES;
    NSUInteger indexPriorToLayout = _currentPageIndex;
    
    _pagingScrollView.contentSize = [self contentSizeForPagingScrollView];
    if (!_disableIndicator) {
        _pagingIndicator.center = [self centerForPagingIndicator];
    }
    
    for (AFZoomingScrollView *page in _visiblePages) {
        NSUInteger index = page.index;
        page.frame = [self frameForPageAtIndex:index];
        
        if (!CGRectEqualToRect(_previousLayoutBounds, self.bounds)) {
            [page setMaxMinZoomScalesForCurrentBounds];
            _previousLayoutBounds = self.bounds;
        }
    }
    
    _pagingScrollView.contentOffset = [self contentOffsetForPageAtIndex:indexPriorToLayout];
    [self didStartViewingPageAtIndex:_currentPageIndex];
    
    _currentPageIndex = indexPriorToLayout;
    _performingLayout = NO;
}

#pragma mark - Data

- (NSUInteger)currentIndex {
    return _currentPageIndex;
}

- (void)reloadData {
    _photoCount = NSNotFound;
    
    NSUInteger numberOfPhotos = [self numberOfPhotos];
    [self releaseAllUnderlyingPhotos:YES];
    [_photos removeAllObjects];
    [_thumbPhotos removeAllObjects];
    for (int i = 0; i < numberOfPhotos; i++) {
        [_photos addObject:[NSNull null]];
        [_thumbPhotos addObject:[NSNull null]];
    }
    
    if (numberOfPhotos > 0) {
        _currentPageIndex = MAX(0, MIN(_currentPageIndex, numberOfPhotos - 1));
    } else {
        _currentPageIndex = 0;
    }
    
    while (_pagingScrollView.subviews.count) {
        [_pagingScrollView.subviews.lastObject removeFromSuperview];
    }
    [self performLayout];
    [self setNeedsLayout];
}

- (NSUInteger)numberOfPhotos {
    if (_photoCount == NSNotFound) {
        if ([_delegate respondsToSelector:@selector(numberOfPhotosInPageScrollView:)]) {
            _photoCount = [_delegate numberOfPhotosInPageScrollView:self];
        } else if (_fixedPhotosArray) {
            _photoCount = _fixedPhotosArray.count;
        }
    }
    if (_photoCount == NSNotFound) _photoCount = 0;
    return _photoCount;
}

- (id<AFPhoto>)photoAtIndex:(NSUInteger)index {
    id<AFPhoto> photo = nil;
    if (index < _photos.count) {
        if ([_photos objectAtIndex:index] == [NSNull null]) {
            if ([_delegate respondsToSelector:@selector(scrollView:photoAtIndex:)]) {
                photo = [_delegate scrollView:self photoAtIndex:index];
            } else if (_fixedPhotosArray && index < _fixedPhotosArray.count) {
                photo = [_fixedPhotosArray objectAtIndex:index];
            }
            if (photo)  [_photos replaceObjectAtIndex:index withObject:photo];
        } else {
            photo = [_photos objectAtIndex:index];
        }
    }
    return photo;
}

- (id<AFPhoto>)thumbPhotoAtIndex:(NSUInteger)index {
    id<AFPhoto> photo = nil;
    if (index < _thumbPhotos.count) {
        if ([_thumbPhotos objectAtIndex:index] == [NSNull null]) {
            if ([_delegate respondsToSelector:@selector(scrollView:thumbPhotoAtIndex:)]) {
                [_delegate scrollView:self thumbPhotoAtIndex:index];
            }
            if (photo) [_thumbPhotos replaceObjectAtIndex:index withObject:photo];
        }
    } else {
        photo = [_thumbPhotos objectAtIndex:index];
    }
    return photo;
}

- (UIImage *)imageForPhoto:(id<AFPhoto>)photo {
    if (photo) {
        if ([photo underlyingImage]) {
            return [photo underlyingImage];
        } else {
            [photo loadUnderlyingImageAndNotify];
        }
    }
    return nil;
}

- (void)loadAdjacentPhotosIfNecessary:(id<AFPhoto>)photo {
    AFZoomingScrollView *page = [self pageDisplayingPhoto:photo];
    if (page) {
        NSUInteger pageIndex = page.index;
        if (_currentPageIndex == pageIndex) {
            if (pageIndex > 0) {
                // Preload index - 1
                id <AFPhoto> photo = [self photoAtIndex:pageIndex-1];
                if (![photo underlyingImage]) {
                    [photo loadUnderlyingImageAndNotify];
                    NSLog(@"Pre-loading image at index %lu", (unsigned long)pageIndex-1);
                }
            }
            if (pageIndex < [self numberOfPhotos] - 1) {
                // Preload index + 1
                id <AFPhoto> photo = [self photoAtIndex:pageIndex+1];
                if (![photo underlyingImage]) {
                    [photo loadUnderlyingImageAndNotify];
                    NSLog(@"Pre-loading image at index %lu", (unsigned long)pageIndex+1);
                }
            }
        }
    }
}

#pragma mark - Paging

- (void)tilePages {
    
    CGRect visibleBounds = _pagingScrollView.bounds;
    NSInteger iFirstIndex = (NSInteger)floorf((CGRectGetMinY(visibleBounds)+PADDING*2) / CGRectGetHeight(visibleBounds));
    NSInteger iLastIndex  = (NSInteger)floorf((CGRectGetMaxY(visibleBounds)-PADDING*2-1) / CGRectGetHeight(visibleBounds));
    if (iFirstIndex < 0) iFirstIndex = 0;
    if (iFirstIndex > [self numberOfPhotos] - 1) iFirstIndex = [self numberOfPhotos] - 1;
    if (iLastIndex < 0) iLastIndex = 0;
    if (iLastIndex > [self numberOfPhotos] - 1) iLastIndex = [self numberOfPhotos] - 1;

    NSInteger pageIndex;
    for (AFZoomingScrollView *page in _visiblePages) {
        pageIndex = page.index;
        if (pageIndex < (NSUInteger)iFirstIndex || pageIndex > (NSUInteger)iLastIndex) {
            [_recycledPages addObject:page];
            [page prepareForReuse];
            [page removeFromSuperview];
            NSLog(@"Removed page at index %zd", (unsigned long)pageIndex);
        }
    }
    [_visiblePages minusSet:_recycledPages];
    while (_recycledPages.count > 2) {
        [_recycledPages removeObject:[_recycledPages anyObject]];
    }

    for (NSUInteger index = (NSUInteger)iFirstIndex; index <= (NSUInteger)iLastIndex; index++) {
        if (![self isDisplayingPageForIndex:index]) {

            AFZoomingScrollView *page = [self dequeueRecycledPage];
            if (!page) {
                page = [[AFZoomingScrollView alloc] initWithPageScrollView:self];
            }
            [_visiblePages addObject:page];
            [self configurePage:page forIndex:index];

            [_pagingScrollView addSubview:page];
            NSLog(@"Added page at index %zd", (unsigned long)index);
        }
    }
}

- (AFZoomingScrollView *)pageDisplayingPhoto:(id<AFPhoto>)photo {
    AFZoomingScrollView *thePage = nil;
    for (AFZoomingScrollView *page in _visiblePages) {
        if (page.photo == photo) {
            thePage = page; break;
        }
    }
    return thePage;
}

- (BOOL)isDisplayingPageForIndex:(NSUInteger)index {
    for (AFZoomingScrollView *page in _visiblePages)
        if (page.index == index) return YES;
    return NO;
}

- (void)configurePage:(AFZoomingScrollView *)page forIndex:(NSUInteger)index {
    page.frame = [self frameForPageAtIndex:index];
    page.section = self.section;
    page.index = index;
    page.photo = [self photoAtIndex:index];
}

- (AFZoomingScrollView *)dequeueRecycledPage {
    AFZoomingScrollView *page = [_recycledPages anyObject];
    if (page) {
        [_recycledPages removeObject:page];
    }
    return page;
}

// Handle page changes
- (void)didStartViewingPageAtIndex:(NSUInteger)index {
    
    if (![self numberOfPhotos]) return;
    
    if (!_disableIndicator) {
        _pagingIndicator.currentPage = index;
    }
    
    // Release images further away than +/-1
    NSUInteger i;
    if (index > 0) {
        // Release anything < index - 1
        for (i = 0; i < index-1; i++) {
            id photo = [_photos objectAtIndex:i];
            if (photo != [NSNull null]) {
                [photo unloadUnderlyingImage];
                [_photos replaceObjectAtIndex:i withObject:[NSNull null]];
                NSLog(@"Released underlying image at index %lu", (unsigned long)i);
            }
        }
    }
    if (index < [self numberOfPhotos] - 1) {
        // Release anything > index + 1
        for (i = index + 2; i < _photos.count; i++) {
            id photo = [_photos objectAtIndex:i];
            if (photo != [NSNull null]) {
                [photo unloadUnderlyingImage];
                [_photos replaceObjectAtIndex:i withObject:[NSNull null]];
                NSLog(@"Released underlying image at index %lu", (unsigned long)i);
            }
        }
    }
    
    // Load adjacent images if needed and the photo is already
    // loaded. Also called after photo has been loaded in background
    id <AFPhoto> currentPhoto = [self photoAtIndex:index];
    if ([currentPhoto underlyingImage]) {
        // photo loaded so load ajacent now
        [self loadAdjacentPhotosIfNecessary:currentPhoto];
    }
    
    // Notify delegate
    if (index != _previousPageIndex) {
        if ([_delegate respondsToSelector:@selector(scrollView:didDisplayPhotoAtIndex:)])
            [_delegate scrollView:self didDisplayPhotoAtIndex:index];
        _previousPageIndex = index;
    }
}

- (void)singleTap:(AFZoomingScrollView *)view {
    if ([_delegate respondsToSelector:@selector(scrollView:singleTapAtIndex:)]) {
        [_delegate scrollView:self singleTapAtIndex:view.index];
    }
}

- (void)doubleTap:(AFZoomingScrollView *)view {
    if ([_delegate respondsToSelector:@selector(scrollView:doubleTapAtIndex:)]) {
        [_delegate scrollView:self doubleTapAtIndex:view.index];
    }
}

#pragma mark - Properties

- (void)setCurrentPhotoIndex:(NSUInteger)index {
    // Validate
    NSUInteger photoCount = [self numberOfPhotos];
    if (photoCount == 0) {
        index = 0;
    } else {
        if (index >= photoCount)
            index = [self numberOfPhotos]-1;
    }
    _currentPageIndex = index;
    [self jumpToPageAtIndex:index animated:NO];
    if (!_viewIsActive)
        [self tilePages];
}

- (void)jumpToPageAtIndex:(NSUInteger)index animated:(BOOL)animated {
    if (index < [self numberOfPhotos]) {
        CGRect pageFrame = [self frameForPageAtIndex:index];
        [_pagingScrollView setContentOffset:CGPointMake(0, pageFrame.origin.y - PADDING) animated:animated];
        
        if (!_disableIndicator) {
            _pagingIndicator.currentPage = index;
        }
    }
}

#pragma mark - Frame Calculations

- (CGRect)frameForPagingScrollView {
    CGRect frame = self.bounds;// [[UIScreen mainScreen] bounds];
    frame.origin.y -= PADDING;
    frame.size.height += (2 * PADDING);
    return CGRectIntegral(frame);
}

- (CGRect)frameForPageAtIndex:(NSUInteger)index {
    // We have to use our paging scroll view's bounds, not frame, to calculate the page placement. When the device is in
    // landscape orientation, the frame will still be in portrait because the pagingScrollView is the root view controller's
    // view, so its frame is in window coordinate space, which is never rotated. Its bounds, however, will be in landscape
    // because it has a rotation transform applied.
    CGRect bounds = _pagingScrollView.bounds;
    CGRect pageFrame = bounds;
    pageFrame.size.height -= (2 * PADDING);
    pageFrame.origin.y = (bounds.size.height * index) + PADDING;
    return CGRectIntegral(pageFrame);
}

- (CGSize)contentSizeForPagingScrollView {
    CGRect bounds = _pagingScrollView.bounds;
    return CGSizeMake(bounds.size.width, bounds.size.height  * [self numberOfPhotos]);
}

- (CGPoint)centerForPagingIndicator {
    CGFloat offset = 22;
    
    CGRect bounds = _pagingScrollView.bounds;
    CGFloat centerX;
    
    if (@available(iOS 11.0, *)) {
        centerX = bounds.size.width - [UIApplication sharedApplication].keyWindow.safeAreaInsets.right - offset;
    } else {
        centerX = bounds.size.width - offset;
        // Fallback on earlier versions
    }
    
    return CGPointMake(centerX, _pagingScrollView.center.y);
}

- (CGPoint)contentOffsetForPageAtIndex:(NSUInteger)index {
    CGFloat pageHeight = _pagingScrollView.bounds.size.height;
    CGFloat newOffset = index * pageHeight;
    return CGPointMake(0, newOffset);
}

#pragma mark - UIScrollView Delegate

- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView {
    
}

- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
    if (!_viewIsActive || _performingLayout || _rotating) return;
    
    [self tilePages];
    
    CGRect visibleBounds = _pagingScrollView.bounds;
    NSInteger index = (NSInteger)(floorf(CGRectGetMidY(visibleBounds) / CGRectGetHeight(visibleBounds)));
    if (index < 0) index = 0;
    if (index > [self numberOfPhotos] - 1) index = [self numberOfPhotos] - 1;
    NSUInteger previousCurrentPage = _currentPageIndex;
    _currentPageIndex = index;
    if (_currentPageIndex != previousCurrentPage) {
        [self didStartViewingPageAtIndex:index];
    }
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView {
    
}

@end
