package com.yjjapp;

import android.app.Application;
import android.os.Environment;
import android.util.Log;

// import com.rnbaidupush.reactlibrary.RNBaiduPushPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
//import com.alipay.euler.andfix.patch.PatchManager;
// import com.babisoft.ReactNativeLocalization.ReactNativeLocalizationPackage;
import com.brentvatne.react.ReactVideoPackage;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.modules.network.OkHttpClientProvider;
import com.facebook.react.modules.network.ReactCookieJarContainer;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.facebook.stetho.Stetho;
import com.facebook.stetho.okhttp3.StethoInterceptor;
import com.horcrux.svg.SvgPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import org.pgsqlite.SQLitePluginPackage;
import com.reactlibrary.RNReactNativeDocViewerPackage;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import okhttp3.OkHttpClient;
import cl.json.RNSharePackage;
import com.imagepicker.ImagePickerPackage;
import com.beefe.picker.PickerViewPackage;
import com.umeng.analytics.MobclickAgent;
import com.umeng.commonsdk.UMConfigure;
import com.yjjapp.analytics.DplusReactPackage;
import com.yjjapp.analytics.RNUMConfigure;
import com.yjjapp.bluetooth.BluetoothReactPackage;
import com.yjjapp.configuration.CompanyConfigurationManagerReactPackage;
import com.microsoft.codepush.react.CodePush;
import com.yjjapp.horizonverticalviews.HorizonVerticalViewReactPackage;
import com.rnfs.RNFSPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.corbt.keepawake.KCKeepAwakePackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.github.yamill.orientation.OrientationPackage;
// import  com.dylanvann.fastimage.FastImageViewPackage;
// import com.reactnative.ivpusic.imagepicker.PickerPackage;

//import com.github.yamill.orientation.OrientationPackage;
//import com.ibuildmap.IbuildMapPackage;

public class MainApplication extends Application implements ReactApplication {
    private static final String TAG = "euler";

    //    private PatchManager mPatchManager; //hot-fix class
    private static final String APATCH_PATH = "/out.apatch";
    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }

        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }
        @Override
        protected String getJSBundleFile() {
            return CodePush.getJSBundleFile();
        }
        /**
         * App update version by react-native-code-push which is a hot-update tools
         * see line 92, new CodePush("deployment-key-here" , this , BuildCofig.DEBUG)
         * more description link to http://bbs.reactnative.cn/topic/725/code-push-%E7%83%AD%E6%9B%B4%E6%96%B0%E4%BD%BF%E7%94%A8%E8%AF%A6%E7%BB%86%E8%AF%B4%E6%98%8E%E5%92%8C%E6%95%99%E7%A8%8B
         * or see official website https://www.npmjs.com/package/react-native-code-push
         *  new RNBaiduPushPackage(),
         * @return
         */
        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(new MainReactPackage(), new SQLitePluginPackage(), new RNDeviceInfo(),
                    new ReactVideoPackage(), new RNSharePackage(),
                    new RNReactNativeDocViewerPackage(), new SvgPackage(), new RNFetchBlobPackage(),
                    new PickerViewPackage(), new SplashScreenReactPackage(),
                    new ImagePickerPackage(), new BluetoothReactPackage(),
                    new CompanyConfigurationManagerReactPackage(),
                    new DplusReactPackage(),
                    new RNFSPackage(),
                    /**
                     *  ┌────────────┬──────────────────────────────────────────────────────────────────┐
                        │ Name       │ Deployment Key                                                   │
                        ├────────────┼──────────────────────────────────────────────────────────────────┤
                        │ Production │ GTt7jCVhn_-2tfsUX5qe4ssh8pLV08c6a238-8f8d-45eb-909b-40eaa02204ef │
                        ├────────────┼──────────────────────────────────────────────────────────────────┤
                        │ Staging    │ XA-Il-HgefHGsK19NtRHNnFojlHl08c6a238-8f8d-45eb-909b-40eaa02204ef │
                        └────────────┴──────────────────────────────────────────────────────────────────┘
                     */
                    new CodePush("GTt7jCVhn_-2tfsUX5qe4ssh8pLV08c6a238-8f8d-45eb-909b-40eaa02204ef", MainApplication.this, BuildConfig.DEBUG),
                    new HorizonVerticalViewReactPackage(),
                    new LinearGradientPackage(),
                    new KCKeepAwakePackage(),
                    new VectorIconsPackage(),
                    new OrientationPackage()
            );
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
         /* native exopackage */ 
        SoLoader.init(this,false);

        Stetho.initializeWithDefaults(this);
        OkHttpClient client = new OkHttpClient.Builder().connectTimeout(0, TimeUnit.MILLISECONDS)
                .readTimeout(0, TimeUnit.MILLISECONDS).writeTimeout(0, TimeUnit.MILLISECONDS)
                .cookieJar(new ReactCookieJarContainer()).addNetworkInterceptor(new StethoInterceptor()).build();
        OkHttpClientProvider.replaceOkHttpClient(client);
        RNUMConfigure.init(this, "5ae414198f4a9d55fc000080", "UMConfigure initWithAppkey:@\"5ae414198f4a9d55fc000080\" channel:@\"\"", UMConfigure.DEVICE_TYPE_PHONE,"");
        MobclickAgent.setSessionContinueMillis(1000);
        MobclickAgent.setScenarioType(this, MobclickAgent.EScenarioType.E_DUM_NORMAL);
        //        mPatchManager = new PatchManager(this);
        //        mPatchManager.init("1.0");
        //        mPatchManager.loadPatch();
        //        try {
        //            // .apatch file path
        //            String patchFileString = Environment.getExternalStorageDirectory().getAbsolutePath() + APATCH_PATH;
        //            mPatchManager.addPatch(patchFileString);
        //            Log.d(TAG, "apatch:" + patchFileString + " added.");
        //        } catch (IOException e) {
        //            Log.e(TAG, "", e);
        //        }
    }
}
