#import "CompanyConfigurationManager.h"

@implementation CompanyConfigurationManager

RCT_EXPORT_MODULE();

- (NSDictionary<NSString *,id> *)constantsToExport {
  return @{
           @"CompanyAppConfig" : @{
               @"env" : @"production",
               @"CompanyID" : @"00000000-0000-0000-0000-000000000000",
               @"baseURL" : @"http://app-svc.lixiantuce.com",
               @"uploadUrl" : @"http://img2.lixiantuce.com",
               @"imageBaseUrl" : @"http://img2.lixiantuce.com",
               @"appUpdateUrl" : @"http://www.lixiantuce.com/Company/Index/",
               @"BaiduPushAPIKey" : @{
                   @"android": @"notset",
                   @"ios": @"0ckurEW8gbi9NVkmQP4u0MGz"
               },
               @"AppColor" : @{
                   @"SecondaryFront" : @"#f5fbff",
                   @"PopupBackground" : @"#2a2c3b",
                   @"Secondary" : @"#6f7ead",
                   @"DescriptionFront" : @"#a7aed1",
                   @"ButtonBg" : @"#edf6ff",
                   @"Main" : @"#ffffff",
                   @"ContentFront" : @"#edf6ff",
                   @"ButtonFront" : @"#014dc1"
               },
               @"AppStyle" : @"C"
        }
    };
}

@end
