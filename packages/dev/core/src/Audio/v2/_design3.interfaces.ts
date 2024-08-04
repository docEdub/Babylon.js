/* eslint-disable */

/*
- To simplify the design, input and mix pins don't know about their upstream connections. This means pin connections
  are only updated by the upstream pin, and the following rules apply:
    - The upstream pin makes direct function calls to update the downstream connection when needed.
    - The downstream pin notifies the upstream pin to update the downstream connection.
    - Downstream pins do not make direct calls to update connections.
    - Upstream pins do not need to notify downstream pins of connection changes.
    - Downstream pins do not need to observe upstream pins.
*/

export interface IOutputPin {
    parent: IOutputNode;
    connection: IInputPin;
}

export interface IInputPin {
    parent: IInputNode;
}

export interface ISendPin {
    parent: ISendNode;
    connections: IMixPin[];
}

export interface IMixPin extends IInputPin {
    parent: IMixNode;
}

export interface IInputNode {
    input: IInputPin;
}

export interface IOutputNode {
    output: IOutputPin;
}

export interface IMixNode extends IInputNode {
    input: IMixPin;
}

export interface ISendNode {
    preEffectsOutput: ISendPin;
    preFaderOutput: ISendPin;
    postFaderOutput: ISendPin;
}

export interface ISend {
    parent: ISendNode;
    output: IMixNode;
    type: "pre-effects" | "pre-fader" | "post-fader";
    gain: number;
}
