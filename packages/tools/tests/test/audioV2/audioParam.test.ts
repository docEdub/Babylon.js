import { InitAudioV2Tests } from "./utils/audioV2.utils";

import { expect, test } from "@playwright/test";

InitAudioV2Tests(true, false);

test.describe(`AudioParam`, () => {
    test("Audio parameter should not throw error when given `NaN` value", async ({ page }) => {
        const result = await page.evaluate(async () => {
            await AudioV2Test.CreateAudioEngineAsync();
            const sound = await AudioV2Test.CreateSoundAsync(audioTestConfig.pulsed3CountSoundFile, { autoplay: true, loop: true });

            let error = null;
            try {
                sound.volume = NaN;
            } catch (e) {
                error = (e as Error).message;
            }

            return error;
        });

        expect(result).toBe(null);
    });

    test("Audio parameter should not throw error when given `Infinity` value", async ({ page }) => {
        const result = await page.evaluate(async () => {
            await AudioV2Test.CreateAudioEngineAsync();
            const sound = await AudioV2Test.CreateSoundAsync(audioTestConfig.pulsed3CountSoundFile, { autoplay: true, loop: true });

            let error = null;
            try {
                sound.volume = Infinity;
            } catch (e) {
                error = (e as Error).message;
            }

            return error;
        });

        expect(result).toBe(null);
    });

    test("Audio parameter should not throw error when given `-Infinity` value", async ({ page }) => {
        const result = await page.evaluate(async () => {
            await AudioV2Test.CreateAudioEngineAsync();
            const sound = await AudioV2Test.CreateSoundAsync(audioTestConfig.pulsed3CountSoundFile, { autoplay: true, loop: true });

            let error = null;
            try {
                sound.volume = -Infinity;
            } catch (e) {
                error = (e as Error).message;
            }

            return error;
        });

        expect(result).toBe(null);
    });

    test("z1", async ({ page }) => {
        const result = await page.evaluate(async () => {
            const audioEngine = await AudioV2Test.CreateAudioEngineAsync("Realtime");
            const audioContext = (audioEngine as any)._audioContext as AudioContext;

            const gainNode = new GainNode(audioContext);

            let error = null;
            try {
                // This fails on Firefox with "Can't add events during a curve event"...
                const currentTime = audioContext.currentTime;
                gainNode.gain.setValueCurveAtTime(new Float32Array([0, 1, 0]), currentTime, 2);
                gainNode.gain.cancelScheduledValues(currentTime + 1);
                gainNode.gain.setValueCurveAtTime(new Float32Array([0, 1, 0]), currentTime + 1, 2);
            } catch (e) {
                error = (e as Error).message;
            }

            return error;
        });

        expect(result).toBe(null);
    });

    test("z2", async ({ page }) => {
        const result = await page.evaluate(async () => {
            const audioEngine = await AudioV2Test.CreateAudioEngineAsync("Realtime");
            const audioContext = (audioEngine as any)._audioContext as AudioContext;

            const gainNode = new GainNode(audioContext);

            let error = null;
            try {
                // This passes on Firefox.
                const currentTime = audioContext.currentTime;
                gainNode.gain.setValueCurveAtTime(new Float32Array([0, 1, 0]), currentTime, 2);
                gainNode.gain.cancelScheduledValues(currentTime);
                gainNode.gain.setValueCurveAtTime(new Float32Array([0, 1, 0]), currentTime + 1, 2);
            } catch (e) {
                error = (e as Error).message;
            }

            return error;
        });

        expect(result).toBe(null);
    });

    test("z3", async ({ page }) => {
        const error = await page.evaluate(async () => {
            const audioEngine = await AudioV2Test.CreateAudioEngineAsync("Realtime");
            const audioContext = (audioEngine as any)._audioContext as AudioContext;

            let error: BABYLON.Nullable<string> = null;

            const pannerNodes = new Array<PannerNode>();

            for (let i = 0; i < 1000; i++) {
                const pannerNode = new PannerNode(audioContext);
                pannerNodes.push(pannerNode);
            }

            let j = 0;
            await new Promise<void>((resolve) => {
                const interval = setInterval(() => {
                    j++;
                    if (j > 1000 || error !== null) {
                        clearInterval(interval);
                        resolve();

                        const currentTime = audioContext.currentTime;

                        for (const pannerNode of pannerNodes) {
                            try {
                                pannerNode.positionX.setValueCurveAtTime(new Float32Array([0, 1, 0]), currentTime, 100);
                                pannerNode.positionX.cancelScheduledValues(0);
                                pannerNode.positionX.setValueCurveAtTime(new Float32Array([0, 1, 0]), currentTime + 1, 50);
                            } catch (e) {
                                error = (e as Error).message;
                            }
                        }
                    }
                }, 0);
            });

            return error;
        });

        expect(error).toBe(null);
    });
});
