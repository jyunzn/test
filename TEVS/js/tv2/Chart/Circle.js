import { initCanvasWH, getCanvasContext, Linear } from './util.js'
import { Vec2 } from '../../util/Vec2.js'
import { isString, nMap as map } from '../../util/comman.js';

class Circle {
    constructor(args) {
        let def = {
            lineW: 0,             // 邊線寬
            color: 'white',       // 顏色
            startDeg: 0,          // 初始角度 ( 0 度在三點鐘方向，+ 為順時鐘, - 為逆時鐘 )
            deg: 2 * Math.PI,     // 要畫的角度
            ctx: null,            // context
            lineCap: 'round',     // 邊線的類型
            stroke: false,        // 要不要畫邊線
            fill: false,          // 要不要填色
            r: 0,                 // 半徑
            p: new Vec2           // 圓心位置
        }
        Object.assign(def, args);
        Object.assign(this, def);
    }
    draw() {
        this.ctx.save();
            this.ctx.translate(this.p.x, this.p.y)
            this.ctx.rotate(this.startDeg)
            
            let r = this.r - this.lineW / 2;

            if (this.stroke) {
                this.ctx.beginPath();
                    this.ctx.arc(0, 0, r, 0, this.deg);
                    this.ctx.lineWidth = this.lineW;
                    this.ctx.strokeStyle = this.color;
                    this.ctx.lineCap = this.lineCap;
                    this.ctx.stroke();
            }

            if (this.fill) {
                this.ctx.beginPath();
                    this.ctx.moveTo(0, 0)
                    this.ctx.lineTo(r, 0)
                    this.ctx.arc(0, 0, r, 0, this.deg);
                    this.ctx.save();
                        this.ctx.rotate(this.deg)
                        this.ctx.lineTo(r, 0)
                    this.ctx.restore();
                this.ctx.closePath();
                this.ctx.fillStyle = this.color;
                
                this.ctx.fill();
            }
        this.ctx.restore();
    }
}

class CircleChart {
    constructor(args) {
        let def = {
            total: 0,
            analyzed: 0,
            select: '',
            bgColor: 'white',
            lineColor: 'blue'
        }
        Object.assign(def, args);
        Object.assign(this, def);
        this.init();
    }

    init() {
        this.initDom();
        this.initCanvas();
        this.initDraw();
        this.initData();
        this.draw();
        this.update();
    }
    initDom() {
        this.dom = {
            container: document.querySelector(this.select),
            canvas: document.querySelector(`${this.select} canvas`),
            number: document.querySelector(`${this.select} .number`)
        }
    }

    initCanvas() {
        initCanvasWH(this.dom.canvas);
        this.canvas = {
            ...getCanvasContext(this.dom.canvas),
            canvas: this.dom.canvas
        };
    }

    initDraw() {

        // 畫布寬高其中一個做半徑
        let r = Math.min(this.canvas.h, this.canvas.w) / 2
        this.bgLine = new Circle({
            r: r,
            p: new Vec2(this.canvas.w / 2, this.canvas.h / 2),
            color: isString(this.bgColor) ?  this.bgColor : this.getLinear(this.bgColor, r),
            lineW: 6,
            stroke: true,
            ctx: this.canvas.ctx,
            startDeg: 0,
            deg: 2 * Math.PI
        })

        this.dataLine = new Circle({
            r: r,
            p: new Vec2(this.canvas.w / 2, this.canvas.h / 2),
            color: isString(this.lineColor) ?  this.lineColor : this.getLinear(this.lineColor, r),
            lineW: 6,
            stroke: true,
            ctx: this.canvas.ctx,
            startDeg: -0.5 * Math.PI,
            deg: 0
        })
    }

    getLinear(colorObj, r) {
        
        return (new Linear({
            x1: colorObj.x1(r) || new Vec2,
            x2: colorObj.x2(r) || new Vec2,
            ctx: this.canvas.ctx,
            colors: colorObj.colors
        })).linear
    }

    initData() {
        this.curAnalyzed = 0;
    }

    draw() {
        this.canvas.ctx.clearRect(0, 0, this.canvas.w, this.canvas.h);
        this.bgLine.draw();
        this.dataLine.draw();
        this.dom.number.textContent = parseInt(this.curAnalyzed / this.total * 100)
    }

    update() {
        gsap.to(this, {
            duration: 1,
            curAnalyzed: this.analyzed,
            onUpdate: () => {
                this.dataLine.deg = map(this.curAnalyzed, this.total, 0, 2 * Math.PI, 0)
                this.draw()
            }
        })
    }
}

export {
    Circle,
    CircleChart
}