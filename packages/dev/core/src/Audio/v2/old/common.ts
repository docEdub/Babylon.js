// /* eslint-disable */

// import { PhysicalAudioSource } from "./old/physical";
// import { Observable } from "../../Misc/observable";

// export enum AudioVoiceState {
//     Starting,
//     Unmuting,
//     Resuming,
//     Restarting,
//     Started,
//     Muting,
//     Muted,
//     Pausing,
//     Paused,
//     Stopping,
//     Stopped,
// }

// export class VirtualAudioVoice {
//     physicalSource: PhysicalAudioSource;
//     options: any;

//     _state: AudioVoiceState = AudioVoiceState.Starting;
//     onStateChangedObservable = new Observable<VirtualAudioVoice>();

//     init(physicalSource: PhysicalAudioSource, options?: any): void {
//         this.physicalSource = physicalSource;
//         this.options = options;
//     }

//     get state(): AudioVoiceState {
//         return this._state;
//     }

//     set state(value: AudioVoiceState) {
//         this.setState(value);
//     }

//     setState(value: AudioVoiceState) {
//         if (this._state === value) {
//             return;
//         }
//         this._state = value;
//         this.onStateChangedObservable.notifyObservers(this);
//     }

//     get priority(): number {
//         return this.options?.priority !== undefined ? this.options.priority : 0;
//     }

//     get loop(): boolean {
//         return this.options?.loop === true;
//     }

//     get static(): boolean {
//         return this.options?.stream !== true;
//     }

//     get stream(): boolean {
//         return this.options?.stream === true;
//     }

//     get spatial(): boolean {
//         return this.options?.spatial === true;
//     }

//     get updated(): boolean {
//         return (
//             this._state === AudioVoiceState.Muted || this._state === AudioVoiceState.Paused || this._state === AudioVoiceState.Started || this._state === AudioVoiceState.Stopped
//         );
//     }

//     get active(): boolean {
//         return this.state < AudioVoiceState.Pausing;
//     }

//     get waitingToStart(): boolean {
//         return this.state < AudioVoiceState.Started;
//     }

//     get started(): boolean {
//         return this.state === AudioVoiceState.Started;
//     }

//     get muting(): boolean {
//         return this.state === AudioVoiceState.Muting;
//     }

//     get muted(): boolean {
//         return this.state === AudioVoiceState.Muted;
//     }

//     get pausing(): boolean {
//         return this.state === AudioVoiceState.Pausing;
//     }

//     get stopping(): boolean {
//         return this.state === AudioVoiceState.Stopping;
//     }

//     compare(other: VirtualAudioVoice): number {
//         if (this.state !== other.state) {
//             return this.state - other.state;
//         }
//         if (this.priority < other.priority) {
//             return 1;
//         }
//         if (this.priority > other.priority) {
//             return -1;
//         }

//         // Looped voices are more noticeable when they stop and start, so they are prioritized over non-looped voices.
//         if (this.loop && !other.loop) {
//             return 1;
//         }
//         if (!this.loop && other.loop) {
//             return -1;
//         }

//         // Streamed voices are hard to restart cleanly, so they are prioritized over static voices.
//         if (this.stream && other.static) {
//             return 1;
//         }
//         if (this.static && other.stream) {
//             return -1;
//         }

//         return 0;
//     }

//     start(): void {
//         if (this._state === AudioVoiceState.Muted) {
//             this.state = AudioVoiceState.Unmuting;
//         } else if (this._state === AudioVoiceState.Paused) {
//             this.state = AudioVoiceState.Resuming;
//         } else if (this._state === AudioVoiceState.Stopped) {
//             this.state = AudioVoiceState.Restarting;
//         } else if (this._state === AudioVoiceState.Muting || this._state === AudioVoiceState.Pausing) {
//             this.state = AudioVoiceState.Started;
//         }
//     }

//     mute(): void {
//         this.state = AudioVoiceState.Muting;
//     }

//     pause(): void {
//         this.state = AudioVoiceState.Pausing;
//     }

//     resume(): void {
//         this.state = AudioVoiceState.Resuming;
//     }

//     stop(): void {
//         this.state = AudioVoiceState.Stopping;
//     }
// }
