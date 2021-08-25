import { get as getTV1Step } from '../util/localStorage.js'
import { zoomIn, zoomOut } from './virus.js'
import { loadingIn, showData, show2Loading } from './word.js'

let animateIsStart = false
let tv2Step = null;
let tikTimer = null;


const step3 = () => {
    showData()
    zoomIn()
}

const step6 = () => {
    show2Loading()
    zoomOut()
}

/**
 * @desc 查看動畫是否啟動了
 * @returns {Bool}
 */
const isStart = () => {
    return animateIsStart
}


/**
 * @desc 處理動畫
 * @param {index} step TV1 當前的步驟
 * @returns {undefined}
 */
const handleAnimate = step => {
    if (tv2Step == step) return void 0;

    // 當步驟改變時才走下一步，TV2 只有在 STEP 3 跟 6 有動畫效果
    if (step == 3) {
        step3()
    } else if (step == 6) {
        step6()
    }
    tv2Step = step
}

/**
 * @desc 動畫初始化
 *   由於打開 TV2 時，TV1 可能在任何步驟中運行著
 *   所以抽出來特別判斷一下，不過只有操作左上角的文字，
 *   因為操作病毒動畫比較貴，避免病毒馬上 zoomin 就 zoomout 之類的
 */
const init = () => {

    const step = getTV1Step();
    if (step == 0) {
        loadingIn()
    } else if (step == 3) {
        document.body.className = 'show'
    } else if (step == 6) {
        loadingIn()
    }
    tv2Step = step
}


/**
 * @desc  動畫開啟
 * @returns {undefined}
 */
const tik = () => {

    if (tikTimer !== null) return void 0;
    tikTimer = setInterval(() => {
        const step = getTV1Step();
        handleAnimate(+step)
    }, 500)
}


/**
 * @desc 開始動畫
 */
const start = async () => {

    animateIsStart = true
    init()
    tik()
}

export {
    isStart,
    start
}