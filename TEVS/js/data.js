import { isString, isObject } from './util/comman.js'

/**
 * @desc 獲取設定檔
 * @param {str} url 
 * @returns {promise} 拿到就返回
 */
const getSetting = url => {
    return new Promise((res, rej) => {
        fetch(url)
            .then(ret => {
                if (ret.ok)
                    return ret.json()
                else
                    throw new Error('GET SETTING 出事啦')
            })
            .then(ret => {
                res(ret)
            })
    })
}

/**
 * @desc 處理一下設定黨數據
 * @param {obj} json 
 * @param {str} tvNumber 
 * @returns {obj}
 */
const updateSetting = (json, tvNumber) => {
    let http = json[tvNumber].http;
    let ws   = json[tvNumber].ws;
    let setting = {};

    // 先把路徑組起來，後面比較方便
    let httpTemp = {};
    for (let k in http) {
        let obj     = {}
        let apiData = http[k];
        if (isString(apiData)) {
            obj.url   = `${json.URL}:${json.PORT}/${apiData}`;
            obj.query = null
        } else if (isObject(apiData)) {
            obj.url    = `${json.URL}:${json.PORT}/${apiData.route}`;
            obj.query  = apiData.query;
        } else {
            console.error('收到一些奇怪的數據啦')
        }
        httpTemp[k] = obj
    }
    setting.http = httpTemp;
    setting.ws   = ws;
    return setting
}


/**
 * @desc 連接 socket
 * @param {str} url 
 * @returns {Promise} 連接上就返回
 */
const connectSocket = url => {
    let socket = io.connect(url);
    return new Promise((res, rej) => {
        socket.on("connect", data => {
            res(socket)
        });
    })
}


/**
 * @desc 獲取數據
 * @param {obj} apiData api 需要的東西 { url, query }
 * @param {number} id 
 * @returns {promise} 拿到就返回
 */
const getTask = (apiData, id) => {
    const { url, query } = apiData;
    const path = `${url}?${query}=${id}`
    
    return new Promise((res, ret) => {
        fetch(path)
            .then(function (response) {
                if (response.ok)
                    return response.json();
                else
                    throw new Error('GET TASK 出事啦')
            })
            .then(function (data) {
                res(data)
            });
    })
}

export {
    getSetting,
    updateSetting,
    connectSocket,
    getTask
}