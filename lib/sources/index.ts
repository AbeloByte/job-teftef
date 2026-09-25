import { fetchJobicy } from "./jobicy";
import { fetchRemotive } from "./remotive";
import { fetchWeWorkRemotely } from "./weWorkRemotely";
import type { NormalizedJob } from "./types";

export type { NormalizedJob } from "./types";

const SOURCES: { name: string; fetch: () => Promise<NormalizedJob[]> }[] = [
    { name: "We Work Remotely", fetch: fetchWeWorkRemotely },
    { name: "Jobicy", fetch: fetchJobicy },
    { name: "Remotive", fetch: fetchRemotive },
];

// Titles we want: software engineering roles across the stack.
const DEV_TITLE =
    /\b(software|developer|engineer|engineering|programmer|front[\s-]?end|back[\s-]?end|full[\s-]?stack|react|next\.?js|node(\.?js)?|javascript|typescript|web|mobile|devops|sre)\b/i;
// Titles that match the words above but aren't hands-on dev work.
const NON_DEV_TITLE =
    /\b(sales|marketing|recruit(er|ing)?|writer|copywriter|customer|support|account (manager|executive)|content|evaluator|annotat)/i;

export function isDevRole(title: string) {
    return DEV_TITLE.test(title) && !NON_DEV_TITLE.test(title);
}

export type SourceReport = { name: string; found: number; error?: string };

// Fetch every source in parallel; a failing source is reported, not fatal.
export async function fetchAllJobs() {
    const results = await Promise.allSettled(SOURCES.map((s) => s.fetch()));
    const report: SourceReport[] = [];
    const seenUrls = new Set<string>();
    const seenRoles = new Set<string>(); // same job cross-posted on several boards
    const jobs: NormalizedJob[] = [];

    results.forEach((result, i) => {
        const name = SOURCES[i].name;
        if (result.status === "rejected") {
            report.push({ name, found: 0, error: String(result.reason?.message ?? result.reason) });
            return;
        }
        let found = 0;
        for (const job of result.value) {
            if (!job.url || !isDevRole(job.title)) continue;
            const roleKey = `${job.company}|${job.title}`.toLowerCase();
            if (seenUrls.has(job.url) || seenRoles.has(roleKey)) continue;
            seenUrls.add(job.url);
            seenRoles.add(roleKey);
            jobs.push(job);
            found++;
        }
        report.push({ name, found });
    });

    jobs.sort((a, b) => b.date_posted.localeCompare(a.date_posted));
    return { jobs, report };
}
