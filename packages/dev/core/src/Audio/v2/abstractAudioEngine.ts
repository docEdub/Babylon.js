import type { AbstractAudioDevice, IAudioDeviceOptions } from "./abstractAudioDevice";
import { AbstractAudioNodeOwner } from "./abstractAudioNodeOwner";
import type { AbstractMainAudioBus, IMainAudioBusOptions } from "./abstractMainAudioBus";

/**
 * The base class for audio engines.
 */
export abstract class AbstractAudioEngine extends AbstractAudioNodeOwner {
    public abstract createDevice(options?: IAudioDeviceOptions): AbstractAudioDevice;
    public abstract createOutputBus(device: AbstractMainAudioBus, options?: IMainAudioBusOptions): AbstractMainAudioBus;
}
