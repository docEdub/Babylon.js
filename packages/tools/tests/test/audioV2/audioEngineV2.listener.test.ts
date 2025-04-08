import { expect, test } from "@playwright/test";
import { getGlobalConfig } from "@tools/test-tools";

import { AudioTestData } from "@tools/test-tools";
import { evaluateAudioV2TestUtils } from "./utils/audioEngineV2.utils";

test.beforeEach(async ({ page }) => {
    await page.goto(getGlobalConfig().baseUrl + `/empty.html`, {
        timeout: 0,
    });

    await page.waitForFunction(() => {
        return window.BABYLON;
    });

    page.setDefaultTimeout(0);

    await page.evaluate(
        ({ testData }: { testData: AudioTestData }) => {
            audioTestData = testData;
        },
        { testData: new AudioTestData() }
    );

    await page.evaluate(() => {
        audioContext = new AudioContext();
    });

    await page.evaluate(evaluateAudioV2TestUtils);
});

test.afterEach(async ({ page }) => {
    await page.evaluate(() => {
        audioContext.close();
    });

    await page.close();
});

test("test 1", async ({ page }) => {
    await page.evaluate(
        async ({ config }) => {
            await BABYLON.CreateAudioEngineAsync();
            const sound = await BABYLON.CreateSoundAsync("", config.soundsUrl + "square-1-khz-0.1-amp-for-10-seconds.flac");

            sound.play();
            await wait(3);
            sound.stop();
        },
        { config: new AudioTestData() }
    );

    expect(true).toBe(true);
});
