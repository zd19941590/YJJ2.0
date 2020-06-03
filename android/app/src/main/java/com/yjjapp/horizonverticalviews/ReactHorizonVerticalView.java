package com.yjjapp.horizonverticalviews;

import android.app.Activity;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.widget.RadioGroup;
import android.widget.TextView;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.google.gson.Gson;
import com.yjjapp.R;

import java.util.ArrayList;
import java.util.Map;

import javax.annotation.Nullable;

//java.security.AccessControlContext

/**
 * Created by Administrator on 2018/5/28.
 */
public class ReactHorizonVerticalView extends ViewGroupManager<HasIndicatorsHorizonVerticalView> {

    private HasIndicatorsHorizonVerticalView rootView ;
    private ArrayList list;
    private ArrayList<ArrayList<String>> tempList ;
    private int Index = -1;
    private ThemedReactContext reactContexts;
    private Activity activity;
    private int ChangeTimes = 0;
    private  int currIndex = 0;
    private RadioGroup radioGroup;

    @Override
    public String getName() {
        return "RCTAndroidHorizonVerticalView";
    }

    @Override
    protected HasIndicatorsHorizonVerticalView createViewInstance(final ThemedReactContext reactContext) {
//        rootView = (HasIndicatorsHorizonVerticalView) LayoutInflater.from(reactContext).inflate(R.layout.has_indicators_view_layout,null);
        rootView = new HasIndicatorsHorizonVerticalView(reactContext.getCurrentActivity());
        reactContexts = reactContext;
        activity = reactContexts.getCurrentActivity();
        list = null;
        return rootView;
    }

    @ReactProp(name = "dataList", customType = "ReadableArray")
    public void setDataList(final HasIndicatorsHorizonVerticalView contentx, String dataList) {
        Gson gson = new Gson();
        DataInfo info = gson.fromJson(dataList, DataInfo.class);
        final TextView pageIndex = (TextView) contentx.findViewById(R.id.pager_index);
        list = info.dataList;
        Index = info.index;
        tempList = list;
        rootView.setPagerOnClickListener(new HorizonVerticalView3.PagerOnClickListener() {
            @Override
            public void onPress(View v, int externalLocation, int innerLocation) {
                //监听点击事件
                WritableMap map = Arguments.createMap();
                map.putString("name", "onPagePress");
                sendEvent(reactContexts, "onPagePress", map);
            }
        });
        rootView.setCurrentLocationOnClickListener(new HorizonVerticalView3.CurrentLocationOnClickListener() {
            @Override
            public void currentLocation(int externalLocation, int innerLocation) {
                 WritableMap map = Arguments.createMap();
                 map.putString("name", "onVerticalPageScroll");
                 map.putInt("HorizonIndex", externalLocation);
                 map.putInt("verticalIndex", innerLocation);
                map.putString("ImagePath", tempList.get(externalLocation).get(innerLocation));
                sendEvent(reactContexts, "onVerticalPageScroll", map);
            }
            @Override
            public void externalLocation(int externalLocation) {
                WritableMap map = Arguments.createMap();
                map.putString("name", "ontHorizonPageScroll");
                map.putInt("HorizonIndex", externalLocation);
                map.putString("ImagePath", tempList.get(externalLocation).get(0));
                sendEvent(reactContexts, "ontHorizonPageScroll", map);
                pageIndex.setText(externalLocation + 1 + "/" + list.size());
                currIndex = externalLocation;
                UpdateWindows();
            }
         });
        currIndex = Index;
        contentx.initView(list, Index, false , new HasIndicatorsHorizonVerticalView.ContactInterface() {
            @Override
            public void updateWindow() {
                UpdateWindows();
            }
        });
    }


    //事件发送
    void sendEvent(ThemedReactContext reactContext, String eventName, @Nullable WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    @Override
    public
    @Nullable
    Map<String, Integer> getCommandsMap() {
        return MapBuilder.of(
                "changeCurrent", 1,
                "AotuScroll", 2,
                "StopScroll", 3
        );
    }

    @Override
    public void receiveCommand( final HasIndicatorsHorizonVerticalView view, int commandId, @Nullable ReadableArray args) {
        switch (commandId) {
            case 1:
                ArrayList datas = args.toArrayList();
                tempList.set(currIndex,datas);
                view.changeCurrent(datas,new HasIndicatorsHorizonVerticalView.ContactInterface(){
                    @Override
                    public void updateWindow() {
                        UpdateWindows();
                    }
                });
                break;
            case 2://开始自动播放 传入值为 间隔时间 （毫秒）
                ArrayList times = args.toArrayList();
                if (times!=null&&times.size()>0){
                    boolean isLoop = true;
                    String timeStr = times.get(0).toString();
                    int time =Integer.parseInt(timeStr);
                    if (times.size()>1){
                        isLoop = (boolean)times.get(1);
                    }
                   view.setCarousel(time,isLoop);
                }
                break;
            case 3:
                view.stopCarousel();
                break;
        }
    }
    //修改windows大小 处理 android渲染不成功
    private void UpdateWindows() {
        int add = 0;
        if (ChangeTimes % 2 == 0) add = 1;
        else add = -1;
        Window w = reactContexts.getCurrentActivity().getWindow();
        w.setLayout(DisplayUtil.getScreenWidth(activity) + add, DisplayUtil.getScreenHeight(activity));
        ChangeTimes++;
    }

    public class DataInfo {
        public int index;
        public ArrayList<ArrayList<String>> dataList;

        public int getIndex() {
            return index;
        }

        public void setIndex(int index) {
            this.index = index;
        }

        public ArrayList<ArrayList<String>> getDataList() {
            return dataList;
        }

        public void setdataList(ArrayList<ArrayList<String>> dataList) {
            this.dataList = dataList;
        }
    }

    @Override
    public boolean needsCustomLayoutForChildren() {
        return false;
    }
    @Override
    public boolean shouldPromoteGrandchildren() {
        return false;
    }
}
