//
//  NthCPrinterListHelper.m
//  NthCBluetoothDemo
//
//  Created by 张锋 on 26/02/2018.
//  Copyright © 2018 张锋. All rights reserved.
//

#import "PrinterListHelper.h"

#define MAX_CHARACTERISTIC_VALUE_SIZE 20

@interface PrinterListHelper ()

@property (nonatomic, strong) NSMutableArray *sendDataArray;

@property (nonatomic, strong) UartLib *uartLib;
@property (nonatomic, strong) CBPeripheral *peripheral;

@end

@implementation PrinterListHelper

- (instancetype)initWithUartLib:(UartLib *)uartLib peripheral:(CBPeripheral *)peripheral {
    self = [super init];
    if (self) {
        _uartLib = uartLib;
        _peripheral = peripheral;
        
        [NSTimer scheduledTimerWithTimeInterval:(float)0.02 target:self selector:@selector(sendDataTimer:) userInfo:nil repeats:YES];
    }
    
    return self;
}

- (void) sendDataTimer:(NSTimer *)timer {
    if ([self.sendDataArray count] > 0) {
        NSData* cmdData;
        cmdData = [self.sendDataArray objectAtIndex:0];
        [self.uartLib sendValue:self.peripheral sendData:cmdData type:CBCharacteristicWriteWithResponse];
        [self.sendDataArray removeObjectAtIndex:0];
    }
    
}

- (void)printerShouldPrintText:(NSString *)text completionHandler:(PrinterDidFinishWorkdBlock)completionHandler {
    if (text == nil || text.length == 0) {
        NSLog(@"🔴 Print string might be nil.");
        return;
    }
    
    NSString *formatStr = [text stringByAppendingFormat:@"%c%c%c", '\n', '\n', '\n'];
    [self printerShouldPrintWithFormat:formatStr completionHandler:completionHandler];
}

- (void)printerShouldPrintQRCode:(NSData *)data completionHandler:(PrinterDidFinishWorkdBlock)completionHandler {
    Byte caPrintCmd[50];
    
    //设置二维码到宽度
    caPrintCmd[0] = 0x1d;
    caPrintCmd[1] = 0x77;
    caPrintCmd[2] = 5;
    NSData *cmdData =[[NSData alloc] initWithBytes:caPrintCmd length:3];
    NSLog(@"✅ QR width:%@", cmdData);
    
    [self.uartLib sendValue:self.peripheral sendData:cmdData type:CBCharacteristicWriteWithResponse];
    
    caPrintCmd[0] = 0x1d;
    caPrintCmd[1] = 0x6b;
    caPrintCmd[2] = 97;
    caPrintCmd[3] = 0x00;
    caPrintCmd[4] = 0x02;
    caPrintCmd[5] = 0x05;
    caPrintCmd[6] = 0x00;
    caPrintCmd[7] = 0x31;
    caPrintCmd[8] = 0x32;
    caPrintCmd[9] = 0x33;
    caPrintCmd[10] = 0x34;
    caPrintCmd[11] = 0x35;
    caPrintCmd[12] = '\n';
    caPrintCmd[13] = '\n';
    caPrintCmd[14] = '\n';
    
    cmdData =[[NSData alloc] initWithBytes:caPrintCmd length:15];
    NSLog(@"✅ QR data:%@", cmdData);
    
    [self.uartLib sendValue:self.peripheral sendData:cmdData type:CBCharacteristicWriteWithResponse];
    
    !completionHandler ?: completionHandler();
}

- (void)printerShouldPrintQRCodeStyle_1CompletionHandler:(PrinterDidFinishWorkdBlock)completionHandler {
    Byte caPrintCmd[50];
    
    //设置二维码到宽度
    caPrintCmd[0] = 0x1a;
    caPrintCmd[1] = 0x5b;
    caPrintCmd[2] = 0x01;
    caPrintCmd[3] = 0x00;
    caPrintCmd[4] = 0x00;
    caPrintCmd[5] = 0x00;
    caPrintCmd[6] = 0x00;
    caPrintCmd[7] = 0x80;
    caPrintCmd[8] = 0x01;
    caPrintCmd[9] = 0x00;
    caPrintCmd[10] = 0x03;
    caPrintCmd[11] = 0x00;
    NSData *cmdData =[[NSData alloc] initWithBytes:caPrintCmd length:12];
    NSLog(@"QR width:%@", cmdData);
    
    [self.uartLib sendValue:self.peripheral sendData:cmdData type:CBCharacteristicWriteWithResponse];
    
    caPrintCmd[0] = 0x1a;
    caPrintCmd[1] = 0x31;
    caPrintCmd[2] = 0x00;
    caPrintCmd[3] = 0x08;
    caPrintCmd[4] = 0x04;
    caPrintCmd[5] = 0x00;
    caPrintCmd[6] = 0x00;
    caPrintCmd[7] = 0x00;
    caPrintCmd[8] = 0x00;
    caPrintCmd[9] = 0x04;
    caPrintCmd[10] = 0x00;
    caPrintCmd[11] = 0x30;
    caPrintCmd[12] = 0x31;
    caPrintCmd[13] = 0x32;
    caPrintCmd[14] = 0x00;
    cmdData =[[NSData alloc] initWithBytes:caPrintCmd length:15];
    NSLog(@"QR data:%@", cmdData);
    
    [self.uartLib sendValue:self.peripheral sendData:cmdData type:CBCharacteristicWriteWithResponse];
    
    caPrintCmd[0] = 0x1a;
    caPrintCmd[1] = 0x5d;
    caPrintCmd[2] = 0x00;
    caPrintCmd[3] = 0x1a;
    caPrintCmd[4] = 0x4f;
    caPrintCmd[5] = 0x00;
    cmdData =[[NSData alloc] initWithBytes:caPrintCmd length:6];
    NSLog(@"QR data:%@", cmdData);
    
    [self.uartLib sendValue:self.peripheral sendData:cmdData type:CBCharacteristicWriteWithResponse];
    
    !completionHandler ?: completionHandler();
}

- (void)printerShouldPrintQRCodeStyle_2CompletionHandler:(PrinterDidFinishWorkdBlock)completionHandler {
    [self printerShouldPrintTwoDimenCode:@"12345678" completionHandler:completionHandler];
}

- (void)printerShouldPrintTwoDimenCode:(NSString *)text completionHandler:(PrinterDidFinishWorkdBlock)completionHandler {
    NSData *formatData;
    Byte caPrintFmt[500];
    
    caPrintFmt[0] = 0x1b;
    caPrintFmt[1] = 0x40;
    caPrintFmt[2] = 0x1d;
    caPrintFmt[3] = 0x28;
    caPrintFmt[4] = 0x6b;
    caPrintFmt[5] = 0x03;
    caPrintFmt[6] = 0x00;
    caPrintFmt[7] = 0x31;
    caPrintFmt[8] = 0x43;
    caPrintFmt[9] = 0x08;
    caPrintFmt[10] = 0x1d;
    caPrintFmt[11] = 0x28;
    caPrintFmt[12] = 0x6b;
    caPrintFmt[13] = 0x03;
    caPrintFmt[14] = 0x00;
    caPrintFmt[15] = 0x31;
    caPrintFmt[16] = 0x45;
    caPrintFmt[17] = 0x30;
    
    formatData = [NSData dataWithBytes:caPrintFmt length:18];
    NSLog(@"✅ format:%@", formatData);
    
    [self.sendDataArray addObject:formatData];
    
    NSInteger nLength = [text length];
    nLength += 3;
    
    caPrintFmt[0] = 0x1d;
    caPrintFmt[1] = 0x28;
    caPrintFmt[2] = 0x6b;
    caPrintFmt[3] = nLength & 0xFF;
    caPrintFmt[4] = (nLength >> 8) & 0xFF;
    caPrintFmt[5] = 0x31;
    caPrintFmt[6] = 0x50;
    caPrintFmt[7] = 0x30;
    
    NSData *printData = [text dataUsingEncoding: NSASCIIStringEncoding];
    Byte *printByte = (Byte *)[printData bytes];
    
    nLength -= 3;
    for (int  i = 0; i<nLength; i++) {
        caPrintFmt[8+i] = *(printByte+i);
    }
    
    formatData = [NSData dataWithBytes:caPrintFmt length:nLength+8];
    
    NSLog(@"✅ format:%@", formatData);
    
    [self printerShouldPrintLongData:formatData completionHandler:nil];
    
    caPrintFmt[0] = 0x1b;
    caPrintFmt[1] = 0x61;
    caPrintFmt[2] = 0x01;
    caPrintFmt[3] = 0x1d;
    caPrintFmt[4] = 0x28;
    caPrintFmt[5] = 0x6b;
    caPrintFmt[6] = 0x03;
    caPrintFmt[7] = 0x00;
    caPrintFmt[8] = 0x31;
    caPrintFmt[9] = 0x52;
    caPrintFmt[10] = 0x30;
    caPrintFmt[11] = 0x1d;
    caPrintFmt[12] = 0x28;
    caPrintFmt[13] = 0x6b;
    caPrintFmt[14] = 0x03;
    caPrintFmt[15] = 0x00;
    caPrintFmt[16] = 0x31;
    caPrintFmt[17] = 0x51;
    caPrintFmt[18] = 0x30;
    
    formatData = [NSData dataWithBytes:caPrintFmt length:19];
    NSLog(@"✅ format:%@", formatData);
    
    [self.sendDataArray addObject:formatData];
    
    caPrintFmt[0] = 0x1b;
    caPrintFmt[1] = 0x40;
    
    formatData = [NSData dataWithBytes:caPrintFmt length:2];
    NSLog(@"✅ format:%@", formatData);
    
    [self.sendDataArray addObject:formatData];
    
    !completionHandler ?: completionHandler();
}

- (void)printerShouldPrintLongData:(NSData *)data completionHandler:(PrinterDidFinishWorkdBlock)completionHandler {
    NSUInteger i;
    NSUInteger strLength;
    NSUInteger cellCount;
    NSUInteger cellMin;
    NSUInteger cellLen;
    
    strLength = [data length];
    if (strLength < 1) {
        return;
    }
    
    cellCount = (strLength%MAX_CHARACTERISTIC_VALUE_SIZE)?(strLength/MAX_CHARACTERISTIC_VALUE_SIZE + 1):(strLength/MAX_CHARACTERISTIC_VALUE_SIZE);
    for (i=0; i<cellCount; i++) {
        cellMin = i*MAX_CHARACTERISTIC_VALUE_SIZE;
        if (cellMin + MAX_CHARACTERISTIC_VALUE_SIZE > strLength) {
            cellLen = strLength-cellMin;
        }
        else {
            cellLen = MAX_CHARACTERISTIC_VALUE_SIZE;
        }
        
        NSLog(@"print:%lu,%lu,%lu,%lu", (unsigned long)strLength,(unsigned long)cellCount, (unsigned long)cellMin, (unsigned long)cellLen);
        NSRange rang = NSMakeRange(cellMin, cellLen);
        NSData *subData = [data subdataWithRange:rang];
        
        NSLog(@"print:%@", subData);
        //data = [strRang dataUsingEncoding: NSUTF8StringEncoding];
        //NSLog(@"print:%@", data);
        
        [self.sendDataArray addObject:subData];
    }
    
    !completionHandler ?: completionHandler();
}

- (void)printerShouldPrintBarCodeCompletionHandler:(PrinterDidFinishWorkdBlock)completionHandler {
    Byte caPrintCmd[50];
    
    //设置绝对打印位置
    caPrintCmd[0] = 0x1b;
    caPrintCmd[1] = 0x24;
    caPrintCmd[2] = 10;
    caPrintCmd[3] = 0x00;
    
    //设置条码宽度
    caPrintCmd[4] = 0x1d;
    caPrintCmd[5] = 0x77;
    caPrintCmd[6] = 0x5; //2<=n<=6
    
    //设置条码高度
    caPrintCmd[7] = 0x1d;
    caPrintCmd[8] = 0x68;
    caPrintCmd[9] = 0xa2;//1<=n<=255
    
    //选择HRI字符字形
    caPrintCmd[10] = 0x1d;
    caPrintCmd[11] = 0x66;
    caPrintCmd[12] = 0x00;
    
    //选择HRI字符的打印位置
    caPrintCmd[13] = 0x1d;
    caPrintCmd[14] = 0x48;
    caPrintCmd[15] = 0x00;
    
    //打印条形码
    caPrintCmd[16] = 0x1d;
    caPrintCmd[17] = 0x6b;
    caPrintCmd[18] = 0x41;
    caPrintCmd[19] = 0x0c;
    caPrintCmd[20] = 0x30;
    caPrintCmd[21] = 0x31;
    caPrintCmd[22] = 0x32;
    caPrintCmd[23] = 0x33;
    caPrintCmd[24] = 0x34;
    caPrintCmd[25] = 0x35;
    caPrintCmd[26] = 0x36;
    caPrintCmd[27] = 0x37;
    caPrintCmd[28] = 0x38;
    caPrintCmd[29] = 0x39;
    caPrintCmd[30] = 0x30;
    caPrintCmd[31] = 0x31;
    caPrintCmd[32] = '\n';
    caPrintCmd[33] = '\n';
    caPrintCmd[34] = '\n';
    
    NSData *cmdData =[[NSData alloc] initWithBytes:caPrintCmd length:35];
    NSLog(@"✅ Bar code:%@", cmdData);
    
    [self.uartLib sendValue:self.peripheral sendData:cmdData type:CBCharacteristicWriteWithResponse];
    
    !completionHandler ?: completionHandler();
}

- (UIImage *)png2GrayscaleImage:(UIImage *)oriImage {
    //const int ALPHA = 0;
    const int RED = 1;
    const int GREEN = 2;
    const int BLUE = 3;
    
    int width = oriImage.size.width;//imageRect.size.width;
    int height =oriImage.size.height;
    int imgSize = width * height;
    int x_origin = 0;
    int y_to = height;
    
    // the pixels will be painted to this array
    uint32_t *pixels = (uint32_t *) malloc(imgSize * sizeof(uint32_t));
    
    // clear the pixels so any transparency is preserved
    memset(pixels, 0, imgSize * sizeof(uint32_t));
    
    NSInteger nWidthByteSize = (width+7)/8;
    
    NSInteger nBinaryImgDataSize = nWidthByteSize * y_to;
    Byte *binaryImgData = (Byte *)malloc(nBinaryImgDataSize);
    
    memset(binaryImgData, 0, nBinaryImgDataSize);
    
    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
    
    // create a context with RGBA pixels
    CGContextRef context = CGBitmapContextCreate(pixels, width, height, 8, width * sizeof(uint32_t), colorSpace,kCGBitmapByteOrder32Little | kCGImageAlphaPremultipliedLast);
    
    // paint the bitmap to our context which will fill in the pixels array
    CGContextDrawImage(context, CGRectMake(0, 0, width, height), [oriImage CGImage]);
    
    Byte controlData[8];
    
    controlData[0] = 0x1d;
    controlData[1] = 0x76;//'v';
    controlData[2] = 0x30;
    controlData[3] = 0;
    controlData[4] = nWidthByteSize & 0xff;
    controlData[5] = (nWidthByteSize>>8) & 0xff;
    controlData[6] = y_to & 0xff;
    controlData[7] = (y_to>>8) & 0xff;
    
    NSData *printData = [[NSData alloc] initWithBytes:controlData length:8];
    [self printerShouldPrintLongData:printData completionHandler:nil];
    
    for(int y = 0; y < y_to; y++) {
        for(int x = x_origin; x < width; x++) {
            uint8_t *rgbaPixel = (uint8_t *) &pixels[y * width + x];
            
            // convert to grayscale using recommended method: http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
            uint32_t gray = 0.3 * rgbaPixel[RED] + 0.59 * rgbaPixel[GREEN] + 0.11 * rgbaPixel[BLUE];
            
            if (gray > 228) {
                rgbaPixel[RED] = 255;
                rgbaPixel[GREEN] = 255;
                rgbaPixel[BLUE] = 255;
                
            } else {
                rgbaPixel[RED] = 0;
                rgbaPixel[GREEN] = 0;
                rgbaPixel[BLUE] = 0;
                binaryImgData[(y*width+x)/8] |= (0x80>>(x%8));
            }
        }
    }
    
    printData = [[NSData alloc] initWithBytes:binaryImgData length:nBinaryImgDataSize];
    [self printerShouldPrintLongData:printData completionHandler:nil];
    
    memset(controlData, '\n', 8);
    
    printData = [[NSData alloc] initWithBytes:controlData length:3];
    [self printerShouldPrintLongData:printData completionHandler:nil];
    
    return 0;
}

- (void)printerShouldPrintWithFormat:(NSString *)formatStr completionHandler:(PrinterDidFinishWorkdBlock)completionHandler {
    NSData *data = nil;
    NSUInteger i;
    NSUInteger strLength;
    NSUInteger cellCount;
    NSUInteger cellMin;
    NSUInteger cellLen;
    
    Byte caPrintFmt[5];
    
    caPrintFmt[0] = 0x1b;
    caPrintFmt[1] = 0x40;
    caPrintFmt[2] = 0x1b;
    caPrintFmt[3] = 0x21;
    caPrintFmt[4] = 0x00;
    
    NSData *cmdData =[[NSData alloc] initWithBytes:caPrintFmt length:5];
    
    [self.uartLib sendValue:self.peripheral sendData:cmdData type:CBCharacteristicWriteWithResponse];
    NSLog(@"✅ format:%@", cmdData);
    
    NSStringEncoding enc = CFStringConvertEncodingToNSStringEncoding(kCFStringEncodingGB_18030_2000);
    //NSData *data = [curPrintContent dataUsingEncoding:enc];
    //NSLog(@"dd:%@", data);
    //NSString *retStr = [[NSString alloc] initWithData:data encoding:enc];
    //NSLog(@"str:%@", retStr);
    
    strLength = [formatStr length];
    if (strLength < 1) {
        return;
    }
    
    cellCount = (strLength % MAX_CHARACTERISTIC_VALUE_SIZE) ? (strLength / MAX_CHARACTERISTIC_VALUE_SIZE + 1) : (strLength / MAX_CHARACTERISTIC_VALUE_SIZE);
    for (i=0; i<cellCount; i++) {
        cellMin = i * MAX_CHARACTERISTIC_VALUE_SIZE;
        if (cellMin + MAX_CHARACTERISTIC_VALUE_SIZE > strLength) {
            cellLen = strLength - cellMin;
        } else {
            cellLen = MAX_CHARACTERISTIC_VALUE_SIZE;
        }
        
        NSRange rang = NSMakeRange(cellMin, cellLen);
        NSString *strRang = [formatStr substringWithRange:rang];
        NSLog(@"✅ print:%@", strRang);
        
        data = [strRang dataUsingEncoding: enc];
        //data = [strRang dataUsingEncoding: NSUTF8StringEncoding];
        NSLog(@"✅ print:%@", data);
        
        [self.uartLib sendValue:self.peripheral sendData:data type:CBCharacteristicWriteWithResponse];
    }
    
    !completionHandler ?: completionHandler();
}

#pragma mark - Private Methods

Byte calculateXor(Byte *pcData, Byte ucDataLen){
    Byte ucXor = 0;
    Byte i;
    
    for (i=0; i<ucDataLen; i++) {
        ucXor ^= *(pcData+i);
    }
    
    return ucXor;
}

- (NSMutableArray *)sendDataArray {
    if (_sendDataArray == nil) {
        _sendDataArray = [[NSMutableArray alloc] init];
    }
    
    return _sendDataArray;
}

@end
