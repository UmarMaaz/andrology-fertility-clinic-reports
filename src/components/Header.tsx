import React from 'react';
import { UserRole, ClinicSettings } from '../types';
import { fixAssetPath } from '../utils/assetPath';
import {
  FileText,
  Users,
  Clock,
  Receipt,
  Settings as SettingsIcon,
  PlusCircle,
  ShieldAlert,
  Search,
  Sparkles,
  Printer,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  currentView: 'reports' | 'editor' | 'patients' | 'queue' | 'billing' | 'templates';
  setCurrentView: (view: 'reports' | 'editor' | 'patients' | 'queue' | 'billing' | 'templates') => void;
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  settings: ClinicSettings;
  onOpenSettings: () => void;
  onNewReport: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  currentUserRole,
  setCurrentUserRole,
  settings,
  onOpenSettings,
  onNewReport,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner with Clinic Identity & Global Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Clinic Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-sky-50 border border-sky-200 p-1 flex items-center justify-center overflow-hidden">
            <img
              src={fixAssetPath(settings.letterheadImages.clinicLogo)}
              alt="Logo"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-slate-900 tracking-tight">
                {settings.clinicName}
              </span>
              <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Ultrasound &amp; Diagnostic Reporting
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">{settings.tagline}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-2 hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search reports by Patient Name, MRN, Report #, or Test..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-sky-500 rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 transition-colors focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* User Role Switcher & New Report Action */}
        <div className="flex items-center gap-2.5">
          {/* Role selector dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Role:</span>
            <select
              value={currentUserRole}
              onChange={(e) => setCurrentUserRole(e.target.value as UserRole)}
              className="bg-transparent font-bold text-slate-800 cursor-pointer focus:outline-none text-xs"
            >
              <option value="Admin">Admin</option>
              <option value="Doctor">Doctor / Radiologist</option>
              <option value="Radiology Technologist">Radiology Technologist</option>
              <option value="Technician">Technician / Sonographer</option>
              <option value="Receptionist">Receptionist</option>
            </select>
          </div>

          {/* New Report Button */}
          <button
            type="button"
            onClick={onNewReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Report</span>
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
            title="Clinic settings & templates"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto py-1">
          <button
            type="button"
            onClick={() => setCurrentView('reports')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              currentView === 'reports'
                ? 'bg-sky-50 text-sky-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Reports &amp; Archives</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('patients')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              currentView === 'patients'
                ? 'bg-sky-50 text-sky-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Patients Directory</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('queue')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              currentView === 'queue'
                ? 'bg-sky-50 text-sky-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Patient Queue</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('billing')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              currentView === 'billing'
                ? 'bg-sky-50 text-sky-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Billing &amp; Receipts</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('templates')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              currentView === 'templates'
                ? 'bg-sky-50 text-sky-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>22 Diagnostic Templates</span>
          </button>
        </div>
      </div>
    </header>
  );
};
