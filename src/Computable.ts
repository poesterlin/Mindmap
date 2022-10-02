export class ComputeUnit {
    isError: boolean;

    constructor(public value: string | number | boolean) {
    }

    public asAny() {
        return this.value as any;
    }

    public asNumber() {
        if (typeof this.value === "string") {
            return parseInt(this.value);
        }
        return this.value;
    }

    public asString() {
        return this.value + "";
    }

    public asBoolean() {
        return !!this.value;
    }
}


export abstract class Computable {
    public prev: Computable[] = [];
    public next: { [type: string]: Computable[] };
    public outputTypes = ["output"];
    public runOutputs = ["output"];

    public value: ComputeUnit;
    public id: number;
    public fixedInputs = true;
    public nInputs = 2;
    public isDone = false;

    constructor() {
        this.id = ~~(Math.random() * 10000);
        this.next = {};
        this.outputTypes.forEach(o => this.next[o] = []);
    }

    execute(): string | undefined {
        if (this.canRun()) {
            this.value = this.compute(...this.prev.map(c => c.value));
            this.isDone = true;
            return `${this.constructor.name}(${this.id}) = ${this.value?.asAny() ?? "#novalue"}`;
        }
        return `${this.constructor.name}(${this.id}): #noop`;
    }

    canRun() {
        if (this.fixedInputs && this.nInputs !== this.prev.length) {
            return false;
        }
        return this.prev.every(i => i.isDone);
    }

    public abstract compute(...args: ComputeUnit[]): ComputeUnit;
}

export abstract class SimpleComputable extends Computable {
    fixedInputs = false;

    public compute(...args: ComputeUnit[]): ComputeUnit {
        return args.filter(a => !!a?.value).reduce((sum, value) => this.combine(value, sum), undefined);
    }

    protected abstract combine(u1: ComputeUnit, u2?: ComputeUnit): ComputeUnit;
}
