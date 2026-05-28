'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Grid, 
  Users, 
  FileText, 
  Book, 
  PieChart, 
  Settings, 
  Sparkles 
} from 'lucide-react';
import vedaLogo from '../app/assets/VedaAI_logo.svg';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Home', path: '/', icon: Grid },
    { name: 'My Groups', path: '/groups', icon: Users },
    { name: 'Assignments', path: '/assignments', icon: FileText },
    { name: 'AI Teacher’s Toolkit', path: '/toolkit', icon: Book },
    { name: 'My Library', path: '/library', icon: PieChart, badge: 32 },
  ];

  return (
    <div className="hidden md:flex desktop-sidebar w-[280px] h-[calc(100vh-32px)] bg-white py-8 px-5 flex-col rounded-[24px] my-4 ml-4 mr-0 shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-black/[0.04] z-10">
      {/* VedaAI Brand Logo */}
      <div className="flex items-center mb-10 pl-2">
        <div className="w-9 h-9 flex justify-center items-center mr-3">
          <Image src={vedaLogo} alt="VedaAI Logo" width={36} height={36} />
        </div>
        <span className="font-display text-2xl font-extrabold tracking-[-0.5px] text-brand-primary">VedaAI</span>
      </div>

      {/* Quick Action Create Button */}
      <Link href="/create" className="no-underline">
        <button className="w-full h-12 bg-brand-primary border-none rounded-full flex justify-center items-center text-white font-sans text-[15px] font-bold cursor-pointer relative overflow-hidden mb-8 shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:bg-brand-primary/95 hover:scale-[0.98] active:scale-[0.96]">
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 opacity-80 transition-opacity duration-200 hover:opacity-100"></div>
          <Sparkles size={16} color="#ffffff" className="mr-2 relative z-10" />
          <span className="relative z-10">Create Assignment</span>
        </button>
      </Link>

      {/* Nav Menu Items */}
      <div className="flex flex-col gap-1 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname ? (pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path))) : false;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.path} className="no-underline">
              <div 
                className={`flex items-center py-3 px-4 rounded-xl cursor-pointer text-[15px] font-sans transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] relative hover:bg-gray-100/50 active:scale-[0.98] ${
                  isActive ? 'bg-gray-100 text-brand-primary' : 'text-brand-primary/70'
                }`}
              >
                <Icon 
                  size={20} 
                  className={`mr-3 transition-colors duration-200 ${
                    isActive ? 'text-brand-primary' : 'text-brand-primary/40'
                  }`} 
                />
                <span className={isActive ? 'font-semibold' : 'font-normal'}>{item.name}</span>
                
                {item.badge && (
                  <div className="bg-brand-accent text-white text-[11px] font-bold py-0.5 px-2 rounded-lg ml-auto shadow-[0_2px_6px_rgba(255,86,35,0.3)]">
                    {item.badge}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer Profile Block */}
      <div className="flex flex-col gap-4 mt-auto">
        <Link href="/settings" className="no-underline w-full">
          <div 
            className={`flex items-center py-3 px-4 rounded-xl cursor-pointer text-[15px] font-sans transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] relative hover:bg-gray-100/50 active:scale-[0.98] ${
              pathname === '/settings' ? 'bg-gray-100 text-brand-primary' : 'text-brand-primary/70'
            }`}
          >
            <Settings 
              size={20} 
              className={`mr-3 transition-colors duration-200 ${
                pathname === '/settings' ? 'text-brand-primary' : 'text-brand-primary/40'
              }`} 
            />
            <span className={pathname === '/settings' ? 'font-semibold' : 'font-normal'}>Settings</span>
          </div>
        </Link>

        {/* Profile Card */}
        <div className="flex items-center p-3 bg-brand-surface rounded-2xl border border-black/[0.04]">
          <div className="w-10 h-10 rounded-full bg-brand-accent/10 flex justify-center items-center mr-3 border-[1.5px] border-brand-accent/20">
            <span className="text-[16px] font-bold text-brand-accent">DP</span>
          </div>
          <div className="flex flex-col">
            <div className="text-brand-primary text-[13px] font-bold leading-[1.2]">Delhi Public School</div>
            <div className="text-brand-primary/50 text-[11px] mt-0.5">Bokaro Steel City</div>
          </div>
        </div>
      </div>
    </div>
  );
}
