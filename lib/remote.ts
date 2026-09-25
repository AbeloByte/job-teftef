// Remotive only lists remote jobs, but most are limited to certain regions.
// "Strictly remote" here means open to candidates anywhere in the world.
const WORLDWIDE_PATTERN = /worldwide|anywhere/i;

export function isWorldwide(location: string | null | undefined) {
    return WORLDWIDE_PATTERN.test(location ?? "");
}

// Same rule as a PostgREST `or` filter for Supabase queries.
export const WORLDWIDE_FILTER =
    "location.ilike.%worldwide%,location.ilike.%anywhere%";
