import React from 'react';
import { 
  Star, 
  MapPin, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  Eye,
  Plus,
  PhoneCall,
  MessageCircle
} from 'lucide-react';
import { 
  LEAD_STATUSES, 
  formatAge, 
  formatLocation,
  formatOccupation,
  getCandidateContact,
  getWhatsAppUrl
} from '../constants';

export default function KanbanView({ 
  leads, 
  onUpdateLeadStatus, 
  onViewDetails,
  onOpenExplore
}) {
  const getLeadsByStatus = (statusId) => {
    return leads.filter(l => l.status === statusId);
  };

  const statusOrder = LEAD_STATUSES.map(s => s.id);

  const moveLead = (lead, direction) => {
    const currentIndex = statusOrder.indexOf(lead.status);
    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < statusOrder.length) {
      onUpdateLeadStatus(lead.biodata_no, statusOrder[nextIndex]);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Bride Lead Matchmaking Pipeline (পিপলাইন ভিউ)
          </h2>
          <p className="text-xs text-slate-500">
            Track leads across stages from discovery to family discussion, guardian contact, and finalization.
          </p>
        </div>
        <button
          onClick={onOpenExplore}
          className="flex items-center gap-1.5 py-1.5 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Discover More on OrdhekDeen</span>
        </button>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1">
        {LEAD_STATUSES.map((col, colIdx) => {
          const colLeads = getLeadsByStatus(col.id);
          return (
            <div
              key={col.id}
              className="w-72 sm:w-80 shrink-0 bg-slate-100/90 rounded-2xl p-3 border border-slate-200/80 flex flex-col kanban-col"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${col.badgeColor}`}></span>
                  <span className="font-bold text-sm text-slate-800">{col.label}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-slate-600 border border-slate-200">
                  {colLeads.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {colLeads.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 italic">
                    No candidates in this stage
                  </div>
                ) : (
                  colLeads.map((lead) => {
                    const age = formatAge(lead.age);
                    const loc = formatLocation(lead.address);
                    const occ = formatOccupation(lead.occupation);
                    const rating = lead.rating || 0;
                    const notesStr = typeof lead.notes === 'string' ? lead.notes : '';
                    const contact = getCandidateContact(lead.biodata_no, lead);

                    return (
                      <div
                        key={lead.biodata_no}
                        className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm hover:shadow transition-all group"
                      >
                        {/* Bride Name & ID */}
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-black text-sm text-slate-900 truncate">
                              {contact.brideName}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-semibold truncate">
                              {contact.brideNameEn}
                            </p>
                          </div>
                          <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded shrink-0">
                            #{lead.biodata_no}
                          </span>
                        </div>

                        {/* Card Rating Bar */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold text-slate-600">
                            {age} Years • {occ}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`h-3 w-3 ${
                                  s <= rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{loc}</span>
                        </div>

                        {/* Visible Direct Contact Strip */}
                        <div className="flex items-center justify-between text-[11px] font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 mb-2">
                          <a
                            href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                            className="inline-flex items-center gap-1 text-emerald-800 hover:underline"
                            title="সরাসরি কল করুন"
                          >
                            <PhoneCall className="h-3 w-3 text-emerald-600" />
                            <span className="font-mono">{contact.phone}</span>
                          </a>
                          <a
                            href={getWhatsAppUrl(contact.phone, lead.biodata_no, contact.brideName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-[10px] text-green-700 hover:underline font-bold"
                            title="WhatsApp চ্যাট"
                          >
                            <MessageCircle className="h-3 w-3" />
                            <span>WA</span>
                          </a>
                        </div>

                        {/* Notes snippet */}
                        {notesStr && (
                          <div className="mb-2 p-2 bg-amber-50/70 border border-amber-200/50 rounded-lg text-xs text-amber-900 italic line-clamp-2">
                            "{notesStr}"
                          </div>
                        )}

                        {/* Tags */}
                        {lead.tags && Array.isArray(lead.tags) && lead.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {lead.tags.slice(0, 3).map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-50 text-brand-700"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Card Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <button
                            disabled={colIdx === 0}
                            onClick={() => moveLead(lead, -1)}
                            title="Move to previous stage"
                            className={`p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors ${
                              colIdx === 0 ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => onViewDetails(lead.biodata_no)}
                            className="font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Details</span>
                          </button>

                          <button
                            disabled={colIdx === statusOrder.length - 1}
                            onClick={() => moveLead(lead, 1)}
                            title="Move to next stage"
                            className={`p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors ${
                              colIdx === statusOrder.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
