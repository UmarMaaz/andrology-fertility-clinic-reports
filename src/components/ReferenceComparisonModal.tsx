import React, { useState } from 'react';
import { Report, ClinicSettings } from '../types';
import { ReportRenderer } from './ReportRenderer';
import { X, Sliders, CheckCircle2, SplitSquareVertical, Layers } from 'lucide-react';

interface ReferenceComparisonModalProps {
  report: Report;
  settings: ClinicSettings;
  onClose: () => void;
}

export const ReferenceComparisonModal: React.FC<ReferenceComparisonModalProps> = ({
  report,
  settings,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'overlay'>('split');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.5);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[96vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Pixel-Fidelity Verification: Generated Report vs Original Word Scan
              </h2>
              <p className="text-xs text-slate-500">
                Comparing current live output against the clinic reference image (<code className="font-mono text-slate-700">reference_report.png</code>).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-200 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'split' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                <span>Side-by-Side</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('overlay')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'overlay' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Overlay Difference</span>
              </button>
            </div>

            {viewMode === 'overlay' && (
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 text-xs">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-600">Scan Opacity:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                  className="w-20 accent-sky-600"
                />
                <span className="font-mono text-slate-700">{Math.round(overlayOpacity * 100)}%</span>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Comparison View */}
        <div className="flex-1 overflow-auto p-6 bg-slate-100">
          {viewMode === 'split' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start justify-items-center">
              {/* Left Column: Original Reference Report */}
              <div className="flex flex-col items-center">
                <div className="bg-white border-2 border-slate-300 rounded-lg p-2 mb-2 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  ORIGINAL REFERENCE (Word Template Scanned Output)
                </div>
                <div className="bg-white shadow-xl border border-slate-300 rounded overflow-hidden max-w-full">
                  <img
                    src="/assets/reference_report.png"
                    alt="Original Reference Report"
                    className="w-[8.5in] max-w-full h-auto object-contain"
                  />
                </div>
              </div>

              {/* Right Column: Live Generated Report */}
              <div className="flex flex-col items-center">
                <div className="bg-white border-2 border-emerald-500 rounded-lg p-2 mb-2 shadow-sm flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  LIVE ENGINE OUTPUT (Vector HTML & Print Layout)
                </div>
                <div className="bg-white shadow-xl border border-slate-300 rounded overflow-hidden max-w-full">
                  <ReportRenderer
                    report={report}
                    settings={settings}
                    className="shadow-none border-none"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Overlay Difference View */
            <div className="flex flex-col items-center">
              <div className="relative bg-white shadow-2xl border border-slate-300 overflow-hidden" style={{ width: '8.5in', minHeight: '11in' }}>
                {/* Generated vector report on base */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                  <ReportRenderer
                    report={report}
                    settings={settings}
                    className="shadow-none border-none"
                  />
                </div>

                {/* Scanned reference image overlaid with variable opacity */}
                <img
                  src="/assets/reference_report.png"
                  alt="Reference Scan Overlay"
                  className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none transition-opacity"
                  style={{ opacity: overlayOpacity }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Layout match criteria: Header logo proportions, dynamic title font & underline, patient bar arrow bullet, light blue <span className="font-semibold text-sky-600">#5B9BD5</span> headings, checkmarks, bold-italic measurements, 3-column doctor signature block.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
