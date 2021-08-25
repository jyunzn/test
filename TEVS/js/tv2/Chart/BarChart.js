import { Line } from './Line.js'
import { getCanvasContext } from './util.js'
import { Vec2 } from '../../util/Vec2.js'
import { nMap as map } from '../../util/comman.js';


class BarChart {
    constructor(args) {
        let def = {
            datas: [],
            select: '',
            bgColor: 'white',
            lineColor: 'blue'
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
        this.update();
    }

    initDom() {
        
        this.dom = {
            container: document.querySelector(this.select),
            canvas: document.querySelector(`${this.select} canvas`),
            yAxios: document.querySelector(`${this.select} .y`),
            xAxios: document.querySelector(`${this.select} .x`)
        }
        
        this.dom.yAxios.innerHTML = this.datas.map(d => `<li>${d.name}</li>`).join('')
        this.dom.yLis = this.dom.yAxios.children;
        
        this.dom.xAxios.innerHTML = Array.from({ length: 5}, (v, i) => `<li>${this.spaceX * i}</li>`).join('')
        this.dom.xLis = this.dom.xAxios.children;
    }

    initCanvas() {
        const yAxiosCS = getComputedStyle(this.dom.yAxios);
        const canvasCS = getComputedStyle(this.dom.canvas);
        this.dom.canvas.width = parseFloat(canvasCS.width);
        this.dom.canvas.height = parseFloat(yAxiosCS.height) + parseFloat(yAxiosCS.marginBottom);
        this.canvas = {
            ...getCanvasContext(this.dom.canvas),
            canvas: this.dom.canvas
        };
    }

    initData() {
        this.curAnalyzed = 0;
        let temp = this.datas.map(d => d.data.kill + d.data.pass)
        this.maxTotal = Math.max(...temp)
        
        this.spaceX = this.getSpaceX();
    }

    getSpaceX() {
        let div = this.maxTotal / 4;
        return div + 50 - (div % 50);
    }

    initDraw() {

        let liCS = getComputedStyle(this.dom.yLis[0]);
        let paddingTop = parseFloat(getComputedStyle(this.dom.yAxios).paddingTop) + parseFloat(liCS.height) / 2;
        let space = parseFloat(liCS.height) + parseFloat(liCS.marginBottom);

        this.lines = this.datas.map((d, i) => {
            let obj = {}
            let fixY = 0
            obj.bgLine = new Line({
                x1: new Vec2(0, paddingTop + i * space + fixY),
                x2: new Vec2(0, 0),
                lineCap: 'butt',
                ctx: this.canvas.ctx,
                color: '#A192FF',
                lineW: 3
            })

            obj.dataLine = new Line({
                x1: new Vec2(0, paddingTop + i * space + fixY),
                x2: new Vec2(0, 0),
                lineCap: 'butt',
                ctx: this.canvas.ctx,
                color: '#7653AF',
                lineW: 3
            })
            return obj;
        })
    }

    draw() {
        this.canvas.ctx.clearRect(0, 0, this.canvas.w, this.canvas.h)
        this.lines.forEach(l => {
            l.bgLine.draw()
            l.dataLine.draw()
        })
    }

    update() {
        
        gsap.to(this, {
            duration: 1,
            curAnalyzed: this.maxTotal,
            onUpdate: () => {

                let cur = this.curAnalyzed;
                let max = this.spaceX * 4;
                let w = this.canvas.w - parseFloat(getComputedStyle(this.dom.xLis[this.dom.xLis.length - 1]).width)
                this.lines.forEach((l, i) => {
                    let { kill, pass } = this.datas[i].data;
                    let all = kill + pass;
                    let drawAll = cur > all ? all : cur;
                    let drawKill = cur > kill ? kill : cur;
                        drawAll = map(drawAll, max, 0, w, 0)
                        drawKill = map(drawKill, max, 0, w, 0)

                    l.bgLine.x2.setX(drawAll)
                    l.dataLine.x2.setX(drawKill)
                })
                this.draw();

            }
        })
    }


}
export { BarChart }