import { connectSocket, getSetting, getTask, updateSetting } from '../data.js'


/**
 * @desc 獲取 id
 * @param {string} url 
 * @returns {Promise}  等響應回來就帶 id 出去
 */
const getTaskID = url => {

    return new Promise(res => {
        fetch(url)
            .then(function (response) {
                if (response.ok)
                    return response.text();
                else
                    throw new Error('GET TASKID 出事啦')
            })
            .then(function (id) {
                res(id)
            })
    })
}

/**
 * @desc 換個 ID
 * @param {*} url 
 * @returns {Promise} 等響應回來就帶 id 出去
 */
const changeId = url => {
  
    return new Promise(res => {
        fetch(url)
            .then(function (response) {
                if (response.ok)
                    return response.text();
                else
                    throw new Error('CHANGE ID 出事啦')
            })
            .then(function (id) {
                res(id)
            })
    })
}

export { 
    connectSocket,
    getSetting,
    getTask,
    updateSetting,
    getTaskID,
    changeId
}