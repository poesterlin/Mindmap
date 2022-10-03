import { Computable, ComputeUnit } from "./Computable";
import { Input, Add, If, Log, Equals, Boolean } from "./ComputingClasses";

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
    engine.link({ isOutput: input1, isInput: adder });
    engine.link({ isOutput: input2, isInput: adder });

    engine.link({ isOutput: adder, isInput: eq });
    engine.link({ isOutput: input3, isInput: eq });

    engine.link({ isOutput: eq, isInput: ifTrue });

    engine.link({ isOutput: ifTrue, outputType: "then", isInput: output1 });
    engine.link({ isOutput: ifTrue, outputType: "else", isInput: output2 });

    await engine.run();
    console.assert(adder.value.asNumber() === 9);
    console.assert(eq.value.asBoolean() === true);
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
        const waiting = computing.filter(c => !c.canRun());
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

        this.PCs = computing.flatMap(c => c.runOutputs.flatMap(output => c.next[output])).concat(waiting).map(c => c.id);
    }

    public addOperator(...computable: Computable[]) {
        this.computables.push(...computable);
        this.reset()
    }

    public reset() {
        this.computables.filter(c => !(c instanceof Input || c instanceof Boolean)).forEach(c => c.value = undefined)
        this.PCs.push(...this.computables.filter(c => c instanceof Input || c instanceof Boolean).map(i => i.id))
    }

    public unlink(ops: { isOutput: Computable, outputType?: string; isInput: Computable }) {
        let idx = ops.isInput.prev.findIndex((o) => o.id === ops.isOutput.id);
        if (idx > -1) {
            ops.isInput.prev.splice(idx, 1);
        }
        idx = ops.isOutput.next[ops.outputType ?? "output"].findIndex((o) => o.id === ops.isInput.id);
        if (idx > -1) {
            ops.isOutput.next[ops.outputType ?? "output"].splice(idx, 1);
        }
    }

    public link(ops: { isOutput: Computable, outputType?: string; isInput: Computable, number: number }) {
        if (ops.isInput.fixedInputs && ops.isInput.prev.length >= ops.isInput.nInputs) {
            // replace input
            const isOutput = ops.isInput.prev[ops.number ?? 0];
            this.unlink({ outputType: ops.outputType, isInput: ops.isInput, isOutput });
        }
        if (ops.isInput.prev.some(p => p.id === ops.isOutput.id)) {
            return;
        }
        ops.isInput.prev.push(ops.isOutput);
        ops.isOutput.next[ops.outputType ?? "output"].push(ops.isInput);
    }

}
