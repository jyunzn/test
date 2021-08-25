const KEY = 'tv1-step';

/**
 * @desc 更新 TV1 的步驟到 localstorage 上
 * @param {number} step 
 * @returns 
 */
const update = step => window.localStorage.setItem(KEY, step)

/**
 * @desc 獲取當前 TV1 的步驟
 * @returns {string} {0, 3, 6}
 */
const get = () => window.localStorage.getItem(KEY)


export {
    update,
    get
}