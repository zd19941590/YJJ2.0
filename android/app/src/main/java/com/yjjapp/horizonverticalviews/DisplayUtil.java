package com.yjjapp.horizonverticalviews;

import android.app.Activity;
import android.content.Context;
import android.util.DisplayMetrics;
import android.util.TypedValue;

public class DisplayUtil {

    //屏幕宽度
    private static int mScreenWidth = 0;
    //屏幕高度
    private static int mScreenHeight = 0;

    /**
     * 根据手机的分辨率从 dp 的单位 转成为 px(像素)
     *
     * @param context
     * @param dp
     * @return
     */
    public static int getPxByDp(Context context, int dp) {
        return (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, dp, context.getResources().getDisplayMetrics());
    }

    /**
     * 根据手机的分辨率从 px(像素) 的单位 转成为 dp
     *
     * @param context
     * @param px
     * @return
     */
    public static int getDpByPx(Context context, int px) {

        final float scale = context.getResources().getDisplayMetrics().density;
        return (int) (px / scale + 0.5f);
    }

    /**
     * 根据手机的分辨率从 sp(像素) 的单位 转成为 px
     *
     * @param context
     * @param spValue
     * @return
     */
    public static int getPxBySp(Context context, int spValue) {

        final float fontScale = context.getResources().getDisplayMetrics().scaledDensity;
        return (int) (spValue * fontScale + 0.5f);
    }

    /**
     * 将px值转换为sp值，保证文字大小不变
     *
     * @param context
     * @param pxValue （DisplayMetrics类中属性scaledDensity）
     * @return
     */
    public static int getSpByPx(Context context, float pxValue) {
        final float fontScale = context.getResources().getDisplayMetrics().scaledDensity;
        return (int) (pxValue / fontScale + 0.5f);
    }

    /**
     * 获取屏幕宽度
     *
     * @param activity
     * @return 屏幕宽度(像素)
     */
    public static int getScreenWidth(Activity activity) {
        if (mScreenWidth == 0) {
            DisplayMetrics dm = new DisplayMetrics();
            activity.getWindowManager().getDefaultDisplay().getMetrics(dm);

            mScreenWidth = dm.widthPixels;
            mScreenHeight = dm.heightPixels;
        }

        return mScreenWidth;
    }

    /**
     * 获取屏幕高度
     *
     * @param activity
     * @return 屏幕高度(像素)
     */
    public static int getScreenHeight(Activity activity) {
        if (mScreenHeight == 0) {
            DisplayMetrics dm = new DisplayMetrics();
            activity.getWindowManager().getDefaultDisplay().getMetrics(dm);
            mScreenWidth = dm.widthPixels;
            mScreenHeight = dm.heightPixels;
        }

        return mScreenHeight;
    }

    /**
     * 获取状态栏高度
     *
     * @return
     */
    public static int getStatusBarHeight(Activity activity) {
        int result = 0;
        int resourceId = activity.getResources().getIdentifier("status_bar_height", "dimen",
                "android");
        if (resourceId > 0) {
            result = activity.getResources().getDimensionPixelSize(resourceId);
        }
        return result;
    }
}
