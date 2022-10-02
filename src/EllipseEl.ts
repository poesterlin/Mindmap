import p5 from "p5";
import { Drawable } from "./Drawable";

export class EllipseEl extends Drawable {
  constructor(p5: p5, z: number) {
    super(p5, z);
  }

  drawEl() {
    this.p5.ellipse(this.anchor.x, this.anchor.y, this.drawWidth, this.height);
  }

  collisionCheck({ x, y }) {
    return x > this.anchor.x && x < this.anchor.x + this.drawWidth && y > this.anchor.y && y < this.anchor.y + this.height;
  }
}
