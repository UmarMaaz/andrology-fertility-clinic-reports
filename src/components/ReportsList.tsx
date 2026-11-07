import React, { useState } from 'react';
import { Report, ReportTemplate, Patient, ClinicSettings, ReportStatus, UserRole } from '../types';
import {
  FileText,
  Printer,
  Edit3,
  CheckCircle,
  Clock,
  Filter,
  Plus,
  Search,
  Eye,
  Layers,
  Sparkles,
  Calendar,
  User,
  Activity,
  FileCheck,
  Trash2,
} from 'lucide-react';

interface ReportsListProps {
  reports: Report[];
  templates: ReportTemplate[];
  patients: Patient[];
  settings: ClinicSettings;
  currentUserRole: UserRole;
  searchQuery: string;
  onSelectReport: (report: Report) => void;
  onPrintReport?: (report: Report) => void;
  onNewReport: () => void;
  onCompareReference: (report: Report) => void;
  onDeleteReport?: (id: string) => void;
}


export const ReportsList: React.FC<ReportsListProps> = ({
  reports,
  templates,
  patients,
  settings,
  currentUserRole,
  searchQuery,
  onSelectReport,
  onPrintReport,
  onNewReport,
  onCompareReference,
  onDeleteReport,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter reports
  const filteredReports = reports.filter((rep) => {
    // Status filter
    if (selectedStatus !== 'all' && rep.status !== selectedStatus) return false;

    // Category filter
    if (selectedCategory !== 'all' && rep.templateSnapshot.category !== selectedCategory) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = rep.patientSnapshot.name.toLowerCase().includes(q);
      const matchNumber = rep.reportNumber.toLowerCase().includes(q);
      const matchMrn = rep.patientSnapshot.mrn.toLowerCase().includes(q);
      const matchTemplate = rep.templateSnapshot.name.toLowerCase().includes(q);
      const matchImpression = rep.impression.toLowerCase().includes(q);
      if (!matchName && !matchNumber && !matchMrn && !matchTemplate && !matchImpression) {
        return false;
      }
    }

    return true;
  });

  // Calculate stats
  const totalCount = reports.length;
  const verifiedCount = reports.filter((r) => r.status === 'Verified').length;
  const pendingCount = reports.filter((r) => r.status === 'Draft' || r.status === 'Completed').length;
  const scrotalCount = reports.filter((r) => r.templateId === 'scrotal_varicocele').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Total Clinical Reports
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{totalCount}</span>
            <FileText className="w-5 h-5 text-sky-500" />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Stored in local database</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Verified &amp; Signed
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600">{verifiedCount}</span>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Ready for patient delivery</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Awaiting Verification
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600">{pendingCount}</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-[11px] text-amber-600 font-medium mt-1 block">Draft or technician findings</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Scrotal &amp; Varicocele US
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-600">{scrotalCount}</span>
            <Activity className="w-5 h-5 text-indigo-500" />
          </div>
          <span className="text-[11px] text-indigo-600 font-medium mt-1 block">Exact Word layout match</span>
        </div>
      </div>

      {/* Filter and Tab Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto text-xs font-semibold">
          {['all', 'Verified', 'Completed', 'Draft', 'Delivered'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                selectedStatus === st
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {st === 'all' ? 'All Reports' : st}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">All Categories</option>
            <option value="Ultrasound">Ultrasound</option>
            <option value="Andrology & Fertility">Andrology &amp; Fertility</option>
            <option value="General Lab">General Lab</option>
            <option value="Specialized">Specialized</option>
          </select>

          <button
            type="button"
            onClick={onNewReport}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Report</span>
          </button>
        </div>
      </div>

      {/* Reports Table / Card List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No reports found matching your criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create a new report or adjust your search filter keywords.
            </p>
            <button
              type="button"
              onClick={onNewReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Report</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredReports.map((rep) => {
              const isReferenceReport = rep.id === 'rep_ahmad_scrotal';

              return (
                <div
                  key={rep.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors ${
                    isReferenceReport ? 'bg-amber-50/20' : ''
                  }`}
                >
                  {/* Left: Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-extrabold text-slate-900 tracking-tight">
                        {rep.reportNumber}
                      </span>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          rep.status === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rep.status === 'Completed'
                            ? 'bg-sky-100 text-sky-800'
                            : rep.status === 'Delivered'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rep.status}
                      </span>

                      {isReferenceReport && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                          <Layers className="w-3 h-3 text-amber-600" /> Reference Sample Match
                        </span>
                      )}

                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 font-medium">Date: {rep.date}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {rep.patientSnapshot.name} ({rep.patientSnapshot.age} yrs, {rep.patientSnapshot.sex})
                      </span>
                      <span>MRN: <code className="font-mono text-slate-700">{rep.patientSnapshot.mrn}</code></span>
                      <span className="text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                        {rep.templateSnapshot.name}
                      </span>
                    </div>

                    {/* Impression Preview */}
                    <p className="text-xs text-slate-600 line-clamp-1 italic font-serif">
                      <strong className="not-italic text-slate-700 font-bold font-sans">Impression: </strong>
                      {rep.impression}
                    </p>

                    {rep.verifiedBy && (
                      <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Signed &amp; Verified by: {rep.verifiedBy}
                      </p>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
                    {/* Compare with reference button */}
                    <button
                      type="button"
                      onClick={() => onCompareReference(rep)}
                      className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Compare layout side-by-side with original scanned Word template"
                    >
                      <Layers className="w-3.5 h-3.5 text-amber-600" />
                      <span className="hidden md:inline">Compare Scan</span>
                    </button>

                    {/* Direct 1-Click Print Button (crucial for Receptionist & quick handover) */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onPrintReport) {
                          onPrintReport(rep);
                        } else {
                          onSelectReport(rep);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer ${
                        currentUserRole === 'Receptionist'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-slate-800 hover:bg-slate-900 text-white'
                      }`}
                      title="Print this official report directly (US Letter)"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Report</span>
                    </button>

                    {/* Open & Edit */}
                    <button
                      type="button"
                      onClick={() => onSelectReport(rep)}
                      className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{currentUserRole === 'Receptionist' ? 'View / Details' : 'Edit & Print'}</span>
                    </button>

                    {/* Delete Report */}
                    {onDeleteReport && (
                      <button
                        type="button"
                        onClick={() => {
                          const confirmMsg = `Are you sure you want to delete report ${rep.reportNumber} for ${rep.patientSnapshot.name}?\nThis action cannot be undone.`;
                          if (window.confirm(confirmMsg)) {
                            onDeleteReport(rep.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete this report permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
