//
//  NthCPrinterConnectionIndicatorView.m
//  NthCBluetoothDemo
//
//  Created by 张锋 on 27/02/2018.
//  Copyright © 2018 张锋. All rights reserved.
//

#import "PrinterConnectionIndicatorView.h"
#import <Masonry/Masonry.h>

@interface PrinterConnectionIndicatorView ()

@property (nonatomic, strong) UILabel *label;
@property (nonatomic, strong) UIActivityIndicatorView *indicatorView;

@end

@implementation PrinterConnectionIndicatorView

- (instancetype)initWithFrame:(CGRect)frame {
    self = [super initWithFrame:frame];
    if (self) {
        [self setup];
    }
    
    return self;
}

- (void)layoutSubviews {
    [self.label mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.equalTo(self.indicatorView.mas_right).mas_offset(5);
        make.centerY.equalTo(self);
        make.centerX.equalTo(self).mas_offset(10);
    }];
    
    [self.indicatorView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.centerY.equalTo(self);
        make.right.equalTo(self.label.mas_left).mas_offset(-5);
    }];
}

- (void)setup {
    [self addSubview:self.indicatorView];
    [self addSubview:self.label];
}

#pragma mark -

- (void)showText:(NSString *)text animated:(BOOL)animated {
    self.label.text = text;
    
    if (animated) {
        [self.indicatorView startAnimating];
    } else {
        [self.indicatorView stopAnimating];
    }
    
    if (!animated) {
        [self.label mas_updateConstraints:^(MASConstraintMaker *make) {
            make.centerX.equalTo(self);
        }];
    } else {
        [self setNeedsLayout];
    }
}

#pragma mark -

- (UILabel *)label {
    if (_label == nil) {
        _label = [[UILabel alloc] initWithFrame:CGRectZero];
        _label.font = [UIFont systemFontOfSize:15 weight:UIFontWeightMedium];
        _label.textColor = [UIColor blackColor];
        _label.textAlignment = NSTextAlignmentCenter;
        [_label sizeToFit];
    }
    
    return _label;
}

- (UIActivityIndicatorView *)indicatorView {
    if (_indicatorView == nil) {
        _indicatorView = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleGray];
    }
    
    return _indicatorView;
}

@end
