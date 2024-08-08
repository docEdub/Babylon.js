/* eslint-disable */

import * as _ from "./_design3.interfaces";
import { Nullable } from "../../types";

interface IAudioSendOptions {
    type: _.SendType;
    gain: number;
}

interface IAudioUpdatable {
    _updateConnectionsPending: boolean;
    _updateConnections(): void;
}

function deferUpdateConnections(owner: IAudioUpdatable) {
    if (owner._updateConnectionsPending) {
        return;
    }
    setTimeout(() => {
        owner._updateConnections();
        owner._updateConnectionsPending = false;
    }, 0);
}

export class AudioPin implements _.IAudioPin {
    owner: IAudioUpdatable;
    connections: AudioConnection[] = [];

    constructor(owner: IAudioUpdatable) {
        this.owner = owner;
    }

    findConnection(pin: AudioPin): Nullable<AudioConnection> {
        for (const connection of this.connections) {
            if (connection.output === pin) {
                return connection;
            }
        }
        for (const connection of this.connections) {
            if (connection.input === pin) {
                return connection;
            }
        }
        return null;
    }

    addConnection(connection: AudioConnection) {
        this.connections.push(connection);
        deferUpdateConnections(this.owner);
    }

    removeConnection(connection: AudioConnection, dispose = true) {
        const index = this.connections.indexOf(connection);
        if (index !== -1) {
            this.connections.splice(index, 1);
            deferUpdateConnections(this.owner);
        }
    }

    removeAllConnections() {
        for (const connection of this.connections) {
            this.removeConnection(connection);
        }
    }

    removeConnectedPin(pin: AudioPin) {
        const connection = this.findConnection(pin);
        if (connection) {
            this.removeConnection(connection);
        }
    }
}

export class AudioConnection implements _.IAudioConnection {
    _input: AudioPin;
    _output: AudioPin;

    get input() {
        return this._input;
    }

    set input(input: AudioPin) {
        if (this._input === input) {
            return;
        }
        this._input.removeConnection(this);
        this._input = input;
        this._input.addConnection(this);
    }

    get output() {
        return this._output;
    }

    set output(output: AudioPin) {
        if (this._output === output) {
            return;
        }
        this._output.removeConnection(this);
        this._output = output;
        this._output.addConnection(this);
    }

    constructor(input: AudioPin, output: AudioPin) {
        this._input = input;
        this._output = output;

        this._input.addConnection(this);
        this._output.addConnection(this);
    }
}

export abstract class AudioSend extends AudioConnection implements _.IAudioSend {
    _owner: AudioSender;
    _type: _.SendType;

    get type() {
        return this._type;
    }

    set type(value) {
        if (this._type === value) {
            return;
        }
        this._owner._getSendOutputPin(this._type).removeConnection(this);
        this._type = value;
        this._owner._getSendOutputPin(this._type).addConnection(this);
    }

    _gainParam: AudioParam;

    get gainParam() {
        return this._gainParam;
    }

    _params: AudioParam[];

    get params(): Array<AudioParam> {
        return this._params;
    }

    constructor(owner: AudioSender, output: AudioPin, options?: IAudioSendOptions) {
        super(owner._getSendOutputPin(options?.type ?? _.SendType.PostFader), output);
        this._owner = owner;
        this._type = options?.type ?? _.SendType.PostFader;
    }

    _updateConnectionsPending = false;
    abstract _updateConnections(): void;
}

export abstract class AudioParam implements _.IAudioParam {
    input = new AudioPin(this);
    value: number;

    _updateConnectionsPending = false;
    abstract _updateConnections(): void;
}

export abstract class AudioProcessor implements _.IAudioProcessor {
    _params = new Array<AudioParam>();

    get params(): Array<AudioParam> {
        return this._params;
    }

    input: AudioPin;
    output: AudioPin;
    optimize: boolean;

    _updateConnectionsPending = false;
    abstract _updateConnections(): void;
}

export abstract class AudioSender implements _.IAudioSender {
    engine: AudioEngine;
    output = new AudioPin(this);

    preEffectsOutput = new AudioPin(this);
    preFaderOutput = new AudioPin(this);

    effects: AudioEffectsChain;

    sends: AudioSend[];

    _gainParam: AudioParam;

    get gainParam() {
        return this._gainParam;
    }

    _params = new Array<AudioParam>();

    get params(): Array<AudioParam> {
        return this._params;
    }

    constructor(engine: AudioEngine) {
        this.engine = engine;
    }

    connect(destination: _.IAudioInput) {
        new AudioConnection(this.output, destination.input as AudioPin);
        deferUpdateConnections(this);
    }

    disconnect(destination: _.IAudioInput) {
        this.output.removeConnectedPin(destination.input as AudioPin);
    }

    _getSendOutputPin(type: _.SendType) {
        return type === _.SendType.PostFader ? this.output : type === _.SendType.PreEffects ? this.preEffectsOutput : this.preFaderOutput;
    }

    addSend(destination: _.IAudioInput, options?: IAudioSendOptions) {
        const send = this.engine.createSend(this, destination.input as AudioPin, options);
        this.sends.push(send);
    }

    removeSend(send: AudioSend) {
        const index = this.sends.indexOf(send);
        if (index !== -1) {
            const outputPin = this._getSendOutputPin(send.type);
            outputPin.removeConnection(send);
            this.sends.splice(index, 1);
        }
    }

    _updateConnectionsPending = false;
    abstract _updateConnections(): void;
}

export abstract class AudioDestination implements _.IAudioDestination {
    _params = new Array<AudioParam>();

    get params(): Array<AudioParam> {
        return this._params;
    }

    input: AudioPin;

    _updateConnectionsPending = false;
    abstract _updateConnections(): void;
}

export abstract class AudioEffect extends AudioProcessor {
    //
}

export abstract class AudioEffectsChain extends AudioProcessor {
    effects: AudioEffect[];
}

export abstract class AudioPositioner extends AudioProcessor {
    //
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export abstract class AudioEngine {
    devices: AudioDevice[];

    abstract createSend(owner: AudioSender, output: AudioPin, options?: IAudioSendOptions): AudioSend;
}

export abstract class AudioDevice implements _.IAudioDestination {
    input: AudioPin;

    _params = new Array<AudioParam>();

    get params(): Array<AudioParam> {
        return this._params;
    }

    _updateConnectionsPending = false;
    abstract _updateConnections(): void;
}

export abstract class AudioBus extends AudioSender implements _.IAudioProcessor {
    input: AudioPin;
    optimize: boolean;
}

export abstract class AudioOutputBus extends AudioBus {
    device: AudioDevice;
}

export abstract class AudioAuxBus extends AudioBus {
    positioner: AudioPositioner;
}

export abstract class Sound extends AudioSender {
    positioner: AudioPositioner;
}

export abstract class AudioAnalyzer extends AudioDestination {
    //
}
