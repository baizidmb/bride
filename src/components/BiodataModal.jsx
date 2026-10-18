import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  MapPin, 
  ExternalLink, 
  Phone, 
  Bookmark, 
  BookmarkCheck, 
  Calendar, 
  Heart, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle,
  Tag,
  Save,
  MessageSquare,
  PhoneCall,
  MessageCircle
} from 'lucide-react';
import { 
  LEAD_STATUSES, 
  getStatusMeta, 
  formatAge, 
  formatFieldText,
  getCandidateContact,
  getWhatsAppUrl
} from '../constants';
import { fetchBiodataDetail } from '../api';

export default function BiodataModal({ 
  biodataNo, 
  leadData, 
  onSaveLead, 
  onClose 
}) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const candidateContact = getCandidateContact(biodataNo, leadData, profile);

  // Lead CRM state
  const [status, setStatus] = useState(leadData?.status || 'shortlisted');
  const [rating, setRating] = useState(leadData?.rating || 0);
  const [notes, setNotes] = useState(leadData?.notes || '');
  const [tags, setTags] = useState(leadData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [contactInfo, setContactInfo] = useState(leadData?.contact_info || {
    name: '',
    phone: '',
    relation: '',
    notes: ''
  });
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  useEffect(() => {
    async function fetchFullBiodata() {
      if (!biodataNo) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchBiodataDetail(biodataNo);
        if (data) {
          setProfile(data);
        } else {
          setError('Failed to fetch biodata details');
        }
      } catch (err) {
        setError(err.message || 'Error fetching biodata details');
      } finally {
        setLoading(false);
      }
    }
    fetchFullBiodata();
  }, [biodataNo]);

  const handleSaveLead = () => {
    onSaveLead({
      ...(profile || {}),
      biodata_no: biodataNo,
      status,
      rating,
      notes,
      tags,
      contact_info: contactInfo,
    });
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 2500);
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Helper to extract fields from section
  const renderFields = (sectionKey) => {
    if (!profile || !profile[sectionKey]) return null;
    const sec = profile[sectionKey];
    const fields = sec.fs || [];

    if (!fields.length) {
      return <p className="text-sm text-slate-400 italic">তথ্য উল্লেখ করা হয়নি</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((f, idx) => {
          const title = formatFieldText(f.fn || f.k || 'ফিল্ড');
          let rawVal = f.fv !== undefined ? f.fv : f.v;
          let val = formatFieldText(rawVal);
          
          if (!val) {
            val = 'দেওয়া নেই';
          }

          return (
            <div key={idx} className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
              <span className="block text-xs font-semibold text-slate-500 mb-0.5">
                {title}
              </span>
              <span className="text-sm font-medium text-slate-800 break-words whitespace-pre-line">
                {val}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-brand-50/40">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md font-mono font-bold text-lg">
              #{biodataNo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  {candidateContact.brideName}
                </h2>
                <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                  ({candidateContact.brideNameEn})
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  ভেরিফাইড
                </span>
              </div>
              <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                <span>বায়োডাটা নং: <strong>#{biodataNo}</strong></span>
                <span>•</span>
                <span className="font-mono text-emerald-700 font-bold">{candidateContact.phone}</span>
                <span>•</span>
                <a
                  href={`https://ordhekdeen.com/biodata/${biodataNo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:text-brand-700 underline font-medium inline-flex items-center gap-1"
                >
                  অফিসিয়াল লিঙ্ক <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body with Tabs & Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="h-10 w-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-semibold text-slate-700">Loading complete biodata details...</p>
              <p className="text-xs text-slate-400 mt-1">Fetching live data directly from OrdhekDeen server</p>
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Could not load biodata details</h3>
              <p className="text-xs text-slate-500 mt-1">{error}</p>
            </div>
          ) : (
            <div className="p-4 sm:p-6 space-y-6">
              
              {/* Navigation Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2">
                {[
                  { id: 'overview', label: 'সাধারণ ও শারীরিক', icon: Heart },
                  { id: 'deen', label: 'দ্বীনি ও ব্যক্তিগত', icon: ShieldCheck },
                  { id: 'education', label: 'পড়াশোনা ও যোগ্যতা', icon: BookOpen },
                  { id: 'family', label: 'পারিবারিক তথ্য', icon: Users },
                  { id: 'profession', label: 'পেশা ও আয়', icon: Briefcase },
                  { id: 'marriage', label: 'বিবাহ সংক্রান্ত ভাবনা', icon: CheckCircle2 },
                  { id: 'partner', label: 'প্রত্যাশিত জীবনসঙ্গী', icon: Star },
                  { id: 'lead_mgmt', label: '📝 লিড নোট ও ট্র্যাকার', icon: Tag },
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                        activeTab === tab.id
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Contents */}
              <div className="pt-2">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <Heart className="h-4 w-4 text-brand-600" />
                      সাধারণ ও শারীরিক বৈশিষ্ট্য (General & Physical Details)
                    </h3>
                    {renderFields('general-info')}

                    <h4 className="font-bold text-slate-800 text-sm mt-6 mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-brand-600" />
                      ঠিকানা (Address)
                    </h4>
                    {renderFields('address')}
                  </div>
                )}

                {activeTab === 'deen' && (
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-brand-600" />
                      দ্বীনি ও ব্যক্তিগত জীবন (Religious Practice & Lifestyle)
                    </h3>
                    {renderFields('personal-information')}
                  </div>
                )}

                {activeTab === 'education' && (
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-brand-600" />
                      শিক্ষাগত যোগ্যতা (Educational Qualifications)
                    </h3>
                    {renderFields('educational-qualifications')}
                  </div>
                )}

                {activeTab === 'family' && (
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-brand-600" />
                      পারিবারিক তথ্য (Family Background)
                    </h3>
                    {renderFields('family-information')}
                  </div>
                )}

                {activeTab === 'profession' && (
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-brand-600" />
                      পেশাগত তথ্য (Occupational Information)
                    </h3>
                    {renderFields('occupational-information')}
                  </div>
                )}

                {activeTab === 'marriage' && (
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-brand-600" />
                      বিবাহ সম্পর্কিত ভাবনা ও শর্ত (Marriage Related Information)
                    </h3>
                    {renderFields('marriage-related-information')}
                  </div>
                )}

                {activeTab === 'partner' && (
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-400" />
                      যেমন জীবনসঙ্গী প্রত্যাশা করেন (Expected Life Partner)
                    </h3>
                    {renderFields('expected-life-partner')}
                  </div>
                )}

                {activeTab === 'lead_mgmt' && (
                  <div className="space-y-5 bg-slate-50/80 p-5 rounded-2xl border border-slate-200">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <Tag className="h-4 w-4 text-brand-600" />
                      লিড ট্র্যাকার ও মূল্যায়ন নোট (Lead Management & Notes)
                    </h3>

                    {/* Pipeline Status Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Pipeline Status (লিড অবস্থান):
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {LEAD_STATUSES.map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setStatus(s.id)}
                            className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                              status === s.id
                                ? 'bg-brand-600 text-white border-brand-700 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300'
                            }`}
                          >
                            <span className="block">{s.label}</span>
                            <span className="text-[11px] opacity-80 block">{s.bnLabel}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rating */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Compatibility Rating (পছন্দের মাত্রা):
                      </label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star === rating ? 0 : star)}
                            className="p-1 hover:scale-125 transition-transform"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300 hover:text-amber-300'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-xs font-bold text-slate-500">
                          {rating > 0 ? `${rating} / 5 Stars` : 'Unrated'}
                        </span>
                      </div>
                    </div>

                    {/* Private Notes */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Private Family Remarks & Notes (পারিবারিক মন্তব্য ও আলোচনা):
                      </label>
                      <textarea
                        rows="3"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. মা পছন্দ করেছেন, পড়াশোনায় ভালো, মিরপুর অথবা উত্তরায় আত্মীয় আছে। আগামী সপ্তাহে অভিভাবকের সাথে যোগাযোগ করতে হবে..."
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800"
                      />
                    </div>

                    {/* Guardian Contact Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Bride Name (পাত্রীর নাম):
                        </label>
                        <input
                          type="text"
                          value={contactInfo.brideName || candidateContact.brideName}
                          onChange={(e) => setContactInfo({ ...contactInfo, brideName: e.target.value })}
                          placeholder="পাত্রীর নাম"
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Phone Number (ফোন নম্বর):
                        </label>
                        <input
                          type="text"
                          value={contactInfo.phone || candidateContact.phone}
                          onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                          placeholder="01XXXXXXXXX"
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Guardian Name (অভিভাবকের নাম):
                        </label>
                        <input
                          type="text"
                          value={contactInfo.name || candidateContact.name}
                          onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                          placeholder="e.g. বাবা / ভাই"
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                          Relation (সম্পর্ক):
                        </label>
                        <input
                          type="text"
                          value={contactInfo.relation || candidateContact.relation}
                          onChange={(e) => setContactInfo({ ...contactInfo, relation: e.target.value })}
                          placeholder="Father / Brother"
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                    </div>

                    {/* Direct Contact Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`tel:${(contactInfo.phone || candidateContact.phone).replace(/[^0-9+]/g, '')}`}
                        className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                        <span>সরাসরি কল করুন</span>
                      </a>
                      <a
                        href={getWhatsAppUrl(contactInfo.phone || candidateContact.phone, biodataNo, contactInfo.brideName || candidateContact.brideName)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>WhatsApp চ্যাট</span>
                      </a>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Custom Tags (e.g. Doctor, Hafeza, Dhaka - Press Enter to add):
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        {tags.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-100 text-brand-800"
                          >
                            <span>#{t}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(t)}
                              className="text-brand-600 hover:text-brand-900"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder="Type tag & press enter (e.g. 'Doctor', 'Alia', 'Dhanmondi')..."
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">Lead Status:</span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusMeta(status).color}`}>
              {getStatusMeta(status).label}
            </span>
            {isSavedAlert && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="h-3.5 w-3.5" /> Saved!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveLead}
              className="py-2 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              <span>Save Lead Updates</span>
            </button>

            <button
              onClick={onClose}
              className="py-2 px-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
