# 🌸 OrdhekDeen Bride Leads & Matchmaking Portal

> A fast, modern, and responsive portal designed to explore, evaluate, track, and manage potential bride profiles from OrdhekDeen (`ordhekdeen.com`).

![Banner](https://img.shields.io/badge/OrdhekDeen-Bride%20Leads%20CRM-0D9488?style=for-the-badge&logo=heart)
![Status](https://img.shields.io/badge/Status-Active%20%26%20Responsive-emerald?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## ✨ Features

- **📱 100% Mobile & Desktop Responsive**:
  - Seamless layout optimized for phones, tablets, and wide monitors.
  - Mobile bottom navigation bar for comfortable one-handed browsing (`← আগেরটি`, `শর্টলিস্ট`, `📞 যোগাযোগ`, `পরেরটি →`).
  - Mobile candidate list switcher to effortlessly jump between the candidate queue and biodata view.

- **📞 Prominent & Visible Contact Information**:
  - Highlighted **যোগাযোগের তথ্য (Contact Information)** card placed right at the top of every biodata.
  - Guardian's mobile phone number with one-click **Call** (`tel:`) and **WhatsApp** (`https://wa.me/`) links.
  - In-place phone number updating & custom contact details per candidate.

- **📄 Authentic Clone Viewing Experience**:
  - 10 complete sections rendered with authentic styling:
    1. যোগাযোগের তথ্য (Contact Information)
    2. সাধারণ ও শারীরিক তথ্য (General & Physical)
    3. ঠিকানা (Address)
    4. শিক্ষাগত যোগ্যতা (Education)
    5. পারিবারিক তথ্য (Family Background)
    6. ব্যক্তিগত ও দ্বীনি তথ্য (Religious & Lifestyle)
    7. পেশাগত তথ্য (Profession)
    8. বিবাহ সংক্রান্ত তথ্য (Marriage Outlook)
    9. যেমন জীবনসঙ্গী আশা করেন (Expected Life Partner)
    10. অঙ্গীকারনামা (Pledge & Verification)

- **❤️ Shortlist & Matchmaking CRM**:
  - 1-click shortlisting (Keyboard shortcut: <kbd>S</kbd>).
  - Compatibility rating (1–5 ★).
  - Private family notes for each candidate.
  - Pipeline stages: Discovered, Shortlisted, Family Review, Contacted, Proceeding.
  - Pre-formatted WhatsApp summary copying for sharing candidates with parents.

- **📊 Structured Directory & Pipeline Views**:
  - **Directory Table**: Filterable table with inline status changers, rating, and direct phone contact actions.
  - **Pipeline Board (Kanban)**: Drag-and-drop / stage management for active leads.
  - **All Candidates Grid**: Paginated card view of all registered bride biodatas.

- **💾 Data Export & Backup**:
  - Export evaluated leads to Excel/CSV.
  - Full JSON backup and import/restore capability.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/baizidmb/bride.git
cd bride

# Install dependencies
npm install

# Build production bundle
npm run build

# Start the server
node server.js
```

Open your browser at **[http://localhost:3001](http://localhost:3001)**.

---

## ⌨️ Keyboard Shortcuts (Viewer Mode)
- <kbd>→</kbd> : Next Candidate
- <kbd>←</kbd> : Previous Candidate
- <kbd>S</kbd> : Toggle Shortlist

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Express.js proxy server with local JSON persistence (`data/leads.json`)
- **API**: Proxied live integration with OrdhekDeen public endpoints
