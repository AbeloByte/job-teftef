import { isWorldwide } from "@/lib/remote";
import { fetchOptions, type NormalizedJob } from "./types";

type RemotiveJob = {
    title: string;
    company_name: string;
    url: string;
    candidate_required_location: string;
    description: string;
    publication_date: string;
};

// Remotive's free API returns ~19 recent jobs and ignores the category filter.
export async function fetchRemotive(): Promise<NormalizedJob[]> {
    const res = await fetch("https://remotive.com/api/remote-jobs", fetchOptions());
    if (!res.ok) throw new Error(`Remotive responded ${res.status}`);
    const data: { jobs: RemotiveJob[] } = await res.json();

    return data.jobs
        .filter((job) => isWorldwide(job.candidate_required_location))
        .map((job) => ({
            title: job.title,
            company: job.company_name,
            url: job.url,
            location: job.candidate_required_location,
            description: job.description,
            date_posted: new Date(job.publication_date).toISOString(),
        }));
}
