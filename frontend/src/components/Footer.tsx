import React from 'react';
import { Bike, Radio } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white/90 backdrop-blur-md mt-12 border-t border-[#e9e1dc]/60 shadow-[0_-1px_12px_rgba(30,27,24,0.03)] relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#e2bfb2]/30">
          {/* Col 1 */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#a33900] flex items-center justify-center text-white">
                <Bike className="w-4 h-4" />
              </div>
              <span className="font-['Outfit'] font-bold text-xl text-[#a33900]">
                Niche Jayega
              </span>
            </div>
            <p className="text-xs text-[#5a4138] leading-relaxed">
              The hyper-local late night student peer delivery network. Helping campus hostels get food, parcels, and printouts from the gate before curfew.
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-[#006947] animate-ping" />
              <span className="text-xs text-[#5a4138] font-medium">
                Campus Mesh Active • 2.4k Students Live
              </span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col gap-2">
            <h4 className="font-['Outfit'] text-sm text-[#1e1b18] font-bold">
              Campus Zones
            </h4>
            <ul className="flex flex-col gap-1.5 text-xs text-[#5a4138]">
              <li className="hover:text-[#a33900] transition-colors cursor-pointer">
                North Campus Hostels (A-D)
              </li>
              <li className="hover:text-[#a33900] transition-colors cursor-pointer">
                South Block PGs & Mess
              </li>
              <li className="hover:text-[#a33900] transition-colors cursor-pointer">
                Main Gate Late Night Point
              </li>
              <li className="hover:text-[#a33900] transition-colors cursor-pointer">
                Library & Mech Canteen
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col gap-2">
            <h4 className="font-['Outfit'] text-sm text-[#1e1b18] font-bold">
              Corridor Rules
            </h4>
            <ul className="flex flex-col gap-1.5 text-xs text-[#5a4138]">
              <li className="hover:text-[#a33900] transition-colors cursor-pointer">
                Safe Escrow & UPI Tips
              </li>
              <li className="hover:text-[#a33900] transition-colors cursor-pointer">
                Hostel Gate Timing Index
              </li>
              <li className="hover:text-[#a33900] transition-colors cursor-pointer">
                Corridor Honor Code
              </li>
              <li className="hover:text-[#a33900] transition-colors cursor-pointer">
                Lost Parcels Protocol
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="flex flex-col gap-2">
            <h4 className="font-['Outfit'] text-sm text-[#1e1b18] font-bold">
              Night Dispatch Desk
            </h4>
            <p className="text-xs text-[#5a4138] leading-relaxed">
              Locked out or parcel delayed by campus guard? Ping the corridor emergency squad on campus radio.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-1 rounded-full bg-[#6ffbbe] text-[#002113] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" />
                DISPATCH ONLINE
              </span>
              <span className="text-xs text-[#5a4138] font-semibold">Ext: #4092</span>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5a4138]">
          <p>© 2025 Niche Jayega Technologies. Built by students, for late-night campus survival.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#1e1b18] transition-colors cursor-pointer">Terms</span>
            <span className="hover:text-[#1e1b18] transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-[#1e1b18] transition-colors cursor-pointer">Security Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
