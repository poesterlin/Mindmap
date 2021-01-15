const imgSize = 48;

class Tools {
  icons = ["square", "ellipse"];
  images = [];

  constructor() {
  }

  async loadImages() {
    this.images = await Promise.all(this.icons.map((i) => new Promise((res) => loadImage("assets/" + i + "Small.png", res))));
  }

  draw() {
    this.images.forEach((img, idx) => {
      image(img, 0, idx * 50);
    });
  }

  toolClicked({ x, y }) {
    if (x > imgSize) {
      return undefined;
    }

    return this.icons[~~(y / imgSize)];
  }
}
