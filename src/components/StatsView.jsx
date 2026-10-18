import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  MapPin, 
  Star, 
  Heart, 
  Users, 
  Sparkles,
  Award,
  BookmarkCheck
} from 'lucide-react';
import { LEAD_STATUSES, formatAge, formatLocation } from '../constants';

export default function StatsView({ leads, totalLiveCount }) {
  // Compute metrics
  const totalLeads = leads.length;
  const shortlisted = leads.filter(l => l.status === 'shortlisted').length;
  const inReview = leads.filter(l => l.status === 'family_review').length;
  const contacted = leads.filter(l => l.status === 'contacted').length;
  const proceeding = leads.filter(l => l.status === 'proceeding').length;
  const highlyRated = leads.filter(l => (l.rating || 0) >= 4).length;

  // District counts
  const districtCounts = {};
  leads.forEach(l => {
    const loc = l.address?.permanent?.district || l.address?.district || 'Unknown';
    districtCounts[loc] = (districtCounts[loc] || 0) + 1;
  });
  const topDistricts = Object.entries(districtCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Age distribution
  const ageBuckets = { '18-22': 0, '23-26': 0, '27-30': 0, '31+': 0 };
  leads.forEach(l => {
    const age = parseInt(formatAge(l.age));
    if (!isNaN(age)) {
      if (age <= 22) ageBuckets['18-22']++;
      else if (age <= 26) ageBuckets['23-26']++;
      else if (age <= 30) ageBuckets['27-30']++;
      else ageBuckets['31+']++;
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Live OrdhekDeen Brides</span>
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalLiveCount || 6421}</span>
            <span className="text-xs text-slate-400 block mt-0.5">Total registered brides</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">My Saved Leads</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <BookmarkCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">{totalLeads}</span>
            <span className="text-xs text-slate-400 block mt-0.5">
              {shortlisted} currently shortlisted
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">In Active Discussion</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-purple-600">{inReview + contacted}</span>
            <span className="text-xs text-slate-400 block mt-0.5">
              {contacted} guardian{contacted === 1 ? '' : 's'} contacted
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Top Rated (4-5 ★)</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">{highlyRated}</span>
            <span className="text-xs text-slate-400 block mt-0.5">High compatibility matches</span>
          </div>
        </div>
      </div>

      {/* Pipeline Funnel & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Stage Distribution */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-extrabold text-base text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-brand-600" />
            Matchmaking Pipeline Funnel
          </h3>

          <div className="space-y-3">
            {LEAD_STATUSES.map(s => {
              const count = leads.filter(l => l.status === s.id).length;
              const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
              return (
                <div key={s.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <span className={`h-2 w-2 rounded-full ${s.badgeColor}`}></span>
                      {s.label} ({s.bnLabel})
                    </span>
                    <span className="text-slate-500 font-mono">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${s.badgeColor} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Location & Age Breakdown */}
        <div className="space-y-6">
          {/* Top Districts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-extrabold text-base text-slate-900 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-600" />
              Lead Distribution by District
            </h3>

            {topDistricts.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No saved leads yet to analyze locations.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {topDistricts.map(([district, count]) => (
                  <div key={district} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="block text-xs font-semibold text-slate-700 truncate">{district}</span>
                    <span className="text-sm font-bold text-brand-700">{count} lead{count > 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Age Buckets */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-extrabold text-base text-slate-900 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-600" />
              Lead Age Group Breakdown
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.entries(ageBuckets).map(([bucket, count]) => (
                <div key={bucket} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="block text-xs font-semibold text-slate-500">{bucket} Yrs</span>
                  <span className="text-base font-bold text-slate-800">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
