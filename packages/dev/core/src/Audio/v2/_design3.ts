/* eslint-disable */

import * as _ from "./_design3.interfaces";
import { Observable, Observer } from "../../Misc/observable";
import { Nullable } from "../../types";

export abstract class AudioPin implements _.IAudioPin {
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

export abstract class AudioParam implements _.IAudioParam {
    input: AudioPin;
    value: number;

    dispose() {
        //
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
}

export abstract class AudioDestination implements _.IAudioDestination {
    _params = new Array<AudioParam>();

    get params(): Array<AudioParam> {
        return this._params;
    }

    input: AudioPin;
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

export class AudioConnection implements _.IAudioConnection {
    input: AudioPin;
    output: AudioPin;

    onDisposeObservable = new Observable<AudioConnection>();

    dispose() {
        this.onDisposeObservable.notifyObservers(this);
    }
}

export class AudioSend extends AudioConnection implements _.IAudioSend {
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
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class AudioEngine {
    devices: AudioDevice[];
}

export class AudioDevice implements _.IAudioDestination {
    input: AudioPin;

    _params = new Array<AudioParam>();

    get params(): Array<AudioParam> {
        return this._params;
    }
}

export class AudioBus extends AudioSender implements _.IAudioProcessor {
    input: AudioPin;
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
