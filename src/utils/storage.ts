import { ClinicSettings, Patient, Report, ReportTemplate, Snippet, QueueItem, Invoice } from '../types';
import { DEFAULT_CLINIC_SETTINGS } from '../data/seedData';
import { BUILT_IN_TEMPLATES } from '../data/seedTemplates';
import { apiClient } from './apiClient';

const KEYS = {
  SETTINGS: 'afc_clinic_settings_v3',
  PATIENTS: 'afc_patients_v1',
  REPORTS: 'afc_reports_v1',
  TEMPLATES: 'afc_templates_v3',
  SNIPPETS: 'afc_snippets_v1',
  QUEUE: 'afc_queue_v1',
  INVOICES: 'afc_invoices_v1',
  DRAFT: 'afc_current_report_draft_v1',
};

export const Storage = {
  // ─── Settings ──────────────────────────────────────────

  getSettings(): ClinicSettings {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      if (data) {
        const parsed: ClinicSettings = JSON.parse(data);
        // Ensure new official numbers are automatically populated if default was stored
        if (!parsed.whatsapp || parsed.whatsapp === '0332 5828582') {
          parsed.whatsapp = '0300-9178101';
        }
        if (!parsed.phone || parsed.phone === '+92 91 5828581') {
          parsed.phone = '0313-2807035';
        }
        // Update signatories with actual real signature images if they are still using old SVG data or missing
        if (parsed.signatories && Array.isArray(parsed.signatories)) {
          // Remove Dr. Spogmai from default signatories (she belongs strictly to TVS template)
          parsed.signatories = parsed.signatories
            .filter((sig) => !/spogmai/i.test(sig.name) && sig.id !== 'sig_4')
            .map((sig) => {
              if (sig.id === 'sig_1' || /abdus\s*salam/i.test(sig.name)) {
                return { ...sig, signatureImageUrl: 'assets/signatures/sig_abdus_salam.png', active: true };
              }
              if (sig.id === 'sig_2' || /sher\s*wali/i.test(sig.name)) {
                return { ...sig, signatureImageUrl: 'assets/signatures/sig_sher_wali_khan.png', active: true };
              }
              if (sig.id === 'sig_3' || /atta\s*ur\s*rahman/i.test(sig.name)) {
                return { ...sig, signatureImageUrl: 'assets/signatures/sig_atta_ur_rahman.png', active: true };
              }
              return sig;
            });
        }
        // Normalize image paths to relative for both web and electron file:// protocol
        if (parsed.letterheadImages) {
          if (!parsed.letterheadImages.drSpogmaiLogo) {
            parsed.letterheadImages.drSpogmaiLogo = 'assets/logo_dr_spogmai.png';
          }
          (Object.keys(parsed.letterheadImages) as (keyof typeof parsed.letterheadImages)[]).forEach((k) => {
            if (typeof parsed.letterheadImages[k] === 'string' && parsed.letterheadImages[k].startsWith('/')) {
              parsed.letterheadImages[k] = parsed.letterheadImages[k].replace(/^\/+/, '');
            }
          });
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return DEFAULT_CLINIC_SETTINGS;
  },

  saveSettings(settings: ClinicSettings): void {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  // ─── Patients ──────────────────────────────────────────

  getPatients(): Patient[] {
    try {
      const data = localStorage.getItem(KEYS.PATIENTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load patients:', e);
    }
    return [];
  },

  savePatients(patients: Patient[]): void {
    localStorage.setItem(KEYS.PATIENTS, JSON.stringify(patients));
    // Sync to Excel backend
    apiClient.syncPatients(patients);
  },

  addPatient(patient: Patient): void {
    const patients = this.getPatients();
    const updated = [patient, ...patients.filter(p => p.id !== patient.id)];
    localStorage.setItem(KEYS.PATIENTS, JSON.stringify(updated));
    apiClient.addPatient(patient);
  },

  deletePatient(id: string): void {
    const patients = this.getPatients();
    const updated = patients.filter((p) => p.id !== id);
    localStorage.setItem(KEYS.PATIENTS, JSON.stringify(updated));
    apiClient.deletePatient(id);
  },

  // ─── Reports ───────────────────────────────────────────

  getReports(): Report[] {
    try {
      const data = localStorage.getItem(KEYS.REPORTS);
      if (data) {
        const parsed: Report[] = JSON.parse(data);
        return parsed.map((r) => ({
          ...r,
          referringDoctor: r.referringDoctor || 'Dr. Naveed Ahmad Khan',
        }));
      }
    } catch (e) {
      console.error('Failed to load reports:', e);
    }
    return [];
  },

  saveReports(reports: Report[]): void {
    localStorage.setItem(KEYS.REPORTS, JSON.stringify(reports));
    // Sync to Excel backend
    apiClient.syncReports(reports);
  },

  saveReport(report: Report): void {
    const reports = this.getReports();
    const existingIndex = reports.findIndex(r => r.id === report.id);
    let updated: Report[];
    if (existingIndex >= 0) {
      updated = [...reports];
      updated[existingIndex] = report;
    } else {
      updated = [report, ...reports];
    }
    localStorage.setItem(KEYS.REPORTS, JSON.stringify(updated));
    apiClient.saveReport(report);
  },

  deleteReport(id: string): void {
    const reports = this.getReports();
    const updated = reports.filter((r) => r.id !== id);
    localStorage.setItem(KEYS.REPORTS, JSON.stringify(updated));
    apiClient.deleteReport(id);
  },

  // ─── Templates ─────────────────────────────────────────

  getTemplates(): ReportTemplate[] {
    try {
      const data = localStorage.getItem(KEYS.TEMPLATES);
      if (data) {
        const custom: ReportTemplate[] = JSON.parse(data);
        return [...BUILT_IN_TEMPLATES, ...custom];
      }
    } catch (e) {
      console.error('Failed to load custom templates:', e);
    }
    return BUILT_IN_TEMPLATES;
  },

  saveCustomTemplate(template: ReportTemplate): void {
    try {
      const data = localStorage.getItem(KEYS.TEMPLATES);
      const existing: ReportTemplate[] = data ? JSON.parse(data) : [];
      const updated = [template, ...existing.filter(t => t.id !== template.id)];
      localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save template:', e);
    }
  },

  // ─── Snippets ──────────────────────────────────────────

  getSnippets(): Snippet[] {
    try {
      const data = localStorage.getItem(KEYS.SNIPPETS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load snippets:', e);
    }
    return [];
  },

  saveSnippets(snippets: Snippet[]): void {
    localStorage.setItem(KEYS.SNIPPETS, JSON.stringify(snippets));
    // Sync to Excel backend
    apiClient.syncSnippets(snippets);
  },

  // ─── Queue ─────────────────────────────────────────────

  getQueue(): QueueItem[] {
    try {
      const data = localStorage.getItem(KEYS.QUEUE);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load queue:', e);
    }
    return [];
  },

  saveQueue(queue: QueueItem[]): void {
    localStorage.setItem(KEYS.QUEUE, JSON.stringify(queue));
    // Sync to Excel backend
    apiClient.syncQueue(queue);
  },

  deleteQueueItem(id: string): void {
    const queue = this.getQueue();
    const updated = queue.filter((q) => q.id !== id);
    localStorage.setItem(KEYS.QUEUE, JSON.stringify(updated));
    apiClient.deleteQueueItem(id);
  },

  // ─── Invoices ──────────────────────────────────────────

  getInvoices(): Invoice[] {
    try {
      const data = localStorage.getItem(KEYS.INVOICES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load invoices:', e);
    }
    return [];
  },

  saveInvoice(invoice: Invoice): void {
    const invoices = this.getInvoices();
    const existingIndex = invoices.findIndex(i => i.id === invoice.id);
    let updated: Invoice[];
    if (existingIndex >= 0) {
      updated = [...invoices];
      updated[existingIndex] = invoice;
    } else {
      updated = [invoice, ...invoices];
    }
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(updated));
    // Sync to Excel backend
    apiClient.saveInvoice(invoice);
  },

  deleteInvoice(id: string): void {
    const invoices = this.getInvoices();
    const updated = invoices.filter((i) => i.id !== id);
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(updated));
    apiClient.deleteInvoice(id);
  },

  // ─── Drafts ────────────────────────────────────────────

  getDraft(): any | null {
    try {
      const data = localStorage.getItem(KEYS.DRAFT);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveDraft(draft: any): void {
    localStorage.setItem(KEYS.DRAFT, JSON.stringify(draft));
  },

  clearDraft(): void {
    localStorage.removeItem(KEYS.DRAFT);
  },

  // ─── Import / Export ───────────────────────────────────

  exportDatabaseJson(): string {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      patients: this.getPatients(),
      reports: this.getReports(),
      snippets: this.getSnippets(),
      queue: this.getQueue(),
    };
    return JSON.stringify(payload, null, 2);
  },

  importDatabaseJson(jsonString: string): boolean {
    try {
      const payload = JSON.parse(jsonString);
      if (payload.settings) this.saveSettings(payload.settings);
      if (payload.patients) this.savePatients(payload.patients);
      if (payload.reports) this.saveReports(payload.reports);
      if (payload.snippets) this.saveSnippets(payload.snippets);
      if (payload.queue) this.saveQueue(payload.queue);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  },

  /**
   * Pull and restore data from Excel backend if available.
   */
  async pullFromBackend(): Promise<boolean> {
    try {
      const data = await apiClient.fetchExport();
      if (data) {
        if (Array.isArray(data.patients) && data.patients.length > 0) {
          localStorage.setItem(KEYS.PATIENTS, JSON.stringify(data.patients));
        }
        if (Array.isArray(data.reports) && data.reports.length > 0) {
          localStorage.setItem(KEYS.REPORTS, JSON.stringify(data.reports));
        }
        if (Array.isArray(data.queue) && data.queue.length > 0) {
          localStorage.setItem(KEYS.QUEUE, JSON.stringify(data.queue));
        }
        if (Array.isArray(data.snippets) && data.snippets.length > 0) {
          localStorage.setItem(KEYS.SNIPPETS, JSON.stringify(data.snippets));
        }
        if (Array.isArray(data.invoices) && data.invoices.length > 0) {
          localStorage.setItem(KEYS.INVOICES, JSON.stringify(data.invoices));
        }
        return true;
      }
    } catch (e) {
      console.error('Failed to pull from backend:', e);
    }
    return false;
  },

  /**
   * Push ALL current localStorage data to the Excel backend.
   * Call this on app startup or after import to ensure Excel is in sync.
   */
  syncAllToBackend(): void {
    apiClient.syncAll({
      patients: this.getPatients(),
      reports: this.getReports(),
      queue: this.getQueue(),
      snippets: this.getSnippets(),
    });
  },

  resetToFactoryDefaults(): void {
    localStorage.clear();
  },
};
