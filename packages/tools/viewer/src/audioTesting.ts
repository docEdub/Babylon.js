import { CreateAudioBusAsync, CreateAudioEngineAsync, CreateSoundAsync, CreateSoundSourceAsync } from "core/AudioV2";
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
        const audioEngine = await CreateAudioEngineAsync();

        const audioBus1 = await CreateAudioBusAsync("audioBus1");

        const noiseBuffer = new AudioBuffer({ length: 48000, numberOfChannels: 1, sampleRate: 48000 });
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
            noiseData[i] = Math.random() * 2 - 1; // Fill with random noise
        }

        const noise = await CreateSoundAsync("noise", noiseBuffer, {
            outBus: audioBus1,
            spatialEnabled: true,
        });

        noise.spatial.attach(audioSphere1);

        await audioEngine.unlockAsync();
        noise.play({ loop: true, volume: 0.01 });
    })();
}
