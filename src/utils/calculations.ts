/**
 * Clinical calculation utilities for diagnostic and ultrasound metrics.
 * Decoupled pure functions with strict validation.
 */

/**
 * Ellipsoid formula for organ volume (testis, ovary, thyroid lobe):
 * Volume (ml or cc) = 0.5233 × Length (mm) × Width (mm) × Height (mm) / 1000
 */
export function calculateEllipsoidVolume(lengthMm: number, widthMm: number, heightMm: number): number {
  if (lengthMm <= 0 || widthMm <= 0 || heightMm <= 0) {
    return 0;
  }
  const raw = (0.5233 * lengthMm * widthMm * heightMm) / 1000;
  return Math.round(raw);
}

/**
 * Prostate volume using prolate ellipsoid formula:
 * Volume (ml) = 0.52 × L × W × H / 1000
 */
export function calculateProstateVolume(lengthMm: number, widthMm: number, heightMm: number): number {
  if (lengthMm <= 0 || widthMm <= 0 || heightMm <= 0) return 0;
  return Math.round(((0.52 * lengthMm * widthMm * heightMm) / 1000) * 10) / 10;
}

/**
 * PSA Density (PSAD) = Total Serum PSA (ng/mL) / Prostate Volume (mL)
 * Normal cutoff is usually < 0.15 ng/mL/cc
 */
export function calculatePsaDensity(psaNgMl: number, prostateVolMl: number): number {
  if (prostateVolMl <= 0 || psaNgMl <= 0) return 0;
  return Math.round((psaNgMl / prostateVolMl) * 1000) / 1000;
}

/**
 * Calculate age in full years from date of birth string (YYYY-MM-DD)
 */
export function calculateAgeFromDob(dobString: string, referenceDateString?: string): number {
  const dob = new Date(dobString);
  const ref = referenceDateString ? new Date(referenceDateString) : new Date();
  if (isNaN(dob.getTime())) return 0;
  
  let age = ref.getFullYear() - dob.getFullYear();
  const m = ref.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < dob.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * Estimated Date of Delivery (EDD) from Last Menstrual Period (LMP) via Naegele's rule:
 * LMP + 280 days (40 weeks)
 */
export function calculateEddFromLmp(lmpDateString: string): string {
  const lmp = new Date(lmpDateString);
  if (isNaN(lmp.getTime())) return '';
  const edd = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
  const day = String(edd.getDate()).padStart(2, '0');
  const month = String(edd.getMonth() + 1).padStart(2, '0');
  const year = edd.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Gestational Age from LMP: weeks and days
 */
export function calculateGestationalAge(lmpDateString: string, refDateString?: string): { weeks: number; days: number; summary: string } {
  const lmp = new Date(lmpDateString);
  const ref = refDateString ? new Date(refDateString) : new Date();
  if (isNaN(lmp.getTime())) return { weeks: 0, days: 0, summary: 'N/A' };
  
  const diffTime = Math.max(0, ref.getTime() - lmp.getTime());
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  return { weeks, days, summary: `${weeks} weeks ${days} days` };
}

/**
 * Friedewald formula for LDL Cholesterol:
 * LDL = Total Cholesterol - HDL - (Triglycerides / 5)
 * Note: Invalid if Triglycerides >= 400 mg/dL
 */
export function calculateFriedewaldLdl(totalChol: number, hdl: number, trig: number): { ldl: number; isValid: boolean } {
  if (trig >= 400) {
    return { ldl: 0, isValid: false };
  }
  const ldl = Math.round(totalChol - hdl - (trig / 5));
  return { ldl: Math.max(0, ldl), isValid: true };
}

/**
 * Auto-suggest impression from Varicocele grading and side
 */
export function generateVaricoceleImpression(side: 'none' | 'left' | 'right' | 'bilateral', grade: 'I' | 'II' | 'III' | 'none'): string {
  if (side === 'none' || grade === 'none') {
    return 'Normal scrotal ultrasound study with no evidence of varicocele or focal testicular pathology.';
  }
  if (side === 'bilateral') {
    return `Bilateral varicocele (Grade ${grade})`;
  }
  if (side === 'left') {
    return `Left-sided varicocele (Grade ${grade})`;
  }
  if (side === 'right') {
    return `Right-sided varicocele (Grade ${grade})`;
  }
  return 'Normal scrotal ultrasound study.';
}

/**
 * Semen Analysis flags based on WHO 6th edition criteria:
 * - Volume >= 1.4 mL
 * - Sperm Concentration >= 16.0 M/mL
 * - Total Motility >= 42%
 * - Progressive Motility (PR) >= 30%
 * - Normal Morphology >= 4.0%
 * - Vitality >= 54%
 */
export interface SemenFlags {
  oligospermia: boolean;
  asthenospermia: boolean;
  teratospermia: boolean;
  hypospermia: boolean;
  summaryDiagnosis: string;
}

export function evaluateSemenAnalysis(params: {
  volumeMl: number;
  concentrationMPerMl: number;
  totalMotilityPercent: number;
  progressiveMotilityPercent: number;
  normalMorphologyPercent: number;
}): SemenFlags {
  const hypospermia = params.volumeMl < 1.4;
  const oligospermia = params.concentrationMPerMl < 16.0;
  const asthenospermia = params.progressiveMotilityPercent < 30 || params.totalMotilityPercent < 42;
  const teratospermia = params.normalMorphologyPercent < 4.0;

  const abns: string[] = [];
  if (oligospermia) abns.push('Oligo');
  if (asthenospermia) abns.push('astheno');
  if (teratospermia) abns.push('terato');

  let summary = 'Normozoospermia';
  if (abns.length > 0) {
    summary = abns.join('').replace('Oo', 'O') + 'zoospermia';
    // Format standard medical terms
    if (oligospermia && asthenospermia && teratospermia) {
      summary = 'Oligoasthenoteratozoospermia (OAT Syndrome)';
    } else if (oligospermia && asthenospermia) {
      summary = 'Oligoasthenozoospermia';
    } else if (asthenospermia && teratospermia) {
      summary = 'Asthenoteratozoospermia';
    } else if (oligospermia) {
      summary = 'Oligozoospermia';
    } else if (asthenospermia) {
      summary = 'Asthenozoospermia';
    } else if (teratospermia) {
      summary = 'Teratozoospermia';
    }
  }

  if (params.concentrationMPerMl === 0) {
    summary = 'Azoospermia (No spermatozoa detected)';
  }

  return {
    oligospermia,
    asthenospermia,
    teratospermia,
    hypospermia,
    summaryDiagnosis: summary,
  };
}
