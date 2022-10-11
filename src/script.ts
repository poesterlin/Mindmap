// @ts-nocheck
import p5, { Image } from "p5";

const mouseRes = 350;

let setupDone = false;
let img: Image;
let imgBlured: Image;
let canvas: HTMLCanvasElement;
let isLocked = false;
let capture: p5.Element;
let p5: p5 = undefined;
const w = window.innerWidth, h = window.innerHeight;

let raster, param, pmat, resultMat, detector;

let x = 0;
let y = 0;
let rlX = 0;
let rlY = 0;

let vec: p5.Vector;
let angle = 0;
let trackingSafeUntil = 0;
let aspectRatio = window.innerWidth / window.innerHeight;
let imageSize: [number, number] = [4920, 3475];
let panelSize = [90.5, 116.5].map(v => v * mouseRes);
let cutoutSize: [number, number] = [500, 500 * aspectRatio];

export function preload(p: p5) {
  img = p.loadImage("/assets/Plan.png");
  imgBlured = p.loadImage("/assets/PlanBlurred.png");
  p5 = p;
}

export function setup(p: p5) {
  p.pixelDensity(1); // this makes the internal p5 canvas smaller
  const renderer = p.createCanvas(window.innerWidth, window.innerHeight);
  canvas = renderer.canvas;

  canvas.requestPointerLock();

  canvas.onclick = () => {
    canvas.requestPointerLock();
    isLocked = true;
  }

  document.addEventListener("mousemove", updatePosition, false);

  capture = p.createCapture({ audio: false, video: { width: w, height: h } });
  capture.hide();

  raster = new NyARRgbRaster_Canvas2D(canvas);
  param = new FLARParam(window.innerWidth, window.innerHeight);
  pmat = mat4.identity();
  param.copyCameraMatrix(pmat, 100, 10000);
  resultMat = new NyARTransMatResult();
  detector = new FLARMultiIdMarkerDetector(param, 2);
  detector.setContinueMode(true);

  setupDone = true;
}

export function draw(p: p5) {
  if (!setupDone || !p) {
    return;
  }
  canvas.changed = true;
  p.background(0);

  if (!isLocked) {
    p.fill(255);
    p.noStroke();
    p.text("bitte einmal klicken", p.width / 2, p.height / 2);
    // return;
  }

  drawCamera(p);

  if (detector.detectMarkerLite(raster, 100) !== 0) {
    detector.getTransformMatrix(0, resultMat);

    // convert the transformation to account for our camera
    const mat = resultMat;
    const cm = mat4.create();
    cm[0] = mat.m00, cm[1] = -mat.m10, cm[2] = mat.m20, cm[3] = 0;
    cm[4] = mat.m01, cm[5] = -mat.m11, cm[6] = mat.m21, cm[7] = 0;
    cm[8] = -mat.m02, cm[9] = mat.m12, cm[10] = -mat.m22, cm[11] = 0;
    cm[12] = mat.m03, cm[13] = -mat.m13, cm[14] = mat.m23, cm[15] = 1;
    mat4.multiply(pmat, cm, cm);

    // define a set of 3d vertices
    var q = 1;
    var verts = [
      vec4.create(-q, -q, 0, 1),
      vec4.create(q, -q, 0, 1),
    ];

    // convert that set of vertices from object space to screen space
    var w2 = p.width / 2,
      h2 = p.height / 2;
    verts.forEach(function (v) {
      mat4.multiplyVec4(cm, v);
      v[0] = v[0] * w2 / v[3] + w2;
      v[1] = -v[1] * h2 / v[3] + h2;
    });

    vec = p.createVector(verts[1][0] - verts[0][0], verts[1][1] - verts[0][1]).normalize();

    p.angleMode(p.DEGREES)
    angle = vec.angleBetween(p.createVector(1, 0));
    trackingSafeUntil = p.millis() + 3000;
    console.log("tracked")
  }

  if (vec) {
    const rl = getRLPosition(p);

    rlX = rl.x;
    rlY = rl.y;
  }

  const minimap = 600;
  
  const pix = img.get(rlX + cutoutSize[0] / 2, Math.floor(rlY + cutoutSize[1] / 2));
  p.fill(pix[0], pix[1], pix[2])
  p.image(img, minimap, 0, p.width, p.height, rlX, rlY, ...cutoutSize);

  img.set(rlX + cutoutSize[0] / 2, Math.floor(rlY + cutoutSize[1] / 2), [255, 0, 255, 255]);

  p.circle(600 + (p.width - 600) / 2, p.height / 2, 50)
  p.strokeWeight(10);
  p.stroke(0)
  const lx = 600 + (p.width - 600) / 2;
  const ly = p.height / 2;
  if (vec) {
    let angleVec = vec.copy().setMag(50).rotate(90);
    p.line(lx, ly, lx + angleVec.x, ly + angleVec.y)
    angleVec = angleVec.rotate(90)
    p.line(lx, ly, lx + angleVec.x, ly + angleVec.y)
  }

  p.strokeWeight(1);
  const minimapStart = p.height / 2;

  p.image(img, 0, minimapStart, minimap, minimapStart);
  p.noFill();
  p.stroke(255, 0, 0);
  p.rect(p.map(rlX, 0, imageSize[0], 0, minimap), p.map(rlY, 0, imageSize[1], minimapStart, minimapStart + minimap), ...scale(p, minimap * aspectRatio, minimap, [minimap, minimap]));

  p.noStroke();
  if (!isTrackingSafe(p)) {
    p.fill(255, 0, 0)
    p.text("angle tracking lost", p.width / 2, 100);
  }

  p.fill(0, 255, 0)
  p.text("angle: " + angle.toFixed(0) + "°", w2, 100);

  p.fill(255, 0, 0);

  p.textSize(25)
  p.textAlign(p.CENTER)
  p.fill(0, 100, 255)
  p.text('x: ' + x, p.width - 100, 35)
  p.text('y: ' + y, p.width - 100, 65)
}

function scale(p: p5, x, y, [x2, y2]): [number, number] {
  return [p.map(x, 0, imageSize[0], 0, x2), p.map(y, 0, imageSize[1], 0, y2)]
}

function getRLPosition(p: p5) {
  return p.createVector(x, y).add(vec.mult(8.3 * mouseRes)) // 3.2
}

function drawCamera(p: p5) {
  p.image(capture, 0, 0, 600, p.height / 2);
}

function isTrackingSafe(p: p5) {
  return p.millis() < trackingSafeUntil
}

function updatePosition(e: MouseEvent) {
  if (!vec) {
    x += e.movementX;
    y += e.movementY;
    return;
  }

  const updateVec = p5.createVector(e.movementX, e.movementY).rotate(vec.heading())

  x += updateVec.x;
  y += updateVec.y;
}
















