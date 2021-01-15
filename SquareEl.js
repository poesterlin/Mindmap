const r = 5;
class SquareEl extends Drawable {
  constructor(z) {
    super(z);
  }

  drawEl() {
    rect(this.anchor.x, this.anchor.y, this.drawWidth, this.height, r);
  }

  collisionCheck({ x, y }) {
    return x > this.anchor.x && x < this.anchor.x + this.drawWidth && y > this.anchor.y && y < this.anchor.y + this.height;
  }
}
