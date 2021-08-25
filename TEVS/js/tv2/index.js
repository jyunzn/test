import '../../graph/panasonic-graph.umd.js';
import { getSetting, updateSetting, connectSocket, emit, listen, getTaskId } from './data.js';
import {
    throttle
} from '../util/comman.js'

/**
 * @desc 啟動
 */
const main = async () => {
    let setting = await getSetting('/setting.json');
        setting = await updateSetting(setting, 'TV2');
    let socket  = await connectSocket(setting.http.publish.url);


    // 1. 告訴 SERVER 可以開始了
    emit(socket, setting.ws.open_publish, { 'data': 'I\'m connected!' })
    // 2. 收數據
    listen(
        socket, 
        setting.ws.publish_response, 
        // getTaskId.bind(null, setting.http.getTask)
        throttle(getTaskId.bind(null, setting.http.getTask), 3000) 
            // 因為在交換 ID 的時候，他會一次發好幾次 id 過來 TV2，所以這裡弄個防抖
    )
}

main()