export function formatAudioTime(seconds: number): string {
    const total = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const remaining = total % 60;
    const minuteText = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes);
    const base = minuteText + ":" + String(remaining).padStart(2, "0");
    return hours > 0 ? String(hours) + ":" + base : base;
}
