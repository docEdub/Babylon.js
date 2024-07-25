/* eslint-disable */
import { Vector3 } from "../../Maths/math.vector";

export interface IAudioGraphBackendItem {
    outputs: Array<IBasicAudioBusBackend>;
    positioner?: IBasicAudioPositionerBackend;
}

export interface IBasicAudioEngineBackend {
    inputs: Array<IBasicAudioBusBackend>;
}

export interface IBasicAudioPositionerBackend {
    position: Vector3;
}

export interface IBasicAudioBusBackend extends IAudioGraphBackendItem {
    inputs: Array<IAudioGraphBackendItem>;
}

export interface IBasicAudioSourceBackend {
    //
}

export interface IBasicAudioVoiceBackend extends IAudioGraphBackendItem {
    source: IBasicAudioSourceBackend;

    start(): void;
    stop(): void;
}
