import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { aiModel } from "@/lib/ai";
import { extractTechStack } from "@/lib/techKeywords";
import { isWorldwide } from "@/lib/remote";

const MAX_JOBS = 10;
const MAX_DESCRIPTION_CHARS = 4000;
const DELAY_BETWEEN_CALLS_MS = 1500;
const MAX_RETRIES = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const errorMessage = (error: unknown) =>
    error instanceof Error ? error.message : String(error);

// Retries on 429 (rate limit) and 503 (model overloaded) with exponential backoff.
async function generateWithRetry(prompt: string) {
    for (let attempt = 0; ; attempt++) {
        try {
            return await aiModel.generateContent(prompt);
        } catch (error) {
            const isRetryable = /\b(429|503)\b/.test(errorMessage(error));
            if (!isRetryable || attempt >= MAX_RETRIES) throw error;
            await sleep(2000 * 2 ** attempt);
        }
    }
}

type RemotiveJob = {
    title: string;
    company_name: string;
    url: string;
    candidate_required_location: string;
    description: string;
    publication_date: string;
};

export async function GET() {
    try {
        const response = await fetch(
            "https://remotive.com/api/remote-jobs?category=software-dev&limit=5",
        );
        if (!response.ok) throw new Error("Failed to fetch from Remotive");
        const data: { jobs: RemotiveJob[] } = await response.json();

        // Every Remotive job is remote, but most are limited to certain regions.
        // Keep only jobs open to candidates anywhere, then cap the count ourselves
        // since Remotive doesn't always honor `limit`.
        const jobs = data.jobs
            .filter((job) => isWorldwide(job.candidate_required_location))
            .slice(0, MAX_JOBS);
        const jobsWithAnalysis = [];
        let aiFailures = 0;

        // Sequential instead of Promise.all to stay under Gemini's rate limit.
        for (const [index, job] of jobs.entries()) {
            if (index > 0) await sleep(DELAY_BETWEEN_CALLS_MS);

            const cleanDescription = job.description
                .replace(/<[^>]*>?/gm, " ")
                .slice(0, MAX_DESCRIPTION_CHARS);

            const prompt = `
          Analyze this job description.
          1. Extract the main programming languages and frameworks into a "tech_stack" array.
          2. Check if the job requires the candidate to live in a specific country or timezone. If it restricts location, set "geo_warning" to true. If anywhere, set false.

          Format: {"tech_stack": ["React", "Node"], "geo_warning": false}

          Job Description:
          ${cleanDescription}
        `;

            const baseJob = {
                title: job.title,
                company: job.company_name,
                url: job.url,
                location: job.candidate_required_location,
                description: job.description,
                date_posted: job.publication_date,
            };

            try {
                const aiResponse = await generateWithRetry(prompt);
                const aiData = JSON.parse(aiResponse.response.text());

                jobsWithAnalysis.push({
                    ...baseJob,
                    tech_stack: aiData.tech_stack || [],
                    geo_warning: aiData.geo_warning || false,
                });
            } catch (error) {
                aiFailures++;
                console.error("AI Error on job:", job.title, "-", errorMessage(error));

                // Fall back to keyword matching so the job still gets a tech stack.
                jobsWithAnalysis.push({
                    ...baseJob,
                    tech_stack: extractTechStack(`${job.title} ${cleanDescription}`),
                    geo_warning: false,
                });
            }
        }

        const { data: savedJobs, error } = await supabase
            .from("jobs")
            .upsert(jobsWithAnalysis, { onConflict: "url" })
            .select();

        if (error) throw error;

        return NextResponse.json({
            message: "Jarvis successfully analyzed and saved jobs.",
            savedCount: savedJobs?.length || 0,
            aiFailures,
        });
    } catch (error) {
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}
