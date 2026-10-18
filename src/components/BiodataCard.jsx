import React, { useState } from 'react';
import { 
  Star, 
  MapPin, 
  Briefcase, 
  Eye, 
  ExternalLink, 
  Check, 
  Bookmark, 
  BookmarkCheck,
  ChevronDown,
  FileText,
  UserCheck,
  Phone,
  PhoneCall,
  MessageCircle
} from 'lucide-react';
import { 
  LEAD_STATUSES, 
  getStatusMeta, 
  formatAge, 
  formatMaritalStatus, 
  formatLocation,
  formatOccupation,
  formatHeight,
  formatComplexion,
  getCandidateContact,
  getWhatsAppUrl
} from '../constants';

export default function BiodataCard({ 
  biodata, 
  leadData, 
  onSaveLead, 
  onViewDetails 
}) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const isSaved = !!leadData;
  const currentStatus = leadData?.status || 'discovered';
  const statusMeta = getStatusMeta(currentStatus);
  const rating = leadData?.rating || 0;
  const notes = leadData?.notes || '';

  const biodataNo = biodata.biodata_no;
  const age = formatAge(biodata.age);
  const marital = formatMaritalStatus(biodata.marital_status);
  const height = formatHeight(biodata.height);
  const complexion = formatComplexion(biodata.complexion);
  const occupation = formatOccupation(biodata.occupation);
  const location = formatLocation(biodata.address);
  const pageViews = biodata.total_page_view || 0;
  const contact = getCandidateContact(biodataNo, leadData);

  const handleStatusChange = (newStatus) => {
    onSaveLead({
      ...biodata,
      ...leadData,
      biodata_no: biodataNo,
      status: newStatus,
    });
    setShowStatusMenu(false);
  };

  const handleRatingChange = (newRating) => {
    onSaveLead({
      ...biodata,
      ...leadData,
      biodata_no: biodataNo,
      rating: newRating === rating ? 0 : newRating,
    });
  };

  const handleToggleShortlist = () => {
    if (isSaved) {
      handleStatusChange(currentStatus === 'shortlisted' ? 'discovered' : 'shortlisted');
    } else {
      handleStatusChange('shortlisted');
    }
  };

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-lg flex flex-col justify-between relative group ${
      isSaved && currentStatus === 'shortlisted' 
        ? 'border-amber-300 ring-2 ring-amber-100 shadow-sm' 
        : isSaved && currentStatus === 'proceeding'
        ? 'border-emerald-400 ring-2 ring-emerald-100'
        : 'border-slate-200/90 hover:border-brand-300'
    }`}>
      {/* Top Banner & Status Header */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-start justify-between gap-2 mb-3">
          {/* Biodata ID Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black tracking-wide bg-brand-50 text-brand-800 border border-brand-200 font-mono">
              #{biodataNo}
            </span>
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <Eye className="h-3 w-3 text-slate-400" />
              {pageViews} views
            </span>
          </div>

          {/* Lead Pipeline Status Pill with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${statusMeta.color}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.badgeColor}`}></span>
              <span>{statusMeta.label}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>

            {showStatusMenu && (
              <>
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setShowStatusMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-xs">
                  <div className="px-3 py-1 font-semibold text-slate-400 border-b border-slate-100 uppercase tracking-wider text-[10px]">
                    Move Lead To:
                  </div>
                  {LEAD_STATUSES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleStatusChange(s.id)}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        currentStatus === s.id ? 'font-bold text-brand-700 bg-brand-50/50' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${s.badgeColor}`}></span>
                        <span>{s.label}</span>
                      </div>
                      {currentStatus === s.id && <Check className="h-3.5 w-3.5 text-brand-600" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Profile Header Details */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <h3 className="font-extrabold text-base text-slate-900">
              পাত্রীর বায়োডাটা
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {age} yrs
            </span>
            <span className="text-xs text-slate-500 font-medium">
              • {marital}
            </span>
          </div>

          {/* Quick attributes pills */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
              📏 {height}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
              🎨 {complexion}
            </span>
          </div>
        </div>

        {/* Location & Profession */}
        <div className="space-y-1.5 text-xs text-slate-600 mt-2 border-t border-slate-100 pt-2.5">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-medium">{location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{occupation}</span>
          </div>

          {/* Visible Direct Contact Strip */}
          <div className="flex items-center justify-between text-xs text-emerald-800 font-bold bg-emerald-50/90 px-2.5 py-1.5 rounded-xl border border-emerald-200 mt-2">
            <a
              href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 hover:underline"
              title="সরাসরি কল করুন"
            >
              <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-mono">{contact.phone}</span>
            </a>
            <a
              href={getWhatsAppUrl(contact.phone, biodataNo)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-100 hover:bg-green-200 px-2 py-0.5 rounded-lg transition-colors"
              title="WhatsApp মেসেজ"
            >
              <MessageCircle className="h-3 w-3" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Star Rating Bar */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400">Match Rating:</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                className="p-0.5 hover:scale-125 transition-transform"
                title={`Rate ${star} star`}
              >
                <Star
                  className={`h-4 w-4 ${
                    star <= rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200 hover:text-amber-200'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Private Notes preview if any */}
        {notes && (
          <div className="mt-2.5 p-2 bg-amber-50/70 border border-amber-200/60 rounded-lg text-xs text-amber-900 flex items-start gap-1.5">
            <FileText className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="line-clamp-2 italic text-[11px]">"{notes}"</p>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="p-3 bg-slate-50/80 border-t border-slate-100 rounded-b-2xl flex items-center justify-between gap-2">
        <button
          onClick={() => onViewDetails(biodataNo)}
          className="flex-1 py-1.5 px-3 bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-300 text-brand-700 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Full Biodata</span>
        </button>

        <button
          onClick={handleToggleShortlist}
          title={isSaved && currentStatus === 'shortlisted' ? 'Remove from Shortlist' : 'Add to Shortlist'}
          className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
            isSaved && currentStatus === 'shortlisted'
              ? 'bg-amber-500 border-amber-600 text-white shadow-sm'
              : 'bg-white border-slate-200 text-slate-600 hover:text-amber-600 hover:border-amber-300'
          }`}
        >
          {isSaved && currentStatus === 'shortlisted' ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </button>

        <a
          href={`https://ordhekdeen.com/biodata/${biodataNo}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Open Profile on OrdhekDeen.com"
          className="p-2 bg-white border border-slate-200 hover:border-brand-300 text-slate-500 hover:text-brand-600 rounded-xl transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
