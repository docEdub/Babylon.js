// /* eslint-disable */
// import { IBasicAudioBusBackend, IBasicAudioEngineBackend, IBasicAudioSourceBackend, IBasicAudioVoiceBackend } from "./basicBackend";
// import { AbstractPhysicalAudioEngine, PhysicalAudioBus, PhysicalAudioSource, PhysicalAudioVoice } from "./old/physical";

// export interface IAudioEngineBackend extends IBasicAudioEngineBackend {
//     physicalEngine: AbstractPhysicalAudioEngine;
//     currentTime: number;

//     createBus(options?: any): IAudioBusBackend;
//     createSource(options?: any): IAudioSourceBackend;
//     createVoice(options?: any): IAudioVoiceBackend;
// }

// export interface IAudioEngineBackendItem {
//     engine: IAudioEngineBackend;
// }

// export interface IAudioBusBackend extends IBasicAudioBusBackend {
//     engine: IAudioEngineBackend;
//     physicalBus: PhysicalAudioBus;
// }

// export interface IAudioSourceBackend extends IBasicAudioSourceBackend {
//     engine: IAudioEngineBackend;
//     physicalSource: PhysicalAudioSource;
// }

// export interface IAudioVoiceBackend extends IBasicAudioVoiceBackend {
//     engine: IAudioEngineBackend;
//     physicalVoice: PhysicalAudioVoice;
// }
