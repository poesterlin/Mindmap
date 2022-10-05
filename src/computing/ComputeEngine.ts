import { Computable, ComputeUnit } from "./Computable";
import { Input, Add, If, Log, Equals, Boolean } from "./ComputingClasses";
import { Link } from "../link/Link";
import { Drawable } from "../drawing/Drawable";
import { InputDrawable, LinksDrawable } from "../drawing/classes/DrawingClasses";

export async function testCompute() {

    const engine = new ComputeEngine();

    const input1 = new Input();
    input1.value = new ComputeUnit(5);


    const input2 = new Input();
    input2.value = new ComputeUnit(4);

    const adder = new Add();


    const input3 = new Input();
    input3.value = new ComputeUnit(9);

    const eq = new Equals();

    const ifTrue = new If();

    const output1 = new Log();
    const output2 = new Log();

    engine.addOperator(adder, ifTrue, eq, input1, input2, input3, output1, output2);
    engine.link({ isOutput: input1, isInput: adder, number: 0 });
    engine.link({ isOutput: input2, isInput: adder, number: 1 });

    engine.link({ isOutput: adder, isInput: eq, number: 0 });
    engine.link({ isOutput: input3, isInput: eq, number: 1 });

    engine.link({ isOutput: eq, isInput: ifTrue, number: 0 });

    engine.link({ isOutput: ifTrue, outputType: "then", isInput: output1, number: 0 });
    engine.link({ isOutput: ifTrue, outputType: "else", isInput: output2, number: 1 });

    await engine.run();
    // console.assert(adder.value.asNumber() === 9);
    // console.assert(eq.value.asBoolean() === true);
}

export class ComputeEngine {
    public debug = true;
    public computables: Computable[] = [];
    private PCs: number[] = [];
    public logs: string[] = [];

    public async run() {
        let c = 0;
        while (this.PCs.length > 0) {
            if (c >= 10000) {
                return;
            }

            c += 1;
            this.step();
            await new Promise(res => setTimeout(res, 10));
        }
    }

    public step() {
        const computing = this.computables.filter(c => this.PCs.includes(c.id))
        const waiting = computing.filter(c => !c.canRun()).map(o => o.id);
        const running = computing.filter(c => c.canRun());

        if (running.length === 0) {
            this.PCs = [];
            return;
        }

        const newLogs = running.map(c => c.execute()).filter(l => !!l);
        if (newLogs.length > 0) {
            this.logs.push(...newLogs);
            console.log(newLogs);
        }

        this.PCs = computing
            .flatMap(c =>
                c.runOutputs.flatMap(output => c.next.filter(o => o.outputType === output))
                    .map(o => o.input.id)
            )
            .concat(waiting);
    }

    public addOperator(...computable: Computable[]) {
        this.computables.push(...computable);
        this.reset()
    }

    public reset() {
        this.computables.filter(c => !(c instanceof Input || c instanceof Boolean)).forEach(c => c.value = undefined)
        this.PCs.push(...this.computables.filter(c => c instanceof Input || c instanceof Boolean).map(i => i.id))
    }

    public unlink(ops: { isOutput: Computable, outputType?: string; isInput: Computable, idx: number }) {
        ops.isInput.prev[ops.idx].unlink();
    }

    public link(ops: { isOutput: Computable, outputType?: string; isInput: LinksDrawable, number: number }) {
        new Link(ops.isOutput, ops.outputType, ops.isInput, ops.isInput.computable, ops.number);
    }

}
