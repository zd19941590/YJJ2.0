import SQLiteBase from './sqlite.js';
const storage = global.storage;
export default class DictionaryService extends SQLiteBase {

    log(msg) {
        console.log(msg);
    }

    constructor(props) {
        super(props);
        this.GetSearchConditionDataFromDb = this.GetSearchConditionDataFromDb.bind(this);
    }
    async GetTopLevelCateGorys() {
        let data = null;
        await this.GetCategorys().then((result) => {
            data = result;

        });
        return data;
    }

    GetSearchConditionData(resultHandler) {
        let thisObj = this;

        this.loadSearchConditionStorage().then((searchConditionStorage) => {
            if (!searchConditionStorage.Styles && !searchConditionStorage.Series && !searchConditionStorage.Categorys && !searchConditionStorage.ProductTag) {
                thisObj.GetSearchConditionDataFromDb((datafromdb) => {
                    thisObj.saveConditionDbDataToStorage(datafromdb);
                    resultHandler(datafromdb);
                });
            } else {
                resultHandler(searchConditionStorage);
            }
        });
    }

    resetModelData(dataRows) {
        var data = {
            Styles: null,
            Series: null,
            Categorys: null,
            ProductTag: null,
        };

        if (dataRows != null && dataRows.length > 0) {
            for (var i = 0; i < dataRows.length; i++) {
                var item = dataRows[i];
                if (item.Key == 'Styles') {
                    if (item.Value != null) {
                        data.Styles = JSON.parse(item.Value);
                    }
                }
                if (item.Key == 'Series') {
                    if (item.Value != null) {
                        data.Series = JSON.parse(item.Value);
                    }
                }
                if (item.Key == 'Categorys') {
                    if (item.Value != null) {
                        data.Categorys = JSON.parse(item.Value);
                    }
                }
                if (item.Key == 'ProductTag') {
                    if (item.Value != null) {
                        data.ProductTag = JSON.parse(item.Value);
                    }
                }
            }

        }

        return data;
    }

    //将风格系列标签分类存到缓存
    saveConditionDbDataToStorage(datafromdb) {
        let expires = (1000 * 3600 * 24) * 1 * 1;
        storage.save({
            key: 'Styles',
            data: datafromdb.Styles,
            expires: expires
        });

        storage.save({
            key: 'Series',
            data: datafromdb.Series,
            expires: expires
        });

        storage.save({
            key: 'Categorys',
            data: datafromdb.Categorys,
            expires: expires
        });
        storage.save({
            key: 'ProductTag',
            data: datafromdb.ProductTag,
            expires: expires
        });
    }

    //从数据库读取风格系列分类
    GetSearchConditionDataFromDb(resultHandler) {
        let db = this.open();
        let self = this;

        db.transaction((tx) => {
            tx.executeSql("select * from dictionarydata where companyId='" + self.GetCompanyID() + "' and ( key='Styles' or key='Series' or key='Categorys' or key='ProductTag' ) ", null, (tx, result) => {
                var data = {
                    Styles: null,
                    Series: null,
                    Categorys: null,
                    ProductTag: null,
                };
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        var item = result.rows.item(i);
                        if (item.Key == 'Styles') {
                            if (item.Value != null) {
                                data.Styles = JSON.parse(item.Value);
                            }
                        }
                        if (item.Key == 'Series') {
                            if (item.Value != null) {
                                data.Series = JSON.parse(item.Value);
                            }
                        }
                        if (item.Key == 'Categorys') {
                            if (item.Value != null) {
                                data.Categorys = JSON.parse(item.Value);
                            }
                        }
                        if (item.Key == 'ProductTag') {
                            if (item.Value != null) {
                                data.ProductTag = JSON.parse(item.Value);
                            }
                        }
                    }

                }
                resultHandler(data)
            }, (err) => {
                console.log(err);
            });
        }, (error) => {
            console.log('Transaction Error:', error);
        }, () => {
        });
    }

    async loadFromStorage(key) {
        let data = null;
        await global.storage.load({
            key: key,
            autoSync: false,
        }).then(result => {
            data = result;

        }).catch(err => {
            switch (err.name) {
                case 'NotFoundError':
                    break;
                case 'ExpiredError':
                    break;
            }
        });

        return data;
    }

    //从缓存读取风格系列分类
    async loadSearchConditionStorage() {
        let styles = await this.loadFromStorage('Styles');
        let series = await this.loadFromStorage('Series');
        let categorys = await this.loadFromStorage('Categorys');
        let ProductTag = await this.loadFromStorage('ProductTag');

        return { Styles: styles, Series: series, Categorys: categorys, ProductTag: ProductTag };
    }
}