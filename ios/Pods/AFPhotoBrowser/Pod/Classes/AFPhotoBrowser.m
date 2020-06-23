#import "AFPhotoBrowser.h"
#import "AFPhoto.h"
#import "AFPageIndicator.h"
#import "AFPhotoBrowserPrivate.h"

#define PADDING                  10

@implementation AFPhotoBrowser

#pragma mark - Initial

- (id)initWithPhotos:(NSArray *)photosArray {
    if (self == [self init]) {
        _fixedPhotosArray = photosArray;
    }
    return self;
}

- (id)initWithDelegate:(id<AFPhotoBrowserDelegate>)delegate {
    if (self == [self init]) {
        _delegate = delegate;
    }
    return self;
}

- (instancetype)initWithCoder:(NSCoder *)aDecoder {
    if (self == [super initWithCoder:aDecoder]) {
        [self initialProperties];
    }
    return self;
}

- (instancetype)init {
    if (self == [super init]) {
        [self initialProperties];
    }
    return self;
}

- (void)initialProperties {
    
    NSNumber *isVCBasedStatusBarAppearanceNum = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"UIViewControllerBasedStatusBarAppearance"];
    if (isVCBasedStatusBarAppearanceNum) {
        _isVCBasedStatusBarAppearance = isVCBasedStatusBarAppearanceNum.boolValue;
    } else {
        _isVCBasedStatusBarAppearance = YES; // default
    }
    
    _sectionCount = NSNotFound;
    _currentSectionIndex = 0;
    _currentPhotoIndex = 0;
    _previousSectionIndex = NSUIntegerMax;
    
    _performingLayout = NO;
    _rotating = NO;
    _viewIsActive = NO;
    
    _zoomPhotosToFill = YES;
    _displayNavigationBar = YES;
    _statusBarShouldBeHidden = NO;
    _disableIndicator = NO;
    _alwaysShowControls = NO;
    _delayToHideElements = 5;
    _carouselInterval = 3;
    
    _IndicatorTintColor = [UIColor darkGrayColor];
    _currentIndicatorColor = [UIColor whiteColor];
    
    _photos = [[NSMutableArray alloc] init];
    _thumbPhotos = [[NSMutableArray alloc] init];
    _visiblePages = [[NSMutableSet alloc] init];
    _recycledPages = [[NSMutableSet alloc] init];
}

#pragma mark - Life

- (void)dealloc {
    _pagingScrollView.delegate = nil;
}

- (void)viewDidLoad {
    self.view.backgroundColor = [UIColor blackColor];
    self.view.clipsToBounds = YES;
    
    CGRect pagingScrollViewFrame = [self frameForPagingScrollView];
    _pagingScrollView = [[UIScrollView alloc] initWithFrame:pagingScrollViewFrame];
    _pagingScrollView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    _pagingScrollView.delegate = self;
    _pagingScrollView.pagingEnabled = YES;
    _pagingScrollView.showsHorizontalScrollIndicator = NO;
    _pagingScrollView.showsVerticalScrollIndicator = NO;
    _pagingScrollView.backgroundColor = [UIColor blackColor];
    _pagingScrollView.contentSize = [self contentSizeForPagingScrollView];
    [self.view addSubview:_pagingScrollView];
    
    if (@available(iOS 11.0, *)) {
        _pagingScrollView.contentInsetAdjustmentBehavior = UIScrollViewContentInsetAdjustmentNever;
    } else {
        self.automaticallyAdjustsScrollViewInsets = NO;
        // Fallback on earlier versions
    }
    
    if (!_disableIndicator) {
        CGRect pagingIndicatorFrame = [self frameForPagingIndicator];
        _pagingIndicator = [[AFPageIndicator alloc] initWithFrame:pagingIndicatorFrame];
        _pagingIndicator.backgroundColor = [UIColor darkGrayColor];
        _pagingIndicator.layer.cornerRadius = 12.5;
        _pagingIndicator.layer.masksToBounds = YES;
        [self.view addSubview:_pagingIndicator];
    }
    
//    [self reloadData];
    
    [super viewDidLoad];
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    
     if (self.navigationController)
         [self.navigationController setNavigationBarHidden:!_displayNavigationBar animated:NO];
}

- (void)viewDidAppear:(BOOL)animated {
    _viewIsActive = YES;
    
    [super viewDidAppear:animated];
}

- (void)viewWillDisappear:(BOOL)animated {
    // Controls
    [self.navigationController.navigationBar.layer removeAllAnimations];
    [NSObject cancelPreviousPerformRequestsWithTarget:self];
    [self setControlsHidden:NO animated:NO];
    
    _viewIsActive = NO;
    
    [super viewWillDisappear:animated];
}

#pragma mark - Layout

- (void)viewWillLayoutSubviews {
    [super viewWillLayoutSubviews];
    [self layoutVisibleSections];
}

- (void)performLayout {
    _performingLayout = YES;
    
    // Setup pages
    [_visiblePages removeAllObjects];
    [_recycledPages removeAllObjects];
    
    // Update nav
    [self updateNavigation];
    
    _pagingIndicator.numberOfPages = [self numberOfSections];
    _pagingIndicator.currentPage = _currentSectionIndex;
    
    // Content offset
    _pagingScrollView.contentOffset = [self contentOffsetForPageAtSection:_currentSectionIndex];
    [self tilePages];
    
    _performingLayout = NO;
}

- (void)layoutVisibleSections {
    _performingLayout = YES;
    
    NSUInteger indexPriorToLayout = _currentSectionIndex;
    
    _pagingScrollView.contentSize = [self contentSizeForPagingScrollView];
    if (!_disableIndicator)
        _pagingIndicator.frame = [self frameForPagingIndicator];
    
    for (AFPageScrollView *page in _visiblePages) {
        NSUInteger section = page.section;
        page.frame = [self frameForPageAtSection:section];
    }
    
    _pagingScrollView.contentOffset = [self contentOffsetForPageAtSection:indexPriorToLayout];
    [self didStartViewingSectionAtIndex:_currentSectionIndex];
    
    _currentSectionIndex = indexPriorToLayout;
    _performingLayout = NO;
}

#pragma mark - Transition

- (BOOL)prefersStatusBarHidden { return _statusBarShouldBeHidden; }

- (BOOL)shouldAutorotate { return YES; }

- (UIInterfaceOrientationMask)supportedInterfaceOrientations {
    return UIInterfaceOrientationMaskAll;
}

- (void)willTransitionToTraitCollection:(UITraitCollection *)newCollection withTransitionCoordinator:(id<UIViewControllerTransitionCoordinator>)coordinator {
    _rotating = YES;
    
    [coordinator animateAlongsideTransition:^(id<UIViewControllerTransitionCoordinatorContext>  _Nonnull context) {
        [self layoutVisibleSections];
        [[NSNotificationCenter defaultCenter] postNotificationName:AFPHOTOBROWSER_WILL_TRANSITION_TO_TRAINT_COLLECTION
                                                            object:coordinator];
    } completion:^(id<UIViewControllerTransitionCoordinatorContext>  _Nonnull context) {
        self->_rotating = NO;
        [[NSNotificationCenter defaultCenter] postNotificationName:AFPHOTOBROWSER_DID_TRANSITION_TO_TRAINT_COLLECTION
                                                            object:coordinator];
    }];
}

#pragma mark - Paging

- (void)tilePages {
    CGRect visibleBounds = _pagingScrollView.bounds;
    NSInteger iFirstSection = (NSInteger)floorf((CGRectGetMinX(visibleBounds)+PADDING*2) / CGRectGetWidth(visibleBounds));
    NSInteger iLastSection  = (NSInteger)floorf((CGRectGetMaxX(visibleBounds)-PADDING*2-1) / CGRectGetWidth(visibleBounds));
    if (iFirstSection < 0) iFirstSection = 0;
    if (iFirstSection > [self numberOfSections] - 1) iFirstSection = [self numberOfSections] - 1;
    if (iLastSection < 0) iLastSection = 0;
    if (iLastSection > [self numberOfSections] - 1) iLastSection = [self numberOfSections] - 1;
    
    NSInteger pageSection;
    for (AFPageScrollView *page in _visiblePages) {
        pageSection = page.section;
        if (pageSection < iFirstSection || pageSection > iLastSection) {
            [_recycledPages addObject:page];
            [page prepareForReuse];
            [page removeFromSuperview];
            NSLog(@"🔵 [Browser] Removed page at index %lu", (unsigned long)pageSection);
        }
    }
    [_visiblePages minusSet:_recycledPages];
    while (_recycledPages.count > 2) {
        [_recycledPages removeObject:[_recycledPages anyObject]];
    }

    for (NSUInteger index = iFirstSection; index <= iLastSection; index++) {
        if (![self isDisplayingPageForSection:index]) {
            AFPageScrollView *page = [self dequeueRecycledPage];
            if (!page) {
                page = [[AFPageScrollView alloc] initWithPhotoBrowser:self];
            }
            [_visiblePages addObject:page];
            [self configurePage:page forSection:index];
            [page setup];
            
            [_pagingScrollView addSubview:page];
            
            NSLog(@"🔵 [Browser] Added page at index %lu", (unsigned long)index);
        }
    }
}

- (BOOL)isDisplayingPageForSection:(NSUInteger)section {
    for (AFPageScrollView *page in _visiblePages)
        if (page.section == section) return YES;
    return NO;
}

- (void)configurePage:(AFPageScrollView *)page forSection:(NSUInteger)section {
    page.frame = [self frameForPageAtSection:section];
    page.delegate = self;
    page.section = section;
    page.zoomPhotosToFill = self.zoomPhotosToFill;
    page.disableIndicator = self.disableIndicator;
    page.IndicatorTintColor = self.IndicatorTintColor;
    page.currentIndicatorColor = self.currentIndicatorColor;
}

- (AFPageScrollView *)dequeueRecycledPage {
    AFPageScrollView *page = [_recycledPages anyObject];
    if (page) {
        [_recycledPages removeObject:page];
    }
    return page;
}

- (void)didStartViewingSectionAtIndex:(NSUInteger)section {
    
    if (![self numberOfSections]) {
        [self setControlsHidden:NO animated:YES];
        return;
    }
    
    if (!_disableIndicator) _pagingIndicator.currentPage = section;
    
    if (section != _previousSectionIndex) {
        if ([_delegate respondsToSelector:@selector(photoBrowser:didDisplayPhotoAtIndex:section:)]) {
            [_delegate photoBrowser:self didDisplayPhotoAtIndex:_currentPhotoIndex section:section];
        }
        _previousSectionIndex = section;
    }
    
    [self updateNavigation];
    
}
    
#pragma mark - Data

- (void)reloadData {
    _sectionCount = NSNotFound;
    
    NSUInteger numberOfSections = [self numberOfSections];
    
    [_photos removeAllObjects];
    [_thumbPhotos removeAllObjects];
    
    for (int section = 0; section < numberOfSections; section++) {
        NSUInteger numberOfPhotos = [self numberOfPhotosInSection:section];
        
        NSMutableArray *photos = [NSMutableArray arrayWithCapacity:numberOfPhotos];
        NSMutableArray *thumbPhotos = [NSMutableArray arrayWithCapacity:numberOfPhotos];
        
        for (int index = 0; index < numberOfPhotos; index++) {
            [photos addObject:[NSNull null]];
            [thumbPhotos addObject:[NSNull null]];
        }
        
        [_photos addObject:photos];
        [_thumbPhotos addObject:thumbPhotos];
    }
    
    // Update current page index
    if (numberOfSections > 0) {
        _currentSectionIndex = MAX(0, MIN(_currentSectionIndex, numberOfSections - 1));
    } else {
        _currentSectionIndex = 0;
    }
    
    if ([self isViewLoaded]) {
        while (_pagingScrollView.subviews.count) {
            [_pagingScrollView.subviews.lastObject removeFromSuperview];
        }
        [self performLayout];
        [self.view setNeedsLayout];
    }
}

- (NSUInteger)numberOfSections {
    if (_sectionCount == NSNotFound) {
        if ([_delegate respondsToSelector:@selector(numberOfSectionsInPhotoBrowser:)]) {
            _sectionCount = [_delegate numberOfSectionsInPhotoBrowser:self];
        } else if (_fixedPhotosArray) {
            _sectionCount = _fixedPhotosArray.count;
        }
    }
    if (_sectionCount == NSNotFound) _sectionCount = 0;
    return _sectionCount;
}

- (NSUInteger)numberOfPhotosInSection:(NSUInteger)section {
    NSUInteger _photoCount = 0;
    NSUInteger sectionCount = [self numberOfSections];
    if (sectionCount == 0) {
        section = 0;
    } else {
        if (section > sectionCount) section = sectionCount - 1;
    }
    
    if ([_delegate respondsToSelector:@selector(photoBrowser:numberOfPagesInSection:)]) {
        _photoCount = [_delegate photoBrowser:self numberOfPagesInSection:section];
    } else if (_fixedPhotosArray && section < _fixedPhotosArray.count) {
        id photosArray = [_fixedPhotosArray objectAtIndex:section];
        if ([photosArray isKindOfClass:[NSArray class]]) _photoCount = [photosArray count];
    }
    
    return _photoCount;
}

- (AFPageScrollView *)pageScrollViewInSection:(NSUInteger)section {
    AFPageScrollView *pageScrollView = nil;
    for (AFPageScrollView *page in _visiblePages) {
        if (page.section == section) {
            pageScrollView = page;
        }
    }
    return pageScrollView;
}

- (id<AFPhoto>)photoAtIndex:(NSUInteger)index inSection:(NSUInteger)section {
    id <AFPhoto> photo = nil;
    if (section < _photos.count) {
        NSArray *photos = [_photos objectAtIndex:section];
        if (index < photos.count) {
            if ([photos objectAtIndex:index] == [NSNull null]) {
                if ([_delegate respondsToSelector:@selector(photoBrowser:photoAtIndex:section:)]) {
                    photo = [_delegate photoBrowser:self photoAtIndex:index section:section];
                } else if (_fixedPhotosArray && section < _fixedPhotosArray.count && index < [[_fixedPhotosArray objectAtIndex:section] count]) {
                    photo = [[_fixedPhotosArray objectAtIndex:section] objectAtIndex:index];
                }
                if (photo) {
                    NSMutableArray *sectionPhotos = [_photos objectAtIndex:section];
                    [sectionPhotos replaceObjectAtIndex:index withObject:photo];
                    [_photos replaceObjectAtIndex:section withObject:sectionPhotos];
                }
            } else {
                photo = [photos objectAtIndex:index];
            }
        }
    }
    
    return photo;
}

- (id<AFPhoto>)thumbPhotoAtIndex:(NSUInteger)index inSection:(NSUInteger)section {
    id <AFPhoto> photo = nil;
    
    if (section < _thumbPhotos.count) {
        NSArray *photos = [_thumbPhotos objectAtIndex:section];
        if (index < photos.count) {
            if ([photos objectAtIndex:index] == [NSNull null]) {
                if ([_delegate respondsToSelector:@selector(photoBrowser:thumbPhotoAtIndex:section:)]) {
                    photo = [_delegate photoBrowser:self thumbPhotoAtIndex:index section:section];
                }
                if (photo) {
                    NSMutableArray *sectionPhotos = [_thumbPhotos objectAtIndex:section];
                    [sectionPhotos replaceObjectAtIndex:index withObject:photo];
                    [_thumbPhotos replaceObjectAtIndex:section withObject:sectionPhotos];
                }
            } else {
                photo = [photos objectAtIndex:index];
            }
        }
    }
    
    return photo;
}

#pragma mark - Page ScrollView Delegate

- (NSUInteger)numberOfPhotosInPageScrollView:(AFPageScrollView *)scrollView {
    return [self numberOfPhotosInSection:scrollView.section];
}

- (id <AFPhoto>)scrollView:(AFPageScrollView *)scrollView photoAtIndex:(NSUInteger)index {
    return [self photoAtIndex:index inSection:scrollView.section];
}

- (id <AFPhoto>)scrollView:(AFPageScrollView *)scrollView thumbPhotoAtIndex:(NSUInteger)index {
    return [self thumbPhotoAtIndex:index inSection:scrollView.section];
}

- (NSString *)scrollView:(AFPageScrollView *)scrollView titleForPhotoAtIndex:(NSUInteger)index {
    NSString *title = nil;
    if ([_delegate respondsToSelector:@selector(photoBrowser:titleForPhotoAtIndex:section:)]) {
        title = [_delegate photoBrowser:self titleForPhotoAtIndex:index section:scrollView.section];
    }
    return title;
}

- (void)scrollView:(AFPageScrollView *)scrollView didDisplayPhotoAtIndex:(NSUInteger)index {
    if (index != _currentPhotoIndex) {
        if ([_delegate respondsToSelector:@selector(photoBrowser:didDisplayPhotoAtIndex:section:)]) {
            [_delegate photoBrowser:self didDisplayPhotoAtIndex:index section:scrollView.section];
        }
    }
    _currentPhotoIndex = index;
}

- (void)scrollView:(AFPageScrollView *)scrollView singleTapAtIndex:(NSUInteger)index {
    if ([_delegate respondsToSelector:@selector(photoBrowser:singleTapAtIndex:section:)]) {
        [_delegate photoBrowser:self singleTapAtIndex:index section:scrollView.section];
    }
}

- (void)scrollView:(AFPageScrollView *)scrollView doubleTapAtIndex:(NSUInteger)index {
    if ([_delegate respondsToSelector:@selector(photoBrowser:doubleTapAtIndex:section:)]) {
        [_delegate photoBrowser:self doubleTapAtIndex:index section:scrollView.section];
    }
}

#pragma mark - Frame Calculations

- (CGRect)frameForPagingScrollView {
    CGRect frame = self.view.bounds;// [[UIScreen mainScreen] bounds];
    frame.origin.x -= PADDING;
    frame.size.width += (2 * PADDING);
    return CGRectIntegral(frame);
}

- (CGSize)contentSizeForPagingScrollView {
    CGRect bounds = _pagingScrollView.bounds;
    return CGSizeMake(bounds.size.width * [self numberOfSections], bounds.size.height);
}

- (CGRect)frameForPagingIndicator {
    CGFloat offset = 35;
    CGFloat maxWidth = 70;
    CGRect bounds = _pagingScrollView.bounds;
    CGFloat originY;
    
    if (@available(iOS 11.0, *)) {
        originY = bounds.size.height - [UIApplication sharedApplication].keyWindow.safeAreaInsets.bottom - offset;
    } else {
        originY = bounds.size.height - offset;
        // Fallback on earlier versions
    }
    
    return CGRectMake(CGRectGetMidX(_pagingScrollView.frame) - maxWidth/2, originY, maxWidth, 25);
}

- (CGPoint)contentOffsetForPageAtSection:(NSUInteger)section {
    CGFloat sectionWidth = _pagingScrollView.bounds.size.width;
    CGFloat newOffset = sectionWidth * section;
    return CGPointMake(newOffset, 0);
}

- (CGRect)frameForPageAtSection:(NSUInteger)section {
    CGRect bounds = _pagingScrollView.bounds;
    CGRect pageFrame = bounds;
    pageFrame.size.width -= (2 * PADDING);
    pageFrame.origin.x = (bounds.size.width * section) + PADDING;
    return CGRectIntegral(pageFrame);
}

#pragma mark - UIScrollView Delegata

- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView {
    [self setControlsHidden:YES animated:YES];
}

- (void)scrollViewDidScroll:(UIScrollView *)scrollView {
    if (!_viewIsActive || _performingLayout || _rotating) return;
    
    // Tile pages
    [self tilePages];
    
    // Calculate current page
    CGRect visibleBounds = _pagingScrollView.bounds;
    NSInteger index = (NSInteger)(floorf(CGRectGetMidX(visibleBounds) / CGRectGetWidth(visibleBounds)));
    if (index < 0) index = 0;
    if (index > [self numberOfSections] - 1) index = [self numberOfSections] - 1;
    NSUInteger previousCurrentSection = _currentSectionIndex;
    _currentSectionIndex = index;
    if (_currentSectionIndex != previousCurrentSection) {
        [self didStartViewingSectionAtIndex:index];
    }
}

- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView {
    [self updateNavigation];
    
    if ([_delegate respondsToSelector:@selector(photoBrowser:didEndDisplaySectionAtIndex:)]) {
        [_delegate photoBrowser:self didEndDisplaySectionAtIndex:_currentSectionIndex];
    }
}

#pragma mark - Navigation

- (void)updateNavigation {
    if ([_delegate respondsToSelector:@selector(photoBrowser:titleForPhotoAtIndex:section:)]) {
        self.title = [_delegate photoBrowser:self titleForPhotoAtIndex:_currentPhotoIndex section:_currentSectionIndex];
    }
}

- (void)jumpToPageAtIndex:(NSUInteger)index inSection:(NSUInteger)section animated:(BOOL)animated {
    if (section >= [self numberOfSections] || index >= [self numberOfPhotosInSection:section]) return;
    
    CGPoint contentOffset = [self contentOffsetForPageAtSection:section];
    [_pagingScrollView setContentOffset:contentOffset animated:animated];
    
    AFPageScrollView *page = [self pageScrollViewInSection:section];
    [page setCurrentPhotoIndex:index];
    
    [self didStartViewingSectionAtIndex:section];
    [self hideControlsAfterDelay];
}

#pragma mark - Control Hiding / Showing

- (void)setControlsHidden:(BOOL)hidden animated:(BOOL)animated {
    if (![self numberOfSections] || _alwaysShowControls) {
        hidden = NO;
    }
    
    [self cancelControlHiding];
    
    if (hidden && !_displayNavigationBar) {
        return;
    }
    
    CGFloat animationDuration = (animated ? 0.35 : 0);
    
    if (!_isVCBasedStatusBarAppearance) {
        _statusBarShouldBeHidden = hidden;
        [UIView animateWithDuration:animationDuration animations:^{
            [self setNeedsStatusBarAppearanceUpdate];
        }];
    }
    
    [UIView animateWithDuration:animationDuration animations:^{
        CGFloat alpha = hidden ? 0 : 1;
        [self.navigationController.navigationBar setAlpha:alpha];
    }];
}

- (void)startViewWithCarousel {
    _currentSectionIndex += 1;
    _currentPhotoIndex = 0;
    
    if (_currentSectionIndex >= [self numberOfSections]) {
        _currentSectionIndex = 0;
    }
    
    if ([self isViewLoaded]) {
        [self jumpToPageAtIndex:_currentPhotoIndex inSection:_currentSectionIndex animated:YES];
        if (!_viewIsActive) {
            [self tilePages]; // Force tiling if view is not visible
        }
    }
}

- (void)cancelCarousel {
    if (_carouselTimer) {
        [_carouselTimer invalidate];
        _carouselTimer = nil;
    }
}

- (void)cancelControlHiding {
    if (_controlVisibilityTimer) {
        [_controlVisibilityTimer invalidate];
        _controlVisibilityTimer = nil;
    }
}

// Enable/disable control visiblity timer
- (void)hideControlsAfterDelay {
    [self cancelControlHiding];
    _controlVisibilityTimer = [NSTimer scheduledTimerWithTimeInterval:self.delayToHideElements target:self selector:@selector(hideControls) userInfo:nil repeats:NO];
}

- (void)startCarousel {
    [self cancelCarousel];
    _carouselTimer = [NSTimer scheduledTimerWithTimeInterval:self.carouselInterval target:self selector:@selector(startViewWithCarousel) userInfo:nil repeats:YES];
}

- (void)hideControls { [self setControlsHidden:YES animated:YES]; }
- (void)showControls { [self setControlsHidden:NO animated:YES]; }

#pragma mark - Properties

- (void)setCurrentPhotoIndex:(NSUInteger)index section:(NSUInteger)section {
    NSUInteger sectionCount = [self numberOfSections];
    if (sectionCount == 0) {
        section = 0;
    } else {
        if (section > sectionCount) section = sectionCount - 1;
    }
    _currentSectionIndex = section;
    
    NSUInteger photoCountInCurrentSection = [self numberOfPhotosInSection:section];
    if (photoCountInCurrentSection == 0) {
        _currentPhotoIndex = 0;
    } else {
        if (index > photoCountInCurrentSection) index = photoCountInCurrentSection - 1;
    }
    _currentPhotoIndex = index;
    
    if ([self isViewLoaded]) {
        [self jumpToPageAtIndex:_currentPhotoIndex inSection:_currentSectionIndex animated:NO];
        if (!_viewIsActive) {
            [self tilePages]; // Force tiling if view is not visible
        }
    }
}

@end
