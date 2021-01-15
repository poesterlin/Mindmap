class EllipseEl extends Drawable {
  constructor(z) {
    super(z);
  }

  drawEl() {
    ellipse(this.anchor.x, this.anchor.y, this.drawWidth, this.height);
  }

  collisionCheck({ x, y }) {
    return x > this.anchor.x && x < this.anchor.x + this.drawWidth && y > this.anchor.y && y < this.anchor.y + this.height;
  }
}
