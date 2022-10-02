import p5 from "p5";
import { Computable, ComputeUnit } from "./Computable";
import { ComputeEngine } from "./ComputeEngine";
import { Drawable } from "./Drawable";
import { TempLine, LineBetweenDrawables } from "./Line";
import { SquareEl } from "./SquareEl";
import { Tools } from "./Tools";


const drawable: Drawable[] = [];
const engine = new ComputeEngine();
let setupDone = false;
let tempLine: TempLine | undefined = undefined;
let tools: Tools;
let tip: string | undefined = undefined;

const lines: LineBetweenDrawables[] = [];

export function preload(p: p5) {
  if (!p) {
    throw new Error("p5 is undefined. Something is not setup correctly 😟...");
  }
  tools = new Tools(p);
  tools.loadImages();
  setupDone = true;
}

export function setup(p: p5) {
  p.createCanvas(window.innerWidth, window.innerHeight);
  p.ellipseMode(p.CORNER);
  p.textSize(14);
}

export function draw(p: p5) {
  if (!setupDone) {
    return;
  }

  p.background(255);
  drawable.forEach((d) => d.draw());
  lines.forEach((l) => l.draw());
  if (tempLine) {
    tempLine.draw();
  }

  tools.draw();

  moveOnKeyPress(p);

  if (tip) {
    p.fill(0);
    p.stroke(0);
    p.rect(p.mouseX + 40, p.mouseY, 100, 20, 5);
    p.fill(255);
    p.noStroke();
    p.textSize(12);
    p.text(tip, p.mouseX + 45, p.mouseY + 5, 100, 20);
  }

  engine.reset();
  engine.run();
}

export function mouseClicked(p: p5) {
  const { mouseX, mouseY } = p;
  const pos = { x: mouseX, y: mouseY };
  const tool = tools.toolClicked(pos);

  if (tool) {
    let computable = tool.init();
    engine.addOperator(computable);
    drawable.push(new SquareEl(p, drawable.length, computable))
  }

  drawable.forEach((d) => d.reset());
  drawable.sort((d1, d2) => d1.zIndex - d2.zIndex).find((d) => d.collision(pos, "clicked"));

  return false;
}

export function mouseMoved(p: p5) {
  const { mouseX, mouseY } = p;
  const pos = { x: mouseX, y: mouseY };
  drawable.some((d) => d.collision(pos, "hover"));
  const tool = tools.toolClicked({ x: mouseX, y: mouseY });
  tip = tool ? tool.tip : undefined;
}

export function mouseReleased(p: p5) {
  tempLine = undefined;
}

export function mouseDragged(p: p5) {
  const { mouseX, mouseY } = p;
  const pos = { x: mouseX, y: mouseY };

  const connectionStart = drawable.find((d) => d.connectorCheck(pos).idx > -1);
  const connect = connectionStart?.connectorCheck(pos);

  if (connectionStart && !tempLine) {
    tempLine = new TempLine(p, connectionStart, connect);
  } else if (connectionStart && tempLine && tempLine.canConnect(connectionStart)) {

    const newLine = tempLine.connect(connectionStart, connect);

    const output = newLine.points[1].el.computable;
    engine.link({ isInput: newLine.points[0].el.computable, isOutput: output, outputType: output.outputTypes[tempLine.fromIdx.idx] })

    lines.push(newLine);
    tempLine = undefined;
    return;
  }

  drawable.forEach((d) => d.reset());
  if (tempLine) {
    return;
  }

  drawable.slice().reverse().some((d) => d.collision(pos, "dragged"));
}

export function moveOnKeyPress(p: p5) {
  const { LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, BACKSPACE, DELETE } = p;

  const el = drawable.find((d) => d.focused);
  if (!el) {
    return;
  }

  if (p.keyIsDown(LEFT_ARROW)) {
    el.anchor.x -= 1;
  } else if (p.keyIsDown(RIGHT_ARROW)) {
    el.anchor.x += 1;
  } else if (p.keyIsDown(UP_ARROW)) {
    el.anchor.y -= 1;
  } else if (p.keyIsDown(DOWN_ARROW)) {
    el.anchor.y += 1;
  } else if (p.keyIsDown(BACKSPACE)) {
    debounce(() => {

      const val = el.computable.value?.value;
      if (!val) {
        return;
      }

      if (typeof val === "number") {
        if (val === 0) {
          el.computable.value = undefined;
          return;
        }
        el.computable.value = new ComputeUnit(Math.floor(val / 10));
      }

      if (typeof val === "string") {
        el.computable.value = new ComputeUnit(val.substring(0, -1));
      }

      if (typeof val === "boolean") {
        el.computable.value = new ComputeUnit(!val);
      }

    }, 140, 80);

  } else if (p.keyIsDown(DELETE)) {
    // delete drawable
  }

  return false;
}

export function keyPressed(p: p5, event: any) {


  const el = drawable.find((d) => d.focused);
  if (!el) {
    return;
  }
  if (event.key.length === 1) {
    let key = event.key;
    const val = el.computable.value?.asAny();
    let newVal = val === undefined ? key : val + key;

    const parsed = parseFloat(newVal);
    if (!isNaN(parsed)) {
      newVal = parsed;
    }

    el.computable.value = new ComputeUnit(newVal);
  }
  return false;
}

var lastCall = 0;
var interval = 0;
var ref = undefined;
function debounce(func, intervalF, continueAt) {
  var now = Date.now();
  if (interval === 0) {
    interval = intervalF;
  }
  if (intervalF > continueAt) {
    interval -= 1.8;
  }
  if (lastCall + interval < now) {
    lastCall = now;
    func();
  }
  clearTimeout(ref);
  ref = setTimeout(() => (interval = 0), intervalF);
}
