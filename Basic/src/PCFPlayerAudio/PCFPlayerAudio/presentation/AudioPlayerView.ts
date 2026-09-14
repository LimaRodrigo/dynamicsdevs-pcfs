import type { AudioPlayerLabels } from "../application/AudioPlayerLabels";
import type { AudioPlayerViewPort, AudioSourceViewModel } from "../application/AudioPlayerViewPort";
import { formatAudioTime } from "./formatAudioTime";

const PROGRESS_MAX = 1000;

export class AudioPlayerView implements AudioPlayerViewPort {
    private readonly container: HTMLDivElement;
    private readonly audio: HTMLAudioElement;
    private readonly playButton: HTMLButtonElement;
    private readonly playIcon: HTMLSpanElement;
    private readonly time: HTMLSpanElement;
    private readonly progress: HTMLInputElement;
    private readonly volumeButton: HTMLButtonElement;
    private readonly volumeIcon: HTMLSpanElement;
    private readonly download: HTMLAnchorElement;
    private readonly status: HTMLDivElement;
    private currentUrl?: string;
    private labels?: AudioPlayerLabels;

    public constructor(host: HTMLDivElement) {
        this.container = document.createElement("div");
        this.container.className = "pcf-player-container";

        this.audio = document.createElement("audio");
        this.audio.preload = "metadata";
        this.audio.addEventListener("error", this.onAudioError);
        this.audio.addEventListener("loadedmetadata", this.onAudioReady);
        this.audio.addEventListener("durationchange", this.onTimeUpdate);
        this.audio.addEventListener("timeupdate", this.onTimeUpdate);
        this.audio.addEventListener("play", this.onPlaybackChange);
        this.audio.addEventListener("pause", this.onPlaybackChange);
        this.audio.addEventListener("ended", this.onPlaybackChange);
        this.audio.addEventListener("volumechange", this.onVolumeChange);

        const controls = document.createElement("div");
        controls.className = "pcf-player-controls";
        this.playButton = this.createButton("pcf-player-button pcf-player-play", this.onPlayClick);
        this.playIcon = document.createElement("span");
        this.playIcon.className = "pcf-player-icon";
        this.playButton.appendChild(this.playIcon);

        this.time = document.createElement("span");
        this.time.className = "pcf-player-time";

        this.progress = document.createElement("input");
        this.progress.className = "pcf-player-progress";
        this.progress.type = "range";
        this.progress.min = "0";
        this.progress.max = String(PROGRESS_MAX);
        this.progress.value = "0";
        this.progress.addEventListener("input", this.onSeek);

        this.volumeButton = this.createButton("pcf-player-button pcf-player-volume", this.onVolumeClick);
        this.volumeIcon = document.createElement("span");
        this.volumeIcon.className = "pcf-player-icon";
        this.volumeButton.appendChild(this.volumeIcon);

        this.download = document.createElement("a");
        this.download.className = "pcf-player-download";
        this.download.download = "";
        this.download.target = "_blank";
        this.download.rel = "noopener noreferrer";

        this.status = document.createElement("div");
        this.status.className = "pcf-player-status";
        this.status.setAttribute("role", "status");

        controls.append(this.playButton, this.time, this.progress, this.volumeButton, this.download);
        this.container.append(this.audio, controls, this.status);
        host.appendChild(this.container);
        this.setControlsAvailable(false);
        this.updatePlaybackButton();
        this.updateVolumeButton();
        this.updateTimeDisplay();
    }

    public setLabels(labels: AudioPlayerLabels): void {
        this.labels = labels;
        this.progress.setAttribute("aria-label", labels.progress);
        this.download.textContent = labels.download;
        this.download.setAttribute("aria-label", labels.download);
        this.updatePlaybackButton();
        this.updateVolumeButton();
    }

    public showSource(source: AudioSourceViewModel): void {
        this.setControlsAvailable(true);
        this.updateDownload(source.allowDownload, source.url);
        if (source.url === this.currentUrl) return;

        this.clearSource();
        this.showStatus("");
        this.currentUrl = source.url;
        this.audio.src = source.url;
        this.audio.load();
    }

    public showUnavailable(message: string): void {
        this.clearSource();
        this.setControlsAvailable(false);
        this.showStatus(message);
    }

    public destroy(): void {
        this.audio.removeEventListener("error", this.onAudioError);
        this.audio.removeEventListener("loadedmetadata", this.onAudioReady);
        this.audio.removeEventListener("durationchange", this.onTimeUpdate);
        this.audio.removeEventListener("timeupdate", this.onTimeUpdate);
        this.audio.removeEventListener("play", this.onPlaybackChange);
        this.audio.removeEventListener("pause", this.onPlaybackChange);
        this.audio.removeEventListener("ended", this.onPlaybackChange);
        this.audio.removeEventListener("volumechange", this.onVolumeChange);
        this.playButton.removeEventListener("click", this.onPlayClick);
        this.progress.removeEventListener("input", this.onSeek);
        this.volumeButton.removeEventListener("click", this.onVolumeClick);
        this.clearSource();
        this.container.remove();
    }

    private createButton(className: string, listener: () => void): HTMLButtonElement {
        const button = document.createElement("button");
        button.className = className;
        button.type = "button";
        button.addEventListener("click", listener);
        return button;
    }

    private updateDownload(allowed: boolean, url: string): void {
        this.download.hidden = !allowed;
        if (allowed) this.download.href = url;
        else this.download.removeAttribute("href");
    }

    private setControlsAvailable(available: boolean): void {
        this.playButton.disabled = !available;
        this.progress.disabled = !available;
        this.volumeButton.disabled = !available;
        if (!available) this.updateDownload(false, "");
    }

    private readonly onPlayClick = (): void => {
        if (this.audio.paused) {
            void this.audio.play().catch(() => this.showStatus(this.labels?.playbackError ?? ""));
        } else {
            this.audio.pause();
        }
    };

    private readonly onSeek = (): void => {
        if (!Number.isFinite(this.audio.duration)) return;
        this.audio.currentTime = (Number(this.progress.value) / PROGRESS_MAX) * this.audio.duration;
    };

    private readonly onVolumeClick = (): void => {
        this.audio.muted = !this.audio.muted;
    };

    private readonly onAudioError = (): void => {
        if (this.currentUrl && this.audio.error) this.showStatus(this.labels?.playbackError ?? "");
    };

    private readonly onAudioReady = (): void => {
        if (this.currentUrl && !this.audio.error) this.showStatus("");
        this.updateTimeDisplay();
    };

    private readonly onTimeUpdate = (): void => this.updateTimeDisplay();
    private readonly onPlaybackChange = (): void => this.updatePlaybackButton();
    private readonly onVolumeChange = (): void => this.updateVolumeButton();

    private updatePlaybackButton(): void {
        const playing = !this.audio.paused;
        const label = playing ? this.labels?.pause : this.labels?.play;
        this.playIcon.textContent = playing ? "\u275A\u275A" : "\u25B6";
        this.setAccessibleName(this.playButton, label);
    }

    private updateVolumeButton(): void {
        const label = this.audio.muted ? this.labels?.unmute : this.labels?.mute;
        this.volumeIcon.textContent = this.audio.muted ? "\uD83D\uDD07" : "\uD83D\uDD0A";
        this.setAccessibleName(this.volumeButton, label);
    }

    private setAccessibleName(element: HTMLElement, label: string | undefined): void {
        if (!label) return;
        element.setAttribute("aria-label", label);
        element.title = label;
    }

    private updateTimeDisplay(): void {
        const duration = Number.isFinite(this.audio.duration) ? this.audio.duration : 0;
        const current = Number.isFinite(this.audio.currentTime) ? this.audio.currentTime : 0;
        this.time.textContent = formatAudioTime(current) + " / " + formatAudioTime(duration);
        const value = duration > 0 ? Math.round((current / duration) * PROGRESS_MAX) : 0;
        this.progress.value = String(value);
        this.progress.style.setProperty("--pcf-player-progress", String(value / 10) + "%");
    }

    private showStatus(message: string): void {
        this.status.textContent = message;
        this.status.hidden = !message;
    }

    private clearSource(): void {
        this.currentUrl = undefined;
        if (this.audio.hasAttribute("src")) {
            this.audio.pause();
            this.audio.removeAttribute("src");
            this.audio.load();
        }
        this.updatePlaybackButton();
        this.updateTimeDisplay();
    }
}
