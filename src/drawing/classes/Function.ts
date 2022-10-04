import p5 from "p5";
import { Drawable } from "../Drawable";
import { IPoint } from "../Entity";

export class FunctionDrawable extends Drawable {
    constructor(p5: p5, public idx: number, public name: string, public fn: (p5: p5) => void) {
        super(p5, 10000);

        this.width = 100;
        this.height = 20;
        this.anchor = { x: p5.width - this.width, y: idx * this.height };
    }

    drawEl(_anchor: IPoint): IPoint {
        this.p5.rect(this.anchor.x, this.anchor.y, this.width, this.height);

        this.p5.textAlign(this.p5.CENTER)
        this.p5.fill(255);
        this.p5.textSize(12);
        this.p5.noStroke();
        this.p5.text(this.name, this.anchor.x, this.anchor.y + 4, this.width, this.height);

        return { x: this.anchor.x + this.width, y: this.anchor.y + this.height };
    }

    onHover(): void {
        this.style.fill = 100;
    }

    afterHover(): void {
        this.style.fill = 0;
    }

    onClick() {
        this.fn(this.p5);
    }
}