import React from "react";

/** Warm atmosphere only — the original 4K video files were never in the repo. */
export const BackgroundVideoLayer: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-[#fff8f4]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#fff8f4] via-[#ffefe6]/80 to-[#fff8f4]" />
      <div className="absolute -top-24 right-0 w-[480px] h-[480px] rounded-full bg-[#ffdbce]/40 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[360px] h-[360px] rounded-full bg-[#fea619]/15 blur-3xl" />
    </div>
  );
};
