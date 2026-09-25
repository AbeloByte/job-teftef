"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
    ArrowUpRight,
    Building,
    Clock,
    MapPin,
    TriangleAlert,
    X,
} from "lucide-react";
import type { Job } from "@/components/JobCard";
import { timeAgo } from "@/lib/format";

export default function JobDetails({
    job,
    onClose,
}: {
    job: Job;
    onClose: () => void;
}) {
    // Close on Escape and lock background scroll while open
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [onClose]);

    const stack = job.tech_stack ?? [];

    // Portal to <body>: the glass list uses backdrop-filter, which would otherwise
    // trap this fixed-position panel inside the list instead of the viewport.
    return createPortal(
        <div
            className="fixed inset-0 z-50 flex h-dvh justify-end"
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-details-title"
        >
            <button
                type="button"
                aria-label="Close details"
                onClick={onClose}
                className="absolute inset-0 bg-black/20 backdrop-blur-sm dark:bg-black/50"
            />

            <aside className="relative m-2 flex max-h-[calc(100dvh-1rem)] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/75 backdrop-blur-2xl backdrop-saturate-150 sm:m-3 sm:max-h-[calc(100dvh-1.5rem)] dark:border-white/10 dark:bg-zinc-900/75">
                <header className="flex shrink-0 items-start justify-between gap-4 border-b border-black/5 px-6 py-5 dark:border-white/10">
                    <div className="min-w-0">
                        <h2
                            id="job-details-title"
                            className="text-xl font-semibold tracking-tight"
                        >
                            {job.title}
                        </h2>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[13px] text-zinc-500 dark:text-zinc-400">
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
                                {timeAgo(job.date_posted)}
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-full bg-black/5 p-1.5 text-zinc-500 transition-colors hover:bg-black/10 hover:text-zinc-900 dark:bg-white/10 dark:text-zinc-400 dark:hover:bg-white/15 dark:hover:text-white"
                    >
                        <X className="size-4" />
                    </button>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
                    {job.geo_warning && (
                        <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                            <TriangleAlert
                                className="mt-0.5 size-4 shrink-0"
                                aria-hidden
                            />
                            This role may require you to live in a specific
                            country or timezone.
                        </div>
                    )}

                    {stack.length > 0 && (
                        <section className="mb-6">
                            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                Tech stack
                            </h3>
                            <ul className="flex flex-wrap gap-1.5">
                                {stack.map((tech) => (
                                    <li
                                        key={tech}
                                        className="rounded-full bg-black/5 px-2.5 py-1 text-xs text-zinc-700 dark:bg-white/10 dark:text-zinc-300"
                                    >
                                        {tech}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Description
                    </h3>
                    <div
                        className="job-description"
                        // Sanitized on the server in lib/sanitize.ts
                        dangerouslySetInnerHTML={{ __html: job.descriptionHtml }}
                    />
                </div>

                <footer className="shrink-0 border-t border-black/5 px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-white/10">
                    <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-1.5 rounded-full bg-[#0071e3] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0077ed]"
                    >
                        Apply on Remotive
                        <ArrowUpRight className="size-4" aria-hidden />
                    </a>
                </footer>
            </aside>
        </div>,
        document.body,
    );
}
