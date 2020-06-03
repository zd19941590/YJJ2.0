#import <UIKit/UIKit.h>

@protocol AFTapDetectingImageViewDelegate;

@interface AFTapDetectingImageView : UIImageView

@property (nonatomic, weak) id <AFTapDetectingImageViewDelegate> tapDelegate;

@end

@protocol AFTapDetectingImageViewDelegate <NSObject>

@optional

- (void)imageView:(UIImageView *)imageView singleTapDetected:(UITouch *)touch;
- (void)imageView:(UIImageView *)imageView doubleTapDetected:(UITouch *)touch;
- (void)imageView:(UIImageView *)imageView tripleTapDetected:(UITouch *)touch;

@end
