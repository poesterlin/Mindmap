import p5 from "p5";
import { Computable, ComputeUnit } from "../../computing/Computable";
import { idxToPoint, Link } from "../../link/Link";
import { Drawable, handelSize, headerSize, inputSpacing } from "../Drawable";
import { IPoint } from "../Entity";


export abstract class ComputingDrawable extends Drawable {

    constructor(p5: p5, z: number, public computable: Computable) {
        super(p5, z);
    }


}

export class InputLink extends Drawable {
    constructor(p5: p5, z: number, private link: Link) {
        super(p5, z + 1)
    }

    drawEl(anchor: IPoint): IPoint {
        this.p5.line(anchor.x, this.link.inputPoint(), anchor.x, this.link.outputPoint());

        return { x: 0, y: 0 }
    }

    onHover(): void {
    }

    afterHover(): void {
    }
}

export class OutputLink extends Drawable {
    constructor(p5: p5, z: number, private onLink: () => void) {
        super(p5, z + 1)
    }

    drawEl(anchor: IPoint): IPoint {


        return { x: 0, y: 0 }
    }

    onHover(): void {
        this.onLink();
    }

    afterHover(): void {
    }
}

export class LinksDrawable extends ComputingDrawable {

    constructor(p5: p5, z: number, public computable: Computable) {
        super(p5, z, computable);

        this.attached = [];
    }

    drawEl(_anchor: IPoint): IPoint {
        this.attached = [];

        const num = this.computable.fixedInputs ? this.computable.nInputs : this.computable.prev.length + 1;

        for (let i = 0; i < num; i++) {
            this.p5.circle(_anchor.x - handelSize / 2, _anchor.y + idxToPoint(i), handelSize)
        }

        for (let i = 0; i < this.computable.outputTypes.length; i++) {
            this.p5.circle(_anchor.x + this.width - handelSize / 2, _anchor.y + idxToPoint(i), handelSize)
        }

        const max = Math.max(num, this.computable.outputTypes.length)

        return { x: this.width, y: idxToPoint(max) }
    }

    onHover(): void {
        this.style.fill = this.p5.color(10, 255, 100);
    }

    afterHover(): void {
        this.style.fill = this.p5.color(100, 255, 100);
    }

    unSelect(): void {
    }

    beforeDelete(): void {
    }
}


export class InputDrawable extends Drawable {

    constructor(p5: p5, z: number, public computable: Computable) {
        super(p5, z);

        this.grow = true;
        this.anchor = { x: 100, y: 100 };
        this.width = 100;
        this.height = 200;

        const inp = new LinksDrawable(p5, z, computable)
        inp.width = this.width;
        this.attached = [inp];

    }

    drawEl(_anchor: IPoint): IPoint {
        this.p5.stroke(0);
        this.p5.rect(this.anchor.x, this.anchor.y, this.width, this.height, 5);
        this.setStyle();
        if (this.focused) {
            this.p5.fill(0);
        }
        this.p5.rect(this.anchor.x, this.anchor.y, this.width, headerSize, 5);

        this.p5.textSize(14);
        this.p5.noStroke();
        this.p5.fill(this.focused ? 255 : 0);
        this.p5.text(this.computable.constructor.name, this.anchor.x, this.anchor.y + 10, this.width, this.height);

        this.p5.fill(0)
        const val = this.computable.value?.asString();
        this.p5.text(val, this.anchor.x, this.anchor.y + headerSize, this.width, this.height);

        return { x: 0, y: 0 }
    }

    onHover(): void {
        this.style.fill = 230;
    }
    afterHover(): void {
        this.style.fill = 255;
        this.style.stroke = 0;
        this.style.strokeWeight = 2;
    }
    onClick() {
        this.focused = true;
        this.style.stroke = this.p5.color(100, 170, 100);
    }
    unSelect(): void {
        this.focused = false;
        this.style.stroke = 0;
    }
    beforeDelete(): void {
    }

    keystroke() {
        const val = this.computable.value?.asAny();

        if (this.p5.keyIsDown(this.p5.BACKSPACE)) {

            if (val === undefined) {
                return;
            }

            if (typeof val === "number") {
                if (val === 0) {
                    this.computable.value = undefined;
                    return;
                }
                this.computable.value = new ComputeUnit(Math.floor(val / 10));
            }

            if (typeof val === "string") {
                this.computable.value = new ComputeUnit(val.slice(0, -1));
            }

            if (typeof val === "boolean") {
                this.computable.value = new ComputeUnit(!val);
            }

            return;
        }

        let key = this.p5.key;
        if (key.length > 1) {
            return;
        }
        let newVal: string | number = val === undefined ? key : val + key;

        const parsed = parseFloat(newVal);
        if (!isNaN(parsed)) {
            newVal = parsed;
        }

        this.computable.value = new ComputeUnit(newVal);
    }

}