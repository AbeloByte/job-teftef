import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const buttonClass =
  "inline-flex size-9 items-center justify-center rounded-full border border-white/60 bg-white/60 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-zinc-900/60";
const enabledClass = "hover:bg-white/90 dark:hover:bg-zinc-800/80";
const disabledClass = "cursor-not-allowed text-zinc-300 dark:text-zinc-700";

export default function Pagination({
  page,
  totalPages,
  from,
  to,
  total,
}: {
  page: number;
  totalPages: number;
  from: number;
  to: number;
  total: number;
}) {
  const href = (p: number) => (p === 1 ? "/" : `/?page=${p}`);

  return (
    <nav
      aria-label="Pagination"
      className="mt-5 flex items-center justify-between px-1"
    >
      <p className="text-sm text-zinc-500 tabular-nums dark:text-zinc-400">
        {from === to ? from : `${from}–${to}`} of {total}
      </p>

      {/* Always shown; arrows are disabled when there is only one page */}
      <div className="flex items-center gap-2">
        <span className="mr-1 text-sm text-zinc-500 tabular-nums dark:text-zinc-400">
          Page {page} of {totalPages}
        </span>
        {page > 1 ? (
          <Link
            href={href(page - 1)}
            aria-label="Previous page"
            className={`${buttonClass} ${enabledClass}`}
          >
            <ChevronLeft className="size-4" />
          </Link>
        ) : (
          <span aria-hidden className={`${buttonClass} ${disabledClass}`}>
            <ChevronLeft className="size-4" />
          </span>
        )}
        {page < totalPages ? (
          <Link
            href={href(page + 1)}
            aria-label="Next page"
            className={`${buttonClass} ${enabledClass}`}
          >
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <span aria-hidden className={`${buttonClass} ${disabledClass}`}>
            <ChevronRight className="size-4" />
          </span>
        )}
      </div>
    </nav>
  );
}
