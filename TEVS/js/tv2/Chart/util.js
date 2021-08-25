import { Vec2 } from '../../util/Vec2.js'


const initCanvasWH = canvas =>  {

    let style = getComputedStyle(canvas);
    canvas.width = parseFloat(style.width)
    canvas.height = parseFloat(style.height)
    return canvas;
}

const getCanvasContext = canvas => {

    return {
        w: canvas.width,
        h: canvas.height,
        ctx: canvas.getContext('2d')
    }
}

class Linear {
    constructor(args) {
        let def = {
            x1: new Vec2,
            x2: new Vec2,
            colors: [{ offset: 0, color: 'white' }, { offset: 1, color: 'white' }],
            ctx: null
        }
        Object.assign(def, args);
        Object.assign(this, def);

        this.init();
    }

    init() {
        this.linear = this.ctx.createLinearGradient(this.x1.x, this.x1.y, this.x2.x, this.x2.y);
        this.colors.forEach(color => this.linear.addColorStop(color.offset, color.color))
    }
}

export {
    initCanvasWH,
    getCanvasContext,
    Linear
}