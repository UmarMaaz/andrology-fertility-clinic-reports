import React, { useState, useEffect } from 'react';
import {
  Patient,
  Report,
  ReportTemplate,
  ClinicSettings,
  Snippet,
  QueueItem,
  UserRole,
  Invoice,
} from './types';
import { Storage } from './utils/storage';
import { apiClient } from './utils/apiClient';
import { BUILT_IN_TEMPLATES } from './data/seedTemplates';
import { Header } from './components/Header';
import { ReportsList } from './components/ReportsList';
import { ReportEditor } from './components/ReportEditor';
import { PatientsManager } from './components/PatientsManager';
import { QueueManager } from './components/QueueManager';
import { BillingManager } from './components/BillingManager';
import { TemplateManager } from './components/TemplateManager';
import { SettingsModal } from './components/SettingsModal';
import { ReferenceComparisonModal } from './components/ReferenceComparisonModal';
import { ReportRenderer } from './components/ReportRenderer';
import { ReceiptPrintView } from './components/ReceiptPrintView';

export default function App() {
  const [settings, setSettings] = useState<ClinicSettings>(Storage.getSettings());
  const [patients, setPatients] = useState<Patient[]>(Storage.getPatients());
  const [reports, setReports] = useState<Report[]>(Storage.getReports());
  const [templates, setTemplates] = useState<ReportTemplate[]>(Storage.getTemplates());
  const [snippets, setSnippets] = useState<Snippet[]>(Storage.getSnippets());
  const [queue, setQueue] = useState<QueueItem[]>(Storage.getQueue());

  const [currentView, setCurrentView] = useState<'reports' | 'editor' | 'patients' | 'queue' | 'billing' | 'templates'>('reports');
  const [selectedReport, setSelectedReport] = useState<Report | null>(reports[0] || null);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('Doctor');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [comparisonReport, setComparisonReport] = useState<Report | null>(null);
  const [printJob, setPrintJob] = useState<
    | { type: 'report'; report: Report; hideHeader?: boolean }
    | { type: 'receipt'; invoice: Invoice }
    | null
  >(null);

  const handlePrintReport = (report: Report, hideHeader: boolean = false) => {
    let reportToPrint = report;
    if (reportToPrint.status === 'Draft') {
      reportToPrint = {
        ...reportToPrint,
        status: 'Completed',
        updatedAt: new Date().toISOString(),
      };
      Storage.saveReport(reportToPrint);
      setReports(Storage.getReports());
    }

    setSelectedReport(reportToPrint);
    setPrintJob({ type: 'report', report: reportToPrint, hideHeader });
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintReceipt = (invoice: Invoice) => {
    setPrintJob({ type: 'receipt', invoice });
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Keyboard shortcuts (Ctrl+P print, Ctrl+S save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        if (currentView === 'editor' && selectedReport) {
          e.preventDefault();
          handlePrintReport(selectedReport);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, selectedReport]);

  // Connect to Excel backend on startup and restore data if local is empty
  useEffect(() => {
    async function syncWithBackend() {
      const isUp = await apiClient.checkHealth();
      if (isUp) {
        const localPatients = Storage.getPatients();
        const localReports = Storage.getReports();
        if (localPatients.length === 0 && localReports.length === 0) {
          const loaded = await Storage.pullFromBackend();
          if (loaded) {
            refreshAllData();
            return;
          }
        }
        Storage.syncAllToBackend();
      }
    }
    syncWithBackend();
  }, []);

  const refreshAllData = () => {
    setSettings(Storage.getSettings());
    setPatients(Storage.getPatients());
    const reloadedReports = Storage.getReports();
    setReports(reloadedReports);
    setTemplates(Storage.getTemplates());
    setSnippets(Storage.getSnippets());
    setQueue(Storage.getQueue());
    if (reloadedReports.length > 0) {
      setSelectedReport(reloadedReports[0]);
    }
  };

  const handleSaveReport = (updated: Report) => {
    Storage.saveReport(updated);
    setReports(Storage.getReports());
    setSelectedReport(updated);
  };

  const handleDeleteReport = (id: string) => {
    Storage.deleteReport(id);
    const updated = Storage.getReports();
    setReports(updated);
    if (selectedReport?.id === id) {
      setSelectedReport(updated[0] || null);
    }
  };

  const handleSaveSettings = (newSettings: ClinicSettings) => {
    Storage.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleAddPatient = (patient: Patient) => {
    Storage.addPatient(patient);
    setPatients(Storage.getPatients());
  };

  const handleDeletePatient = (id: string) => {
    Storage.deletePatient(id);
    setPatients(Storage.getPatients());
  };

  const handleUpdateQueue = (updatedQueue: QueueItem[]) => {
    Storage.saveQueue(updatedQueue);
    setQueue(updatedQueue);
  };

  // Create new report helper
  const handleCreateNewReport = (preselectedPatient?: Patient, preselectedTemplate?: ReportTemplate) => {
    const defaultTemplate = preselectedTemplate || templates[0]; // Scrotal / Varicocele
    const patient = preselectedPatient || patients[0];

    if (!patient) {
      // No patients registered yet — switch to patients view so user can add one first
      setCurrentView('patients');
      return;
    }

    const defaultFindings: Record<string, any> = {};
    defaultTemplate.sections.forEach((sec) => {
      sec.fields.forEach((f) => {
        defaultFindings[f.id] = f.defaultValue;
      });
    });

    const newReportNum = `${settings.reportPrefix}-2026-${String(reports.length + 1051).padStart(4, '0')}`;
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const dateStr = `${day}-${month}-${year}`;

    const newReport: Report = {
      id: `rep_${Date.now()}`,
      reportNumber: newReportNum,
      patientId: patient.id,
      patientSnapshot: patient,
      templateId: defaultTemplate.id,
      templateSnapshot: defaultTemplate,
      date: dateStr,
      referringDoctor: patient.referringDoctor || 'Dr. Naveed Ahmad Khan',
      findings: defaultFindings,
      impression: defaultTemplate.defaultImpression,
      signatories: defaultTemplate.signatories ? [...defaultTemplate.signatories] : undefined,
      status: 'Draft',
      auditLog: [
        {
          timestamp: new Date().toISOString(),
          action: 'Created New Clinical Report',
          user: `${currentUserRole} User`,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    Storage.saveReport(newReport);
    setReports(Storage.getReports());
    setSelectedReport(newReport);
    setCurrentView('editor');
  };

  const handleStartReportingFromQueue = (patientId: string, testName: string) => {
    const patient = patients.find((p) => p.id === patientId) || patients[0];
    const matchedTemplate =
      templates.find((t) => t.name.toLowerCase().includes(testName.toLowerCase())) || templates[0];
    handleCreateNewReport(patient, matchedTemplate);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans text-slate-900 antialiased print-app-root">
      {/* Clinic App Navigation Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUserRole={currentUserRole}
        setCurrentUserRole={setCurrentUserRole}
        settings={settings}
        onOpenSettings={() => setShowSettingsModal(true)}
        onNewReport={() => handleCreateNewReport()}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {currentView === 'reports' && (
          <ReportsList
            reports={reports}
            templates={templates}
            patients={patients}
            settings={settings}
            currentUserRole={currentUserRole}
            searchQuery={searchQuery}
            onSelectReport={(rep) => {
              setSelectedReport(rep);
              setCurrentView('editor');
            }}
            onPrintReport={handlePrintReport}
            onNewReport={() => handleCreateNewReport()}
            onCompareReference={(rep) => setComparisonReport(rep)}
            onDeleteReport={handleDeleteReport}
          />
        )}

        {currentView === 'editor' && selectedReport && (
          <ReportEditor
            report={selectedReport}
            patients={patients}
            templates={templates}
            settings={settings}
            snippets={snippets}
            currentUserRole={currentUserRole}
            onSave={handleSaveReport}
            onBack={() => setCurrentView('reports')}
          />
        )}

        {currentView === 'patients' && (
          <PatientsManager
            patients={patients}
            reports={reports}
            onAddPatient={handleAddPatient}
            onCreateReportForPatient={(pat) => handleCreateNewReport(pat)}
            onOpenReport={(rep) => {
              setSelectedReport(rep);
              setCurrentView('editor');
            }}
            onPrintReport={handlePrintReport}
            onDeletePatient={handleDeletePatient}
          />

        )}

        {currentView === 'queue' && (
          <QueueManager
            queue={queue}
            patients={patients}
            templates={templates}
            onUpdateQueue={handleUpdateQueue}
            onStartReporting={handleStartReportingFromQueue}
          />
        )}

        {currentView === 'billing' && (
          <BillingManager
            patients={patients}
            settings={settings}
            onPrintInvoice={handlePrintReceipt}
          />
        )}

        {currentView === 'templates' && (
          <TemplateManager
            templates={templates}
            currentUserRole={currentUserRole}
            onSelectTemplateForNewReport={(tpl) => handleCreateNewReport(undefined, tpl)}
          />
        )}
      </main>

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onSaveSettings={handleSaveSettings}
          onClose={() => setShowSettingsModal(false)}
          onRefreshData={refreshAllData}
        />
      )}

      {/* Reference Comparison Modal */}
      {comparisonReport && (
        <ReferenceComparisonModal
          report={comparisonReport}
          settings={settings}
          onClose={() => setComparisonReport(null)}
        />
      )}

      {/* Dedicated Print Engine for Window.print() */}
      <div className="print-only hidden">
        {printJob?.type === 'receipt' ? (
          <ReceiptPrintView
            invoice={printJob.invoice}
            settings={settings}
            patient={patients.find((p) => p.id === printJob.invoice.patientId)}
          />
        ) : (
          (printJob?.type === 'report' ? printJob.report : selectedReport) && (
            <ReportRenderer
              report={printJob?.type === 'report' ? printJob.report : selectedReport!}
              settings={settings}
              isPrintView={true}
              hideLetterhead={printJob?.type === 'report' ? printJob.hideHeader : false}
            />
          )
        )}
      </div>
    </div>
  );
}

