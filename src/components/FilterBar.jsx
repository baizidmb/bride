import React from 'react';
import { 
  Search, 
  Filter, 
  X, 
  MapPin, 
  Calendar, 
  GraduationCap, 
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 mb-6 transition-all">
      {/* Top Search & Primary Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Direct Biodata # Search */}
        <div className="md:col-span-4 relative">
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Search by Biodata No. (বায়োডাটা নং)
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={filters.biodata_no || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, biodata_no: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && onApplyFilters && onApplyFilters()}
              placeholder="e.g. 24590, 34026..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-mono"
            />
            {filters.biodata_no && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, biodata_no: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Division Selector */}
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-500 mb-1">
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
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-500 mb-1">
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

        {/* Actions Button */}
        <div className="md:col-span-2 flex items-end gap-2 pt-1 md:pt-5">
          <button
            onClick={onApplyFilters}
            className="flex-1 py-2 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <Filter className="h-4 w-4" />
            <span>Search</span>
          </button>
          {activeFiltersCount > 0 && (
            <button
              onClick={onResetFilters}
              title="Reset Filters"
              className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Secondary Filter Row: Marital Status, Education, Age Range */}
      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-center">
        {/* Marital Status */}
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Marital Status (বৈবাহিক অবস্থা)
          </label>
          <div className="relative">
            <select
              value={filters.marital_status}
              onChange={(e) => setFilters(prev => ({ ...prev, marital_status: e.target.value }))}
              className="w-full appearance-none pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700"
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
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Education Medium (পড়াশোনার মাধ্যম)
          </label>
          <div className="relative">
            <select
              value={filters.education_method}
              onChange={(e) => setFilters(prev => ({ ...prev, education_method: e.target.value }))}
              className="w-full appearance-none pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-700"
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
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Age Range (বয়স সীমা):</span>
            <span className="text-brand-700 font-bold">
              {filters.min_age} - {filters.max_age} Years
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="16"
              max="45"
              value={filters.min_age}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setFilters(prev => ({ ...prev, min_age: Math.min(val, prev.max_age - 1) }));
              }}
              className="w-full accent-brand-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="range"
              min="18"
              max="50"
              value={filters.max_age}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setFilters(prev => ({ ...prev, max_age: Math.max(val, prev.min_age + 1) }));
              }}
              className="w-full accent-brand-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Result Ticker */}
      {totalResults !== undefined && (
        <div className="mt-2.5 pt-2 flex items-center justify-between text-xs text-slate-500">
          <span>
            Found <strong className="text-slate-800 font-bold">{totalResults}</strong> potential bride biodatas matching criteria
          </span>
          {activeFiltersCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
              {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
