import { Computable } from "../computing/Computable";
import { LinksDrawable } from "../drawing/classes/DrawingClasses";
import { handelSize, headerSize, inputSpacing } from "../drawing/Drawable";

export class Link {
    constructor(
        public output: Computable,
        public outputType: string,
        public inputDrawable: LinksDrawable,
        public input: Computable,
        public inputIdx,
    ) {
        this.output.next.push(this);
        this.input.prev[inputIdx] = this;
    }

    public getOPrevValue() {
        return this.output.value;
    }

    public isPrevDone(): unknown {
        return this.output.isDone && !this.output.isRunning
    }

    public unlink() {
        const idx = this.output.next.findIndex(link => link === this);
        this.output.next.splice(idx, 1);
        this.input.prev.splice(this.inputIdx);
    }

    public inputPoint() {
        return idxToPoint(this.inputIdx);
    }

    public outputPoint() {
        return idxToPoint(this.output.outputTypes.findIndex(i => i === this.outputType));
    }
}

export function idxToPoint(idx: number) {
    return headerSize + (idx + 0.5) * inputSpacing;
}