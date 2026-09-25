import sanitizeHtml from "sanitize-html";

// Job descriptions come from a third-party feed, so strip anything that could run script.
export function sanitizeDescription(html: string) {
    return sanitizeHtml(html ?? "", {
        allowedTags: [
            "p", "br", "strong", "b", "em", "i", "u", "a",
            "ul", "ol", "li", "h1", "h2", "h3", "h4", "blockquote",
        ],
        allowedAttributes: { a: ["href", "target", "rel"] },
        allowedSchemes: ["http", "https", "mailto"],
        transformTags: {
            a: sanitizeHtml.simpleTransform("a", {
                target: "_blank",
                rel: "noopener noreferrer",
            }),
        },
    });
}
