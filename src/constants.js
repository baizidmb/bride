export const LEAD_STATUSES = [
  {
    id: 'discovered',
    label: 'Discovered',
    bnLabel: 'নতুন দেখা',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    badgeColor: 'bg-slate-500',
    icon: 'Sparkles',
  },
  {
    id: 'shortlisted',
    label: 'Shortlisted',
    bnLabel: 'শর্টলিস্টেড',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeColor: 'bg-amber-500',
    icon: 'Star',
  },
  {
    id: 'family_review',
    label: 'Family Review',
    bnLabel: 'পারিবারিক আলোচনা',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    badgeColor: 'bg-purple-500',
    icon: 'MessageSquare',
  },
  {
    id: 'contacted',
    label: 'Contacted Guardian',
    bnLabel: 'অভিভাবকের সাথে কথা',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    badgeColor: 'bg-blue-500',
    icon: 'PhoneCall',
  },
  {
    id: 'meeting',
    label: 'Meeting / Proposal',
    bnLabel: 'সাক্ষাৎ / প্রস্তাব',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
    badgeColor: 'bg-teal-500',
    icon: 'Calendar',
  },
  {
    id: 'proceeding',
    label: 'Finalizing / Matched',
    bnLabel: 'চূড়ান্ত অগ্রগতি',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
    badgeColor: 'bg-emerald-600',
    icon: 'HeartHandshake',
  },
  {
    id: 'declined',
    label: 'Not Suitable',
    bnLabel: 'উপযুক্ত নয়',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeColor: 'bg-rose-500',
    icon: 'XCircle',
  },
];

export const MARITAL_STATUS_OPTIONS = [
  { value: 'all', label: 'All Marital Statuses', bn: 'সকল বৈবাহিক অবস্থা' },
  { value: 'never_married', label: 'Never Married', bn: 'অবিবাহিত' },
  { value: 'divorced', label: 'Divorced', bn: 'ডিভোর্সড' },
  { value: 'widow', label: 'Widow', bn: 'বিধবা' },
];

export const EDUCATION_METHOD_OPTIONS = [
  { value: 'all', label: 'All Education Mediums', bn: 'সকল মাধ্যম' },
  { value: 'general', label: 'General Education', bn: 'জেনারেল' },
  { value: 'alia', label: 'Govt. Madrasa (Alia)', bn: 'সরকারী মাদ্রাসা (আলিয়া)' },
  { value: 'qawmi', label: 'Private Madrasa (Qawmi)', bn: 'বেসরকারী মাদ্রাসা (কওমী)' },
];

export function getStatusMeta(statusId) {
  return LEAD_STATUSES.find(s => s.id === statusId) || LEAD_STATUSES[0];
}

// Extract string value safely from any OrdhekDeen nested field
export function formatFieldText(field, lang = 'bn') {
  if (field === null || field === undefined) return '';
  if (typeof field === 'string' || typeof field === 'number') return String(field);
  
  if (typeof field === 'object') {
    // If it's an array
    if (Array.isArray(field)) {
      return field.map(x => formatFieldText(x, lang)).join(', ');
    }
    // If it has .value property
    const val = field.value !== undefined ? field.value : field;
    if (typeof val === 'object' && val !== null) {
      return val[lang] || val.bn || val.en || Object.values(val)[0] || '';
    }
    return String(val ?? '');
  }
  return String(field);
}

export function formatAge(ageObj) {
  if (!ageObj) return 'N/A';
  if (typeof ageObj === 'object') {
    const val = ageObj.value !== undefined ? ageObj.value : ageObj;
    if (typeof val === 'object' && val !== null) {
      return String(val.en || val.bn || 'N/A');
    }
    return String(val || 'N/A');
  }
  return String(ageObj);
}

export function formatMaritalStatus(statusObj) {
  if (!statusObj) return 'N/A';
  if (typeof statusObj === 'object') {
    const val = statusObj.value !== undefined ? statusObj.value : statusObj;
    if (typeof val === 'object' && val !== null) {
      return val.bn || val.en || 'N/A';
    }
    return String(val || 'N/A');
  }
  return String(statusObj);
}

export function formatOccupation(occ) {
  if (!occ) return 'Not specified';
  const text = formatFieldText(occ, 'bn') || formatFieldText(occ, 'en');
  return text || 'Not specified';
}

export function formatHeight(h) {
  if (!h) return 'N/A';
  return formatFieldText(h, 'bn') || formatFieldText(h, 'en') || 'N/A';
}

export function formatComplexion(c) {
  if (!c) return 'N/A';
  return formatFieldText(c, 'bn') || formatFieldText(c, 'en') || 'N/A';
}

export function formatLocation(addr) {
  if (!addr) return 'Bangladesh';
  if (typeof addr === 'string') return addr;

  // If it has { label, value: { en: ..., bn: ... } }
  if (addr.value !== undefined) {
    if (typeof addr.value === 'object' && addr.value !== null) {
      return addr.value.bn || addr.value.en || 'Bangladesh';
    }
    return String(addr.value || 'Bangladesh');
  }

  const perm = addr.permanent || addr.perm_address || addr;
  const parts = [];
  if (perm.upazila) parts.push(typeof perm.upazila === 'object' ? formatFieldText(perm.upazila) : perm.upazila);
  if (perm.district) parts.push(typeof perm.district === 'object' ? formatFieldText(perm.district) : perm.district);
  if (perm.division && parts.length < 2) parts.push(typeof perm.division === 'object' ? formatFieldText(perm.division) : perm.division);
  return parts.length > 0 ? parts.join(', ') : 'Bangladesh';
}

export const BRIDE_NAMES = [
  { bn: 'নুসরাত জাহান', en: 'Nusrat Jahan' },
  { bn: 'সুমাইয়া আক্তার', en: 'Sumaiya Akter' },
  { bn: 'ফাতিমা তুয যোহরা', en: 'Fatima Tuz Zohra' },
  { bn: 'মারিয়া তাসনিম', en: 'Maria Tasnim' },
  { bn: 'সাদিয়া ইসলাম', en: 'Sadia Islam' },
  { bn: 'আফসানা রহমান', en: 'Afsana Rahman' },
  { bn: 'জান্নাতুল মাওয়া', en: 'Jannatul Mawa' },
  { bn: 'তাসফিয়া তাবাসসুম', en: 'Tasfia Tabassum' },
  { bn: 'উম্মে কুলসুম', en: 'Umme Kulsum' },
  { bn: 'আমিনা খানম', en: 'Amina Khanam' },
  { bn: 'নাজিয়া ফেরদৌস', en: 'Nazia Ferdous' },
  { bn: 'মেহজাবিন চৌধুরী', en: 'Mehjabin Chowdhury' },
  { bn: 'তানজিলা হক', en: 'Tanzila Haque' },
  { bn: 'রুমানা আক্তার', en: 'Rumana Akter' },
  { bn: 'রাবেয়া বসরী', en: 'Rabeya Bosri' },
  { bn: 'আয়েশা সিদ্দিকা', en: 'Ayesha Siddika' },
  { bn: 'সামিয়া পারভীন', en: 'Samia Parvin' },
  { bn: 'খাদিজা আক্তার', en: 'Khadija Akter' },
  { bn: 'নাজমুন নাহার', en: 'Najmun Nahar' },
  { bn: 'ফারজানা ববি', en: 'Farzana Boby' },
  { bn: 'ইসরাত জাহান', en: 'Israt Jahan' },
  { bn: 'তাহমিনা আক্তার', en: 'Tahmina Akter' },
  { bn: 'মুনতাহা ইসলাম', en: 'Muntaha Islam' },
  { bn: 'সাবরিনা সুলতানা', en: 'Sabrina Sultana' },
  { bn: 'জাকিয়া সুলতানা', en: 'Zakia Sultana' },
  { bn: 'রোকেয়া খাতুন', en: 'Rokeya Khatun' },
  { bn: 'আসমাতুন নেসা', en: 'Asmatun Nesa' },
  { bn: 'মুমতাহিনা রহমান', en: 'Mumtahina Rahman' },
  { bn: 'নুজহাত তাবাসসুম', en: 'Nuzhat Tabassum' },
  { bn: 'ফারহানা ইসলাম', en: 'Farhana Islam' },
  { bn: 'রিফাত সুলতানা', en: 'Rifat Sultana' },
  { bn: 'মাহবুবা আক্তার', en: 'Mahbuba Akter' },
  { bn: 'শাহনাজ পারভীন', en: 'Shahnaz Parvin' },
  { bn: 'হোসনে আরা বেগম', en: 'Hosne Ara Begum' },
  { bn: 'শারমিন আক্তার', en: 'Sharmin Akter' },
  { bn: 'সায়মা সাদিয়া', en: 'Sayma Sadia' }
];

export function getBrideName(biodataNo, leadData = null) {
  if (leadData?.candidate_name) {
    return {
      bn: leadData.candidate_name,
      en: leadData.candidate_name_en || leadData.candidate_name,
      isCustom: true
    };
  }
  const bNo = Number(biodataNo) || 12345;
  const index = Math.abs((bNo * 13) % BRIDE_NAMES.length);
  return {
    ...BRIDE_NAMES[index],
    isCustom: false
  };
}

export function getCandidateContact(biodataNo, leadData = null, profile = null) {
  const bride = getBrideName(biodataNo, leadData);

  if (leadData?.contact_info?.phone) {
    return {
      brideName: bride.bn,
      brideNameEn: bride.en,
      phone: leadData.contact_info.phone,
      name: leadData.contact_info.name || 'অভিভাবক',
      relation: leadData.contact_info.relation || 'পিতা',
      timeToCall: leadData.contact_info.timeToCall || 'সকাল ১০:০০ - রাত ৯:০০',
      email: leadData.contact_info.email || `bride.${biodataNo}@ordhekdeen.contact`,
      isCustom: true
    };
  }

  const bNo = Number(biodataNo) || 12345;
  const prefixes = ['017', '018', '019', '013', '016'];
  const pIndex = Math.abs((bNo * 7) % prefixes.length);
  const prefix = prefixes[pIndex];
  const seed1 = Math.abs((bNo * 9301 + 49297) % 89999 + 10000);
  const seed2 = Math.abs((bNo * 49297 + 9301) % 899 + 100);
  const phone = `${prefix}${String(seed1).slice(0, 4)}${String(seed2).slice(0, 4)}`;

  let relation = 'পিতা';
  let name = 'পিতা (অভিভাবক)';
  if (profile) {
    const fam = profile['family-information']?.fs || [];
    const fatherAliveField = fam.find(f => f.k === 'is_father_alive');
    const fatherAlive = formatFieldText(fatherAliveField?.fv || fatherAliveField?.v || '');
    if (fatherAlive.includes('মৃত') || fatherAlive.includes('না')) {
      relation = 'বড় ভাই / অভিভাবক';
      name = 'পরিবারের অভিভাবক';
    }
  }

  return {
    brideName: bride.bn,
    brideNameEn: bride.en,
    phone,
    name,
    relation,
    timeToCall: 'সকাল ১০:০০ - রাত ৯:০০',
    email: `bride.${biodataNo}@ordhekdeen.contact`,
    isCustom: false
  };
}

export function getWhatsAppUrl(phone, biodataNo, brideName = '') {
  const cleanPhone = String(phone).replace(/[^0-9]/g, '').replace(/^0/, '880');
  const greeting = brideName ? `আসসালামু আলাইকুম। আমি অর্ধেকদ্বীন ওয়েবসাইটে পাত্রী ${brideName} (বায়োডাটা নং #${biodataNo}) এর অভিভাবকের সাথে কথা বলার জন্য নক করছি।` : `আসসালামু আলাইকুম। আমি অর্ধেকদ্বীন ওয়েবসাইটে আপনাদের পাত্রী বায়োডাটা নং #${biodataNo} দেখে সরাসরি অভিভাবকের সাথে কথা বলার জন্য নক করছি।`;
  const message = encodeURIComponent(greeting);
  return `https://wa.me/${cleanPhone}?text=${message}`;
}


