import { fetchOptions, type NormalizedJob } from "./types";

const FEEDS = [
    "https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss",
    "https://weworkremotely.com/categories/remote-front-end-programming-jobs.rss",
    "https://weworkremotely.com/categories/remote-back-end-programming-jobs.rss",
];

const WORLDWIDE_REGION = "Anywhere in the World";

function decodeEntities(text: string) {
    return text
        .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
        .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, "&");
}

function readTag(item: string, tag: string) {
    const match = item.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
    if (!match) return "";
    return decodeEntities(match[1].replace(/^<!\[CDATA\[|\]\]>$/g, "")).trim();
}

async function fetchFeed(url: string): Promise<NormalizedJob[]> {
    const res = await fetch(url, fetchOptions());
    if (!res.ok) throw new Error(`We Work Remotely responded ${res.status}`);
    const xml = await res.text();
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

    return items
        .filter((item) => readTag(item, "region") === WORLDWIDE_REGION)
        .map((item) => {
            // Titles look like "Company: Job Title"
            const rawTitle = readTag(item, "title");
            const sep = rawTitle.indexOf(": ");
            return {
                title: sep > -1 ? rawTitle.slice(sep + 2) : rawTitle,
                company: sep > -1 ? rawTitle.slice(0, sep) : "Unknown",
                url: readTag(item, "link"),
                location: "Worldwide",
                description: readTag(item, "description"),
                date_posted: new Date(readTag(item, "pubDate")).toISOString(),
            };
        });
}

export async function fetchWeWorkRemotely(): Promise<NormalizedJob[]> {
    const feeds = await Promise.all(FEEDS.map(fetchFeed));
    return feeds.flat();
}
