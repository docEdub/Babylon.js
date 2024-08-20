import type { AbstractAudioEngine } from "./abstractAudioEngine";
import type { AbstractAudioOutputBus } from "./abstractAudioOutputBus";
import type { IAudioInputNode, IAudioOutputNode } from "./abstractAudioInterfaces";
import { Observable } from "../../Misc/observable";

/**
 * The available options when creating an audio device.
 */
export interface IAudioDeviceOptions {
    /**
     * The name of the audio device. Defaults to an empty string.
     */
    name?: string;
}

/**
 * Represents an audio output device such as speakers or headphones.
 *
 * All audio devices are assumed to have 2 channels (left and right). More configurations may be supported later.
 */
export abstract class AbstractAudioDevice implements IAudioInputNode {
    private _outputBusses = new Array<AbstractAudioOutputBus>();

    /**
     * The name of the audio device.
     */
    public name: string;

    /**
     * The audio engine that owns this device.
     */
    public readonly engine: AbstractAudioEngine;

    /**
     * Triggered after this node is connected to an audio output node.
     */
    public readonly onOutputNodeConnected = new Observable<IAudioOutputNode>();

    /**
     * Triggered after this node is disconnected from an audio output node.
     */
    public readonly onOutputNodeDisonnected = new Observable<IAudioOutputNode>();

    /**
     * Gets the default audio output bus for this device, creating it if needed.
     */
    public get defaultOutputBus(): AbstractAudioOutputBus {
        if (this._outputBusses.length === 0) {
            this.addOutputBus(this.engine.createOutputBus({ name: "Default", device: this }));
        }
        return this._outputBusses[0];
    }

    /**
     * Gets the audio devices that are currently owned by this engine.
     */
    public get outputBusses(): ReadonlyArray<AbstractAudioOutputBus> {
        return this._outputBusses;
    }

    /**
     * Creates a new audio device.
     * @param engine - The audio engine that owns this device
     * @param options - The options to use when creating the device
     */
    public constructor(engine: AbstractAudioEngine, options?: IAudioDeviceOptions) {
        this.engine = engine;
        this.name = options?.name ?? "";

        engine.addDevice(this);
    }

    /**
     * Releases all held resources
     */
    public dispose(): void {
        this.engine.removeDevice(this);
        for (const outputBus of this._outputBusses) {
            this.removeOutputBus(outputBus);
        }
    }

    /**
     * Checks if an audio output bus is currently added to this engine.
     * @param outputBus - The audio output bus to check
     * @returns `true` if the audio output bus was added to this device; otherwise `false`
     */
    public hasOutputBus(outputBus: AbstractAudioOutputBus): boolean {
        return this._outputBusses.includes(outputBus) ?? false;
    }

    /**
     * Adds a previously created audio output bus to this engine.
     * @param outputBus - The audio output bus to add
     * @returns The given audio output bus that was added
     */
    public addOutputBus(outputBus: AbstractAudioOutputBus): AbstractAudioOutputBus {
        if (this.hasOutputBus(outputBus)) {
            return outputBus;
        }

        if (!outputBus.connect(this)) {
            throw new Error("Connect failed");
        }

        this._outputBusses.push(outputBus);

        return outputBus;
    }

    /**
     * Removes an audio output bus from this engine.
     * @param outputBus - The audio output bus to remove
     */
    public removeOutputBus(outputBus: AbstractAudioOutputBus): void {
        const index = this._outputBusses.indexOf(outputBus);
        if (index > -1) {
            this._outputBusses.splice(index, 1);

            outputBus.disconnect(this);
            outputBus.device = null;
        }
    }

    /**
     * Called when an audio output node connects to this node.
     * @param outputNode - The node connecting to this node
     * @returns `true` if the connection was accepted, or `false` if the connection was denied
     */
    public onConnect(outputNode: IAudioOutputNode): boolean {
        this.onOutputNodeConnected.notifyObservers(outputNode);
        return true;
    }

    /**
     * Called when an audio output node disconnects from this node.
     * @param outputNode - The node disconnecting from this node
     */
    public onDisconnect(outputNode: IAudioOutputNode): void {
        this.onOutputNodeDisonnected.notifyObservers(outputNode);
    }
}
