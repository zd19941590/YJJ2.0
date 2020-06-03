import SQLiteBase from './sqlite.js';

export default class VersionUpdateService extends SQLiteBase {
    log(msg) {
        console.log(msg);
    }
    AddAppContentColumn(resultHandler, errorHandler){
        let self = this;
        let db = this.open();
        var sqlText = "select name from sqlite_master where type='table' and name='AppContent'  and sql not like '%[Priority]%';";
        db.transaction((tx)=>{
            tx.executeSql(sqlText, null, (tx, result) => {
                if (result.rows.length > 0) {
                    //sqllite不支持一次添加多个字段
                    var sql1 = "alter table  AppContent ADD COLUMN [Priority] INT NULL;";
                    var sql2 = "DELETE FROM AppContent ;";
                    var sql3 = "DELETE FROM DataReplicationInfo WHERE MasterName='Content';";
                    tx.executeSql(sql1, null, (tx, dropResult) => {
                        tx.executeSql(sql2, null, (tx2, dropResult3) => { });
                        tx.executeSql(sql3, null, (tx3, dropResult3) => { });
                     });
                    if (resultHandler) {
                        resultHandler();
                    }
                } else {
                    if (resultHandler) {
                        resultHandler();
                    }
                }
            }, (err) => {
                // console.log(err);
            });
        });
    }
    //添加Product表ProductType,DeliveryDate字段
    AddProductColumn(resultHandler, errorHandler) {
        let self = this;
        let db = this.open();
        var sqlText = "select name from sqlite_master where type='table' and name='Product'  and sql not like '%[DeliveryDate]%';";
        db.transaction((tx) => {
            tx.executeSql(sqlText, null, (tx, result) => {
                if (result.rows.length > 0) {
                    //sqllite不支持一次添加多个字段
                    var sql1 = "alter table  Product ADD COLUMN [ProductType] INT NULL;";
                    var sql2 = "alter table  Product ADD COLUMN [DeliveryDate] datetime NULL;";
                    var sql3 = "alter table  Product ADD COLUMN [ProductionCycle] INT NULL;";
                    tx.executeSql(sql1, null, (tx, dropResult) => { });
                    tx.executeSql(sql2, null, (tx, dropResult) => { });
                    tx.executeSql(sql3, null, (tx, dropResult) => { });

                    if (resultHandler) {
                        resultHandler();
                    }

                } else {
                    if (resultHandler) {
                        resultHandler();
                    }
                }
            }, (err) => {
                // console.log(err);
            });
        }, (error) => {
            // console.log('Transaction Error:', error);
            if (errorHandler) {
                errorHandler();
            }
        }, () => {
            if (resultHandler) {
                resultHandler();
            }
        });
    }

    checkLoginUser(olduserinfo, newuserinfo) {
        let db = this.open();
        db.transaction((tx) => {
            var sqlstr = "select value from DictionaryData where Key='DistributorSysNoKey' and CompanyID=\'" + newuserinfo.AppCompanyID + "\'";
            tx.executeSql(sqlstr, null, (tx, result) => {
                if (result.rows.length === 0) {
                    var updatastr = "insert or replace into DictionaryData(CompanyID,Key,Value) values(?,?,?)";
                    //替换 经销商sysno
                    tx.executeSql(updatastr, data, (tx, result) => {
                    }), (error) => { console.log(error) };
                    return;
                }
                if (result.rows.item(0).Value !== olduserinfo.DistributorSysNo.toString()) {
                    var updatastr = "insert or replace into DictionaryData(CompanyID,Key,Value) values(?,?,?)";
                    var data = [olduserinfo.AppCompanyID, 'DistributorSysNoKey', olduserinfo.DistributorSysNo];
                    //替换 经销商sysno
                    tx.executeSql(updatastr, data, (tx, result) => {
                    }), (error) => { console.log(error) };

                    //删除满足条件的上一个生厂商数据
                    var deleteproductsql = "delete from product where CompanyID=\'" + olduserinfo.AppCompanyID + "\'";
                    var deletedatareplicationsql = "delete from datareplicationinfo where CompanyID=\'" + olduserinfo.AppCompanyID + "\' and MasterName='Product'";
                    var exsql = deleteproductsql + ";" + deletedatareplicationsql;
                    tx.executeSql(deleteproductsql, null, (tx, result) => {
                    }), (error) => { console.log(error) };
                    tx.executeSql(deletedatareplicationsql, null, (tx, result) => {
                    }), (error) => { console.log(error) };
                }
            }, (error) => { console.log(error) })
        });
    };
}