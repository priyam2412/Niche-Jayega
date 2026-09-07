import React from 'react';
import {
  Bike,
  PlusCircle,
  Headphones,
  ChevronDown,
  User,
} from 'lucide-react';
import { ScreenType } from '../types';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onOpenPostModal: () => void;
  onOpenClusterModal: () => void;
  earnedAmount: number;
  clusterName: string;
  clusterCode: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  onOpenPostModal,
  onOpenClusterModal,
  earnedAmount,
  clusterName,
  clusterCode,
}) => {
  return (
    <header className="fixed top-0 inset-x-0 w-full z-50 bg-[#fff8f4]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(30,27,24,0.04)] border-b border-[#e9e1dc]/50">
      <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Logo and Campus Hub */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div
            id="brand-logo-btn"
            onClick={() => onNavigate('hub')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-[#a33900] flex items-center justify-center text-white shadow-sm group-hover:bg-[#cc4900] group-hover:scale-105 transition-all">
              <Bike className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-['Outfit'] font-bold text-xl sm:text-2xl tracking-tight text-[#a33900] leading-none">
                Niche Jayega
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#5a4138]">
                {currentScreen === 'profile' ? 'Campus Late-Night Mesh' : 'Campus Night Drop'}
              </span>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-[#e9e1dc] hidden xl:block" />

          {/* Living Cluster Pill */}
          <button
            id="hostel-cluster-dropdown"
            onClick={onOpenClusterModal}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#faf2ed] hover:bg-[#eee7e1] border border-[#e2bfb2]/30 transition-colors text-left relative overflow-hidden group cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#006947] relative z-10" />
            <span className="absolute left-2.5 w-3 h-3 rounded-full bg-[#006947]/40 animate-radar-ring" />
            <div className="flex flex-col relative z-10">
              <span className="text-xs text-[#1e1b18] font-semibold leading-tight flex items-center gap-1">
                {clusterName}
              </span>
              <span className="text-[10px] text-[#855300] font-bold">#{clusterCode}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#5a4138] ml-1 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Center Primary Screen Navigation Tabs */}
        <nav
          id="main-screen-nav"
          className="flex items-center gap-1 p-1 rounded-full bg-[#faf2ed] border border-[#e2bfb2]/30"
        >
          <button
            id="nav-tab-hub"
            onClick={() => onNavigate('hub')}
            className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentScreen === 'hub'
                ? 'bg-[#e9e1dc] text-[#1e1b18] shadow-sm'
                : 'text-[#5a4138] hover:text-[#1e1b18] hover:bg-[#eee7e1]'
            }`}
          >
            Live Feed
          </button>
          <button
            id="nav-tab-profile"
            onClick={() => onNavigate('profile')}
            className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentScreen === 'profile'
                ? 'bg-[#a33900] text-white shadow-sm'
                : 'text-[#5a4138] hover:text-[#1e1b18] hover:bg-[#eee7e1]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Hosteler Profile</span>
          </button>
        </nav>

        {/* Right Tools, Bounty Escrow, Post Button & Profile Trigger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Exam Mode badge */}
          <div className="hidden 2xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#a33900]/10 border border-[#a33900]/20 text-[#a33900] text-xs font-semibold">
            <Headphones className="w-3.5 h-3.5 animate-pulse" />
            <span>Exam Night Mode</span>
          </div>

          {/* Curfew timer badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ffddb8]/40 text-[#2a1700] animate-curfew-pulse border border-[#fea619]/40">
            <span className="w-2 h-2 rounded-full bg-[#fea619] animate-pulse" />
            <span className="text-xs font-medium">
              <strong className="font-semibold">Gate 1:</strong> Closes in 42m
            </span>
          </div>

          {/* Post Pickup Button */}
          <button
            id="header-post-pickup-btn"
            onClick={onOpenPostModal}
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#a33900] text-white font-['Outfit'] text-sm font-semibold hover:bg-[#cc4900] transition-all shadow-sm active:scale-95 group cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            <span>Post Pickup</span>
          </button>

          {/* Escrow Balance Pill */}
          <div
            id="escrow-balance-header"
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#eee7e1] hover:bg-[#e9e1dc] border border-[#e2bfb2]/30 transition-colors cursor-pointer"
            title="View Escrow Vault"
          >
            <span className="font-['Outfit'] text-xs sm:text-sm text-[#855300] font-bold animate-coin-spin">
              ₹
            </span>
            <span className="font-['Outfit'] text-xs sm:text-sm text-[#855300] font-bold">
              {earnedAmount}
            </span>
            <span className="text-[10px] font-bold uppercase text-[#5a4138] hidden sm:inline">
              Earned
            </span>
          </div>

          {/* User Profile Avatar / Switcher */}
          <button
            id="header-profile-avatar-btn"
            onClick={() => onNavigate(currentScreen === 'profile' ? 'hub' : 'profile')}
            className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shadow-sm transition-transform hover:scale-105 ${
              currentScreen === 'profile'
                ? 'ring-2 ring-[#a33900] bg-[#a33900] text-white'
                : 'bg-[#a33900] text-white ring-2 ring-[#ffdbce]'
            }`}
            title="Switch to Hosteler Profile"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
