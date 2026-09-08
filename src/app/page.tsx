"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("../../frontend/src/App"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center font-['Outfit'] text-[#5a4138]">
      Loading Niche Jayega…
    </div>
  ),
});

export default function HomePage() {
  return <App />;
}
