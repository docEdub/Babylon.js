import { expect, test } from "@playwright/test";

import { AudioTest, startAudioTest } from "./utils/audioEngineV2.utils";

test("test 1", async ({ page }) => {
    let audioTest = await startAudioTest(page);

    audioTest = await page.evaluate(
        async ({ audioTest }): Promise<AudioTest> => {
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
        },
        { audioTest }
    );

    expect(audioTest.result).toBe(true);
});
