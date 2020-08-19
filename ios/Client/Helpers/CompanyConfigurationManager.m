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
                   @"SecondaryFront" : @"#ffffff",
                   @"PopupBackground" : @"#000000",
                   @"Secondary" : @"#6b0025",
                   @"DescriptionFront" : @"#A0A1A7",
                   @"ButtonBg" : @"#4d5270",
                   @"Main" : @"#ab021e",
                   @"ContentFront" : @"#d10202",
                   @"ButtonFront" : @"#FFFFFF"
               },
               @"AppStyle" : @"C"
        }
    };
}

@end
