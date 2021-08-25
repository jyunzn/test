const oConsole = document.querySelector('.console .console-content')


/**
 * @desc 更新終端內容
 * @param {object} data 
 */
const updateTerminal = data => {
    const oP = document.createElement('p')
    oP.textContent = data
    oConsole.appendChild(oP)

    if (oConsole.scrollHeight > oConsole.offsetHeight) {
        oConsole.removeChild(oConsole.children[0])
    }
}

/**
 * @desc 監聽接收終端數據的 socket event
 * @param {io} socket 
 * @param {str} eventName 
 * @param {func} callback 
 */
const getTerminalData = (socket, eventName, callback) => {
    socket.on(eventName, data => {
        callback(data)
    })
}


/**
 * @desc 告訴 server 可以傳數據來了
 * @param {io} socket 
 * @param {str} eventName 
 */
const openTerminal = (socket, eventName) => {
    socket.emit(eventName, { 'data': 'I\'m connected!' });
}


export {
    updateTerminal,
    openTerminal,
    getTerminalData
}