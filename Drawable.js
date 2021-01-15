const padding = 5;
const maxWidth = 250;
const handelSize = 10;

class Drawable {
  focused = false;
  hover = false;
  zIndex = 0;
  lastDrag;
  textVal = "";
  textLength = 0;
  cursor = 0;
  width = 150;
  height = 150;

  defaultColor = {
    textStyle: NORMAL,
    strokeWeight: 2,
    stroke: color(0).toString(),
    fill: color(255).toString(),
    textSize: 20,
    textColor: color(0).toString(),
  };

  style = JSON.parse(JSON.stringify(this.defaultColor));

  constructor(z) {
    this.zIndex = z;
    this.anchor = { x: 50, y: 50 };
  }

  reset() {
    this.focused = this.hover = false;
  }

  setUpColor() {
    this.setStyle(this.style);
    if (this.hover) {
      fill(220);
    }
    if (this.focused) {
      fill(180);
    }
  }

  setUpText() {
    this.setStyle({ ...this.style, stroke: 0, fill: this.style.textColor, strokeWeight: 0 });
  }

  resetColor() {
    this.setStyle(this.defaultColor);
  }

  get handles() {
    return [
      { x: this.anchor.x, y: this.anchor.y },
      { x: this.anchor.x + this.drawWidth, y: this.anchor.y },
      { x: this.anchor.x, y: this.anchor.y + this.height },
      { x: this.anchor.x + this.drawWidth, y: this.anchor.y + this.height },
    ].map(({ x, y }) => ({ x: x - handelSize / 2, y: y - handelSize / 2 }));
  }

  get links() {
    return [
      { x: this.anchor.x + this.drawWidth / 2, y: this.anchor.y },
      { x: this.anchor.x + this.drawWidth, y: this.anchor.y + this.height / 2 },
      { x: this.anchor.x + this.drawWidth / 2, y: this.anchor.y + this.height },
      { x: this.anchor.x, y: this.anchor.y + this.height / 2 },
    ].map(({ x, y }) => ({ x: x - handelSize / 2, y: y - handelSize / 2 }));
  }

  setStyle(s) {
    strokeWeight(s.strokeWeight);
    textStyle(s.textStyle);
    textSize(s.textSize);
    stroke(color(s.stroke));
    fill(color(s.fill));
  }

  get text() {
    return this.textVal;
  }

  set text(val) {
    this.textVal = val;
    this.textLength = textWidth(this.textVal);
  }

  get drawWidth() {
    return Math.min(Math.max(this.width, this.textLength + padding * 2), maxWidth);
  }

  drawEl() {
    throw "abstract method";
  }

  draw() {
    this.setUpColor();
    this.drawEl();
    if (this.focused) {
      this.handles.forEach((h) => {
        rect(h.x, h.y, handelSize, handelSize);
      });
    } else {
      fill(30, 200, 70, 200);
      stroke(100);
      this.links.forEach((l) => {
        ellipse(l.x, l.y, handelSize, handelSize);
      });
    }
    this.setUpText();
    textAlign(CENTER);
    text(this.text, this.anchor.x + padding, this.anchor.y + this.height / 2 + 4, this.drawWidth);
    this.resetColor();
  }

  handleCheck(p) {
    if (!this.focused) {
      return -1;
    }
    return this.checkCollisionArray(p, this.handles);
  }

  connectorCheck(p) {
    if (this.focused) {
      return -1;
    }
    return this.checkCollisionArray(p, this.links);
  }

  checkCollisionArray({ x, y }, arr) {
    return arr.findIndex((h) => x > h.x && x < h.x + handelSize && y > h.y && y < h.y + handelSize);
  }

  collisionCheck() {
    return false;
  }

  collisionCheckBox(box){
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

  resize(cornerIdx, { x, y }) {
    switch (cornerIdx) {
      case 0:
        this.setWidth(this.width + this.anchor.x - x);
        this.setHeight(this.height + this.anchor.y - y);
        this.anchor = { x, y };
        break;
      case 1:
        this.setHeight(this.height + this.anchor.y - y);
        this.setWidth(x - this.anchor.x);
        this.anchor.y = y;
        break;
      case 2:
        this.setHeight(y - this.anchor.y);
        this.setWidth(this.width + this.anchor.x - x);
        this.anchor.x = x;
        break;
      case 3:
        this.setHeight(y - this.anchor.y);
        this.setWidth(x - this.anchor.x);
    }
  }

  collision({ x, y }, mode) {
    if (this.handleCheck({ x, y }) > -1) {
      return true;
    }
    const res = this.collisionCheck({ x, y });
    this.hover = res;

    if (mode === "clicked") {
      this.focused = res && !this.lastDrag;
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

