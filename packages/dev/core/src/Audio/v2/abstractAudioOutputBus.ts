import type { AbstractAudioDevice } from "./abstractAudioDevice";
import type { AbstractAudioEngine } from "./abstractAudioEngine";
import type { IAudioInputNode, IAudioOutputNode } from "./abstractAudioInterfaces";
import { Observable } from "../../Misc/observable";
import type { Nullable } from "../../types";

/**
 * The available options when creating an audio device.
 */
export interface IAudioOutputBusOptions {
    /**
     * The name of the audio device. Defaults to an empty string.
     */
    name?: string;

    /**
     * The audio device this bus is connected to. Defaults to the audio engine's default device.
     */
    device?: AbstractAudioDevice;
}

/**
 * Represents an audio output device such as speakers or headphones.
 *
 * All audio devices are assumed to have 2 channels (left and right). More configurations may be supported later.
 */
export abstract class AbstractAudioOutputBus implements IAudioOutputNode, IAudioInputNode {
    private _device: AbstractAudioDevice;

    /**
     * The name of the audio device.
     */
    name: string;

    /**
     * The audio engine this node belongs to.
     */
    public readonly engine: AbstractAudioEngine;

    /**
     * Triggered after this node is connected to an audio input node.
     */
    public readonly onInputNodeConnected = new Observable<IAudioInputNode>();

    /**
     * Triggered after this node is disconnected from an audio input node.
     */
    public readonly onInputNodeDisonnected = new Observable<IAudioInputNode>();

    /**
     * Triggered after this node is connected to an audio output node.
     */
    public readonly onOutputNodeConnected = new Observable<IAudioOutputNode>();

    /**
     * Triggered after this node is disconnected from an audio output node.
     */
    public readonly onOutputNodeDisonnected = new Observable<IAudioOutputNode>();

    /**
     * The audio device this bus is connected to.
     */
    public get device(): AbstractAudioDevice {
        return this._device;
    }

    /**
     * Sets the audio device this bus is connected to.
     */
    public set device(value: Nullable<AbstractAudioDevice>) {
        if (this._device == value) {
            return;
        }

        if (this._device) {
            this.disconnect(this._device);
        }

        const device = value ?? this.engine.defaultDevice;
        device.addOutputBus(this);

        this._device = device;
    }

    /**
     * Creates a new audio device.
     * @param engine - The audio engine that owns this device
     * @param options - The options to use when creating the device
     */
    public constructor(engine: AbstractAudioEngine, options?: IAudioOutputBusOptions) {
        this.device = options?.device ?? engine.defaultDevice;
        this.engine = engine;
        this.name = options?.name ?? "";

        this.engine.addNode(this);
        this.device.addOutputBus(this);
    }

    /**
     * Releases all held resources
     */
    public dispose(): void {
        this.device.removeOutputBus(this);
        this.engine.removeNode(this);
    }

    /**
     * Connects this node to another audio node.
     * @param inputNode - The node to connect to
     * @returns `true` if the connection was made, or `false` if the connection failed
     */
    connect(inputNode: IAudioInputNode): boolean {
        if (!inputNode.onConnect(this)) {
            return false;
        }

        this.onInputNodeConnected.notifyObservers(inputNode);

        return true;
    }

    /**
     * Disconnects this node from another audio node.
     * @param inputNode - The node to disconnect from
     */
    disconnect(inputNode: IAudioInputNode): void {
        this.onInputNodeDisonnected.notifyObservers(inputNode);
    }

    /**
     * Called when an audio output node connects to this node.
     * @param outputNode - The node connecting to this node
     * @returns `true` if the connection was accepted, or `false` if the connection was denied
     */
    onConnect(outputNode: IAudioOutputNode): boolean {
        this.onOutputNodeConnected.notifyObservers(outputNode);
        return true;
    }

    /**
     * Called when an audio output node disconnects from this node.
     * @param outputNode - The node disconnecting from this node
     */
    onDisconnect(outputNode: IAudioOutputNode): void {
        this.onOutputNodeDisonnected.notifyObservers(outputNode);
    }
}
