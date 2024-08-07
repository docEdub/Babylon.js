/* eslint-disable */

import * as _ from "./_design3.interfaces";
// import { Observable } from "../../Misc/observable";
// import { Nullable } from "../../types";

export abstract class AudioPin implements _.IAudioPin {
    connections: AudioConnection[] = [];
}

export abstract class AudioOutPin extends AudioPin implements _.IAudioOutPin {
    //
}

export abstract class AudioInPin extends AudioPin implements _.IAudioInPin {
    //
}

export abstract class AudioParam implements _.IAudioParam {
    input: AudioInPin;
    value: number;
}

export abstract class AudioProcessor implements _.IAudioProcessor {
    input: AudioInPin;
    output: AudioOutPin;
    optimize: boolean;
}

export abstract class AudioSender implements _.IAudioSender {
    output: AudioOutPin;

    preEffectsOutput: AudioOutPin;
    preFaderOutput: AudioOutPin;
    postFaderOutput: AudioOutPin;

    effects: AudioEffectsChain;

    sends: AudioSend[];
}

export abstract class AudioDestination implements _.IAudioDestination {
    input: AudioInPin;
}

export class AudioEffect extends AudioProcessor {
    //
}

export class AudioEffectsChain extends AudioProcessor {
    effects: AudioEffect[];
}

export class AudioPositioner extends AudioProcessor {
    //
}

export class AudioConnection extends AudioProcessor implements _.IAudioConnection {
    gainParam: AudioParam;
    params = new Array<AudioParam>();
}

export class AudioSend extends AudioConnection implements _.IAudioSend {
    parent: _.IAudioSender;
    type: "pre-effects" | "pre-fader" | "post-fader" = "post-fader";
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class AudioEngine {
    devices: AudioDevice[];
}

export class AudioDevice implements _.IAudioDestination {
    input: AudioInPin;
}

export class AudioBus extends AudioSender implements _.IAudioProcessor {
    input: AudioInPin;
    optimize: boolean;
}

export class AudioOutputBus extends AudioBus {
    device: AudioDevice;
}

export class AudioAuxBus extends AudioBus {
    positioner: AudioPositioner;
}

export class Sound extends AudioSender {
    positioner: AudioPositioner;
}

export class AudioAnalyzer extends AudioDestination {
    //
}
