//
//  PrinterListFooterView.h
//  YJJApp
//
//  Created by bluestone on 2018/4/24.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>

@class PrinterListFooterView;

@protocol PrinterListFooterViewProtocol <NSObject>

- (void)footerView:(PrinterListFooterView *)view didPressSettingButton:(UIButton *)sender;
- (void)footerView:(PrinterListFooterView *)view didPressPrintButton:(UIButton *)sender;

@end

@interface PrinterListFooterView : UIView

@property (nonatomic, weak) id <PrinterListFooterViewProtocol> delegate;

- (void)setSettingButtonVisible:(BOOL)visible;

@end
