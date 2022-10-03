import jsonata from "jsonata";
import { AsyncComputable, Computable, ComputeUnit, SimpleComputable } from "./Computable";

export class Input extends Computable {
    nInputs = 0;
    fixedInputs = true;

    public compute(..._args: ComputeUnit[]): ComputeUnit {
        this.isDone = true;
        return this.value;
    }
}

export class Boolean extends Computable {
    nInputs = 0;
    fixedInputs = true;

    constructor() {
        super();
        this.value = new ComputeUnit(true);
    }

    public compute(..._args: ComputeUnit[]): ComputeUnit {
        this.isDone = true;
        return this.value;
    }
}

export class Log extends Computable {
    outputTypes = [];
    fixedInputs = false;

    public compute(...args: ComputeUnit[]): ComputeUnit {
        console.log("Output: ", ...args.map(a => a?.value));
        this.isDone = true;
        return new ComputeUnit(args.map(a => a?.asString()).join(", "));
    }
}

export class Add extends SimpleComputable {

    protected combine(u1: ComputeUnit, u2?: ComputeUnit): ComputeUnit {
        return new ComputeUnit(u1.asAny() + (u2?.asAny() ?? 0));
    }
}

export class Subtract extends SimpleComputable {
    protected combine(u1: ComputeUnit, u2?: ComputeUnit): ComputeUnit {
        return new ComputeUnit(u1.asAny() - (u2?.asAny() ?? 0));
    }
}

export class Equals extends SimpleComputable {
    fixedInputs = true;
    nInputs = 2;

    protected combine(u1: ComputeUnit, u2?: ComputeUnit): ComputeUnit {
        if (!u2) {
            return u1;
        }
        return new ComputeUnit(u1.asAny() === u2?.asAny());
    }
}

export class And extends SimpleComputable {
    protected combine(u1: ComputeUnit, u2?: ComputeUnit): ComputeUnit {
        return new ComputeUnit(u1.asBoolean() && (u2?.asBoolean() ?? true));
    }
}

export class Or extends SimpleComputable {
    protected combine(u1: ComputeUnit, u2?: ComputeUnit): ComputeUnit {
        return new ComputeUnit(u1.asBoolean() || (u2?.asBoolean() ?? false));
    }
}

export class If extends Computable {
    outputTypes = ["then", "else"];
    fixedInputs = true;
    nInputs = 1;

    constructor() {
        super();
        this.outputTypes.forEach(o => this.next[o] = []);
    }

    public compute(...args: ComputeUnit[]): ComputeUnit {
        const val = args[0];
        this.runOutputs = val?.asBoolean() ? ["then"] : ["else"];
        this.isDone = true;
        return val;
    }
}

export class Ternary extends Computable {
    nInputs = 3;
    fixedInputs = true;

    public compute(...args: ComputeUnit[]): ComputeUnit {
        this.isDone = true;
        return args[0].asBoolean() ? args[1] : args[2];
    }
}

export class Random extends Computable {
    nInputs = 2;
    fixedInputs = true;

    public compute(...args: ComputeUnit[]): ComputeUnit {
        this.isDone = true;
        return new ComputeUnit(~~(Math.random() * (args[1].asNumber() - args[0].asNumber()) + args[0].asNumber()));
    }
}

export class JQ extends Computable {
    nInputs = 2;
    fixedInputs = true;

    public compute(...args: ComputeUnit[]): ComputeUnit {
        const json = JSON.parse(args[0].asString());
        return new ComputeUnit(jsonata(args[1].asString()).evaluate(json));
    }
}

export class Timer extends AsyncComputable {
    nInputs = 2;
    fixedInputs = true;

    public computeAsync(args: ComputeUnit[]): Promise<ComputeUnit> {
        return new Promise(res => setTimeout(() => res(new ComputeUnit(args[1]?.value ?? true)), args[0].asNumber()))
    }
}


export class Fetch extends AsyncComputable {
    nInputs = 1;
    fixedInputs = true;

    public async computeAsync(args: ComputeUnit[]): Promise<ComputeUnit> {
        const req = await fetch(args[0].asString());
        const res = await req.json();
        return new ComputeUnit(JSON.stringify(res));
    }
}
