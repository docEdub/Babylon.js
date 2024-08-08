/* eslint-disable */

export enum SendType {
    PreEffects,
    PreFader,
    PostFader,
}

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
}

export interface IAudioSend extends IAudioNode, IAudioConnection {
    gainParam: IAudioParam;
    type: SendType;
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
}
