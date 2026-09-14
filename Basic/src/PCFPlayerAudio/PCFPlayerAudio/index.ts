import type { IInputs, IOutputs } from "./generated/ManifestTypes";

export class PCFPlayerAudio implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _container?: HTMLDivElement;
    private _audioElement?: HTMLAudioElement;
    private _statusElement?: HTMLDivElement;
    private _currentUrl: string | undefined;
    private _errorMessage = "";

    public init(
        context: ComponentFramework.Context<IInputs>,
        _notifyOutputChanged: () => void,
        _state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this._container = document.createElement("div");
        this._container.className = "pcf-player-container";
        this._audioElement = document.createElement("audio");
        this._audioElement.className = "pcf-player-audio";
        this._audioElement.controls = true;
        this._audioElement.preload = "metadata";
        this._audioElement.addEventListener("error", this.onAudioError);
        this._audioElement.addEventListener("loadedmetadata", this.onAudioReady);
        this._statusElement = document.createElement("div");
        this._statusElement.className = "pcf-player-status";
        this._statusElement.setAttribute("role", "status");
        this._container.append(this._audioElement, this._statusElement);
        container.appendChild(this._container);
        this.updateView(context);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        const audio = this._audioElement;
        if (!audio) return;
        this._errorMessage = context.resources.getString("PlaybackError");
        audio.setAttribute("aria-label", context.resources.getString("PlayerLabel"));
        const field = context.parameters.UrlAudio;
        if (field.security?.readable === false) {
            this.clearSource();
            audio.hidden = true;
            this.showStatus(context.resources.getString("ReadDenied"));
            return;
        }
        const rawUrl = field.raw?.trim() ?? "";
        const url = this.normalizeUrl(rawUrl);
        if (!url) {
            this.clearSource();
            audio.hidden = true;
            this.showStatus(context.resources.getString(rawUrl ? "InvalidUrl" : "EmptyUrl"));
            return;
        }
        audio.hidden = false;
        // Preserve playback across unrelated host updates.
        if (url === this._currentUrl) return;
        this.clearSource();
        this.showStatus("");
        this._currentUrl = url;
        audio.src = url;
        audio.load();
    }

    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        this._audioElement?.removeEventListener("error", this.onAudioError);
        this._audioElement?.removeEventListener("loadedmetadata", this.onAudioReady);
        this.clearSource();
        this._container?.remove();
        this._audioElement = undefined;
        this._statusElement = undefined;
        this._container = undefined;
    }

    private normalizeUrl(value: string): string | undefined {
        try {
            const url = new URL(value);
            if ((url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password) {
                return url.href;
            }
        } catch {
        }
        return undefined;
    }

    private readonly onAudioError = (): void => {
        if (this._currentUrl && this._audioElement?.error) {
            this.showStatus(this._errorMessage);
        }
    };

    private readonly onAudioReady = (): void => {
        if (this._currentUrl && !this._audioElement?.error) this.showStatus("");
    };

    private showStatus(message: string): void {
        if (this._statusElement) {
            this._statusElement.textContent = message;
            this._statusElement.hidden = !message;
        }
    }

    private clearSource(): void {
        const audio = this._audioElement;
        this._currentUrl = undefined;
        if (audio?.hasAttribute("src")) {
            audio.pause();
            audio.removeAttribute("src");
            audio.load();
        }
    }
}