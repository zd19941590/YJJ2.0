

import React from '../node_modules/react';
import { PixelRatio } from '../node_modules/react-native';
import Dimensions from 'Dimensions';

const Util = {
    ratio: PixelRatio.get(),
    pixel: 1/PixelRatio.get(),
    window: {
        size: {
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height
        }
    },
    ///过期方法，请使用上边那个方法
    size: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height
    }
};

export default Util;