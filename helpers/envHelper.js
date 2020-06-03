/**
 * 获取AQI对应的颜色
 * @param value
 * @returns {*}
 */
export function getAqiTargetColor(value) {
    if (!value || value < 0) value = 0;
    value = parseFloat(value)
    if (0 <= value && value <= 50) {
        return '#8CC152'
    } else if (value <= 100) {
        return '#FFCE54'
    } else if (value <= 150) {
        return '#FC6E51'
    } else if (value <= 200) {
        return '#DA4453'
    } else if (value <= 300) {
        return '#5D0098'
    } else {
        return '#8B1F2A'
    }
}

/**
 * 获取PM25对应的颜色
 * @param value
 * @returns {*}
 */
export function getPM25TargetColor(value) {
    if (!value || value < 0) value = 0;
    value = parseFloat(value)
    if (0 <= value && value <= 35) {
        return '#8CC152'
    } else if (value <= 75) {
        return '#FFCE54'
    } else if (value <= 115) {
        return '#FC6E51'
    } else if (value <= 150) {
        return '#DA4453'
    } else if (value <= 250) {
        return '#5D0098'
    } else {
        return '#8B1F2A'
    }
}

/**
 * 获取PM10对应的颜色
 * @param value
 * @returns {*}
 */
export function getPM10TargetColor(value) {
    if (!value || value < 0) value = 0;
    value = parseFloat(value)
    if (0 <= value && value <= 50) {
        return '#8CC152'
    } else if (value <= 150) {
        return '#FFCE54'
    } else if (value <= 250) {
        return '#FC6E51'
    } else if (value <= 350) {
        return '#DA4453'
    } else if (value <= 420) {
        return '#5D0098'
    } else {
        return '#8B1F2A'
    }
}

/**
 * 获取Tsp对应的颜色
 * @param value
 * @returns {*}
 */
export function getTspTargetColor(value) {
    if (!value || value < 0) value = 0;
    value = parseFloat(value)
    if (0 <= value && value <= 50) {
        return '#8CC152'
    } else if (value <= 150) {
        return '#FFCE54'
    } else if (value <= 250) {
        return '#FC6E51'
    } else if (value <= 350) {
        return '#DA4453'
    } else if (value <= 420) {
        return '#5D0098'
    } else {
        return '#8B1F2A'
    }
}

/**
 * 获取环境监测数值对应的颜色
 * @param value
 * @returns {*}
 */
export function getAirTargetColorByLevel(value) {
    value = parseFloat(value)
    switch (value){
        case 1:
            return '#8CC152'
        case 2:
            return '#FFCE54'
        case 3:
            return '#FC6E51'
        case 4:
            return '#DA4453'
        case 5:
            return '#5D0098'
        case 6:
            return '#8B1F2A'
        default:
            return '#FFFFFF'
    }
}

/**
 * 获取环境监测数值对应的颜色
 * @param value
 * @returns {*}
 */
export function getNoiseTargetColor(value) {
    if (!value || value < 0) value = 0;
    value = parseFloat(value)
    if (0 <= value && value <= 20) {
        return '#8CC152'
    } else if (value <= 40) {
        return '#FFCE54'
    } else if (value <= 60) {
        return '#FC6E51'
    } else if (value <= 70) {
        return '#DA4453'
    } else if (value <= 90) {
        return '#5D0098'
    } else {
        return '#8B1F2A'
    }
}

/**
 * 获取环境监测数值对应的颜色
 * @param value
 * @returns {*}
 */
export function getNoiseTargetColorByType(value) {
    if (!value || value < 0) value = 0;
    value = parseFloat(value)
    switch (value){
        case 0:
            return '#FFCE54'
        case 1:
        default:
            return '#62AAFC'
    }
}

export function formatTargetValue(value) {
    return value || "--"
}