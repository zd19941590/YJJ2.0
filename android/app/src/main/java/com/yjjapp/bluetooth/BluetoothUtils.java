package com.yjjapp.bluetooth;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.Message;
import android.os.Parcelable;
import android.support.v4.app.ActivityCompat;
import android.util.Log;
import android.widget.Toast;

import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.lang.reflect.Method;
import java.util.Set;
import java.util.UUID;

//import haodianjia.ecbluestone.com.MainActivity;

/**
 * Created by liu.yao on 2017/5/24.
 */

public class BluetoothUtils {

  /*  private BluetoothAdapter bluetoothAdapter;
    private BluetoothDevice currentDevice;

    public void init(Activity activity) {
        ActivityCompat.requestPermissions(activity, new String[]{android.Manifest.permission.ACCESS_COARSE_LOCATION,
                android.Manifest.permission.ACCESS_FINE_LOCATION}, 2);


        bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        if (bluetoothAdapter == null) {
            Toast.makeText(activity, "该手机不支持蓝牙", Toast.LENGTH_SHORT).show();
            return;
        }
        activity.registerReceiver(mReceiverUUID, new IntentFilter(BluetoothDevice.ACTION_UUID));

        activity.registerReceiver(mReceiverFOUND, new IntentFilter(BluetoothDevice.ACTION_FOUND));

        activity.registerReceiver(mReceiverBOND, new IntentFilter(BluetoothDevice.ACTION_BOND_STATE_CHANGED));

        if (!bluetoothAdapter.isEnabled()) {
            Intent intent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            activity.startActivityForResult(intent, REQUEST_ENABLE_BT);
        } else {
            Set<BluetoothDevice> pairedDevices = bluetoothAdapter.getBondedDevices();
            if (pairedDevices.size() > 0) {
                for (BluetoothDevice deviceinfo : pairedDevices) {
                    Log.i("TAG", "已配对设备: " + deviceinfo.getName());
                    if ("58Printer".equals(deviceinfo.getName())) {
//                        ConnectThread connectThread = new ConnectThread(currentDeviceUUID, deviceinfo);
//                        connectThread.start();
                    }
                }

            }
//                bluetoothAdapter.startDiscovery();

        }
    }

    private final BroadcastReceiver mReceiverBOND = new BroadcastReceiver() {
        public void onReceive(Context context, Intent intent) {
            Parcelable[] uuidExtra = intent.getParcelableArrayExtra(BluetoothDevice.EXTRA_UUID);
            String uuid = "";
            for (int i = 0; i < uuidExtra.length; i++) {
                uuid = uuidExtra[i].toString();
            }

            UUID currentDeviceUUID = UUID.fromString(uuid);
            MainActivity.ConnectThread connectThread = new MainActivity.ConnectThread(currentDeviceUUID, currentDevice);
            connectThread.start();
        }
    };


    private final BroadcastReceiver mReceiverUUID = new BroadcastReceiver() {
        public void onReceive(Context context, Intent intent) {
            Parcelable[] uuidExtra = intent.getParcelableArrayExtra(BluetoothDevice.EXTRA_UUID);
            String uuid = "";
            for (int i = 0; i < uuidExtra.length; i++) {
                uuid = uuidExtra[i].toString();
            }

            UUID currentDeviceUUID = UUID.fromString(uuid);
            MainActivity.ConnectThread connectThread = new MainActivity.ConnectThread(currentDeviceUUID, currentDevice);
            connectThread.start();
        }
    };

    private final BroadcastReceiver mReceiverFOUND = new BroadcastReceiver() {
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();

            // 当有设备被发现的时候会收到 action == BluetoothDevice.ACTION_FOUND 的广播
            if (BluetoothDevice.ACTION_FOUND.equals(action)) {

                //广播的 intent 里包含了一个 BluetoothDevice 对象
                BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);

                //假设我们用一个 ListView 展示发现的设备，那么每收到一个广播，就添加一个设备到 adapter 里
//                mArrayAdapter.add(device.getName() + "\n" + device.getAddress());
                Log.i("TAG", "onReceive: " + device.getName());
                if ("58Printer".equals(device.getName())) {
                    try {
                        Method createBondMethod = BluetoothDevice.class.getMethod("createBond");
                        createBondMethod.invoke(device);
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, e.getMessage(), Toast.LENGTH_SHORT).show();
                    }

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.ICE_CREAM_SANDWICH_MR1) {
                        device.fetchUuidsWithSdp();
                        currentDevice = device;
                    }
                    *//*ConnectThread connectThread = new ConnectThread(device);
                    connectThread.start();*//*
                }
            }
        }
    };

    private class ConnectThread extends Thread {
        private final BluetoothSocket mmSocket;
        private final BluetoothDevice mmDevice;

        public ConnectThread(UUID currentDeviceUUID, BluetoothDevice device) {

            BluetoothSocket tmp = null;
            mmDevice = device;
            try {
                // 通过 BluetoothDevice 获得 BluetoothSocket 对象
                //uuidValue = "00001101-0000-100­0-8000-00805F9B34FB";
//                String uuidValue = "00000003-0000-100­0-8000-00805F9B34FB";
//                String uuidValue = "00001101-0000-1000-8000-00805F9B34FB";
//                UUID uuid = UUID.fromString(uuidValue);
                tmp = device.createRfcommSocketToServiceRecord(currentDeviceUUID);
            } catch (IOException e) {
            }
            mmSocket = tmp;
        }


        @Override
        public void run() {
            // 建立连接前记得取消设备发现
            bluetoothAdapter.cancelDiscovery();
            try {
                System.out.printf("TAG", "run: " + "开始连接");
                Message msg1 = Message.obtain();
                msg1.obj = "开始连接";
                handler.sendMessage(msg1);
                // 耗时操作，所以必须在主线程之外进行
                mmSocket.connect();
            } catch (IOException connectException) {
                //处理连接建立失败的异常
                Message msg2 = Message.obtain();
                msg2.obj = "连接失败异常";
                handler.sendMessage(msg2);
                System.out.printf("TAG", "run: " + "连接失败" + connectException.toString());
                try {
                    mmSocket.close();
                } catch (IOException closeException) {
                }
                return;
            }
            Message msg3 = Message.obtain();
            msg3.obj = "连接成功";
            handler.sendMessage(msg3);
            System.out.printf("TAG", "run: " + "连接成功");
            manageConnectedSocket(mmSocket);
//            manageConnectedSocket(mmSocket);
        }

        //关闭一个正在进行的连接
        public void cancel() {
            try {
                mmSocket.close();
            } catch (IOException e) {
            }
        }
    }

    private void manageConnectedSocket(BluetoothSocket mmSocket) {
        OutputStream outputStream = null;
        try {
            outputStream = mmSocket.getOutputStream();
            OutputStreamWriter writer = new OutputStreamWriter(outputStream, "GBK");
            initPrinter(writer);
            printText(writer, "123234234");
        } catch (IOException e) {
            e.printStackTrace();
        }


    }

    protected void initPrinter(OutputStreamWriter writer) throws IOException {
        writer.write(0x1B);
        writer.write(0x40);
        writer.flush();
    }

    protected void printText(OutputStreamWriter writer, String text) throws IOException {
        writer.write(text);
        writer.flush();
    }*/
 /*private class ConnectThread extends Thread {
        private final BluetoothDevice mmDevice;

        public ConnectThread(BluetoothDevice device) {

            BluetoothSocket tmp = null;
            mmDevice = device;
        }

        @Override
        public void run() {
            BluetoothSocket s = null;
            try {
                Log.i("TAG", "run: "+"开始连接");
                Method method = mmDevice.getClass()
                        .getMethod("createRfcommSocket",
                                new Class[]{int.class});
                try {
                    s = (BluetoothSocket) method.invoke(mmDevice,
                            new Object[]{29});
                    s.connect();
                    Log.i("TAG", "run: "+"连接成功");
                } catch (IllegalArgumentException e) {
                    Log.i("TAG", "run: "+"连接失败");
                    e.printStackTrace();
                } catch (IllegalAccessException e) {
                    Log.i("TAG", "run: "+"连接失败");
                    e.printStackTrace();
                } catch (InvocationTargetException e) {
                    Log.i("TAG", "run: "+"连接失败");
                    e.printStackTrace();
                } catch (Exception e) {
                    Log.i("TAG", "run: "+"连接失败");
                }
            } catch (SecurityException e) {
                Log.i("TAG", "run: "+"连接失败");
            } catch (NoSuchMethodException e) {
                Log.i("TAG", "run: "+"连接失败");
            }


        }
    }*/

}
