#import "AFPageIndicator.h"

@implementation AFPageIndicator {
    UILabel *_pageLabel;
}

- (instancetype)initWithFrame:(CGRect)frame {
    if (self == [super initWithFrame:frame]) {
        
        _pageLabel = [[UILabel alloc] initWithFrame:self.bounds];
        _pageLabel.textColor = [UIColor whiteColor];
        _pageLabel.textAlignment = NSTextAlignmentCenter;
        _pageLabel.font = [UIFont systemFontOfSize:15 weight:UIFontWeightMedium];
        [self addSubview:_pageLabel];
        
    }
    return self;
}

- (void)setCurrentPage:(NSUInteger)currentPage {
    _currentPage = currentPage;
    
    _pageLabel.text = [NSString stringWithFormat:@"%zd/%zd", _currentPage+1, _numberOfPages];
}

@end
