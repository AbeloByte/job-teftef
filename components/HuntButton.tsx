"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, RefreshCw } from "lucide-react";

export default function HuntButton() {
    const [isHunting, setIsHunting] = useState(false);
    const router = useRouter();

    const handleHunt = async () => {
        setIsHunting(true);
        try {
            // This triggers your API route!
            const res = await fetch("/api/test-fetch");
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            // Jump back to page 1 so the newest jobs are visible
            router.push("/");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Jarvis hit an error while hunting.");
        } finally {
            setIsHunting(false);
        }
    };

    return (
        <button
            onClick={handleHunt}
            disabled={isHunting}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3] px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#0077ed] disabled:cursor-not-allowed disabled:opacity-60"
        >
            {isHunting ? (
                <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
            ) : (
                <RefreshCw className="size-3.5" aria-hidden />
            )}
            {isHunting ? "Fetching jobs…" : "Fetch new jobs"}
        </button>
    );
}
