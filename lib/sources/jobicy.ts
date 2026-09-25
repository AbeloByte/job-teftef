import { isWorldwide } from "@/lib/remote";
import { fetchOptions, type NormalizedJob } from "./types";

type JobicyJob = {
    url: string;
    jobTitle: string;
    companyName: string;
    jobGeo: string;
    jobDescription: string;
    pubDate: string;
};

export async function fetchJobicy(): Promise<NormalizedJob[]> {
    const res = await fetch(
        "https://jobicy.com/api/v2/remote-jobs?count=100&industry=dev",
        fetchOptions(),
    );
    if (!res.ok) throw new Error(`Jobicy responded ${res.status}`);
    const data: { jobs?: JobicyJob[] } = await res.json();

    return (data.jobs ?? [])
        .filter((job) => isWorldwide(job.jobGeo))
        .map((job) => ({
            title: job.jobTitle,
            company: job.companyName,
            url: job.url,
            location: job.jobGeo,
            description: job.jobDescription,
            date_posted: new Date(job.pubDate).toISOString(),
        }));
}
