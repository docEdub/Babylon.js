var audioTestConfig;
var BABYLON;

class AudioV2Test {
    static async CreateAudioEngineAsync(options) {
        return await BABYLON.CreateAudioEngineAsync(options);
    }

    static async CreateSoundAsync(source, options) {
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

    static async WaitAsync(seconds) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, seconds * 1000);
        });
    }
}
