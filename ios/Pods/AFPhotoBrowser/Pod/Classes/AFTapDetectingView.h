#import <UIKit/UIKit.h>

@protocol AFTapDetectingViewDelegate;

@interface AFTapDetectingView : UIView {}

@property (nonatomic, weak) id <AFTapDetectingViewDelegate> tapDelegate;

@end

@protocol AFTapDetectingViewDelegate <NSObject>

@optional

- (void)view:(UIView *)view singleTapDetected:(UITouch *)touch;
- (void)view:(UIView *)view doubleTapDetected:(UITouch *)touch;
- (void)view:(UIView *)view tripleTapDetected:(UITouch *)touch;

@end
