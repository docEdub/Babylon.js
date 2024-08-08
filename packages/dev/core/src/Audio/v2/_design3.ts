/* eslint-disable */

import * as _ from "./_design3.interfaces";
import { Observable, Observer } from "../../Misc/observable";
import { Nullable } from "../../types";

function deferUpdateConnections(node: _.IAudioNode) {
    if (node.updateConnectionsPending) {
        return;
    }
    setTimeout(() => {
        node.updateConnections();
        node.updateConnectionsPending = false;
    }, 0);
}

export class AudioPin implements _.IAudioPin {
    _connections: AudioConnection[] = [];

    get connections(): Array<AudioConnection> {
        return this._connections;
    }

    _onConnectionDisposeObserver: Nullable<Observer<AudioConnection>> = null;

    dispose() {
        this.removeAllConnections();
    }

    addConnection(connection: AudioConnection) {
        this._connections.push(connection);
        this._onConnectionDisposeObserver = connection.onDisposeObservable.add(this.removeConnection.bind(this));
    }

    removeConnection(connection: AudioConnection) {
        connection.onDisposeObservable.remove(this._onConnectionDisposeObserver);
        const index = this._connections.indexOf(connection);
        if (index !== -1) {
            this._connections.splice(index, 1);
        }
    }

    removeAllConnections() {
        for (const connection of this._connections) {
            connection.dispose();
        }
    }
}

export class AudioConnection implements _.IAudioConnection {
    input: AudioPin;
    output: AudioPin;

    onDisposeObservable = new Observable<AudioConnection>();

    constructor(input: AudioPin, output: AudioPin) {
        this.input = input;
        this.output = output;

        this.input.addConnection(this);
        this.output.addConnection(this);
    }

    dispose() {
        this.onDisposeObservable.notifyObservers(this);
    }
}

export abstract class AudioParam implements _.IAudioParam {
    input: AudioPin;
    value: number;

    dispose() {
        this.input.dispose();
    }
}

export abstract class AudioProcessor implements _.IAudioProcessor {
    _params = new Array<AudioParam>();

    get params(): Array<AudioParam> {
        return this._params;
    }

    input: AudioPin;
    output: AudioPin;
    optimize: boolean;

    // IAudioNode
    updateConnectionsPending = false;
    abstract updateConnections(): void;
}

export abstract class AudioSender implements _.IAudioSender {
    output: AudioPin;

    preEffectsOutput: AudioPin;
    preFaderOutput: AudioPin;
    postFaderOutput: AudioPin;

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

    connect(destination: _.IAudioInput) {
        new AudioConnection(this.output, destination.input as AudioPin);
        deferUpdateConnections(this);
    }

    disconnect(destination: _.IAudioInput) {
        for (const connection of this.output.connections) {
            if (connection.output === this.output && connection.input === destination.input) {
                connection.dispose();
            }
        }
    }

    addSend(send: AudioSend) {
        this.sends.push(send);
    }

    removeSend(send: AudioSend) {
        const index = this.sends.indexOf(send);
        if (index !== -1) {
            this.sends.splice(index, 1);
        }
    }

    // IAudioNode
    updateConnectionsPending = false;
    abstract updateConnections(): void;
}

export abstract class AudioDestination implements _.IAudioDestination {
    _params = new Array<AudioParam>();

    get params(): Array<AudioParam> {
        return this._params;
    }

    input: AudioPin;

    updateConnectionsPending = false;
    abstract updateConnections(): void;
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

export abstract class AudioSend extends AudioConnection implements _.IAudioSend {
    parent: _.IAudioSender;
    type: "pre-effects" | "pre-fader" | "post-fader" = "post-fader";

    _gainParam: AudioParam;

    get gainParam() {
        return this._gainParam;
    }

    _params: AudioParam[];

    get params(): Array<AudioParam> {
        return this._params;
    }

    override dispose() {
        this._gainParam.dispose();
        super.dispose();
    }

    updateConnectionsPending = false;
    abstract updateConnections(): void;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export abstract class AudioEngine {
    devices: AudioDevice[];
}

export abstract class AudioDevice implements _.IAudioDestination {
    input: AudioPin;

    _params = new Array<AudioParam>();

    get params(): Array<AudioParam> {
        return this._params;
    }

    updateConnectionsPending = false;
    abstract updateConnections(): void;
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
