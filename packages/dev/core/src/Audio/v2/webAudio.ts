/* eslint-disable */

import * as _ from "./abstractAudio";
import { Nullable } from "../../types";

interface IWebAudioDeviceNode extends _.IAudioUpdatable {
    device: WebAudioDevice;
}

class WebAudioGain extends _.AudioGain {
    _device: Nullable<WebAudioDevice> = null;

    node: Nullable<GainNode> = null;

    constructor(parent: IWebAudioDeviceNode) {
        super(parent);
        this._device = parent.device;
    }

    override _updateConnections(): void {
        console.log("WebAudioGain._updateConnections ...");
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class WebAudioEngine extends _.AudioEngine {
    createEqualPowerPanner(parent: _.IAudioUpdatable): _.EqualPowerAudioPanner {
        return new _.EqualPowerAudioPanner(parent);
    }

    createGain(parent: IWebAudioDeviceNode) {
        return new WebAudioGain(parent);
    }

    createHrtfPanner(parent: _.IAudioUpdatable): _.HrtfAudioPanner {
        return new _.HrtfAudioPanner(parent);
    }

    createMixer(parent: _.IAudioUpdatable): _.AudioMixer {
        return new _.AudioMixer(parent);
    }

    createSend(parent: _.AudioSender, output: _.AudioPin, options?: _.IAudioSendOptions): _.AudioSend {
        return new _.AudioSend(parent, output, options);
    }
}

export class WebAudioDevice extends _.AudioDevice {
    _engine: WebAudioEngine;
    _context = new AudioContext();

    get context() {
        return this._context;
    }

    constructor(engine: WebAudioEngine) {
        super();
        this._engine = engine;
    }

    _updateConnections(): void {
        console.log("WebAudioDevice._updateConnections ...");
    }
}

export class WebAudioOutputBus extends _.AudioOutputBus implements IWebAudioDeviceNode {
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

export class WebAudioSound extends _.Sound implements IWebAudioDeviceNode {
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
