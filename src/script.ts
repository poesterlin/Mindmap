import p5 from "p5";
import { Computable, ComputeUnit } from "./Computable";
import { ComputeEngine } from "./ComputeEngine";
import { Add, And, Log, Equals, If, Input, Or, Ternary, Subtract, Boolean, Timer, Random, Fetch } from "./ComputingClasses";
import { Drawable } from "./Drawable";
import { TempLine, LineBetweenDrawables } from "./Line";
import { SquareEl } from "./SquareEl";
import { Tools } from "./Tools";


let drawable: Drawable[] = [];
let engine = new ComputeEngine();
let setupDone = false;
let tempLine: TempLine | undefined = undefined;
let tools: Tools;
let tip: string | undefined = undefined;

let lines: LineBetweenDrawables[] = [];

const functions = [
  { name: "save", fn: (p: p5) => serialize(p) },
  { name: "load", fn: (p: p5) => load(p) },
  { name: "engine reset", fn: (p: p5) => { engine.reset() } },
  { name: "engine step", fn: (p: p5) => { debounce(() => engine.step(), 140, 80) } },
  { name: "engine run", fn: async (p: p5) => { await engine.run() } },
  { name: "clear", fn: (p: p5) => { drawable = []; engine = new ComputeEngine(); lines = [] } },
]

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

  lines = [];
  engine.computables.forEach(c => {
    const outputDraw = drawable.find(d => d.computable.id === c.id);

    c.outputTypes.forEach((outputType, i) => {
      c.next[outputType].forEach(output => {
        const inputDraw = drawable.find(d => d.computable.id === output.id);
        const idx = inputDraw.computable.prev.findIndex(i => i.id === c.id);

        lines.push(new LineBetweenDrawables(p, outputDraw, { idx: i, isInput: false }, inputDraw, { idx, isInput: true }))
      })
    })

  })

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
    p.textAlign(p.LEFT)
    p.noStroke();
    p.textSize(12);
    p.text(tip, p.mouseX + 45, p.mouseY + 5, 100, 20);
  }

  const h = 20, w = 100;
  functions.forEach((f, i) => {
    p.fill(0);
    p.stroke(0);
    p.rect(p.width - w, i * h, w, h);

    p.textAlign(p.CENTER)
    p.fill(255);
    p.noStroke();
    p.textSize(12);
    p.text(f.name, p.width - w, i * h + 3, w, h);
  });
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


  const h = 20, w = 100;
  if (p.width - mouseX < w && mouseY < (functions.length + 1) * h) {
    const fn = functions[~~(mouseY / h)].fn;
    fn(p);
    return;
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

  if (p.mouseButton === p.RIGHT) {

    drawable.forEach(d => {
      d.anchor.x += mouseX - p.pmouseX;
      d.anchor.y += mouseY - p.pmouseY;
    });

    return false;
  }

  const connectionStart = drawable.find((d) => d.connectorCheck(pos).idx > -1);
  const connect = connectionStart?.connectorCheck(pos);

  if (connectionStart && !tempLine) {
    tempLine = new TempLine(p, connectionStart, connect);
  } else if (connectionStart && tempLine && tempLine.canConnect(connectionStart)) {

    const newLine = tempLine.connect(connectionStart, connect);

    const output = newLine.points[1].el.computable;
    engine.link({ isInput: newLine.points[0].el.computable, isOutput: output, outputType: output.outputTypes[tempLine.fromIdx.idx], number: newLine.toIdx.idx })

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
        el.computable.value = new ComputeUnit(val.slice(0, -1));
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

export async function keyPressed(p: p5, event: any) {
  const el = drawable.find((d) => d.focused);
  if (!el) {
    return;
  }
  if (event.key.length === 1) {
    let key = event.key;

    if (p.keyIsDown(p.CONTROL) && key === 'v') {
      key = await navigator.clipboard.readText()
    }

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
function debounce(func: () => void, intervalF, continueAt) {
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


function load(p: p5) {

  const input = p.getItem('engine') as string;

  const arr: {
    id: number;
    position: {
      x: number, y: number
    };
    type: string;
    next: { [key: string]: number[] };
    value: string
  }[] = JSON.parse(input);

  drawable = [];
  lines = [];
  engine = new ComputeEngine();

  const map = new Map<number, Computable>();

  // setup objects
  arr.forEach(element => {
    const { init } = Tools.tools.find((t) => t.tip === element.type);
    const inst: Computable = init();
    engine.addOperator(inst);
    inst.value = new ComputeUnit(element.value);
    inst.id = element.id;
    map.set(element.id, inst);
  });

  // link objects
  arr.forEach(jsonEl => {
    Object.keys(jsonEl.next).forEach(t => {
      jsonEl.next[t].forEach(inputComp => {
        engine.link({ isInput: map.get(inputComp), isOutput: map.get(jsonEl.id), outputType: t, number: map.get(inputComp).prev.length })
      });
    });
  });

  // convert to drawable
  arr.forEach((element, i) => {
    const draw = new SquareEl(p, i, map.get(element.id));
    draw.anchor = element.position;
    drawable.push(draw);
  });
}

function serialize(p5: p5) {
  const obj = drawable.map(d => {
    const obj = {};
    d.computable.outputTypes.forEach(c => obj[c] = d.computable.next[c].map(c => c.id));

    return {
      id: d.computable.id,
      position: d.anchor,
      type: d.computable.constructor.name,
      next: obj,
      value: d.computable.value?.value,
    }
  });

  p5.storeItem("engine", JSON.stringify(obj));
}