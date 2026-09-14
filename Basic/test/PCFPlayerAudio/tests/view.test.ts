import { beforeEach, expect, it, vi } from "vitest";
import { AudioPlayerView } from "../../../src/PCFPlayerAudio/PCFPlayerAudio/presentation/AudioPlayerView";
import { createAudioPlayerLabels } from "../../../src/PCFPlayerAudio/PCFPlayerAudio/application/AudioPlayerLabels";

let host: HTMLDivElement;
let view: AudioPlayerView;
let audio: HTMLAudioElement;
const source = { url: "https://example.com/a.mp3", allowDownload: true };
const button = () => host.querySelector<HTMLButtonElement>(".pcf-player-play")!;
const download = () => host.querySelector<HTMLAnchorElement>("a")!;
const status = () => host.querySelector<HTMLElement>("[role=status]")!;
beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    host = document.createElement("div");
    view = new AudioPlayerView(host);
    audio = host.querySelector("audio")!;
    view.setLabels(createAudioPlayerLabels({ getString: id => id }));
});
it("inicia desabilitado com nomes acessiveis", () => {
    expect(button().disabled).toBe(true);
    expect(button().getAttribute("aria-label")).toBe("PlayLabel");
    expect(host.querySelector("input")!.getAttribute("aria-label")).toBe("ProgressLabel");
    expect(download().hidden).toBe(true);
});
it("preserva posicao ao atualizar a mesma URL e altera download", () => {
    view.showSource(source);
    audio.currentTime = 42;
    vi.mocked(audio.load).mockClear();
    vi.mocked(audio.pause).mockClear();
    view.showSource({ ...source, allowDownload: false });
    expect(audio.currentTime).toBe(42);
    expect(audio.load).not.toHaveBeenCalled();
    expect(audio.pause).not.toHaveBeenCalled();
    expect(download().hidden).toBe(true);
    expect(download().hasAttribute("href")).toBe(false);
    view.showSource(source);
    expect(download().href).toBe(source.url);
    expect(download().hidden).toBe(false);
});
it("interrompe a fonte anterior ao trocar de URL", () => {
    view.showSource(source);
    view.showSource({ ...source, url: "https://example.com/b.mp3" });
    expect(audio.pause).toHaveBeenCalledTimes(1);
    expect(audio.src).toBe("https://example.com/b.mp3");
});
it("remove fonte e desabilita controles quando indisponivel", () => {
    view.showSource(source);
    view.showUnavailable("ReadDenied");
    expect(audio.pause).toHaveBeenCalled();
    expect(audio.hasAttribute("src")).toBe(false);
    expect(button().disabled).toBe(true);
    expect(host.querySelector<HTMLInputElement>("input")!.disabled).toBe(true);
    expect(download().hasAttribute("href")).toBe(false);
    expect(status().textContent).toBe("ReadDenied");
    expect(status().hidden).toBe(false);
});
it("reproduz, pausa e atualiza o nome acessivel", async () => {
    view.showSource(source);
    button().click();
    expect(audio.play).toHaveBeenCalledTimes(1);
    Object.defineProperty(audio, "paused", { configurable: true, value: false });
    audio.dispatchEvent(new Event("play"));
    expect(button().getAttribute("aria-label")).toBe("PauseLabel");
    button().click();
    expect(audio.pause).toHaveBeenCalledTimes(1);
    vi.mocked(audio.play).mockRejectedValue(new Error("blocked"));
    Object.defineProperty(audio, "paused", { configurable: true, value: true });
    button().click();
    await Promise.resolve();
    expect(status().textContent).toBe("PlaybackError");
});
it("sincroniza tempo, busca e volume", () => {
    view.showSource(source);
    Object.defineProperty(audio, "duration", { configurable: true, value: 120 });
    audio.currentTime = 30;
    audio.dispatchEvent(new Event("timeupdate"));
    const progress = host.querySelector<HTMLInputElement>("input")!;
    expect(progress.value).toBe("250");
    expect(host.querySelector(".pcf-player-time")!.textContent).toBe("0:30 / 2:00");
    progress.value = "500";
    progress.dispatchEvent(new Event("input"));
    expect(audio.currentTime).toBe(60);
    Object.defineProperty(audio, "duration", { configurable: true, value: NaN });
    progress.value = "900";
    progress.dispatchEvent(new Event("input"));
    expect(audio.currentTime).toBe(60);
    const volume = host.querySelector<HTMLButtonElement>(".pcf-player-volume")!;
    volume.click();
    audio.dispatchEvent(new Event("volumechange"));
    expect(audio.muted).toBe(true);
    expect(volume.getAttribute("aria-label")).toBe("UnmuteLabel");
});
it("exibe erro de midia e limpa a mensagem quando pronta", () => {
    view.showSource(source);
    Object.defineProperty(audio, "error", { configurable: true, value: { code: 4 } });
    audio.dispatchEvent(new Event("error"));
    expect(status().textContent).toBe("PlaybackError");
    Object.defineProperty(audio, "error", { configurable: true, value: null });
    audio.dispatchEvent(new Event("loadedmetadata"));
    expect(status().hidden).toBe(true);
});
it("destroy remove elementos, fonte e listeners", () => {
    view.showSource(source);
    const play = button();
    const volume = host.querySelector<HTMLButtonElement>(".pcf-player-volume")!;
    const progress = host.querySelector<HTMLInputElement>("input")!;
    const remove = vi.spyOn(audio, "removeEventListener");
    view.destroy();
    expect(host.children).toHaveLength(0);
    expect(audio.hasAttribute("src")).toBe(false);
    expect(audio.pause).toHaveBeenCalled();
    for (const event of ["error", "loadedmetadata", "durationchange", "timeupdate", "play", "pause", "ended", "volumechange"]) {
        expect(remove).toHaveBeenCalledWith(event, expect.any(Function));
    }
    play.click();
    volume.click();
    Object.defineProperty(audio, "duration", { value: 120 });
    audio.currentTime = 10;
    progress.value = "500";
    progress.dispatchEvent(new Event("input"));
    expect(audio.play).not.toHaveBeenCalled();
    expect(audio.muted).toBe(false);
    expect(audio.currentTime).toBe(10);
});
