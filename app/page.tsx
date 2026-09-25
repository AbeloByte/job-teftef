import { Briefcase, Inbox, TriangleAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { sanitizeDescription } from "@/lib/sanitize";
import { WORLDWIDE_FILTER } from "@/lib/remote";
import HuntButton from "@/components/HuntButton";
import JobCard from "@/components/JobCard";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 10;

const glass =
    "rounded-3xl border border-white/60 bg-white/60 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-zinc-900/60";

export default async function Home(props: PageProps<"/">) {
    const searchParams = await props.searchParams;
    const requestedPage = Number(searchParams.page) || 1;

    // First request tells us the total count so we can clamp the page number.
    const { count, error: countError } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .or(WORLDWIDE_FILTER);

    const totalJobs = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalJobs / PAGE_SIZE));
    const page = Math.min(Math.max(1, Math.floor(requestedPage)), totalPages);
    const from = (page - 1) * PAGE_SIZE;

    const { data: jobs, error } = countError
        ? { data: null, error: countError }
        : await supabase
              .from("jobs")
              .select("*")
              .or(WORLDWIDE_FILTER)
              .order("date_posted", { ascending: false })
              .range(from, from + PAGE_SIZE - 1);

    return (
        <div className="wallpaper min-h-screen text-zinc-900 dark:text-zinc-100">
            <header className="sticky top-0 z-40 border-b border-black/5 bg-white/60 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-black/50">
                <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold">
                        <Briefcase className="size-4" aria-hidden />
                        Jarvis
                    </span>
                    <HuntButton />
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                        Remote jobs
                    </h1>
                    <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                        Worldwide remote developer roles from We Work Remotely,
                        Jobicy and Remotive.
                    </p>
                </div>

                {error ? (
                    <div
                        className={`${glass} flex items-center gap-3 px-5 py-4 text-sm text-red-600 dark:text-red-400`}
                    >
                        <TriangleAlert className="size-4 shrink-0" aria-hidden />
                        Couldn&apos;t load jobs: {error.message}
                    </div>
                ) : !jobs || jobs.length === 0 ? (
                    <div className={`${glass} px-6 py-16 text-center`}>
                        <Inbox
                            className="mx-auto size-8 text-zinc-400"
                            strokeWidth={1.5}
                            aria-hidden
                        />
                        <p className="mt-3 font-medium">No jobs yet</p>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            Fetch new jobs to see the latest listings.
                        </p>
                    </div>
                ) : (
                    <>
                        <ul
                            className={`${glass} divide-y divide-black/5 overflow-hidden dark:divide-white/10`}
                        >
                            {jobs.map((job) => (
                                <li key={job.id}>
                                    <JobCard
                                        job={{
                                            id: job.id,
                                            title: job.title,
                                            company: job.company,
                                            url: job.url,
                                            location: job.location,
                                            date_posted: job.date_posted,
                                            tech_stack: job.tech_stack,
                                            geo_warning: job.geo_warning,
                                            descriptionHtml: sanitizeDescription(
                                                job.description,
                                            ),
                                        }}
                                    />
                                </li>
                            ))}
                        </ul>
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            from={from + 1}
                            to={from + jobs.length}
                            total={totalJobs}
                        />
                    </>
                )}
            </main>
        </div>
    );
}
