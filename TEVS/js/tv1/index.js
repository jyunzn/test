import { getSetting, updateSetting, connectSocket, getTaskID, getTask, changeId } from './data.js'
import { openTerminal, getTerminalData, updateTerminal } from './terminal.js'
import { update as updateLocalstorage } from '../util/localStorage.js'
import { updateContent } from './section.js'
import { start as startStep } from './step.js'


/**
 * @desc 動畫輪迴
 * @param {object} setting 需要用到的 url
 */
async function animate(setting) {
    // 1. 開始動畫
                await startStep()
    // 2. 交換 ID
    let id =    await changeId(setting.http.changeId.url)
    // 3. 存一下第 0 步數據到 localhost, TV2 可能用到
                      updateLocalstorage(0)
    // 4. 獲取數據
    let data =  await getTask(setting.http.getTask, id)
    // 5. 更新畫面數據
                      updateContent(data)
    // 6. 再來一次
                      animate(setting)
}

/**
 * @desc 啟動
 */
async function main() {
    // 1. 拿設定檔數據
    let setting = await getSetting('/setting.json');
    // 2. 整理一下
        setting = await updateSetting(setting, 'TV1');
    // 3. 連接 socket
    let socket  = await connectSocket(setting.http.shell.url);
    // 4. 啟動終端
                        openTerminal(socket, setting.ws.open_terminal)
    // 5. 獲取終端數據
                        getTerminalData(socket, setting.ws.terminal, updateTerminal)
    // 6. 獲取 ID
    let id      = await getTaskID(setting.http.getID.url)
    // 7. 獲取數據
    let data    = await getTask(setting.http.getTask, id)
    // 8. 記錄一下
                        updateLocalstorage(0)
    // 9. 更新畫面數據
                        updateContent(data)
    // 10. 動畫開始
                        animate(setting)
    
}
main()