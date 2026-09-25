// Fallback used when the AI call fails: match well-known tech names in the text.
const TECH_PATTERNS: [string, RegExp][] = [
    ["JavaScript", /\bjavascript\b/i],
    ["TypeScript", /\btypescript\b/i],
    ["Python", /\bpython\b/i],
    ["Java", /\bjava\b(?!\s*script)/i],
    ["Kotlin", /\bkotlin\b/i],
    ["Swift", /\bswift\b/i],
    ["Go", /\bgolang\b|\bgo\s+(developer|engineer|language)\b/i],
    ["Rust", /\brust\b/i],
    ["C#", /\bc#/i],
    [".NET", /\.net\b/i],
    ["C++", /\bc\+\+/i],
    ["PHP", /\bphp\b/i],
    ["Ruby", /\bruby\b/i],
    ["Rails", /\brails\b/i],
    ["Scala", /\bscala\b/i],
    ["Elixir", /\belixir\b/i],
    ["React", /\breact(\.js|js)?\b(?!\s*native)/i],
    ["React Native", /\breact\s*native\b/i],
    ["Next.js", /\bnext\.?js\b/i],
    ["Vue", /\bvue(\.js|js)?\b/i],
    ["Angular", /\bangular\b/i],
    ["Svelte", /\bsvelte\b/i],
    ["Node.js", /\bnode(\.js|js)?\b/i],
    ["Django", /\bdjango\b/i],
    ["Flask", /\bflask\b/i],
    ["FastAPI", /\bfastapi\b/i],
    ["Spring", /\bspring\s*(boot)?\b/i],
    ["Laravel", /\blaravel\b/i],
    ["GraphQL", /\bgraphql\b/i],
    ["PostgreSQL", /\bpostgres(ql)?\b/i],
    ["MySQL", /\bmysql\b/i],
    ["MongoDB", /\bmongo(db)?\b/i],
    ["Redis", /\bredis\b/i],
    ["AWS", /\baws\b|amazon web services/i],
    ["GCP", /\bgcp\b|google cloud/i],
    ["Azure", /\bazure\b/i],
    ["Docker", /\bdocker\b/i],
    ["Kubernetes", /\bkubernetes\b|\bk8s\b/i],
    ["Terraform", /\bterraform\b/i],
    ["Shopify", /\bshopify\b/i],
    ["Flutter", /\bflutter\b/i],
    ["TensorFlow", /\btensorflow\b/i],
    ["PyTorch", /\bpytorch\b/i],
    ["SQL", /\bsql\b/i],
];

const MAX_RESULTS = 8;

// Ranks by mention count so boilerplate lists of every language don't dominate.
export function extractTechStack(text: string): string[] {
    return TECH_PATTERNS.map(([name, pattern]) => ({
        name,
        count: text.match(new RegExp(pattern.source, "gi"))?.length ?? 0,
    }))
        .filter(({ count }) => count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, MAX_RESULTS)
        .map(({ name }) => name);
}
