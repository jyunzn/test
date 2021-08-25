const eNextArrow = document.querySelectorAll('.next-arrow')
const eNextArrow1 = document.querySelectorAll('.next-arrow1 svg g')
const eNextArrow2 = document.querySelectorAll('.next-arrow2 svg g')


/**
 * @desc 箭頭裡面那個輪流量的東西
 */
let timer = null;
const start = () => {
    let curArrow = -1;
    timer = setInterval(() => {
        curArrow++;

        let lastArrow;
        if (curArrow == 0) {
            lastArrow = eNextArrow1.length - 1;
        } else {
            lastArrow = curArrow - 1
        }

        eNextArrow1[lastArrow].style.opacity = 0.5;
        eNextArrow2[lastArrow].style.opacity = 0.5;
        eNextArrow1[curArrow].style.opacity = 1;
        eNextArrow2[curArrow].style.opacity = 1;
        if (curArrow >= eNextArrow1.length - 1) {
            curArrow = -1
        }
    }, 1000)
}

/**
 * @desc 箭頭移動到哪一個步驟
 * @param {number} step 哪一個步驟
 */
const moveTo = step => {
    eNextArrow.forEach((arrow, index) => arrow.className = `next-arrow next-arrow${index+1} s${step}`)
}

/**
 * @desc 箭頭離開畫面
 */
const leave = () => {
    eNextArrow.forEach((arrow, index) => arrow.className = `next-arrow next-arrow${index+1} end-tran`)
    clearInterval(timer)
    timer = null;
    eNextArrow1.forEach(dom => dom.style.opacity = 0.5)
    eNextArrow2.forEach(dom => dom.style.opacity = 0.5)
}

/**
 * @desc 箭頭位置初始化
 */
const init = () => {
    eNextArrow.forEach((arrow, index) => arrow.className = `next-arrow next-arrow${index+1}`)
}

export {
    moveTo,
    leave,
    init,
    start
}