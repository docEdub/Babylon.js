var audioContext;
var audioEngine;
var audioTestConfig;
var BABYLON;

class AudioV2Test {
    static async CreateAudioEngineAsync(options = {}) {
        options.audioContext = audioContext;
        audioEngine = await BABYLON.CreateAudioEngineAsync(options);
        return audioEngine;
    }

    static async CreateSoundAsync(source, options = {}) {
        if (typeof source === "string") {
            source = audioTestConfig.soundsUrl + source;
        } else if (source instanceof Array) {
            for (let i = 0; i < source.length; i++) {
                if (typeof source[i] === "string") {
                    source[i] = audioTestConfig.soundsUrl + source[i];
                }
            }
        }
        return await BABYLON.CreateSoundAsync("", source, options);
    }

    static async InitAudioContextAsync() {
        audioContext = new AudioContext();

        // Firefox doesn't always start the audio context immediately, so wait for it to start here.
        return new Promise((resolve) => {
            const onStateChange = () => {
                if (audioContext.state === "running") {
                    audioContext.removeEventListener("statechange", onStateChange);
                    resolve();
                }
            };
            audioContext.addEventListener("statechange", onStateChange);
        });
    }

    static async WaitAsync(seconds) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, seconds * 1000);
        });
    }
}
