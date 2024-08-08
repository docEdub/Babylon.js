// /* eslint-disable */
// import type { IAudioBusBackend, IAudioEngineBackend, IAudioEngineBackendItem, IAudioSourceBackend, IAudioVoiceBackend } from "./backend";
// import { VirtualAudioVoice, AudioVoiceState } from "./common";
// import { Nullable } from "core/types";

// /*
// Physical layer of the advanced audio engine.

// All interfaces in this file must be implemented by the backend, and they should only be used by the physical layer.

// The logical and common layers can use the classes in this file, but not the interfaces.
// */

// export abstract class AbstractPhysicalAudioEngine {
//     backend: IAudioEngineBackend;

//     graphItems = new Map<number, AbstractPhysicalAudioEngineItem>();
//     nextItemId: number = 1;

//     maxSpatialVoices: number = 0;
//     staticVoices: Array<PhysicalAudioVoice>;
//     streamVoices: Array<PhysicalAudioVoice>;

//     get currentTime(): number {
//         return this.backend.currentTime;
//     }

//     lastUpdateTime: number = 0;

//     constructor(backend: IAudioEngineBackend, options?: any) {
//         this.backend = backend;

//         this.maxSpatialVoices = options?.maxSpatialVoices ?? 64;
//         this.staticVoices = new Array<PhysicalAudioVoice>(options?.maxStaticVoices ?? 128);
//         this.streamVoices = new Array<PhysicalAudioVoice>(options?.maxStreamVoices ?? 8);

//         for (let i = 0; i < this.staticVoices.length; i++) {
//             this.staticVoices[i] = this.createVoice();
//         }
//         for (let i = 0; i < this.streamVoices.length; i++) {
//             this.streamVoices[i] = this.createVoice({ stream: true });
//         }
//     }

//     createBus(options?: any): PhysicalAudioBus {
//         const bus = this.backend.createBus(options).physicalBus;
//         this._addItem(bus, options);
//         return bus;
//     }

//     createSource(options?: any): PhysicalAudioSource {
//         const source = this.backend.createSource(options).physicalSource;
//         this._addItem(source, options);
//         return source;
//     }

//     createVoice(options?: any): PhysicalAudioVoice {
//         const voice = this.backend.createVoice(options).physicalVoice;
//         this._addItem(voice, options);
//         return voice;
//     }

//     _addItem(item: AbstractPhysicalAudioEngineItem, options?: any): void {
//         if (options?.id) {
//             item.id = options.id;
//             this.nextItemId = Math.max(this.nextItemId, options.id + 1);
//         } else {
//             item.id = this.nextItemId++;
//         }
//         this.graphItems.set(item.id, item);
//     }

//     update(virtualVoices: Array<VirtualAudioVoice>): void {
//         const currentTime = this.currentTime;
//         if (this.lastUpdateTime == currentTime) {
//             return;
//         }
//         this.lastUpdateTime = currentTime;

//         // Update virtual voice states according to the number of physical voices available.
//         let spatialCount = 0;
//         let staticCount = 0;
//         let streamCount = 0;
//         let spatialMaxed = false;
//         let staticMaxed = false;
//         let streamMaxed = false;
//         let allMaxed = false;

//         for (let i = 0; i < virtualVoices.length; i++) {
//             const virtualVoice = virtualVoices[i];

//             if (!virtualVoice.active) {
//                 break;
//             }

//             if (allMaxed || (virtualVoice.spatial && spatialMaxed)) {
//                 virtualVoice.mute();
//                 return;
//             }

//             if (virtualVoice.static) {
//                 if (staticMaxed) {
//                     virtualVoice.mute();
//                     return;
//                 }
//                 virtualVoice.start();

//                 staticCount++;
//                 if (staticCount >= this.staticVoices.length) {
//                     staticMaxed = true;
//                 }
//             }

//             if (virtualVoice.stream) {
//                 if (streamMaxed) {
//                     virtualVoice.mute();
//                     return;
//                 }
//                 virtualVoice.start();

//                 streamCount++;
//                 if (streamCount >= this.streamVoices.length) {
//                     streamMaxed = true;
//                 }
//             }

//             if (virtualVoice.spatial) {
//                 spatialCount++;
//                 if (spatialCount >= this.maxSpatialVoices) {
//                     spatialMaxed = true;
//                 }
//             }

//             if (spatialMaxed && staticMaxed && streamMaxed) {
//                 allMaxed = true;
//             }
//         }

//         // Sort active/unmuted voices to the top of the physical voice array while muting, pausing, or stopping virtual
//         // voices that can be physically ignored.
//         //
//         // When complete, `pastLastActiveIndex` is set to one past the last active and unmuted voice. Starting at this
//         // index, physical voices can be used by virtual voices waiting to start.
//         //
//         // Note that it is assumed the number of virtual voices waiting to start is not more than than the number of
//         // physical voices available. This assumption is not checked here, which means any virtual voices waiting to
//         // start are ignored beyond the number of physical voices available. This can result in voices not playing when
//         // they are supposed to.
//         //
//         let pastLastActiveIndex = 0;
//         for (let i = 0; i < this.staticVoices.length; i++) {
//             const voice = this.staticVoices[i];

//             if (voice.available) {
//                 break;
//             }

//             const virtualVoice = voice.virtualVoice!;

//             if (virtualVoice.active && !virtualVoice.muted) {
//                 if (pastLastActiveIndex < i) {
//                     this.staticVoices[pastLastActiveIndex].copyFrom(voice);
//                 }
//                 pastLastActiveIndex++;
//             } else if (virtualVoice.muting) {
//                 voice.mute();
//             } else if (virtualVoice.pausing) {
//                 voice.pause();
//             } else if (virtualVoice.stopping) {
//                 voice.stop();
//             }
//         }

//         // Physically start virtual voices waiting to start.
//         let virtualVoiceIndex = virtualVoices.findIndex((virtualVoice) => virtualVoice.waitingToStart);
//         if (virtualVoiceIndex !== -1) {
//             while (pastLastActiveIndex < this.staticVoices.length) {
//                 const voice = this.staticVoices[pastLastActiveIndex];

//                 voice.init(virtualVoices[virtualVoiceIndex]);
//                 voice.start();

//                 pastLastActiveIndex++;

//                 // Set `virtualVoiceIndex` to the next virtual voice waiting to start.
//                 let done = false;
//                 do {
//                     virtualVoiceIndex++;
//                     done = virtualVoiceIndex >= virtualVoices.length;
//                 } while (!done && !virtualVoices[virtualVoiceIndex].waitingToStart);

//                 // Exit the loop if there are no more virtual voices waiting to start.
//                 if (done) {
//                     break;
//                 }
//             }
//         }

//         // Clear the first inactive voice to make it available and stop the active/unmuted voices sort early in the
//         // next update.
//         if (pastLastActiveIndex < this.staticVoices.length) {
//             this.staticVoices[pastLastActiveIndex].clear();
//         }

//         // console.log(this.staticVoices);

//         // TODO: Update stream voices.
//     }
// }

// abstract class AbstractPhysicalAudioEngineItem {
//     abstract backend: IAudioEngineBackendItem;

//     get engine(): AbstractPhysicalAudioEngine {
//         return this.backend.engine.physicalEngine;
//     }

//     id: number;
// }

// export class PhysicalAudioBus extends AbstractPhysicalAudioEngineItem {
//     backend: IAudioBusBackend;

//     constructor(backend: IAudioBusBackend, options?: any) {
//         super();

//         this.backend = backend;
//     }
// }

// export class PhysicalAudioSource extends AbstractPhysicalAudioEngineItem {
//     backend: IAudioSourceBackend;

//     constructor(backend: IAudioSourceBackend, options?: any) {
//         super();

//         this.backend = backend;
//     }
// }

// export class PhysicalAudioVoice extends AbstractPhysicalAudioEngineItem {
//     backend: IAudioVoiceBackend;

//     virtualVoice: Nullable<VirtualAudioVoice> = null;

//     get available(): boolean {
//         return this.virtualVoice === null;
//     }

//     constructor(backend: IAudioVoiceBackend, options?: any) {
//         super();

//         this.backend = backend;
//     }

//     init(virtualVoice: VirtualAudioVoice): void {
//         if (!this.available) {
//             throw new Error("Voice is not available.");
//             return;
//         }
//         this.virtualVoice = virtualVoice;
//     }

//     copyFrom(voice: PhysicalAudioVoice): void {
//         this.virtualVoice = voice.virtualVoice;
//     }

//     clear(): void {
//         this.virtualVoice = null;
//     }

//     start(): void {
//         if (!this.virtualVoice || this.virtualVoice?.updated) {
//             return;
//         }
//         this.virtualVoice?.setState(AudioVoiceState.Started);
//         console.log("Voice.start()");
//     }

//     mute(): void {
//         if (!this.virtualVoice || this.virtualVoice?.updated) {
//             return;
//         }
//         this.virtualVoice?.setState(AudioVoiceState.Muted);
//         console.log("Voice.mute()");
//     }

//     pause(): void {
//         if (!this.virtualVoice || this.virtualVoice?.updated) {
//             return;
//         }
//         this.virtualVoice?.setState(AudioVoiceState.Paused);
//         console.log("Voice.pause()");
//     }

//     stop(): void {
//         if (!this.virtualVoice || this.virtualVoice?.updated) {
//             return;
//         }
//         this.virtualVoice?.setState(AudioVoiceState.Stopped);
//         console.log("Voice.stop()");
//     }
// }
