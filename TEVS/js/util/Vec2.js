class Vec2 {
    static toPI = Math.PI / 180

    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    get length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    set length(len) {
        let temp = this.unit.mul(len);
        this.set(temp.x, temp.y);
    }
    get angle() {
        return Math.atan2(this.y, this.x)
    }
    get unit() {
        return this.mul(1 / this.length);
    }

    move(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    add(v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }
    sub(v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    }
    mul(s) {
        return new Vec2(this.x * s, this.y * s);
    }
    setX(x) {
        this.x = x;
        return this;
    }

    setY(y) {
        this.y = y;
        return this;
    }

    set(x, y) {
        this.setX(x);
        this.setY(y);
        return this;
    }

    equal(v) {
        return this.x === v.x && this.y === v.y;
    }

    clone() {
        return new Vec2(this.x, this.y)
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }
}

export { Vec2 }