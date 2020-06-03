package com.yjjapp.horizonverticalviews;

import android.content.Context;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.v4.app.Fragment;
import android.support.v4.view.PagerAdapter;
import android.support.v4.view.ViewPager;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.RadioGroup;

import com.bumptech.glide.Glide;
import com.yjjapp.R;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import uk.co.senab.photoview.PhotoView;
import uk.co.senab.photoview.PhotoViewAttacher;

public class ItemFragment extends Fragment {
    private HorizonVerticalView.PagerOnClickListener pagerOnClickListener;
//    private List<View> loadViewList = new ArrayList<>();
    private int mScreenWidth;
    private int mScreenHeight;
    private MyAdapter myAdapter;
    private int externalLocationIndex;
    private HorizonVerticalView.CurrentLocationOnClickListener currentLocationOnClickListener;
    private int currentImgLocation;
    private boolean isLoaclImg;
    private VerticalViewPager viewPager;
    private RadioGroup radioGroup;
    public ArrayList<String> imageData;

    public void setExternalLocationIndex(int externalLocationIndex) {
        this.externalLocationIndex = externalLocationIndex;
    }

    public int getCurrentImgLocation() {
        return currentImgLocation;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    public void setData(boolean isLoaclImg, ArrayList<String> imageData) {
        this.isLoaclImg = isLoaclImg;
        this.imageData = imageData;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View inflate = inflater.inflate(R.layout.fragment_item_list, null);
        viewPager = (VerticalViewPager) inflate.findViewById(R.id.list);
        radioGroup = (RadioGroup) inflate.findViewById(R.id.radiogroup);
        DisplayMetrics dm = new DisplayMetrics();
        getActivity().getWindowManager().getDefaultDisplay().getMetrics(dm);
        mScreenWidth = dm.widthPixels;
        mScreenHeight = dm.heightPixels;
//        Bundle bundle = getArguments();
//        ArrayList<String> imageData = bundle.getStringArrayList("IMAGE_DATA");
//        isLoaclImg = bundle.getBoolean("IS_LOACLI_MG");
        myAdapter = new MyAdapter(imageData);
        viewPager.setAdapter(myAdapter);
        viewPager.setOffscreenPageLimit(imageData.size());
        viewPager.addOnPageChangeListener(new ViewPager.OnPageChangeListener() {
            int currentPosition = 0;

            @Override
            public void onPageScrolled(int position, float positionOffset, int positionOffsetPixels) {
                if (position > currentPosition) {
                    currentPosition = position;
                } else if (position < currentPosition) {
                    currentPosition = position;
                }
            }

            @Override
            public void onPageSelected(int position) {
                if (currentLocationOnClickListener != null) {
                    currentImgLocation = position;
                    currentLocationOnClickListener.currentLocation(externalLocationIndex, position);
                }
                radioGroup.check(position);
            }

            @Override
            public void onPageScrollStateChanged(int state) {

            }
        });
        if (imageData.size() <= 0) {
            radioGroup.setVisibility(View.GONE);
        } else {
            radioGroup.setVisibility(View.VISIBLE);
            generateIndicator(imageData.size());
        }
        return inflate;
    }

    public MyAdapter getMyAdapter() {
        return myAdapter;
    }

    public void setPagerOnClickListener(HorizonVerticalView.PagerOnClickListener pagerOnClickListener, int currrentIndex) {
        this.pagerOnClickListener = pagerOnClickListener;
    }

    public void setCurrentLocationOnClickListener(HorizonVerticalView.CurrentLocationOnClickListener currentLocationOnClickListener) {
        this.currentLocationOnClickListener = currentLocationOnClickListener;
    }

    public class MyAdapter extends PagerAdapter {
        private LayoutInflater mLayoutInflater;
        private List<String> data;

        public MyAdapter(ArrayList<String> data) {
            mLayoutInflater = (LayoutInflater) getActivity().getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            this.data = data;
        }

        public void updata(List<String> datas) {
            this.data = datas;
            generateIndicator(datas.size());
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
            container.removeAllViews();
//            container.removeView(loadViewList.get(position));
        }


        @Override
        public Object instantiateItem(ViewGroup container, final int position) {
            View view = mLayoutInflater.inflate(R.layout.recycler_item, null);
            final PhotoView imageView = (PhotoView) view.findViewById(R.id.item_img);
            imageView.setLayoutParams(new LinearLayout.LayoutParams(mScreenWidth, mScreenHeight));
            imageView.setOnPhotoTapListener(new PhotoViewAttacher.OnPhotoTapListener() {
                @Override
                public void onPhotoTap(View view, float x, float y) {
                    if (pagerOnClickListener != null) {
                        pagerOnClickListener.onPress(imageView, externalLocationIndex, position);
                    }
                }
            });
            String imageUrl = data.get(position);
            if (isLoaclImg) {
                File imgFilePath = new File(imageUrl);
                Glide.with(getActivity()).load(imgFilePath).into(imageView);
            } else {
                Glide.with(getActivity()).load(imageUrl).into(imageView);
            }
//            loadViewList.add(view);
            container.addView(view);
            return view;
        }

    }

    private void generateIndicator(int size) {
        radioGroup.removeAllViews();
        if (size > 1) {
            int radius = DisplayUtil.getPxByDp(getContext(), 8);
            int margin = DisplayUtil.getPxByDp(getContext(), 3);
            for (int i = 0; i < size; i++) {
                RadioButton radioButton = new RadioButton(getContext());
                radioButton.setId(i);
                radioButton.setButtonDrawable(android.R.color.transparent);
                radioButton.setBackgroundResource(R.drawable.indicator_selector);
                radioButton.setClickable(false);
                RadioGroup.LayoutParams lp = new RadioGroup.LayoutParams(radius, radius);
                lp.setMargins(margin, margin, margin, margin);
                radioGroup.addView(radioButton, lp);
            }
            radioGroup.clearCheck();
            radioGroup.check(0);
        }
    }

}
