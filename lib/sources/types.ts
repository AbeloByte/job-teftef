// Common shape every job source is converted into before saving.
export type NormalizedJob = {
    title: string;
    company: string;
    url: string;
    location: string;
    description: string; // HTML
    date_posted: string; // ISO 8601
};

// A function so each request gets its own fresh timeout signal.
export const fetchOptions = (): RequestInit => ({
    headers: { "User-Agent": "Mozilla/5.0 (compatible; JarvisJobHunter/1.0)" },
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
});
