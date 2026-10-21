import React, { useState } from 'react';
import { 
  Heart, 
  Search, 
  BookOpen, 
  BookmarkCheck, 
  LayoutGrid, 
  RefreshCw, 
  Download, 
  ExternalLink,
  Menu,
  X,
  Globe
} from 'lucide-react';
import zynsiteHorizontal from '../assets/zynsite-horizontal.png';
import zynsiteIcon from '../assets/zynsite-icon.png';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  leads = [], 
  totalLiveCount, 
  onRefresh, 
  isRefreshing, 
  onOpenExport,
  searchId,
  setSearchId,
  onSearchSubmit
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const shortlistedCount = leads.length;

  const handleNavClick = (tab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/90 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <a 
              href="https://zynsite.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center transition-transform hover:scale-102"
              title="ZYNSITE.COM"
            >
              <img 
                src={zynsiteHorizontal} 
                alt="ZYNSITE.COM" 
                className="h-8 sm:h-9 w-auto object-contain drop-shadow-xs" 
              />
            </a>
            <div className="hidden sm:block pl-2.5 border-l border-slate-200">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                  OrdhekDeen <span className="text-brand-600 font-black">Bride Leads</span>
                </span>
                <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  পাত্রী ট্র্যাকার
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden xl:block -mt-0.5">
                সম্ভাব্য পাত্রী অনুসন্ধান, মূল্যায়ন ও সরাসরি যোগাযোগের পোর্টাল
              </p>
            </div>
          </div>

          {/* Desktop Nav Tabs (Clean, Decluttered) */}
          <nav className="hidden md:flex items-center gap-1.5">
            {/* 1. Full Viewer */}
            <button
              onClick={() => handleNavClick('viewer')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'viewer'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>বায়োডাটা ভিউয়ার</span>
            </button>

            {/* 2. Saved Leads CRM */}
            <button
              onClick={() => handleNavClick('saved')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'saved' || currentTab === 'kanban' || currentTab === 'table'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookmarkCheck className="h-4 w-4" />
              <span>সংরক্ষিত পাত্রী</span>
              {shortlistedCount > 0 && (
                <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  currentTab === 'saved' || currentTab === 'kanban' || currentTab === 'table'
                    ? 'bg-white text-brand-700'
                    : 'bg-brand-600 text-white'
                }`}>
                  {shortlistedCount}
                </span>
              )}
            </button>

            {/* 3. Browse Grid */}
            <button
              onClick={() => handleNavClick('explore')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'explore'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>অল ক্যান্ডিডেটস</span>
            </button>
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2">
            {/* Sync Refresh */}
            <button
              onClick={onRefresh}
              title="অর্ধেকদ্বীন থেকে নতুন বায়োডাটা রিফ্রেশ করুন"
              disabled={isRefreshing}
              className="p-2 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
            </button>

            {/* Export CSV / JSON */}
            <button
              onClick={onOpenExport}
              title="লিড ডাটা এক্সপোর্ট করুন"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">এক্সপোর্ট</span>
            </button>

            {/* Official ZYNSITE link */}
            <a
              href="https://zynsite.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200/60 transition-colors shadow-2xs"
              title="Visit ZYNSITE.COM"
            >
              <img src={zynsiteIcon} alt="Zynsite" className="h-3.5 w-3.5 object-contain" />
              <span>zynsite.com</span>
            </a>

            {/* Official OrdhekDeen link */}
            <a
              href="https://ordhekdeen.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-brand-700 hover:bg-slate-50 transition-colors border border-slate-200"
            >
              <span>OrdhekDeen</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 space-y-2 animate-in slide-in-from-top duration-150">
            <div className="px-2.5 pb-2 border-b border-slate-100 flex items-center justify-between">
              <img src={zynsiteHorizontal} alt="ZYNSITE" className="h-6 w-auto object-contain" />
              <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                Bride Leads Tracker
              </span>
            </div>
            <button
              onClick={() => handleNavClick('viewer')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold ${
                currentTab === 'viewer' ? 'bg-brand-50 text-brand-700 font-extrabold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-brand-600" />
                বায়োডাটা ভিউয়ার
              </span>
              <span className="text-[10px] text-slate-400">ক্লিন মোড</span>
            </button>

            <button
              onClick={() => handleNavClick('saved')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold ${
                currentTab === 'saved' || currentTab === 'table' || currentTab === 'kanban' ? 'bg-brand-50 text-brand-700 font-extrabold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <BookmarkCheck className="h-4 w-4 text-brand-600" />
                সংরক্ষিত পাত্রী (শর্টলিস্ট)
              </span>
              {shortlistedCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-600 text-white">
                  {shortlistedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('explore')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold ${
                currentTab === 'explore' ? 'bg-brand-50 text-brand-700 font-extrabold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-brand-600" />
                অল ক্যান্ডিডেটস গ্রিড
              </span>
              <span className="text-[10px] text-slate-400">{totalLiveCount || 6415} পাত্রী</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
