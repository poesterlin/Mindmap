import p5 from "p5";
import { Drawable } from "./Drawable";
import { EllipseEl } from "./EllipseEl";
import { TempLine } from "./Line";
import { SquareEl } from "./SquareEl";
import { Tools } from "./Tools";


const drawable: Drawable[] = [];
let setupDone = false;
let resizeMode = undefined;
let tempLine = undefined;
let saving = false;
let tools: Tools;

const lines = [];

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

  // setupDone = true;
}

export function draw(p: p5) {
  if (!setupDone) {
    return;
  }


  p.background(255);
  drawable.forEach((d) => d.draw({ saving }));
  lines.forEach((l) => l.draw(p.drawingContext, saving));
  if (tempLine) tempLine.draw(p.drawingContext, { x: p.mouseX, y: p.mouseY });

  if (!saving) {
    tools.draw();
  }

  moveOnKeyPress(p);
}

export function mouseClicked(p: p5) {
  const { mouseX, mouseY } = p;
  const pos = { x: mouseX, y: mouseY };
  const tool = tools.toolClicked(pos);

  if (tool) {
    switch (tool) {
      case "square":
        drawable.push(new SquareEl(p, drawable.length));
        break;
      case "ellipse":
        drawable.push(new EllipseEl(p, drawable.length));
        break;
      case "save":
        saveThisCanvas(p);
        break;
    }
    return false;
  }

  drawable.forEach((d) => d.reset());
  drawable.sort((d1, d2) => d1.zIndex - d2.zIndex).find((d) => d.collision(pos, "clicked"));

  return false;
}

export function mouseMoved(p: p5) {
  const { mouseX, mouseY } = p;
  const pos = { x: mouseX, y: mouseY };
  drawable.some((d) => d.collision(pos, "hover"));
}

export function mouseReleased(p: p5) {
  tempLine = undefined;
  resizeMode = undefined;

  lines[0]?.addPoint(100, 200)
}

export function mouseDragged(p: p5) {
  const { mouseX, mouseY } = p;
  const pos = { x: mouseX, y: mouseY };

  const connectionStart = drawable.find((d) => d.connectorCheck(pos) > -1);

  if (connectionStart && !tempLine) {
    tempLine = new TempLine(p, connectionStart, connectionStart.connectorCheck(pos));
  } else if (connectionStart && tempLine && tempLine.canConnect(connectionStart)) {
    const newLine = tempLine.connect(connectionStart, connectionStart.connectorCheck(pos));
    lines.push(newLine);
    tempLine = undefined;
    return;
  }

  const resizeElement = drawable.find((d) => d.handleCheck(pos) > -1);
  if (resizeElement) {
    resizeMode = { el: resizeElement, handle: resizeElement.handleCheck(pos) };
  }

  if (resizeMode) {
    resizeMode.el.resize(resizeMode.handle, pos);
    return;
  }

  drawable.forEach((d) => d.reset());
  const hover = drawable.some((d) => d.collision(pos, "dragged"));
  if (hover) return;

  // if(!selectMode){
  //   selectMode = pos;
  // }

  // if(selectMode){
  //   drawable.some((d) => d.collisionCheckBox(pos, "dragged"))

  // }
}

export function moveOnKeyPress(p: p5) {
  const { LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, BACKSPACE } = p;

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
    debounce(() => (el.text = el.text.slice(0, -1)), 140, 80);
  }

  return false;
}

export function keyPressed(p: p5, event: any) {
  const el = drawable.find((d) => d.focused);
  if (!el) {
    return;
  }
  if (event.key.length === 1) {
    el.text += event.key;
  }
  lastCall = 0;
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

function saveThisCanvas(p: p5) {
  saving = true;
  setTimeout(() => {
    p.saveCanvas('mindmap', 'png')
    saving = false;
  }, (1000 / p.frameRate()) * 10);
}