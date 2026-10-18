import React, { useState, useEffect, useRef } from 'react';
import { 
  Star, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  CheckCircle2, 
  Phone, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  Check, 
  Search, 
  Heart, 
  ShieldCheck, 
  BookOpen, 
  Users, 
  Briefcase,
  X,
  PhoneCall,
  MessageCircle,
  Edit3,
  Save,
  Menu,
  Sparkles,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Clock
} from 'lucide-react';
import { 
  LEAD_STATUSES, 
  getStatusMeta, 
  formatAge, 
  formatMaritalStatus, 
  formatLocation, 
  formatOccupation,
  formatFieldText,
  getCandidateContact,
  getWhatsAppUrl
} from '../constants';

export default function FullViewer({
  biodatas = [],
  leads = [],
  onSaveLead,
  pagination = { currentPage: 1, total_pages: 1, total: 0 },
  onPageChange,
  filters,
  setFilters,
  onApplyFilters,
  locations,
  selectedId,
  setSelectedId
}) {
  const [activeId, setActiveId] = useState(selectedId || biodatas[0]?.biodata_no);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showQueueSidebar, setShowQueueSidebar] = useState(true);
  
  // Mobile responsive view mode: 'list' (candidate queue) or 'detail' (biodata view)
  const [mobileTab, setMobileTab] = useState('detail');

  // Contact editing state
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [brideNameInput, setBrideNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [guardianNameInput, setGuardianNameInput] = useState('');
  const [relationInput, setRelationInput] = useState('');

  // Quick notes editing
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesInput, setNotesInput] = useState('');

  const contactSectionRef = useRef(null);

  // Sync activeId with selectedId prop or fallback
  useEffect(() => {
    if (selectedId) {
      setActiveId(selectedId);
    } else if (biodatas.length > 0 && !activeId) {
      setActiveId(biodatas[0].biodata_no);
    }
  }, [selectedId, biodatas, activeId]);

  // Lead Data for activeId
  const leadData = leads.find(l => String(l.biodata_no) === String(activeId));
  const contactInfo = getCandidateContact(activeId, leadData, profile);
  const isShortlisted = !!leadData && leadData.status !== 'rejected';
  const status = leadData?.status || 'discovered';
  const rating = leadData?.rating || 0;
  const currentPhone = contactInfo.phone;
  const currentGuardian = contactInfo.name;
  const currentRelation = contactInfo.relation;

  // Sync input fields when activeId changes
  useEffect(() => {
    setBrideNameInput(contactInfo.brideName);
    setPhoneInput(contactInfo.phone);
    setGuardianNameInput(contactInfo.name);
    setRelationInput(contactInfo.relation || 'পিতা');
    setNotesInput(leadData?.notes || '');
    setIsEditingContact(false);
  }, [activeId, leadData, contactInfo.brideName, contactInfo.phone, contactInfo.name, contactInfo.relation]);

  // Fetch Full Profile Details whenever activeId changes
  useEffect(() => {
    if (!activeId) return;
    let isCancelled = false;

    async function loadFullBiodata() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/biodata/${activeId}`);
        const json = await res.json();
        if (!isCancelled) {
          if (json.success && json.data) {
            setProfile(json.data);
          } else {
            setError(json.error || 'Failed to load biodata');
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || 'Error fetching biodata details');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadFullBiodata();
    return () => {
      isCancelled = true;
    };
  }, [activeId]);

  // Navigation helpers
  const currentIndex = biodatas.findIndex(b => String(b.biodata_no) === String(activeId));
  
  const selectCandidate = (id) => {
    setActiveId(id);
    if (setSelectedId) setSelectedId(id);
    setMobileTab('detail'); // On mobile, automatically show the detail page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNext = () => {
    if (currentIndex >= 0 && currentIndex < biodatas.length - 1) {
      selectCandidate(biodatas[currentIndex + 1].biodata_no);
    } else if (pagination.currentPage < pagination.total_pages) {
      onPageChange(pagination.currentPage + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      selectCandidate(biodatas[currentIndex - 1].biodata_no);
    } else if (pagination.currentPage > 1) {
      onPageChange(pagination.currentPage - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 's' || e.key === 'S') toggleShortlist();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleLeadUpdate = (updates) => {
    const updatedLead = {
      ...(profile || {}),
      biodata_no: activeId,
      status: updates.status !== undefined ? updates.status : status,
      rating: updates.rating !== undefined ? updates.rating : rating,
      notes: updates.notes !== undefined ? updates.notes : (leadData?.notes || ''),
      contact_info: updates.contact_info !== undefined ? updates.contact_info : (leadData?.contact_info || {}),
      updated_at: new Date().toISOString(),
    };
    onSaveLead(updatedLead);
  };

  const toggleShortlist = () => {
    const newStatus = isShortlisted ? 'discovered' : 'shortlisted';
    handleLeadUpdate({ status: newStatus });
  };

  const handleSaveContact = () => {
    handleLeadUpdate({
      contact_info: {
        brideName: brideNameInput.trim() || contactInfo.brideName,
        phone: phoneInput.trim(),
        name: guardianNameInput.trim() || 'অভিভাবক',
        relation: relationInput.trim() || 'পিতা',
      }
    });
    setIsEditingContact(false);
  };

  const handleSaveNotes = () => {
    handleLeadUpdate({ notes: notesInput });
    setNotesOpen(false);
  };

  // Copy formatted WhatsApp summary for parents
  const copyFamilySummary = () => {
    if (!profile) return;
    const gen = profile['general-info']?.fs || [];
    const edu = profile['educational-qualifications']?.fs || [];
    const fam = profile['family-information']?.fs || [];
    const occ = profile['occupational-information']?.fs || [];
    const addr = profile['address']?.fs || [];

    const getVal = (fields, key) => {
      const f = fields.find(x => x.k === key);
      return formatFieldText(f?.fv) || formatFieldText(f?.v) || 'দেওয়া নেই';
    };

    const text = `🌸 *অর্ধেকদ্বীন পাত্রীর বায়োডাটা সারসংক্ষেপ* 🌸
━━━━━━━━━━━━━━━━━━━
👰 *পাত্রীর নাম:* ${contactInfo.brideName} (${contactInfo.brideNameEn})
🆔 *বায়োডাটা নং:* #${activeId}
🔗 *অফিসিয়াল লিঙ্ক:* https://ordhekdeen.com/biodata/${activeId}

📞 *যোগাযোগের তথ্য:*
• অভিভাবক: ${currentGuardian || 'পিতা/অভিভাবক'} (${currentRelation || 'পিতা'})
• মোবাইল নম্বর: ${currentPhone || '০১XXXXXXXXX (যাচাইকৃত)'}

📌 *সাধারণ তথ্য:*
• বয়স/জন্মসন: ${getVal(gen, 'birth_year')}
• বৈবাহিক অবস্থা: ${getVal(gen, 'marital_status')}
• উচ্চতা: ${getVal(gen, 'height')} | গাত্রবর্ণ: ${getVal(gen, 'complexion')}
• স্থায়ী ঠিকানা: ${getVal(addr, 'perm_address')}

🎓 *শিক্ষাগত যোগ্যতা:*
• মাধ্যম: ${getVal(edu, 'education_method')}
• শিক্ষাগত পদবী/বিবরণ: ${getVal(edu, 'graduation_subject') || getVal(edu, 'hsc_group')}

💼 *পেশা:* ${getVal(occ, 'occupation')}

👨‍👩‍👧 *পারিবারিক তথ্য:*
• পিতার পেশা: ${getVal(fam, 'is_father_alive')} (${getVal(fam, 'fathers_profession')})
• মাতার পেশা: ${getVal(fam, 'is_mother_alive')} (${getVal(fam, 'mothers_profession')})

━━━━━━━━━━━━━━━━━━━
_OrdhekDeen Leads Matchmaking Portal_`;

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const scrollToContact = () => {
    setMobileTab('detail');
    if (contactSectionRef.current) {
      contactSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Render individual 2-column authentic section tables
  const renderSectionTable = (sectionKey, titleBn, titleEn, Icon) => {
    if (!profile || !profile[sectionKey]) return null;
    const sec = profile[sectionKey];
    const fields = sec.fs || [];
    if (!fields.length) return null;

    return (
      <div id={sectionKey} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden mb-5 transition-all">
        {/* Section Header */}
        <div className="bg-gradient-to-r from-slate-50 via-slate-50/80 to-emerald-50/30 px-4 sm:px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-brand-100 text-brand-700">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-800">
                {titleBn}
              </h2>
              <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">
                {titleEn}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-medium text-slate-400">
            {fields.length}টি তথ্য
          </span>
        </div>

        {/* 2-Column Clean Key-Value Table */}
        <div className="divide-y divide-slate-100">
          {fields.map((f, idx) => {
            const rawTitle = f.fn || f.k || 'তথ্য';
            const title = formatFieldText(rawTitle);
            const rawVal = f.fv !== undefined ? f.fv : f.v;
            let val = formatFieldText(rawVal);

            if (!val || val === 'null' || val === 'undefined') {
              val = 'উল্লেখ করা হয়নি';
            }

            return (
              <div 
                key={idx} 
                className="grid grid-cols-1 sm:grid-cols-12 text-xs sm:text-sm hover:bg-slate-50/60 transition-colors"
              >
                {/* Field Label */}
                <div className="sm:col-span-4 lg:col-span-5 p-3 sm:px-4 sm:py-2.5 font-bold text-slate-700 bg-slate-50/50 sm:border-r border-slate-100 flex items-center">
                  <span>{title}</span>
                </div>
                {/* Field Value */}
                <div className="sm:col-span-8 lg:col-span-7 p-3 sm:px-4 sm:py-2.5 text-slate-800 font-normal leading-relaxed whitespace-pre-line break-words">
                  {val}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative pb-24 lg:pb-8">
      {/* Mobile Top View Switcher (Candidate List vs Biodata View) */}
      <div className="lg:hidden flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-1.5 mb-4 shadow-xs">
        <button
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'list'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>ক্যান্ডিডেট তালিকা ({pagination.total})</span>
        </button>

        <button
          onClick={() => setMobileTab('detail')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'detail'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>বায়োডাটা বিস্তারিত (#{activeId})</span>
        </button>
      </div>

      {/* Main Dual-Pane Layout on Desktop */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        
        {/* 1. LEFT PANE: Candidate Queue Sidebar */}
        <aside className={`w-full lg:w-84 xl:w-92 shrink-0 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden ${
          mobileTab === 'list' ? 'block' : 'hidden lg:block'
        }`}>
          {/* Queue Header & Search */}
          <div className="p-3.5 border-b border-slate-200 bg-slate-50/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-brand-600" />
                পাত্রী তালিকা ({pagination.total})
              </span>
              <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                পেজ {pagination.currentPage}/{pagination.total_pages}
              </span>
            </div>

            {/* Quick ID Filter */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={filters?.biodata_no || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, biodata_no: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && onApplyFilters()}
                placeholder="বায়োডাটা নং খুঁজুন (e.g. 24590)..."
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-brand-500/20"
              />
              {filters?.biodata_no && (
                <button
                  onClick={() => {
                    setFilters(prev => ({ ...prev, biodata_no: '' }));
                    onApplyFilters();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Candidate List Scrollable Queue */}
          <div className="divide-y divide-slate-100 max-h-[calc(100vh-250px)] overflow-y-auto">
            {biodatas.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 italic">
                {loading ? 'তথ্য লোড হচ্ছে...' : 'কোনো বায়োডাটা পাওয়া যায়নি।'}
              </div>
            ) : (
              biodatas.map((b) => {
                const bNo = b.biodata_no;
                const isSelected = String(bNo) === String(activeId);
                const bLead = leads.find(l => String(l.biodata_no) === String(bNo));
                const bStatus = bLead?.status || 'discovered';
                const bStatusMeta = getStatusMeta(bStatus);
                const age = formatAge(b.age);
                const marital = formatMaritalStatus(b.marital_status);
                const loc = formatLocation(b.address);
                const occ = formatOccupation(b.occupation);
                const bContact = getCandidateContact(bNo, bLead);

                return (
                  <div
                    key={bNo}
                    onClick={() => selectCandidate(bNo)}
                    className={`p-3 cursor-pointer transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-brand-50/80 border-l-4 border-l-brand-600 shadow-inner'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Candidate Name & ID */}
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0 flex-1">
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900 block truncate">
                          {bContact.brideName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold block truncate">
                          {bContact.brideNameEn}
                        </span>
                      </div>
                      <span className="font-mono font-black text-xs text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200 shrink-0">
                        #{bNo}
                      </span>
                    </div>

                    {/* Age, Status & Rating */}
                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                        <span>{age} বছর</span>
                        <span className="text-slate-300 font-normal">•</span>
                        <span className="text-slate-500 font-medium">{marital}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${bStatusMeta.color}`}>
                          {bStatusMeta.label}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 truncate font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="truncate">{loc}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span className="truncate max-w-[170px]">{occ}</span>
                      {bLead?.rating > 0 && (
                        <span className="text-amber-500 font-bold flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {bLead.rating}
                        </span>
                      )}
                    </div>

                    {/* Direct Contact Phone & WhatsApp Row */}
                    <div className="flex items-center justify-between pt-1.5 mt-0.5 border-t border-slate-100 text-xs">
                      <a
                        href={`tel:${bContact.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 font-mono font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
                        title="সরাসরি কল করুন"
                      >
                        <PhoneCall className="h-3 w-3 text-emerald-600" />
                        <span>{bContact.phone}</span>
                      </a>
                      <a
                        href={getWhatsAppUrl(bContact.phone, bNo, bContact.brideName)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-green-100 hover:bg-green-200 text-green-800 font-bold text-[10px] transition-colors"
                        title="WhatsApp চ্যাট"
                      >
                        <MessageCircle className="h-3 w-3" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Queue Pagination Footer */}
          <div className="p-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
            <button
              disabled={pagination.currentPage <= 1}
              onClick={() => onPageChange(pagination.currentPage - 1)}
              className={`py-1.5 px-3 rounded-xl border font-semibold flex items-center gap-1 bg-white ${
                pagination.currentPage <= 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>আগের পেজ</span>
            </button>

            <span className="font-medium text-slate-500 text-[11px]">
              {pagination.currentPage} / {pagination.total_pages}
            </span>

            <button
              disabled={pagination.currentPage >= pagination.total_pages}
              onClick={() => onPageChange(pagination.currentPage + 1)}
              className={`py-1.5 px-3 rounded-xl border font-semibold flex items-center gap-1 bg-white ${
                pagination.currentPage >= pagination.total_pages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span>পরের পেজ</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </aside>

        {/* 2. RIGHT / MAIN PANE: Authentic Biodata Viewer */}
        <main className={`flex-1 w-full flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden ${
          mobileTab === 'detail' ? 'block' : 'hidden lg:block'
        }`}>
          
          {/* Top Sticky Bar with Candidate Flipper */}
          <div className="sticky top-16 z-20 bg-white/95 backdrop-blur px-4 sm:px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            {/* Candidate ID & Previous/Next */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrev}
                title="পূর্ববর্তী বায়োডাটা (Keyboard: ←)"
                className="py-1.5 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1 text-xs font-bold"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">পূর্ববর্তী</span>
              </button>

              <span className="font-mono font-bold text-xs sm:text-sm bg-brand-50 text-brand-800 px-3 py-1.5 rounded-xl border border-brand-200">
                বায়োডাটা #{activeId || '...'}
              </span>

              <button
                onClick={goToNext}
                title="পরবর্তী বায়োডাটা (Keyboard: →)"
                className="py-1.5 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1 text-xs font-bold"
              >
                <span className="hidden sm:inline">পরবর্তী</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Top Quick Actions */}
            <div className="flex items-center gap-2">
              {/* Shortlist Toggle */}
              <button
                onClick={toggleShortlist}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  isShortlisted
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Heart className={`h-4 w-4 ${isShortlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                <span>{isShortlisted ? 'শর্টলিস্টেড' : 'শর্টলিস্ট করুন'}</span>
              </button>

              {/* Copy WhatsApp Summary */}
              <button
                onClick={copyFamilySummary}
                disabled={!profile}
                title="পরিবারের সাথে শেয়ার করতে হোয়াটসঅ্যাপ সামারি কপি করুন"
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-40"
              >
                {copySuccess ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">কপি হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5 text-slate-500" />
                    <span className="hidden sm:inline">WhatsApp কপি</span>
                  </>
                )}
              </button>

              {/* Direct OrdhekDeen Link */}
              {activeId && (
                <a
                  href={`https://ordhekdeen.com/biodata/${activeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <span className="hidden sm:inline">অর্ধেকদ্বীন</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Main Scrolling Body */}
          <div className="p-4 sm:p-6 lg:p-8 bg-slate-50/50">
            {loading ? (
              <div className="py-24 text-center flex flex-col items-center justify-center">
                <div className="h-10 w-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-bold text-slate-800">বায়োডাটা #{activeId} এর তথ্য লোড হচ্ছে...</p>
                <p className="text-xs text-slate-400 mt-1">অর্ধেকদ্বীন অফিসিয়াল সার্ভার থেকে রেন্ডার হচ্ছে</p>
              </div>
            ) : error ? (
              <div className="py-16 text-center max-w-md mx-auto">
                <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-rose-600 mb-1">তথ্য প্রদর্শনে সমস্যা হয়েছে</p>
                <p className="text-xs text-slate-500 mb-4">{error}</p>
                <button
                  onClick={() => selectCandidate(activeId)}
                  className="py-1.5 px-4 bg-brand-600 text-white text-xs font-bold rounded-xl"
                >
                  আবার চেষ্টা করুন
                </button>
              </div>
            ) : !profile ? (
              <div className="py-20 text-center text-slate-400 italic">
                বাম পাশের তালিকা থেকে যেকোনো পাত্রীর বায়োডাটা নির্বাচন করুন
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-6">

                {/* ============================================================== */}
                {/* 1. GRAND PROFILE HERO BANNER WITH BRIDE'S NAME */}
                {/* ============================================================== */}
                {(() => {
                  const genFields = profile?.['general-info']?.fs || [];
                  const occFields = profile?.['occupational-information']?.fs || [];
                  const addrFields = profile?.['address']?.fs || [];
                  const getFieldVal = (fields, key) => {
                    const f = fields.find(x => x.k === key);
                    return formatFieldText(f?.fv) || formatFieldText(f?.v) || '';
                  };
                  const birthYear = getFieldVal(genFields, 'birth_year');
                  const heightVal = getFieldVal(genFields, 'height');
                  const complexionVal = getFieldVal(genFields, 'complexion');
                  const maritalVal = getFieldVal(genFields, 'marital_status');
                  const occVal = getFieldVal(occFields, 'occupation');
                  const permDist = getFieldVal(addrFields, 'perm_address') || getFieldVal(addrFields, 'permanent_address');

                  return (
                    <div className="bg-gradient-to-br from-slate-900 via-brand-950 to-emerald-950 text-white rounded-3xl p-5 sm:p-7 shadow-lg relative overflow-hidden border border-slate-800">
                      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-black text-xs bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-1 rounded-lg">
                              বায়োডাটা #{activeId}
                            </span>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/10 text-white border border-white/10">
                              পাত্রীর প্রোফাইল
                            </span>
                            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              ভেরিফাইড
                            </span>
                          </div>

                          <div className="pt-1">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex flex-wrap items-baseline gap-2.5">
                              <span>{contactInfo.brideName}</span>
                              <span className="text-base sm:text-lg font-medium text-emerald-300/80">
                                ({contactInfo.brideNameEn})
                              </span>
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-300 pt-1 flex flex-wrap items-center gap-2">
                              <span>অভিভাবক: <strong>{contactInfo.name}</strong> ({contactInfo.relation})</span>
                              <span>•</span>
                              <span className="font-mono text-emerald-400 font-bold">{contactInfo.phone}</span>
                            </p>
                          </div>

                          {/* Key Quick Attributes Grid */}
                          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                            {birthYear && (
                              <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/10 text-slate-200">
                                🎂 {birthYear}
                              </span>
                            )}
                            {maritalVal && (
                              <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/10 text-slate-200">
                                💍 {maritalVal}
                              </span>
                            )}
                            {heightVal && (
                              <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/10 text-slate-200">
                                📏 {heightVal}
                              </span>
                            )}
                            {complexionVal && (
                              <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/10 text-slate-200">
                                🎨 {complexionVal}
                              </span>
                            )}
                            {occVal && (
                              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 font-medium">
                                💼 {occVal}
                              </span>
                            )}
                            {permDist && (
                              <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/10 text-slate-200">
                                📍 {permDist}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Direct Dial and WhatsApp Actions */}
                        <div className="flex flex-row md:flex-col items-stretch sm:items-end justify-center gap-2.5 shrink-0 pt-2 md:pt-0">
                          <a
                            href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, '')}`}
                            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95"
                          >
                            <PhoneCall className="h-4 w-4" />
                            <span>সরাসরি কল করুন</span>
                          </a>

                          <a
                            href={getWhatsAppUrl(contactInfo.phone, activeId, contactInfo.brideName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span>WhatsApp মেসেজ</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* ============================================================== */}
                {/* 2. PROMINENT CONTACT INFORMATION CARD (যোগাযোগের তথ্য) */}
                {/* ============================================================== */}
                <div 
                  ref={contactSectionRef}
                  className="bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/40 rounded-3xl border-2 border-emerald-500/60 p-5 sm:p-6 shadow-md transition-all relative overflow-hidden"
                >
                  {/* Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-emerald-200/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                          যোগাযোগের তথ্য (Guardian Contact Information)
                        </h2>
                        <p className="text-xs text-emerald-800 font-medium">
                          পাত্রীর অভিভাবকের সাথে যোগাযোগের সরাসরি মাধ্যম
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsEditingContact(!isEditingContact)}
                      className="inline-flex items-center gap-1 py-1 px-3 rounded-lg text-xs font-bold text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-50 transition-colors shadow-xs"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>{isEditingContact ? 'বাতিল করুন' : (currentPhone ? 'তথ্য পরিবর্তন' : '➕ তথ্য যুক্ত করুন')}</span>
                    </button>
                  </div>

                  {/* Inline Contact Edit Form */}
                  {isEditingContact ? (
                    <div className="bg-white p-4 rounded-2xl border border-emerald-200 space-y-3 mb-4 animate-in fade-in duration-200">
                      <h4 className="text-xs font-bold text-slate-700">
                        পাত্রী ও অভিভাবকের যোগাযোগের তথ্য আপডেট করুন:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                            পাত্রীর নাম (Bride Name)
                          </label>
                          <input
                            type="text"
                            value={brideNameInput}
                            onChange={(e) => setBrideNameInput(e.target.value)}
                            placeholder="পাত্রীর পুরো নাম লিখুন"
                            className="w-full p-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                            মোবাইল নম্বর (Phone Number)
                          </label>
                          <input
                            type="text"
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            placeholder="01XXXXXXXXX"
                            className="w-full p-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                            অভিভাবকের নাম (Guardian Name)
                          </label>
                          <input
                            type="text"
                            value={guardianNameInput}
                            onChange={(e) => setGuardianNameInput(e.target.value)}
                            placeholder="পিতা / ভাই / অভিভাবকের নাম"
                            className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                            সম্পর্ক (Relation)
                          </label>
                          <input
                            type="text"
                            value={relationInput}
                            onChange={(e) => setRelationInput(e.target.value)}
                            placeholder="পিতা / মাতা / বড় ভাই"
                            className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => setIsEditingContact(false)}
                          className="py-1 px-3 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                        >
                          বাতিল
                        </button>
                        <button
                          onClick={handleSaveContact}
                          className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                        >
                          <Save className="h-3.5 w-3.5" />
                          <span>সংরক্ষণ করুন (Save)</span>
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Contact Details Display Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Bride Name Card */}
                    <div className="bg-white/95 p-4 rounded-2xl border border-emerald-200 shadow-sm space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="block text-xs font-bold text-slate-500">
                          পাত্রীর নাম (Candidate Name):
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          যাচাইকৃত পাত্রী
                        </span>
                      </div>
                      <span className="text-base sm:text-lg font-black text-slate-900 block truncate">
                        {contactInfo.brideName}
                      </span>
                      <span className="text-xs text-slate-500 font-medium block truncate">
                        {contactInfo.brideNameEn}
                      </span>
                      <span className="text-[11px] text-slate-400 block pt-1">
                        বায়োডাটা আইডি: #{activeId}
                      </span>
                    </div>

                    {/* Mobile Phone Card */}
                    <div className="bg-white/95 p-4 rounded-2xl border border-emerald-200 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="block text-xs font-bold text-slate-500">
                          অভিভাবকের মোবাইল নম্বর:
                        </span>
                        {contactInfo.isCustom ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                            যাচাইকৃত সংরক্ষিত
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            সরাসরি লাইন
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2.5">
                        <span className="font-mono text-xl sm:text-2xl font-black text-emerald-800 tracking-wider block">
                          {currentPhone}
                        </span>

                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          <a
                            href={`tel:${currentPhone.replace(/[^0-9+]/g, '')}`}
                            className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                          >
                            <PhoneCall className="h-3.5 w-3.5" />
                            <span>কল করুন</span>
                          </a>
                          <a
                            href={getWhatsAppUrl(currentPhone, activeId, contactInfo.brideName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>WhatsApp চ্যাট</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Guardian Name & Relation */}
                    <div className="bg-white/95 p-4 rounded-2xl border border-emerald-200 shadow-sm space-y-1.5">
                      <span className="block text-xs font-bold text-slate-500">
                        অভিভাবকের বিবরণ ও সম্পর্ক:
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-slate-800 block">
                        {currentGuardian} ({currentRelation})
                      </span>
                      <span className="text-xs text-slate-600 flex items-center gap-1 pt-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>যোগাযোগের সেরা সময়: <strong>{contactInfo.timeToCall}</strong></span>
                      </span>
                      <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        OrdhekDeen ভেরিফাইড অভিভাবক
                      </span>
                    </div>
                  </div>
                </div>

                {/* ============================================================== */}
                {/* LEAD TRACKER & RATING STRIP */}
                {/* ============================================================== */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
                  {/* Status Picker */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">লিড অবস্থান:</span>
                    <select
                      value={status}
                      onChange={(e) => handleLeadUpdate({ status: e.target.value })}
                      className={`text-xs font-bold py-1.5 px-3 rounded-xl border focus:ring-2 focus:ring-brand-500 cursor-pointer ${getStatusMeta(status).color}`}
                    >
                      {LEAD_STATUSES.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.label} ({s.bnLabel})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-600 mr-1">রেটিং:</span>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleLeadUpdate({ rating: s === rating ? 0 : s })}
                        className="p-1 hover:scale-125 transition-transform"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            s <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200 hover:text-amber-200'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-500 ml-1">
                      {rating > 0 ? `${rating}/5` : ''}
                    </span>
                  </div>

                  {/* Notes Toggle */}
                  <div>
                    <button
                      onClick={() => setNotesOpen(!notesOpen)}
                      className="py-1 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                    >
                      <span>📝 পারিবারিক নোট</span>
                      {leadData?.notes && <span className="h-2 w-2 rounded-full bg-brand-600"></span>}
                    </button>
                  </div>
                </div>

                {/* Notes Input Drawer */}
                {notesOpen && (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5 animate-in fade-in duration-200">
                    <label className="block text-xs font-bold text-slate-700">
                      পারিবারিক মন্তব্য ও ফলো-আপ নোট (Private Remarks):
                    </label>
                    <textarea
                      rows="3"
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      placeholder="e.g. পাত্রীর পিতা মাদ্রাসার শিক্ষক, ঢাকার স্থানীয় পরিবার। আগামী সপ্তাহে ফোন করে বিস্তারিত জানতে হবে..."
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setNotesOpen(false)}
                        className="py-1 px-3 text-xs text-slate-500 hover:bg-slate-100 rounded-xl"
                      >
                        বন্ধ করুন
                      </button>
                      <button
                        onClick={handleSaveNotes}
                        className="py-1.5 px-4 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-xs"
                      >
                        নোট সেভ করুন
                      </button>
                    </div>
                  </div>
                )}

                {/* ============================================================== */}
                {/* 9 AUTHENTIC 2-COLUMN SECTION TABLES */}
                {/* ============================================================== */}
                {renderSectionTable('general-info', 'সাধারণ তথ্য', 'General Information', Heart)}
                {renderSectionTable('address', 'ঠিকানা', 'Address Information', MapPin)}
                {renderSectionTable('educational-qualifications', 'শিক্ষাগত যোগ্যতা', 'Educational Qualifications', BookOpen)}
                {renderSectionTable('family-information', 'পারিবারিক তথ্য', 'Family Background', Users)}
                {renderSectionTable('personal-information', 'ব্যক্তিগত ও দ্বীনি তথ্য', 'Personal & Deen Lifestyle', ShieldCheck)}
                {renderSectionTable('occupational-information', 'পেশাগত তথ্য', 'Occupational Information', Briefcase)}
                {renderSectionTable('marriage-related-information', 'বিবাহ সম্পর্কিত তথ্য', 'Marriage Related Information', CheckCircle2)}
                {renderSectionTable('expected-life-partner', 'যেমন জীবনসঙ্গী আশা করেন', 'Expected Life Partner', Star)}
                {renderSectionTable('pledge', 'অঙ্গীকারনামা', 'Pledge & Verification', CheckCircle2)}

                {/* ============================================================== */}
                {/* 10. SECTION 10: যোগাযোগের তথ্য (OrdhekDeen Contact Table) */}
                {/* ============================================================== */}
                <div id="contact-info-table" className="bg-white rounded-2xl border-2 border-emerald-500/40 shadow-xs overflow-hidden mb-5 transition-all">
                  {/* Section Header */}
                  <div className="bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white px-4 sm:px-5 py-3 border-b border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-800">
                          যোগাযোগের তথ্য
                        </h2>
                        <span className="text-[11px] text-slate-400 font-normal hidden sm:inline">
                          Contact Information (১০ম বিভাগ)
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      সরাসরি যোগাযোগযোগ্য
                    </span>
                  </div>

                  {/* 2-Column Clean Key-Value Table matching OrdhekDeen format */}
                  <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {/* Bride's Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 hover:bg-slate-50/60 transition-colors">
                      <div className="sm:col-span-4 lg:col-span-5 p-3 sm:px-4 sm:py-2.5 font-bold text-slate-700 bg-slate-50/50 sm:border-r border-slate-100 flex items-center">
                        পাত্রীর নাম (Candidate Name)
                      </div>
                      <div className="sm:col-span-8 lg:col-span-7 p-3 sm:px-4 sm:py-2.5 text-slate-900 font-extrabold flex items-center gap-2">
                        <span>{contactInfo.brideName}</span>
                        <span className="text-xs text-slate-400 font-semibold">({contactInfo.brideNameEn})</span>
                      </div>
                    </div>

                    {/* Guardian's Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 hover:bg-slate-50/60 transition-colors">
                      <div className="sm:col-span-4 lg:col-span-5 p-3 sm:px-4 sm:py-2.5 font-bold text-slate-700 bg-slate-50/50 sm:border-r border-slate-100 flex items-center">
                        অভিভাবকের নাম (Guardian's Name)
                      </div>
                      <div className="sm:col-span-8 lg:col-span-7 p-3 sm:px-4 sm:py-2.5 text-slate-800 font-bold">
                        {contactInfo.name}
                      </div>
                    </div>

                    {/* Relationship with Candidate */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 hover:bg-slate-50/60 transition-colors">
                      <div className="sm:col-span-4 lg:col-span-5 p-3 sm:px-4 sm:py-2.5 font-bold text-slate-700 bg-slate-50/50 sm:border-r border-slate-100 flex items-center">
                        পাত্রীর সাথে অভিভাবকের সম্পর্ক
                      </div>
                      <div className="sm:col-span-8 lg:col-span-7 p-3 sm:px-4 sm:py-2.5 text-slate-800 font-medium">
                        {contactInfo.relation}
                      </div>
                    </div>

                    {/* Guardian Mobile Number with Live Action buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 hover:bg-slate-50/60 transition-colors">
                      <div className="sm:col-span-4 lg:col-span-5 p-3 sm:px-4 sm:py-2.5 font-bold text-slate-700 bg-slate-50/50 sm:border-r border-slate-100 flex items-center">
                        অভিভাবকের মোবাইল নম্বর
                      </div>
                      <div className="sm:col-span-8 lg:col-span-7 p-3 sm:px-4 sm:py-2.5 text-slate-800 flex flex-wrap items-center gap-3">
                        <span className="font-mono font-black text-emerald-800 text-sm sm:text-base">{contactInfo.phone}</span>
                        <a
                          href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, '')}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                        >
                          <PhoneCall className="h-3.5 w-3.5" />
                          <span>কল করুন</span>
                        </a>
                        <a
                          href={getWhatsAppUrl(contactInfo.phone, activeId, contactInfo.brideName)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    {/* Best Time to Call */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 hover:bg-slate-50/60 transition-colors">
                      <div className="sm:col-span-4 lg:col-span-5 p-3 sm:px-4 sm:py-2.5 font-bold text-slate-700 bg-slate-50/50 sm:border-r border-slate-100 flex items-center">
                        যোগাযোগের উপযুক্ত সময়
                      </div>
                      <div className="sm:col-span-8 lg:col-span-7 p-3 sm:px-4 sm:py-2.5 text-slate-800">
                        {contactInfo.timeToCall}
                      </div>
                    </div>

                    {/* Contact Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 hover:bg-slate-50/60 transition-colors">
                      <div className="sm:col-span-4 lg:col-span-5 p-3 sm:px-4 sm:py-2.5 font-bold text-slate-700 bg-slate-50/50 sm:border-r border-slate-100 flex items-center">
                        পাত্রী / অভিভাবকের ই-মেইল
                      </div>
                      <div className="sm:col-span-8 lg:col-span-7 p-3 sm:px-4 sm:py-2.5 font-mono text-slate-700">
                        {contactInfo.email}
                      </div>
                    </div>

                    {/* Official Website Link */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 hover:bg-slate-50/60 transition-colors">
                      <div className="sm:col-span-4 lg:col-span-5 p-3 sm:px-4 sm:py-2.5 font-bold text-slate-700 bg-slate-50/50 sm:border-r border-slate-100 flex items-center">
                        অফিসিয়াল বায়োডাটা লিঙ্ক
                      </div>
                      <div className="sm:col-span-8 lg:col-span-7 p-3 sm:px-4 sm:py-2.5">
                        <a
                          href={`https://ordhekdeen.com/biodata/${activeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:text-brand-800 hover:underline font-medium inline-flex items-center gap-1"
                        >
                          <span>https://ordhekdeen.com/biodata/{activeId}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Desktop Bottom Flipper */}
          <div className="p-3 bg-white border-t border-slate-200 hidden sm:flex items-center justify-between text-xs font-semibold text-slate-600">
            <button
              onClick={goToPrev}
              className="flex items-center gap-1 hover:text-brand-600 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>পূর্ববর্তী বায়োডাটা</span>
            </button>

            <div className="flex items-center gap-2 text-slate-400">
              <span>কিবোর্ড শর্টকাট:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-700">←</kbd>
              <span>পূর্ববর্তী</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-700">→</kbd>
              <span>পরবর্তী</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-700">S</kbd>
              <span>শর্টলিস্ট</span>
            </div>

            <button
              onClick={goToNext}
              className="flex items-center gap-1 hover:text-brand-600 transition-colors"
            >
              <span>পরবর্তী বায়োডাটা</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </main>
      </div>

      {/* ============================================================== */}
      {/* STICKY BOTTOM BAR FOR MOBILE SCREENS (< 1024px) */}
      {/* ============================================================== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-3 py-2.5 shadow-lg flex items-center justify-between gap-2">
        <button
          onClick={goToPrev}
          className="flex-1 py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>আগেরটি</span>
        </button>

        <button
          onClick={toggleShortlist}
          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
            isShortlisted ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
          }`}
        >
          <Heart className={`h-4 w-4 ${isShortlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
          <span>{isShortlisted ? 'শর্টলিস্ট' : 'পছন্দ'}</span>
        </button>

        <button
          onClick={scrollToContact}
          className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-xs"
        >
          <Phone className="h-3.5 w-3.5" />
          <span>যোগাযোগ</span>
        </button>

        <button
          onClick={goToNext}
          className="flex-1 py-2 px-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
        >
          <span>পরেরটি</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
