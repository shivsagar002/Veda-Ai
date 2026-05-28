'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Grid, Bell, ChevronDown, Sparkles } from 'lucide-react';

interface TopBarProps {
  breadcrumb: string;
  hideMobileHeader?: boolean;
}

export default function TopBar({ breadcrumb, hideMobileHeader = false }: TopBarProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      {/* DESKTOP TOP BAR */}
      <div className="hidden md:flex desktop-topbar justify-between items-center h-[72px] bg-white rounded-[20px] mt-5 mx-5 px-7 shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-black/[0.04] sticky top-5 z-[90]">
        {/* LEFT SIDE: BACK BTN & BREADCRUMB */}
        <div className="flex items-center gap-5">
          <button 
            className="w-9 h-9 rounded-full border-[1.25px] border-black/[0.08] bg-white flex justify-center items-center cursor-pointer transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-gray-50" 
            onClick={handleBack} 
            title="Go Back"
          >
            <ArrowLeft size={18} color="#181818" />
          </button>
          
          <div className="flex items-center">
            {breadcrumb === 'Assignment' ? (
              <>
                <Sparkles size={18} color="rgba(24, 24, 24, 0.4)" className="mr-2" />
                <span className="text-[15px] font-semibold text-black/40 font-sans">Create New</span>
              </>
            ) : (
              <>
                <Grid size={18} color="rgba(24, 24, 24, 0.4)" className="mr-2" />
                <span className="text-[15px] font-semibold text-black/40 font-sans">{breadcrumb}</span>
              </>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: NOTIFICATION & PROFILE */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <button className="relative flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
            <Bell size={20} color="#181818" />
            <span className="absolute top-[6px] right-[6px] w-2 h-2 bg-brand-accent rounded-full border-[1.5px] border-white"></span>
          </button>

          {/* Profile Card */}
          <div className="flex items-center py-1 pr-3 pl-1.5 bg-brand-surface rounded-full border border-black/[0.04] cursor-pointer transition-all duration-200 hover:bg-gray-200">
            <div className="w-8 h-8 rounded-full bg-brand-accent/10 flex justify-center items-center mr-2">
              <span className="text-xs font-bold text-brand-accent">JD</span>
            </div>
            <span className="text-[13px] font-bold text-brand-primary font-sans">John Doe</span>
            <ChevronDown size={14} color="rgba(24, 24, 24, 0.6)" className="ml-1.5" />
          </div>
        </div>
      </div>

      {/* MOBILE SCREEN HEADER (Figma-Matched centering with circular back button) */}
      {!hideMobileHeader && (
        <div className="flex md:hidden items-center justify-between px-5 pt-6 pb-5 bg-transparent w-full">
          <button 
            className="w-12 h-12 rounded-full bg-black/[0.05] border-none flex justify-center items-center cursor-pointer transition-all duration-200 hover:bg-black/[0.08] active:scale-95 shrink-0" 
            onClick={handleBack}
            title="Go Back"
          >
            <ArrowLeft size={20} color="#181818" />
          </button>
          
          <span className="font-sans text-[17px] font-bold text-[#181818] tracking-tight text-center">
            {breadcrumb}
          </span>
          
          {/* Spacer to mathematically center the text */}
          <div className="w-12 h-12 shrink-0" />
        </div>
      )}
    </>
  );
}
