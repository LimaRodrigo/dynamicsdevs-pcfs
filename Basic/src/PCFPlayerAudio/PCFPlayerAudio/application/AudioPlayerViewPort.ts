import type { AudioPlayerLabels } from "./AudioPlayerLabels";

export interface AudioSourceViewModel {
    readonly url: string;
    readonly allowDownload: boolean;
}

export interface AudioPlayerViewPort {
    setLabels(labels: AudioPlayerLabels): void;
    showSource(source: AudioSourceViewModel): void;
    showUnavailable(message: string): void;
    destroy(): void;
}

export type AudioPlayerViewFactory = (host: HTMLDivElement) => AudioPlayerViewPort;
