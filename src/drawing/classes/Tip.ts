import p5 from "p5";
import { Drawable } from "../Drawable";
import { IPoint } from "../Entity";

export class TipDrawable extends Drawable {
    constructor(p5: p5, private text: string) {
        super(p5, 10000);

        this.width = 100;
        this.height = 20;
        this.anchor = { x: 60, y: 15 };
        this.style = {
            fill: 0,
            stroke: 0,
            strokeWeight: 0,
        }

        this.enabled = false;
    }

    drawEl(anchor: IPoint): IPoint {
        this.p5.rect(anchor.x + this.anchor.x, anchor.y + this.anchor.y, this.width, this.height, 5);

        this.p5.textAlign(this.p5.CENTER);
        this.p5.fill(255);
        this.p5.text(this.text, this.anchor.x + anchor.x, anchor.y + this.anchor.y + 5, this.width, this.height);

        return { x: 0, y: 0 };
    }

    onHover(): void {
    }
    afterHover(): void {
    }
}