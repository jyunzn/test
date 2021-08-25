
import {
    LineChart, 
    CircleChart, 
    PieChart, 
    BarChart, 
    PolyChart
} from './Chart/index.js'
import { Vec2 } from '../util/Vec2.js'



/**
 * @desc String -> Number, 沒東西就補零
 *   因為數據的 value 都是 string, 而且有些可能連數據都沒有, 所以要補一下
 * @param {object} d 
 * @param {array} keys 
 * @returns {object} 初步處理過的數據
 */
const handleDataKV = (d, keys) => {
    let obj = {}
    keys.forEach(k => obj[k] = +(d[k] || 0))
    return obj
}

/**
 * @desc    把 object 數據轉成 [{ name, data }] 的格式
 * @param   {object} data 
 * @returns {array} [{ name, data }]
 */
const handleObjData2Array = data => {
    let arr = [];
    
    for (let k in data) {
        let obj = {}

        obj.name = k
        obj.data = data[k]
        arr.push(obj)
    }

    return arr;
}


// 最大顯示的數據清單數量
const nMaxListLenMalware = 10;
// 超過的話，剩下的那一項要叫啥
const sOverMaxListName = 'other'
/**
 * @desc 處理 malware 數據
 * @param {object} data 
 * @returns {array} [{ name, data }]
 */
const handleDataMalWare = data => {
    let count = 0;
    let newData = {}

    // string -> number
    for (let k in data) {
        newData[k] = +(data[k]) || 0;
        count++;
    }

    // 超過最大可以塞的清單數量
    if (count > nMaxListLenMalware) {
        let arr = [];
        let obj = {};
        for (let k in newData) {
            arr.push({
                name: k,
                data: newData[k]
            })
        }
        // 排序
        arr.sort((a, b) => b.data - a.data)

        // 只留最大量清單少一個的數量
        let others = arr.splice(nMaxListLenMalware - 1);

        // 剩下的加起來用個名字顯示
        arr.push({
            name: sOverMaxListName,
            data: others.reduce((prev, cur) => prev + cur.data, 0)
        })


        return arr
    } else {
        return handleObjData2Array(newData)
    }
}



/**
 * @desc kill_ratio_cpu 跟 kill_trend 多一層，要抽出來處理
 * @param {object} data 
 * @param {array} keys 
 * @returns {array} [{ name, data }]
 */
const handleDataKill = (data, keys) => {
    const obj = {}
    for (let k in data) {
        obj[k] = handleDataKV(data[k], keys)
    }
    return handleObjData2Array(obj);
}


/**
 * @desc 更新數據
 * @param {object} data 
 * @returns {obj} 所有處理過的數據
 */
const updateData = data => {

    const obj = {}
    obj.kill_ratio           = handleDataKV(data.kill_ratio, ['kill', 'pass'])
    obj.kill_ratio_cpu       = handleDataKill(data.kill_ratio_cpu, ['kill', 'pass'])
    
    obj.kill_trend           = handleDataKill(data.kill_trend, ['kill', 'pass'])
    obj.today_malware_graph  = handleDataKV(data.today_malware_graph, ['analyzed', 'total'])
    obj.total_malware_graph  = handleDataKV(data.total_malware_graph, ['analyzed', 'total'])

    
    obj.malware_cpu          = handleDataMalWare(data.malware_cpu)
    obj.malware_distribution = handleDataMalWare(data.malware_distribution)

    return obj
}

/**
 * @desc 把數據畫出來
 * @param {object} 所有處理過的數據 
 */
const draw = ({
    kill_ratio,
    kill_ratio_cpu,
    kill_trend,
    malware_cpu,
    malware_distribution,
    today_malware_graph,
    total_malware_graph
}) => {
    new LineChart({
        ...total_malware_graph,
        select: '#count1', 
        lineColor: [{ offset: 0, color: 'rgba(255,255, 255, .3)' }, { offset: 1, color: 'rgba(255,255, 255, 1)' }],
        bgColor: [{ offset: 0, color: '#06325B' }, { offset: 1, color: '#7653AF' }]
    })

    new LineChart({ 
        ...today_malware_graph, 
        select: '#count2',
        lineColor: [{ offset: 0, color: 'rgba(255,255, 255, .3)' }, { offset: 1, color: 'rgba(255,255, 255, 1)' }],
        bgColor: [{ offset: 0, color: '#7653AF' }, { offset: 1, color: '#06325B' }]
    })


    new CircleChart({ 
        total: kill_ratio.kill + kill_ratio.pass,
        analyzed: kill_ratio.kill,
        select: '#count3', 
        lineColor: {
            x1: r => new Vec2(0, -r),
            x2: r => new Vec2(0, r),
            colors: [{ offset: 0, color: 'rgba(255, 255, 255, 1)' }, { offset: 1, color: 'rgba(255, 255, 255, .3)' }]
        },
        bgColor: {
            x1: r => new Vec2(0, -r),
            x2: r => new Vec2(0, r),
            colors: [{ offset: 0, color: '#7653AF' }, { offset: 1, color: '#001C37' }]
        }
    })


    new PieChart({ 
        datas: malware_distribution,
        select: '#count4', 
    })

    new PieChart({ 
        datas: malware_cpu,
        select: '#count5', 
    })


    new BarChart({
        datas: kill_ratio_cpu,
        select: '#count6'
    })


    new PolyChart({
        datas: kill_trend,
        select: '#count7',
        lineWidth: 3,
        colorKill: '#198383',
        colorNot2Kill: [{ offset: 0, color: '#A192FF' }, { offset: 1, color: '#51D5FF' }],
        yStep: 3,
        yUnit: 50
    })
}



/**
 * @desc 更新圖表畫面
 * @param {object} data 
 */
const update = data => {
    const newData = updateData(data)
    draw(newData)
}

export {
    update
}