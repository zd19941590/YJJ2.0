import SQLiteBase from './sqlite.js';

export default class AppContentService extends SQLiteBase {
    log(msg) {
        console.log(msg);
    }
    constructor(props) {
        super(props);
        this.GetAppContentList_GetSqlText = this.GetAppContentList_GetSqlText.bind(this);
    }
    GetContentDetail(sysNo, resultHandler) {
        let base = this;
        let db = this.open();

        db.transaction((tx) => {
            tx.executeSql("select SysNo,TopicCategorySysNo,Title,SubTitle,DefaultImage,Summary,Content,TopicContentType,Keywords,Tag,IsRed,IsTop,PageViews,StartTime,EndTime,TopicStatus,FileList,LastReplicationDate,PublishDate"
                + " from  AppContent where SysNo= " + sysNo + ";", null, (tx, result) => {
                    if (result != null && result.rows != null && result.rows.item.length > 0) {
                        let info = result.rows.item(0);
                        info.FileList = JSON.parse(info.FileList);
                        resultHandler(info);
                    }
                }, (err) => {
                    //     console.log(err);
                });
        }, (error) => {
            //   console.log('Transaction Error', error);
        }, () => {
        });
    }

    GetAppContentList(startNo, pageSize, searchText, categorySysNo, resultHandler) {
        let base = this;
        let db = this.open();
        db.transaction((tx) => {
            tx.executeSql(base.GetAppContentList_GetSqlText(startNo, pageSize, searchText, categorySysNo), null, (tx, result) => {
                if (result != null) {
                    var data = base.ResultToArray(result);
                    if (data != null && data.length > 0) {
                        for (let i = 0; i < data.length; i++) {
                            data[i].FileList = JSON.parse(data[i].FileList);
                        }
                    }
                    resultHandler(data);
                }

            }, (err) => {
                //   console.log(err);
            });
        }, (error) => {
            //  console.log('Transaction Error', error);
        }, () => {
        });
    }
    GetAppContentList_GetSqlText(startNo, pageSize, searchText, categorySysNo) {
        var sqlText = "select SysNo,TopicCategorySysNo,Title,SubTitle,DefaultImage,Summary,Content,TopicContentType,Keywords,Tag,IsRed,IsTop,PageViews,StartTime,EndTime,TopicStatus,FileList,LastReplicationDate,PublishDate"
            + " from appcontent where companyId='" + this.GetCompanyID() + "'";
        if (categorySysNo != null && categorySysNo != "0" && categorySysNo != ""
            && searchText != null && searchText != "" && sqlText != "") {
            sqlText += " and TopicCategorySysNo= " + categorySysNo + " and Title like '%" + searchText + "%'";
        } else if (categorySysNo == null || categorySysNo == "0" == categorySysNo == ""
            && searchText != null && searchText != "" && sqlText != "") {
            sqlText += " and Title like '%" + searchText + "%'";
        } else if (categorySysNo != null && categorySysNo != "0" && categorySysNo != ""
            && searchText == null || searchText == "" || sqlText == "") {
            sqlText += " and TopicCategorySysNo= " + categorySysNo;
        }

        sqlText += " order by ifnull(IsTop,99999999),ifnull(Priority,999999) asc,starttime desc limit " + startNo + "," + pageSize + ";";
        return sqlText;
    }
    ResultToArray(result) {
        var datas = [];
        for (var i = 0; i < result.rows.length; i++) {
            datas.push(result.rows.item(i));
        }
        return datas;
    }
}