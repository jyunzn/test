import { initCanvasWH, getCanvasContext, Linear } from './util.js'
import { Line } from './Line.js'
import { Vec2 } from '../../util/Vec2.js'
import { isString, nMap as map } from '../../util/comman.js';

class PolyChart {
    constructor(args) {
        let def = {
            datas: [],
            select: '',
            bgColor: 'white',
            lineColor: 'blue',
            yStep: 3,              // y 軸要有多少間距
            yUnit: 50              // y 每一個級距(至少)
        }
        Object.assign(def, args);
        Object.assign(this, def);
        this.init();
    }
    init() {
        this.initData();
        this.initDom();
        this.initCanvas();
        
        this.initDraw();
        
        this.draw();

    }

    initData() {
        this.curAnalyzed = 0;
        this.spaceX = this.getSpaceX();
    }

    getSpaceX() {
        const temp = this.datas.map(d => d.data.kill + d.data.pass)
        const maxTotal = Math.max(...temp)                 // 數據最大的那個
        let div = Math.ceil(maxTotal / this.yStep);        // 去分數據
        return div + this.yUnit - (div % this.yUnit);      // 單位數據
    }

    initDom() {
        
        this.dom = {
            container: document.querySelector(this.select),
            canvas: document.querySelector(`${this.select} canvas`),
            yAxios: document.querySelector(`${this.select} .y`),
            xAxios: document.querySelector(`${this.select} .x`)
        }
        
        // x 軸的時間標示, 他時間有年份，不夠塞，只拿月日
        this.dom.xAxios.innerHTML = this.datas.map(d => {
            let dates = d.name.split('-')
            let xWord = dates[2] % 5 == 0 ? `<span>${dates[1]}<br/>${dates[2]}</span>`: '<span></span>';

            return `<li>${xWord}</li>`
        }).join('')
        this.dom.xLis = this.dom.xAxios.children;
        
        // y 軸的標示( 幾階 + 1, 加的那個是 0 的線)
        this.dom.yAxios.innerHTML = Array.from({ length: this.yStep + 1 }, (v, i) => `<li>${this.spaceX * (this.yStep - i)}</li>`).join('')
        this.dom.yLis = this.dom.yAxios.children;
    }

    initCanvas() {
        
        initCanvasWH(this.dom.canvas);
        this.canvas = {
            ...getCanvasContext(this.dom.canvas),
            canvas: this.dom.canvas
        };

        this.canvas.canvas.height = this.canvas.h = parseFloat(getComputedStyle(this.dom.yAxios).height)

    }


    initDraw() {
        this.bgLines = Array.from(this.dom.yLis).map(() => new Line({
            x2: new Vec2(this.canvas.w, 0),
            lineW: 1,
            ctx: this.canvas.ctx,
            color: 'rgba(237, 237, 237, .2)'
        }));
        
        
        this.colorKill = isString(this.colorKill) ? this.colorKill : this.getLinear(this.colorKill);
        this.colorNot2Kill = isString(this.colorNot2Kill) ? this.colorNot2Kill : this.getLinear(this.colorNot2Kill);
    }

    getLinear(colors) {

        return (new Linear({
            x1: new Vec2(0, this.canvas.h / 2),
            x2: new Vec2(this.canvas.w, this.canvas.h / 2),
            colors,
            ctx: this.canvas.ctx
        })).linear
    }
        
    draw() {
        let ctx = this.canvas.ctx;
        
        // x 軸一格
        let xCS = getComputedStyle(this.dom.xLis[0]);
        // y 軸一格
        let yCS = getComputedStyle(this.dom.yLis[0]);
        // x 軸一格間距
        let xSpace = parseFloat(xCS.width);
        // y 軸一格間距
        let ySpace = parseFloat(yCS.height) + parseFloat(yCS.marginBottom);
        // y 軸的 offset
        let paddingTop = parseFloat(yCS.height) / 2;
        // x 軸的 offset
        let offset = this.dom.xLis[0].children[0].offsetWidth / 2;
        

        // y 軸最大的值
        let max = this.spaceX * this.yStep;
    

        ctx.clearRect(0, 0, this.canvas.w, this.canvas.h);

        // 畫線條
        ctx.save();
            ctx.translate(0, paddingTop)
            this.bgLines.forEach((l, i) => {
                ctx.translate(0, i == 0 ? 0 : ySpace);
                l.draw();
            })

        ctx.restore();


        
        ctx.save()
            // 移到 0 的位置
            ctx.translate(0, this.canvas.h - paddingTop);

            // 畫 kill 數據
            ctx.beginPath()
                
                ctx.lineWidth = this.lineWidth;

                this.datas.forEach((d, i) => {
                    let kill = d.data.kill;
                    let drawKill = -map(kill, max, 0, this.canvas.h - paddingTop * 2, 0)
                    // if (i == 0) {
                    //     ctx.moveTo(xSpace * i + offset, drawKill)
                    // }
                    ctx.lineTo(xSpace * i + offset, drawKill)
                })

                ctx.strokeStyle = this.colorKill;
                ctx.stroke();

            // 畫 pass 數據
            ctx.beginPath();
                // ctx.moveTo(0, 0)
                ctx.lineWidth = this.lineWidth;
                this.datas.forEach((d, i) => {
                    let pass = d.data.pass;
                    let drawPass = -map(pass, max, 0, this.canvas.h - paddingTop * 2, 0)
                    // if (i == 0) {
                    //     ctx.moveTo(xSpace * i + offset, drawPass)
                    // }

                    ctx.lineTo(xSpace * i + offset, drawPass)
                })
                ctx.strokeStyle = this.colorNot2Kill; // todo
                
                ctx.stroke();
        ctx.restore()

    }
}

export { PolyChart }