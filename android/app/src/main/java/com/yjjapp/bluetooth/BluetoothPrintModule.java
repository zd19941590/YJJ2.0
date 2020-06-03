package com.yjjapp.bluetooth;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class BluetoothPrintModule extends ReactContextBaseJavaModule {

  public BluetoothPrintModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  // ReactContextBaseJavaModule要求派生类实现getName方法。这个函数用于返回一个字符串
  // 这个字符串用于在JavaScript端标记这个原生模块
  @Override
  public String getName() {
    return "BluetoothPrinter";
  }


  // 获取应用包名
  // 要导出一个方法给JavaScript使用，Java方法需要使用注解@ReactMethod
   @ReactMethod
   public void print(String  printContent) {
     byte[] content= android.util.Base64.decode(printContent,android.util.Base64.DEFAULT);
     Bundle bundle = new Bundle();
     Activity  currentActivity= getCurrentActivity();

    //  bundle.putByteArray(PrinterSettingActivity.PRINTER_CONTENT, content);
    //  IntentUtil.redirectToNextActivity(PrinterSettingActivity.this, PrinterSettingActivity.class, bundle);

     bundle.putByteArray(PrinterSettingActivity.PRINTER_CONTENT,content);     
     Intent intent = new Intent(currentActivity,PrinterSettingActivity.class);
     intent.putExtras(bundle);
     currentActivity.startActivity(intent);
  }
}