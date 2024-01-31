export class Vec2 {
    __x: number;
    __y: number;

    static zero() {
        return new Vec2(0, 0);
    }
    static new(x: number = 0, y: number = 0) {
        return new Vec2(x, y);
    }
    constructor(x: number = 0, y: number = 0) {
        this.__x = x;
        this.__y = y;
    }
    x() {
        return this.__x;
    }
    y() {
        return this.__y;
    }
    add(other: Vec2) {
        return new Vec2(this.__x + other.__x, this.__y + other.__y);
    }
    sub(other: Vec2) {
        return new Vec2(this.__x - other.__x, this.__y - other.__y);
    }
    scale(num: number) {
        return new Vec2(this.__x * num, this.__y * num);
    }
    unit() {
        if (this.mag() === 0) {
            return this.copy();
        }
        return this.copy().scale(1 / this.mag());
    }
    mag() {
        return this.dist(Vec2.zero());
    }
    dist(other: Vec2) {
        return Math.sqrt(Math.pow(this.__x - other.__x, 2) + Math.pow(this.__y - other.__y, 2));
    }
    copy() {
        return Vec2.new(this.__x, this.__y);
    }
}