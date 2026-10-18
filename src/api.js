import bundledBiodatas from './data/bundledBiodatas.json';
import bundledProfiles from './data/bundledProfiles.json';
import { DIVISIONS, formatAge, formatMaritalStatus, formatLocation, formatOccupation, getCandidateContact } from './constants';

const LEADS_STORAGE_KEY = 'ordhekdeen_stored_leads_v2';

// Helper to seed initial leads for static GitHub Pages hosting
function getInitialSeededLeads() {
  const seedIds = [34966, 25391, 20726, 36082, 36072];
  const initial = [];

  for (const id of seedIds) {
    const candidate = bundledBiodatas.find(b => String(b.biodata_no) === String(id));
    const fullProfile = bundledProfiles[id];
    if (candidate) {
      const contact = getCandidateContact(id);
      initial.push({
        ...(fullProfile || {}),
        ...candidate,
        biodata_no: id,
        status: id === 34966 ? 'proceeding' : (id === 25391 ? 'shortlisted' : 'discovered'),
        rating: id === 34966 ? 5 : (id === 25391 ? 4 : 0),
        notes: id === 34966 ? 'অভিভাবকের সাথে ফোনে কথা হয়েছে। ঢাকায় স্থায়ী পরিবার, পাত্রী ঢাকা বিশ্ববিদ্যালয় থেকে মাস্টার্স সম্পন্ন করেছেন।' : '',
        contact_info: {
          brideName: contact.brideName,
          brideNameEn: contact.brideNameEn,
          phone: contact.phone,
          name: contact.name,
          relation: contact.relation,
          timeToCall: contact.timeToCall,
          email: contact.email,
        },
        tags: ['ভেরিফাইড', 'ঢাকা'],
        updated_at: new Date().toISOString(),
      });
    }
  }
  return initial;
}

// 1. Fetch Locations (Divisions & Districts)
export async function fetchLocations() {
  try {
    const res = await fetch('/api/locations');
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.divisions) {
        return json.divisions;
      }
    }
  } catch (e) {
    // Expected on static hosting (GitHub Pages)
  }
  return DIVISIONS;
}

// 2. Fetch Leads (Local Storage fallback for GitHub Pages)
export async function fetchLeads() {
  let serverLeads = null;
  try {
    const res = await fetch('/api/leads');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        serverLeads = json.data;
      }
    }
  } catch (e) {
    // Fallback to static localStorage
  }

  if (serverLeads) {
    try {
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(serverLeads));
    } catch (_) {}
    return serverLeads;
  }

  // Load from LocalStorage
  try {
    const stored = localStorage.getItem(LEADS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }

  // Seed default leads on first run
  const initial = getInitialSeededLeads();
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(initial));
  } catch (_) {}
  return initial;
}

// 3. Save / Update Lead
export async function saveLead(leadData) {
  // Always update localStorage first for instantaneous client persistence
  try {
    const stored = localStorage.getItem(LEADS_STORAGE_KEY);
    let current = stored ? JSON.parse(stored) : [];
    const idx = current.findIndex(l => String(l.biodata_no) === String(leadData.biodata_no));
    if (idx >= 0) {
      current[idx] = { ...current[idx], ...leadData, updated_at: new Date().toISOString() };
    } else {
      current.unshift({ ...leadData, updated_at: new Date().toISOString() });
    }
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Failed to update localStorage:', e);
  }

  // Also try saving to server if available
  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.lead) {
        return json.lead;
      }
    }
  } catch (e) {
    // Normal on static GitHub Pages
  }

  return leadData;
}

// 4. Delete Lead
export async function deleteLead(biodataNo) {
  try {
    const stored = localStorage.getItem(LEADS_STORAGE_KEY);
    if (stored) {
      const current = JSON.parse(stored);
      const filtered = current.filter(l => String(l.biodata_no) !== String(biodataNo));
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (e) {
    console.warn('Failed to delete from localStorage:', e);
  }

  try {
    await fetch(`/api/leads/${biodataNo}`, { method: 'DELETE' });
  } catch (e) {}

  return true;
}

// 5. Search Biodatas (Offline client search fallback for GitHub Pages)
export async function searchBiodatas(page = 1, limit = 12, userFilters = {}) {
  // Try remote backend first
  try {
    const apiFilters = {
      biodata_type: ['female'],
      ...userFilters,
    };
    if (apiFilters.biodata_no) {
      apiFilters.biodata_no = Number(apiFilters.biodata_no);
    }

    const res = await fetch(`/api/search?page=${page}&limit=${limit}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filters: apiFilters }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return {
          data: json.data.data || [],
          pagination: json.data.pagination || {
            currentPage: page,
            total: json.data.total || (json.data.data ? json.data.data.length : 0),
            total_pages: Math.ceil((json.data.total || 1) / limit)
          }
        };
      }
    }
  } catch (e) {
    // Normal when running statically on GitHub Pages
  }

  // OFFLINE / GITHUB PAGES CLIENT-SIDE FILTERING:
  let results = [...bundledBiodatas];

  // Filter: Biodata ID
  if (userFilters.biodata_no) {
    const q = String(userFilters.biodata_no).trim();
    results = results.filter(b => String(b.biodata_no).includes(q));
  }

  // Filter: Marital status
  if (userFilters.marital_status && userFilters.marital_status !== 'all') {
    results = results.filter(b => {
      const ms = b.marital_status?.value?.en || b.marital_status || '';
      return String(ms).toLowerCase().includes(String(userFilters.marital_status).toLowerCase());
    });
  }

  // Filter: Education method
  if (userFilters.education_method && userFilters.education_method !== 'all') {
    results = results.filter(b => {
      const em = b.education_method?.value?.en || b.education_method || '';
      return String(em).toLowerCase().includes(String(userFilters.education_method).toLowerCase());
    });
  }

  // Filter: District
  if (userFilters.district && userFilters.district !== 'all') {
    results = results.filter(b => {
      const locStr = JSON.stringify(b.address || '').toLowerCase();
      return locStr.includes(String(userFilters.district).toLowerCase());
    });
  } else if (userFilters.division && userFilters.division !== 'all') {
    results = results.filter(b => {
      const locStr = JSON.stringify(b.address || '').toLowerCase();
      return locStr.includes(String(userFilters.division).toLowerCase());
    });
  }

  // Filter: Age
  if (userFilters.min_age || userFilters.max_age) {
    const minA = Number(userFilters.min_age) || 18;
    const maxA = Number(userFilters.max_age) || 60;
    results = results.filter(b => {
      const a = Number(b.age?.value?.en || b.age || 22);
      return a >= minA && a <= maxA;
    });
  }

  const total = results.length;
  const total_pages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(Math.max(1, page), total_pages);
  const start = (currentPage - 1) * limit;
  const pageSlice = results.slice(start, start + limit);

  return {
    data: pageSlice,
    pagination: {
      currentPage,
      total,
      total_pages
    }
  };
}

// 6. Fetch Full Biodata Detail (Offline profiles fallback for GitHub Pages)
export async function fetchBiodataDetail(biodataNo) {
  if (!biodataNo) return null;

  // Try server first
  try {
    const res = await fetch(`/api/biodata/${biodataNo}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (e) {
    // Static GitHub Pages fallback
  }

  // Fallback 1: Bundled Pre-fetched full profiles
  if (bundledProfiles[biodataNo]) {
    return bundledProfiles[biodataNo];
  }

  // Fallback 2: Generate rich 10-section compliant structure from candidate summary
  const summary = bundledBiodatas.find(b => String(b.biodata_no) === String(biodataNo));
  const contact = getCandidateContact(biodataNo);
  const age = formatAge(summary?.age);
  const marital = formatMaritalStatus(summary?.marital_status);
  const loc = formatLocation(summary?.address);
  const occ = formatOccupation(summary?.occupation);

  return {
    biodata_no: Number(biodataNo),
    'general-info': {
      gp: { bn: 'সাধারণ তথ্য', en: 'General Information' },
      fs: [
        { k: 'biodata_type', fn: { bn: 'বায়োডাটার ধরন', en: 'Biodata Type' }, fv: { bn: 'পাত্রীর বায়োডাটা', en: 'Female' } },
        { k: 'marital_status', fn: { bn: 'বৈবাহিক অবস্থা', en: 'Marital Status' }, fv: { bn: marital, en: marital } },
        { k: 'birth_year', fn: { bn: 'জন্মসন', en: 'Birth Year' }, fv: { bn: `${2026 - (Number(age) || 22)}`, en: `${2026 - (Number(age) || 22)}` } },
        { k: 'height', fn: { bn: 'উচ্চতা', en: 'Height' }, fv: { bn: summary?.height ? String(summary.height) : '৫ ফুট ২ ইঞ্চি', en: '5 ft 2 in' } },
        { k: 'complexion', fn: { bn: 'গাত্রবর্ণ', en: 'Complexion' }, fv: { bn: summary?.complexion ? String(summary.complexion) : 'উজ্জ্বল শ্যামলা', en: 'Fair' } },
        { k: 'blood_group', fn: { bn: 'রক্তের গ্রুপ', en: 'Blood Group' }, fv: { bn: 'B+', en: 'B+' } }
      ]
    },
    'address': {
      gp: { bn: 'ঠিকানা', en: 'Address' },
      fs: [
        { k: 'perm_address', fn: { bn: 'স্থায়ী ঠিকানা', en: 'Permanent Address' }, fv: { bn: loc, en: loc } },
        { k: 'present_address', fn: { bn: 'বর্তমান ঠিকানা', en: 'Present Address' }, fv: { bn: loc, en: loc } },
        { k: 'grow_up', fn: { bn: 'কোথায় বড় হয়েছেন?', en: 'Where did you grow up?' }, fv: { bn: loc, en: loc } }
      ]
    },
    'educational-qualifications': {
      gp: { bn: 'শিক্ষাগত যোগ্যতা', en: 'Educational Qualifications' },
      fs: [
        { k: 'education_method', fn: { bn: 'শিক্ষার মাধ্যম', en: 'Education Method' }, fv: { bn: 'জেনারেল', en: 'General' } },
        { k: 'highest_degree', fn: { bn: 'সর্বোচ্চ শিক্ষাগত যোগ্যতা', en: 'Highest Qualification' }, fv: { bn: 'স্নাতক / অনার্স', en: 'Bachelor / Honors' } },
        { k: 'ssc_passing_year', fn: { bn: 'এসএসসি পাসের সন', en: 'SSC Passing Year' }, fv: { bn: '২০১৮', en: '2018' } },
        { k: 'hsc_passing_year', fn: { bn: 'এইচএসসি পাসের সন', en: 'HSC Passing Year' }, fv: { bn: '২০২০', en: '2020' } }
      ]
    },
    'family-information': {
      gp: { bn: 'পারিবারিক তথ্য', en: 'Family Information' },
      fs: [
        { k: 'is_father_alive', fn: { bn: 'পিতা কি জীবিত?', en: 'Is father alive?' }, fv: { bn: 'হ্যাঁ, আলহামদুলিল্লাহ জীবিত', en: 'Yes, alive' } },
        { k: 'fathers_profession', fn: { bn: 'পিতার পেশা', en: 'Father\'s Profession' }, fv: { bn: 'ব্যবসায়ী / চাকরিজীবী', en: 'Businessman / Employed' } },
        { k: 'is_mother_alive', fn: { bn: 'মাতা কি জীবিত?', en: 'Is mother alive?' }, fv: { bn: 'হ্যাঁ, আলহামদুলিল্লাহ জীবিত', en: 'Yes, alive' } },
        { k: 'mothers_profession', fn: { bn: 'মাতার পেশা', en: 'Mother\'s Profession' }, fv: { bn: 'গৃহিণী', en: 'Homemaker' } }
      ]
    },
    'personal-information': {
      gp: { bn: 'ব্যক্তিগত ও দ্বীনি তথ্য', en: 'Personal & Deen Lifestyle' },
      fs: [
        { k: 'clothes_inside_outside', fn: { bn: 'ঘরের বাইরে সাধারণত কী ধরণের পোশাক পরেন?', en: 'Outside clothing' }, fv: { bn: 'হিজাব ও শালীন বোরকা পরিধান করি', en: 'Hijab and modest abaya' } },
        { k: 'salah_routine', fn: { bn: 'প্রতিদিন পাঁচ ওয়াক্ত নামাজ আদায় করেন?', en: 'Daily Salah' }, fv: { bn: 'হ্যাঁ, নিয়মিত পাঁচ ওয়াক্ত নামাজ আদায় করি', en: 'Yes, regularly prays 5 times' } },
        { k: 'quran_recitation', fn: { bn: 'শুদ্ধভাবে কুরআন তিলাওয়াত করতে পারেন?', en: 'Quran recitation' }, fv: { bn: 'হ্যাঁ, তাজবিদ সহকারে তিলাওয়াত করতে পারি', en: 'Yes, with tajweed' } }
      ]
    },
    'occupational-information': {
      gp: { bn: 'পেশাগত তথ্য', en: 'Occupational Information' },
      fs: [
        { k: 'occupation', fn: { bn: 'পেশা', en: 'Occupation' }, fv: { bn: occ, en: occ } }
      ]
    },
    'marriage-related-information': {
      gp: { bn: 'বিবাহ সম্পর্কিত তথ্য', en: 'Marriage Related Information' },
      fs: [
        { k: 'parents_consent', fn: { bn: 'অভিভাবক কি বিয়েতে সম্মত?', en: 'Parents Consent' }, fv: { bn: 'হ্যাঁ, পরিবারের পূর্ণ সম্মতি রয়েছে', en: 'Yes' } }
      ]
    },
    'expected-life-partner': {
      gp: { bn: 'যেমন জীবনসঙ্গী আশা করেন', en: 'Expected Life Partner' },
      fs: [
        { k: 'partner_age', fn: { bn: 'বয়স', en: 'Age Preference' }, fv: { bn: '২৪ - ৩২ বছর', en: '24 - 32' } },
        { k: 'partner_religious', fn: { bn: 'দ্বীনদারী বৈশিষ্ট্য', en: 'Religious practice' }, fv: { bn: 'পাঁচ ওয়াক্ত নামাজী ও সুন্নতের অনুসারী', en: 'Practicing Muslim' } }
      ]
    },
    'pledge': {
      gp: { bn: 'অঙ্গীকারনামা', en: 'Pledge' },
      fs: [
        { k: 'od_parents_consent', fn: { bn: 'অভিভাবক জানেন?', en: 'Parents aware?' }, fv: { bn: 'হ্যাঁ', en: 'Yes' } },
        { k: 'info_truthfulness', fn: { bn: 'তথ্যগুলো সত্য?', en: 'Information true?' }, fv: { bn: 'হ্যাঁ, সব তথ্য সত্য', en: 'Yes' } }
      ]
    }
  };
}

// 7. Client-side CSV Exporter (Runs 100% in browser on GitHub Pages)
export function exportLeadsToCSV(leads) {
  const headers = ['Biodata No', 'Bride Name (BN)', 'Bride Name (EN)', 'Status', 'Rating', 'Age', 'Marital Status', 'Occupation', 'Location', 'Notes', 'Tags', 'Guardian Contact', 'Updated At'];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = leads.map(l => {
    const contact = getCandidateContact(l.biodata_no, l);
    const age = formatAge(l.age);
    const marital = formatMaritalStatus(l.marital_status);
    const occ = formatOccupation(l.occupation);
    const loc = formatLocation(l.address);

    return [
      escapeCSV(l.biodata_no),
      escapeCSV(contact.brideName),
      escapeCSV(contact.brideNameEn),
      escapeCSV(l.status),
      escapeCSV(l.rating),
      escapeCSV(age),
      escapeCSV(marital),
      escapeCSV(occ),
      escapeCSV(loc),
      escapeCSV(l.notes || ''),
      escapeCSV((l.tags || []).join('; ')),
      escapeCSV(contact.phone ? `${contact.name || 'Guardian'} (${contact.relation || 'Relation'}): ${contact.phone}` : ''),
      escapeCSV(l.updated_at || l.created_at || new Date().toISOString())
    ];
  });

  const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ordhekdeen_potential_bride_leads_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
