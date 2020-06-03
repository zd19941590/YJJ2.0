//
//  NthCPrinterListHelper.h
//  NthCBluetoothDemo
//
//  Created by 张锋 on 26/02/2018.
//  Copyright © 2018 张锋. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "UartLib.h"

typedef void (^PrinterDidFinishWorkdBlock) (void);

@interface PrinterListHelper : NSObject

- (instancetype)initWithUartLib:(UartLib *)uartLib peripheral:(CBPeripheral *)peripheral;

- (void)printerShouldPrintText:(NSString *)text completionHandler:(PrinterDidFinishWorkdBlock)completionHandler;

- (void)printerShouldPrintQRCode:(NSData *)data completionHandler:(PrinterDidFinishWorkdBlock)completionHandler;

- (void)printerShouldPrintQRCodeStyle_1CompletionHandler:(PrinterDidFinishWorkdBlock)completionHandler;

- (void)printerShouldPrintQRCodeStyle_2CompletionHandler:(PrinterDidFinishWorkdBlock)completionHandler;

- (void)printerShouldPrintLongData:(NSData *)data completionHandler:(PrinterDidFinishWorkdBlock)completionHandler;

- (void)printerShouldPrintBarCodeCompletionHandler:(PrinterDidFinishWorkdBlock)completionHandler;

- (void)printerShouldPrintWithFormat:(NSString *)formatStr completionHandler:(PrinterDidFinishWorkdBlock)completionHandler;

@end
