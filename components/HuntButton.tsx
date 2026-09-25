"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

            // This tells Next.js to refresh the page to show the new jobs
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
            className="bg-gray-900 hover:bg-black text-white text-sm font-semibold py-2 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
            {isHunting ? (
                <>
                    <span className="animate-spin">⚙️</span> Jarvis is
                    thinking...
                </>
            ) : (
                <>
                    <span></span> Hunt for New Jobs
                </>
            )}
        </button>
    );
}
