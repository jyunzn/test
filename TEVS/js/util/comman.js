/*
    * @desc    判斷數據是不是 string
    * @param   {any} data
    * @returns {boolean}
*/
const isString = data => {
    return Object.prototype.toString.call(data) === '[object String]'
}

/*
 * @desc    判斷數據是不是 object
 * @param   {any} data
 * @returns {boolean}
*/
const isObject = data => {
    return Object.prototype.toString.call(data) === '[object Object]'
}


/*
 * @desc    判斷數據是不是 Array
 * @param   {any} data
 * @returns {boolean}
*/
const isArray = data => {
    return Object.prototype.toString.call(data) === '[object Array]'
}

/*
 * @desc    array || object 跑 for
 * @param   {array, object} data
 * @param   {func}          callback
 * @returns {undefined}
*/
const forEach = (data, callback) => {
    if (isArray(data)) {
        Array.prototype.forEach.call(data, callback);
        return ;
    }
    if (isObject(data)) {
        for (let key in data) {
            callback(data[key], key)
        }
        return void 0;
    }
}

/**
 * @desc 映射數字區間
 * @param {number} number 
 * @param {number} smax 
 * @param {number} smin 
 * @param {number} tmax 
 * @param {number} tmin 
 * @returns {number}
 */
const nMap = (number, smax, smin, tmax, tmin) => {
    return (number - smin) * (tmax - tmin) / (smax - smin) + tmin
}


/**
 * @desc 防抖
 * @param {func} callback 
 * @param {number} interval  毫秒
 * @returns {func} 閉包 func，裝上次呼叫函式時的秒數
 */
const throttle = (callback, interval) => {
    let lastExecteTime
    return function () {
        const context = this
        const args = Array.from(arguments)
        const currectTime = Date.now()
        if (lastExecteTime) {
            if (currectTime - lastExecteTime >= interval) {
                callback.apply(context, args)
                lastExecteTime = currectTime
            }
        } else {
            callback.apply(context, args)
            lastExecteTime = currectTime
        }
    }
}

export {
    isString,
    isObject,
    isArray,
    forEach,
    nMap,
    throttle
}