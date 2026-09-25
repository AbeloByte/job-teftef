import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { aiModel } from "@/lib/ai";
import { extractTechStack } from "@/lib/techKeywords";
import { fetchAllJobs, type NormalizedJob } from "@/lib/sources";

// Gemini's free tier is tight, so only the newest jobs get AI analysis.
// The rest use keyword matching, which is instant.
const AI_BUDGET = 10;
const MAX_DESCRIPTION_CHARS = 4000;
const DELAY_BETWEEN_CALLS_MS = 1500;
const MAX_RETRIES = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const errorMessage = (error: unknown) =>
    error instanceof Error ? error.message : String(error);

const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, " ");

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

async function analyzeWithAI(job: NormalizedJob) {
    const cleanDescription = stripHtml(job.description).slice(0, MAX_DESCRIPTION_CHARS);
    const prompt = `
          Analyze this job description.
          1. Extract the main programming languages and frameworks into a "tech_stack" array.
          2. Check if the job requires the candidate to live in a specific country or timezone. If it restricts location, set "geo_warning" to true. If anywhere, set false.

          Format: {"tech_stack": ["React", "Node"], "geo_warning": false}

          Job Description:
          ${cleanDescription}
        `;
    const aiResponse = await generateWithRetry(prompt);
    const aiData = JSON.parse(aiResponse.response.text());
    return {
        tech_stack: (aiData.tech_stack as string[]) || [],
        geo_warning: Boolean(aiData.geo_warning),
    };
}

function analyzeWithKeywords(job: NormalizedJob) {
    return {
        tech_stack: extractTechStack(`${job.title} ${stripHtml(job.description)}`),
        // Sources are already filtered to worldwide roles
        geo_warning: false,
    };
}

export async function GET() {
    try {
        const { jobs, report } = await fetchAllJobs();

        // Skip jobs we already have so we don't overwrite earlier analysis.
        const { data: existing, error: existingError } = await supabase
            .from("jobs")
            .select("url")
            .in("url", jobs.map((job) => job.url));
        if (existingError) throw existingError;

        const existingUrls = new Set(existing?.map((row) => row.url));
        const newJobs = jobs.filter((job) => !existingUrls.has(job.url));

        const analyzedJobs = [];
        let aiAnalyzed = 0;
        let aiFailures = 0;

        for (const [index, job] of newJobs.entries()) {
            let analysis = analyzeWithKeywords(job);

            if (index < AI_BUDGET) {
                if (index > 0) await sleep(DELAY_BETWEEN_CALLS_MS);
                try {
                    analysis = await analyzeWithAI(job);
                    aiAnalyzed++;
                } catch (error) {
                    aiFailures++;
                    console.error("AI Error on job:", job.title, "-", errorMessage(error));
                }
            }

            analyzedJobs.push({ ...job, ...analysis });
        }

        let savedCount = 0;
        if (analyzedJobs.length > 0) {
            const { data: saved, error } = await supabase
                .from("jobs")
                .upsert(analyzedJobs, { onConflict: "url", ignoreDuplicates: true })
                .select("id");
            if (error) throw error;
            savedCount = saved?.length ?? 0;
        }

        return NextResponse.json({
            message: "Jarvis successfully analyzed and saved jobs.",
            matched: jobs.length,
            savedCount,
            aiAnalyzed,
            aiFailures,
            sources: report,
        });
    } catch (error) {
        return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
    }
}
