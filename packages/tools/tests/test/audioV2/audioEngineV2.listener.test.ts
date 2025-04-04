import { expect } from "@playwright/test";

import { evaluateCreateAudioTest, runAudioTestScript, testAudio } from "./utils/audioEngineV2.utils";

testAudio("test 1", async ({ page }) => {
    const audioTest = await page.evaluate(evaluateCreateAudioTest, {});

    await runAudioTestScript(page, audioTest, async () => {
        const sound = await BABYLON.CreateSoundAsync("test", audioTest.soundsUrl + "square-1-khz-0.1-amp-for-10-seconds.flac");
        sound.play();

        await new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, 3000);
        });

        sound.stop();

        audioTest.result = true;
        return audioTest;
    });

    expect(audioTest.result).toBe(true);
});
