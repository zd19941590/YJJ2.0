import { Platform } from "react-native";
import RNFetchBlob from "react-native-fetch-blob"
var RNFS = require("react-native-fs");

type BooleanResultBlock = (result: {
    result?: Boolean,
    error?: Error,
}) => void;

export async function completioness(fromPath: String, realPath: String): Bool {
    let name = fileNameFromPath(fromPath);
    let md5Name = fileNameFromPath(realPath);
    if (!name)
        return flase;
    return await RNFS.hash(fromPath, "md5")
        .then((hash) => {
            return hash === md5Name;
        })
        .catch((error) => {
            return false;
        })
}

export async function compareMd5(fromPath: String, realPath: String, origin: Bool, md5: String): Bool {
    if (origin) {
        let name = fileNameFromPath(fromPath);
        let md5Name = fileNameFromPath(realPath);
        if (!name)
            return flase;
        return await RNFS.hash(fromPath, "md5")
            .then((hash) => {
                return hash === md5Name;
            })
            .catch((_) => {
                return false;
            })
    } else {
        return await RNFS.hash(fromPath, "md5")
            .then((hash) => {
                return hash === md5;
            })
            .catch((_) => {
                return false;
            })
    }
}

export async function md5Valid(path: String, md5: String, hut: Bool, callback: BooleanResultBlock) {
    let result = null;

    if (!path || !path.length) {
        return;
    }

    if (hut) {
        let _md5 = fileNameFromPath(path);
        return await RNFS.hash(path, 'md5')
            .then((hash) => {
                callback((hash === _md5), null);
            })
            .catch((error) => {
                callback(result, error);
            })
    } else {
        return await RNFS.hash(path, 'md5')
            .then((hash) => {
                callback((hash === md5), null);
            })
            .catch((error) => {
                callback(result, error);
            })
    }
}

export function fileFromPath(path: String): String {
    if (!path) {
        return "";
    }
    return path.split("/").pop();
}

export function md5StringFromPath(path: String): String {
    let name = path.split("/").pop();
    let md5 = name.split(".").shift();
    return md5;
}

function md5Charactors(file: String): String {
    if (!file) return null;

    let maybeHash: String = file.split("/")[-1];

    if (maybeHash.match("^[a-fA-F0-9]{32}$")) {
        return maybeHash;
    }
    return null;
}

function fileNameFromPath(path: String): String {
    let file = path.split("/").pop();
    return file.split('.').shift();
}

function equal(hash: String, name: String): Boolean {
    let file = name.split(".")[0];
    return hash === file;
}

/// 数组去重方法，参数：需要去重的数组
export function unique(array) {
    var obj = {};
    return array.filter(function (item, index, array) {
        return obj.hasOwnProperty(typeof item + JSON.stringify(item)) ? false : (obj[typeof item + JSON.stringify(item)] = true)
    })
}
