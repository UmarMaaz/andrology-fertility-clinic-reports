import React, { useState, useEffect, useRef } from 'react';
import { Report, Patient, ReportTemplate, ClinicSettings, Snippet, ReportStatus, UserRole, Signatory, ReportTheme } from '../types';
import { ReportRenderer } from './ReportRenderer';
import { DynamicForm } from './DynamicForm';
import { ReferenceComparisonModal } from './ReferenceComparisonModal';
import {
  Printer,
  FileDown,
  CheckCircle,
  Eye,
  Sliders,
  RotateCcw,
  Save,
  Share2,
  Lock,
  FileCheck,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Calendar,
  User,
  Activity,
  Layers,
  ArrowLeft,
  Palette,
  Check,
  X,
} from 'lucide-react';

interface ReportEditorProps {
  report: Report;
  patients: Patient[];
  templates: ReportTemplate[];
  settings: ClinicSettings;
  snippets: Snippet[];
  currentUserRole: UserRole;
  onSave: (updatedReport: Report) => void;
  onBack: () => void;
}

export const ReportEditor: React.FC<ReportEditorProps> = ({
  report: initialReport,
  patients,
  templates,
  settings,
  snippets,
  currentUserRole,
  onSave,
  onBack,
}) => {
  const [report, setReport] = useState<Report>(initialReport);
  const [hideLetterhead, setHideLetterhead] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(0.92);
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');

  // Maintain latest report ref to ensure synchronous access during save/print
  const reportRef = useRef<Report>(report);
  useEffect(() => {
    reportRef.current = report;
  }, [report]);

  // Keep local report updated when prop changes
  useEffect(() => {
    setReport(initialReport);
    reportRef.current = initialReport;
    setSaveStatus('saved');
  }, [initialReport.id]);

  // Handle template change
  const handleTemplateChange = (newTemplateId: string) => {
    const selectedTemplate = templates.find((t) => t.id === newTemplateId);
    if (!selectedTemplate) return;

    // Build default findings from selected template
    const defaultFindings: Record<string, any> = {};
    selectedTemplate.sections.forEach((sec) => {
      sec.fields.forEach((f) => {
        defaultFindings[f.id] = f.defaultValue;
      });
    });

    setReport((prev) => ({
      ...prev,
      templateId: selectedTemplate.id,
      templateSnapshot: selectedTemplate,
      findings: defaultFindings,
      impression: selectedTemplate.defaultImpression,
      signatories: selectedTemplate.signatories ? [...selectedTemplate.signatories] : undefined,
      updatedAt: new Date().toISOString(),
    }));
    setSaveStatus('dirty');
  };

  // Handle patient change
  const handlePatientChange = (patientId: string) => {
    const pat = patients.find((p) => p.id === patientId);
    if (!pat) return;

    setReport((prev) => ({
      ...prev,
      patientId: pat.id,
      patientSnapshot: pat,
      referringDoctor: prev.referringDoctor || pat.referringDoctor || 'Dr. Naveed Ahmad Khan',
      updatedAt: new Date().toISOString(),
    }));
    setSaveStatus('dirty');
  };

  // Findings update
  const handleFindingsChange = (newFindings: Record<string, any>) => {
    setReport((prev) => ({
      ...prev,
      findings: newFindings,
      updatedAt: new Date().toISOString(),
    }));
    setSaveStatus('dirty');
  };

  // Custom Statuses update (e.g. Normal -> Abnormal, Borderline, etc.)
  const handleCustomStatusesChange = (newStatuses: Record<string, string>) => {
    setReport((prev) => ({
      ...prev,
      customStatuses: newStatuses,
      updatedAt: new Date().toISOString(),
    }));
    setSaveStatus('dirty');
  };

  // Impression update
  const handleImpressionChange = (newImpression: string) => {
    setReport((prev) => ({
      ...prev,
      impression: newImpression,
      updatedAt: new Date().toISOString(),
    }));
    setSaveStatus('dirty');
  };

  // Impression Status update (Normal vs Abnormal badge)
  const handleImpressionStatusChange = (newStatus: string) => {
    setReport((prev) => ({
      ...prev,
      impressionStatus: newStatus,
      updatedAt: new Date().toISOString(),
    }));
    setSaveStatus('dirty');
  };

  // Theme Colors update
  const handleColorThemeChange = (patch: Partial<ReportTheme>) => {
    setReport((prev) => ({
      ...prev,
      customColors: {
        ...(prev.customColors || {}),
        ...patch,
      },
      updatedAt: new Date().toISOString(),
    }));
    setSaveStatus('dirty');
  };

  // Handle template structure modifications (custom fields, new sections, reordering)
  const handleTemplateStructureChange = (
    updatedTemplate: ReportTemplate,
    updatedFindings?: Record<string, any>
  ) => {
    setReport((prev) => ({
      ...prev,
      templateSnapshot: updatedTemplate,
      findings: updatedFindings !== undefined ? updatedFindings : prev.findings,
      updatedAt: new Date().toISOString(),
    }));
    setSaveStatus('dirty');
  };

  // Handle custom doctor signatories for this report
  const handleSignatoriesChange = (updatedSignatories: Signatory[]) => {
    setReport((prev) => ({
      ...prev,
      signatories: updatedSignatories,
      updatedAt: new Date().toISOString(),
    }));
    setSaveStatus('dirty');
  };

  // Reset all fields to normal
  const handleResetAllNormal = () => {
    setReport((prev) => {
      const defaultFindings: Record<string, any> = {};
      prev.templateSnapshot.sections.forEach((sec) => {
        sec.fields.forEach((f) => {
          defaultFindings[f.id] = f.defaultValue;
        });
      });

      return {
        ...prev,
        findings: defaultFindings,
        customStatuses: {},
        impressionStatus: 'Normal',
        impression: prev.templateSnapshot.defaultImpression,
        updatedAt: new Date().toISOString(),
      };
    });
    setSaveStatus('dirty');
  };

  // Save changes
  const handleManualSave = () => {
    setSaveStatus('saving');
    onSave(reportRef.current);
    setTimeout(() => {
      setSaveStatus('saved');
    }, 400);
  };

  // Status transition
  const handleStatusChange = (newStatus: ReportStatus) => {
    const userTitle =
      currentUserRole === 'Doctor'
        ? `${settings.signatories[0]?.name || 'Dr. Abdus salam'}`
        : currentUserRole === 'Radiology Technologist'
        ? 'Radiology Technologist'
        : `${currentUserRole} Staff`;

    const updated: Report = {
      ...reportRef.current,
      status: newStatus,
      verifiedBy: newStatus === 'Verified' ? userTitle : reportRef.current.verifiedBy,
      verifiedAt: newStatus === 'Verified' ? new Date().toISOString() : reportRef.current.verifiedAt,
      auditLog: [
        ...reportRef.current.auditLog,
        {
          timestamp: new Date().toISOString(),
          action: `Status changed to ${newStatus}`,
          user: userTitle,
        },
      ],
      updatedAt: new Date().toISOString(),
    };
    setReport(updated);
    onSave(updated);
  };

  // One-click print: auto marks as Completed if currently Draft, uses native print directly in Electron
  const handlePrint = async () => {
    let reportToPrint = reportRef.current;

    // If report is in Draft status, automatically advance it to Completed upon printing
    if (reportToPrint.status === 'Draft') {
      const updated: Report = {
        ...reportToPrint,
        status: 'Completed',
        auditLog: [
          ...reportToPrint.auditLog,
          {
            timestamp: new Date().toISOString(),
            action: 'Report printed (Status auto-completed)',
            user: `${currentUserRole} User`,
          },
        ],
        updatedAt: new Date().toISOString(),
      };
      setReport(updated);
      reportRef.current = updated;
      reportToPrint = updated;
    }

    onSave(reportToPrint);

    // If running in desktop app via Electron bridge
    if ((window as any).electronAPI?.printReport) {
      try {
        await (window as any).electronAPI.printReport({
          silent: false,
          printBackground: true,
        });
        return;
      } catch (err) {
        console.error('Electron native print error:', err);
      }
    }

    // Standard fallback
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* TOP COMMAND BAR */}
      <header className="no-print bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
            title="Return to reports list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                {report.reportNumber}
              </h1>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  report.status === 'Verified'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : report.status === 'Completed'
                    ? 'bg-sky-100 text-sky-800 border border-sky-300'
                    : report.status === 'Delivered'
                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {report.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Patient: <strong className="text-slate-800">{report.patientSnapshot.name}</strong> ({report.patientSnapshot.age}y, {report.patientSnapshot.sex}) • Date: {report.date}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Color & Theme Customizer Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              title="Customize Heading and Status Colors"
            >
              <Palette className="w-3.5 h-3.5 text-sky-600" />
              <span>Change Colors</span>
            </button>

            {showColorPicker && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl z-40 p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-sky-600" /> Report Color Palette
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowColorPicker(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Section Headings Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={report.customColors?.headerColor || '#14565C'}
                        onChange={(e) => handleColorThemeChange({ headerColor: e.target.value })}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={report.customColors?.headerColor || '#14565C'}
                        onChange={(e) => handleColorThemeChange({ headerColor: e.target.value })}
                        className="flex-1 bg-slate-50 border border-slate-300 rounded px-2 py-1 font-mono text-xs uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Normal Status Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={report.customColors?.normalColor || '#14565C'}
                        onChange={(e) => handleColorThemeChange({ normalColor: e.target.value })}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={report.customColors?.normalColor || '#14565C'}
                        onChange={(e) => handleColorThemeChange({ normalColor: e.target.value })}
                        className="flex-1 bg-slate-50 border border-slate-300 rounded px-2 py-1 font-mono text-xs uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Abnormal Status Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={report.customColors?.abnormalColor || '#C0303B'}
                        onChange={(e) => handleColorThemeChange({ abnormalColor: e.target.value })}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={report.customColors?.abnormalColor || '#C0303B'}
                        onChange={(e) => handleColorThemeChange({ abnormalColor: e.target.value })}
                        className="flex-1 bg-slate-50 border border-slate-300 rounded px-2 py-1 font-mono text-xs uppercase"
                      />
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() =>
                        handleColorThemeChange({
                          headerColor: '#14565C',
                          normalColor: '#14565C',
                          abnormalColor: '#C0303B',
                          primaryColor: '#14565C',
                        })
                      }
                      className="text-[11px] text-sky-700 hover:underline font-semibold"
                    >
                      Reset Defaults
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(false)}
                      className="px-3 py-1 bg-sky-600 text-white rounded text-xs font-bold"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Compare with Word Template Scan button */}
          <button
            type="button"
            onClick={() => setShowComparison(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
            title="Inspect side-by-side with original clinic scanned Word template"
          >
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>Verify vs Word Scan</span>
          </button>

          {/* Toggle Pre-printed Letterhead Paper */}
          <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hideLetterhead}
              onChange={(e) => setHideLetterhead(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500"
            />
            <span>Pre-printed Stationery</span>
          </label>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleManualSave}
            disabled={saveStatus === 'saved'}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
              saveStatus === 'saved'
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-default'
                : 'bg-slate-800 hover:bg-slate-900 text-white'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}</span>
          </button>

          {/* Verification / Doctor Signoff */}
          {report.status !== 'Verified' && (
            <button
              type="button"
              onClick={() => handleStatusChange('Verified')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Verify &amp; Sign</span>
            </button>
          )}

          {/* Print Report */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report (Ctrl+P)</span>
          </button>
        </div>
      </header>

      {/* WORKSPACE: DUAL PANE (Left: Entry Form, Right: Live Letterhead Preview) */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT COLUMN: Clean Clinical Entry Form */}
        <div className="no-print lg:col-span-6 xl:col-span-5 border-r border-slate-200 bg-white overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Patient & Template Header Selector */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Template Select */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Report Template
                </label>
                <select
                  value={report.templateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-sky-500"
                >
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Patient Select */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Assigned Patient
                </label>
                <select
                  value={report.patientId}
                  onChange={(e) => handlePatientChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-semibold text-slate-900 focus:ring-1 focus:ring-sky-500"
                >
                  {patients.map((pat) => (
                    <option key={pat.id} value={pat.id}>
                      {pat.name} ({pat.age}y, {pat.mrn})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Referred by & Date Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-200/80">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                  Referred by Consultant:
                </label>
                <input
                  type="text"
                  value={report.referringDoctor || 'Dr. Naveed Ahmad Khan'}
                  onChange={(e) => {
                    setReport({ ...report, referringDoctor: e.target.value, updatedAt: new Date().toISOString() });
                    setSaveStatus('dirty');
                  }}
                  placeholder="e.g. Dr. Naveed Ahmad Khan"
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-medium text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                  Examination Date:
                </label>
                <input
                  type="text"
                  value={report.date}
                  onChange={(e) => {
                    setReport({ ...report, date: e.target.value, updatedAt: new Date().toISOString() });
                    setSaveStatus('dirty');
                  }}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono text-slate-900 text-xs text-center"
                />
              </div>
            </div>
          </div>

          {/* Patient Bio-Data Summary Card */}
          {(() => {
            const ps = report.patientSnapshot;
            return (
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">CNIC No.</span>
                    <span className="font-semibold text-slate-800">{ps.cnic || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact</span>
                    <span className="font-semibold text-slate-800">{ps.phone || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">MRN</span>
                    <span className="font-semibold text-slate-800 font-mono">{ps.mrn || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Age / Sex</span>
                    <span className="font-semibold text-slate-800">{ps.age} Y / {ps.sex}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* DYNAMIC FORM */}
          <DynamicForm
            template={report.templateSnapshot}
            findings={report.findings}
            customStatuses={report.customStatuses}
            impression={report.impression}
            impressionStatus={report.impressionStatus}
            snippets={snippets}
            signatories={report.signatories && report.signatories.length > 0 ? report.signatories : settings.signatories}
            onFindingsChange={handleFindingsChange}
            onCustomStatusesChange={handleCustomStatusesChange}
            onImpressionChange={handleImpressionChange}
            onImpressionStatusChange={handleImpressionStatusChange}
            onResetAllNormal={handleResetAllNormal}
            onTemplateChange={handleTemplateStructureChange}
            onSignatoriesChange={handleSignatoriesChange}
          />
        </div>

        {/* RIGHT COLUMN: Live Vector Letterhead Preview */}
        <div className="lg:col-span-6 xl:col-span-7 bg-slate-200/80 overflow-y-auto p-4 sm:p-6 flex flex-col items-center">
          {/* Preview Controls Bar */}
          <div className="no-print w-full max-w-[8.5in] mb-3 flex items-center justify-between bg-white/90 backdrop-blur-sm border border-slate-300/80 px-3 py-1.5 rounded-xl shadow-xs text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-sky-600" />
              Live US Letter (8.5 × 11 in) Preview
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomScale(Math.max(0.6, zoomScale - 0.08))}
                className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-slate-600 w-12 text-center">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomScale(Math.min(1.2, zoomScale + 0.08))}
                className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setZoomScale(0.92)}
                className="ml-1 text-[11px] text-sky-700 hover:underline font-semibold cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Rendered Live Report */}
          <div className="no-print shadow-2xl border border-slate-300 rounded bg-white overflow-hidden transition-transform">
            <ReportRenderer
              report={report}
              settings={settings}
              hideLetterhead={hideLetterhead}
              scale={zoomScale}
            />
          </div>
        </div>
      </div>

      {/* Side-by-side Reference Comparison Modal */}
      {showComparison && (
        <ReferenceComparisonModal
          report={report}
          settings={settings}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
};
