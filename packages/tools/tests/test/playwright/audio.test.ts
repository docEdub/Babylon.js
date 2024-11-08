import { CreateAudioEngineAsync } from "../../../../../packages/dev/core/src/Audio/v2/webAudio/webAudioEngine";
import { CreateSoundBufferAsync } from "../../../../../packages/dev/core/src/Audio/v2/webAudio/webAudioStaticSound";
import { test } from "@playwright/test";

test("StaticSoundBuffer", async ({ page }) => {
    console.log("Running WebAudioStaticSound tests...");

    const engine = await CreateAudioEngineAsync();
    const buffer = await CreateSoundBufferAsync(engine, { sourceUrl: "https://amf-ms.github.io/AudioAssets/testing/3-count.mp3" });

    expect(engine).toBeDefined();
    expect(buffer).toBeDefined();
});
