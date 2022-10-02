import p5 from "p5";
import { Drawable } from "./Drawable";

const r = 5;
export class SquareEl extends Drawable {
  constructor(p5: p5, z) {
    super(p5, z);
  }

  drawEl() {
    this.p5.rect(this.anchor.x, this.anchor.y, this.drawWidth, this.height, r);
  }

  collisionCheck({ x, y }) {
    return x > this.anchor.x && x < this.anchor.x + this.drawWidth && y > this.anchor.y && y < this.anchor.y + this.height;
  }
}
