export interface AudioPlayerLabels {
    readonly playbackError: string;
    readonly readDenied: string;
    readonly invalidUrl: string;
    readonly emptyUrl: string;
    readonly play: string;
    readonly pause: string;
    readonly mute: string;
    readonly unmute: string;
    readonly progress: string;
    readonly download: string;
}

export interface StringResourceProvider {
    getString(id: string): string;
}

export function createAudioPlayerLabels(resources: StringResourceProvider): AudioPlayerLabels {
    return {
        playbackError: resources.getString("PlaybackError"),
        readDenied: resources.getString("ReadDenied"),
        invalidUrl: resources.getString("InvalidUrl"),
        emptyUrl: resources.getString("EmptyUrl"),
        play: resources.getString("PlayLabel"),
        pause: resources.getString("PauseLabel"),
        mute: resources.getString("MuteLabel"),
        unmute: resources.getString("UnmuteLabel"),
        progress: resources.getString("ProgressLabel"),
        download: resources.getString("DownloadLabel"),
    };
}
