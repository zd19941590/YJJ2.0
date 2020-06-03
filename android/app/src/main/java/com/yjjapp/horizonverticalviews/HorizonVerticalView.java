package com.yjjapp.horizonverticalviews;

import android.content.Context;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentPagerAdapter;
import android.util.AttributeSet;
import android.view.View;
import android.view.ViewGroup;

import com.facebook.react.bridge.ReactContext;

import java.util.ArrayList;

public class HorizonVerticalView extends MyViewPager {

    private PagerOnClickListener pagerOnClickListener;
    private int currentIndex = 0;
    private ArrayList<ItemFragment> fragmentArrayList;
    private MyAdapter myAdapter;
    private int externalLocationIndex;
    private CurrentLocationOnClickListener currentLocationOnClickListener;
    private boolean isLoaclImg;



    public HorizonVerticalView(Context context) {
        this(context, null);
    }

    public HorizonVerticalView(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public void initView(FragmentManager fragmentManager, final ArrayList<ArrayList<String>> datas, int currentItem, boolean isLoaclImg) {
        this.isLoaclImg = isLoaclImg;
        fragmentArrayList = new ArrayList<>();
        for (ArrayList<String> item : datas) {

            ItemFragment itemFragment = new ItemFragment();
            itemFragment.setData(isLoaclImg, item);
            if (currentLocationOnClickListener != null) {
                itemFragment.setCurrentLocationOnClickListener(currentLocationOnClickListener);
            }
            if (pagerOnClickListener != null) {
                itemFragment.setPagerOnClickListener(pagerOnClickListener, currentIndex);
            }
            fragmentArrayList.add(itemFragment);
        }
        myAdapter = new MyAdapter(fragmentManager, fragmentArrayList);
        this.setAdapter(myAdapter);
        this.setCurrentItem(currentItem);
        this.setOffscreenPageLimit(datas.size());
//        this.setOffscreenPageLimit(2);
        externalLocationIndex = currentItem;
        addOnPageChangeListener(new OnPageChangeListener() {
            @Override
            public void onPageScrolled(int position, float positionOffset, int positionOffsetPixels) {
            }

            @Override
            public void onPageSelected(int position) {
                externalLocationIndex = position;
                ItemFragment itemFragment = (ItemFragment) myAdapter.getItem(position);
                itemFragment.setExternalLocationIndex(position);
                if (currentLocationOnClickListener != null) {
                    currentLocationOnClickListener.currentLocation(externalLocationIndex, fragmentArrayList.get(externalLocationIndex).getCurrentImgLocation());
                    currentLocationOnClickListener.externalLocation(externalLocationIndex);
                }
            }

            @Override
            public void onPageScrollStateChanged(int state) {

            }
        });
    }


    private class MyAdapter extends FragmentPagerAdapter {
        private ArrayList<ItemFragment> fragmentList;
        private Context context;

        public MyAdapter(FragmentManager fm) {
            super(fm);

        }

        public MyAdapter(FragmentManager fm, ArrayList<ItemFragment> fragmentList) {
            super(fm);
            this.fragmentList = fragmentList;
        }

        public void updataData(int index, ArrayList<String> data) {
            ItemFragment itemFragment = fragmentList.get(index);
            ItemFragment.MyAdapter myAdapter = itemFragment.getMyAdapter();
//            myAdapter.updata(data);
            itemFragment.setData(isLoaclImg, data);
            notifyDataSetChanged();
        }

        @Override
        public Fragment getItem(int position) {
            return fragmentList.get(position);
        }

        @Override
        public int getCount() {
            return fragmentList.size();
        }

        @Override
        public int getItemPosition(Object object) {
            return super.getItemPosition(object);
        }

        @Override
        public Object instantiateItem(ViewGroup container, int position) {
            if (position == 0) {
                ItemFragment itemFragment = (ItemFragment) fragmentList.get(position);
                itemFragment.setExternalLocationIndex(position);
                currentLocationOnClickListener.currentLocation(externalLocationIndex, fragmentArrayList.get(position).getCurrentImgLocation());
            }
//            return super.instantiateItem(container, position);
            return super.instantiateItem(container, position);
        }

    }

    public interface CurrentLocationOnClickListener {
        void currentLocation(int externalLocation, int innerLocation);

        void externalLocation(int externalLocation);
    }

    public void setCurrentLocationOnClickListener(CurrentLocationOnClickListener currentLocationOnClickListener) {
        this.currentLocationOnClickListener = currentLocationOnClickListener;
    }

    public interface PagerOnClickListener {
        void onPress(View v, int externalLocation, int innerLocation);
    }

    public void setPagerOnClickListener(PagerOnClickListener pagerOnClickListener) {
        this.pagerOnClickListener = pagerOnClickListener;
    }

    /**
     * 更新当前位置列显示列表
     *
     * @param columns
     */
    public void changeCurrent(ArrayList<String> columns) {
        myAdapter.updataData(externalLocationIndex, columns);

    }

    /**
     * 更新指定位置列显示列表
     *
     * @param location
     * @param columns
     */
    public void changeCurrent(int location, ArrayList<String> columns) {
        myAdapter.updataData(location, columns);
    }

    public int getExternalLocationIndex() {
        return externalLocationIndex;
    }
//    @Override
//    public void requestLayout() {
//        super.requestLayout();
//        post(measureAndLayout);
//    }
//        private final Runnable measureAndLayout = new Runnable() {
//        @Override
//        public void run() {
//            measure(
//                    MeasureSpec.makeMeasureSpec(getWidth(), MeasureSpec.EXACTLY),
//                    MeasureSpec.makeMeasureSpec(getHeight(), MeasureSpec.EXACTLY));
//            layout(getLeft(), getTop(), getRight(), getBottom());
//        }
//    };
}
