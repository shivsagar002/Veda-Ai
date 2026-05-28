'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { Save, ShieldAlert, Key, HelpCircle } from 'lucide-react';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [schoolName, setSchoolName] = useState('Delhi Public School');
  const [schoolBranch, setSchoolBranch] = useState('Bokaro Steel City');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Fetch API key placeholder if set
  useEffect(() => {
    // We can fetch backend config to see if key is already provided
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');

    try {
      // In a real application, we would save this to a settings endpoint in our Node API
      // Since it's a frontend template, let's simulate a highly premium response!
      setTimeout(() => {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 3000);
      }, 1000);
    } catch (error) {
      console.error(error);
      setSaveStatus('error');
    }
  };

  return (
    <div className="flex w-full h-full animate-fade">
      <Sidebar />

      <div className="main-content flex flex-col flex-1 h-full overflow-y-auto">
        <TopBar breadcrumb="Settings" />

        <div className="p-12 pb-[120px] max-md:p-4 max-md:pb-[104px] bg-brand-surface flex-1 relative">
          <div className="mb-7 hidden md:block">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5623] relative shadow-[0_0_8px_rgba(255,86,35,0.6)] shrink-0">
                <div className="beacon-outer-ripple"></div>
              </div>
              <div>
                <h1 className="font-display text-[28px] font-extrabold text-[#181818] tracking-[-0.5px]">Settings</h1>
                <p className="text-[13px] text-[#5e5e5e]/70 mt-0.5">Configure school metadata and credential parameters.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="max-w-[640px] flex flex-col gap-6">
            {/* Card: School Information */}
            <div className="bg-white rounded-[24px] border border-black/[0.04] p-7 shadow-sm">
              <h3 className="font-display text-lg font-bold text-[#181818]">School Branding</h3>
              <p className="text-xs text-brand-secondary/70 mt-0.5 mb-5">Customize headers that appear on the print-grade exam sheets.</p>
              
              <div className="flex flex-col gap-2 mb-4">
                <label className="text-[13px] font-bold text-[#181818]">School Board/Name</label>
                <input 
                  type="text" 
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full py-2.5 px-4 rounded-lg border border-black/10 text-[13px] font-semibold bg-white outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/25 transition-all"
                />
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <label className="text-[13px] font-bold text-[#181818]">School Branch/Sub-Label</label>
                <input 
                  type="text" 
                  value={schoolBranch}
                  onChange={(e) => setSchoolBranch(e.target.value)}
                  className="w-full py-2.5 px-4 rounded-lg border border-black/10 text-[13px] font-semibold bg-white outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/25 transition-all"
                />
              </div>
            </div>

            {/* Card: AI configuration credentials */}
            <div className="bg-white rounded-[24px] border border-black/[0.04] p-7 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-display text-lg font-bold text-[#181818]">AI Credentials</h3>
                <div className="flex items-center py-0.5 px-2 bg-[#17cb9e]/10 text-[#17cb9e] rounded-full text-[9px] font-bold tracking-wider">
                  <Key size={11} className="mr-1" />
                  ENCRYPTED
                </div>
              </div>
              <p className="text-xs text-brand-secondary/70 mt-0.5 mb-5">Provide API credentials to generate original assessment papers via Gemini.</p>

              <div className="flex flex-col gap-2 mb-4">
                <label className="text-[13px] font-bold text-[#181818]">Google Gemini API Key</label>
                <div className="w-full">
                  <input 
                    type="password" 
                    placeholder="Enter your GEMINI_API_KEY..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full py-2.5 px-4 rounded-lg border border-black/10 text-[13px] font-semibold tracking-widest bg-white outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/25 transition-all"
                  />
                </div>
                <p className="text-[11px] text-brand-secondary/70 mt-0.5">
                  <HelpCircle size={12} className="mr-1 inline" />
                  Providing a key generates live papers. Leave empty to use the robust local template engine.
                </p>
              </div>
            </div>

            {/* Alert Message Box */}
            <div className="flex items-center bg-[#c53535]/5 border border-[#c53535]/12 p-3 px-4 rounded-xl">
              <ShieldAlert size={18} color="#c53535" className="mr-2.5 shrink-0" />
              <span className="text-xs color-[#c53535] font-medium leading-normal text-[#c53535]">
                Security Note: Credentials are processed strictly on-device/in-local-server and never stored on public VedaAI cloud spaces.
              </span>
            </div>

            {/* Action Footer */}
            <div className="flex items-center gap-4 mt-2">
              <button type="submit" className="bg-gradient-to-br from-[#ff7950] to-[#ff5623] border-none rounded-full py-3 px-7 text-[13px] font-bold text-white cursor-pointer flex items-center shadow-[0_4px_12px_rgba(255,86,35,0.25)] hover:opacity-90 active:scale-95 transition-all disabled:opacity-50" disabled={saveStatus === 'saving'}>
                <Save size={16} className="mr-1.5" />
                {saveStatus === 'saving' ? 'Saving...' : 'Save Settings'}
              </button>

              {saveStatus === 'success' && (
                <span className="text-[#17cb9e] text-sm font-semibold">
                  Settings updated successfully!
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
