import React, { useState } from 'react';
import { ClinicSettings, Signatory } from '../types';
import { Storage } from '../utils/storage';
import { Settings as SettingsIcon, Save, Download, Upload, RotateCcw, X, Check, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { apiClient } from '../utils/apiClient';
import { fixAssetPath } from '../utils/assetPath';

interface SettingsModalProps {
  settings: ClinicSettings;
  onSaveSettings: (settings: ClinicSettings) => void;
  onClose: () => void;
  onRefreshData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings: initialSettings,
  onSaveSettings,
  onClose,
  onRefreshData,
}) => {
  const [settings, setSettings] = useState<ClinicSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<'general' | 'signatories' | 'backup'>('general');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [excelSyncStatus, setExcelSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const handleSyncToExcel = async () => {
    setIsSyncing(true);
    setExcelSyncStatus('Checking backend connection...');
    const isUp = await apiClient.checkHealth();
    if (!isUp) {
      setExcelSyncStatus('Backend server is not running on port 3001. Start it with: pnpm run server');
      setIsSyncing(false);
      return;
    }
    setExcelSyncStatus('Syncing all records to Excel files...');
    Storage.syncAllToBackend();
    setTimeout(() => {
      setExcelSyncStatus('All records synced to Excel files in clinic_data/ folder!');
      setIsSyncing(false);
    }, 1000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(settings);
    onClose();
  };

  const handleSignatoryChange = (index: number, patch: Partial<Signatory>) => {
    const updated = [...settings.signatories];
    updated[index] = { ...updated[index], ...patch };
    setSettings({ ...settings, signatories: updated });
  };

  const handleExportBackup = () => {
    const json = Storage.exportDatabaseJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `andrology_fertility_clinic_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const ok = Storage.importDatabaseJson(text);
        if (ok) {
          setImportStatus('Backup restored successfully!');
          onRefreshData();
        } else {
          setImportStatus('Failed to import backup: Invalid format.');
        }
      } catch (err) {
        setImportStatus('Error reading file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to reset all data back to factory defaults?')) {
      Storage.resetToFactoryDefaults();
      onRefreshData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-extrabold text-slate-900">Clinic Settings &amp; Signatories</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100/50 px-6 pt-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-2 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'general' ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg' : 'border-transparent text-slate-500'
            }`}
          >
            Clinic Details &amp; Letterhead
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('signatories')}
            className={`py-2 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'signatories' ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg' : 'border-transparent text-slate-500'
            }`}
          >
            3 Signatory Doctors (Signature Block)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`py-2 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'backup' ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg' : 'border-transparent text-slate-500'
            }`}
          >
            Backup &amp; Restore
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {activeTab === 'general' && (
            <form id="clinic-form" onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Clinic Name</label>
                <input
                  type="text"
                  value={settings.clinicName}
                  onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subtitle / Centre Type</label>
                  <input
                    type="text"
                    value={settings.subtitle}
                    onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lead Doctor / Tagline</label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Address</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cell Phone Number</label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    placeholder="0313-2807035"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={settings.whatsapp || ''}
                    onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                    placeholder="0300-9178101"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Report ID Prefix</label>
                  <input
                    type="text"
                    value={settings.reportPrefix}
                    onChange={(e) => setSettings({ ...settings, reportPrefix: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono uppercase text-xs"
                  />
                </div>
              </div>

              {/* Letterhead Assets Preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <span className="font-bold text-slate-700 block">Extracted Letterhead Assets (Self-Hosted):</span>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] text-slate-500">
                  <div className="p-2 bg-white rounded border border-slate-200 flex flex-col items-center">
                    <img src={fixAssetPath(settings.letterheadImages.clinicLogo)} alt="Logo" className="h-8 object-contain mb-1" />
                    <span>Clinic Logo</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200 flex flex-col items-center">
                    <img src={fixAssetPath(settings.letterheadImages.mmcLogo)} alt="MMC" className="h-8 object-contain mb-1" />
                    <span>MMC Logo</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200 flex flex-col items-center">
                    <img src={fixAssetPath(settings.letterheadImages.crestSeal)} alt="Crest" className="h-8 object-contain mb-1" />
                    <span>Crest Seal</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200 flex flex-col items-center">
                    <img src={fixAssetPath(settings.letterheadImages.headerQr)} alt="QR" className="h-8 object-contain mb-1" />
                    <span>Header QR</span>
                  </div>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'signatories' && (
            <div className="space-y-4">
              <p className="text-slate-500">
                These 3 signatories appear in the 3-column signature block at the bottom of every diagnostic report, matching the exact reference layout.
              </p>

              {settings.signatories.map((sig, idx) => (
                <div key={sig.id || idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 uppercase tracking-wide">
                      Column {idx + 1} Signatory
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {sig.id}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">Doctor Name</label>
                      <input
                        type="text"
                        value={sig.name}
                        onChange={(e) => handleSignatoryChange(idx, { name: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">Qualifications / Degree</label>
                      <input
                        type="text"
                        value={sig.qualifications}
                        onChange={(e) => handleSignatoryChange(idx, { qualifications: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 uppercase font-medium"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1">Clinical Designation</label>
                      <input
                        type="text"
                        value={sig.title}
                        onChange={(e) => handleSignatoryChange(idx, { title: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded p-1.5"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                  <h4 className="font-bold text-emerald-900 text-sm">Excel Backend Sync</h4>
                </div>
                <p className="text-emerald-800 text-xs leading-relaxed">
                  Data is automatically mirrored to Excel spreadsheets (.xlsx) in the <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono text-emerald-900 font-semibold">clinic_data/</code> folder on your computer. You can open them directly with Microsoft Excel or WPS Office anytime.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSyncToExcel}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{isSyncing ? 'Syncing...' : 'Sync All Data to Excel Now'}</span>
                  </button>
                  {excelSyncStatus && (
                    <span className="text-xs font-semibold text-emerald-800">{excelSyncStatus}</span>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-slate-800 text-sm">Offline Database Export (JSON)</h4>
                <p className="text-slate-500 text-xs">
                  Export complete clinic database including all patient records, ultrasound findings, diagnostic reports, and settings.
                </p>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Complete Backup (.json)</span>
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-slate-800 text-sm">Restore from Backup File</h4>
                <p className="text-slate-500 text-xs">
                  Upload a previously exported JSON backup file to restore records.
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="block w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
                />
                {importStatus && (
                  <p className="text-xs font-semibold text-emerald-600 mt-2">{importStatus}</p>
                )}
              </div>

              <div className="border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="text-red-600 hover:text-red-700 font-semibold text-xs flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Data to Initial Demo State</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => {
              onSaveSettings(settings);
              onClose();
            }}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
