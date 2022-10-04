import p5 from "p5";
import { Computable } from "../../computing/Computable";
import { Link } from "../../link/Link";
import { Drawable, handelSize, headerSize, inputSpacing } from "../Drawable";
import { IPoint } from "../Entity";


export abstract class ComputingDrawable extends Drawable {

    constructor(p5: p5, z: number, public computable: Computable) {
        super(p5, z);
    }

    get inputs() {
        const num = this.computable.fixedInputs ? this.computable.nInputs : this.computable.prev.length + 1;

        return new Array(num).fill(null).map((_, i) => ({
            x: this.anchor.x - handelSize / 2,
            y: this.anchor.y + headerSize + (i + 0.5) * inputSpacing,
        }))
    }

    get outputs() {
        const num = this.computable.outputTypes.length;

        return new Array(num).fill(null).map((_, i) => ({
            x: this.anchor.x + this.width - handelSize / 2,
            y: this.anchor.y + headerSize + (i + 0.5) * inputSpacing,
        }))
    }


    connectorCheck(p: { x: number, y: number }) {
        const inputCheck = this.checkCollisionArray(p, this.inputs);
        if (inputCheck > -1) {
            return { isInput: true, idx: inputCheck }
        }
        const outputCheck = this.checkCollisionArray(p, this.outputs);
        if (outputCheck > -1) {
            return { isInput: false, idx: outputCheck }
        }
        return { idx: -1, isInput: false };
    }

    checkCollisionArray({ x, y }, arr: { x: number, y: number }[]) {
        return arr.findIndex((h) => x > h.x && x < h.x + handelSize && y > h.y && y < h.y + handelSize);
    }
}

export class InputLink extends Drawable {
    constructor(p5: p5, z: number, private link: Link) {
        super(p5, z + 1)
    }

    drawEl(anchor: IPoint): IPoint {
        // const start = this.link.inputDrawable.inputs[this.link.inputIdx];
        // const endIdx = this.link.output.outputTypes.findIndex(o => this.link.outputType === o);


        // this.p5.line(start.x, start.y, end.x, end.y);

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

        this.inputs.forEach(i => {
            this.p5.circle(i.x, i.y, handelSize)

        })


        return { x: 0, y: 0 }
    }

    onHover(): void {

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

        this.grow = false;
        this.anchor = { x: 100, y: 100 };
        this.width = 100;
        this.height = 200;

        this.attached = [new LinksDrawable(p5, z, computable)];
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

}