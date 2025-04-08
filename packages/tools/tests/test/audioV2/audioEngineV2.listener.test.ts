import { expect, test } from "@playwright/test";

import "./utils/audioEngineV2.utils";

test("test 1", async ({ page }) => {
    await page.evaluate(async () => {
        await AudioV2Test.CreateAudioEngineAsync();
        const sound = await AudioV2Test.CreateSoundAsync("square-1-khz-0.1-amp-for-10-seconds.flac");

        sound.play();
        await AudioV2Test.WaitAsync(3);
        sound.stop();
    });

    expect(true).toBe(true);
});
