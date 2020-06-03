"use strict";

/// This file storages some constaints that used in whole project.

const STORAGE_CHECK_UPDATE_TIME_DEFAULT_KEY = "StorageCheckUpdageTimeDefaultKey";
const STORAGE_CHECK_CACHE_DESTINATION_KEY = "shouldCheckIfFilesMovedToDocumentsDir";
const STORAGE_CHECK_FILE_COMPLETENESS_KEY = "StorageCheckFileCompletenessKey";

function STORAGE_CHECK_UPDATE_TIME_ID_KEY(): String {
    if (!global.CompanyConfig || !global.CompanyConfig.CompanyID) {
        return STORAGE_CHECK_UPDATE_TIME_DEFAULT_KEY;
    }

    let id = global.CompanyConfig.CompanyID;
    if (id) {
        return STORAGE_CHECK_UPDATE_TIME_DEFAULT_KEY + id;
    }
    return STORAGE_CHECK_UPDATE_TIME_DEFAULT_KEY;
}

function STORAGE_CHECK_FILE_COMPLETENESS_ID_KEY(): String {
    if (!global.CompanyConfig || !global.CompanyConfig.CompanyID) {
        return STORAGE_CHECK_UPDATE_TIME_DEFAULT_KEY;
    }

    let id = global.CompanyConfig.CompanyID;
    if (id) {
        return STORAGE_CHECK_FILE_COMPLETENESS_KEY + id;
    }
    return STORAGE_CHECK_FILE_COMPLETENESS_KEY;
}

const STORAGE_FILE_DOWNLOAD_LIST_KEY = 'storage-file-download-list-key';
function STORAGE_FILE_DOWNLOAD_LIST_ID_KEY(): String {
    if (!global.AppAuthentication || !global.AppAuthentication.AppCompanyID) {
        return STORAGE_FILE_DOWNLOAD_LIST_KEY;
    }

    let companyID = global.AppAuthentication.AppCompanyID;
    let phone = global.AppAuthentication.LoginName;
    if (companyID && phone) {
        return `${STORAGE_FILE_DOWNLOAD_LIST_KEY}-${companyID}-${phone}`;
    }
    return STORAGE_FILE_DOWNLOAD_LIST_KEY;
}

export default {
    STORAGE_CHECK_UPDATE_TIME_DEFAULT_KEY,
    STORAGE_CHECK_UPDATE_TIME_ID_KEY,
    STORAGE_CHECK_CACHE_DESTINATION_KEY,

    STORAGE_CHECK_FILE_COMPLETENESS_KEY,
    STORAGE_CHECK_FILE_COMPLETENESS_ID_KEY,

    STORAGE_FILE_DOWNLOAD_LIST_KEY,
    STORAGE_FILE_DOWNLOAD_LIST_ID_KEY,

};