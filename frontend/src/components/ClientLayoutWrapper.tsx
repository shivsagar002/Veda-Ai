'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Grid, 
  PieChart, 
  Book, 
  Bell,
  Menu,
  Plus,
  FileText
} from 'lucide-react';
import Image from 'next/image';
import vedaLogoMobile from '../app/assets/VedaAI_logo_mobile.svg';

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', path: '/', icon: Grid },
    { name: 'Assignments', path: '/assignments', icon: FileText },
    { name: 'Library', path: '/library', icon: PieChart },
    { name: 'AI Toolkit', path: '/toolkit', icon: Book },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden relative max-md:overflow-y-auto">
      
      {/* MOBILE TOP BRAND BAR (Figma Floating Pill Spec) */}
      <div className="flex md:hidden bg-white rounded-2xl m-4 mb-2 h-16 px-4 pl-5 items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-black/[0.04] py-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 flex justify-center items-center">
            <Image src={vedaLogoMobile} alt="VedaAI Logo" width={36} height={36} />
          </div>
          <span className="font-display text-xl font-extrabold text-brand-primary tracking-[-0.5px]">VedaAI</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative flex items-center justify-center cursor-pointer w-9 h-9 rounded-full transition-colors duration-200 active:bg-black/5 hover:bg-black/5">
            <Bell size={22} color="#181818" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-brand-accent rounded-full border-[1.5px] border-white"></span>
          </div>

          {/* Profile Photo Avatar */}
          <Link href="/settings" className="no-underline">
            <div className="w-9 h-9 rounded-full overflow-hidden border-[1.5px] border-black/[0.08] flex items-center justify-center bg-gray-200 cursor-pointer">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" 
                alt="Delhi Public School Profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </Link>

          {/* Hamburger Menu */}
          <div className="relative flex items-center justify-center cursor-pointer w-9 h-9 rounded-full transition-colors duration-200 active:bg-black/5 hover:bg-black/5">
            <Menu size={22} color="#181818" />
          </div>
        </div>
      </div>

      {/* MAIN PAGE RENDER CHANNELS */}
      {children}

      {/* PERSISTENT MOBILE FLOATING ACTION BUTTON (FAB) */}
      {pathname !== '/create' && (
        <Link href="/create" className="no-underline flex md:hidden fixed bottom-24 right-6 w-14 h-14 bg-brand-accent rounded-full shadow-[0_4px_16px_rgba(255,86,35,0.4)] justify-center items-center z-[998] cursor-pointer transition-all duration-200 active:scale-90 active:bg-[#e0481c]">
          <Plus size={28} color="#ffffff" />
        </Link>
      )}

      {/* MOBILE BOTTOM NAVIGATION TAB BAR (Figma iOS Navbar Spec) */}
      <div className="flex md:hidden fixed bottom-4 left-4 w-[calc(100%-32px)] h-16 bg-[#121212] rounded-[100px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] border-none z-[999] justify-around items-center px-2">
        {navItems.map((item) => {
          const isActive = pathname ? (pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path))) : false;
          const Icon = item.icon;

          return (
            <Link 
              key={item.name} 
              href={item.path} 
              className={`flex flex-col items-center justify-center text-white/40 text-[10px] font-medium no-underline gap-1 flex-1 transition-all duration-200 ${isActive ? 'text-white' : ''}`}
            >
              <Icon size={20} color={isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
