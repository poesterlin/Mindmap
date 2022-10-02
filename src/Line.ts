import p5 from "p5";
import { Drawable } from "./Drawable";

export class Line {
  from: Drawable;
  to: Drawable;
  fromIdx?: number;
  toIdx?: number;

  constructor(protected p5: p5, from: Drawable, fromIdx: number, to?: Drawable, toIdx?: number) {
    this.from = from;
    this.to = to;
    this.fromIdx = fromIdx;
    this.toIdx = toIdx;
  }

  draw(ctx, saving) { }

  calcPos({ anchor, height, drawWidth }, idx, offset) {
    if (!height) {
      height = 0;
    }
    if (!drawWidth) {
      drawWidth = 0;
    }
    switch (idx) {
      case 0:
        return { x: anchor.x + drawWidth / 2, y: anchor.y - offset };
      case 1:
        return { x: anchor.x + drawWidth + offset, y: anchor.y + height / 2 };
      case 2:
        return { x: anchor.x + drawWidth / 2, y: anchor.y + height + offset };
      case 3:
        return { x: anchor.x - offset, y: anchor.y + height / 2 };
    }
  }
}

export class LineBetweenDrawables extends Line {
  triangleSize: number;
  points: { el: any; idx: any; }[];
  constructor(p5: p5, from, fromIdx, to, toIdx) {
    super(p5, from, fromIdx, to, toIdx);

    this.triangleSize = 5;

    this.points = [{ el: from, idx: fromIdx }, { el: to, idx: toIdx }];
  }

  addPoint(x, y) {
    const first = this.points.pop();
    this.points.push({ el: { drawWidth: 0, anchor: { x, y }, height: 0 }, idx: -1 })
    this.points.push(first);
  }

  draw(ctx, saving) {
    const fromPoint = this.calcPos(this.points[0].el, this.points[0].idx, 0);
    ctx.beginPath();
    ctx.moveTo(fromPoint.x, fromPoint.y);
    let wrongSide = false;

    const toPoint = this.points.slice(1).reduce((from, to) => {
      let idx = to.idx;
      let offset = 2 * this.triangleSize;
      if (to.idx === -1) {
        idx = 0;
        offset = 0;
      }
      let toPoint = this.calcPos(to.el, idx, offset);

      switch (idx) {
        case 0:
          wrongSide = from.y > toPoint.y;
          break;
        case 1:
          wrongSide = from.x < toPoint.x;
          break;
        case 2:
          wrongSide = from.y < toPoint.y;
          break;
        case 3:
          wrongSide = from.x > toPoint.x;
          break;
      }

      if (wrongSide) {
        toPoint = this.calcPos(to.el, idx, -offset);
      }

      if (this.toIdx === 0 || this.toIdx === 2) {
        ctx.bezierCurveTo(from.x, from.y, toPoint.x, from.y, toPoint.x, toPoint.y);
      } else {
        ctx.bezierCurveTo(from.x, from.y, from.x, toPoint.y, toPoint.x, toPoint.y);
      }

      return toPoint;
    }, fromPoint);
    ctx.stroke();
    this.p5.push();
    this.p5.translate(toPoint.x, toPoint.y);
    this.p5.angleMode(this.p5.DEGREES);
    this.p5.rotate(this.toIdx * 90);
    if (wrongSide) {
      this.p5.rotate(180);
    }
    this.p5.fill(0);
    this.p5.triangle(0, 0, this.triangleSize, -2 * this.triangleSize, -this.triangleSize, -2 * this.triangleSize);
    this.p5.pop();


    // draw control points
    if (saving) {
      return;
    }
    const r = 5;
    this.points.slice(1, -1).forEach(p => {
      this.p5.ellipse(p.el.anchor.x - r, p.el.anchor.y - r, 2 * r, 2 * r);
    })
  }
}

export class TempLine extends Line {
  constructor(p5: p5, from, fromIdx) {
    super(p5, from, fromIdx);
  }

  draw(ctx, toPoint) {
    const fromPoint = this.calcPos(this.from, this.fromIdx, 0);
    ctx.beginPath();
    ctx.moveTo(fromPoint.x, fromPoint.y);
    ctx.bezierCurveTo(fromPoint.x, toPoint.y, fromPoint.x, toPoint.y, toPoint.x, toPoint.y);
    ctx.stroke();
  }

  connect(to, toIdx) {
    return new LineBetweenDrawables(this.p5, this.from, this.fromIdx, to, toIdx);
  }

  canConnect(to) {
    return this.from !== to;
  }
}