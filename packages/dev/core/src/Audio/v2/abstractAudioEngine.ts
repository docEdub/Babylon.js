import type { AbstractAudioDevice, IAudioDeviceOptions } from "./abstractAudioDevice";
import type { AbstractAudioOutputBus, IAudioOutputBusOptions } from "./abstractAudioOutputBus";
import type { IAudioNode } from "./abstractAudioInterfaces";
import type { IDisposable } from "../../scene";

/**
 * The base class for audio engines.
 *
 * Audio engines are responsible for creating audio nodes and managing audio devices.
 */
export abstract class AbstractAudioEngine implements IDisposable {
    private _devices = new Array<AbstractAudioDevice>();
    private _nodes = new Array<IAudioNode>();

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
     * Releases all held resources
     */
    public dispose(): void {
        for (const node of this._nodes) {
            node.dispose();
        }
        this._nodes.length = 0;

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
     * @returns The given audio device that was added
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

    /** @internal */
    public hasNode(node: IAudioNode): boolean {
        return this._nodes.includes(node);
    }

    /** @internal */
    public addNode(node: IAudioNode): IAudioNode {
        if (this.hasNode(node)) {
            return node;
        }

        this._nodes.push(node);

        return node;
    }

    /** @internal */
    public removeNode(node: IAudioNode): void {
        const index = this._nodes.indexOf(node);
        if (index > -1) {
            this._nodes.splice(index, 1);
        }
    }
}
