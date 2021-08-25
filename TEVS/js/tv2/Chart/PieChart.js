import { initCanvasWH, getCanvasContext } from './util.js'
import { Circle } from './Circle.js'
import { Vec2 } from '../../util/Vec2.js'
import { nMap as map } from '../../util/comman.js';


const eColorsList = ['#492880', '#7653AF', '#A192FF', '#EDEDED', '#51D5FF', '#14B7DB', '#009BB0', '#007077', '#001C37', '#00464A'];

class PieChart {
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
            listWrap: document.querySelector(`${this.select} .wrap-info ul`)
        }

        // 旁邊那條清單
        this.dom.listWrap.innerHTML = this.datas.map(d => `
            <li><i style="background-color:${d.color};"></i><span>${d.name}</span></li>
        `).join('')
    }

    initCanvas() {
        initCanvasWH(this.dom.canvas);
        this.canvas = {
            ...getCanvasContext(this.dom.canvas),
            canvas: this.dom.canvas
        };
    }


    setColor() {
        
        this.datas.forEach((d, i) => {
            if (i >= eColorsList.length) {
                d.color = getRandomColor()
            } else {
                d.color = eColorsList[i]
            }
            
            return d;
        })
    }

    initData() {
        this.curAnalyzed = 0;
        this.total = this.datas.reduce((prev, cur) => prev + cur.data, 0);  // 算一下總共有多少
        this.setColor();
    }

    initDraw() {
        let r = Math.min(this.canvas.h, this.canvas.w) / 2

        // 初始化畫筆們
        this.pies = this.datas.map(d => {
            let obj = {}
            
            obj.bgLine = new Circle({
                r,
                p: new Vec2(this.canvas.w / 2, this.canvas.h / 2),
                color: 'white',
                lineW: 6,
                stroke: true,
                ctx: this.canvas.ctx,
                startDeg: 0,
                deg: 0,
                lineCap: 'butt'
            })


            obj.dataLine = new Circle({
                r,
                p: new Vec2(this.canvas.w / 2, this.canvas.h / 2),
                color: d.color,
                lineW: 6,
                fill: true,
                ctx: this.canvas.ctx,
                startDeg: 0,
                deg: 0
            })

            return obj
        })
    }

    draw() {
        this.canvas.ctx.clearRect(0, 0, this.canvas.w, this.canvas.h)
        this.pies.forEach(pie => {
            pie.bgLine.draw();
            pie.dataLine.draw();
        })
    }

    update() {
        gsap.to(this, {
            duration: 1,
            curAnalyzed: this.total,
            onUpdate: () => {
                // 這一幀要畫多少
                let all = this.curAnalyzed;
                // 從哪開始畫
                let start = -0.5 * Math.PI;
  
                this.datas.some((data, index) => {
                    // 剪掉這筆數據，看剩多少
                    let calc = all - data.data;

                    // 如果是正的，表示這筆數據要全畫，負的就畫剩下的
                    let deg = 0;
                    if (calc < 0) {
                        deg = all;
                    } else {
                        deg = data.data;
                    }
                    deg = map(deg, this.total, 0, 2 * Math.PI, 0)

                    // 設置這筆數據要畫的初始位置
                    this.pies[index].bgLine.startDeg = start;
                    this.pies[index].dataLine.startDeg = start;
                    // 設置他要畫的角度
                    this.pies[index].bgLine.deg = deg
                    this.pies[index].dataLine.deg = deg
                    
                    // 初始角度就是這筆數據畫完的地方
                    start += deg
                    // 剩下多少要畫
                    all = calc;

                    // 如果這一幀要畫的數據畫完了，就跳出
                    return calc < 0;
                })

                // 畫下去
                this.draw()
            }
        })
    }
}

export {
    PieChart
}