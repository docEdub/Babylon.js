import type { AbstractAudioDevice, IAudioDeviceOptions } from "./abstractAudioDevice";
import { AbstractAudioNodeOwner } from "./abstractAudioNodeOwner";
import type { AbstractAudioOutputBus, IAudioOutputBusOptions } from "./abstractAudioOutputBus";

/**
 * The base class for audio engines.
 */
export abstract class AbstractAudioEngine extends AbstractAudioNodeOwner {
    public abstract createDevice(options?: IAudioDeviceOptions): AbstractAudioDevice;
    public abstract createOutputBus(device: AbstractAudioOutputBus, options?: IAudioOutputBusOptions): AbstractAudioOutputBus;
}
