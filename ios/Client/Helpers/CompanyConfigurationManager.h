#if __has_include(<React/RCTBridgeModule.h>)
  #import <React/RCTBridgeModule.h>
  #import <React/RCTLog.h>
#else
  #import "RCTBridgeModule.h"
  #import "RCTLog.h"
#endif

@interface CompanyConfigurationManager : NSObject <RCTBridgeModule>

- (NSDictionary<NSString *,id> *)constantsToExport;

@end
