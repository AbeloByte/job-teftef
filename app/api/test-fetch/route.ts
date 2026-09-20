import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { aiModel } from "@/lib/ai";

export async function GET() {
    try {
        const response = await fetch(
            "https://remotive.com/api/remote-jobs?category=software-dev&limit=3",
        );
        if (!response.ok) throw new Error("Failed to fetch from Remotive");
        const data = await response.json();

        const jobsWithAIAnalysis = await Promise.all(
            data.jobs.map(async (job: any) => {
                // Clean the HTML tags out of the description so the AI can read it easily
                const cleanDescription = job.description.replace(
                    /<[^>]*>?/gm,
                    "",
                );

                const prompt = `
          Analyze this job description.
          1. Extract the main programming languages and frameworks into a "tech_stack" array.
          2. Check if the job requires the candidate to live in a specific country or timezone (e.g., US Only, UK Only, EST). If it restricts location, set "geo_warning" to true. If it is truly global/anywhere, set it to false.

          Format: {"tech_stack": ["React", "Node"], "geo_warning": false}

          Job Description:
          ${cleanDescription}
        `;

                try {
                    const aiResponse = await aiModel.generateContent(prompt);
                    const responseText = aiResponse.response.text();

                    // Because we enabled JSON mode, we don't need to clean the string anymore!
                    const aiData = JSON.parse(responseText);

                    return {
                        title: job.title,
                        company: job.company_name,
                        url: job.url,
                        location: job.candidate_required_location,
                        description: job.description, // Keep original HTML for the dashboard
                        date_posted: job.publication_date,
                        tech_stack: aiData.tech_stack || [],
                        geo_warning: aiData.geo_warning || false,
                    };
                } catch (error) {
                    console.error("AI Error on job:", job.title, error);
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
            jobs: savedJobs,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
