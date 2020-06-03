#import <Foundation/Foundation.h>

@interface Item : NSObject

@property (copy) NSString *id;
@property (copy) NSString *label;
@property () NSArray *images;

+ (instancetype)itemFromJson:(NSDictionary *)json;
- (instancetype)initWithJson:(NSDictionary *)json;

@end

@interface Product : NSObject

@property (copy) NSString *id;
@property () NSArray *items;

+ (instancetype)productFromJson:(NSDictionary *)json;
- (instancetype)initWithJson:(NSDictionary *)json;

@end

@interface PhotoTransfer : NSObject

+ (NSArray *)convertOriginJsonToPhotos:(NSArray *)jsons;

@end
