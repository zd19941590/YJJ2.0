//
//  PrinterListFooterView.m
//  YJJApp
//
//  Created by bluestone on 2018/4/24.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "PrinterListFooterView.h"
#import <Masonry/Masonry.h>

@interface PrinterListFooterView ()

@property (nonatomic, strong) UIButton *settingButton;

@property (nonatomic, strong) UIButton *printButton;

@end

@implementation PrinterListFooterView

- (instancetype)initWithFrame:(CGRect)frame {
    self = [super initWithFrame:frame];
    if (self) {
        [self setup];
    }
  
    return self;
}

- (void)setup {
    CGFloat padding = 15.f;
  
    UIButton *settingButton = [UIButton buttonWithType:UIButtonTypeCustom];
    settingButton.layer.cornerRadius = 3;
    settingButton.layer.masksToBounds = YES;
    [settingButton setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
    [settingButton setBackgroundColor:[UIColor lightGrayColor]];
    [settingButton setTitle:@"没有搜索到蓝牙设备? 去设置" forState:UIControlStateNormal];
    [settingButton addTarget:self action:@selector(settingButtonPressed:) forControlEvents:UIControlEventTouchUpInside];
    [self addSubview:_settingButton = settingButton];
  
    [self.settingButton mas_makeConstraints:^(MASConstraintMaker *make) {
        make.top.equalTo(self).mas_offset(padding);
        make.left.equalTo(self).mas_offset(padding);
        make.right.equalTo(self).mas_offset(-padding);
        make.height.mas_equalTo(44);
    }];
  
    UIButton *printButton = [UIButton buttonWithType:UIButtonTypeCustom];
    printButton.layer.cornerRadius = 3;
    printButton.layer.masksToBounds = YES;
    [printButton setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
    [printButton setBackgroundColor:[UIColor lightGrayColor]];
    [printButton setTitle:@"打印" forState:UIControlStateNormal];
    [printButton addTarget:self action:@selector(printButtonPressed:) forControlEvents:UIControlEventTouchUpInside];
    [self addSubview:_printButton = printButton];
  
    [self.printButton mas_makeConstraints:^(MASConstraintMaker *make) {
        make.top.equalTo(self.settingButton.mas_bottom).mas_offset(padding);
        make.left.equalTo(self).mas_offset(padding);
        make.right.equalTo(self).mas_offset(-padding);
        make.height.mas_equalTo(44);
    }];
}

- (void)setSettingButtonVisible:(BOOL)visible {
  [self.settingButton setHidden:!visible];
}

- (void)settingButtonPressed:(UIButton *)sender {
    if (self.delegate && [self.delegate respondsToSelector:@selector(footerView:didPressSettingButton:)]) {
        [self.delegate footerView:self didPressSettingButton:sender];
    }
}

- (void)printButtonPressed:(UIButton *)sender {
    if (self.delegate && [self.delegate respondsToSelector:@selector(footerView:didPressPrintButton:)]) {
        [self.delegate footerView:self didPressPrintButton:sender];
    }
}

@end
