import { 
    getSetting,
    updateSetting,
    connectSocket,
    getTask } from '../data.js';
import {
    update as COUNT_update
} from './count.js'
import {
    update as VIRUS_update
} from './virus.js'
import {
    update as WORD_update
} from './word.js'
import {
    isStart as animateIsStart, 
    start as animateStart
} from './animate.js'


/**
 * @desc 發送 ws
 * @param {io} socket 
 * @param {str} name 
 * @param {obj} data 
 */
const emit = (socket, name, data) => {
    socket.emit(name, data)
}

/**
 * @desc 監聽 ws 事件
 * @param {io} socket 
 * @param {str} name 
 * @param {func} callback 
 */
const listen = (socket, name, callback) => {
    socket.on(name, callback)
}

/**
 * @desc 獲取 id
 * @param {obj} apiData { url, query }
 * @param {number} id getTask 需要的 id
 */
const getTaskId = async (apiData, id) => {
    console.log(id)
    const data = await getTask(apiData, id)
    handleData(data)
    !animateIsStart() && animateStart()
}

/**
 * @desc 處理數據 ( 更新畫面 )
 * @param {object} data 
 */
const handleData = data => {
    console.log(data)
    WORD_update(data.static)
    COUNT_update(data.dashboard)
    VIRUS_update(data.map, data.static.md5)
}


export {
    emit,
    listen,
    getTaskId,
    getSetting,
    updateSetting,
    connectSocket
}