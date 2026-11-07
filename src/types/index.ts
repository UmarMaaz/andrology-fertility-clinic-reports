export type Sex = 'male' | 'female' | 'other';

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number e.g. "P-2026-0042"
  name: string;
  age: number;
  dob?: string;
  sex: Sex;
  phone: string;
  cnic?: string; // National ID in Pakistan
  address?: string;
  referringDoctor?: string;
  createdAt: string;
}

export type FieldType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'radio'
  | 'dimensions3d'
  | 'varicocele_measurements'
  | 'semen_parameters'
  | 'lab_table_row';

export interface FieldReferenceRange {
  min?: number;
  max?: number;
  normalStr?: string;
  unit?: string;
}

export interface TemplateField {
  id: string;
  label: string; // e.g. "RIGHT TESTIS", "EPIDIDYMIS"
  type: FieldType;
  defaultValue: any;
  placeholder?: string;
  unit?: string;
  options?: string[];
  normalTextTemplate?: string;
  referenceRange?: FieldReferenceRange;
  helpText?: string;
}

export interface TemplateSection {
  id: string;
  title: string; // e.g. "FINDINGS", "MEASUREMENTS", "LAB RESULTS"
  tag?: string; // e.g. "Bilateral, Grade III"
  fields: TemplateField[];
}

export interface ImpressionSuggestionRule {
  fieldId: string;
  valueCondition: any;
  suggestion: string;
}

export interface ReportTemplate {
  id: string;
  code: string;
  name: string; // e.g. "Scrotal Ultrasound Report"
  category: 'Ultrasound' | 'Andrology & Fertility' | 'General Lab' | 'Specialized';
  description: string;
  defaultImpression: string;
  impressionSuggestions?: ImpressionSuggestionRule[];
  sections: TemplateSection[];
  version: number;
  isSystem?: boolean;
  signatories?: Signatory[];
}

export type ReportStatus = 'Draft' | 'Completed' | 'Verified' | 'Delivered';

export interface AuditLogEntry {
  timestamp: string;
  action: string;
  user: string;
  details?: string;
}

export interface ReportTheme {
  primaryColor?: string; // default #14565C (Teal)
  accentColor?: string;  // default #C0303B (Red)
  normalColor?: string;  // default #14565C (Normal status color)
  abnormalColor?: string; // default #C0303B (Abnormal status color)
  headerColor?: string;   // default #14565C (Section headings color)
}

export interface Report {
  id: string;
  reportNumber: string; // e.g. "AFC-2026-1049"
  patientId: string;
  patientSnapshot: Patient;
  templateId: string;
  templateSnapshot: ReportTemplate;
  date: string; // "DD-MM-YYYY" e.g. "29-10-2026"
  referringDoctor?: string; // e.g. "Dr. Naveed Ahmad Khan"
  signatories?: Signatory[]; // Custom doctors for this report
  findings: Record<string, any>;
  customStatuses?: Record<string, string>; // user custom status e.g. { right_testis: "Unremarkable", varicocele: "Mild reflux" }
  customColors?: ReportTheme; // user custom colors
  impression: string;
  impressionStatus?: string; // user custom impression status (default: "Normal" | "Abnormal")
  status: ReportStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  auditLog: AuditLogEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface Signatory {
  id: string;
  name: string; // e.g. "Dr. Abdus salam"
  qualifications: string; // e.g. "MBBS, FCPS RADOLOGY"
  title: string; // e.g. "Consultant Radiologist"
  signatureImageUrl?: string;
  active: boolean;
}

export interface ClinicSettings {
  clinicName: string;
  subtitle: string;
  tagline: string;
  address: string;
  phone: string;
  whatsapp?: string;
  email: string;
  reportPrefix: string;
  signatories: Signatory[];
  letterheadImages: {
    clinicLogo: string;
    mmcLogo: string;
    crestSeal: string;
    headerQr: string;
    drSpogmaiLogo?: string;
  };
  footerNote: string;
}

export type UserRole = 'Admin' | 'Doctor' | 'Radiology Technologist' | 'Technician' | 'Receptionist';

export interface Snippet {
  id: string;
  shortcut: string; // e.g. "/normal", "/varicocele3"
  title: string;
  text: string;
  category: string;
}

export interface BillItem {
  id: string;
  testName: string;
  price: number;
  quantity: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  date: string;
  items: BillItem[];
  discount: number;
  total: number;
  amountPaid: number;
  status: 'Paid' | 'Partial' | 'Due';
}

export interface QueueItem {
  id: string;
  tokenNumber: number;
  patientId: string;
  patientName: string;
  patientAge: number;
  testName: string;
  status: 'Waiting' | 'In Procedure' | 'In Reporting' | 'Completed';
  timestamp: string;
}
