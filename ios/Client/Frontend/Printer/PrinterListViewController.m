//
//  PrinterListViewController.m
//  YJJApp
//
//  Created by bluestone on 2018/4/23.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "PrinterListViewController.h"
#import "PrinterConnectionIndicatorView.h"
#import "PrinterListFooterView.h"
#import "PrinterListCell.h"
#import "PrinterListHelper.h"
#import <Masonry/Masonry.h>
#import <MBProgressHUD/MBProgressHUD.h>

@interface PrinterListViewController () <UITableViewDelegate, UITableViewDataSource, BleScanDelegate, UartDelegate, PrinterListFooterViewProtocol>

@property (nonatomic, strong) UITableView *tableView;

@property (nonatomic, strong) PrinterListFooterView *footerView;
@property (nonatomic, strong) PrinterConnectionIndicatorView *indicatorView;

@property (nonatomic, strong) PrinterListHelper *helper;
@property (nonatomic, strong) id data;
@property (nonatomic, strong) UartLib *uartLib;
@property (nonatomic, strong) NSMutableArray <CBPeripheral *>*dataArray;
@property (nonatomic, strong) CBPeripheral *currentPeripheral;

@end

@implementation PrinterListViewController

#pragma mark - Life

- (instancetype)initWithPrintParameters:(id)data {
    self = [super init];
    if (self) {
      _data = data;
    }
  
    return self;
}

- (void)viewDidLoad {
    [super viewDidLoad];
  
    [self setup];
    [self.uartLib scanStart];
    [self.indicatorView showText:@"正在搜索设备..." animated:YES];
}

- (void)cancelBarButtonItemPressed:(UIBarButtonItem *)sender {
  [self.uartLib scanStop];
  
  if (self.currentPeripheral) {
      [self.uartLib disconnectPeripheral:self.currentPeripheral];
  }
    [self dismissViewControllerAnimated:YES completion:nil];
}

- (void)setup {
    self.navigationItem.titleView = self.indicatorView;
  
    UIBarButtonItem *cancel = [[UIBarButtonItem alloc] initWithTitle:@"取消" style:UIBarButtonItemStylePlain target:self action:@selector(cancelBarButtonItemPressed:)];
    [self.navigationItem setLeftBarButtonItem:cancel];
  
    [self.view setBackgroundColor:[UIColor whiteColor]];
  
    [self.view addSubview:self.tableView];
    [self.view addSubview:self.footerView];
  
    [self.footerView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.and.right.and.bottom.equalTo(self.view);
        make.height.mas_equalTo(150);
    }];
  
    [self.tableView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.and.right.and.top.equalTo(self.view);
        make.bottom.equalTo(self.footerView.mas_top);
    }];
  
    if (self.dataArray.count > 0) {
        for (NSInteger index = 0; index < self.dataArray.count; index ++ ) {
            NSIndexPath *indexPath = [NSIndexPath indexPathForRow:index inSection:0];
            [self.tableView selectRowAtIndexPath:indexPath animated:NO scrollPosition:UITableViewScrollPositionNone];
        }
    }
}

#pragma mark - PrinterListFooterViewProtocol

- (void)footerView:(PrinterListFooterView *)view didPressSettingButton:(UIButton *)sender {
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:UIApplicationOpenSettingsURLString] options:@{} completionHandler:nil];
}

- (void)footerView:(PrinterListFooterView *)view didPressPrintButton:(UIButton *)sender {
  NSData *data = [[NSData alloc] initWithBase64EncodedString:self.data options:NSDataBase64DecodingIgnoreUnknownCharacters];
  
  if (!data || data.length == 0) {
      UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"提示" message:@"打印数据格式不正确，确认订单数据是否有误" preferredStyle:UIAlertControllerStyleAlert];
      UIAlertAction *confirm = [UIAlertAction actionWithTitle:@"确定" style:UIAlertActionStyleDefault handler:nil];
      [alert addAction:confirm];
      [self presentViewController:alert animated:YES completion:nil];
    
      return;
  }
  
  [self.helper printerShouldPrintLongData:data completionHandler:nil];
}

#pragma mark -

- (void)peripheralStatePoweredOn {
  NSLog(@"🔴 peripheralStatePoweredOn");
}

- (void)peripheralStatePoweredOff {
  NSLog(@"🔴 peripheralStatePoweredOff");
}

#pragma mark - UartDelegate

- (void)didBluetoothPoweredOff {
    [self.dataArray removeAllObjects];
    [self.tableView reloadData];
  
    [self.footerView setSettingButtonVisible:YES];
}

- (void)didBluetoothPoweredOn {
    [self.uartLib scanStart];
    [self.indicatorView showText:@"正在搜索设备..." animated:YES];
  
    [self.footerView setSettingButtonVisible:NO];
}

- (void)didScanedPeripherals:(NSMutableArray *)foundPeripherals {
    if (foundPeripherals.count == 0) return;
  
    BOOL shouldRefresh = NO;
  
    for (CBPeripheral *foundPeripheral in foundPeripherals) {
        NSLog(@"%@", foundPeripheral.name);
        if (self.dataArray.count > 0) {
            for (CBPeripheral *peripheral in self.dataArray) {
                if (foundPeripheral.identifier != peripheral.identifier) {
                    shouldRefresh = YES;
                    [self.dataArray addObject:foundPeripheral];
                }
            }
        } else {
          shouldRefresh = YES;
            [self.dataArray addObject:foundPeripheral];
        }
    }
  
    NSLog(@"🔵 %@", self.dataArray);
    [self.indicatorView showText:@"搜索到的设备" animated:NO];
    [self.uartLib scanStop];
  
    if (shouldRefresh) {
        [self.tableView reloadData];
    }
}

- (void)didConnectPeripheral:(CBPeripheral *)peripheral {
    NSLog(@"👉 设备已连接: %@", peripheral.name);
    self.currentPeripheral = peripheral;
    [self.indicatorView showText:@"设备已连接" animated:NO];
}

- (void)didDisconnectPeripheral:(CBPeripheral *)peripheral error:(NSError *)error {}

- (void)didReceiveData:(CBPeripheral *)peripheral recvData:(NSData *)recvData {}

- (void)didWriteData:(CBPeripheral *)peripheral error:(NSError *)error {
    MBProgressHUD *hud = [[MBProgressHUD alloc] initWithView:self.view];
    hud.mode = MBProgressHUDModeText;
    if (!error) {
        hud.label.text = @"打印成功";
    } else {
        hud.label.text = error.userInfo[NSLocalizedDescriptionKey];
    }
    [hud showAnimated:YES];
}

- (void)didRecvRSSI:(CBPeripheral *)peripheral RSSI:(NSNumber *)RSSI {}

- (void)didRetrievePeripheral:(NSArray *)peripherals {}

- (void)didDiscoverPeripheral:(CBPeripheral *)peripheral RSSI:(NSNumber *)RSSI {}

- (void)didDiscoverPeripheralAndName:(CBPeripheral *)peripheral DevName:(NSString *)devName {}

- (void)didrecvCustom:(CBPeripheral *)peripheral CustomerRight:(bool)bRight {}

#pragma mark - UITableViewDelegate, UITableViewDataSource

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    NSLog(@"%ld", self.tableView.indexPathForSelectedRow.row);
  
    CBPeripheral *peripheral = self.dataArray[indexPath.row];
    if ([self.currentPeripheral.identifier isEqual:peripheral.identifier]) {
        return;
    }
  
    [self.indicatorView showText:@"正在连接..." animated:YES];
    [self.uartLib scanStop];
    [self.uartLib connectPeripheral:peripheral];
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    NSString *identifier = NSStringFromClass([PrinterListCell class]);
  
    PrinterListCell *cell = [tableView dequeueReusableCellWithIdentifier:identifier];
    if (cell == nil) {
        cell = [[PrinterListCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:identifier];
    }
  
    cell.nameLabel.text = self.dataArray[indexPath.row].name;
  
    return cell;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return self.dataArray.count;
}

#pragma mark - Initial

- (UITableView *)tableView {
    if (!_tableView) {
        _tableView = [[UITableView alloc] initWithFrame:CGRectZero];
        [_tableView registerClass:[PrinterListCell class] forCellReuseIdentifier:NSStringFromClass([PrinterListCell class])];
        [_tableView setTableFooterView:[[UIView alloc] init]];
        [_tableView setDelegate:self];
        [_tableView setDataSource:self];
    }
    return _tableView;
}

- (PrinterListFooterView *)footerView {
  if (!_footerView) {
    _footerView = [[PrinterListFooterView alloc] init];
    _footerView.delegate = self;
  }
  
  return _footerView;
}

- (NSMutableArray *)dataArray {
    if (_dataArray == nil) {
      NSArray *connectedPeripherals = [self.uartLib retrieveConnectedPeripherals];
      connectedPeripherals.count ?
      (_dataArray= [NSMutableArray arrayWithArray:connectedPeripherals]) : (_dataArray = [[NSMutableArray alloc] init]);
    }
    return _dataArray;
}

- (UartLib *)uartLib {
    if (_uartLib == nil) {
        _uartLib = [[UartLib alloc] init];
        _uartLib.uartDelegate = self;
    }
    return _uartLib;
}

- (PrinterListHelper *)helper {
    if (_helper) {
      _helper = nil;
    }
    _helper = [[PrinterListHelper alloc] initWithUartLib:self.uartLib peripheral:self.currentPeripheral];
  
    return _helper;
}

- (PrinterConnectionIndicatorView *)indicatorView {
  if (_indicatorView == nil) {
    _indicatorView = [[PrinterConnectionIndicatorView alloc] initWithFrame:CGRectMake(0, 0, CGRectGetWidth(self.navigationController.navigationBar.frame) / 2, CGRectGetHeight(self.navigationController.navigationBar.frame))];
  }
  
  return _indicatorView;
}

@end
