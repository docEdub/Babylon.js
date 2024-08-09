/* eslint-disable */

import * as _ from "./abstractAudio";
import { Nullable } from "../../types";

interface IWebAudioNode extends _.IAudioNode {
    device: WebAudioDevice;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class WebAudioConnection extends _.AudioConnection {
    inNode: AudioNode;
    outNode: AudioNode;

    constructor(inPin: _.AudioPin, outPin: _.AudioPin) {
        super(inPin, outPin);
    }
}

class WebAudioSend extends _.AudioSend {
    inNode: AudioNode;
    outNode: AudioNode;

    constructor(parent: _.AudioSender, outPin: _.AudioPin, options?: _.IAudioSendOptions) {
        super(parent, outPin, options);
    }

    _updateConnections(): void {
        console.log("WebAudioSend._updateConnections ...");
    }
}

class WebAudioGain extends _.AudioGain {
    _device: Nullable<WebAudioDevice> = null;
    _node: Nullable<GainNode> = null;

    constructor(parent: IWebAudioNode) {
        super(parent);
        this._device = parent.device;
    }

    override _updateConnections(): void {
        console.log("WebAudioGain._updateConnections ...");
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class WebAudioEngine extends _.AudioEngine {
    connectPins(inPin: _.AudioPin, outPin: _.AudioPin): void {
        new WebAudioConnection(inPin, outPin);
    }

    createEqualPowerPanner(parent: _.IAudioNode): _.EqualPowerAudioPanner {
        return new _.EqualPowerAudioPanner(parent);
    }

    createGain(parent: IWebAudioNode) {
        return new WebAudioGain(parent);
    }

    createHrtfPanner(parent: _.IAudioNode): _.HrtfAudioPanner {
        return new _.HrtfAudioPanner(parent);
    }

    createMixer(parent: _.IAudioNode): _.AudioMixer {
        return new _.AudioMixer(parent);
    }

    createSend(parent: _.AudioSender, output: _.AudioPin, options?: _.IAudioSendOptions): WebAudioSend {
        return new WebAudioSend(parent, output, options);
    }

    _updateConnections(): void {
        console.log("WebAudioEngine._updateConnections ...");
    }
}

export class WebAudioDevice extends _.AudioDevice {
    _context = new AudioContext();

    get context() {
        return this._context;
    }

    constructor(engine: WebAudioEngine) {
        super(engine);
    }

    _updateConnections(): void {
        console.log("WebAudioDevice._updateConnections ...");
    }
}

export class WebAudioOutputBus extends _.AudioOutputBus implements IWebAudioNode {
    _device: WebAudioDevice;

    get device() {
        return this._device;
    }

    constructor(device: WebAudioDevice) {
        super(device._engine);
        this._device = device;
    }

    _updateConnections(): void {
        console.log("WebAudioOutputBus._updateConnections ...");
    }
}

export class WebAudioSound extends _.Sound implements IWebAudioNode {
    _device: WebAudioDevice;

    get device() {
        return this._device;
    }

    constructor(device: WebAudioDevice) {
        super(device._engine);
        this._device = device;
    }

    _updateConnections(): void {
        console.log("WebAudioSound._updateConnections ...");
    }
}
