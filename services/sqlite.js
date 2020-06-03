import SQLiteStorage from 'react-native-sqlite-storage';
import RNFetchBlob from 'react-native-fetch-blob';
import { Platform } from '../node_modules/react-native';
import CompanyAppConfig from '../config/company.app.js';

export default class SQLiteBase {
    GetCompanyID() {
        let authentication = global.AppAuthentication;
        if (authentication) {
            return authid = authentication.AppCompanyID;
        }
        return CompanyAppConfig.CompanyID;
    }

    db = null;
    log(msg) {
        console.log(msg);
    }
    open() {
        if (!this.db) {
            let dbPath = '';
            if (Platform.OS == 'android') {
                dbPath = `${RNFetchBlob.fs.dirs.DocumentDir}/yjj/data2.db`;
                this.db = SQLiteStorage.openDatabase(dbPath, "3.0", "YJJDB", -1, () => {
                    this.log('Open SQLite DB is successful.');
                }, (err) => {
                    this.log("Open SQLite DB was failed.");
                });
            } else if (Platform.OS == 'ios') {
                dbPath = `${RNFetchBlob.fs.dirs.MainBundleDir}/www/data2.db`;

                this.db = SQLiteStorage.openDatabase({ name: "data2.db", createFromLocation: dbPath, location: 'default' }, () => {
                    this.log('Open SQLite DB is successful.');
                }, (err) => {
                    this.log("Open SQLite DB was failed.");
                });
            }
        }
        return this.db;
    }

    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
            this.log("SQLite DB was Closed.");
        }
    }
    createDB(resultHandler) {
        let db = this.open();
        db.transaction((tx) => {
            tx.executeSql("select name from sqlite_master where type='table';", null, (tx, result) => {
                let dataCount = result.rows.length
                let list = [];

                let existsTable = {};
                for (let i = 0; i < dataCount; i++) {
                    let item = result.rows.item(i);
                    let name = new String(item.name).toLocaleLowerCase();
                    // if (name == "datareplicationinfo") {
                    //     return;
                    // }

                    existsTable[name] = true;
                    list.push(item);
                }

                if (typeof (existsTable.productcommon) == 'undefined') {
                    // 创建商品组表
                    tx.executeSql("CREATE TABLE [ProductCommon] (CompanyID  VARCHAR(40) NOT NULL,[SysNo] INT  NULL PRIMARY KEY,[ProductCommonName] VARCHAR(100)  NULL,[CategorySysNo] INT  NULL,"
                        + "[CategoryCode] VARCHAR(64)  NULL,[CategoryName] VARCHAR(50)  NULL,[BrandSysNo] INT  NULL,[SeriesSysNo] INT  NULL,[StyleSysNo] INT  NULL,"
                        + "[BrandName] VARCHAR(50)  NULL,[SeriesName] VARCHAR(50)  NULL,[StyleName] VARCHAR(50)  NULL,[PromotionTitle] VARCHAR(200)  NULL,"
                        + "[DefaultImage] VARCHAR(400)  NULL,[MerchantSysNo] INT  NULL,[GroupProperties] VARCHAR(600)  NULL,[ImageList] varchar(4000)  NULL,"
                        + "[LastReplicationDate] DATETIME  NULL,[IsDownloadImg] INT NULL)", null, null, null);
                }


                if (typeof (existsTable.product) == 'undefined') {
                    // 创建商品表
                    tx.executeSql("CREATE TABLE [Product] (CompanyID  VARCHAR(40) NOT NULL,[SysNo] INT  NULL PRIMARY KEY,[ProductCommonSysNo] INT  NULL,[ProductCommonName] VARCHAR(100)  NULL,"
                        + "[ProductID] VCHAR(20)  NULL,[ProductName] VARCHAR(100)  NULL,[SKUModel] VARCHAR(40)  NULL,[SizeLength] INT  NULL,[SizeWidth] INT  NULL,"
                        + "[SizeHeight] INT  NULL,[Weight] INT  NULL,[ProductNote] VARCHAR(500)  NULL,[DefaultImage] VARCHAR(400)  NULL,[ProductStatus] INT  NULL,"
                        + "[MerchantSysNo] INT  NULL,[CostPrice] NUMERIC  NULL,[RetailPrice] NUMERIC  NULL,SalePrice	NUMERIC	NULL ,PromotionPrice	NUMERIC	NULL,"
                        + "PromotionTitle VARCHAR(200) NULL ,[Priority] INT  NULL,[Material] VARCHAR(100)  NULL,[Stock] INT  NULL,[ProductTag] VARCHAR(20)  NULL,"
                        + "[ProductType] INT NULL,[DeliveryDate] DATETIME  NULL,ProductionCycle INT  NULL,"
                        + "[GroupProperties] VARCHAR(600)  NULL,[ImageList] varchar(4000)  NULL,[ProductList] VARCHAR(1200) NULL,[Properties] varchar(4000)  NULL,[LastReplicationDate] DATETIME  NULL,[IsDownloadImg] INT NULL)"
                        , null, null, null);
                }
                if (typeof (existsTable.productsolution) == 'undefined') {
                    // 创建空间方案表
                    tx.executeSql("CREATE TABLE ProductSolution(CompanyID  VARCHAR(40) NOT NULL,SysNo INT	NULL PRIMARY KEY,Name VARCHAR(100) NULL,DefaultImage VARCHAR(400) NULL,ProductList VARCHAR(1200) NULL,"
                        + "SalePrice	NUMERIC	NULL,SeriesSysNo INT	NULL,SeriesName	VARCHAR(100) NULL,StyleSysNo INT NULL,StyleName	VARCHAR(100) NULL,"
                        + "ImageList	varchar(4000) NULL,Priority	INT,Description	varchar(400) NULL,LastReplicationDate DATETIME NULL,[IsDownloadImg] INT NULL)", null, null, null);
                }
                if (typeof (existsTable.appcontent) == 'undefined') {
                    // 创建内容表
                    tx.executeSql("CREATE TABLE [AppContent] (CompanyID  VARCHAR(40) NOT NULL,[SysNo] INT  NULL PRIMARY KEY,[TopicCategorySysNo] INT  NULL,TopicCategoryName VARCHAR(40) NULL,"
                        + "[Title] VARCHAR(100)  NULL,[SubTitle] VARCHAR(100)  NULL,[DefaultImage] VARCHAR(400)  NULL,[Summary] VARCHAR(400)  NULL,[Content] Text  NULL,"
                        + "[TopicContentType] INT  NULL,[Keywords] VARCHAR(100)  NULL,[Tag] VARCHAR(100)  NULL,[IsRed] INT  NULL,[IsTop] INT  NULL,[PageViews] INT  NULL,"
                        + "[StartTime] DATETIME  NULL,[EndTime] DATETIME  NULL,[TopicStatus] INT  NULL,[FileList] varchar(4000)  NULL,[LastReplicationDate] DATETIME  NULL,PublishDate DATETIME  NULL,[IsDownloadImg] INT NULL)"
                        , null, null, null);
                }
                if (typeof (existsTable.dictionarydata) == 'undefined') {
                    tx.executeSql("CREATE TABLE DictionaryData(CompanyID  VARCHAR(40) NOT NULL,Key VARCHAR(100) NOT NULL,Value varchar(8000),LastReplicationDate DATETIME, PRIMARY KEY (CompanyID,Key))", null, null, null);
                }
                if (typeof (existsTable.datareplicationinfo) == 'undefined') {
                    // 创建数据更新信息表
                    tx.executeSql("CREATE TABLE [DataReplicationInfo] (CompanyID  VARCHAR(40) NOT NULL,[MasterName] VARCHAR(40)  NOT NULL,[LastReplicationDate] DATETIME  NULL,LastSysNo INT NULL,PRIMARY KEY (CompanyID,MasterName));", null,
                        (tx, resule) => {
                            // let drInfoSql = "insert into DataReplicationInfo(MasterName,LastReplicationDate,LastSysNo)values(?,'2010-01-01');";
                            // tx.executeSql(drInfoSql, ['ProductCommon'], null, null);
                            // tx.executeSql(drInfoSql, ['Product'], null, null);
                            // tx.executeSql(drInfoSql, ['ProductSolution'], null, null);
                            // tx.executeSql(drInfoSql, ['Content'], null, null);
                        }, null);
                }
                if (typeof (existsTable.intentionorder) == 'undefined') {
                    //创建意向订单表
                    tx.executeSql("CREATE TABLE IntentionOrder([SysNo] INTEGER  NOT NULL PRIMARY KEY AUTOINCREMENT,[CustomerName] varchar(50) NOT NULL,[CustomerPhone] int NOT NULL," +
                        "[ProvinceName] varchar(20) NULL,[CityName] varchar(20) NULL,[DistrictName] varchar(200) NULL,[ReceiveAddress] varchar(100) NULL,[Floor] int NULL,[HasElevator] bit NULL," +
                        "[CompanyID] varchar(40) NOT NUll,[UserSysNo] INT NOT NULL," +
                        "[Products] varchar(8000) NULL,[EditDate] DATETIME NOT NULL,[InDate] DATETIME NOT NULL)", null, null, null);
                }

            }, null);
        }, (error) => {
            this.log('Create database error:', error);
        }, () => {
            if (resultHandler) {
                resultHandler();
            }
            this.log("The Database was created ;");
        });
    }

    RefreshDBTable(authentication) {
        let AppCompanyID = authentication.AppCompanyID;
        let db = this.open();
        db.transaction((tx) => {
            tx.executeSql("Select Value from DictionaryData Where Key='APPcompanyAuthID'", [], (tx, result) => {
                if (result.rows.length > 0 && result.rows.item(0).Value === AppCompanyID) {
                } else {
                    tx.executeSql("Insert into DictionaryData(Key,Value) Values(?,?);", ['APPcompanyAuthID', AppCompanyID], (tx) => { }, null)
                }
            }, null);
        }, (error) => {
            this.log('Transaction  error:', error);
        }, () => {
        })
    }
}