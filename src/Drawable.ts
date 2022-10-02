import p5 from "p5";
import { Computable, ComputeUnit } from "./Computable";
import { Boolean } from "./ComputingClasses";

const padding = 5;
const maxWidth = 250;
export const handelSize = 10;
export const headerSize = 40;
export const inputSpacing = 20;


export abstract class Drawable {
  p5: p5;

  focused = false;
  hover = false;
  zIndex = 0;
  lastDrag;
  textVal = "";
  textLength = 0;
  cursor = 0;
  width = 100;
  height = headerSize;

  anchor: { x: number; y: number; };
  defaultColor: { textStyle: string; strokeWeight: number; stroke: string; fill: string; textSize: number; textColor: string; };
  style: any;

  constructor(p5: p5, z: number, public computable: Computable) {
    this.p5 = p5;
    this.zIndex = z;
    this.anchor = { x: 50, y: 50 };

    const { NORMAL } = p5;

    this.defaultColor = {
      textStyle: NORMAL,
      strokeWeight: 2,
      stroke: p5.color(0).toString(),
      fill: p5.color(255).toString(),
      textSize: 20,
      textColor: p5.color(255).toString(),
    };

    this.style = JSON.parse(JSON.stringify(this.defaultColor));
    this.text = computable.constructor.name;
  }

  reset() {
    this.focused = this.hover = false;
  }

  setUpColor() {
    this.setStyle(this.style);
    if (this.hover) {
      this.p5.fill(220);
    }
    if (this.focused) {
      this.p5.fill(180);
    }
  }

  setupText() {
    this.setStyle({ ...this.style, stroke: 0, fill: this.style.textColor, strokeWeight: 0 });
  }

  resetColor() {
    this.setStyle(this.defaultColor);
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
      x: this.anchor.x + this.drawWidth - handelSize / 2,
      y: this.anchor.y + headerSize + (i + 0.5) * inputSpacing,
    }))
  }

  setStyle(s) {
    this.p5.strokeWeight(s.strokeWeight);
    this.p5.textStyle(s.textStyle);
    this.p5.textSize(s.textSize);
    this.p5.stroke(this.p5.color(s.stroke));
    this.p5.fill(this.p5.color(s.fill));
  }

  get text() {
    return this.textVal;
  }

  set text(val) {
    this.textVal = val;
    this.textLength = this.p5.textWidth(this.textVal);
  }

  get drawWidth() {
    return Math.min(Math.max(this.width, this.textLength + padding * 2), maxWidth);
  }

  abstract drawEl(): void;

  draw() {
    this.setUpColor();
    this.drawEl();
    this.p5.fill(100, 240, 70);
    this.p5.noStroke();
    this.inputs.forEach((l) => {
      this.p5.ellipse(l.x, l.y, handelSize, handelSize);
    });

    this.p5.fill(100, 220, 200);

    this.outputs.forEach((l) => {
      this.p5.ellipse(l.x, l.y, handelSize, handelSize);
    });
    this.resetColor();
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

  collisionCheck(_obj: { x: number, y: number }) {
    return false;
  }

  collisionCheckBox(box) {
    return this.anchor.x < box.x + box.width &&
      this.anchor.x + this.drawWidth > box.x &&
      this.anchor.y < box.y + box.height &&
      this.anchor.y + this.height > box.y
  }

  setWidth(val) {
    this.width = Math.min(Math.max(this.textLength, val, 50), maxWidth);
  }

  setHeight(val) {
    this.height = Math.min(Math.max(50, val), maxWidth);
  }

  collision({ x, y }, mode) {
    const res = this.collisionCheck({ x, y });
    this.hover = res;

    if (mode === "clicked") {
      this.focused = res && !this.lastDrag;
      if (this.focused && this.computable instanceof Boolean) {
        this.computable.value = new ComputeUnit(!this.computable.value?.value)
      }
    }

    if (mode === "dragged" && res) {
      const offsetX = x - this.anchor.x;
      const offsetY = y - this.anchor.y;
      if (!this.lastDrag) {
        this.lastDrag = { x: offsetX, y: offsetY };
      }
      this.anchor = { x: x - this.lastDrag.x, y: y - this.lastDrag.y };
    } else {
      this.lastDrag = undefined;
    }
    return res;
  }
}

