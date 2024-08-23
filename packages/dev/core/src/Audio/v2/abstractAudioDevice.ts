import type { AbstractAudioEngine } from "./abstractAudioEngine";
import { AbstractAudioNode, AudioNodeType } from "./abstractAudioNode";
import type { IAudioNodeOptions } from "./abstractAudioNode";

/**
 * The options available when creating audio devices.
 */
export interface IAudioDeviceOptions extends IAudioNodeOptions {}

/**
 * The base class for audio devices. Represents an audio output device such as speakers or headphones.
 *
 * Note that audio devices are currently assumed to have 2 channels (left and right). More configurations may be
 * supported later.
 */
export abstract class AbstractAudioDevice extends AbstractAudioNode {
    /**
     * Creates an audio device.
     * @param engine - The audio device's owning audio engine
     * @param options - The options to use when creating the device
     */
    public constructor(engine: AbstractAudioEngine, options?: IAudioDeviceOptions) {
        super(AudioNodeType.Input, engine, options);
    }
}
