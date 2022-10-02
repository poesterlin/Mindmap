import { Computable, ComputeUnit } from "./Computable";
import { Input, Add, If, ConsoleOutput, Equals, Boolean } from "./ComputingClasses";

export function testCompute() {

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

    const output1 = new ConsoleOutput();
    const output2 = new ConsoleOutput();

    engine.addOperator(adder, ifTrue, eq, input1, input2, input3, output1, output2);
    engine.link({ isOutput: input1, isInput: adder });
    engine.link({ isOutput: input2, isInput: adder });

    engine.link({ isOutput: adder, isInput: eq });
    engine.link({ isOutput: input3, isInput: eq });

    engine.link({ isOutput: eq, isInput: ifTrue });

    engine.link({ isOutput: ifTrue, outputType: "then", isInput: output1 });
    engine.link({ isOutput: ifTrue, outputType: "else", isInput: output2 });

    engine.run();
    console.assert(adder.value.asNumber() === 9);
    console.assert(eq.value.asBoolean() === true);
}

export class ComputeEngine {
    public debug = true;
    public computables: Computable[] = [];
    private PCs: number[] = [];
    public logs: string[] = [];

    public run() {
        let c = 0;
        while (this.PCs.length > 0) {
            if (c >= 10000) {
                return;
            }

            c += 1;
            this.step();
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
        this.PCs.push(...this.computables.filter(c => c instanceof Input || c instanceof Boolean).map(i => i.id))
    }

    public link(ops: { isOutput: Computable, outputType?: string; isInput: Computable }) {
        if (ops.isInput.fixedInputs && ops.isInput.prev.length >= ops.isInput.nInputs) {
            return
        }
        if (ops.isInput.prev.some(p => p.id === ops.isOutput.id)) {
            return;
        }
        ops.isInput.prev.push(ops.isOutput);
        ops.isOutput.next[ops.outputType ?? "output"].push(ops.isInput);
    }

}
