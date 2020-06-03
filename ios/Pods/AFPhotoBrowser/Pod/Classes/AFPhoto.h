#import <Foundation/Foundation.h>
#import <Photos/Photos.h>
#import "AFPhotoProtocol.h"

@interface AFPhoto : NSObject <AFPhoto>

@property (nonatomic, strong) NSString *caption;
@property (nonatomic, strong) NSURL *videoURL;
@property (nonatomic, strong) NSURL *photoURL;
@property (nonatomic) BOOL emptyImage;
@property (nonatomic) BOOL isVideo;

+ (AFPhoto *)photoWithImage:(UIImage *)image;
+ (AFPhoto *)photoWithURL:(NSURL *)url;
+ (AFPhoto *)photoWithAsset:(PHAsset *)asset targetSize:(CGSize)targetSize;
+ (AFPhoto *)videoWithURL:(NSURL *)url; // Initialise video with no poster image

- (id)init;
- (id)initWithImage:(UIImage *)image;
- (id)initWithURL:(NSURL *)url;
- (id)initWithAsset:(PHAsset *)asset targetSize:(CGSize)targetSize;
- (id)initWithVideoURL:(NSURL *)url;

@end
