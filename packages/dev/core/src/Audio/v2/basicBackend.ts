/* eslint-disable */
import { Vector3 } from "../../Maths/math.vector";
import { Nullable } from "../../types";

export interface IAudioGraphBackendItem {
    outputs: Array<IBasicAudioBusBackend>;
    positioner?: IBasicAudioPositionerBackend;
}

export interface IBasicAudioEngineBackend {
    mainOutput: IBasicAudioBusBackend;
}

export interface IBasicAudioPositionerBackend {
    position: Vector3;
}

export interface IBasicAudioBusBackend extends IAudioGraphBackendItem {
    outputBus: Nullable<IBasicAudioBusBackend>;
    auxSendBusses: Nullable<Array<IBasicAudioBusBackend>>;
    inputBusses: Nullable<Array<IBasicAudioBusBackend>>;
}

export interface IBasicAudioSourceBackend {
    //
}

export interface IBasicAudioVoiceBackend extends IAudioGraphBackendItem {
    source: IBasicAudioSourceBackend;

    start(): void;
    stop(): void;
}
