import p5 from "p5";
import { Drawable } from "../Drawable";
import { IPoint } from "../Entity";
import { TipDrawable } from "./Tip";

export class ToolDrawable extends Drawable {

    constructor(p5: p5, public idx: number, public name: string, private image: p5.Image, private fn: () => void) {
        super(p5, 10000);

        this.width = 50;
        this.height = 50;
        this.anchor = { x: 0, y: idx * this.height };

        this.attached = [new TipDrawable(p5, this.name)];
    }

    drawEl(_anchor: IPoint): IPoint {
        this.p5.rect(this.anchor.x, this.anchor.y, this.width, this.height, 6);
        this.p5.image(this.image, this.anchor.x, this.anchor.y);

        return { x: 0, y: 0 };
    }

    onHover(): void {
        this.style.fill = 220;
        this.style.stroke = 200;
        this.attached[0].enabled = true;
    }

    afterHover(): void {
        this.style.fill = 255;
        this.style.stroke = 255;
        if (this.attached.length > 0) {
            this.attached[0].enabled = false;
        }
    }

    onClick() {
        this.fn();
        debugger
    }
}