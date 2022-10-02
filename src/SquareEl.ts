import p5 from "p5";


import { Computable } from "./Computable";
import { Drawable, headerSize, inputSpacing, handelSize } from "./Drawable";

const r = 5;
export class SquareEl extends Drawable {
  constructor(p5: p5, z, computable: Computable) {
    super(p5, z, computable);
  }

  drawEl() {
    const outputs = this.outputs;

    this.p5.fill(255);
    this.p5.rect(this.anchor.x, this.anchor.y, this.drawWidth, headerSize + (Math.max(this.outputs.length, this.inputs.length) + 0.5) * inputSpacing, r);
    this.p5.fill(0);
    this.p5.rect(this.anchor.x, this.anchor.y, this.drawWidth, headerSize, r);

    this.setupText();
    this.p5.textAlign(this.p5.CENTER);
    this.p5.text(this.text, this.anchor.x, this.anchor.y + 10, this.drawWidth);

    if(this.computable.value !== undefined){
      this.p5.fill(0);
      this.p5.textSize(10);
      this.p5.text(this.computable.value.asString(), this.anchor.x, this.anchor.y + headerSize + 2, this.drawWidth);
    }

    this.computable.outputTypes.forEach((o, i) => {
      this.p5.noStroke();
      this.p5.fill(0);
      this.p5.textAlign(this.p5.RIGHT);
      this.p5.textSize(10);
      this.p5.text(o, outputs[i].x - handelSize / 2, outputs[i].y, 0, 10);
    })

  }

  collisionCheck({ x, y }) {
    return x > this.anchor.x && x < this.anchor.x + this.drawWidth && y > this.anchor.y && y < this.anchor.y + this.height;
  }
}
