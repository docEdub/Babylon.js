import type { AbstractAudioDevice, IAudioDeviceOptions } from "./abstractAudioDevice";
import { AbstractAudioNodeOwner } from "./abstractAudioNodeOwner";
import type { AbstractAudioOutputBus, IAudioOutputBusOptions } from "./abstractAudioOutputBus";

/**
 * The base class for audio engines.
 *
 * Responsibilities:
 *  - Create audio nodes.
 *  - Maintain an array of audio devices.
 */
export abstract class AbstractAudioEngine extends AbstractAudioNodeOwner {
    private _devices = new Array<AbstractAudioDevice>();

    /** @internal */
    public readonly engine = this;

    /**
     * Gets the default audio device for this engine, creating it if needed.
     */
    public get defaultDevice(): AbstractAudioDevice {
        if (this._devices.length === 0) {
            this.addDevice(this.createDevice({ name: "Default" }));
        }
        return this._devices[0];
    }

    /**
     * Gets the audio devices that are currently owned by this engine.
     */
    public get devices(): ReadonlyArray<AbstractAudioDevice> {
        return this._devices;
    }

    /**
     * Releases all held resources.
     */
    public override dispose(): void {
        super.dispose();

        for (const device of this._devices) {
            device.dispose();
        }
        this._devices.length = 0;
    }

    /**
     * Creates a new audio device.
     */
    public abstract createDevice(options?: IAudioDeviceOptions): AbstractAudioDevice;

    /**
     * Creates a new audio device.
     */
    public abstract createOutputBus(options?: IAudioOutputBusOptions): AbstractAudioOutputBus;

    /**
     * Checks if an audio device is currently added to this engine.
     * @param device - The audio device to check
     * @returns `true` if the audio device was added to this engine; otherwise `false`
     */
    public hasDevice(device: AbstractAudioDevice): boolean {
        return this._devices.includes(device) ?? false;
    }

    /**
     * Adds a previously created audio device to this engine.
     * @param device - The audio device to add
     * @returns The given audio device
     */
    public addDevice(device: AbstractAudioDevice): AbstractAudioDevice {
        if (this.hasDevice(device)) {
            return device;
        }

        this._devices.push(device);

        return device;
    }

    /**
     * Removes an audio device from this engine.
     * @param device - The audio device to remove
     */
    public removeDevice(device: AbstractAudioDevice): void {
        const index = this._devices.indexOf(device);
        if (index > -1) {
            this._devices.splice(index, 1);
        }
    }
}
