import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { aiModel } from "@/lib/ai";

export async function GET() {
    try {
        const response = await fetch(
            "https://remotive.com/api/remote-jobs?category=software-dev&limit=5",
        );
        if (!response.ok) throw new Error("Failed to fetch from Remotive");
        const data = await response.json();

        const jobsWithAIAnalysis = await Promise.all(
            data.jobs.map(async (job: any) => {
                const cleanDescription = job.description.replace(
                    /<[^>]*>?/gm,
                    "",
                );

                const prompt = `
          Analyze this job description.
          1. Extract the main programming languages and frameworks into a "tech_stack" array.
          2. Check if the job requires the candidate to live in a specific country or timezone. If it restricts location, set "geo_warning" to true. If anywhere, set false.

          Format: {"tech_stack": ["React", "Node"], "geo_warning": false}

          Job Description:
          ${cleanDescription}
        `;

                try {
                    const aiResponse = await aiModel.generateContent(prompt);
                    const aiData = JSON.parse(aiResponse.response.text());

                    return {
                        title: job.title,
                        company: job.company_name,
                        url: job.url,
                        location: job.candidate_required_location,
                        description: job.description,
                        date_posted: job.publication_date,
                        tech_stack: aiData.tech_stack || [],
                        geo_warning: aiData.geo_warning || false,
                    };
                } catch (error) {
                    console.error("AI Error on job:", job.title);
                    return {
                        title: job.title,
                        company: job.company_name,
                        url: job.url,
                        location: job.candidate_required_location,
                        description: job.description,
                        date_posted: job.publication_date,
                        tech_stack: [],
                        geo_warning: false,
                    };
                }
            }),
        );

        const { data: savedJobs, error } = await supabase
            .from("jobs")
            .upsert(jobsWithAIAnalysis, { onConflict: "url" })
            .select();

        if (error) throw error;

        return NextResponse.json({
            message: "Jarvis successfully analyzed and saved jobs.",
            savedCount: savedJobs?.length || 0,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
