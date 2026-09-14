import { createAudioPlayerLabels } from "./application/AudioPlayerLabels";
import type { AudioPlayerViewFactory, AudioPlayerViewPort } from "./application/AudioPlayerViewPort";
import { type AudioUrlResolver, HttpAudioUrlResolver } from "./domain/AudioUrlResolver";
import type { IInputs, IOutputs } from "./generated/ManifestTypes";
import { AudioPlayerView } from "./presentation/AudioPlayerView";

export class PCFPlayerAudio implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private view?: AudioPlayerViewPort;

    public constructor(
        private readonly urlResolver: AudioUrlResolver = new HttpAudioUrlResolver(),
        private readonly viewFactory: AudioPlayerViewFactory = (host) => new AudioPlayerView(host)
    ) {}

    public init(
        context: ComponentFramework.Context<IInputs>,
        _notifyOutputChanged: () => void,
        _state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this.view = this.viewFactory(container);
        this.updateView(context);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        if (!this.view) return;

        const labels = createAudioPlayerLabels(context.resources);
        this.view.setLabels(labels);

        const field = context.parameters.UrlAudio;
        if (field.security?.readable === false) {
            this.view.showUnavailable(labels.readDenied);
            return;
        }

        const rawUrl = field.raw?.trim() ?? "";
        const url = this.urlResolver.resolve(rawUrl);
        if (!url) {
            this.view.showUnavailable(rawUrl ? labels.invalidUrl : labels.emptyUrl);
            return;
        }

        this.view.showSource({
            url,
            allowDownload: context.parameters.PermitirDownload.raw === true,
        });
    }

    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        this.view?.destroy();
        this.view = undefined;
    }
}
