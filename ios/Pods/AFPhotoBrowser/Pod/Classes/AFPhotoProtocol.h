#import <Foundation/Foundation.h>

// Notifications

#define AFPHOTOBROWSER_WILL_TRANSITION_TO_TRAINT_COLLECTION @"AFPHOTOBROWSER_WILL_TRANSITION_TO_TRAINT_COLLECTION"
#define AFPHOTOBROWSER_DID_TRANSITION_TO_TRAINT_COLLECTION @"AFPHOTOBROWSER_DID_TRANSITION_TO_TRAINT_COLLECTION"

#define AFPHOTO_LOADING_DID_END_NOTIFICATION @"AFPHOTO_LOADING_DID_END_NOTIFICATION"
#define AFPHOTO_PROGRESS_NOTIFICATION @"AFPHOTO_PROGRESS_NOTIFICATION"

@protocol AFPhoto <NSObject>

@required

// Return underlying UIImage to be displayed
// Return nil if the image is not immediately available (loaded into memory, preferably
// already decompressed) and needs to be loaded from a source (cache, file, web, etc)
// IMPORTANT: You should *NOT* use this method to initiate
// fetching of images from any external of source. That should be handled
// in -loadUnderlyingImageAndNotify: which may be called by the photo browser if this
// methods returns nil.
@property (nonatomic, strong) UIImage *underlyingImage;

// Called when the browser has determined the underlying images is not
// already loaded into memory but needs it.
- (void)loadUnderlyingImageAndNotify;

// Fetch the image data from a source and notify when complete.
// You must load the image asyncronously (and decompress it for better performance).
// It is recommended that you use SDWebImageDecoder to perform the decompression.
// See MWPhoto object for an example implementation.
// When the underlying UIImage is loaded (or failed to load) you should post the following
// notification:
// [[NSNotificationCenter defaultCenter] postNotificationName:MWPHOTO_LOADING_DID_END_NOTIFICATION
//                                                     object:self];
- (void)performLoadUnderlyingImageAndNotify;

// This is called when the photo browser has determined the photo data
// is no longer needed or there are low memory conditions
// You should release any underlying (possibly large and decompressed) image data
// as long as the image can be re-loaded (from cache, file, or URL)
- (void)unloadUnderlyingImage;

@optional

// If photo is empty, in which case, don't show loading error icons
@property (nonatomic) BOOL emptyImage;

// Video
@property (nonatomic) BOOL isVideo;
- (void)getVideoURL:(void (^)(NSURL *url))completion;

// Return a caption string to be displayed over the image
// Return nil to display no caption
- (NSString *)caption;

// Cancel any background loading of image data
- (void)cancelAnyLoading;

@end
