#import <React/RCTRootView.h>
#import "RCTiCloudHelper.h"

@implementation RCTiCloudHelper

RCT_EXPORT_MODULE();

- (BOOL)addSkipBackupAttributeToItemAtPath:(NSString *)path {
    if (!path) {
        return NO;
    }
    if ([path hasPrefix:@"http:"] || [path hasPrefix:@"https:"]) {
        return NO;
    }
    
    NSString *realPath;
    if ([path hasPrefix:@"file:"]) {
        realPath = [[path componentsSeparatedByString:@"file://"] lastObject];
    }
    
    if (![[NSFileManager defaultManager] fileExistsAtPath:realPath]) {
        return NO;
    }
    
    NSURL *URL= [NSURL fileURLWithPath:realPath];
    NSError *error = nil;
    BOOL success = [URL setResourceValue:[NSNumber numberWithBool: YES]
                                  forKey:NSURLIsExcludedFromBackupKey
                                   error:&error];
    if(!success){
        NSLog(@"Error excluding %@ from backup %@", [URL lastPathComponent], error);
    }
    
    return success;
}

RCT_EXPORT_METHOD(voidBackup:(NSString *)path){
    [self addSkipBackupAttributeToItemAtPath:path];
}

@end
