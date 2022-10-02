const drawable = [];
const tools = new Tools();
let setupDone = false;
let selectMode = false;
let resizeMode = undefined;
let tempLine = undefined;
let saving = false;

const lines = [];

async function setup() {
  await tools.loadImages();
  createCanvas(window.innerWidth, window.innerHeight);
  ellipseMode(CORNER);
  textSize(14);

  setupDone = true;
}

function draw() {
  background(255);
  if (!setupDone) {
    return;
  }
  drawable.forEach((d) => d.draw({ saving }));
  lines.forEach((l) => l.draw(drawingContext, saving));
  if (tempLine) tempLine.draw(drawingContext, { x: mouseX, y: mouseY });

  if (!saving) {
    tools.draw();
  }

  moveOnKeyPress();
}

function mouseClicked(_event) {
  const pos = { x: mouseX, y: mouseY };
  const tool = tools.toolClicked(pos);

  if (tool) {
    switch (tool) {
      case "square":
        drawable.push(new SquareEl(drawable.length));
        break;
      case "ellipse":
        drawable.push(new EllipseEl(drawable.length));
        break;
      case "save":
        saveThisCanvas();
        break;
    }
    return false;
  }

  drawable.forEach((d) => d.reset());
  drawable.sort((d1, d2) => d1.zIndex - d2.zIndex).find((d) => d.collision(pos, "clicked"));

  return false;
}

function mouseMoved() {
  const pos = { x: mouseX, y: mouseY };
  drawable.some((d) => d.collision(pos, "hover"));
}

function mouseReleased() {
  tempLine = undefined;
  resizeMode = undefined;

  lines[0]?.addPoint(100, 200)
}

function mouseDragged() {
  const pos = { x: mouseX, y: mouseY };

  const connectionStart = drawable.find((d) => d.connectorCheck(pos) > -1);

  if (connectionStart && !tempLine) {
    tempLine = new TempLine(connectionStart, connectionStart.connectorCheck(pos));
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

function moveOnKeyPress() {
  const el = drawable.find((d) => d.focused);
  if (!el) {
    return;
  }

  if (keyIsDown(LEFT_ARROW)) {
    el.anchor.x -= 1;
  } else if (keyIsDown(RIGHT_ARROW)) {
    el.anchor.x += 1;
  } else if (keyIsDown(UP_ARROW)) {
    el.anchor.y -= 1;
  } else if (keyIsDown(DOWN_ARROW)) {
    el.anchor.y += 1;
  } else if (keyIsDown(BACKSPACE)) {
    debounce(() => (el.text = el.text.slice(0, -1)), 140, 80);
  }

  return false;
}

function keyPressed(event) {
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

function saveThisCanvas() {
  saving = true;
  console.log(frameRate())
  setTimeout(() => {
    saveCanvas('mindmap', 'png')
    saving = false;
  }, (1000 / frameRate()) * 10);
}