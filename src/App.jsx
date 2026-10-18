import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import FilterBar from './components/FilterBar';
import BiodataCard from './components/BiodataCard';
import FullViewer from './components/FullViewer';
import KanbanView from './components/KanbanView';
import TableView from './components/TableView';
import ExportModal from './components/ExportModal';
import { 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  Sparkles, 
  Filter,
  X,
  BookOpen,
  LayoutGrid,
  Kanban,
  Table as TableIcon
} from 'lucide-react';

import { fetchLocations, fetchLeads, saveLead, deleteLead, searchBiodatas } from './api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('viewer'); // 'viewer' | 'saved' | 'explore'
  const [savedSubView, setSavedSubView] = useState('table'); // 'table' | 'kanban'
  const [leads, setLeads] = useState([]);
  const [locations, setLocations] = useState([]);
  
  // Live Explore States
  const [liveBiodatas, setLiveBiodatas] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    biodata_no: '',
    division: 'all',
    district: 'all',
    marital_status: 'all',
    education_method: 'all',
    min_age: 18,
    max_age: 40,
  });

  // Modal / Selection States
  const [activeBiodataNo, setActiveBiodataNo] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // 1. Load Locations on mount
  useEffect(() => {
    async function load() {
      const divs = await fetchLocations();
      setLocations(divs);
    }
    load();
  }, []);

  // 2. Load Saved Leads
  const loadLeads = useCallback(async () => {
    const list = await fetchLeads();
    setLeads(list);
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // 3. Search & Fetch Live Biodatas from OrdhekDeen (with static offline fallback)
  const fetchLiveBiodatas = useCallback(async (page = 1, currentFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const res = await searchBiodatas(page, 12, currentFilters);
      const fetchedData = res.data || [];
      setLiveBiodatas(fetchedData);
      if (res.pagination) {
        setPagination(res.pagination);
      }
      if (fetchedData.length > 0 && !activeBiodataNo) {
        setActiveBiodataNo(fetchedData[0].biodata_no);
      }
    } catch (err) {
      setError(err.message || 'Error loading candidate biodatas');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filters, activeBiodataNo]);

  useEffect(() => {
    fetchLiveBiodatas(1, filters);
  }, []);

  const handleApplyFilters = () => {
    fetchLiveBiodatas(1, filters);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      biodata_no: '',
      division: 'all',
      district: 'all',
      marital_status: 'all',
      education_method: 'all',
      min_age: 18,
      max_age: 40,
    };
    setFilters(defaultFilters);
    fetchLiveBiodatas(1, defaultFilters);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      loadLeads(),
      fetchLiveBiodatas(pagination.currentPage || 1, filters)
    ]);
    setIsRefreshing(false);
  };

  // 4. Save/Update a Lead in CRM
  const handleSaveLead = async (leadData) => {
    try {
      const updated = await saveLead(leadData);
      setLeads(prev => {
        const idx = prev.findIndex(l => String(l.biodata_no) === String(leadData.biodata_no));
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updated;
          return next;
        } else {
          return [updated, ...prev];
        }
      });
    } catch (e) {
      console.error('Failed to save lead:', e);
    }
  };

  // 5. Update Status only (used by Kanban)
  const handleUpdateLeadStatus = async (biodataNo, newStatus) => {
    const existing = leads.find(l => String(l.biodata_no) === String(biodataNo));
    if (existing) {
      await handleSaveLead({ ...existing, status: newStatus });
    }
  };

  // 6. Delete a Lead
  const handleDeleteLead = async (biodataNo) => {
    if (!window.confirm(`Are you sure you want to remove Lead #${biodataNo} from saved list?`)) {
      return;
    }
    await deleteLead(biodataNo);
    setLeads(prev => prev.filter(l => String(l.biodata_no) !== String(biodataNo)));
  };

  // 7. Import Leads
  const handleImportLeads = async (importedList) => {
    try {
      await fetch('/api/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: importedList }),
      });
    } catch (_) {}

    for (const lead of importedList) {
      await saveLead(lead);
    }
    await loadLeads();
  };

  const handleOpenViewerWithId = (id) => {
    setActiveBiodataNo(id);
    setCurrentTab('viewer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const leadsMap = new Map(leads.map(l => [String(l.biodata_no), l]));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Clean Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        leads={leads}
        totalLiveCount={pagination.total}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onOpenExport={() => setShowExportModal(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 w-full flex-1">
        
        {/* ============================================================== */}
        {/* TAB 1: DEDICATED FULL VIEWER (DEFAULT CLEAN EXPERIENCE) */}
        {/* ============================================================== */}
        {currentTab === 'viewer' && (
          <div className="space-y-4">
            {/* Filter Toggle Bar */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
              >
                <Filter className="h-3.5 w-3.5 text-brand-600" />
                <span>{showFilters ? 'ফিল্টার লুকান' : '🔍 ফিল্টার অপশন (বয়স, জেলা, বৈবাহিক অবস্থা)'}</span>
              </button>

              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                মোট {pagination.total || 6415} পাত্রীর মধ্য থেকে ভিউ করা হচ্ছে
              </span>
            </div>

            {/* Collapsible Filter Bar */}
            {showFilters && (
              <div className="animate-in fade-in duration-200">
                <FilterBar
                  filters={filters}
                  setFilters={setFilters}
                  locations={locations}
                  onApplyFilters={() => {
                    handleApplyFilters();
                    setShowFilters(false);
                  }}
                  onResetFilters={handleResetFilters}
                  totalResults={pagination.total}
                />
              </div>
            )}

            {/* The Full Authentic Viewer */}
            <FullViewer
              biodatas={liveBiodatas}
              leads={leads}
              onSaveLead={handleSaveLead}
              pagination={pagination}
              onPageChange={(p) => fetchLiveBiodatas(p, filters)}
              filters={filters}
              setFilters={setFilters}
              onApplyFilters={handleApplyFilters}
              locations={locations}
              selectedId={activeBiodataNo}
              setSelectedId={setActiveBiodataNo}
            />
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: SAVED LEADS & CONTACT CRM */}
        {/* ============================================================== */}
        {currentTab === 'saved' && (
          <div className="space-y-4">
            {/* Sub-view toggle (Table vs Kanban) */}
            <div className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-2xl shadow-xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSavedSubView('table')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    savedSubView === 'table'
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <TableIcon className="h-3.5 w-3.5" />
                  <span>ডিরেক্টরি ও যোগাযোগ তালিকা ({leads.length})</span>
                </button>

                <button
                  onClick={() => setSavedSubView('kanban')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    savedSubView === 'kanban'
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Kanban className="h-3.5 w-3.5" />
                  <span>পাইপলাইন বোর্ড (CRM)</span>
                </button>
              </div>

              <button
                onClick={() => setCurrentTab('viewer')}
                className="hidden sm:inline-flex items-center gap-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>নতুন পাত্রী ভিউ করুন</span>
              </button>
            </div>

            {savedSubView === 'table' ? (
              <TableView
                leads={leads}
                onSaveLead={handleSaveLead}
                onDeleteLead={handleDeleteLead}
                onViewDetails={(id) => handleOpenViewerWithId(id)}
                onOpenExport={() => setShowExportModal(true)}
              />
            ) : (
              <KanbanView
                leads={leads}
                onUpdateLeadStatus={handleUpdateLeadStatus}
                onViewDetails={(id) => handleOpenViewerWithId(id)}
                onOpenExplore={() => setCurrentTab('viewer')}
              />
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: EXPLORE CARDS GRID */}
        {/* ============================================================== */}
        {currentTab === 'explore' && (
          <div className="space-y-4">
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              locations={locations}
              onApplyFilters={handleApplyFilters}
              onResetFilters={handleResetFilters}
              totalResults={pagination.total}
            />

            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>সকল পাত্রীর তালিকা (Grid View)</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800">
                    {pagination.total} জন
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  পেজ {pagination.currentPage} / {pagination.total_pages}
                </p>
              </div>

              <button
                onClick={() => setCurrentTab('viewer')}
                className="py-1.5 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>ফুল ভিউয়ার মোড</span>
              </button>
            </div>

            {loading ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <div className="h-10 w-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-bold text-slate-700">বায়োডাটা লোড হচ্ছে...</p>
              </div>
            ) : error ? (
              <div className="py-12 bg-white rounded-2xl border border-rose-200 p-8 text-center max-w-lg mx-auto">
                <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">বায়োডাটা প্রদর্শনে সমস্যা হয়েছে</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">{error}</p>
                <button
                  onClick={() => fetchLiveBiodatas(pagination.currentPage || 1, filters)}
                  className="py-2 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold"
                >
                  আবার চেষ্টা করুন
                </button>
              </div>
            ) : liveBiodatas.length === 0 ? (
              <div className="py-16 bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg mx-auto">
                <Sparkles className="h-10 w-10 text-brand-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">কোনো বায়োডাটা পাওয়া যায়নি</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
                <button
                  onClick={handleResetFilters}
                  className="py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  ফিল্টার রিসেট
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {liveBiodatas.map((b) => (
                    <BiodataCard
                      key={b.biodata_no}
                      biodata={b}
                      leadData={leadsMap.get(String(b.biodata_no))}
                      onSaveLead={handleSaveLead}
                      onViewDetails={(id) => handleOpenViewerWithId(id)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.total_pages > 1 && (
                  <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-xs font-medium text-slate-500">
                      পেজ <strong className="text-slate-800">{pagination.currentPage}</strong> /{' '}
                      <strong className="text-slate-800">{pagination.total_pages}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        disabled={pagination.currentPage <= 1}
                        onClick={() => fetchLiveBiodatas(pagination.currentPage - 1, filters)}
                        className={`py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs transition-all ${
                          pagination.currentPage <= 1
                            ? 'opacity-40 cursor-not-allowed text-slate-400'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>আগের পেজ</span>
                      </button>

                      <button
                        disabled={pagination.currentPage >= pagination.total_pages}
                        onClick={() => fetchLiveBiodatas(pagination.currentPage + 1, filters)}
                        className={`py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs transition-all ${
                          pagination.currentPage >= pagination.total_pages
                            ? 'opacity-40 cursor-not-allowed text-slate-400'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span>পরের পেজ</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Clean Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-600">
            অর্ধেকদ্বীন পাত্রী ডিরেক্টরি ও ম্যাচমেকিং পোর্টাল
          </p>
        </div>
      </footer>

      {/* Export & Backup Modal */}
      {showExportModal && (
        <ExportModal
          leads={leads}
          onImportLeads={handleImportLeads}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
