import { Computable, ComputeUnit, SimpleComputable } from "./Computable";

export class Input extends Computable {
    nInputs = 0;
    fixedInputs = true;

    public compute(..._args: ComputeUnit[]): ComputeUnit {
        return this.value;
    }
}

export class ConsoleOutput extends Computable {
    outputTypes = [];
    fixedInputs = false;

    public compute(...args: ComputeUnit[]): ComputeUnit {
        console.log("Output: ", ...args.map(a => a.value));
        return new ComputeUnit(args.map(a => a.asString()).join(", "));
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
        return new ComputeUnit(u1.asBoolean() && (u2?.asBoolean() ?? false));
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
        this.runOutputs = val.asBoolean() ? ["then"] : ["else"];
        return val;
    }
}

export class Set extends Computable {
    nInputs = 2;
    fixedInputs = true;

    public compute(...args: ComputeUnit[]): ComputeUnit {
        return args[0];
    }
}
