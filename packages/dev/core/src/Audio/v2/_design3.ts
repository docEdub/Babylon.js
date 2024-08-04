/* eslint-disable */

import * as _ from "./_design3.interfaces";

export class OutputPin implements _.IOutputPin {
    parent: _.IOutputNode;
    connection: InputPin;
}

export class InputPin implements _.IInputPin {
    parent: _.IInputNode;
}

export class SendPin implements _.ISendPin {
    parent: _.ISendNode;
    connections: MixPin[];
}

export class MixPin implements _.IMixPin {
    parent: _.IMixNode;
}

export class Effect implements _.IInputNode, _.IOutputNode {
    input: InputPin;
    output: OutputPin;
}

export class EffectsChain implements _.IInputNode, _.IOutputNode {
    input: InputPin;
    output: OutputPin;

    chain: Effect[];
}

export class Positioner implements _.IInputNode, _.IOutputNode {
    input: InputPin;
    output: OutputPin;
}

export class Send implements _.ISend {
    parent: _.ISendNode;
    output: _.IMixNode;
    type: "pre-effects" | "pre-fader" | "post-fader" = "post-fader";
    gain: number;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class Engine {
    devices: Device[];
}

export class Device implements _.IMixNode {
    input: MixPin;
}

export class Bus implements _.IMixNode, _.IOutputNode, _.ISendNode {
    input: MixPin;
    output: OutputPin;

    preEffectsOutput: SendPin;
    preFaderOutput: SendPin;
    postFaderOutput: SendPin;

    effects: EffectsChain;
    fader: Effect;

    sends: Send[];

    constructor() {
        this.output = new OutputPin();

        const mixPin = new MixPin();
        mixPin.parent = this;

        this.output.connection = mixPin;
        this.output.connection.parent = this;
    }
}

export class AuxBus extends Bus {
    positioner: Positioner;
}

export class Source implements _.IOutputNode, _.ISendNode {
    output: OutputPin;

    preEffectsOutput: SendPin;
    preFaderOutput: SendPin;
    postFaderOutput: SendPin;

    effects: EffectsChain;
    positioner: Positioner;
    fader: Effect;

    sends: Send[];
}

export class Analyzer implements _.IMixNode {
    input: MixPin;
}
