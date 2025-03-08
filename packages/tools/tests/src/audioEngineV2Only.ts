import { CreateAudioEngineAsync } from "@babylonjs/core/AudioV2/webAudio/webAudioEngine";

const SoundUrlBase = "https://amf-ms.github.io/AudioAssets/";

(async () => {
    const audioEngine = await CreateAudioEngineAsync({});

    audioEngine.createSoundAsync("", SoundUrlBase + "cc-music/electronic/Soulsonic--No.mp3", {});
})();
