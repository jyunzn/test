# panasonic-graph

## 資料夾結構與基本設置
### 資料夾結構
```
.
├── README.md
├── index.html
├── package-lock.json
├── package.json
├── public // 網頁的靜態文件
│   ├── 1000.json
│   ├── api_sample.json
│   ├── favicon.ico
│   ├── images
│   │   ├── light.png
│   │   ├── malware.png
│   │   └── test.png
│   └── miserables.json
src //原始碼資料夾
├── App.vue // Vue 根元件，開發環境會用此元件導入 Graph.vue
├── assets
│   └── logo.png
├── components
│   ├── Graph.vue // 主要元件
│   ├── index.js // Vue 輸出元件設定
│   └── styles.sass // css 樣式設定，主要為小地圖的樣式
├── js
│   └── graph.js
├── main.js //程式入口
└── plugin.js //導出 Vue 使用的外掛
├── test //測試引用外掛的資料夾
│   ├── 1000.json
│   ├── api_sample.json
│   ├── favicon.ico
│   ├── images
│   │   ├── light.png
│   │   ├── malware.png
│   │   └── test.png
│   ├── miserables.json
│   ├── panasonic-graph.es.js
│   ├── panasonic-graph.umd.js
│   ├── style.css
│   └── test.html
└── vite.config.js // Vue 編譯設定檔
```
### 開發環境設置
```
# 安裝相關套件
npm install

# 執行開發伺服器
npm run dev
```
### 打包方法

`npm run build //打包程式碼` 

打包的程式碼將會輸出到 `/dist` 資料夾內。
如果要測試引用的效果，可以把 `/dist` 內的資料複製到 `/test` 中，並在 `/test` 資料夾中跑 http server 即可，例如： `python3 -m http.server`。

## 核心程式碼
### props: 由上層傳入的參數
- defaultFilePath 設定預設載入的json檔案路徑
- imageVirusSrc 病毒圖片的路徑
### methods: 可由上層元件觸發的事件
- setDataJSON(String JSON)  - 將新的資料設定給元件，如果沒有的話會使用預設的檔案
- updateDataJSON(String JSON) - 傳送新的資料（需要是類似上一份資料的diff)
- moveTo(String ID) - 將視野移動到特定病毒節點
- zoomOut() - 回復到所有病毒的遠景
- clearAll() - 清除所有病毒節點