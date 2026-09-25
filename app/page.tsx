import { supabase } from "@/lib/supabase";
import HuntButton from "@/components/HuntButton";

export default async function Home() {
    // 1. Fetch all jobs from our database, sorted by newest first
    const { data: jobs, error } = await supabase
        .from("jobs")
        .select("*")
        .order("date_posted", { ascending: false });

    if (error) {
        return (
            <div className="p-10 text-red-500">
                Error loading jobs: {error.message}
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 p-10 text-gray-900">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                            Project Jarvis
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Your personal AI job hunter.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                            {jobs?.length || 0} Jobs Found
                        </div>
                        <HuntButton />
                    </div>
                </header>

                {/* The Data Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-sm uppercase text-gray-500">
                                <th className="p-4 font-semibold">
                                    Job Title & Company
                                </th>
                                <th className="p-4 font-semibold">
                                    Tech Stack
                                </th>
                                <th className="p-4 font-semibold">Location</th>
                                <th className="p-4 font-semibold">Posted</th>
                                <th className="p-4 font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {jobs?.map((job) => (
                                <tr
                                    key={job.id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="p-4">
                                        <div className="font-semibold text-gray-900">
                                            {job.title}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {job.company}
                                        </div>
                                    </td>

                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {job.tech_stack &&
                                            job.tech_stack.length > 0 ? (
                                                job.tech_stack.map(
                                                    (tech: string) => (
                                                        <span
                                                            key={tech}
                                                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md border border-gray-200"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ),
                                                )
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">
                                                    Not specified
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="p-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            {job.location}
                                            {/* ⚠️ Jarvis shows a warning if the AI found strict location rules */}
                                            {job.geo_warning && (
                                                <span
                                                    title="Warning: Might have strict timezone/country rules"
                                                    className="text-yellow-500 cursor-help"
                                                >
                                                    ⚠️
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="p-4 text-sm text-gray-500">
                                        {new Date(
                                            job.date_posted,
                                        ).toLocaleDateString()}
                                    </td>

                                    <td className="p-4">
                                        <a
                                            href={job.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                                        >
                                            View Job
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
