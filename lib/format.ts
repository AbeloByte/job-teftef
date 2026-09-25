export function timeAgo(dateString: string) {
    const days = Math.floor(
        (Date.now() - new Date(dateString).getTime()) / 86_400_000,
    );
    if (days <= 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    return new Date(dateString).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
}

// Used for display: every stored job's URL points at the site it came from.
export function sourceFromUrl(url: string) {
    const host = (() => {
        try {
            return new URL(url).hostname.replace(/^www\./, "");
        } catch {
            return "";
        }
    })();
    if (host.endsWith("weworkremotely.com")) return "We Work Remotely";
    if (host.endsWith("jobicy.com")) return "Jobicy";
    if (host.endsWith("remotive.com")) return "Remotive";
    return host || "Source";
}
