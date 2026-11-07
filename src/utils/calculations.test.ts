import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEllipsoidVolume,
  calculateProstateVolume,
  calculatePsaDensity,
  calculateAgeFromDob,
  calculateEddFromLmp,
  calculateFriedewaldLdl,
  generateVaricoceleImpression,
  evaluateSemenAnalysis,
} from './calculations';

test('calculateEllipsoidVolume computes volume accurately using 0.52 ellipsoid formula', () => {
  // Testis: 42 x 28 x 25 mm = 15.38 ml -> rounded to 15 or 16
  const vol1 = calculateEllipsoidVolume(42, 28, 25);
  assert.equal(vol1 >= 15 && vol1 <= 16, true);

  // Testis: 40 x 25 x 28 mm = 14.65 ml -> rounded to 15
  const vol2 = calculateEllipsoidVolume(40, 25, 28);
  assert.equal(vol2, 15);

  // Zero values return 0
  assert.equal(calculateEllipsoidVolume(0, 20, 20), 0);
  assert.equal(calculateEllipsoidVolume(-5, 20, 20), 0);
});

test('calculateProstateVolume computes volume with 1 decimal precision', () => {
  // 45 x 35 x 40 mm: 0.52 * 45 * 35 * 40 / 1000 = 32.76 -> 32.8 ml
  const vol = calculateProstateVolume(45, 35, 40);
  assert.equal(vol, 32.8);
});

test('calculatePsaDensity computes ratio accurately', () => {
  // PSA = 4.2 ng/ml, Prostate Vol = 32.8 ml -> 4.2 / 32.8 = 0.128
  const psad = calculatePsaDensity(4.2, 32.8);
  assert.equal(psad, 0.128);
  assert.equal(calculatePsaDensity(0, 30), 0);
});

test('calculateAgeFromDob calculates correct completed age in years', () => {
  const age = calculateAgeFromDob('1986-10-29', '2026-10-29');
  assert.equal(age, 40);

  const ageBeforeBirthday = calculateAgeFromDob('1986-12-01', '2026-10-29');
  assert.equal(ageBeforeBirthday, 39);
});

test('calculateEddFromLmp follows Naegeles rule', () => {
  // LMP: Jan 1, 2026 + 280 days -> Oct 8, 2026
  const edd = calculateEddFromLmp('2026-01-01');
  assert.equal(edd, '08-10-2026');
});

test('calculateFriedewaldLdl computes LDL and flags invalid high triglycerides', () => {
  // Valid case: Total 200, HDL 50, Trig 150 -> LDL = 200 - 50 - 30 = 120
  const resValid = calculateFriedewaldLdl(200, 50, 150);
  assert.equal(resValid.isValid, true);
  assert.equal(resValid.ldl, 120);

  // Invalid case: Triglycerides >= 400
  const resInvalid = calculateFriedewaldLdl(240, 35, 450);
  assert.equal(resInvalid.isValid, false);
});

test('generateVaricoceleImpression produces medical diagnostic statements', () => {
  assert.equal(generateVaricoceleImpression('bilateral', 'III'), 'Bilateral varicocele (Grade III)');
  assert.equal(generateVaricoceleImpression('left', 'II'), 'Left-sided varicocele (Grade II)');
  assert.equal(generateVaricoceleImpression('none', 'none'), 'Normal scrotal ultrasound study with no evidence of varicocele or focal testicular pathology.');
});

test('evaluateSemenAnalysis evaluates parameters per WHO criteria', () => {
  // Normal parameters
  const normal = evaluateSemenAnalysis({
    volumeMl: 2.5,
    concentrationMPerMl: 45,
    totalMotilityPercent: 65,
    progressiveMotilityPercent: 55,
    normalMorphologyPercent: 6,
  });
  assert.equal(normal.summaryDiagnosis, 'Normozoospermia');
  assert.equal(normal.oligospermia, false);

  // OAT Syndrome
  const oat = evaluateSemenAnalysis({
    volumeMl: 1.2,
    concentrationMPerMl: 8,
    totalMotilityPercent: 25,
    progressiveMotilityPercent: 15,
    normalMorphologyPercent: 2,
  });
  assert.equal(oat.oligospermia, true);
  assert.equal(oat.asthenospermia, true);
  assert.equal(oat.teratospermia, true);
  assert.equal(oat.hypospermia, true);
  assert.equal(oat.summaryDiagnosis, 'Oligoasthenoteratozoospermia (OAT Syndrome)');
});
