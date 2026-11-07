import React from 'react';
import { Report, ClinicSettings } from '../types';
import { fixAssetPath } from '../utils/assetPath';

interface ReportRendererProps {
  report: Report;
  settings: ClinicSettings;
  hideLetterhead?: boolean; // For printing on pre-printed stationary
  scale?: number;
  className?: string;
  isPrintView?: boolean;
}

export const ReportRenderer: React.FC<ReportRendererProps> = ({
  report,
  settings,
  hideLetterhead = false,
  scale = 1,
  className = '',
  isPrintView = false,
}) => {
  const { patientSnapshot, templateSnapshot, findings, impression, date, customStatuses = {}, customColors = {} } = report;

  const activeSignatories =
    report.signatories && report.signatories.length > 0 ? report.signatories : settings.signatories;

  // Colors customizable by user
  const themePrimary = customColors.primaryColor || '#14565C';
  const themeAccent = customColors.accentColor || '#C0303B';
  const themeNormal = customColors.normalColor || '#14565C';
  const themeAbnormal = customColors.abnormalColor || '#C0303B';
  const themeHeader = customColors.headerColor || '#14565C';

  // Impression Status: user specified or auto-inferred
  const isAutoNormal = /^\s*(normal|unremarkable|no significant abnormality|within normal limits)/i.test(impression || '');
  const impressionStatusText = report.impressionStatus || (isAutoNormal ? 'Normal' : 'Abnormal');
  const isImpressionPositive = /normal|unremarkable|negative|benign/i.test(impressionStatusText);

  // Helper to get status string & color for any field
  const getFieldStatus = (fieldId: string, defaultStatus: string, isDefaultAbnormal: boolean) => {
    const statusText = customStatuses[fieldId] || defaultStatus;
    const isAbn =
      customStatuses[fieldId] !== undefined
        ? !/normal|unremarkable|benign|absent|negative/i.test(customStatuses[fieldId])
        : isDefaultAbnormal;
    return {
      text: statusText,
      color: isAbn ? themeAbnormal : themeNormal,
      isAbnormal: isAbn,
    };
  };

  // Render Section Table content based on fields
  const renderSectionTable = (section: any) => {
    // Check if section has dimensions3d field (Biometry table)
    const dim3dFields = section.fields.filter(
      (f: any) => f.type === 'dimensions3d' && findings[f.id] !== undefined && findings[f.id] !== null
    );

    // Check if section has varicocele_measurements
    const varicoceleFields = section.fields.filter(
      (f: any) => f.type === 'varicocele_measurements' && findings[f.id] !== undefined && findings[f.id] !== null
    );

    if (dim3dFields.length > 0) {
      return (
        <table className="report-tbl">
          <colgroup>
            <col style={{ width: '1.5in' }} />
            <col style={{ width: '1in' }} />
            <col style={{ width: '1in' }} />
            <col style={{ width: '1in' }} />
            <col style={{ width: '1in' }} />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th></th>
              <th>Length</th>
              <th>Width</th>
              <th>Height</th>
              <th>Volume</th>
              <th className="s">Status</th>
            </tr>
          </thead>
          <tbody>
            {dim3dFields.map((field: any, idx: number) => {
              const val = findings[field.id] || {};
              const isLast = idx === dim3dFields.length - 1;
              const defaultStatus = val.status || 'Normal';
              const isDefaultAbn = defaultStatus.toLowerCase() === 'abnormal';
              const st = getFieldStatus(field.id, defaultStatus, isDefaultAbn);

              return (
                <React.Fragment key={field.id}>
                  <tr className="m">
                    <td className="l">{field.label}</td>
                    <td className="n">{val.length !== undefined && val.length !== '' ? `${val.length} mm` : '—'}</td>
                    <td className="n">{val.width !== undefined && val.width !== '' ? `${val.width} mm` : '—'}</td>
                    <td className="n">{val.height !== undefined && val.height !== '' ? `${val.height} mm` : '—'}</td>
                    <td className="n">{val.volume !== undefined && val.volume !== '' ? `${val.volume} ml` : '—'}</td>
                    <td className="s" style={{ color: st.color }}>{st.text}</td>
                  </tr>
                  {val.text ? (
                    <tr className={`d ${!isLast ? 'end' : ''}`}>
                      <td></td>
                      <td colSpan={5}>{val.text}</td>
                    </tr>
                  ) : null}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      );
    }

    if (varicoceleFields.length > 0) {
      const varField = varicoceleFields[0];
      const val = findings[varField.id] || {};
      const rightDiam = val.rightMaxDiameter || 3.9;
      const leftDiam = val.leftMaxDiameter || 4.2;
      const refluxText = val.reflux === 'yes' ? 'Present' : val.reflux === 'no' ? 'Absent' : val.reflux || 'Present';
      const isDefaultAbn = (val.grade && val.grade !== 'None' && val.grade !== 'none') || val.reflux === 'yes';

      const rightSt = getFieldStatus(`${varField.id}_right`, isDefaultAbn ? 'Abnormal' : 'Normal', isDefaultAbn);
      const leftSt = getFieldStatus(`${varField.id}_left`, isDefaultAbn ? 'Abnormal' : 'Normal', isDefaultAbn);

      return (
        <table className={`report-tbl ${isDefaultAbn ? 'abn' : ''}`}>
          <colgroup>
            <col style={{ width: '1.5in' }} />
            <col style={{ width: '1.5in' }} />
            <col style={{ width: '1.5in' }} />
            <col style={{ width: '1.5in' }} />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th></th>
              <th>Max diameter</th>
              <th>Reflux (Valsalva)</th>
              <th></th>
              <th className="s">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="end">
              <td className="l" style={{ color: 'var(--ink)' }}>Right side</td>
              <td className="n">{rightDiam} mm</td>
              <td className="n">{refluxText}</td>
              <td></td>
              <td className="s" style={{ color: rightSt.color }}>{rightSt.text}</td>
            </tr>
            <tr className="end">
              <td className="l" style={{ color: 'var(--ink)' }}>Left side</td>
              <td className="n">{leftDiam} mm</td>
              <td className="n">{refluxText}</td>
              <td></td>
              <td className="s" style={{ color: leftSt.color }}>{leftSt.text}</td>
            </tr>
            {val.customText ? (
              <tr className="d">
                <td></td>
                <td colSpan={4}>{val.customText}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      );
    }

    // Default: Key-Value findings table (e.g. Associated findings, Organ evaluations, etc.)
    const visibleFields = section.fields.filter(
      (f: any) => findings[f.id] !== undefined && findings[f.id] !== null && findings[f.id] !== ''
    );

    return (
      <table className="report-tbl">
        <colgroup>
          <col style={{ width: '1.5in' }} />
          <col style={{ width: '4.2in' }} />
          <col />
        </colgroup>
        <tbody>
          {visibleFields.map((field: any, idx: number) => {
            const val = findings[field.id];
            const isLast = idx === visibleFields.length - 1;
            const strVal = typeof val === 'object' ? val.text || val.customText || JSON.stringify(val) : String(val);

            // Infer status
            const isDefaultAbnormal =
              /dilated|calculus|stone|lesion|mass|cyst|reflux|enlarged|thickened|grade\s+[i|v]+/i.test(strVal) &&
              !/no\s+(dilat|calculus|stone|lesion|mass|cyst|reflux|hernia)/i.test(strVal);
            const defaultLabel = isDefaultAbnormal ? 'Abnormal' : 'Normal';
            const st = getFieldStatus(field.id, defaultLabel, isDefaultAbnormal);

            return (
              <tr key={field.id} className={!isLast ? 'end' : ''}>
                <td className="l">{field.label}</td>
                <td className="txt whitespace-pre-line">{strVal}</td>
                <td className="s" style={{ color: st.color }}>{st.text}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  // Group sections across pages if report is long
  const visibleSections = templateSnapshot.sections.filter((section) =>
    section.fields.some((field) => {
      const val = findings[field.id];
      return val !== undefined && val !== null && val !== '';
    })
  );

  // If a report has 4 or more sections or large narrative, split across 2 pages
  const needsMultiPage = visibleSections.length >= 4;
  const page1Sections = needsMultiPage ? visibleSections.slice(0, 2) : visibleSections;
  const page2Sections = needsMultiPage ? visibleSections.slice(2) : [];
  const totalPages = needsMultiPage ? 2 : 1;

  const renderSinglePage = (pageNumber: number) => {
    const isPage1 = pageNumber === 1;
    const currentSections = isPage1 ? page1Sections : page2Sections;

    return (
      <div
        key={`page_${pageNumber}`}
        className={`report-pdf-page ${isPrintView ? 'is-print-view' : ''} ${className}`}
        style={{
          transform: !isPrintView && scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
          marginBottom: !isPrintView && totalPages > 1 ? '0.25in' : undefined,
        }}
      >
        <div className="report-pdf-inner">
          {/* TOP HEADER */}
          {isPage1 ? (
            !hideLetterhead ? (
              <div>
                <div className="report-top">
                  {/* Left Brand Logo */}
                  <img
                    className="report-brand"
                    src={fixAssetPath(settings.letterheadImages.clinicLogo)}
                    alt="Andrology & Fertility Clinic"
                  />

                  {/* Right Affiliations (Dr Spogmai Logo + MMC + Crest + QR) */}
                  <div className="report-affil">
                    {settings.letterheadImages.drSpogmaiLogo && (
                      <img
                        src={fixAssetPath(settings.letterheadImages.drSpogmaiLogo)}
                        alt="Dr. Spogmai Cosmetic Gynae & Fertility Clinic"
                        style={{ height: '0.48in', width: 'auto', objectFit: 'contain' }}
                      />
                    )}
                    <img
                      src={fixAssetPath(settings.letterheadImages.mmcLogo)}
                      alt="MMC Logo"
                      style={{ height: '0.46in' }}
                    />
                    <img
                      src={fixAssetPath(settings.letterheadImages.crestSeal)}
                      alt="Crest Seal"
                      style={{ height: '0.46in' }}
                    />
                    <img
                      src={fixAssetPath(settings.letterheadImages.headerQr)}
                      alt="QR Code"
                      style={{ height: '0.46in' }}
                    />
                  </div>
                </div>

                {/* 4-Color Stripe */}
                <div className="report-stripe">
                  <i style={{ width: '40%', background: '#111111' }} />
                  <i style={{ width: '25%', background: themePrimary }} />
                  <i style={{ width: '20%', background: '#F0B73A' }} />
                  <i style={{ width: '15%', background: '#D93A45' }} />
                </div>
              </div>
            ) : (
              <div style={{ height: '0.9in' }} aria-hidden="true" />
            )
          ) : (
            /* Page 2 Continuation Header Bar */
            <div className="report-cont-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <strong style={{ color: themePrimary }}>{settings.clinicName}</strong>
                  <span className="text-slate-400">•</span>
                  <span>{templateSnapshot.name} (Continuation)</span>
                </div>
                <div className="font-mono text-[8pt] text-slate-500">
                  {report.reportNumber}
                </div>
              </div>
              <div className="report-stripe mt-1">
                <i style={{ width: '40%', background: '#111111' }} />
                <i style={{ width: '25%', background: themePrimary }} />
                <i style={{ width: '20%', background: '#F0B73A' }} />
                <i style={{ width: '15%', background: '#D93A45' }} />
              </div>
            </div>
          )}

          {/* TITLE BAR (Only on Page 1) */}
          {isPage1 && (
            <div className="report-titlebar">
              <h1 style={{ color: themeHeader }}>{templateSnapshot.name}</h1>
              {report.status && report.status !== 'Draft' ? (
                <div className="report-stat">
                  Status<b style={{ color: themePrimary }}>{report.status}</b>
                </div>
              ) : null}
            </div>
          )}

          {/* PATIENT BAR: Full on Page 1, Compact Summary on Page 2 */}
          {isPage1 ? (
            <section className="report-patient-card">
              <table className="report-patient-table">
                <tbody>
                  <tr>
                    <td className="rp-cell">
                      <span className="rp-lbl">Patient Name</span>
                      <strong className="rp-val">{patientSnapshot.name}</strong>
                    </td>
                    <td className="rp-cell">
                      <span className="rp-lbl">Age / Gender</span>
                      <strong className="rp-val">
                        {patientSnapshot.age} Y / {patientSnapshot.sex === 'male' ? 'Male' : patientSnapshot.sex === 'female' ? 'Female' : 'Other'}
                      </strong>
                    </td>
                    <td className="rp-cell">
                      <span className="rp-lbl">CNIC No.</span>
                      <strong className="rp-val">{patientSnapshot.cnic || '—'}</strong>
                    </td>
                    <td className="rp-cell">
                      <span className="rp-lbl">Contact</span>
                      <strong className="rp-val">{patientSnapshot.phone || '—'}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td className="rp-cell">
                      <span className="rp-lbl">Patient ID (MRN)</span>
                      <strong className="rp-val">{patientSnapshot.mrn || '—'}</strong>
                    </td>
                    <td className="rp-cell">
                      <span className="rp-lbl">Report No.</span>
                      <strong className="rp-val">{report.reportNumber}</strong>
                    </td>
                    <td className="rp-cell">
                      <span className="rp-lbl">Exam Date</span>
                      <strong className="rp-val">{date}</strong>
                    </td>
                    <td className="rp-cell">
                      <span className="rp-lbl">Referred By</span>
                      <strong className="rp-val">{report.referringDoctor || patientSnapshot.referringDoctor || 'Dr. Naveed Ahmad Khan'}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          ) : (
            <section className="report-patient-card report-patient-card--compact">
              <div className="flex items-center justify-between text-[8.5pt]">
                <span>Patient: <strong>{patientSnapshot.name}</strong> ({patientSnapshot.age}y / {patientSnapshot.sex})</span>
                <span>MRN: <strong className="font-mono">{patientSnapshot.mrn}</strong></span>
                <span>Ref: <strong>{report.referringDoctor || 'Dr. Naveed Ahmad Khan'}</strong></span>
                <span>Date: <strong>{date}</strong></span>
              </div>
            </section>
          )}

          {/* DYNAMIC SECTIONS */}
          {currentSections.map((section) => {
            let sectionTag = section.tag;
            if (section.id === 'varicocele_section' || section.title.toLowerCase().includes('varicocele')) {
              const varData = findings['varicocele'];
              if (varData && typeof varData === 'object') {
                if (varData.side === 'none') {
                  sectionTag = undefined;
                } else {
                  const sideText = varData.side === 'bilateral' ? 'Bilateral' : varData.side === 'left' ? 'Left Side' : 'Right Side';
                  const gradeText = varData.grade && varData.grade !== 'none' ? `, Grade ${varData.grade}` : '';
                  sectionTag = `${sideText}${gradeText}`;
                }
              }
            }

            return (
              <section key={section.id} className="report-section-block">
                <h2 className="report-h2" style={{ color: themeHeader }}>
                  <span>{section.title}</span>
                  {sectionTag ? <span className="tag" style={{ color: themeAccent }}>{sectionTag}</span> : null}
                </h2>
                {renderSectionTable(section)}
              </section>
            );
          })}

          {/* IMPRESSION & SIGNATURES: On Page 1 for 1-page reports, or on Page 2 for multi-page reports */}
          {(!needsMultiPage || !isPage1) && (
            <>
              {/* IMPRESSION CARD */}
              <section className="report-impr-block">
                <h2 className="report-h2" style={{ color: themeHeader }}>
                  <span>Impression</span>
                </h2>
                <div
                  className={`report-impr ${isImpressionPositive ? 'normal' : ''}`}
                  style={{
                    borderColor: isImpressionPositive ? 'var(--rule)' : undefined,
                    backgroundColor: isImpressionPositive ? 'var(--mist)' : undefined,
                  }}
                >
                  <p>{impression}</p>
                  <span style={{ color: isImpressionPositive ? themeNormal : themeAbnormal }}>
                    {impressionStatusText}
                  </span>
                </div>
              </section>

              {/* SIGNATURES */}
              <div className="report-sign">
                {activeSignatories.map((sig, idx) => (
                  <div key={sig.id || idx} className="report-sig">
                    {sig.signatureImageUrl ? (
                      <img className="ink" src={fixAssetPath(sig.signatureImageUrl)} alt="Signature" />
                    ) : null}
                    <b>{sig.name}</b>
                    {sig.qualifications}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Page 1 indicator if continuing to page 2 */}
          {needsMultiPage && isPage1 && (
            <div className="mt-auto text-right text-[8pt] text-slate-400 font-semibold italic py-1">
              Continued on next page (Page 2)...
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="report-footer" style={{ background: themePrimary }}>
          <div className="fi">
            <svg viewBox="0 0 16 16">
              <path
                fill="#fff"
                d="M8 .5a5.2 5.2 0 0 0-5.2 5.2C2.8 9.3 8 15.5 8 15.5s5.2-6.2 5.2-9.8A5.2 5.2 0 0 0 8 .5zm0 7.2a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
              />
            </svg>
            <div>
              <b>Muhammad Medical Complex</b>
              {settings.address || 'Plot No. 3, 4, 4A, Sector B-3, Phase-5 (Near Sui Gas Office / SNGPL Rd), Hayatabad, Peshawar, Pakistan'}
            </div>
          </div>
          <div>
            <div className="fi">
              <svg viewBox="0 0 16 16">
                <path
                  fill="#fff"
                  d="M3.6 1.2l2.1.4.9 2.7-1.4 1.1a8.6 8.6 0 0 0 3.8 3.8l1.1-1.4 2.7.9.4 2.1c.1.6-.3 1.2-.9 1.3C7.6 12.7 3.3 8.4 2.3 2.1c.1-.6.7-1 1.3-.9z"
                />
              </svg>
              Phone: {settings.phone || '0313-2807035'}
            </div>
            <div className="fi">
              <svg viewBox="0 0 16 16">
                <path
                  fill="#fff"
                  d="M8 .8A7.2 7.2 0 0 0 1.8 11.7L.9 15.1l3.5-.9A7.2 7.2 0 1 0 8 .8zm3.6 10c-.2.5-1 .9-1.4 1-.4 0-.8.2-2.7-.6-2.3-1-3.700-3.300-3.800-3.500-.1-.1-.9-1.200-.9-2.300s.6-1.600.8-1.800c.2-.2.4-.3.600-.3h.4c.1 0 .3 0 .4.300l.6 1.500c0 .1.1.200 0 .4l-.2.300-.3.300c-.1.100-.2.300-.1.500.1.200.6 1 1.300 1.600.9.800 1.600 1 1.800 1.100.2.100.4.100.5-.1l.7-.8c.1-.2.3-.2.500-.1l1.500.7c.2.100.3.200.4.300.1.200.1.600-.1 1z"
                />
              </svg>
              WhatsApp: {settings.whatsapp || '0300-9178101'}
            </div>
          </div>
          <div className="pg">
            {needsMultiPage && isPage1 ? 'Continued' : 'End of report'}
            <br />
            Page {pageNumber} of {totalPages}
          </div>
        </footer>
      </div>
    );
  };

  return (
    <div className="report-multi-pages-container">
      {renderSinglePage(1)}
      {needsMultiPage && renderSinglePage(2)}
    </div>
  );
};
