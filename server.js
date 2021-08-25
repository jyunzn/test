const express  = require('express')
const http     = require('http')
const url      = require('url')
let   io       = require('socket.io')
const fs       = require('fs')
const readline = require('readline')

const setting = require('./TEVS/setting.json')

const rsTerminalLog = fs.createReadStream(__dirname + '/tv1_terminal.log')
const dataTerminal = [];
let   dataLoadFininsh = false;
rl = readline.createInterface({
    input: rsTerminalLog,
    crlfDelay: Infinity
})
rl.on('line', line => {
    dataTerminal.push(line)
})
rl.on('close', () => {
    dataLoadFininsh = true;
})


const app = express()
const server = http.createServer(app)
    io = io(server)

const PORT = setting.PORT;
const ioShell   = io.of('/' + setting.TV1.http.shell);
const ioPublish = io.of('/' + setting.TV2.http.publish)


const tv1DataMap = {
    '1': 'TV1-1.json',
    '2': 'TV1-2.json',
    '3': 'TV1-3.json'
}

const tv2DataMap = {
    '1': 'TV2-1.json',
    '2': 'TV2-2.json',
    '3': 'TV2-3.json'
}



// 響應設定黨數據
app.get('/setting', (req, res) => {
    
    res.send(setting)
})



// view
app.get('/:html', (req, res, next) => {
    let filename = __dirname + '/TEVS/view/' + req.params.html;
    if (fs.existsSync(filename)) {
        let rs = fs.createReadStream(filename)
        rs.pipe(res)
    } else {
        next()
    }
})


// 處理 id
let taskId = 1;

app.get('/' + setting.TV1.http.getID, (req, res) => {
    res.send(taskId + '')
})

app.get('/' + setting.TV1.http.changeId, (req, res) => {
    if (taskId == 3) {
        taskId = 0;
    }
    taskId++
    socketPublish && socketPublish.emit(setting.TV2.ws.publish_response, taskId)
    socketPublish && socketPublish.emit(setting.TV2.ws.publish_response, taskId)
    res.send(taskId + '')
})


// 讀數據
app.get('/' + setting.TV1.http.getTask.route, (req, res) => {
    const fileName = tv1DataMap[req.query[setting.TV1.http.getTask.query]]
    res.sendFile(__dirname + '/json/tv1/' + fileName)
})

app.get('/' + setting.TV2.http.getTask.route, (req, res) => {
    const fileName = tv2DataMap[req.query[setting.TV2.http.getTask.query]]
    res.sendFile(__dirname + '/json/tv2/' + fileName)
})



// tv1terminal
let emitLine = 0;
function emitTerminalData(socket) {
    if (!dataLoadFininsh) {
        setTimeout(() => {
            emitTerminalData()
        }, 500)
        return false;
    }
    setInterval(() => {
        if (emitLine == dataTerminal.length - 1) {
            emitLine = 0;
        }

        socket.emit(setting.TV1.ws.terminal, dataTerminal[emitLine])
        emitLine++
    }, 500)
}
ioShell.on('connection', socket => {
    console.log('shell 連接上了')
    socket.on(setting.TV1.ws.open_terminal, data => {
        console.log(data)
        emitTerminalData(socket)
    })

})




// tv2Socket
let socketPublish;
ioPublish.on('connection', socket => {
    socketPublish = socket;

    socket.on(setting.TV2.ws.open_publish, data => {
        console.log(data)
        socket.emit(setting.TV2.ws.publish_response, taskId)
    })

    
})



app.use(express.static('./TEVS'))


// 撿垃圾
app.use('*', (req, res) => {
    console.log(req.url)
    res.sendStatus(404)
})


server.listen(PORT, () => {
    let url = 'http://localhost:' + setting.PORT;
    console.log(`
        tv1: ${url}/tv1.html
        tv2: ${url}/tv2.html
    `)
})