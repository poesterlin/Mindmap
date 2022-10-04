import { Link } from "../link/Link";

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
        if (typeof this.value === "boolean") {
            return this.value ? 1 : 0;
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
    public prev: Link[] = [];
    public next: Link[] = [];
    public outputTypes = ["output"];
    public runOutputs = ["output"];

    public value: ComputeUnit;
    public id: number;
    public fixedInputs = true;
    public nInputs = 2;
    public isDone = false;
    public isRunning = false;
    public onRun = () => { };
    public onDone = () => { };

    constructor() {
        this.id = ~~(Math.random() * 10000);
    }

    execute(): string | undefined {
        if (this.canRun()) {
            this.value = this.compute(...this.prev.map(c => c.getOPrevValue()));
            this.isDone = true;
            return `${this.constructor.name}(${this.id}) = ${this.value?.asAny() ?? "#novalue"}`;
        }
        return `${this.constructor.name}(${this.id}): #noop`;
    }

    canRun() {
        if (this.fixedInputs && this.nInputs !== this.prev.length) {
            return false;
        }
        return this.prev.every(i => i.isPrevDone());
    }

    public abstract compute(...args: ComputeUnit[]): ComputeUnit;
}

export abstract class AsyncComputable extends Computable {

    public abstract computeAsync(args: ComputeUnit[]): Promise<ComputeUnit>;

    execute(): string | undefined {
        if (this.canRun()) {
            this.onRun();
            this.isRunning = true;
            this.computeAsync(this.prev.map(c => c.getOPrevValue())).then(res => {
                this.value = res;
                this.isDone = true;
                this.isRunning = false;
                this.onDone();
            });
            return `${this.constructor.name}(${this.id}) = ${this.value?.asAny() ?? "#novalue"}`;
        }
        return `${this.constructor.name}(${this.id}): #noop`;
    }

    public compute() {
        return this.value;
    }
}

export abstract class SimpleComputable extends Computable {
    fixedInputs = false;

    public compute(...args: ComputeUnit[]): ComputeUnit {
        return args.filter(a => a?.value !== undefined).reduce((sum, value) => this.combine(value, sum), undefined);
    }

    protected abstract combine(u1: ComputeUnit, u2?: ComputeUnit): ComputeUnit;
}
