import p5, { Image } from "p5";
import { Add, ConsoleOutput, Equals, If, Input, Subtract } from "./ComputingClasses";

const imgSize = 48;

export class Tools {
  tools = [
    { icon: "square", init: () => new Input(), tip: "Input" },
    { icon: "ellipse", init: () => new Add(), tip: "Add" },
    { icon: "ellipse", init: () => new Subtract(), tip: "Subtract" },
    { icon: "ellipse", init: () => new Equals(), tip: "Equals" },
    { icon: "ellipse", init: () => new If(), tip: "If" },
    { icon: "square", init: () => new ConsoleOutput(), tip: "Output" },
  ];
  images: { [image: string]: Image } = {};

  constructor(private p5: p5) {
  }

  loadImages() {
    for (const tool of this.tools) {
      const img: Image = this.p5.loadImage("/assets/" + tool.icon + "Small.png");
      this.images[tool.icon] = img;
    }
  }

  draw() {
    this.tools.forEach((img, idx) => {
      this.p5.image(this.images[img.icon], 0, idx * 50);
    });
  }

  toolClicked({ x, y }) {
    if (x > imgSize) {
      return undefined;
    }

    return this.tools[~~(y / imgSize)];
  }
}
