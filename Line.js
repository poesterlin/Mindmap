class Line {
  constructor(from, fromIdx, to, toIdx) {
    this.from = from;
    this.to = to;
    this.fromIdx = fromIdx;
    this.toIdx = toIdx;
  }

  draw() {}

  calcPos(el, idx, offset) {
    switch (idx) {
      case 0:
        return { x: el.anchor.x + el.drawWidth / 2, y: el.anchor.y - offset };
      case 1:
        return { x: el.anchor.x + el.drawWidth + offset, y: el.anchor.y + el.height / 2 };
      case 2:
        return { x: el.anchor.x + el.drawWidth / 2, y: el.anchor.y + el.height + offset };
      case 3:
        return { x: el.anchor.x - offset, y: el.anchor.y + el.height / 2 };
    }
  }
}

class LineBetweenDrawables extends Line {
  constructor(from, fromIdx, to, toIdx) {
    super();

    this.from = from;
    this.to = to;
    this.fromIdx = fromIdx;
    this.toIdx = toIdx;
  }

  draw(ctx) {
    const fromPoint = this.calcPos(this.from, this.fromIdx, 0);
    let toPoint = this.calcPos(this.to, this.toIdx, 30);
    ctx.beginPath();
    ctx.moveTo(fromPoint.x, fromPoint.y);

    let wrongSide = false;
    switch (this.toIdx) {
      case 0:
        wrongSide = fromPoint.y > toPoint.y;
        break;
      case 1:
        wrongSide = fromPoint.x < toPoint.x;
        break;
      case 2:
        wrongSide = fromPoint.y < toPoint.y;
        break;
      case 3:
        wrongSide = fromPoint.x > toPoint.x;
        break;
    }

    if (wrongSide) {
      toPoint = this.calcPos(this.to, this.toIdx, -30);
    }

    if (this.toIdx === 0 || this.toIdx === 2) {
      ctx.bezierCurveTo(fromPoint.x, fromPoint.y, toPoint.x, fromPoint.y, toPoint.x, toPoint.y);
    } else {
      ctx.bezierCurveTo(fromPoint.x, fromPoint.y, fromPoint.x, toPoint.y, toPoint.x, toPoint.y);
    }

    ctx.stroke();
    push();
    toPoint = this.calcPos(this.to, this.toIdx, 0);
    translate(toPoint.x, toPoint.y);
    angleMode(DEGREES);
    rotate(this.toIdx * 90);
    if (wrongSide) {
      rotate(180);
    }
    fill(0);
    triangle(0, 0, 15, -30, -15, -30);
    pop();
  }
}

class TempLine extends Line {
  constructor(from, fromIdx) {
    super();
    this.from = from;
    this.fromIdx = fromIdx;
  }

  draw(ctx, toPoint) {
    const fromPoint = this.calcPos(this.from, this.fromIdx, 0);
    ctx.beginPath();
    ctx.moveTo(fromPoint.x, fromPoint.y);
    ctx.bezierCurveTo(fromPoint.x, toPoint.y, fromPoint.x, toPoint.y, toPoint.x, toPoint.y);
    ctx.stroke();
  }

  connect(to, toIdx) {
    return new LineBetweenDrawables(this.from, this.fromIdx, to, toIdx);
  }

  canConnect(to) {
    return this.from !== to;
  }
}
