/* eslint-disable */

export interface IAudioPin {
    connections: Array<IAudioConnection>;
}

export interface IAudioConnection {
    input: IAudioPin;
    output: IAudioPin;
}

export interface IAudioInput {
    input: IAudioPin;
}

export interface IAudioParam extends IAudioInput {
    value: number;
}

export interface IAudioNode {
    params: Array<IAudioParam>;

    update(): void;
}

export interface IAudioSend extends IAudioNode, IAudioConnection {
    parent: IAudioSender;
    gainParam: IAudioParam;
    type: "pre-effects" | "pre-fader" | "post-fader";
}

export interface IAudioSource extends IAudioNode {
    output: IAudioPin;
}

export interface IAudioDestination extends IAudioInput, IAudioNode {
    //
}

export interface IAudioProcessor extends IAudioSource, IAudioDestination {
    optimize: boolean;
}

export interface IAudioSender extends IAudioSource {
    preEffectsOutput: IAudioPin;
    preFaderOutput: IAudioPin;
    postFaderOutput: IAudioPin;
}
