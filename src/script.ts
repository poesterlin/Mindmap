import p5 from "p5";
import { Computable, ComputeUnit } from "./computing/Computable";
import { ComputeEngine } from "./computing/ComputeEngine";
import { TempLine, LineBetweenDrawables } from "./link/Line";
import { Tools } from "./Tools";
import { EntityModel, IPoint } from "./drawing/Entity";
import { FunctionDrawable } from "./drawing/classes/Function";
import { ToolDrawable } from "./drawing/classes/Tools";
import { LinksDrawable } from "./drawing/classes/DrawingClasses";

let entityModel = new EntityModel();
let engine = new ComputeEngine();
let setupDone = false;
let tempLine: TempLine | undefined = undefined;
let tools: Tools;

const functions = [
  { name: "save", fn: (p: p5) => serialize(p) },
  { name: "load", fn: (p: p5) => load(p) },
  { name: "engine reset", fn: (p: p5) => { engine.reset() } },
  { name: "engine step", fn: (p: p5) => { debounce(() => engine.step(), 140, 80) } },
  { name: "engine run", fn: async (p: p5) => { await engine.run() } },
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

  functions.forEach((f, i) => {
    entityModel.add(new FunctionDrawable(p, i, f.name, f.fn));
  })

  Tools.tools.forEach((t, i) => {
    const fn = () => {
      const computable = t.init();
      const drawable = t.initDrawable(p, 1, computable);

      engine.addOperator(computable);
      engine.link({ isInput: drawable.attached[0] as LinksDrawable, isOutput: computable, number: 0 })
      entityModel.add(drawable);
    }
    entityModel.add(new ToolDrawable(p, i, t.tip, tools.images[t.icon], fn));
  })
}

export function draw(p: p5) {
  if (!setupDone) {
    return;
  }

  p.background(255);

  entityModel.draw();

  // if (tempLine) {
  //   tempLine.draw();
  // }

}

export function mouseClicked(p: p5) {
  if (!p.keyIsDown(p.CONTROL)) {
    entityModel.unSelectAll();
  }
  entityModel.select(p);
}

export function mouseMoved(p: p5) {
  entityModel.hover(p);
}

export function mouseReleased(p: p5) {
  entityModel.unselect();
}

export function mouseDragged(p5: p5) {
  entityModel.moveWithMouse(p5);

  // todo temporary link

  if (p5.mouseButton === p5.RIGHT || entityModel.getSelected().length === 0) {
    const by: IPoint = { x: p5.mouseX - p5.pmouseX, y: p5.mouseY - p5.pmouseY };
    entityModel.moveAll(by)
  }
}

export function moveOnKeyPress(p: p5) {
  const { LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, DELETE } = p;

  if (p.keyIsDown(DELETE)) {
    const drawable = entityModel.getSelected();
    drawable.forEach(element => {
      entityModel.delete(element)
    });

    return false;
  }

  if (p.keyIsDown(LEFT_ARROW)) {
    entityModel.moveSelected({ x: -1, y: 0 });
  } else if (p.keyIsDown(RIGHT_ARROW)) {
    entityModel.moveSelected({ x: 1, y: 0 });
  } else if (p.keyIsDown(UP_ARROW)) {
    entityModel.moveSelected({ x: 0, y: -1 });
  } else if (p.keyIsDown(DOWN_ARROW)) {
    entityModel.moveSelected({ x: 0, y: 1 });
  }

  const drawable = entityModel.getSelected();
  debounce(() =>
    drawable.forEach(element => {
      element.keystroke();
    })
    , 140, 80);

  return false;
}

var lastCall = 0;
var interval = 0;
var ref = undefined;
export function debounce(func: () => void, intervalF, continueAt) {
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

  engine = new ComputeEngine();

  const map = new Map<number, Computable>();

  // setup objects
  arr.forEach((element, i) => {
    const { init, initDrawable } = Tools.tools.find((t) => t.tip === element.type);
    const inst: Computable = init();
    engine.addOperator(inst);
    inst.value = new ComputeUnit(element.value);
    inst.id = element.id;
    map.set(element.id, inst);

    const draw = initDrawable(p, i, inst);
    draw.anchor = element.position;
    entityModel.add(draw);
  });

  // link objects
  arr.forEach(jsonEl => {
    Object.keys(jsonEl.next).forEach(t => {
      jsonEl.next[t].forEach(inputComp => {
        engine.link({ isInput: map.get(inputComp), isOutput: map.get(jsonEl.id), outputType: t, number: map.get(inputComp).prev.length })
      });
    });
  });
}

function serialize(p5: p5) {
  const obj = engine.computables.map(d => {
    const obj = {};
    d.outputTypes.forEach(c => obj[c] = d.next[c].map(c => c.id));

    return {
      id: d.id,
      position: { x: 0, y: 0 }, // TODO
      type: d.constructor.name,
      next: obj,
      value: d.value?.value,
    }
  });

  p5.storeItem("engine", JSON.stringify(obj));
}