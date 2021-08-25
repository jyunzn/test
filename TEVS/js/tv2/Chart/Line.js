import { initCanvasWH, getCanvasContext, Linear } from './util.js'
import { Vec2 } from '../../util/Vec2.js'
import { isString, nMap as map } from '../../util/comman.js';

class Line {
    constructor(args) {
        let def = {
            lineW: 0,
            color: 'white',
            x1: new Vec2,
            x2: new Vec2,
            ctx: null,
            lineCap: 'round'
        }
        Object.assign(def, args);
        Object.assign(this, def);
    }
    draw() {
        this.ctx.save();
            let offsetX = 0;

            // 除了 Butt 以外，他前面都會多出一塊，要偏移回來
            if (this.lineCap !== 'butt') {
                offsetX = this.lineW / 2;
            }
            this.ctx.translate(this.x1.x + offsetX, this.x1.y + offsetX)
            this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                let target = this.x2.x - offsetX * 2;  // 把多出來的那塊減掉才是真正要畫的終端
                    target = target < 0 ? 0 : target;
                this.ctx.lineTo(target, this.x2.y);
                this.ctx.lineWidth = this.lineW;
                this.ctx.strokeStyle = this.color;
                this.ctx.lineCap = this.lineCap;
                this.ctx.stroke();
        this.ctx.restore();
    }
}


class LineChart {
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
            total: document.querySelector(`${this.select} .total`),
            analyzed: document.querySelector(`${this.select} .analyzed`),
            canvas: document.querySelector(`${this.select} canvas`)
        }

        this.dom.total.textContent = this.total
    }

    initCanvas() {
        initCanvasWH(this.dom.canvas);
        this.canvas = {
            ...getCanvasContext(this.dom.canvas),
            canvas: this.dom.canvas
        };
    }

    initDraw() {
        this.bgLine = new Line({
            x2: new Vec2(this.canvas.w, 0),
            lineW: this.canvas.h,
            ctx: this.canvas.ctx,
            color: isString(this.bgColor) ?  this.bgColor : this.getLinear(this.bgColor)
        });
        
        this.dataLine = new Line({
            lineW: this.canvas.h,
            color: isString(this.lineColor) ?  this.lineColor : this.getLinear(this.lineColor),
            ctx: this.canvas.ctx
        });
    }

    getLinear(colors) {
        return (new Linear({
            x2: new Vec2(this.canvas.w, 0),
            ctx: this.canvas.ctx,
            colors
        })).linear
    }

    initData() {
        this.curAnalyzed = 0;
    }

    draw() {
        this.canvas.ctx.clearRect(0, 0, this.canvas.w, this.canvas.h);
        this.bgLine.draw();
        this.dataLine.draw();
        this.dom.analyzed.textContent = parseInt(this.curAnalyzed);
    }

    update() {
        gsap.to(this, {
            duration: 1,
            curAnalyzed: this.analyzed,
            onUpdate: () => {
                this.dataLine.x2.x = map(this.curAnalyzed, this.total, 0, this.canvas.w, 0)
                this.draw()
            }
        })
    }
}

export {
    Line,
    LineChart
}