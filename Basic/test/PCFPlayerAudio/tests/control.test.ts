import { beforeEach, expect, it, vi, type Mocked } from "vitest";
import { PCFPlayerAudio } from "../../../src/PCFPlayerAudio/PCFPlayerAudio";
import type { IInputs } from "../../../src/PCFPlayerAudio/PCFPlayerAudio/generated/ManifestTypes";

const context = (raw: string | null, download: boolean | null = null, readable = true) => ({
    parameters: { UrlAudio: { raw, security: { readable } }, PermitirDownload: { raw: download } },
    resources: { getString: (id: string) => id },
}) as unknown as ComponentFramework.Context<IInputs>;

let view: Mocked<import("../../../src/PCFPlayerAudio/PCFPlayerAudio/application/AudioPlayerViewPort").AudioPlayerViewPort>;
let control: PCFPlayerAudio;
beforeEach(() => {
    view = { setLabels: vi.fn(), showSource: vi.fn(), showUnavailable: vi.fn(), destroy: vi.fn() };
    control = new PCFPlayerAudio(undefined, () => view);
});

it("inicializa e normaliza a URL sem emitir alteracoes", () => {
    const notify = vi.fn();
    control.init(context("  https://EXAMPLE.com/a.mp3  ", true), notify, {}, document.createElement("div"));
    expect(view.showSource).toHaveBeenCalledWith({ url: "https://example.com/a.mp3", allowDownload: true });
    expect(view.setLabels).toHaveBeenCalled();
    expect(control.getOutputs()).toEqual({});
    expect(notify).not.toHaveBeenCalled();
});
it.each([false, null])("desabilita download para %s", download => {
    control.init(context("https://example.com/a.mp3", download), vi.fn(), {}, document.createElement("div"));
    expect(view.showSource).toHaveBeenCalledWith({ url: "https://example.com/a.mp3", allowDownload: false });
});
it.each([[null, "EmptyUrl"], ["   ", "EmptyUrl"], ["invalid", "InvalidUrl"]])("trata campo %s", (raw, message) => {
    control.init(context(raw), vi.fn(), {}, document.createElement("div"));
    expect(view.showUnavailable).toHaveBeenCalledWith(message);
    expect(view.showSource).not.toHaveBeenCalled();
});
it("nega leitura antes de resolver a URL", () => {
    const resolver = { resolve: vi.fn() };
    control = new PCFPlayerAudio(resolver, () => view);
    control.init(context("https://example.com/a.mp3", true, false), vi.fn(), {}, document.createElement("div"));
    expect(view.showUnavailable).toHaveBeenCalledWith("ReadDenied");
    expect(resolver.resolve).not.toHaveBeenCalled();
    expect(view.showSource).not.toHaveBeenCalled();
});
it("atualiza a fonte e libera a view uma unica vez", () => {
    control.updateView(context(null));
    expect(view.setLabels).not.toHaveBeenCalled();
    control.init(context("https://example.com/a.mp3"), vi.fn(), {}, document.createElement("div"));
    control.updateView(context("https://example.com/b.mp3", true));
    expect(view.showSource).toHaveBeenLastCalledWith({ url: "https://example.com/b.mp3", allowDownload: true });
    control.updateView(context(null));
    expect(view.showUnavailable).toHaveBeenLastCalledWith("EmptyUrl");
    control.destroy();
    control.destroy();
    view.setLabels.mockClear();
    control.updateView(context(null));
    expect(view.destroy).toHaveBeenCalledTimes(1);
    expect(view.setLabels).not.toHaveBeenCalled();
});

