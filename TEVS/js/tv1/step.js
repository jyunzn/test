import { 
    moveTo as ARROW_Moveto, 
    leave  as ARROW_Leave,
    start  as ARROW_Start,
    init   as ARROW_Init
} from './arrow.js'
import { update as LS_Update } from '../util/localStorage.js'
import { oRet } from './ret.js'


const eSections = document.querySelectorAll('.section');
const eVideos = document.querySelectorAll('video');


// 進來的時間
const nSecondGoInTran    = 2500
// 進來的 DELAY 時間 (要等前面的走一下子才進)
const nSecondGoInDelay   = 1000
// 離去的時間
const nSecondGoOutTran   = 3000
// 第四步的每次移動電梯的時間
const nSecondElevator    = 16
// 最後小旗子回到原位的時間
const nSecondFlagRest    = 2500


/**
 * @desc 每一個步驟的開始
 * @param {Dom} dom 
 * @returns {Promise} 
 */
const goIn = dom =>  {
    dom.classList.add('start-tran')

    return new Promise(res => {
        setTimeout(() => {
            dom.classList.add('cur');
            dom.classList.remove('start-tran');
            dom.classList.remove('start');
            res()
        }, nSecondGoInTran)
    })
    
}


/**
 * @desc 播影片
 * @param {DOM} dom 
 * @returns {Promise} 播完返回
 */
const playVedio = dom => {

    return new Promise(res => {
        dom.play()
        dom.onended = () => {
            res()
            dom.onended = null;
        }
    })
}


/**
 * @desc 每一步地離開動畫
 * @param {Number} index 
 * @param {Bool} isLast   // 是不是第五步, 是的話要等完整走完的時間
 * @returns 
 */
const goOut = (index, isLast = false) => {
    const eSection = eSections[index]
    const eVedio   = eVideos[index]
    eSection.classList.add('end-tran');


    setTimeout(() => {
        eSection.classList.remove('cur');
        eSection.classList.remove('end-tran');
        eSection.classList.add('end');
        eVedio.currentTime = 0;
    }, nSecondGoOutTran)


    const second = isLast ? nSecondGoOutTran : nSecondGoInDelay
    return new Promise(res => {
        setTimeout(() => {
            res()
        }, second)
    })
}


/**
 * @desc 第四步的文字搭電梯
 * @param {DOM} dom 
 * @returns {Promise} 搭完電梯返回
 */
const elevator = dom => {
    // 外殼
    const eContent          = dom.querySelector('.content')
    // 電梯本人
    const eContentContriner = dom.querySelector('.content .content-container')
    // 外殼高度
    const eContentHeight          = eContent.offsetHeight
    // 電梯高度
    const eContentContrinerHeight = eContentContriner.offsetHeight
    // 總共可以搭多少
    const calc = eContentContrinerHeight - eContentHeight;


    return new Promise(res => {

        if (calc > 0) {
            let offset = 0;
            let timer = setInterval(() => {
                offset--
                eContentContriner.style.transform = `translateY(${offset}px)`
                if (calc + offset <= 0) {
                    clearInterval(timer)
                    res()
                }
            }, nSecondElevator)
        } else {
            res()
        }
        
    })
}


/**
 * @desc  重置電梯高度
 * @param {Number}} index 
 */
const resetElevator = index => {
    const eContentContriner = eSections[index].querySelector('.content .content-container')
    eContentContriner.style.transform = '';
}

/**
 * @desc 重置小旗子的動畫的預備樣式
 * @returns { Promise } 觸發 reflow 後的下一幀返回
 */
const initStepPrepare = () => {
    eSections.forEach(dom => {
        dom.classList.add('end-start')
        dom.classList.remove('end');
    })

    // 觸發 reflow
    // window.offsetHeight

    // 下一幀返回
    return new Promise(res => {
        requestAnimationFrame(() => {
            res()
        })
    })
}

/**
 * @desc 小旗子回到原位
 * @returns {Promise} 回到原位後返回
 */
const initStepEndTran = () => {
    eSections.forEach(dom => {
        dom.classList.add('end-start-tran')
    })
    return new Promise(res => {
        setTimeout(() => {
            
            res()
        }, nSecondFlagRest)
    })
    
}

/**
 * @desc 動畫收尾
 */
const initStepFinal = () => {

    eSections.forEach(dom => {
        dom.classList.remove('end-start')
        dom.classList.remove('end-start-tran')
        dom.classList.add('start');
    })
    
}

const initStep = async () => {
    
    await initStepPrepare();
    await initStepEndTran();
          initStepFinal();

}


const step1 = () => {
    
    return new Promise(async res => {
        ARROW_Moveto(1)
        await goIn(eSections[0])
        
        await playVedio(eVideos[0])
        res()
    })
}

const step2 = () => {
    
    return new Promise(async res => {
        await goOut(0)
        ARROW_Moveto(2)
        await goIn(eSections[1])
        await playVedio(eVideos[1])
        res()
    })
}

const step3 = () => {
    LS_Update(3)
    return new Promise(async res => {
        await goOut(1)
        ARROW_Moveto(3)
        await goIn(eSections[2])
        await playVedio(eVideos[2])
        res()
    })
}

const step4 = () => {
    
    return new Promise(async res => {
        await goOut(2)
        ARROW_Moveto(4)
        await goIn(eSections[3])
        await Promise.all([playVedio(eVideos[3]), elevator(eSections[3])]);
        res()
    })
}

const step5 = () => {
    
    return new Promise(async res => {
        await goOut(3)
        
        ARROW_Moveto(5)
        await goIn(eSections[4])
        await playVedio(eVideos[4])
        res()
    })
}

const step6 = () => {
    
    return new Promise(async res => {
        ARROW_Leave()
        await goOut(4, true)
        LS_Update(6)
        await oRet.start()
        await initStep()
        ARROW_Init()
        resetElevator(3)
        res()
    })
}




/**
 * @desc 啟動動畫流程
 */
const start = async () => {
    ARROW_Start()
    await step1()
    await step2()
    await step3()
    await step4()
    await step5()
    await step6()
}

export {
    start
}