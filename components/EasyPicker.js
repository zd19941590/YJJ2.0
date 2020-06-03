import {
    AppRegistry,
    StyleSheet,
    Text,
    TextInput,
    Image,
    ImageBackground,
    View,
} from 'react-native';
import PurchaseService from '../services/purchase.js';
import EasyPicker from 'react-native-picker';

export default class DatePicker {
    constructor() {
        this.IsInit = false;
    }

    initSelectData() {
        var currentYear = new Date().getFullYear();
        var minYear = currentYear - 20;
        var maxYear = currentYear + 5;

        let date = [];
        for (let i = minYear; i < maxYear; i++) {
            let month = [];
            for (let j = 1; j < 13; j++) {
                let day = [];
                if (j === 2) {
                    for (let k = 1; k < 29; k++) {
                        day.push(k + '日');
                    }
                    //Leap day for years that are divisible by 4, such as 2000, 2004
                    if (i % 4 === 0) {
                        day.push(29 + '日');
                    }
                }
                else if (j in { 1: 1, 3: 1, 5: 1, 7: 1, 8: 1, 10: 1, 12: 1 }) {
                    for (let k = 1; k < 32; k++) {
                        day.push(k + '日');
                    }
                }
                else {
                    for (let k = 1; k < 31; k++) {
                        day.push(k + '日');
                    }
                }
                let _month = {};
                _month[j + '月'] = day;
                month.push(_month);
            }
            let _date = {};
            _date[i + '年'] = month;
            date.push(_date);
        }

        return date;
    }

    init(selectedValue, onPickerConfirm, resultHandler, onPickerCancel, pickerTitleText) {
        let thisObj = this;
        let initOption = {
            pickerData: thisObj.initSelectData(),
            pickerConfirmBtnText: '确定',
            pickerCancelBtnText: '取消',
            pickerTitleText: pickerTitleText || '选择日期',
            pickerToolBarFontSize: 16,
            pickerFontSize: 16,
            onPickerConfirm: (pickedValue, pickedIndex) => {
                if (typeof (onPickerConfirm) == 'function') {
                    onPickerConfirm(pickedValue);
                }
            },
            onPickerCancel: (pickedValue, pickedIndex) => {
                if (typeof (onPickerCancel) == 'function') {
                    onPickerCancel();
                }
            },
        };
        if (typeof (selectedValue) == 'object' && selectedValue != null) {
            initOption["selectedValue"] = selectedValue;
        }

        EasyPicker.init(initOption);
        this.IsInit = true;

        if (typeof (resultHandler) == 'function') {
            resultHandler();
        }
    }

    show() {
        if (this.IsInit) {
            EasyPicker.show();
        }
        else {
            this.init(null, null, () => {
                EasyPicker.show();
            });
        }
    }
    hide() {
        EasyPicker.hide();
    }
}

export function dateTimePicker(onSelected, onConfirm, onCancel) {
    let years = [],
        months = [],
        days = [],
        hours = [],
        minutes = [];

    for (let i = 1; i < 51; i++) {
        years.push(i + 1980);
    }
    for (let i = 1; i < 13; i++) {
        months.push(i);
    }
    for (let i = 1; i < 32; i++) {
        days.push(i);
    }
    for (let i = 0; i < 24; i++) {
        hours.push(i);
    }
    for (let i = 1; i < 61; i++) {
        minutes.push(i);
    }
    let pickerData = [years, months, days, hours, minutes];
    let date = new Date();
    let selectedValue = [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes()
    ];
    EasyPicker.init({
        pickerData,
        selectedValue,
        pickerTitleText: "选择时间",
        wheelFlex: [2, 1, 1, 2, 1, 1],
        pickerConfirmBtnText: '确定',
        pickerCancelBtnText: '取消',
        onPickerConfirm: onConfirm,
        onPickerCancel: onCancel,
        onPickerSelect: pickedValue => {
            let targetValue = [...pickedValue];
            if (parseInt(targetValue[1]) === 2) {
                if (targetValue[0] % 4 === 0 && targetValue[2] > 29) {
                    targetValue[2] = 29;
                }
                else if (targetValue[0] % 4 !== 0 && targetValue[2] > 28) {
                    targetValue[2] = 28;
                }
            }
            else if (targetValue[1] in { 4: 1, 6: 1, 9: 1, 11: 1 } && targetValue[2] > 30) {
                targetValue[2] = 30;

            }
            // forbidden some value such as some 2.29, 4.31, 6.31...
            if (JSON.stringify(targetValue) !== JSON.stringify(pickedValue)) {
                // android will return String all the time，but we put Number into picker at first
                // so we need to convert them to Number again
                targetValue.map((v, k) => {
                    if (k !== 3) {
                        targetValue[k] = parseInt(v);
                    }
                });
                EasyPicker.select(targetValue);
                pickedValue = targetValue;
                onSelected(pickedValue);
            }
        }
    });
    EasyPicker.show();
}

/// Date Picker

type Props = {
    type: string
};

export class DateTimePicker {
    props: Props;

    setup = {
        pickerData: datasource(),
        pickerConfirmBtnText: '确定',
        pickerCancelBtnText: '取消',
        pickerTitleText: '选择日期',
        pickerToolBarFontSize: 16,
        pickerFontSize: 16,
    }


    init() {
        EasyPicker.init(this.setup);
    }

    show() {
        EasyPicker.show();
    }
}

/// MARK: Methods

const date = new Date();
const YEAR_UPPER_LIMIT = 20;
const YEAR_LOWER_LIMIT = 10;



function datasource(): Array {

    let current = date.getFullYear();
    let min = current + YEAR_LOWER_LIMIT;
    let max = current + YEAR_UPPER_LIMIT;

    var datas = [];

    for (let y = min; y <= max; y++) {
        let months = [];
        for (let m = min; m <= getmonths(y); m++) {
            let days = [];
            for (let d = min; d <= getdays(y, m); d++) {
                let hours = [];
                for (let h = min; h <= gethours(); h++) {
                    let minutes = [];
                    for (let i = min; i <= getminutes(); i++) {
                        minutes.push(i + "分");
                    }
                    hours.push({
                        h: minutes
                    });
                }
                days.push({
                    d: hours
                });
            }
            months.push({
                m: days
            })
        }
        datas.push({
            y: months
        })
    }

    return datas;
}

function getyears(min: number, max: number): Array {
    let years = [];

    for (let y = min; y <= max; y++) {
        years.push(y);
    }

    return years;
}

function getmonths(year: number): Array {
    var date = new Date(year, 0, 0);

    let months = [];
    for (let m = 1; m <= date.getDate(); m++) {
        months.push(m);
    }
    return months;
}

function getdays(year: number, month: number): Array {
    var date = new Date(year, month, 0);

    let days = [];
    for (let d = 1; d <= date.getDate(); d++) {
        days.push(d);
    }
    return days;
}

function gethours(): Array {
    let hours = [];

    for (let h = 0; h <= 23; h++) {
        hours.push(m);
    }
    return hours;
}

function getminutes(): Array {
    let minutes = [];

    for (let m = 0; m <= 59; m++) {
        minutes.push(m);
    }
    return minutes;
}

function isLeapYear(year: number): Boolean {

}

function isCommonYear(year: number): Boolean {

}

/// MARK: Area

export class AreaPicker {
    constructor() {
        this.IsInit = false;
    }

    init(selectedValue, onPickerConfirm, resultHandler) {

        let thisObj = this;
        let purchaseService = new PurchaseService();
        purchaseService.getAreaData((areaData) => {

            let initOption = {
                pickerData: areaData,
                // selectedValue: ['四川省', '成都市', '新都区'],
                pickerConfirmBtnText: '确定',
                pickerCancelBtnText: '取消',
                pickerTitleText: '选择省市区',
                onPickerConfirm: pickedValue => {
                    if (typeof (onPickerConfirm) == 'function') {
                        onPickerConfirm(pickedValue);
                    }
                },
            };

            if (typeof (selectedValue) == 'object' && selectedValue != null) {
                initOption["selectedValue"] = selectedValue;
            }

            EasyPicker.init(initOption);

            this.IsInit = true;
            if (typeof (resultHandler) == 'function') {
                resultHandler();
            }
        });
    }

    show() {
        if (this.IsInit) {
            EasyPicker.show();
        } else {
            this.init(null, null, () => {
                EasyPicker.show();
            });
        }
    }
    hide() {
        EasyPicker.hide();
    }
}
