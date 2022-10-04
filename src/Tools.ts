import p5, { Image } from "p5";
import { Add, And, Boolean, Log, Equals, If, Input, Or, Ternary, Subtract, Random, Timer, Fetch, JQ } from "./computing/ComputingClasses";
import { InputDrawable } from "./drawing/classes/DrawingClasses";

const imgSize = 48;

export class Tools {
  public static tools = [
    { icon: "square", initDrawable: (p, z, c) => new InputDrawable(p, z, c), init: () => new Input(), tip: "Input" },
    { icon: "square", initDrawable: (p, z, c) => new InputDrawable(p, z, c), init: () => new Boolean(), tip: "Boolean" },
    { icon: "ellipse", initDrawable: (p, z, c) => new InputDrawable(p, z, c), init: () => new Add(), tip: "Add" },
    { icon: "ellipse", initDrawable: (p, z, c) => new InputDrawable(p, z, c), init: () => new Subtract(), tip: "Subtract" },
    { icon: "ellipse", initDrawable: (p, z, c) => new InputDrawable(p, z, c), init: () => new Equals(), tip: "Equals" },
    { icon: "ellipse", initDrawable: (p, z, c) => new InputDrawable(p, z, c), init: () => new And(), tip: "And" },
    { icon: "ellipse", initDrawable: (p, z, c) => new InputDrawable(p, z, c), init: () => new Or(), tip: "Or" },
    { icon: "ellipse", initDrawable: (p, z, c) => new InputDrawable(p, z, c), init: () => new If(), tip: "If" },
    { icon: "ellipse", initDrawable: (p, z, c) => new InputDrawable(p, z, c), init: () => new Ternary(), tip: "Ternary" },
    { icon: "ellipse", initDrawable: (p, z, c) => new InputDrawable(p, z, c), init: () => new Random(), tip: "Random" },
    { icon: "ellipse", initDrawable: (p, z, c) => new InputDrawable(p, z, c), init: () => new Timer(), tip: "Timer" },
    { icon: "ellipse", initDrawable: (p, z, c) => new InputDrawable(p, z, c), init: () => new Fetch(), tip: "Fetch" },
    { icon: "ellipse", initDrawable: (p, z, c) => new InputDrawable(p, z, c), init: () => new JQ(), tip: "JQ" },
    { icon: "square", initDrawable: (p, z, c) => new InputDrawable(p, z, c), init: () => new Log(), tip: "Log" },
  ];
  images: { [image: string]: Image } = {};

  constructor(private p5: p5) {
  }

  loadImages() {
    for (const tool of Tools.tools) {
      const img: Image = this.p5.loadImage("/assets/" + tool.icon + "Small.png");
      this.images[tool.icon] = img;
    }
  }
}
