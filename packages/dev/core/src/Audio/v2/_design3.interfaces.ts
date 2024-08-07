/* eslint-disable */

export interface IAudioParam {
    input: IAudioInPin;
    value: number;
}

export interface IAudioPin {
    connections: Array<IAudioConnection>;
}

export interface IAudioOutPin extends IAudioPin {
    //
}

export interface IAudioInPin extends IAudioPin {
    //
}

export interface IAudioConnection {
    input: IAudioInPin;
    output: IAudioOutPin;
}

export interface IAudioSend extends IAudioConnection {
    parent: IAudioSender;
    gain: IAudioParam;
}

export interface IAudioSource {
    output: IAudioOutPin;
}

export interface IAudioProcessor {
    input: IAudioInPin;
    output: IAudioOutPin;
}

export interface IAudioDestination {
    input: IAudioInPin;
}

export interface IAudioSender {
    preEffectsOutput: IAudioOutPin;
    preFaderOutput: IAudioOutPin;
    postFaderOutput: IAudioOutPin;
}
