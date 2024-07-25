/* eslint-disable */
import { AbstractPhysicalAudioEngine, PhysicalAudioBus, PhysicalAudioSource, PhysicalAudioVoice } from "./physical";
import { Vector3 } from "../../Maths/math.vector";

export interface IBasicAudioEngineBackend {
    inputs: Array<IBasicAudioBusBackend>;
}

export interface IAudioEngineBackend extends IBasicAudioEngineBackend {
    physicalEngine: AbstractPhysicalAudioEngine;
    currentTime: number;

    createBus(options?: any): IAudioBusBackend;
    createSource(options?: any): IAudioSourceBackend;
    createVoice(options?: any): IAudioVoiceBackend;
}

export interface IAudioPositionerBackend {
    position: Vector3;
}

export interface IAudioGraphBackendItem {
    outputs: Array<IBasicAudioBusBackend>;
    positioner?: IAudioPositionerBackend;
}

export interface IAudioEngineBackendItem {
    engine: IAudioEngineBackend;
}

export interface IBasicAudioBusBackend extends IAudioGraphBackendItem {
    inputs: Array<IAudioGraphBackendItem>;
}

export interface IAudioBusBackend extends IBasicAudioBusBackend {
    engine: IAudioEngineBackend;
    physicalBus: PhysicalAudioBus;
}

export interface IBasicAudioSourceBackend {
    //
}

export interface IAudioSourceBackend extends IBasicAudioSourceBackend {
    engine: IAudioEngineBackend;
    physicalSource: PhysicalAudioSource;
}

export interface IBasicAudioVoiceBackend extends IAudioGraphBackendItem {
    source: IBasicAudioSourceBackend;

    start(): void;
    stop(): void;
}

export interface IAudioVoiceBackend extends IBasicAudioVoiceBackend {
    engine: IAudioEngineBackend;
    physicalVoice: PhysicalAudioVoice;
}
