"use client";

import { useState } from "react";
import {
    ArrowUpRight,
    Building,
    Clock,
    MapPin,
    PanelRightOpen,
    TriangleAlert,
} from "lucide-react";
import JobDetails from "@/components/JobDetails";
import { timeAgo } from "@/lib/format";

export type Job = {
    id: number | string;
    title: string;
    company: string;
    url: string;
    location: string | null;
    date_posted: string;
    tech_stack: string[] | null;
    geo_warning: boolean | null;
    descriptionHtml: string;
};

const MAX_TAGS = 5;

export default function JobCard({ job }: { job: Job }) {
    const [open, setOpen] = useState(false);
    const stack = job.tech_stack ?? [];

    return (
        <>
            <article className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h2 className="font-semibold tracking-tight">{job.title}</h2>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[13px] text-zinc-500 dark:text-zinc-400">
                        <span className="inline-flex items-center gap-1">
                            <Building className="size-3.5" aria-hidden />
                            {job.company}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3.5" aria-hidden />
                            {job.location || "Anywhere"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Clock className="size-3.5" aria-hidden />
                            <time dateTime={job.date_posted} suppressHydrationWarning>
                                {timeAgo(job.date_posted)}
                            </time>
                        </span>
                        {job.geo_warning && (
                            <span
                                title="May require living in a specific country or timezone"
                                className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400"
                            >
                                <TriangleAlert className="size-3.5" aria-hidden />
                                Location restricted
                            </span>
                        )}
                    </div>

                    {stack.length > 0 && (
                        <ul className="mt-2.5 flex flex-wrap gap-1.5">
                            {stack.slice(0, MAX_TAGS).map((tech) => (
                                <li
                                    key={tech}
                                    className="rounded-full bg-black/4 px-2.5 py-0.5 text-xs text-zinc-700 dark:bg-white/10 dark:text-zinc-300"
                                >
                                    {tech}
                                </li>
                            ))}
                            {stack.length > MAX_TAGS && (
                                <li className="px-1 py-0.5 text-xs text-zinc-400">
                                    +{stack.length - MAX_TAGS}
                                </li>
                            )}
                        </ul>
                    )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-black/5 px-3.5 py-1.5 text-[13px] font-medium transition-colors hover:bg-black/9 dark:bg-white/10 dark:hover:bg-white/15"
                    >
                        <PanelRightOpen className="size-3.5" aria-hidden />
                        Details
                    </button>
                    <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-[#0071e3] px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#0077ed]"
                    >
                        Apply
                        <ArrowUpRight className="size-3.5" aria-hidden />
                    </a>
                </div>
            </article>

            {open && <JobDetails job={job} onClose={() => setOpen(false)} />}
        </>
    );
}
