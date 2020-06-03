//
//  PrinterListCell.m
//  NthCBluetoothDemo
//
//  Created by 张锋 on 26/02/2018.
//  Copyright © 2018 张锋. All rights reserved.
//

#import "PrinterListCell.h"
#import <Masonry/Masonry.h>

@interface PrinterListCell ()

@property (nonatomic, strong) UILabel *nameLabel;

@property (nonatomic, strong) UIImageView *checkImageView;

@end

@implementation PrinterListCell

- (instancetype)initWithStyle:(UITableViewCellStyle)style reuseIdentifier:(NSString *)reuseIdentifier {
    self = [super initWithStyle:style reuseIdentifier:reuseIdentifier];
    if (self) {
        self.selectionStyle = UITableViewCellSelectionStyleNone;
        [self setup];
    }
    
    return self;
}

- (void)setup {
    CGFloat margin = 15;
    
    [self.contentView addSubview:self.nameLabel];
    [self.nameLabel mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.equalTo(self.contentView).mas_offset(margin);
        make.centerY.equalTo(self.contentView);
    }];
    
    [self.contentView addSubview:self.checkImageView];
    [self.checkImageView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.right.equalTo(self.contentView).mas_offset(-margin);
        make.centerY.equalTo(self.contentView);
        make.width.and.height.mas_equalTo(30);
    }];
}

- (void)setSelected:(BOOL)selected animated:(BOOL)animated {
    [super setSelected:selected animated:animated];
  
    [_checkImageView setHighlighted:selected];
}

#pragma mark -

- (UILabel *)nameLabel {
    if (_nameLabel == nil) {
        _nameLabel = [[UILabel alloc] initWithFrame:CGRectZero];
        _nameLabel.font = [UIFont systemFontOfSize:15 weight:UIFontWeightMedium];
    }
    return _nameLabel;
}

- (UIImageView *)checkImageView {
    if (_checkImageView == nil) {
        _checkImageView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"CellGraySelected"] highlightedImage:[UIImage imageNamed:@"CellBlueSelected"]];
    }
    return _checkImageView;
}

@end
