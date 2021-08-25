

const eDataWrapContent = document.querySelector('.data-wrap .content');
const TEMP_LI = `
    <li>
        <p class="title"><span>{{ TITLE }}</span></p>
        <p class="content"><span>{{ CINTENT }}</span></p>
    </li>
`

/**
 * @desc 把 obj 數據轉成 [{ title, content }]
 * @param {obj} data 
 * @returns {arr} [{ title, content }]
 */
const handleData2Arr = data => {

    let arr = []
    for (let key in data) {
        arr.push({ title: key, content: data[key] })
    }

    return arr;
}


/**
 * @desc 產出 HTML 模板
 * @param {obj} eData 
 * @returns {str}
 */
const genHTML = eData => {
    return eData
        .map(data => 
            TEMP_LI
                .replace('{{ TITLE }}',   data.title )
                .replace('{{ CINTENT }}', data.content )
        )
        .join('')
}

/**
 * @desc 更新左上角文字區塊的內容
 * @param {str} sHTML 
 */
const updateDOM = sHTML => {
    eDataWrapContent.innerHTML = sHTML
}


/**
 * @desc 獲取所有小標題
 * @returns {DOM} 所有小標題
 */
const getTitleLis = () => {
    return eDataWrapContent.querySelectorAll('li .title')
}

/**
 * @desc 拿到所有 DOM 中最寬的那個的寬度
 * @param {arr} eDoms 
 * @returns {number}
 */
const getMaxWidth = eDoms => {
    return Math.max(...Array.from(eDoms).map(dom => parseFloat(getComputedStyle(dom).width)))
}

/**
 * @desc 修正所有小標的寬度，大家要一樣寬
 */
const fixDOM = () => {
    const eDataWrapContentLis = getTitleLis();
    const maxwidth            = getMaxWidth(eDataWrapContentLis);
    
    eDataWrapContentLis.forEach(dom => dom.style.minWidth = maxwidth + 'px')
}


/**
 * @desc 更新左上角文字匡的內容
 * @param {obj} data 
 */
const update = data => {
    console.log(data)
    // 1. 處理數據    
    let aData = handleData2Arr(data)
    // 2. 產出模板
    let sHTML = genHTML(aData)

    // 3. 更新畫面
    updateDOM(sHTML)
    // 4. 修正小標
    fixDOM()
    
}


/**
 * @desc 獲取動畫所耗費的時間
 * @param {dom} dom 
 * @returns {number}
 */
const getDomTransitionTime = dom => {
    const styleInfo = getComputedStyle(dom)
    return parseFloat(styleInfo.transitionDelay) + parseFloat(styleInfo.transitionDuration)
}


/**
 * @desc loading 狀態 ( 一堆小條的東西在那邊 )
 */
const loadingIn = () => {
    document.body.className = 'loading-in'
    const allLoadingLine = document.querySelectorAll('.loading-lines-wrap i')
    const time = getDomTransitionTime(allLoadingLine[allLoadingLine.length - 1])
    setTimeout(() => {
        if (document.body.className != 'loading-in') return ;
        document.body.className = 'loading'
        
    }, time * 1000)
    
}


/**
 * @desc 顯示數據
 */
const showData = () => {

    document.body.className = 'loading-out'
    
    const allLoadingLine = document.querySelectorAll('.loading-lines-wrap i')
    const time = getDomTransitionTime(allLoadingLine[allLoadingLine.length - 1])

    setTimeout(() => {
        if (document.body.className != 'loading-out') return ;
        document.body.className = 'show'
    }, time * 1000)
}


/**
 * @desc 顯示數據轉成 loading
 */
const show2Loading = () => {

    document.body.className = ''

    const allSpan = document.querySelectorAll('.data-wrap .content li span')
    let time = 0
    if (allSpan.length !== 0) {
        time = getDomTransitionTime(allSpan[allSpan.length - 1])
    }

    setTimeout(() => {
        if (document.body.className != '') return ;
        loadingIn();
    }, time * 1000)
}

export {
    update,
    loadingIn,
    showData,
    show2Loading
}