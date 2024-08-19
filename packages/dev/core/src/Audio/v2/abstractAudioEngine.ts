import type { AbstractAudioDevice, IAudioDeviceOptions } from "./abstractAudioDevice";
import type { IAudioInputNode, IAudioOutputNode } from "./abstractAudioInterfaces";

/**
 * The base class for audio engines.
 *
 * Audio engines are responsible for creating audio nodes and managing audio devices.
 */
export abstract class AbstractAudioEngine implements IAudioInputNode {
    private _devices = new Array<AbstractAudioDevice>();

    /** @internal */
    public readonly engine = this;

    /** @internal */
    public readonly owner = this;

    /**
     * Gets the default audio device for this engine, creating it if needed.
     */
    public get defaultDevice(): AbstractAudioDevice {
        if (this.devices.length === 0) {
            const device = this.createDevice({ name: "Default" });
            this.addDevice(device);
        }
        return this.devices[0];
    }

    /**
     * Gets the audio devices that are currently connected to this engine.
     */
    public get devices(): ReadonlyArray<AbstractAudioDevice> {
        return this._devices;
    }

    /**
     * Creates a new audio device.
     */
    public abstract createDevice(options?: IAudioDeviceOptions): AbstractAudioDevice;

    /**
     * @param device - The device to check
     * @returns `true` if the device was added to this engine; otherwise `false`
     */
    public hasDevice(device: AbstractAudioDevice): boolean {
        return this._devices.includes(device) ?? false;
    }

    /**
     * Adds a previously created audio device to this engine.
     * @param device - The device to add
     * @returns The given device that was added
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
     * @param device - The device to remove
     */
    public removeDevice(device: AbstractAudioDevice): void {
        const index = this._devices.indexOf(device);
        if (index > -1) {
            this._devices.splice(index, 1);
        }
    }

    /**
     * Called when an audio output node connects to this node.
     * @param outputNode - The node connecting to this node
     * @returns `true` if the connection was accepted, or `false` if the connection was denied
     */
    public onConnect(outputNode: IAudioOutputNode): boolean {
        return this.defaultDevice.onConnect(outputNode);
    }

    /**
     * Called when an audio output node disconnects from this node.
     * @param outputNode - The node disconnecting from this node
     */
    public onDisconnect(outputNode: IAudioOutputNode): void {
        this.defaultDevice.onDisconnect(outputNode);
    }
}
