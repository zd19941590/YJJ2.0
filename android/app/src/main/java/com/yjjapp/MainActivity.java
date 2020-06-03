package com.yjjapp;

import android.content.ComponentCallbacks;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;

import com.facebook.react.ReactActivity;
import com.umeng.analytics.MobclickAgent;
import com.facebook.react.ReactFragmentActivity;
import bluestone.utility.SQLiteHelper;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "YJJApp";
    }

//    @Override
//    protected void onStart() {
//        super.onStart();
//
//        SQLiteHelper helper = new  SQLiteHelper();
//        helper.AddContent();
//    }

    @Override
    public void registerComponentCallbacks(ComponentCallbacks callback) {
        super.registerComponentCallbacks(callback);
        SQLiteHelper helper = new  SQLiteHelper(getExternalFilesDir(null).getAbsolutePath()+"/yjj/data2.db");
        helper.createDB();
    }
    @Override
    public void onResume() {
        super.onResume();
        MobclickAgent.onResume(this);
    }
    @Override
    protected void onPause() {
        super.onPause();
        MobclickAgent.onPause(this);
    }
    @Override
    public void onCreate(Bundle savedInstanceState){
        super.onCreate(savedInstanceState);
//        //隐藏标题栏以及状态栏
//        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
//                WindowManager.LayoutParams.FLAG_FULLSCREEN);
//        /**标题是属于View的，所以窗口所有的修饰部分被隐藏后标题依然有效,需要去掉标题**/
//        requestWindowFeature(Window.FEATURE_NO_TITLE);
        // ActionBar actionBar = getActionBar();
        // if (actionBar != null) {
        //     actionBar.hide();
        // }
    }
}
