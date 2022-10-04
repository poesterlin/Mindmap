import p5 from "p5";


import { Computable } from "../../computing/Computable";
import { Boolean, Input } from "../../computing/ComputingClasses";
import { Drawable, headerSize, inputSpacing, handelSize } from "../Drawable";

const r = 5;
export class SquareEl extends Drawable {
  constructor(p5: p5, z, computable: Computable) {
    super(p5, z, computable);

    if (!(this.computable instanceof Input || this.computable instanceof Boolean)) {
      this.width = 70;
    }
  }

  drawEl() {
    const outputs = this.outputs;

    this.p5.fill(255);
    this.p5.rect(this.anchor.x, this.anchor.y, this.drawWidth, headerSize + (Math.max(this.outputs.length, this.inputs.length) + 0.5) * inputSpacing, r);
    this.p5.fill(0);
    if (this.hover) {
      this.p5.strokeWeight(2);
      this.p5.stroke("gray");
    }

    this.p5.rect(this.anchor.x, this.anchor.y, this.drawWidth, headerSize, r);

    this.setupText();
    this.p5.textAlign(this.p5.CENTER);
    this.p5.text(this.text, this.anchor.x, this.anchor.y + 10, this.drawWidth);

    if (this.runStarted !== 0) {
      const start = (Date.now() - this.runStarted) / 300 % 360;
      this.p5.arc(this.anchor.x, this.anchor.y, handelSize, handelSize, start, (start * 2) % 360)
    }

    if (this.computable instanceof Input || this.computable instanceof Boolean) {
      this.p5.stroke("gray");
      this.p5.strokeWeight(2);
      if (this.focused) {
        this.p5.strokeWeight(3);
        this.p5.stroke(100, 240, 70);
      }

      if (this.computable instanceof Boolean && this.computable.value?.value === true) {
        this.p5.fill(100, 240, 70);
      }

      this.p5.rect(this.anchor.x + 4, this.anchor.y + headerSize + 4, this.drawWidth - handelSize, 20);

      if (this.computable instanceof Input) {
        this.p5.textSize(14);
        this.p5.fill(0);
        this.p5.noStroke();
        this.p5.textAlign(this.p5.LEFT);
        this.p5.text(this.computable.value?.asString(), this.anchor.x + 6, this.anchor.y + headerSize + 8, this.drawWidth / 2);
      }
    } else {
      if (this.computable.value !== undefined) {
        this.p5.fill(0);
        this.p5.textSize(10);
        this.p5.text(this.computable.value.asString(), this.anchor.x, this.anchor.y + headerSize + 2, this.drawWidth);
      }
    }
    this.p5.strokeWeight(2);

    this.computable.outputTypes.filter(o => o !== "output").forEach((o, i) => {
      this.p5.noStroke();
      this.p5.fill(0);
      this.p5.textAlign(this.p5.RIGHT);
      this.p5.textSize(10);
      this.p5.text(o, outputs[i].x - handelSize / 2, outputs[i].y, 0, 10);
    })

  }

  collision({ x, y }) {
    return x > this.anchor.x && x < this.anchor.x + this.drawWidth && y > this.anchor.y && y < this.anchor.y + this.height;
  }
}
