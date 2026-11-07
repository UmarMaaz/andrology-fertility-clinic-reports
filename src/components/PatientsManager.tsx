import React, { useState } from 'react';
import { Patient, Report, Sex } from '../types';
import { calculateAgeFromDob } from '../utils/calculations';
import { Users, UserPlus, Search, Phone, Calendar, MapPin, FileText, ChevronRight, X, Plus, Printer, Trash2 } from 'lucide-react';

interface PatientsManagerProps {
  patients: Patient[];
  reports: Report[];
  onAddPatient: (newPatient: Patient) => void;
  onCreateReportForPatient: (patient: Patient) => void;
  onOpenReport: (report: Report) => void;
  onPrintReport?: (report: Report) => void;
  onDeletePatient?: (id: string) => void;
}


export const PatientsManager: React.FC<PatientsManagerProps> = ({
  patients,
  reports,
  onAddPatient,
  onCreateReportForPatient,
  onOpenReport,
  onPrintReport,
  onDeletePatient,
}) => {

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatientHistory, setSelectedPatientHistory] = useState<Patient | null>(null);

  // New patient form state
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    age: 30,
    sex: 'male' as Sex,
    phone: '',
    cnic: '',
    address: '',
    referringDoctor: 'Dr. Naveed Ahmad Khan',
  });

  const handleDobChange = (dobStr: string) => {
    const age = calculateAgeFromDob(dobStr);
    setFormData((prev) => ({
      ...prev,
      dob: dobStr,
      age: age || prev.age,
    }));
  };

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newPatient: Patient = {
      id: `pat_${Date.now()}`,
      mrn: `P-2026-${String(patients.length + 46).padStart(4, '0')}`,
      name: formData.name.trim(),
      age: Number(formData.age) || 30,
      dob: formData.dob || undefined,
      sex: formData.sex,
      phone: formData.phone.trim() || '—',
      cnic: formData.cnic.trim() || undefined,
      address: formData.address.trim() || undefined,
      referringDoctor: formData.referringDoctor.trim() || 'Dr. Naveed Ahmad Khan',
      createdAt: new Date().toISOString(),
    };

    onAddPatient(newPatient);
    setShowAddModal(false);
    setFormData({
      name: '',
      dob: '',
      age: 30,
      sex: 'male',
      phone: '',
      cnic: '',
      address: '',
      referringDoctor: 'Dr. Naveed Ahmad Khan',
    });
  };

  const filteredPatients = patients.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      p.phone.toLowerCase().includes(q) ||
      (p.cnic && p.cnic.toLowerCase().includes(q))
    );
  });

  const patientReports = selectedPatientHistory
    ? reports.filter((r) => r.patientId === selectedPatientHistory.id)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-600" />
            Patient Directory &amp; History
          </h2>
          <p className="text-xs text-slate-500">
            Registered clinical diagnostic patients ({patients.length} records)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, MRN, phone, CNIC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 w-64"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Patient</span>
          </button>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-5 py-3">MRN / ID</th>
              <th className="px-5 py-3">Patient Name</th>
              <th className="px-5 py-3">Age / Sex</th>
              <th className="px-5 py-3">Phone &amp; CNIC</th>
              <th className="px-5 py-3">Referring Doctor</th>
              <th className="px-5 py-3">Past Reports</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {filteredPatients.map((pat) => {
              const repCount = reports.filter((r) => r.patientId === pat.id).length;

              return (
                <tr key={pat.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-sky-700">{pat.mrn}</td>
                  <td className="px-5 py-3.5 font-bold text-slate-900">{pat.name}</td>
                  <td className="px-5 py-3.5 capitalize">
                    {pat.age} yrs • {pat.sex}
                  </td>
                  <td className="px-5 py-3.5 space-y-0.5">
                    <div>{pat.phone}</div>
                    {pat.cnic && <div className="text-[10px] text-slate-400 font-mono">{pat.cnic}</div>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{pat.referringDoctor || 'Self'}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
                      {repCount} {repCount === 1 ? 'Report' : 'Reports'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setSelectedPatientHistory(pat)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px] cursor-pointer"
                    >
                      History
                    </button>
                    <button
                      type="button"
                      onClick={() => onCreateReportForPatient(pat)}
                      className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded font-bold text-[11px] cursor-pointer"
                    >
                      + New Report
                    </button>
                    {onDeletePatient && (
                      <button
                        type="button"
                        onClick={() => {
                          const msg = `Are you sure you want to delete patient ${pat.name} (${pat.mrn})?\nThis action cannot be undone.`;
                          if (window.confirm(msg)) {
                            onDeletePatient(pat.id);
                          }
                        }}
                        className="p-1 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer inline-flex items-center align-middle"
                        title="Delete patient permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Register Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-sky-600" />
                Register Diagnostic Patient
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ahmad"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Age (Years) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">DOB (Optional)</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleDobChange(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sex</label>
                  <select
                    value={formData.sex}
                    onChange={(e) => setFormData({ ...formData, sex: e.target.value as Sex })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-sky-500 font-medium"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="0300-1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">CNIC (National ID)</label>
                  <input
                    type="text"
                    placeholder="17301-XXXXXXX-X"
                    value={formData.cnic}
                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Referring Consultant / Doctor</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Sher Wali Khan / Self"
                  value={formData.referringDoctor}
                  onChange={(e) => setFormData({ ...formData, referringDoctor: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">City / Address</label>
                <input
                  type="text"
                  placeholder="e.g. Peshawar, KP"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Save &amp; Register Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient History Drawer */}
      {selectedPatientHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-sky-700 uppercase font-mono tracking-wider">
                  {selectedPatientHistory.mrn}
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  {selectedPatientHistory.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedPatientHistory.age} years • {selectedPatientHistory.sex} • {selectedPatientHistory.phone}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPatientHistory(null)}
                className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Historical Ultrasound &amp; Diagnostic Reports ({patientReports.length})
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    onCreateReportForPatient(selectedPatientHistory);
                    setSelectedPatientHistory(null);
                  }}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> New Report
                </button>
              </div>

              {patientReports.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-semibold">No past reports recorded for this patient.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patientReports.map((r) => (
                    <div
                      key={r.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2 hover:border-sky-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900">{r.reportNumber}</span>
                        <span className="text-[10px] font-semibold text-slate-500">Date: {r.date}</span>
                      </div>
                      <p className="text-xs font-bold text-sky-800">{r.templateSnapshot.name}</p>
                      <p className="text-xs text-slate-600 italic">Impression: {r.impression}</p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-emerald-700 font-medium">Status: {r.status}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (onPrintReport) {
                                onPrintReport(r);
                              } else {
                                onOpenReport(r);
                              }
                              setSelectedPatientHistory(null);
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                            title="Directly print this report"
                          >
                            <Printer className="w-3 h-3" /> Print
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onOpenReport(r);
                              setSelectedPatientHistory(null);
                            }}
                            className="text-xs font-bold text-sky-600 hover:underline cursor-pointer"
                          >
                            Open &amp; Edit &rarr;
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
