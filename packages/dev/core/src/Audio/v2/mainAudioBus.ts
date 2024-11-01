import { AbstractAudioBus } from "./abstractAudioBus";
import type { AbstractAudioEngine } from "./abstractAudioEngine";

/**
 * Abstract class representing the main audio bus in the audio engine.
 */
export abstract class AbstractMainAudioBus extends AbstractAudioBus {
    /** @internal */
    constructor(name: string, engine: AbstractAudioEngine) {
        super(name, engine);
    }
}
