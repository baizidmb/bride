import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  FileJson, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function ExportModal({ 
  leads, 
  onImportLeads, 
  onClose 
}) {
  const [importStatus, setImportStatus] = useState(null);

  const handleDownloadCSV = () => {
    window.open('/api/leads/export/csv', '_blank');
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(leads, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `potential_bride_leads_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (!Array.isArray(imported)) {
          throw new Error('JSON content must be an array of leads');
        }
        await onImportLeads(imported);
        setImportStatus({ success: true, message: `Successfully imported ${imported.length} leads!` });
      } catch (err) {
        setImportStatus({ success: false, message: 'Invalid JSON file: ' + err.message });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-100 text-brand-700">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Export & Backup Leads
              </h2>
              <p className="text-xs text-slate-500">
                Download your evaluated bride leads or share with family
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* CSV Download */}
          <div className="p-4 rounded-2xl border border-slate-200 hover:border-brand-300 transition-all bg-slate-50/50 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Export to Excel / CSV
                </h3>
                <p className="text-xs text-slate-500">
                  Formatted spreadsheet with IDs, ratings, notes & guardian contacts.
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadCSV}
              className="py-2 px-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm whitespace-nowrap"
            >
              Download
            </button>
          </div>

          {/* JSON Backup Download */}
          <div className="p-4 rounded-2xl border border-slate-200 hover:border-brand-300 transition-all bg-slate-50/50 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
                <FileJson className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Backup Data (JSON)
                </h3>
                <p className="text-xs text-slate-500">
                  Complete snapshot of all leads, statuses, and custom tags.
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadJSON}
              className="py-2 px-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm whitespace-nowrap"
            >
              Export JSON
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-4 rounded-2xl border border-dashed border-slate-300 hover:border-brand-400 transition-all bg-white text-center">
            <Upload className="h-7 w-7 text-slate-400 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-700">
              Restore / Import Leads from JSON
            </h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Select a previously exported JSON backup file
            </p>
            <label className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer border border-slate-200 transition-colors">
              <span>Choose File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Import Status Alert */}
          {importStatus && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              importStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {importStatus.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
