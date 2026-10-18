import React from 'react';
import { 
  Search, 
  Filter, 
  X, 
  RotateCcw,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { MARITAL_STATUS_OPTIONS, EDUCATION_METHOD_OPTIONS } from '../constants';

export default function FilterBar({ 
  filters, 
  setFilters, 
  locations, 
  onApplyFilters, 
  onResetFilters,
  totalResults
}) {
  const selectedDivision = locations.find(d => d.name === filters.division);
  const districtList = selectedDivision ? selectedDivision.districts : [];

  const handleDivisionChange = (divName) => {
    setFilters(prev => ({
      ...prev,
      division: divName,
      district: 'all', // Reset district when division changes
    }));
  };

  const activeFiltersCount = [
    filters.biodata_no ? 1 : 0,
    filters.division !== 'all' ? 1 : 0,
    filters.district !== 'all' ? 1 : 0,
    filters.marital_status !== 'all' ? 1 : 0,
    filters.education_method !== 'all' ? 1 : 0,
    filters.min_age !== 16 || filters.max_age !== 50 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (onApplyFilters) onApplyFilters();
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border-2 border-brand-200/80 shadow-md p-4 sm:p-5 mb-6 transition-all"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-50 text-brand-700">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <span className="font-bold text-sm text-slate-800">
            ফিল্টার অপশন (Filter Candidates)
          </span>
          {activeFiltersCount > 0 ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-100 text-brand-800">
              {activeFiltersCount}টি সক্রিয়
            </span>
          ) : (
            <span className="text-xs text-slate-400 font-normal hidden sm:inline">
              পছন্দমতো ফিল্টার নির্বাচন করুন
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>ফিল্টার ক্লিয়ার করুন</span>
          </button>
        )}
      </div>

      {/* Row 1: Search, Division, District */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-center">
        {/* Direct Biodata # Search */}
        <div className="md:col-span-4 relative">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Search by Biodata No. (বায়োডাটা নং)
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={filters.biodata_no || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, biodata_no: e.target.value }))}
              placeholder="e.g. 24590, 34026..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-mono"
            />
            {filters.biodata_no && (
              <button
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, biodata_no: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Division Selector */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Division (বিভাগ)
          </label>
          <div className="relative">
            <select
              value={filters.division}
              onChange={(e) => handleDivisionChange(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700"
            >
              <option value="all">All Divisions (সমগ্র বাংলাদেশ)</option>
              {locations.map(d => (
                <option key={d.name} value={d.name}>
                  {d.bn} ({d.name})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* District Selector */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            District (জেলা)
          </label>
          <div className="relative">
            <select
              value={filters.district}
              disabled={filters.division === 'all'}
              onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value }))}
              className={`w-full appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700 ${
                filters.division === 'all' ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <option value="all">
                {filters.division === 'all' ? 'Select Division First' : 'All Districts in ' + filters.division}
              </option>
              {districtList.map(dist => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Row 2: Marital Status, Education, Age Range */}
      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-center">
        {/* Marital Status */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Marital Status (বৈবাহিক অবস্থা)
          </label>
          <div className="relative">
            <select
              value={filters.marital_status}
              onChange={(e) => setFilters(prev => ({ ...prev, marital_status: e.target.value }))}
              className="w-full appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700"
            >
              {MARITAL_STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.bn} ({opt.label})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Education Method */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Education Medium (পড়াশোনার মাধ্যম)
          </label>
          <div className="relative">
            <select
              value={filters.education_method}
              onChange={(e) => setFilters(prev => ({ ...prev, education_method: e.target.value }))}
              className="w-full appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700"
            >
              {EDUCATION_METHOD_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.bn} ({opt.label})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Age Range */}
        <div className="md:col-span-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
            <span>Age Range (বয়স সীমা):</span>
            <span className="text-brand-700 font-bold bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200 font-mono">
              {filters.min_age} - {filters.max_age} Years
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="range"
              min="16"
              max="45"
              value={filters.min_age}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setFilters(prev => ({ ...prev, min_age: Math.min(val, prev.max_age - 1) }));
              }}
              className="w-full accent-brand-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <span className="text-xs text-slate-400 font-medium">to</span>
            <input
              type="range"
              min="18"
              max="50"
              value={filters.max_age}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setFilters(prev => ({ ...prev, max_age: Math.max(val, prev.min_age + 1) }));
              }}
              className="w-full accent-brand-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* DEDICATED SUBMIT BUTTON AFTER FILTERED */}
      <div className="mt-4 pt-4 border-t-2 border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Result Counter & Active Count */}
        <div className="flex items-center gap-2 text-xs text-slate-600 w-full sm:w-auto justify-between sm:justify-start">
          {totalResults !== undefined && (
            <span>
              মোট প্রাপ্ত বায়োডাটা: <strong className="text-slate-900 font-black text-sm">{totalResults}</strong> জন
            </span>
          )}
          {activeFiltersCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ফিল্টার সক্রিয়
            </span>
          )}
        </div>

        {/* Buttons: Reset + Primary Submit Filtration */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>ফিল্টার রিসেট</span>
            </button>
          )}

          <button
            type="submit"
            className="flex-1 sm:flex-initial py-2.5 px-6 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 active:scale-[0.98] text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-md hover:shadow-brand-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>ফিল্টার প্রয়োগ করুন (Submit Filter)</span>
          </button>
        </div>
      </div>
    </form>
  );
}
