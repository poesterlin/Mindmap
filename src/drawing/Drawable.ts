import p5 from "p5";
import { Box, IPoint } from "./Entity";

const padding = 5;
export const handelSize = 10;
export const headerSize = 35;
export const inputSpacing = 20;


export abstract class Drawable {
  p5: p5;
  focused = false;
  hover = false;
  attached: Drawable[] = [];
  zIndex = 0;

  width: number;
  height: number;
  anchor: { x: number; y: number; };
  style: {
    strokeWeight: number;
    stroke: p5.Color | string | number;
    fill: p5.Color | string | number;
  };
  enabled = true;
  grow = false;

  constructor(p5: p5, z: number) {
    this.p5 = p5;
    this.zIndex = z;
    this.anchor = { x: 50, y: 50 };

    this.style = {
      strokeWeight: 2,
      stroke: 0,
      fill: 255,
    };

    this.afterHover();
    this.unSelect();
    this.enabled = true;
  }

  reset() {
    this.focused = this.hover = false;
  }

  setStyle() {
    this.p5.strokeWeight(this.style.strokeWeight);
    // @ts-ignore
    this.p5.stroke(this.style.stroke);
    // @ts-ignore
    this.p5.fill(this.style.fill);
  }

  draw() {
    this.setStyle();
    this.drawEl(this.anchor);

    if (this.attached.filter(a => a.enabled).length === 0) {
      return;
    }

    const bounds = this.attached
      .filter(a => a.enabled)
      .map(a => {
        a.setStyle();
        return a.drawEl(this.anchor)
      })
      .reduce((sum: IPoint, curr: IPoint) => {
        sum.x = Math.max(sum.x, curr.x);
        sum.y = Math.max(sum.y, curr.y);

        return sum;
      }, { x: 0, y: 0 } as IPoint);

    if (this.grow) {
      this.width = bounds.x;
      this.height = bounds.y;
    }
  }

  collision(box: Box) {
    let x1 = box.x,
      y1 = box.y,
      x2 = box.x + box.width,
      y2 = box.y + box.height;

    const rect1 = this.getBoundingBox();

    if (rect1.x > x1) { x1 = rect1.x; }
    if (rect1.y > y1) { y1 = rect1.y; }
    if (rect1.x + rect1.width < x2) { x2 = rect1.x + rect1.width; }
    if (rect1.y + rect1.height < y2) { y2 = rect1.y + rect1.height; }


    return (x2 > x1 || y2 > y1) && x2 - x1 + y2 - y1 > 0;
  }

  onClick(): void {
    this.onSelect();
  }

  moveBy({ x, y }: IPoint): void {
    this.anchor = { x: this.anchor.x + x, y: this.anchor.y + y };
  }

  getBoundingBox() {
    return { ...this.anchor, width: this.width, height: this.height }
  }

  onSelect() {

  }

  unSelect() {

  }

  beforeDelete() {

  }

  keystroke() {

  }

  abstract drawEl(anchor: IPoint): IPoint;

  abstract onHover(): void;

  abstract afterHover(): void;
}

