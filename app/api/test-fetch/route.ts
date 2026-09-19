import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch remote software-dev jobs from Remotive API
    const response = await fetch('https://remotive.com/api/remote-jobs?category=software-dev&limit=5');

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const data = await response.json();

    // We map over the jobs to just pick the data we actually care about
    const simplifiedJobs = data.jobs.map((job: any) => ({
      title: job.title,
      company: job.company_name,
      type: job.job_type,
      location: job.candidate_required_location, // The all-important geo-restriction!
      url: job.url,
      date_posted: job.publication_date,
    }));

    return NextResponse.json({
      message: "Jarvis successfully fetched jobs.",
      count: simplifiedJobs.length,
      jobs: simplifiedJobs
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
