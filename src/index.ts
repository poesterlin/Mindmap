// use this import in your webpack. Commented out because the CDN script exposes p5 as global
import p5 from "p5";
import { draw,  mouseClicked, mouseDragged, mouseMoved, mouseReleased, moveOnKeyPress, preload, setup } from "./script";
import { testCompute } from "./computing/ComputeEngine";

const containerElement = document.getElementById('p5-container');
containerElement.addEventListener("contextmenu", (e) => e.preventDefault());

const sketch = (p: p5) => {
    p.preload = () => preload(p);
    p.setup = () => setup(p);
    p.draw = () => draw(p);
    p.mouseClicked = () => mouseClicked(p);
    p.mouseMoved = () => mouseMoved(p);
    p.mouseDragged = () => mouseDragged(p);
    p.mouseReleased = () => mouseReleased(p);
    p.keyPressed = ()=> moveOnKeyPress(p);
};

new p5(sketch, containerElement);

testCompute();
