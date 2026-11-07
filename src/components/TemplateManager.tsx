import React, { useState } from 'react';
import { ReportTemplate, UserRole } from '../types';
import {
  Sparkles,
  FileText,
  CheckCircle2,
  Copy,
  Search,
  Eye,
  Layers,
  ChevronRight,
  X,
  ChevronUp,
  ChevronDown,
  MoveUp,
  MoveDown,
  ArrowUpDown,
  GripVertical,
} from 'lucide-react';

interface TemplateManagerProps {
  templates: ReportTemplate[];
  currentUserRole: UserRole;
  onSelectTemplateForNewReport: (template: ReportTemplate) => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  currentUserRole,
  onSelectTemplateForNewReport,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [previewTemplate, setPreviewTemplate] = useState<ReportTemplate | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleMovePreviewSection = (fromIndex: number, toIndex: number) => {
    if (!previewTemplate) return;
    if (toIndex < 0 || toIndex >= previewTemplate.sections.length || fromIndex === toIndex) return;
    const newSections = [...previewTemplate.sections];
    const [moved] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, moved);
    setPreviewTemplate({
      ...previewTemplate,
      sections: newSections,
    });
  };

  const categories = ['all', 'Ultrasound', 'Andrology & Fertility', 'General Lab', 'Specialized'];

  const filtered = templates.filter((tpl) => {
    if (selectedCategory !== 'all' && tpl.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        tpl.name.toLowerCase().includes(q) ||
        tpl.code.toLowerCase().includes(q) ||
        tpl.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-600" />
            22 Ready-Made Clinical Diagnostic Templates
          </h2>
          <p className="text-xs text-slate-500">
            Standardized ultrasound, andrology/fertility, and laboratory reporting schemas with normal-by-default findings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 w-60"
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-1 overflow-x-auto text-xs font-semibold">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-sky-600 text-white font-bold'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat === 'all' ? 'All 22 Templates' : cat}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tpl) => {
          const isCore = tpl.id === 'scrotal_varicocele';
          const totalFields = tpl.sections.reduce((acc, sec) => acc + sec.fields.length, 0);

          return (
            <div
              key={tpl.id}
              className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all ${
                isCore ? 'border-amber-400 ring-1 ring-amber-300' : 'border-slate-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                    {tpl.code}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    {tpl.category}
                  </span>
                </div>

                <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                  {tpl.name}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {tpl.description}
                </p>

                {isCore && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-amber-600" /> Reference Word Template Match
                  </span>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  {totalFields} {totalFields === 1 ? 'Finding Field' : 'Finding Fields'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(tpl)}
                    className="p-1.5 hover:bg-slate-100 text-slate-600 rounded cursor-pointer"
                    title="Preview template schema"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectTemplateForNewReport(tpl)}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded font-bold cursor-pointer transition-colors"
                  >
                    Use Template &rarr;
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Schema Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <span className="font-mono text-xs font-bold text-sky-700">{previewTemplate.code}</span>
                <h3 className="text-base font-extrabold text-slate-900">{previewTemplate.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</span>
                <p className="text-slate-700">{previewTemplate.description}</p>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">Default Impression</span>
                <p className="text-slate-800 font-bold bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-serif">
                  {previewTemplate.defaultImpression}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-700 uppercase tracking-wider block">
                    Sections Sequence &amp; Findings ({previewTemplate.sections.length} Sections)
                  </span>
                  <span className="text-[11px] text-sky-700 font-medium">
                    You can arrange the sequence of sections below before creating the report
                  </span>
                </div>
                <div className="space-y-3">
                  {previewTemplate.sections.map((sec, secIdx) => {
                    const isFirst = secIdx === 0;
                    const isLast = secIdx === previewTemplate.sections.length - 1;
                    const isDragging = draggedIdx === secIdx;
                    const isDragOver = dragOverIdx === secIdx && draggedIdx !== secIdx;

                    return (
                      <div
                        key={sec.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', String(secIdx));
                          setDraggedIdx(secIdx);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                          if (dragOverIdx !== secIdx) setDragOverIdx(secIdx);
                        }}
                        onDragLeave={() => {
                          if (dragOverIdx === secIdx) setDragOverIdx(null);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const fromIdx = Number(e.dataTransfer.getData('text/plain'));
                          handleMovePreviewSection(fromIdx, secIdx);
                          setDraggedIdx(null);
                          setDragOverIdx(null);
                        }}
                        onDragEnd={() => {
                          setDraggedIdx(null);
                          setDragOverIdx(null);
                        }}
                        className={`p-3 rounded-xl border transition-all ${
                          isDragging
                            ? 'opacity-40 border-dashed border-sky-400 bg-sky-50'
                            : isDragOver
                            ? 'border-sky-500 ring-2 ring-sky-400 bg-sky-50/70'
                            : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="p-1 text-slate-400 hover:text-sky-600 rounded cursor-grab active:cursor-grabbing"
                              title="Drag up or down to sequence"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold flex items-center justify-center font-mono">
                              {secIdx + 1}
                            </span>
                            <h4 className="font-extrabold text-sky-900 uppercase">{sec.title}</h4>
                            <span className="text-[10px] text-slate-500 font-medium bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {sec.fields.length} {sec.fields.length === 1 ? 'Field' : 'Fields'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {previewTemplate.sections.length > 1 && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-500 mr-1">
                                <span className="font-semibold text-slate-400 text-[10px]">Pos:</span>
                                <select
                                  value={secIdx}
                                  onChange={(e) => handleMovePreviewSection(secIdx, Number(e.target.value))}
                                  className="bg-white border border-slate-200 text-slate-700 rounded px-1 py-0.5 text-xs font-semibold focus:ring-1 focus:ring-sky-500 cursor-pointer"
                                  title="Change sequence position"
                                >
                                  {previewTemplate.sections.map((_, pIdx) => (
                                    <option key={pIdx} value={pIdx}>
                                      #{pIdx + 1}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
                              <button
                                type="button"
                                onClick={() => handleMovePreviewSection(secIdx, secIdx - 1)}
                                disabled={isFirst}
                                className="p-1 hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:hover:bg-white cursor-pointer"
                                title="Move section UP in sequence"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <div className="w-[1px] h-3 bg-slate-200" />
                              <button
                                type="button"
                                onClick={() => handleMovePreviewSection(secIdx, secIdx + 1)}
                                disabled={isLast}
                                className="p-1 hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:hover:bg-white cursor-pointer"
                                title="Move section DOWN in sequence"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5 pl-7">
                          {sec.fields.map((f) => (
                            <div key={f.id} className="bg-white p-2 rounded-lg border border-slate-200/80 space-y-0.5">
                              <span className="font-bold text-slate-800 text-[11px]">{f.label}</span>
                              <p className="text-slate-600 text-[11px] font-serif leading-relaxed line-clamp-2">
                                {typeof f.defaultValue === 'object'
                                  ? JSON.stringify(f.defaultValue)
                                  : f.defaultValue}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectTemplateForNewReport(previewTemplate);
                  setPreviewTemplate(null);
                }}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg font-bold"
              >
                Create Report with this Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
