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

export interface IAudioConnection extends IAudioProcessor {
    gainParam: IAudioParam;
}

export interface IAudioSend extends IAudioConnection {
    parent: IAudioSender;
    type: "pre-effects" | "pre-fader" | "post-fader";
}

export interface IAudioSource {
    output: IAudioOutPin;
}

export interface IAudioProcessor extends IAudioSource, IAudioDestination {
    optimize: boolean;
}

export interface IAudioDestination {
    input: IAudioInPin;
}

export interface IAudioSender extends IAudioSource {
    preEffectsOutput: IAudioOutPin;
    preFaderOutput: IAudioOutPin;
    postFaderOutput: IAudioOutPin;
}
