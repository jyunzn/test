import { isObject, isArray, forEach } from '../util/comman.js'
import { oRet } from './ret.js'



const eSection = document.querySelectorAll('.section')


// 映射每個 SECTION 的數據 key
const oContentMap = {
    0: '1_hunting',
    1: '2_environment',
    2: '3_static',
    3: '4_dynamic',
    4: '5_evaluation',
    5: '6_result'
}

// SECTION4 的 icon 檔名
const oIconMap = {
    AGENT_IN_STRING: "agent_in_string",
    BUSYBOX_IN_STRING: "busybox_in_string",
    COMMAND_IN_STRING: "command_in_string",
    CREATE_HIDDEN_FILE: "create_hidden_file",
    CRYPTO: "crypto",
    DELETE_SELF: "delete_self",
    DIRECT_CONNECT_NO_DNS: "direct_connect_no_dns",
    DNS_LOOKUP: "dns_lookup",
    DOWNLOAD_FILE: "download_file",
    ENUMRATE_PROC: "enumrate_proc",
    HTTP_DOWNLOAD: "http_download",
    HTTP_DOWNLOAD_FAIL: "http_download_fail",
    HTTP_NO_USER_AGENT: "http_no_user_agent",
    IP_SCAN: "ip_scan",
    KILL_PROCESS: "kill_process",
    LISTEN_PORT: "listen_port",
    MULTI_PLATFORM: "multi_platform",
    OPEN_PROC_NET: "open_proc_net",
    PACK_UPX: "pack_upx",
    PORT_SCAN: "port_scan",
    STRIPPED_BINARY: "stripped_binary",
    SYMBOL_CONTAIN_PATH: "symbol_contain_path",
    TOYBOX_IN_STRING: "toybox_in_string",
    URL_IN_MEM: "url_in_mem",
    USE_HTTPS: "use_https",
    USE_NON_STANDARD_PORT: "use_non_standard_port",
    DEFAULT: "tag"
}

// SECTION1,2,3,5 的模板
const tempStep4Wrap = `
    <div class="content-container">
        {{ items }}
    </div>
`;

// SECTION4 的模板
const tempStep4Item = `
    <div class="content-each-container">
        <div class="img-wrap">
            <img src="./images/tv1/tag_icons/{{ iconFile }}.svg" alt="">
        </div>
        <div class="text-wrap">
            <h3>{{ title }}</h3>
            <p>{{ content }}</p>
        </div>
    </div>
`;

const tempStepItem = `
    <p>
        <span class="ret-title">{{ title }}</span>
        <span class="ret-info">{{ content }}</span>
    </p>
`

/**
 * @desc 生成每個 SECTION 的 HTML
 * @param {object} data
 * @param {number} index  section index
 * @returns {string} HTML 模板
 */
const genHTML = (data, index) => {
    let tempArr = [];
    let tempHtml = '';

    // 第四步的 section 數據長得不一樣
    if (index == 3) {
        forEach(data, (value, key) => {
            
            let iconName = oIconMap[key] || oIconMap.DEFAULT;
            let itemHTML = 
                tempStep4Item
                    .replace('{{ iconFile }}', iconName)
                    .replace('{{ title }}', key)
                    .replace('{{ content }}', JSON.stringify(JSON.parse(value)))
            
            tempArr.push(itemHTML)
        })
        tempHtml = 
            tempStep4Wrap
                .replace('{{ items }}', tempArr.join(''))
    } else {
        let aData = [];
        if (isObject(data)) {
            aData.push(data)
        } else if (isArray(data)) {
            aData = data
        }
        aData.forEach(data => {
            forEach(data, (value, key) => {
                if (isObject(value)) {
                    value = JSON.stringify(value)
                }

                let itemHTML = 
                    tempStepItem
                        .replace('{{ title }}', key)
                        .replace('{{ content }}', value)
                tempArr.push(itemHTML)
            })
            tempHtml = tempArr.join('')
        })
    }

    return tempHtml
}

/**
 * @desc 更新每一個 Section 的內容
 * @param {obect} data 
 */
const updateData = data => {
    eSection.forEach((dom, index) => {
        const eContent  = dom.querySelector('.content')
        const dataKey   = oContentMap[index];
        const oContents = data[dataKey];
        const html      = genHTML(oContents, index) 

        eContent.innerHTML = html            
    })
}

/**
 * @desc 修改 title 的寬度, 大家都要一樣
 */
const fixSectionsContentTitleWidth = () => {
    eSection.forEach((dom, index) => {
        if (index == 3) return false;
        
        const eContent       = dom.querySelector('.content');
        const eContentTitles = Array.from(eContent.querySelectorAll('.ret-title'))
        const maxW = Math.max(...eContentTitles.map(dom => parseFloat(getComputedStyle(dom).width))) + 'px';
        eContentTitles.forEach(dom => dom.style.minWidth = maxW)
    })
}

/**
 * @desc 更新最後一步的顯示數據
 * @param {object} data 
 */
const updateRet = data => {
    oRet.update(data)
}


/**
 * @desc 更新畫面內容
 * @param {object} data  數據 
 */
const updateContent = data => {
    updateSectionContent(data)
    updateRet(data[oContentMap[5]])
}

/**
 * @desc 更新每一步的數據
 * @param {object} data 
 */
const updateSectionContent = data => {
    updateData(data)
    fixSectionsContentTitleWidth(data)
}

export {
    updateContent
}