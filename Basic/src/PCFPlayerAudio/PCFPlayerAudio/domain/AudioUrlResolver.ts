export interface AudioUrlResolver {
    resolve(value: string): string | undefined;
}

export class HttpAudioUrlResolver implements AudioUrlResolver {
    public resolve(value: string): string | undefined {
        try {
            const url = new URL(value);
            const isHttp = url.protocol === "https:" || url.protocol === "http:";
            const hasEmbeddedCredentials = Boolean(url.username || url.password);
            return isHttp && !hasEmbeddedCredentials ? url.href : undefined;
        } catch {
            return undefined;
        }
    }
}
