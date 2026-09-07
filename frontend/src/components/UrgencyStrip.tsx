import React from 'react';
import { Clock } from 'lucide-react';

export const UrgencyStrip: React.FC<{ openCount: number }> = ({ openCount }) => {
  return (
    <div className="w-full bg-[#33302c] text-[#f7efea] px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-sm relative overflow-hidden">
      <div className="absolute -left-12 -top-12 w-32 h-32 bg-[#a33900]/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#cc4900] text-white text-[11px] font-bold uppercase tracking-wider shrink-0 animate-curfew-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span>Midnight Gate Run Mode</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium truncate text-[#e9e1dc]">
          <span>
            Gate 1 Curfew at{' '}
            <strong className="text-[#ffddb8] font-semibold animate-dorm-lamp">
              11:30 PM
            </strong>
          </span>
          <span className="text-[#8e7166] text-xs">•</span>
          <span className="text-[#6ffbbe] font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> 42 mins remaining
          </span>
          <span className="text-[#8e7166] text-xs hidden md:inline">•</span>
          <span className="hidden md:inline text-[#f4ece7]">
            {openCount} open pickups on the board
          </span>
          <span className="text-[#8e7166] text-xs hidden lg:inline">•</span>
          <span className="hidden lg:inline text-[#faf2ed]">
            Avg door handover: <strong>6.8 mins</strong>
          </span>
        </div>
      </div>

      <div className="hidden xl:flex items-center gap-2.5 shrink-0">
        <div className="flex items-center -space-x-2">
          <div className="w-6 h-6 rounded-full bg-[#006947] text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-[#33302c]">
            RM
          </div>
          <div className="w-6 h-6 rounded-full bg-[#855300] text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-[#33302c]">
            AK
          </div>
          <div className="w-6 h-6 rounded-full bg-[#a33900] text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-[#33302c]">
            DS
          </div>
        </div>
        <span className="text-xs text-[#eee7e1] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#6ffbbe] animate-pulse" />
          9 runners active in block
        </span>
      </div>
    </div>
  );
};
