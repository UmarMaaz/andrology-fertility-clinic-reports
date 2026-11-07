import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import config from '../config';

/** Schema definition for a single Excel column. */
export interface ColumnSchema {
  /** Property key on the data object */
  key: string;
  /** Header label shown in the Excel file */
  header: string;
  /** Optional column width (in characters) */
  width?: number;
  /** Optional transform applied when writing a value to the cell */
  transform?: (val: any) => string;
}

/**
 * A generic, reusable Excel-backed data store.
 *
 * Reads and writes `.xlsx` files using SheetJS, providing simple CRUD
 * operations with automatic backup and file-level locking to prevent
 * concurrent write corruption.
 *
 * @typeParam T - The shape of the records stored. Must include an `id: string` field.
 *
 * @example
 * ```ts
 * const store = new ExcelStore<Patient>(
 *   path.join(config.DATA_DIR, 'patients.xlsx'),
 *   patientColumns,
 * );
 * const all = store.getAll();
 * ```
 */
export class ExcelStore<T extends { id: string }> {
  private filePath: string;
  private columns: ColumnSchema[];
  private lockPromise: Promise<void> = Promise.resolve();

  constructor(filePath: string, columns: ColumnSchema[]) {
    this.filePath = filePath;
    this.columns = columns;
    this.ensureFile();
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /** Acquire a simple async mutex so only one write runs at a time. */
  private acquireLock(): Promise<() => void> {
    let release: () => void;
    const next = new Promise<void>((res) => {
      release = res;
    });
    const prev = this.lockPromise;
    this.lockPromise = next;
    return prev.then(() => release!);
  }

  /** Create the xlsx file with headers if it does not exist. */
  private ensureFile(): void {
    if (fs.existsSync(this.filePath)) return;
    const dir = path.dirname(this.filePath);
    fs.mkdirSync(dir, { recursive: true });

    const ws = XLSX.utils.aoa_to_sheet([this.columns.map((c) => c.header)]);
    ws['!cols'] = this.columns.map((c) => ({ wch: c.width ?? 18 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, this.filePath);
  }

  /**
   * Read the workbook from disk.
   * If the primary file is corrupted, attempt to restore from the latest backup.
   */
  private readWorkbook(): XLSX.WorkBook {
    try {
      return XLSX.readFile(this.filePath);
    } catch (err) {
      console.error(`[ExcelStore] Corrupted file ${this.filePath}, attempting backup restore…`);
      const restored = this.restoreFromBackup();
      if (restored) return restored;
      // No usable backup — recreate empty file
      console.warn(`[ExcelStore] No usable backup. Recreating empty file.`);
      fs.unlinkSync(this.filePath);
      this.ensureFile();
      return XLSX.readFile(this.filePath);
    }
  }

  /** Try to restore from the most recent valid backup. Returns workbook or null. */
  private restoreFromBackup(): XLSX.WorkBook | null {
    const baseName = path.basename(this.filePath, '.xlsx');
    const backupDir = path.join(config.BACKUP_DIR, baseName);
    if (!fs.existsSync(backupDir)) return null;

    const backups = fs
      .readdirSync(backupDir)
      .filter((f) => f.endsWith('.xlsx'))
      .sort()
      .reverse();

    for (const backup of backups) {
      try {
        const bp = path.join(backupDir, backup);
        const wb = XLSX.readFile(bp);
        // Copy backup over the corrupted file
        fs.copyFileSync(bp, this.filePath);
        console.log(`[ExcelStore] Restored from backup ${backup}`);
        return wb;
      } catch {
        // skip bad backup
      }
    }
    return null;
  }

  /** Create a timestamped backup of the current file (keep last 5). */
  private createBackup(): void {
    if (!fs.existsSync(this.filePath)) return;
    const baseName = path.basename(this.filePath, '.xlsx');
    const backupDir = path.join(config.BACKUP_DIR, baseName);
    fs.mkdirSync(backupDir, { recursive: true });

    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const dest = path.join(backupDir, `${baseName}_${ts}.xlsx`);
    fs.copyFileSync(this.filePath, dest);

    // Prune old backups — keep last 5
    const backups = fs.readdirSync(backupDir).filter((f) => f.endsWith('.xlsx')).sort();
    while (backups.length > 5) {
      const old = backups.shift()!;
      fs.unlinkSync(path.join(backupDir, old));
    }
  }

  /** Convert a row object (from sheet_to_json) back to a typed record. */
  private rowToRecord(row: Record<string, any>): T {
    const record: Record<string, any> = {};
    for (const col of this.columns) {
      let val = row[col.header];
      // Attempt to parse JSON-encoded columns back to objects/arrays
      if (typeof val === 'string' && val.length > 0) {
        if ((val.startsWith('{') && val.endsWith('}')) || (val.startsWith('[') && val.endsWith(']'))) {
          try {
            val = JSON.parse(val);
          } catch {
            // keep as string
          }
        }
      }
      record[col.key] = val ?? undefined;
    }
    return record as T;
  }

  /** Convert a typed record to a flat row object keyed by header. */
  private recordToRow(item: T): Record<string, any> {
    const row: Record<string, any> = {};
    for (const col of this.columns) {
      let val = (item as Record<string, any>)[col.key];
      if (col.transform) {
        val = col.transform(val);
      } else if (val !== null && val !== undefined && typeof val === 'object') {
        val = JSON.stringify(val);
      }
      row[col.header] = val ?? '';
    }
    return row;
  }

  /** Write an array of records to the xlsx file. */
  private writeRecords(records: T[]): void {
    this.createBackup();
    const headers = this.columns.map((c) => c.header);
    const rows = records.map((r) => this.recordToRow(r));
    const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
    ws['!cols'] = this.columns.map((c) => ({ wch: c.width ?? 18 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, this.filePath);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Retrieve all records from the Excel file.
   * @returns Array of all records.
   */
  getAll(): T[] {
    const wb = this.readWorkbook();
    const ws = wb.Sheets[wb.SheetNames[0]];
    if (!ws) return [];
    const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
    return rows.map((r) => this.rowToRecord(r));
  }

  /**
   * Find a single record by its `id`.
   * @param id - The unique identifier.
   * @returns The matching record, or `null` if not found.
   */
  getById(id: string): T | null {
    return this.getAll().find((r) => r.id === id) ?? null;
  }

  /**
   * Create or update (upsert) a single record.
   * If a record with the same `id` exists it is replaced; otherwise a new row is appended.
   * @param item - The record to save.
   * @returns The saved record.
   */
  async save(item: T): Promise<T> {
    const release = await this.acquireLock();
    try {
      const records = this.getAll();
      const idx = records.findIndex((r) => r.id === item.id);
      if (idx >= 0) {
        records[idx] = item;
      } else {
        records.push(item);
      }
      this.writeRecords(records);
      return item;
    } finally {
      release();
    }
  }

  /**
   * Replace **all** records with the provided array (full sync / bulk import).
   * @param items - The complete set of records.
   */
  async saveMany(items: T[]): Promise<void> {
    const release = await this.acquireLock();
    try {
      this.writeRecords(items);
    } finally {
      release();
    }
  }

  /**
   * Delete a record by `id`.
   * @param id - The unique identifier of the record to remove.
   * @returns `true` if a record was removed, `false` if not found.
   */
  async deleteById(id: string): Promise<boolean> {
    const release = await this.acquireLock();
    try {
      const records = this.getAll();
      const filtered = records.filter((r) => r.id !== id);
      if (filtered.length === records.length) return false;
      this.writeRecords(filtered);
      return true;
    } finally {
      release();
    }
  }

  /**
   * Full-text search across the specified fields.
   * @param query - Case-insensitive search string.
   * @param fields - Property keys to search within.
   * @returns Matching records.
   */
  search(query: string, fields: string[]): T[] {
    const q = query.toLowerCase();
    return this.getAll().filter((record) =>
      fields.some((field) => {
        const val = (record as Record<string, any>)[field];
        return val !== undefined && val !== null && String(val).toLowerCase().includes(q);
      }),
    );
  }
}
