#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>

#pragma mark - Base ViewController Life Time Block
///=============================================================================
/// @name Base ViewController Life Time Block
///=============================================================================

//Callback with Foundation type
typedef void (^NthCBooleanResultBlock)(BOOL succeeded, NSError *error);
typedef void (^NthCViewControllerBooleanResultBlock)(__kindof UIViewController *viewController, BOOL succeeded, NSError *error);

typedef void (^NthCIntegerResultBlock)(NSInteger number, NSError *error);
typedef void (^NthCStringResultBlock)(NSString *string, NSError *error);
typedef void (^NthCDictionaryResultBlock)(NSDictionary * dict, NSError *error);
typedef void (^NthCArrayResultBlock)(NSArray *objects, NSError *error);
typedef void (^NthCDataResultBlock)(NSData *data, NSError *error);
typedef void (^NthCIdResultBlock)(id object, NSError *error);
typedef void (^NthCIdBoolResultBlock)(BOOL succeeded, id object, NSError *error);

//Callback with Function object
typedef void (^NthCVoidBlock)(void);
typedef void (^NthCErrorBlock)(NSError *error);
typedef void (^NthCImageResultBlock)(UIImage * image, NSError *error);
typedef void (^NthCProgressBlock)(NSInteger percentDone);


#pragma mark - Enum : Type and operation
///=============================================================================
/// @name Enum : Type and operation
///=============================================================================




//#define NthCDefaultThemeColor [UIColor colorWithRed:0/255 green:140/255 blue:212/255 alpha:1]

#pragma mark - 自定义UI行为
///=============================================================================
/// @name 自定义UI行为
///=============================================================================

#ifdef DEBUG
    #define NthCLog(fmt, ...) NSLog((@"%s [Line %d] " fmt), __PRETTY_FUNCTION__, __LINE__, ## __VA_ARGS__);
#else
    #define NthCLog(...)
#endif

#define NthCKitDefaultThemeColor  [UIColor colorWithRed:0/255.0 green:118/255.0 blue:213/255.0 alpha:1.0]

/**
 `UITableView`以及`UICollectionView`分割线颜色
 */
#define NthCSeparatorColor [UIColor colorWithRed:0xE2/255.0f green:0xE2/255.0f blue:0xE2/255.0f alpha:1]

#define NthCGroundDefaultBackgroundColor [UIColor colorWithRed:235/255. green:235/255.f blue:241/255.f alpha:1.f]

static CGFloat const NthCAnimateDuration = .25f;

#define NthCMethodNotImplemented() \
                            @throw [NSException exceptionWithName:NSInternalInconsistencyException \
                                    reason:[NSString stringWithFormat:@"You must override %@ in a subclass.", NSStringFromSelector(_cmd)] \
                                    userInfo:nil]

#define NthC_CURRENT_TIMESTAMP ([[NSDate date] timeIntervalSince1970] * 1000)
#define NthC_FUTURE_TIMESTAMP ([[NSDate distantFuture] timeIntervalSince1970] * 1000)


#pragma mark - Notification Name
///=============================================================================
/// @name Notification Name
///=============================================================================




#pragma mark - Custom Identifier
///=============================================================================
/// @name Custom Identifier
///=============================================================================




