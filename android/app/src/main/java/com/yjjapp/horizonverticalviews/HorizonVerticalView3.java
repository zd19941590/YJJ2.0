package com.yjjapp.horizonverticalviews;

import android.content.Context;
import android.os.Handler;
import android.support.annotation.NonNull;
import android.support.v4.view.PagerAdapter;
import android.support.v4.view.ViewPager;
import android.util.AttributeSet;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.bumptech.glide.Glide;
import com.bumptech.glide.load.engine.DiskCacheStrategy;
import com.bumptech.glide.request.RequestOptions;
import com.yjjapp.R;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import uk.co.senab.photoview.PhotoView;
import uk.co.senab.photoview.PhotoViewAttacher;

public class HorizonVerticalView3 extends MyViewPager {

    private ArrayList<ArrayList<String>> datas;
    private int currentItem;
    private boolean isLoaclImg;

    private Context context;

    private int TIME;
    private Handler mHandler = new Handler();
    private PagerOnClickListener pagerOnClickListener;
    private CurrentLocationOnClickListener currentLocationOnClickListener;
    private boolean isCarousel;



    public HorizonVerticalView3(Context context) {
        this(context, null);
    }

    public HorizonVerticalView3(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public void changeCurrent(ArrayList<String> columns) {
        MyAdapter adapter = (MyAdapter) this.getAdapter();
        adapter.updata(this.getCurrentItem(), columns);

    }

    public void initView(Context context, ArrayList<ArrayList<String>> datas, final int currentIndx, boolean isLoaclImg) {
        this.context = context;
        this.datas = datas;
        this.currentItem = currentIndx;
        this.isLoaclImg = isLoaclImg;
        this.setAdapter(new MyAdapter(context, datas, isLoaclImg));
        this.setOffscreenPageLimit(3);
        setCurrentItem(currentItem);
        addOnPageChangeListener(new OnPageChangeListener() {
            @Override
            public void onPageScrolled(int position, float positionOffset, int positionOffsetPixels) {

            }

            @Override
            public void onPageSelected(int position) {
                if (currentLocationOnClickListener != null) {
                    currentItem = position;
                    currentLocationOnClickListener.externalLocation(position);
                }
            }

            @Override
            public void onPageScrollStateChanged(int state) {

            }
        });
    }

    public void setCarousel(int replaceTimes, boolean isCarousel) {
        this.TIME = replaceTimes;
        this.isCarousel = isCarousel;
        mHandler.postDelayed(runnableForViewPager, replaceTimes);
    }

    public void stopCarousel() {
        mHandler.removeCallbacks(runnableForViewPager);
    }

    /**
     * ViewPager的定时器
     */
    Runnable runnableForViewPager = new Runnable() {
        @Override
        public void run() {
            try {
                currentItem++;
                mHandler.postDelayed(this, TIME);
                if (isCarousel) {
                    setCurrentItem(currentItem % datas.size());
                } else {
                    setCurrentItem(currentItem);
                }

            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    };

    private class MyAdapter extends PagerAdapter {

        private final LayoutInflater mLayoutInflater;
        private ArrayList<ArrayList<String>> datas;
        private boolean isLoaclImg;
        private List<MyInnerAdapter> myInnerAdapters = new ArrayList<>();

        public MyAdapter(Context context, ArrayList<ArrayList<String>> datas, boolean isLoaclImg) {
            mLayoutInflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            this.datas = datas;
            this.isLoaclImg = isLoaclImg;

        }

        public void updata(int index, ArrayList<String> datas) {
            this.datas.set(index, datas);
            notifyDataSetChanged();
        }

        @Override
        public int getItemPosition(@NonNull Object object) {
            return POSITION_NONE;
        }

        @Override
        public int getCount() {
            return datas.size();
        }

        @Override
        public boolean isViewFromObject(@NonNull View view, @NonNull Object object) {
            return view == object;
        }

        @Override
        public void destroyItem(@NonNull ViewGroup container, int position, @NonNull Object object) {
            container.removeView((View) object);
        }


        @Override
        public Object instantiateItem(ViewGroup container, final int position) {
            View view = mLayoutInflater.inflate(R.layout.item_list3, null);
            VerticalViewPager verticalViewPager = (VerticalViewPager) view.findViewById(R.id.list3);
            if(datas.get(position).size()==0){
                datas.get(position).add("");
            }
            MyInnerAdapter myInnerAdapter = new MyInnerAdapter(context, datas.get(position));
            verticalViewPager.setAdapter(myInnerAdapter);
            verticalViewPager.setOffscreenPageLimit(datas.get(position).size());
            myInnerAdapters.add(myInnerAdapter);
//            loadViewList.add(view);
            container.addView(view);
            verticalViewPager.addOnPageChangeListener(new OnPageChangeListener() {
                @Override
                public void onPageScrolled(int position, float positionOffset, int positionOffsetPixels) {

                }

                @Override
                public void onPageSelected(int position) {
                    if (currentLocationOnClickListener != null) {
                        currentLocationOnClickListener.currentLocation(currentItem, position);
                    }

                }

                @Override
                public void onPageScrollStateChanged(int state) {

                }
            });


            return view;
        }

    }
    public class MyInnerAdapter extends PagerAdapter {
        private LayoutInflater mLayoutInflater;
        private List<String> data;

//        private List<View> loadViewList;

        public MyInnerAdapter(Context context, ArrayList<String> data) {
            mLayoutInflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            this.data = data;
//            loadViewList = new ArrayList<>();
        }

        public void updata(List<String> datas) {
            this.data = datas;
            notifyDataSetChanged();
        }

        @Override
        public int getItemPosition(@NonNull Object object) {
            return POSITION_NONE;
        }

        public int getRealCount() {
            return data.size();
        }

        @Override
        public int getCount() {
            return data.size();
        }


        @Override
        public boolean isViewFromObject(@NonNull View view, @NonNull Object object) {
            return view == object;
        }


        @Override
        public void destroyItem(@NonNull ViewGroup container, int position, @NonNull Object object) {
//            container.removeView(loadViewList.get(position));
            container.removeAllViews();
        }


        @Override
        public Object instantiateItem(ViewGroup container, final int position) {
            View view = mLayoutInflater.inflate(R.layout.recycler_item, null);
            final PhotoView imageView = (PhotoView) view.findViewById(R.id.item_img);
//            imageView.setLayoutParams(new LinearLayout.LayoutParams(DisplayUtil.getScreenWidth((Activity) context), DisplayUtil.getScreenHeight((Activity) context)));
            imageView.setOnPhotoTapListener(new PhotoViewAttacher.OnPhotoTapListener() {
                @Override
                public void onPhotoTap(View view, float x, float y) {
                    if (pagerOnClickListener != null) {
                        pagerOnClickListener.onPress(imageView, currentItem, position);
                    }
                }
            });

            String imageUrl = data.get(position);
            RequestOptions options = new RequestOptions()
                    .fitCenter()
                     .placeholder(R.drawable.waitload)
                     .error(R.drawable.pic404)
                     .fallback(R.drawable.pic404)
                    .diskCacheStrategy(DiskCacheStrategy.RESOURCE);
          /*  if("".equals(imageUrl)){
                Glide.with(context).load(R.drawable.pic404).into(imageView);
            }else*/ if (isLoaclImg) {
                File imgFilePath = new File(imageUrl);
                Glide.with(context).load(imgFilePath).apply(options).into(imageView);
            } else {
                Glide.with(context).load(imageUrl).apply(options).into(imageView);
            }
//            loadViewList.add(view);
            container.addView(view);
            return view;
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
}
