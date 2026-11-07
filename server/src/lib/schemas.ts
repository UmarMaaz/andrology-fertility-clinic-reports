import { ColumnSchema } from './ExcelStore';

// ---------------------------------------------------------------------------
// Patient
// ---------------------------------------------------------------------------
export const patientColumns: ColumnSchema[] = [
  { key: 'id', header: 'ID', width: 36 },
  { key: 'mrn', header: 'MRN', width: 14 },
  { key: 'name', header: 'Name', width: 28 },
  { key: 'age', header: 'Age', width: 6 },
  { key: 'dob', header: 'DOB', width: 14 },
  { key: 'sex', header: 'Sex', width: 8 },
  { key: 'phone', header: 'Phone', width: 16 },
  { key: 'cnic', header: 'CNIC', width: 18 },
  { key: 'address', header: 'Address', width: 32 },
  { key: 'referringDoctor', header: 'Referring Doctor', width: 24 },
  { key: 'createdAt', header: 'Created At', width: 24 },
];

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
export const reportColumns: ColumnSchema[] = [
  { key: 'id', header: 'ID', width: 36 },
  { key: 'reportNumber', header: 'Report Number', width: 16 },
  { key: 'patientId', header: 'Patient ID', width: 36 },
  { key: 'patientName', header: 'Patient Name', width: 28 },
  { key: 'templateId', header: 'Template ID', width: 36 },
  { key: 'templateName', header: 'Template Name', width: 28 },
  { key: 'date', header: 'Date', width: 14 },
  { key: 'referringDoctor', header: 'Referring Doctor', width: 24 },
  { key: 'findings', header: 'Findings (JSON)', width: 60 },
  { key: 'customStatuses', header: 'Custom Statuses (JSON)', width: 40 },
  { key: 'customColors', header: 'Custom Colors (JSON)', width: 40 },
  { key: 'signatories', header: 'Signatories (JSON)', width: 40 },
  { key: 'impression', header: 'Impression', width: 50 },
  { key: 'impressionStatus', header: 'Impression Status', width: 20 },
  { key: 'status', header: 'Status', width: 12 },
  { key: 'verifiedBy', header: 'Verified By', width: 20 },
  { key: 'verifiedAt', header: 'Verified At', width: 24 },
  { key: 'patientSnapshot', header: 'Patient Snapshot (JSON)', width: 60 },
  { key: 'templateSnapshot', header: 'Template Snapshot (JSON)', width: 60 },
  { key: 'auditLog', header: 'Audit Log (JSON)', width: 60 },
  { key: 'createdAt', header: 'Created At', width: 24 },
  { key: 'updatedAt', header: 'Updated At', width: 24 },
];

// ---------------------------------------------------------------------------
// Queue Item
// ---------------------------------------------------------------------------
export const queueColumns: ColumnSchema[] = [
  { key: 'id', header: 'ID', width: 36 },
  { key: 'tokenNumber', header: 'Token Number', width: 14 },
  { key: 'patientId', header: 'Patient ID', width: 36 },
  { key: 'patientName', header: 'Patient Name', width: 28 },
  { key: 'patientAge', header: 'Patient Age', width: 12 },
  { key: 'testName', header: 'Test Name', width: 24 },
  { key: 'status', header: 'Status', width: 16 },
  { key: 'timestamp', header: 'Timestamp', width: 24 },
];

// ---------------------------------------------------------------------------
// Invoice
// ---------------------------------------------------------------------------
export const invoiceColumns: ColumnSchema[] = [
  { key: 'id', header: 'ID', width: 36 },
  { key: 'invoiceNumber', header: 'Invoice Number', width: 18 },
  { key: 'patientId', header: 'Patient ID', width: 36 },
  { key: 'patientName', header: 'Patient Name', width: 28 },
  { key: 'date', header: 'Date', width: 14 },
  { key: 'items', header: 'Items (JSON)', width: 60 },
  { key: 'discount', header: 'Discount', width: 10 },
  { key: 'total', header: 'Total', width: 12 },
  { key: 'amountPaid', header: 'Amount Paid', width: 14 },
  { key: 'status', header: 'Status', width: 10 },
];

// ---------------------------------------------------------------------------
// Snippet
// ---------------------------------------------------------------------------
export const snippetColumns: ColumnSchema[] = [
  { key: 'id', header: 'ID', width: 36 },
  { key: 'shortcut', header: 'Shortcut', width: 14 },
  { key: 'title', header: 'Title', width: 28 },
  { key: 'text', header: 'Text', width: 60 },
  { key: 'category', header: 'Category', width: 18 },
];
