import {
    CreateAudioBusAsync,
    CreateAudioEngineAsync,
    CreateMainAudioBusAsync,
    CreateMicrophoneSoundSourceAsync,
    CreateSoundAsync,
    CreateSoundSourceAsync,
    CreateStreamingSoundAsync,
} from "core/AudioV2";
import { StandardMaterial } from "core/Materials";
import { Color3 } from "core/Maths/math.color";
import { MeshBuilder } from "core/Meshes";
import type { Scene } from "core/scene";

/**
 * Initializes the scene audio for testing purposes.
 * @param scene - The Babylon.js scene to initialize audio for testing.
 */
export function InitSceneAudioForTesting(scene: Scene): void {
    // Add a sphere to the scene to represent the audio source.

    const audioSphere1 = MeshBuilder.CreateSphere("audioSphere1", { diameter: 0.1 }, scene);
    const material = new StandardMaterial("audioSphereMaterial", scene);
    material.emissiveColor = Color3.Red();
    audioSphere1.material = material;

    void (async () => {
        const audioContext = new AudioContext();
        await CreateAudioEngineAsync({ audioContext });
        await CreateAudioEngineAsync({ audioContext });
        const audioEngine3 = await CreateAudioEngineAsync({ audioContext });

        const mainAmbientBus = audioEngine3.defaultMainBus ?? (await CreateMainAudioBusAsync(""));
        mainAmbientBus.name = "Main ambient";

        const mainSpatialBus = await CreateMainAudioBusAsync("Main spatial");
        const mainLiveInputBus = await CreateMainAudioBusAsync("Main live input", { volume: 0 });

        const musicBus = await CreateAudioBusAsync("Music", { outBus: mainAmbientBus });
        const sfxBus = await CreateAudioBusAsync("Sfx", { outBus: mainSpatialBus });
        const tonesBus = await CreateAudioBusAsync("Tones", { outBus: mainAmbientBus });

        const sinesBus = await CreateAudioBusAsync("Sines", { outBus: tonesBus });
        const squaresBus = await CreateAudioBusAsync("Sines", { outBus: tonesBus });

        const music = await CreateStreamingSoundAsync("music", "https://amf-ms.github.io/AudioAssets/cc-music/electronic/Gianluca-Sgalambro--Revelations.mp3");
        music.outBus = musicBus;

        const noiseBuffer = new AudioBuffer({ length: 48000, numberOfChannels: 1, sampleRate: 48000 });
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
            noiseData[i] = Math.random() * 2 - 1; // Fill with random noise
        }

        const noise = await CreateSoundAsync("noise", noiseBuffer, { spatialEnabled: true });
        noise.outBus = sfxBus;

        noise.spatial.attach(audioSphere1);

        const sine440Node = new OscillatorNode(audioContext, { type: "sine", frequency: 440 });
        const sine660Node = new OscillatorNode(audioContext, { type: "sine", frequency: 660 });
        const sine880Node = new OscillatorNode(audioContext, { type: "sine", frequency: 660 });

        const square110Node = new OscillatorNode(audioContext, { type: "square", frequency: 110 });
        const square220Node = new OscillatorNode(audioContext, { type: "square", frequency: 220 });

        const sine440Source = await CreateSoundSourceAsync("sine-440", sine440Node, { spatialEnabled: true, volume: 0.005 });
        sine440Source.outBus = sinesBus;

        const sine660Source = await CreateSoundSourceAsync("sine-660", sine660Node, { spatialEnabled: true, volume: 0.005 });
        sine660Source.outBus = sinesBus;

        const sine880Source = await CreateSoundSourceAsync("sine-880", sine880Node, { spatialEnabled: true, volume: 0.005 });
        sine880Source.outBus = sinesBus;

        const square110Source = await CreateSoundSourceAsync("square-110", square110Node, { spatialEnabled: true, volume: 0.005 });
        square110Source.outBus = squaresBus;

        const square220Source = await CreateSoundSourceAsync("square-220", square220Node, { spatialEnabled: true, volume: 0.005 });
        square220Source.outBus = squaresBus;

        void CreateMicrophoneSoundSourceAsync("microphone", { outBus: mainLiveInputBus });

        await audioEngine3.unlockAsync();

        music.play({ loop: true, volume: 0.1 });
        noise.play({ loop: true, volume: 0.003 });

        setTimeout(() => {
            sine440Node.start();
            sine660Node.start();
            sine880Node.start();
            square110Node.start();
            square220Node.start();
        }, 1000);
    })();
}
