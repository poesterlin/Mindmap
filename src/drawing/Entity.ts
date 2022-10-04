import p5 from "p5";
import { Drawable } from "./Drawable";

export interface IPoint {
    x: number, y: number
}

export class Box {
    constructor(public x: number, public y: number, public width: number = 1, public height: number = 1) { }
}

function divideBy<T>(array: T[], fn: (t: T) => boolean) {
    const t: T[] = [];
    const f: T[] = [];

    array.forEach(element => fn(element) ? t.push(element) : f.push(element));

    return {
        true: (fn: (d: T) => void) => {
            t.forEach(fn);

            return {
                false: (fn2: (d: T) => void) => {
                    f.forEach(fn2);
                }
            }
        },
    }
}

export class EntityModel {
    public drawablesAll: Drawable[] = [];

    public get drawables() {
        return this.drawablesAll.filter(d => d.enabled)
    }

    public draw() {
        this.drawables.sort((d1, d2) => d1.zIndex - d2.zIndex).forEach(d => d.draw());
    }

    public select(p5: p5) {
        const pos: IPoint = { x: p5.mouseX, y: p5.mouseY };

        divideBy(this.drawables.filter(d => !d.focused), d => d.collision(new Box(pos.x, pos.y)))
            .true(d => d.onClick())
            .false(d => d.unSelect())
    }

    public unselect() {
        this.drawables.forEach(d => d.unSelect())
    }

    public hover(p5: p5) {
        if (p5.mouseIsPressed) {
            return;
        }
        const pos: IPoint = { x: p5.mouseX, y: p5.mouseY };
        divideBy<Drawable>(this.drawables.filter(d => !d.focused), d => d.collision(new Box(pos.x, pos.y)))
            .true((d: Drawable) => d.onHover())
            .false((d: Drawable) => d.afterHover());
    }

    public moveWithMouse(p5: p5) {
        const by: IPoint = { x: p5.mouseX - p5.pmouseX, y: p5.mouseY - p5.pmouseY };

        this.drawables.filter(d => d.focused).forEach(d => d.moveBy(by));
    }

    public moveAll(by: IPoint) {
        this.drawables.forEach(d => d.moveBy(by));
    }

    public moveSelected(by: IPoint) {
        const focused = this.drawables.filter(d => d.focused);
        if (focused.length === 0) {
            this.moveAll(by);
            return;
        }

        focused.forEach(d => d.moveBy(by));
    }

    public selectArea(from: IPoint, to: IPoint, minimumOverlapFactor: number = 0.5) {
        divideBy(this.drawables, d => {
            let x1 = from.x, y1 = from.y, x2 = to.x, y2 = to.y;
            const rect1 = d.getBoundingBox();


            if (rect1.x > x1) { x1 = rect1.x; }
            if (rect1.y > y1) { y1 = rect1.y; }
            if (rect1.x + rect1.width < x2) { x2 = rect1.x + rect1.width; }
            if (rect1.y + rect1.height < y2) { y2 = rect1.y + rect1.height; }

            if (x2 <= x1 || y2 <= y1) {
                return false;
            }

            const area = rect1.width * rect1.height;

            const intersection = { width: x2 - x1, height: y2 - y1 };
            const intersectionArea = intersection.width * intersection.height;

            return intersectionArea / area > minimumOverlapFactor;
        }).true(d => d.onSelect()).false(d => d.unSelect())
    }

    public delete(d: Drawable) {
        d.beforeDelete();
        const idx = this.drawables.findIndex(dr => dr === d);
        this.drawables.splice(idx, 1);
    }

    public getSelected() {
        return this.drawables.filter(d => d.focused);
    }

    public unSelectAll() {
        return this.getSelected().forEach(f => f.unSelect());
    }

    public add(d: Drawable) {
        this.drawablesAll.push(d);
    }
}