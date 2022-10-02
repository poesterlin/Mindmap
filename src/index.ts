// use this import in your webpack. Commented out because the CDN script exposes p5 as global
import p5 from "p5";
import { draw, keyPressed, mouseClicked, mouseDragged, mouseMoved, preload, setup } from "./script";

const containerElement = document.getElementById('p5-container');

const sketch = (p: p5) => {
    p.preload = () => preload(p);
    p.setup = () => setup(p);
    p.draw = () => draw(p);
    p.mouseClicked = () => mouseClicked(p);
    p.mouseMoved = () => mouseMoved(p);
    p.mouseDragged = () => mouseDragged(p);
    p.keyPressed = (event) => keyPressed(p, event);
};

new p5(sketch, containerElement);