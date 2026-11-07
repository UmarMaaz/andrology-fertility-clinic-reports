/**
 * API Client for the Excel backend.
 *
 * Handles all communication with the Express server.
 * Designed to work as a "fire-and-forget" sync layer —
 * localStorage remains the source of truth for the UI,
 * while the backend persists everything to Excel files.
 */

const API_BASE = 'http://localhost:3001/api';

/** How long to wait before retrying a failed sync (ms) */
const RETRY_DELAY = 2000;
const MAX_RETRIES = 2;

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private isServerAvailable = true;
  private pendingSyncs: Array<() => Promise<void>> = [];
  private isFlushing = false;

  /**
   * Core fetch wrapper with error handling and retries.
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = MAX_RETRIES
  ): Promise<ApiResponse<T>> {
    if (!this.isServerAvailable) {
      // Silently skip if server was detected as down
      return { success: false, error: 'Server unavailable' };
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorBody.error || `HTTP ${response.status}`,
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (err) {
      // Network error — server might be down
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY));
        return this.request<T>(endpoint, options, retries - 1);
      }

      console.warn(`[API] Server unreachable: ${endpoint}`, err);
      this.isServerAvailable = false;

      // Try to reconnect after 30s
      setTimeout(() => {
        this.checkHealth();
      }, 30000);

      return { success: false, error: 'Network error' };
    }
  }

  /**
   * Check if the backend server is running.
   */
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/sync/health`, {
        signal: AbortSignal.timeout(3000),
      });
      this.isServerAvailable = res.ok;
      if (res.ok) {
        console.log('[API] Backend server connected ✓');
        this.flushPendingSyncs();
      }
      return res.ok;
    } catch {
      this.isServerAvailable = false;
      return false;
    }
  }

  // ─── Patients ────────────────────────────────────────

  async syncPatients(patients: unknown[]): Promise<void> {
    this.enqueueSync(async () => {
      await this.request('/patients/sync', {
        method: 'POST',
        body: JSON.stringify(patients),
      });
    });
  }

  async addPatient(patient: unknown): Promise<void> {
    this.enqueueSync(async () => {
      await this.request('/patients', {
        method: 'POST',
        body: JSON.stringify(patient),
      });
    });
  }

  async deletePatient(id: string): Promise<void> {
    this.enqueueSync(async () => {
      await this.request(`/patients/${id}`, { method: 'DELETE' });
    });
  }

  // ─── Reports ─────────────────────────────────────────

  async syncReports(reports: unknown[]): Promise<void> {
    this.enqueueSync(async () => {
      await this.request('/reports/sync', {
        method: 'POST',
        body: JSON.stringify(reports),
      });
    });
  }

  async saveReport(report: unknown): Promise<void> {
    this.enqueueSync(async () => {
      await this.request('/reports', {
        method: 'POST',
        body: JSON.stringify(report),
      });
    });
  }

  async deleteReport(id: string): Promise<void> {
    this.enqueueSync(async () => {
      await this.request(`/reports/${id}`, { method: 'DELETE' });
    });
  }

  // ─── Queue ───────────────────────────────────────────

  async deleteQueueItem(id: string): Promise<void> {
    this.enqueueSync(async () => {
      await this.request(`/queue/${id}`, { method: 'DELETE' });
    });
  }

  async syncQueue(queue: unknown[]): Promise<void> {
    this.enqueueSync(async () => {
      await this.request('/queue/sync', {
        method: 'POST',
        body: JSON.stringify(queue),
      });
    });
  }

  // ─── Invoices ────────────────────────────────────────

  async saveInvoice(invoice: unknown): Promise<void> {
    this.enqueueSync(async () => {
      await this.request('/invoices', {
        method: 'POST',
        body: JSON.stringify(invoice),
      });
    });
  }

  async deleteInvoice(id: string): Promise<void> {
    this.enqueueSync(async () => {
      await this.request(`/invoices/${id}`, { method: 'DELETE' });
    });
  }

  // ─── Snippets ────────────────────────────────────────

  async syncSnippets(snippets: unknown[]): Promise<void> {
    this.enqueueSync(async () => {
      await this.request('/snippets/sync', {
        method: 'POST',
        body: JSON.stringify(snippets),
      });
    });
  }

  // ─── Full Sync ───────────────────────────────────────

  /**
   * Fetch exported database from the Excel backend.
   */
  async fetchExport(): Promise<any | null> {
    const res = await this.request<any>('/sync/export');
    return res.success ? res.data : null;
  }

  /**
   * Sync everything from localStorage to the backend at once.
   */
  async syncAll(data: {
    patients?: unknown[];
    reports?: unknown[];
    queue?: unknown[];
    invoices?: unknown[];
    snippets?: unknown[];
  }): Promise<void> {
    this.enqueueSync(async () => {
      await this.request('/sync/all', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    });
  }

  // ─── Queue Management ────────────────────────────────

  /**
   * Enqueue a sync operation. Syncs are processed sequentially
   * to avoid overwhelming the server or causing file conflicts.
   */
  private enqueueSync(fn: () => Promise<void>): void {
    this.pendingSyncs.push(fn);
    this.flushPendingSyncs();
  }

  /**
   * Process pending syncs one by one.
   */
  private async flushPendingSyncs(): Promise<void> {
    if (this.isFlushing || !this.isServerAvailable) return;
    this.isFlushing = true;

    while (this.pendingSyncs.length > 0) {
      const fn = this.pendingSyncs.shift()!;
      try {
        await fn();
      } catch (err) {
        console.warn('[API] Sync operation failed:', err);
      }
    }

    this.isFlushing = false;
  }
}

/** Singleton API client instance */
export const apiClient = new ApiClient();

