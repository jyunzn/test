// const eVirusNameContainer = document.querySelector('.virus-name-container')
const eVirusNameContainerContent = document.querySelector('.virus-name-container p')



// 創建病毒地圖
const app = Vue.createApp({
    el: '#app',
    data() {
        return {
            scale: 1,
            jsonFile: "./test/1000.json",
            gui: null,
            targetId: "cluster_0",
            showSmallMap: true
        }
    },
    methods: {
        async setDataObject(obj){
            obj = obj || newDataSample 
            this.$refs['graph'].setDataObject(obj) 
        },
        loadJSONFile(){
            this.$refs['graph'].setDataJSON(this.jsonFile)
        },
        zoomOut(){
            this.$refs['graph'].zoomOut()
        },
        moveTo(id){
            this.$refs['graph'].moveTo(this.targetId)
        },
        clearAll(){
            this.$refs['graph'].clearAll()
        }
        // updateData(path) {
        //     path = path ? path : '/test/1000.json'
        //     this.$refs['graph'].setDataJSON(path)
        // }
    }
})

// 掛載到畫面上
const vm = app.use(PanasonicGraph).mount("#app")

/**
 * @desc 把 JSON string 轉回 JSON
 * @param {obj} data 
 * @returns {object} JSON 數據
 */
const updateData = data => {
    return JSON.parse(data)
}

/**
 * @desc 病毒這一次要 zoomIn 到哪
 * @param {str} target 目標ID
 */
const updateRuning = (data, target) => {
    // 哪到哪一隻病毒在跑
    const runningTarget = data.tags.find(t => t.is_running == 1);

    // 更新左下角那些字
    eVirusNameContainerContent.textContent = runningTarget.tag

    // 等等要 ZOOMIN 的病毒
    vm.targetId = runningTarget.md5
}

/**
 * @desc 更新病毒畫面
 * @param {obj} data 
 */
const updateMap = data => {
    vm.setDataObject(data)
}

/**
 * @desc 更新病毒相關內容
 * @param {obj} data 
 * @param {str} target 
 */
const update = (data, target) => {
    const newData = updateData(data)
    updateRuning(newData, target)
    updateMap(newData)
}

/**
 * @desc 拉近到指定病毒的位置
 */
const zoomIn = () => {
    vm.moveTo()
    // eVirusNameContainer.classList.add('active')
}

/**
 * @desc 拉遠
 */
const zoomOut = () => {
    vm.zoomOut()
    // eVirusNameContainer.classList.remove('active')
}

export {
    update,
    zoomIn,
    zoomOut
}