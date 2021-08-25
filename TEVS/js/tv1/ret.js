import { nMap } from '../util/comman.js'
import { Vec2 } from '../util/Vec2.js'

const BASE_URL = './images/tv1/result/'

/**
 * @desc 結果對應要顯示的東西
 */
const retMap = {
    false: {
        icon: BASE_URL + 'fail_icon.svg',
        text: BASE_URL + 'INSPECTED.svg',
        startColor: '#0B185A',
        endColor: '#D32750',
        bg: 'linear-gradient(65.68deg, #D32750 32.89%, #0B185A 138.5%)'
    },
    true: {
        icon: BASE_URL + 'success_icon.svg',
        text: BASE_URL + 'PROTECTED.svg',
        startColor: '#A192FF',
        endColor: '#1EA0FF',
        bg: 'linear-gradient(94.78deg, #A192FF 1.13%, #1EA0FF 83.52%)'
    }
}

/**
 * @desc 顯示結果的東西
 */
class Ret {
    constructor(options) {
        const def = {
            selectorMask: '.ret-mask',
            selectorCanvasLine: '.ret-mask .ret-lines',
            selectorRetIcon: '.ret-mask .icon',
            selectorRetText: '.ret-mask .text',
            selectorRetBox: '.ret-mask .ret-box',
            color: null,
            data: null,
            open2Close: 2000,   // 打開動畫之後停頓的秒數
            lw: nMap(50, 1920, 0, window.innerWidth, 0),
            lh: 0,
            lmh: nMap(500, 1080, 0, window.innerHeight, 0),
            lineLength: 0,
            lineOffset: 0,
            degTilt: 109 
        }

        Object.assign(def, options)
        Object.assign(this, def)
        this.init()
    }

    init() {
        this.initDom()
        this.initCanvas()
        // 傾斜的向量
        this.vec2Tilt = new Vec2(Math.cos(this.degTilt * Vec2.toPI), Math.sin(this.degTilt * Vec2.toPI))
        this.event()
    }

    event() {
        window.addEventListener('resize', this.handleResize.bind(this))
    }

    initDom() {
        this.eMask   = document.querySelector(this.selectorMask)
        this.eCanvas = document.querySelector(this.selectorCanvasLine)
        this.eBox    = document.querySelector(this.selectorRetBox)
        this.eIcon   = document.querySelector(this.selectorRetIcon)
        this.eText   = document.querySelector(this.selectorRetText)
        this.ctx     = this.eCanvas.getContext('2d')
    }

    initCanvas() {
        this.ww = this.eCanvas.width  = window.innerWidth;
        this.wh = this.eCanvas.height = window.innerHeight;
    }

    /**
     * @desc 更新結果顯示畫面
     * @param {string} ret 結果
     */
    update(ret) {
        this.updateData(ret)
        this.updateDom()
        this.updateLineColor()
    }

    updateData(ret) {
        this.data = retMap[ret]
    }

    updateDom() {
        this.eIcon.src = this.data.icon
        this.eText.src = this.data.text
        this.eBox.style.background = this.data.bg;
    }

    updateLineColor() {
        this.color = this.ctx.createLinearGradient(0, 0, this.ww, this.wh)
        this.color.addColorStop(0, this.data.startColor)
        this.color.addColorStop(1, this.data.endColor)
    }

    /**
     * @desc 畫背景斜線們
     */
    draw() {
        this.ctx.clearRect(0, 0, this.ww, this.wh);
        
        let vertex1 = this.vec2Tilt.clone();
            vertex1.length = -this.lh / 2;
        let vertex4 = this.vec2Tilt.clone();
            vertex4.length = this.lh / 2;

        let vertex2 = vertex1.add(new Vec2(this.lw, 0));
        let vertex3 = vertex4.add(new Vec2(this.lw, 0));

        this.ctx.save();
            this.ctx.translate(0, this.wh / 2);
            this.ctx.beginPath();
                for (let i = 0; i < this.lineLength; i++) {

                    this.ctx.moveTo(vertex1.x + this.lineOffset + i * this.lw * 2, vertex1.y)
                    this.ctx.lineTo(vertex2.x + this.lineOffset + i * this.lw * 2, vertex2.y)
                    this.ctx.lineTo(vertex3.x + this.lineOffset + i * this.lw * 2, vertex3.y)
                    this.ctx.lineTo(vertex4.x + this.lineOffset + i * this.lw * 2, vertex4.y)
                }
                    
                this.ctx.fillStyle = this.color
                this.ctx.fill();
        this.ctx.restore();
    }

    updateLineLength() {
        this.lineLength = Math.ceil(window.innerWidth / this.lw) / 2 + 1
    }

    updateFirstLineOffset() {
        this.lineOffset = -this.lw
    }

    async start() {
        await this.open()
        await this.close()
    }

    /**
     * @desc 打開顯示畫面
     * @returns {Promise}  開啟之後停頓一下
     */
    open() {
        this.updateLineLength();
        this.updateFirstLineOffset();
        return new Promise(res => {
            TweenMax.to(this, 1, {
                lh: this.lmh,
                onUpdate: () => {
                    this.draw();
                },
                onComplete: () => {
                    setTimeout(() => {
                        res()
                    }, this.open2Close)
                }
            })

            TweenMax.to(this.eBox, 1, {
                left: '50%',
                opacity: 1,
                ease: 'linear'
            })
        })
        
    }

    /**
     * @desc 關閉畫面
     * @returns {Promise} 結束之後返回
     */
    close() {
        this.updateLineLength();
        this.updateFirstLineOffset();
        return new Promise(res => {
            TweenMax.to(this, 1, {
                lh: 0,
                onUpdate: () => {
                    this.draw();
                },
                onComplete: () => {
                    res();
                }
            })

            TweenMax.to(this.eBox, 1, {
                left: '0%',
                opacity: 0,
                ease: 'linear',
                onComplete:() => {
                    this.eBox.style.left = '100%';
                }
            })
        })
    }

    handleResize() {
        this.lmh = nMap(500, 1080, 0, window.innerHeight, 0)
        this.lw = nMap(50, 1920, 0, window.innerWidth, 0)
        this.initCanvas()
    }
}

const oRet = new Ret()

export {
    oRet
}