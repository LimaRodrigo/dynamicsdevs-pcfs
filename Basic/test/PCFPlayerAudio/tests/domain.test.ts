import { describe, expect, it } from "vitest";
import { HttpAudioUrlResolver } from "../../../src/PCFPlayerAudio/PCFPlayerAudio/domain/AudioUrlResolver";
import { formatAudioTime } from "../../../src/PCFPlayerAudio/PCFPlayerAudio/presentation/formatAudioTime";
import { createAudioPlayerLabels } from "../../../src/PCFPlayerAudio/PCFPlayerAudio/application/AudioPlayerLabels";

describe("HttpAudioUrlResolver", () => {
    const resolver = new HttpAudioUrlResolver();
    it.each([
        ["https://EXAMPLE.com/audio.mp3", "https://example.com/audio.mp3"],
        ["http://example.com/audio.mp3?token=abc#part", "http://example.com/audio.mp3?token=abc#part"],
    ])("normaliza %s", (input, expected) => expect(resolver.resolve(input)).toBe(expected));
    it.each(["", "invalid", "/audio.mp3", "ftp://example.com/audio", "javascript:alert(1)", "data:audio/mp3;base64,AA", "https://user:pass@example.com/audio", "https://user@example.com/audio"])("rejeita %s", input => {
        expect(resolver.resolve(input)).toBeUndefined();
    });
});

describe("formatAudioTime", () => {
    it.each([[0, "0:00"], [-1, "0:00"], [9.9, "0:09"], [60, "1:00"], [3599, "59:59"], [3600, "1:00:00"], [3661, "1:01:01"]])("formata %s", (input, expected) => {
        expect(formatAudioTime(input as number)).toBe(expected);
    });
});

it("mapeia todos os textos para os recursos PCF", () => {
    expect(createAudioPlayerLabels({ getString: id => `localized:${id}` })).toEqual({
        playbackError: "localized:PlaybackError", readDenied: "localized:ReadDenied",
        invalidUrl: "localized:InvalidUrl", emptyUrl: "localized:EmptyUrl",
        play: "localized:PlayLabel", pause: "localized:PauseLabel", mute: "localized:MuteLabel",
        unmute: "localized:UnmuteLabel", progress: "localized:ProgressLabel", download: "localized:DownloadLabel",
    });
});
