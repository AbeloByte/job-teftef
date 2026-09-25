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
