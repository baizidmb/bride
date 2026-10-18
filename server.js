import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure leads file exists
if (!fs.existsSync(LEADS_FILE)) {
  fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2), 'utf-8');
}

function getStoredLeads() {
  try {
    const raw = fs.readFileSync(LEADS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading leads file:', e);
    return [];
  }
}

function saveStoredLeads(leads) {
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Error saving leads file:', e);
    return false;
  }
}

const ORDHEKDEEN_API_BASE = 'https://api.ordhekdeen.com/api/v1';
const COMMON_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Origin': 'https://ordhekdeen.com',
  'Referer': 'https://ordhekdeen.com/',
};

// 1. Search Biodatas Endpoint (Proxies to OrdhekDeen API)
app.post('/api/search', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const userFilters = req.body.filters || {};
    
    // Always default to female biodatas for potential bride search unless specified
    const filters = {
      biodata_type: ['female'],
      ...userFilters,
    };

    // If biodata_no is given as string, convert to Number
    if (filters.biodata_no && typeof filters.biodata_no === 'string') {
      filters.biodata_no = Number(filters.biodata_no.trim());
    }

    const payload = { filters };

    const targetUrl = `${ORDHEKDEEN_API_BASE}/search/biodata?page=${page}&limit=${limit}`;

    const apiRes = await fetch(targetUrl, {
      method: 'POST',
      headers: COMMON_HEADERS,
      body: JSON.stringify(payload),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      return res.status(apiRes.status).json({
        success: false,
        error: `OrdhekDeen API responded with HTTP ${apiRes.status}`,
        details: errText,
      });
    }

    const data = await apiRes.json();
    return res.json(data);
  } catch (error) {
    console.error('Error in /api/search:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal proxy error',
    });
  }
});

// 2. Fetch Single Biodata Details
app.get('/api/biodata/:id', async (req, res) => {
  try {
    const biodataNo = req.params.id;
    const targetUrl = `${ORDHEKDEEN_API_BASE}/biodata/public/view/${biodataNo}`;

    const apiRes = await fetch(targetUrl, {
      method: 'GET',
      headers: COMMON_HEADERS,
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      return res.status(apiRes.status).json({
        success: false,
        error: `Failed to load biodata #${biodataNo}`,
        details: errText,
      });
    }

    const data = await apiRes.json();
    return res.json(data);
  } catch (error) {
    console.error(`Error in /api/biodata/${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal proxy error',
    });
  }
});

// 3. Location Helper Data (Divisions & Districts of Bangladesh)
app.get('/api/locations', (req, res) => {
  const divisions = [
    {
      name: 'Dhaka',
      bn: 'ঢাকা',
      districts: ['Dhaka', 'Gazipur', 'Narayanganj', 'Narsingdi', 'Manikganj', 'Munshiganj', 'Tangail', 'Faridpur', 'Madaripur', 'Gopalganj', 'Rajbari', 'Shariatpur', 'Kishoreganj']
    },
    {
      name: 'Chittagong',
      bn: 'চট্টগ্রাম',
      districts: ['Chittagong', 'Cox\'s Bazar', 'Comilla', 'Feni', 'Brahmanbaria', 'Chandpur', 'Noakhali', 'Lakshmipur', 'Rangamati', 'Khagrachhari', 'Bandarban']
    },
    {
      name: 'Sylhet',
      bn: 'সিলেট',
      districts: ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj']
    },
    {
      name: 'Rajshahi',
      bn: 'রাজশাহী',
      districts: ['Rajshahi', 'Bogra', 'Pabna', 'Sirajganj', 'Naogaon', 'Natore', 'Chapai Nawabganj', 'Joypurhat']
    },
    {
      name: 'Khulna',
      bn: 'খুলনা',
      districts: ['Khulna', 'Jessore', 'Satkhira', 'Kushtia', 'Jhenaidah', 'Bagerhat', 'Chuadanga', 'Magura', 'Meherpur', 'Narail']
    },
    {
      name: 'Barisal',
      bn: 'বরিশাল',
      districts: ['Barisal', 'Barguna', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur']
    },
    {
      name: 'Rangpur',
      bn: 'রংপুর',
      districts: ['Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Thakurgaon']
    },
    {
      name: 'Mymensingh',
      bn: 'ময়মনসিংহ',
      districts: ['Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur']
    }
  ];
  res.json({ success: true, divisions });
});

// 4. Lead Management CRM Endpoints
app.get('/api/leads', (req, res) => {
  const leads = getStoredLeads();
  res.json({ success: true, data: leads });
});

app.post('/api/leads', (req, res) => {
  const newLead = req.body;
  if (!newLead || !newLead.biodata_no) {
    return res.status(400).json({ success: false, error: 'biodata_no is required' });
  }

  const leads = getStoredLeads();
  const existingIndex = leads.findIndex(l => String(l.biodata_no) === String(newLead.biodata_no));

  const timestamp = new Date().toISOString();

  if (existingIndex >= 0) {
    // Merge update
    leads[existingIndex] = {
      ...leads[existingIndex],
      ...newLead,
      updated_at: timestamp,
    };
  } else {
    leads.unshift({
      ...newLead,
      status: newLead.status || 'shortlisted',
      rating: newLead.rating || 0,
      notes: newLead.notes || '',
      tags: newLead.tags || [],
      contact_info: newLead.contact_info || { name: '', phone: '', relation: '', notes: '' },
      created_at: timestamp,
      updated_at: timestamp,
    });
  }

  saveStoredLeads(leads);
  res.json({ success: true, lead: existingIndex >= 0 ? leads[existingIndex] : leads[0] });
});

app.delete('/api/leads/:id', (req, res) => {
  const biodataNo = req.params.id;
  const leads = getStoredLeads();
  const filtered = leads.filter(l => String(l.biodata_no) !== String(biodataNo));
  saveStoredLeads(filtered);
  res.json({ success: true, message: `Lead #${biodataNo} removed` });
});

// Export Leads as CSV
app.get('/api/leads/export/csv', (req, res) => {
  const leads = getStoredLeads();
  const headers = ['Biodata No', 'Status', 'Rating', 'Age', 'Marital Status', 'Occupation', 'Location', 'Notes', 'Tags', 'Guardian Contact', 'Updated At'];
  
  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = leads.map(l => [
    escapeCSV(l.biodata_no),
    escapeCSV(l.status),
    escapeCSV(l.rating),
    escapeCSV(l.age?.value?.en || l.age || ''),
    escapeCSV(l.marital_status?.value?.en || l.marital_status || ''),
    escapeCSV(l.occupation || ''),
    escapeCSV(l.address?.permanent?.district || l.address || ''),
    escapeCSV(l.notes || ''),
    escapeCSV((l.tags || []).join('; ')),
    escapeCSV(l.contact_info?.phone ? `${l.contact_info.name || ''} (${l.contact_info.relation || 'Guardian'}): ${l.contact_info.phone}` : ''),
    escapeCSV(l.updated_at || l.created_at || '')
  ]);

  const csvContent = [headers.map(escapeCSV).join(','), ...rows.map(r => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="potential_bride_leads.csv"');
  res.send('\uFEFF' + csvContent); // Add UTF-8 BOM for Excel
});

// Import Leads
app.post('/api/leads/import', (req, res) => {
  const { leads } = req.body;
  if (!Array.isArray(leads)) {
    return res.status(400).json({ success: false, error: 'Invalid leads array format' });
  }

  const current = getStoredLeads();
  const currentMap = new Map(current.map(l => [String(l.biodata_no), l]));

  for (const lead of leads) {
    if (lead && lead.biodata_no) {
      currentMap.set(String(lead.biodata_no), {
        ...currentMap.get(String(lead.biodata_no)),
        ...lead,
        updated_at: new Date().toISOString()
      });
    }
  }

  const merged = Array.from(currentMap.values());
  saveStoredLeads(merged);
  res.json({ success: true, count: merged.length });
});

// Serve frontend build if dist folder exists
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
