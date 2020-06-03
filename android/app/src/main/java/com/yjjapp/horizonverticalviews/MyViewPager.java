package com.yjjapp.horizonverticalviews;

import android.content.Context;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.views.viewpager.ReactViewPager;

import android.support.v4.view.ViewPager;
import android.util.AttributeSet;
import android.view.MotionEvent;

public class MyViewPager extends ViewPager {


    public MyViewPager(Context context) {
        super(context);

    }


    public MyViewPager(Context context, AttributeSet attrs) {

        super(context, attrs);

    }

    private float mDownPosX;
    private float mDownPosY;

    public MyViewPager(ReactContext reactContext) {
        super(reactContext);
    }

    @Override
    public boolean onInterceptTouchEvent(MotionEvent ev) {
        final float x = ev.getX();
        final float y = ev.getY();

        final int action = ev.getAction();
        switch (action) {
            case MotionEvent.ACTION_DOWN:
                mDownPosX = x;
                mDownPosY = y;

                break;
            case MotionEvent.ACTION_MOVE:
                final float deltaX = Math.abs(x - mDownPosX);
                final float deltaY = Math.abs(y - mDownPosY);
                return deltaX > deltaY;
        }

        return super.onInterceptTouchEvent(ev);
    }

}
