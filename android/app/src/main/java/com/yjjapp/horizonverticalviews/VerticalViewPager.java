package com.yjjapp.horizonverticalviews;

import android.content.Context;
import android.support.v4.view.ViewPager;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.View;

public class VerticalViewPager extends ViewPager {
    public VerticalViewPager(Context context) {
        super(context);
        init();
    }

    public VerticalViewPager(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public void init() {
        // The majority of the magic happens here
        setPageTransformer(true, new VerticalPageTransformer());
        // The easiest way to get rid of the overscroll drawing that happens on the left and right
        setOverScrollMode(OVER_SCROLL_NEVER);
    }

    private class VerticalPageTransformer implements PageTransformer {

        @Override
        public void transformPage(View view, float position) {

            if (position < -1) { // [-Infinity,-1)
                // This page is way off-screen to the left.
                view.setAlpha(0);

            } else if (position <= 1) { // [-1,1]
                view.setAlpha(1);

                // Counteract the default slide transition
                view.setTranslationX(view.getWidth() * -position);

                //set Y position to swipe in from top
                float yPosition = position * view.getHeight();
                view.setTranslationY(yPosition);

            } else { // (1,+Infinity]
                // This page is way off-screen to the right.
                view.setAlpha(0);
            }
        }
    }

    /**
     * Swaps the X and Y coordinates of your touch event.
     */
    private MotionEvent swapXY(MotionEvent ev) {
        float width = getWidth();
        float height = getHeight();

        float newX = (ev.getY() / height) * width;
        float newY = (ev.getX() / width) * height;
        ev.setLocation(newX, newY);

        return ev;
    }


    @Override
    public boolean onTouchEvent(MotionEvent ev) {
        try {
            return super.onTouchEvent(swapXY(ev));
        } catch (IllegalArgumentException ex) {
            ex.printStackTrace();
        }
        return false;
    }

    @Override
    public boolean onInterceptTouchEvent(MotionEvent ev) {
        try {
            boolean intercepted = super.onInterceptTouchEvent(swapXY(ev));
            swapXY(ev);
            return intercepted;
        } catch (IllegalArgumentException ex) {
            ex.printStackTrace();
        }
        return false;
    }
//    @Override
//    public void requestLayout() {
//
//        super.requestLayout();
////        if (getWidth() > 0 && getHeight() > 0) {
////            int w = MeasureSpec.makeMeasureSpec(getWidth(), MeasureSpec.EXACTLY);
////            int h = MeasureSpec.makeMeasureSpec(getHeight(), MeasureSpec.EXACTLY);
////            measure(w, h);
////            layout(getPaddingLeft() + getLeft(), getPaddingTop() + getTop(), getWidth() + getPaddingLeft() + getLeft(), getHeight() + getPaddingTop() + getTop());
////        }
//        post(measureAndLayout);
////        forceLayout();
//    }
//
//    private final Runnable measureAndLayout = new Runnable() {
//        @Override
//        public void run() {
//            measure(
//                    MeasureSpec.makeMeasureSpec(getWidth(), MeasureSpec.EXACTLY),
//                    MeasureSpec.makeMeasureSpec(getHeight(), MeasureSpec.EXACTLY));
//            layout(getLeft(), getTop(), getRight(), getBottom());
//        }
//    };
}
