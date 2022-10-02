import p5, { Image } from "p5";

const imgSize = 48;

export class Tools {
  icons = ["square", "ellipse", "save"];
  images: Image[] = [];

  constructor(private p5: p5) {
  }

  loadImages() {
    for (const icon of this.icons) {
      const img: Image = this.p5.loadImage("/assets/" + icon + "Small.png");
      this.images.push(img);
    }
  }

  draw() {
    this.images.forEach((img, idx) => {
      this.p5.image(img, 0, idx * 50);
    });
  }

  toolClicked({ x, y }) {
    if (x > imgSize) {
      return undefined;
    }

    return this.icons[~~(y / imgSize)];
  }
}
