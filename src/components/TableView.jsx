import React, { useState } from 'react';
import { 
  Star, 
  MapPin, 
  ExternalLink, 
  Trash2, 
  Search, 
  Download, 
  Phone, 
  PhoneCall,
  MessageCircle,
  Edit3,
  Check,
  X,
  BookOpen
} from 'lucide-react';
import { 
  LEAD_STATUSES, 
  getStatusMeta, 
  formatAge, 
  formatMaritalStatus, 
  formatLocation, 
  formatOccupation,
  getCandidateContact,
  getWhatsAppUrl
} from '../constants';

export default function TableView({ 
  leads = [], 
  onSaveLead, 
  onDeleteLead, 
  onViewDetails, 
  onOpenExport 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingPhoneId, setEditingPhoneId] = useState(null);
  const [tempPhone, setTempPhone] = useState('');

  const filteredLeads = leads.filter(l => {
    const occ = formatOccupation(l.occupation);
    const loc = formatLocation(l.address);
    const notesStr = typeof l.notes === 'string' ? l.notes : '';
    const contact = getCandidateContact(l.biodata_no, l);
    const phone = contact.phone || '';
    const brideNameBn = contact.brideName || '';
    const brideNameEn = contact.brideNameEn || '';

    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      String(l.biodata_no).includes(term) ||
      phone.includes(term) ||
      brideNameBn.toLowerCase().includes(term) ||
      brideNameEn.toLowerCase().includes(term) ||
      occ.toLowerCase().includes(term) ||
      notesStr.toLowerCase().includes(term) ||
      loc.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStartEditPhone = (lead) => {
    setEditingPhoneId(lead.biodata_no);
    setTempPhone(lead.contact_info?.phone || '');
  };

  const handleSavePhone = (lead) => {
    onSaveLead({
      ...lead,
      contact_info: {
        ...(lead.contact_info || {}),
        phone: tempPhone.trim(),
      }
    });
    setEditingPhoneId(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/70">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            সংরক্ষিত পাত্রী ও যোগাযোগের ডিরেক্টরি
          </h2>
          <p className="text-xs text-slate-500">
            আপনার বাছাইকৃত পাত্রীর যোগাযোগের নম্বর, মূল্যায়ন রেটিং ও স্ট্যাটাস ট্র্যাকার
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="আইডি, ফোন, জেলা খুঁজুন..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">সকল অবস্থা ({leads.length})</option>
            {LEAD_STATUSES.map(s => (
              <option key={s.id} value={s.id}>
                {s.label} ({leads.filter(l => l.status === s.id).length})
              </option>
            ))}
          </select>

          {/* Export Button */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            <span>CSV এক্সপোর্ট</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MOBILE RESPONSIVE CARD LIST (Visible on < md screens) */}
      {/* ============================================================== */}
      <div className="md:hidden divide-y divide-slate-100">
        {filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 italic">
            {leads.length === 0
              ? 'এখনও কোনো পাত্রী সংরক্ষণ করা হয়নি। বায়োডাটা ভিউয়ারে গিয়ে শর্টলিস্ট করুন।'
              : 'অনুসন্ধানের সাথে কোনো পাত্রী মেলেনি।'}
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const statusMeta = getStatusMeta(lead.status);
            const age = formatAge(lead.age);
            const marital = formatMaritalStatus(lead.marital_status);
            const loc = formatLocation(lead.address);
            const occ = formatOccupation(lead.occupation);
            const contact = getCandidateContact(lead.biodata_no, lead);
            const phone = contact.phone;

            return (
              <div key={lead.biodata_no} className="p-4 space-y-3 bg-white hover:bg-slate-50/50">
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      {contact.brideName}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      {contact.brideNameEn}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                      #{lead.biodata_no}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusMeta.color}`}>
                      {statusMeta.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span>{age} বছর</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-medium">{marital}</span>
                </div>

                <div className="text-xs text-slate-600 space-y-0.5">
                  <div className="flex items-center gap-1 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{loc}</span>
                  </div>
                  <div className="text-slate-500 pl-4">{occ}</div>
                </div>

                {/* Visible Contact Info on Mobile */}
                <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-emerald-700 shrink-0" />
                    <span className="font-mono text-xs font-black text-emerald-900">{phone}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                      className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-xs"
                      title="কল করুন"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                    </a>
                    <a
                      href={getWhatsAppUrl(phone, lead.biodata_no, contact.brideName)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-green-500 text-white shadow-xs"
                      title="WhatsApp"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </a>
                    <button
                      onClick={() => handleStartEditPhone(lead)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                      title="নম্বর সম্পাদনা"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => onSaveLead({ ...lead, rating: s === lead.rating ? 0 : s })}
                      >
                        <Star className={`h-3.5 w-3.5 ${s <= (lead.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewDetails(lead.biodata_no)}
                      className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold"
                    >
                      <BookOpen className="h-3 w-3" />
                      <span>বায়োডাটা দেখুন</span>
                    </button>
                    <button
                      onClick={() => onDeleteLead(lead.biodata_no)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ============================================================== */}
      {/* DESKTOP STRUCTURED TABLE (Visible on md+ screens) */}
      {/* ============================================================== */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
            <tr>
              <th className="py-3 px-4">আইডি</th>
              <th className="py-3 px-3">পাত্রীর নাম</th>
              <th className="py-3 px-3">স্ট্যাটাস</th>
              <th className="py-3 px-3">যোগাযোগের নম্বর</th>
              <th className="py-3 px-3">রেটিং</th>
              <th className="py-3 px-3">বয়স</th>
              <th className="py-3 px-3">ঠিকানা</th>
              <th className="py-3 px-3">পেশা</th>
              <th className="py-3 px-4 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-12 text-center text-xs text-slate-400 italic">
                  {leads.length === 0
                    ? 'এখনও কোনো পাত্রী সংরক্ষণ করা হয়নি। বায়োডাটা ভিউয়ারে গিয়ে শর্টলিস্ট করুন।'
                    : 'অনুসন্ধানের সাথে কোনো পাত্রী মেলেনি।'}
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => {
                const statusMeta = getStatusMeta(lead.status);
                const age = formatAge(lead.age);
                const loc = formatLocation(lead.address);
                const occ = formatOccupation(lead.occupation);
                const contact = getCandidateContact(lead.biodata_no, lead);
                const phone = contact.phone;
                const isEditingThis = editingPhoneId === lead.biodata_no;

                return (
                  <tr key={lead.biodata_no} className="hover:bg-slate-50/70 transition-colors">
                    {/* ID */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <button
                        onClick={() => onViewDetails(lead.biodata_no)}
                        className="hover:text-brand-600 hover:underline flex items-center gap-1"
                      >
                        <span>#{lead.biodata_no}</span>
                      </button>
                    </td>

                    {/* Bride's Name */}
                    <td className="py-3 px-3">
                      <button
                        onClick={() => onViewDetails(lead.biodata_no)}
                        className="text-left group"
                      >
                        <span className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-brand-600 transition-colors block">
                          {contact.brideName}
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold block">
                          {contact.brideNameEn}
                        </span>
                      </button>
                    </td>

                    {/* Status Pill with quick change */}
                    <td className="py-3 px-3">
                      <select
                        value={lead.status || 'shortlisted'}
                        onChange={(e) => onSaveLead({ ...lead, status: e.target.value })}
                        className={`text-[11px] font-bold py-1 px-2 rounded-lg border focus:ring-1 focus:ring-brand-500 cursor-pointer ${statusMeta.color}`}
                      >
                        {LEAD_STATUSES.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.label} ({s.bnLabel})
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* VISIBLE CONTACT PHONE & QUICK ACTIONS */}
                    <td className="py-3 px-3">
                      {isEditingThis ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={tempPhone}
                            onChange={(e) => setTempPhone(e.target.value)}
                            placeholder="01XXXXXXXXX"
                            className="w-28 p-1 text-xs font-mono font-bold border border-emerald-300 rounded-lg focus:ring-1 focus:ring-emerald-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSavePhone(lead)}
                            className="p-1 rounded bg-emerald-600 text-white"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => setEditingPhoneId(null)}
                            className="p-1 rounded text-slate-400 hover:bg-slate-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-emerald-800">
                            {phone}
                          </span>
                          <a
                            href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                            className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            title="সরাসরি কল করুন"
                          >
                            <PhoneCall className="h-3.5 w-3.5" />
                          </a>
                          <a
                            href={getWhatsAppUrl(phone, lead.biodata_no, contact.brideName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded bg-green-50 text-green-700 hover:bg-green-100"
                            title="WhatsApp চ্যাট"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </a>
                          <button
                            onClick={() => handleStartEditPhone(lead)}
                            className="text-slate-400 hover:text-slate-600"
                            title="নম্বর সম্পাদনা"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Rating */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => onSaveLead({ ...lead, rating: s === lead.rating ? 0 : s })}
                            className="p-0.5 hover:scale-125"
                          >
                            <Star
                              className={`h-3.5 w-3.5 ${
                                s <= (lead.rating || 0)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* Age */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">{age} বছর</span>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-3 max-w-[140px] truncate" title={loc}>
                      <span className="font-medium text-slate-700">{loc}</span>
                    </td>

                    {/* Profession */}
                    <td className="py-3 px-3 max-w-[140px] truncate" title={occ}>
                      <span className="text-slate-600">{occ}</span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewDetails(lead.biodata_no)}
                          className="p-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs flex items-center gap-1"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>ভিউ</span>
                        </button>
                        <a
                          href={`https://ordhekdeen.com/biodata/${lead.biodata_no}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          title="অফিসিয়াল সাইটে দেখুন"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={() => onDeleteLead(lead.biodata_no)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
