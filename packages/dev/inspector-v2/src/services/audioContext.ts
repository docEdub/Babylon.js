// eslint-disable-next-line import/no-internal-modules
import type { AudioEngineV2, Nullable, Observable } from "core/index";

import type { IService } from "../modularity/serviceDefinition";

// AudioContext provides the current audio engine, but could have different implementations depending on the context (e.g. inspector, sandbox, etc.)
export const AudioContextIdentity = Symbol("AudioContext");
export interface IAudioContext extends IService<typeof AudioContextIdentity> {
    readonly currentAudioEngine: Nullable<AudioEngineV2>;
    readonly currentAudioEngineObservable: Observable<Nullable<AudioEngineV2>>;
}
