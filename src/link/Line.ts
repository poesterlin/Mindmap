import p5 from "p5";
import { Drawable, handelSize, headerSize, inputSpacing } from "../drawing/Drawable";

export abstract class Line {

  constructor(
    protected p5: p5,
    public from: Drawable,
    public fromIdx: { isInput: boolean, idx: number },
    public to?: Drawable,
    public toIdx?: { isInput: boolean, idx: number }) {
  }

  abstract draw(): void;

  calcPos(opts: { el: Drawable, hit: { isInput: boolean, idx: number } }) {
    let { anchor, height, width } = opts.el;
    if (!height) {
      height = 0;
    }

    const x = opts.hit.isInput ? anchor.x : anchor.x + width;
    return { x, y: anchor.y + headerSize + (opts.hit.idx + 0.5) * inputSpacing + handelSize / 2 };
  }
}

export class LineBetweenDrawables extends Line {
  triangleSize: number;
  points: { el: Drawable; hit: { isInput: boolean, idx: number }; }[];
  constructor(p5: p5,
    from: Drawable,
    fromIdx: { isInput: boolean, idx: number },
    to?: Drawable,
    toIdx?: { isInput: boolean, idx: number }) {
    super(p5, from, fromIdx, to, toIdx);

    this.triangleSize = 5;

    this.points = [{ el: from, hit: fromIdx }, { el: to, hit: toIdx }];
  }


  draw() {
    const fromPoint = this.calcPos(this.points[0]);


    let toPoint = this.calcPos(this.points[1]);

    this.p5.line(fromPoint.x, fromPoint.y, toPoint.x, toPoint.y);

    return toPoint;

  }
}

export class TempLine extends Line {
  constructor(p5: p5, from: Drawable, fromIdx: { isInput: boolean; idx: number; }) {
    super(p5, from, fromIdx);
  }

  draw() {
    const fromPoint = this.calcPos({ el: this.from, hit: this.fromIdx });
    this.p5.line(fromPoint.x, fromPoint.y, this.p5.mouseX, this.p5.mouseY)
  }

  connect(to, toIdx) {
    const invert = !this.fromIdx.isInput;

    if (invert) {
      return new LineBetweenDrawables(this.p5, to, toIdx, this.from, this.fromIdx);
    }

    return new LineBetweenDrawables(this.p5, this.from, this.fromIdx, to, toIdx);
  }

  canConnect(to) {
    return this.from !== to;
  }
}
