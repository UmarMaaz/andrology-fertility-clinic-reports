import React, { useState } from 'react';
import { ReportTemplate, TemplateSection, TemplateField, Snippet, Signatory } from '../types';
import { calculateEllipsoidVolume, generateVaricoceleImpression } from '../utils/calculations';
import { BUILT_IN_TEMPLATES } from '../data/seedTemplates';
import {
  Sparkles,
  RotateCcw,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Wand2,
  Trash2,
  FolderPlus,
  UserPlus,
  X,
  Stethoscope,
  Pencil,
  GripVertical,
  MoveUp,
  MoveDown,
  ListOrdered,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

interface DynamicFormProps {
  template: ReportTemplate;
  findings: Record<string, any>;
  customStatuses?: Record<string, string>;
  impression: string;
  impressionStatus?: string;
  snippets: Snippet[];
  signatories?: Signatory[];
  onFindingsChange: (newFindings: Record<string, any>) => void;
  onCustomStatusesChange?: (newCustomStatuses: Record<string, string>) => void;
  onImpressionChange: (newImpression: string) => void;
  onImpressionStatusChange?: (newStatus: string) => void;
  onResetAllNormal: () => void;
  onTemplateChange?: (updatedTemplate: ReportTemplate, updatedFindings?: Record<string, any>) => void;
  onSignatoriesChange?: (updatedSignatories: Signatory[]) => void;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  template,
  findings,
  customStatuses = {},
  impression,
  impressionStatus,
  snippets,
  signatories = [],
  onFindingsChange,
  onCustomStatusesChange,
  onImpressionChange,
  onImpressionStatusChange,
  onResetAllNormal,
  onTemplateChange,
  onSignatoriesChange,
}) => {
  const [activeSnippetField, setActiveSnippetField] = useState<string | null>(null);

  // Accordion state: keep active sections open/collapsed cleanly
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Status popover state
  const [editingStatusFieldId, setEditingStatusFieldId] = useState<string | null>(null);

  // Section toolbars collapse toggle (keeps UI neat and uncluttered)
  const [expandedSectionToolbar, setExpandedSectionToolbar] = useState<string | null>(null);

  // Adding Custom Field state
  const [addingFieldToSectionId, setAddingFieldToSectionId] = useState<string | null>(null);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldDefaultText, setNewFieldDefaultText] = useState('');

  // Adding New Section state
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionFieldLabel, setNewSectionFieldLabel] = useState('FINDINGS');
  const [newSectionDefaultText, setNewSectionDefaultText] = useState('Normal appearance and morphology. No focal abnormality seen.');

  // Reorder Modal state (Headings & Sections)
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [reorderModalTab, setReorderModalTab] = useState<'headings' | 'sections'>('headings');
  const [selectedSectionIdForReorder, setSelectedSectionIdForReorder] = useState<string>(template.sections[0]?.id || '');

  // Inline Section Title Editing state
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState('');

  // Auto-generate suggested impressions based on current findings
  const getImpressionSuggestions = (): string[] => {
    const list: string[] = [];

    if (template.id === 'scrotal_varicocele') {
      const varicocele = findings['varicocele'];
      if (varicocele && typeof varicocele === 'object') {
        const side = varicocele.side || 'none';
        const grade = varicocele.grade || 'none';
        list.push(generateVaricoceleImpression(side, grade));
      }
      list.push('Normal scrotal ultrasound study with no focal testicular pathology.');
      list.push('Left-sided varicocele (Grade II) with venous reflux on Valsalva.');
      list.push('Right-sided simple epididymal head cyst (spermatocele).');
    }

    if (template.defaultImpression && !list.includes(template.defaultImpression)) {
      list.unshift(template.defaultImpression);
    }

    return Array.from(new Set(list));
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    onFindingsChange({
      ...findings,
      [fieldId]: value,
    });
  };

  const handleCustomStatusUpdate = (fieldId: string, newStatus: string) => {
    if (onCustomStatusesChange) {
      onCustomStatusesChange({
        ...customStatuses,
        [fieldId]: newStatus,
      });
    }
  };

  // Helper to update 3D dimensions and auto-recalculate volume & text
  const handleDimensionChange = (
    fieldId: string,
    dimension: 'length' | 'width' | 'height',
    newVal: number
  ) => {
    const current = findings[fieldId] || { length: 40, width: 25, height: 25, volume: 13, status: 'Normal' };
    const updated = {
      ...current,
      [dimension]: newVal,
    };
    const vol = calculateEllipsoidVolume(updated.length, updated.width, updated.height);
    updated.volume = vol;
    updated.text = `Normal size, echogenicity, and parenchymal echotexture. No focal lesion is seen. Volume: ${vol}ml.`;

    handleFieldChange(fieldId, updated);
  };

  // Helper for Varicocele interactive controls
  const handleVaricoceleChange = (patch: Record<string, any>) => {
    const current = typeof findings['varicocele'] === 'object' ? findings['varicocele'] : {};
    const updated = {
      ...current,
      ...patch,
    };

    if (updated.side === 'none') {
      updated.customText = 'No venous dilatation or retrograde flow noted in pampiniform plexus on either side.';
      // Auto-suggest Normal impression and status if user picked none
      if (onImpressionChange) {
        onImpressionChange('Normal scrotal ultrasound study with no focal testicular pathology.');
      }
      if (onImpressionStatusChange) {
        onImpressionStatusChange('Normal');
      }
    } else {
      const sideText = updated.side === 'bilateral' ? 'both sides' : `${updated.side} side`;
      updated.customText = `Dilated tortuous vessels noted on ${sideText}, showing reflux seen on CDI with Valsalva maneuver.`;
      if (onImpressionChange) {
        onImpressionChange(generateVaricoceleImpression(updated.side, updated.grade || 'III'));
      }
      if (onImpressionStatusChange) {
        onImpressionStatusChange('Abnormal');
      }
    }

    handleFieldChange('varicocele', updated);
  };

  const insertSnippet = (fieldId: string, snippetText: string) => {
    const currentVal = findings[fieldId];
    if (typeof currentVal === 'object' && currentVal !== null) {
      handleFieldChange(fieldId, {
        ...currentVal,
        text: snippetText,
      });
    } else {
      const existing = currentVal ? `${currentVal}\n` : '';
      handleFieldChange(fieldId, `${existing}${snippetText}`);
    }
    setActiveSnippetField(null);
  };

  // ADD CUSTOM FIELD TO A SECTION
  const handleAddCustomField = (sectionId: string) => {
    if (!newFieldLabel.trim()) return;

    const fieldId = `custom_${Date.now()}`;
    const cleanLabel = newFieldLabel.trim();
    const cleanDefault = newFieldDefaultText.trim() || 'Normal appearance and morphology. No abnormality seen.';

    const newField: TemplateField = {
      id: fieldId,
      label: cleanLabel,
      type: 'textarea',
      defaultValue: cleanDefault,
      placeholder: `Enter ${cleanLabel.toLowerCase()} findings...`,
    };

    const updatedSections = template.sections.map((sec) => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          fields: [...sec.fields, newField],
        };
      }
      return sec;
    });

    const updatedTemplate: ReportTemplate = {
      ...template,
      sections: updatedSections,
    };

    const updatedFindings = {
      ...findings,
      [fieldId]: newField.defaultValue,
    };

    if (onTemplateChange) {
      onTemplateChange(updatedTemplate, updatedFindings);
    }
    onFindingsChange(updatedFindings);

    setNewFieldLabel('');
    setNewFieldDefaultText('');
    setAddingFieldToSectionId(null);
  };

  // REMOVE FIELD FROM A SECTION
  const handleRemoveField = (sectionId: string, fieldId: string) => {
    if (!confirm('Are you sure you want to remove this finding field from the report?')) return;

    const updatedSections = template.sections.map((sec) => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          fields: sec.fields.filter((f) => f.id !== fieldId),
        };
      }
      return sec;
    });

    const updatedTemplate: ReportTemplate = {
      ...template,
      sections: updatedSections,
    };

    const updatedFindings = { ...findings };
    delete updatedFindings[fieldId];

    if (onTemplateChange) {
      onTemplateChange(updatedTemplate, updatedFindings);
    }
    onFindingsChange(updatedFindings);
  };

  // REORDER FIELDS / HEADINGS TO TARGET POSITION
  const handleMoveFieldToPosition = (sectionId: string, fromIndex: number, toIndex: number) => {
    const targetSection = template.sections.find((s) => s.id === sectionId);
    if (!targetSection || fromIndex === toIndex || toIndex < 0 || toIndex >= targetSection.fields.length) return;

    const newFields = [...targetSection.fields];
    const [moved] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, moved);

    const updatedSections = template.sections.map((sec) => {
      if (sec.id === sectionId) {
        return { ...sec, fields: newFields };
      }
      return sec;
    });

    const updatedTemplate: ReportTemplate = {
      ...template,
      sections: updatedSections,
    };

    if (onTemplateChange) {
      onTemplateChange(updatedTemplate, findings);
    }
  };

  // REORDER SECTIONS TO TARGET POSITION
  const handleMoveSectionToPosition = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= template.sections.length) return;

    const newSections = [...template.sections];
    const [moved] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, moved);

    const updatedTemplate: ReportTemplate = {
      ...template,
      sections: newSections,
    };

    if (onTemplateChange) {
      onTemplateChange(updatedTemplate, findings);
    }
  };

  // RENAME SECTION TITLE
  const handleSaveSectionRename = (sectionId: string) => {
    if (!editingSectionTitle.trim()) {
      setEditingSectionId(null);
      return;
    }

    const updatedSections = template.sections.map((sec) => {
      if (sec.id === sectionId) {
        return { ...sec, title: editingSectionTitle.trim() };
      }
      return sec;
    });

    const updatedTemplate: ReportTemplate = {
      ...template,
      sections: updatedSections,
    };

    if (onTemplateChange) {
      onTemplateChange(updatedTemplate, findings);
    }
    setEditingSectionId(null);
    setEditingSectionTitle('');
  };

  // REMOVE SECTION
  const handleRemoveSection = (sectionId: string) => {
    if (!confirm('Are you sure you want to remove this entire section from the report?')) return;
    const updatedSections = template.sections.filter((s) => s.id !== sectionId);
    const updatedTemplate: ReportTemplate = {
      ...template,
      sections: updatedSections,
    };
    if (onTemplateChange) {
      onTemplateChange(updatedTemplate, findings);
    }
  };

  // ADD NEW SECTION
  const handleAddNewSection = () => {
    if (!newSectionTitle.trim()) return;

    const sectionId = `sec_${Date.now()}`;
    const initialFieldId = `fld_${Date.now()}`;
    const cleanLabel = (newSectionFieldLabel.trim() || 'OBSERVATIONS');
    const defaultText = newSectionDefaultText.trim() || 'Normal appearance and morphology. No focal abnormality detected.';

    const newSection: TemplateSection = {
      id: sectionId,
      title: newSectionTitle.trim(),
      fields: [
        {
          id: initialFieldId,
          label: cleanLabel,
          type: 'textarea',
          defaultValue: defaultText,
          placeholder: `Enter ${cleanLabel.toLowerCase()} observations...`,
        },
      ],
    };

    const updatedSections = [...template.sections, newSection];
    const updatedTemplate: ReportTemplate = {
      ...template,
      sections: updatedSections,
    };

    const updatedFindings = {
      ...findings,
      [initialFieldId]: defaultText,
    };

    if (onTemplateChange) {
      onTemplateChange(updatedTemplate, updatedFindings);
    }
    onFindingsChange(updatedFindings);

    setNewSectionTitle('');
    setNewSectionFieldLabel('FINDINGS');
    setNewSectionDefaultText('Normal appearance and morphology. No focal abnormality seen.');
    setIsAddingSection(false);
  };

  // Custom Signatories
  const handleSignatoryChange = (index: number, patch: Partial<Signatory>) => {
    if (!onSignatoriesChange) return;
    const updated = signatories.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onSignatoriesChange(updated);
  };

  const handleAddDoctor = (doctorPreset?: { name: string; qualifications: string; title: string }) => {
    if (!onSignatoriesChange) return;
    const newDoc: Signatory = doctorPreset
      ? {
          id: `sig_${Date.now()}`,
          name: doctorPreset.name,
          qualifications: doctorPreset.qualifications,
          title: doctorPreset.title,
          active: true,
        }
      : {
          id: `sig_${Date.now()}`,
          name: 'Dr. Consultant Name',
          qualifications: 'MBBS, FCPS',
          title: 'Consultant Specialist',
          active: true,
        };

    onSignatoriesChange([...signatories, newDoc]);
  };

  const handleRemoveDoctor = (index: number) => {
    if (!onSignatoriesChange) return;
    if (signatories.length <= 1) {
      alert('The report requires at least one doctor signatory.');
      return;
    }
    const updated = signatories.filter((_, i) => i !== index);
    onSignatoriesChange(updated);
  };

  const suggestions = getImpressionSuggestions();

  return (
    <div className="space-y-4">
      {/* Top Action Bar: Clean & Compact Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50 border border-slate-200/90 rounded-xl px-4 py-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-tight">Structured Report Sections</h4>
            <p className="text-[11px] text-slate-500">Edit findings, change statuses (Normal/Abnormal), or reorder headings.</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setSelectedSectionIdForReorder(template.sections[0]?.id || '');
              setReorderModalTab('headings');
              setShowReorderModal(true);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="Reorder headings sequence"
          >
            <ListOrdered className="w-3.5 h-3.5 text-slate-500" />
            <span>Reorder</span>
          </button>

          <button
            type="button"
            onClick={onResetAllNormal}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="Reset every finding field back to normal baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Normal</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC FORM SECTIONS */}
      {template.sections.map((section, sectionIndex) => {
        const isCollapsed = collapsedSections[section.id] === true;
        const isToolbarOpen = expandedSectionToolbar === section.id;

        return (
          <section
            key={section.id}
            className="border border-slate-200/90 rounded-xl bg-white shadow-2xs overflow-hidden transition-all duration-150"
          >
            {/* Clean Section Bar with Expand/Collapse */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50/70 border-b border-slate-100 select-none">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCollapsedSections((prev) => ({
                      ...prev,
                      [section.id]: !prev[section.id],
                    }))
                  }
                  className="p-1 hover:bg-slate-200/60 rounded text-slate-500 transition-colors cursor-pointer"
                  title={isCollapsed ? 'Expand section' : 'Collapse section'}
                >
                  {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {editingSectionId === section.id ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={editingSectionTitle}
                      onChange={(e) => setEditingSectionTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveSectionRename(section.id);
                        if (e.key === 'Escape') setEditingSectionId(null);
                      }}
                      className="bg-white border border-sky-400 rounded px-2 py-0.5 text-xs font-bold text-slate-900 focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveSectionRename(section.id)}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSectionId(null)}
                      className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 tracking-tight">
                      {section.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      ({section.fields.length} {section.fields.length === 1 ? 'item' : 'items'})
                    </span>
                    {section.tag && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full border border-rose-200">
                        {section.tag}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons for Section */}
              <div className="flex items-center gap-1">
                {/* Add Field */}
                <button
                  type="button"
                  onClick={() => setAddingFieldToSectionId(addingFieldToSectionId === section.id ? null : section.id)}
                  className="px-2 py-1 text-[11px] font-semibold text-sky-700 hover:bg-sky-50 rounded border border-transparent hover:border-sky-200 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Add custom finding row"
                >
                  <Plus className="w-3 h-3" />
                  <span>Row</span>
                </button>

                {/* Toggle Quick Section Settings Toolbar */}
                <button
                  type="button"
                  onClick={() => setExpandedSectionToolbar(isToolbarOpen ? null : section.id)}
                  className={`p-1 rounded text-slate-500 hover:bg-slate-200/60 transition-colors cursor-pointer ${
                    isToolbarOpen ? 'bg-slate-200 text-slate-800' : ''
                  }`}
                  title="Section settings & reordering"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Settings Toolbar (Hidden by default, shown when user clicks settings) */}
            {isToolbarOpen && (
              <div className="px-3.5 py-2 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="text-[11px] font-semibold text-slate-400">Position:</span>
                  <select
                    value={sectionIndex}
                    onChange={(e) => handleMoveSectionToPosition(sectionIndex, Number(e.target.value))}
                    className="bg-white border border-slate-300 text-slate-700 rounded px-1.5 py-0.5 text-xs font-semibold cursor-pointer"
                  >
                    {template.sections.map((_, pIdx) => (
                      <option key={pIdx} value={pIdx}>
                        {pIdx + 1}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSectionId(section.id);
                      setEditingSectionTitle(section.title);
                    }}
                    className="p-1 text-slate-500 hover:text-sky-700 hover:bg-white rounded transition-colors ml-1 cursor-pointer"
                    title="Rename section title"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>

                {template.sections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSection(section.id)}
                    className="text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete Section</span>
                  </button>
                )}
              </div>
            )}

            {/* Add Custom Field Inline Box */}
            {addingFieldToSectionId === section.id && (
              <div className="bg-sky-50/60 border-b border-sky-200 p-3 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-900 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-sky-600" /> Add Custom Row to {section.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAddingFieldToSectionId(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-0.5 text-[11px]">Finding Label / Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Scrotal skin, Hydrocele, Inguinal rings"
                      value={newFieldLabel}
                      onChange={(e) => setNewFieldLabel(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-0.5 text-[11px]">Default Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Normal appearance. No focal lesion is seen."
                      value={newFieldDefaultText}
                      onChange={(e) => setNewFieldDefaultText(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setAddingFieldToSectionId(null)}
                    className="px-2.5 py-1 bg-white border border-slate-300 text-slate-600 rounded text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddCustomField(section.id)}
                    disabled={!newFieldLabel.trim()}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded text-xs font-bold cursor-pointer"
                  >
                    Add Row
                  </button>
                </div>
              </div>
            )}

            {/* Section Fields (Collapsed or Expanded) */}
            {!isCollapsed && (
              <div className="p-3.5 space-y-3.5">
                {section.fields.map((field) => {
                  const val = findings[field.id];

                  // Status determination & Custom Status Picker
                  const currentCustomStatus = customStatuses[field.id];
                  const currentStatus =
                    currentCustomStatus ||
                    (typeof val === 'object' && val?.status ? val.status : 'Normal');

                  const isAbn = !/normal|unremarkable|benign|absent|negative/i.test(currentStatus);

                  // Case A: 3D Dimensions (Testes / Ovaries / Kidneys)
                  if (field.type === 'dimensions3d') {
                    const dim = typeof val === 'object' ? val : { length: 42, width: 28, height: 25, volume: 16, status: 'Normal' };

                    return (
                      <div
                        key={field.id}
                        className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-3 space-y-2.5"
                      >
                        {/* Header: Label + Status Pill Dropdown */}
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                            {field.label}
                          </label>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-slate-500">
                              Vol: <b>{dim.volume || 0} mL</b>
                            </span>

                            {/* Status Selector Pill: Allows changing Normal to Abnormal, Borderline, etc. */}
                            <select
                              value={currentStatus}
                              onChange={(e) => {
                                handleCustomStatusUpdate(field.id, e.target.value);
                                handleFieldChange(field.id, { ...dim, status: e.target.value });
                              }}
                              className={`text-xs font-bold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none ${
                                isAbn
                                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              }`}
                              title="Click to change Status on printed report"
                            >
                              <option value="Normal">Normal</option>
                              <option value="Abnormal">Abnormal</option>
                              <option value="Unremarkable">Unremarkable</option>
                              <option value="Borderline">Borderline</option>
                              <option value="Atrophic">Atrophic</option>
                              <option value="Enlarged">Enlarged</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => handleRemoveField(section.id, field.id)}
                              className="text-slate-300 hover:text-rose-600 transition-colors p-0.5"
                              title="Delete row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Numeric measurement inputs */}
                        <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-lg border border-slate-200/80">
                          <div>
                            <span className="text-[10px] font-semibold text-slate-500 block mb-0.5">Length (mm)</span>
                            <input
                              type="number"
                              step="1"
                              value={dim.length || ''}
                              onChange={(e) => handleDimensionChange(field.id, 'length', parseFloat(e.target.value) || 0)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-mono text-slate-900 focus:bg-white"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-slate-500 block mb-0.5">Width (mm)</span>
                            <input
                              type="number"
                              step="1"
                              value={dim.width || ''}
                              onChange={(e) => handleDimensionChange(field.id, 'width', parseFloat(e.target.value) || 0)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-mono text-slate-900 focus:bg-white"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-slate-500 block mb-0.5">Height (mm)</span>
                            <input
                              type="number"
                              step="1"
                              value={dim.height || ''}
                              onChange={(e) => handleDimensionChange(field.id, 'height', parseFloat(e.target.value) || 0)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-mono text-slate-900 focus:bg-white"
                            />
                          </div>
                        </div>

                        {/* Finding Text */}
                        <textarea
                          rows={2}
                          value={dim.text || ''}
                          onChange={(e) => handleFieldChange(field.id, { ...dim, text: e.target.value })}
                          placeholder="Finding description..."
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 font-serif leading-relaxed"
                        />
                      </div>
                    );
                  }

                  // Case B: Varicocele interactive controls
                  if (field.type === 'varicocele_measurements') {
                    const varData = typeof val === 'object' ? val : { side: 'bilateral', grade: 'III', leftMaxDiameter: 4.2, rightMaxDiameter: 3.9 };
                    const rightStatus = customStatuses[`${field.id}_right`] || (varData.side !== 'none' ? 'Abnormal' : 'Normal');
                    const leftStatus = customStatuses[`${field.id}_left`] || (varData.side !== 'none' ? 'Abnormal' : 'Normal');

                    return (
                      <div
                        key={field.id}
                        className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-3 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                            {field.label}
                          </label>

                          <div className="flex items-center gap-2">
                            {/* Side & Grade quick tags */}
                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
                              Grade {varData.grade || 'III'}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleRemoveField(section.id, field.id)}
                              className="text-slate-300 hover:text-rose-600 transition-colors p-0.5"
                              title="Delete row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Quick Controls */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-2.5 rounded-lg border border-slate-200/80 text-xs">
                          <div>
                            <span className="text-[10px] font-semibold text-slate-500 block mb-0.5">Side</span>
                            <select
                              value={varData.side || 'none'}
                              onChange={(e) => handleVaricoceleChange({ side: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded p-1 font-medium text-slate-900"
                            >
                              <option value="none">None (Normal)</option>
                              <option value="bilateral">Bilateral</option>
                              <option value="left">Left Side</option>
                              <option value="right">Right Side</option>
                            </select>
                          </div>

                          <div>
                            <span className="text-[10px] font-semibold text-slate-500 block mb-0.5">Grade</span>
                            <select
                              value={varData.grade || 'none'}
                              onChange={(e) => handleVaricoceleChange({ grade: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded p-1 font-medium text-slate-900"
                            >
                              <option value="none">None</option>
                              <option value="I">Grade I</option>
                              <option value="II">Grade II</option>
                              <option value="III">Grade III</option>
                            </select>
                          </div>

                          <div>
                            <span className="text-[10px] font-semibold text-slate-500 block mb-0.5">Left Dia (mm)</span>
                            <input
                              type="number"
                              step="0.1"
                              value={varData.leftMaxDiameter || ''}
                              onChange={(e) => handleVaricoceleChange({ leftMaxDiameter: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-slate-50 border border-slate-200 rounded p-1 font-mono text-slate-900"
                            />
                          </div>

                          <div>
                            <span className="text-[10px] font-semibold text-slate-500 block mb-0.5">Right Dia (mm)</span>
                            <input
                              type="number"
                              step="0.1"
                              value={varData.rightMaxDiameter || ''}
                              onChange={(e) => handleVaricoceleChange({ rightMaxDiameter: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-slate-50 border border-slate-200 rounded p-1 font-mono text-slate-900"
                            />
                          </div>
                        </div>

                        {/* Status Pickers for Left & Right */}
                        <div className="flex items-center gap-3 pt-1 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-slate-500">Right Status:</span>
                            <select
                              value={rightStatus}
                              onChange={(e) => handleCustomStatusUpdate(`${field.id}_right`, e.target.value)}
                              className="text-xs font-semibold px-2 py-0.5 bg-white border border-slate-300 rounded"
                            >
                              <option value="Normal">Normal</option>
                              <option value="Abnormal">Abnormal</option>
                              <option value="Mild Reflux">Mild Reflux</option>
                              <option value="Marked Reflux">Marked Reflux</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-slate-500">Left Status:</span>
                            <select
                              value={leftStatus}
                              onChange={(e) => handleCustomStatusUpdate(`${field.id}_left`, e.target.value)}
                              className="text-xs font-semibold px-2 py-0.5 bg-white border border-slate-300 rounded"
                            >
                              <option value="Normal">Normal</option>
                              <option value="Abnormal">Abnormal</option>
                              <option value="Mild Reflux">Mild Reflux</option>
                              <option value="Marked Reflux">Marked Reflux</option>
                            </select>
                          </div>
                        </div>

                        {/* Report Text */}
                        <textarea
                          rows={2}
                          value={varData.customText || ''}
                          onChange={(e) => handleFieldChange(field.id, { ...varData, customText: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 font-serif leading-relaxed"
                        />
                      </div>
                    );
                  }

                  // Case C: Standard Textarea & text fields
                  const textVal = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');

                  return (
                    <div
                      key={field.id}
                      className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                          {field.label}
                        </label>

                        <div className="flex items-center gap-2">
                          {/* Status Selector: Allows changing Normal to Abnormal, Absent, Present, etc. */}
                          <select
                            value={currentStatus}
                            onChange={(e) => handleCustomStatusUpdate(field.id, e.target.value)}
                            className={`text-xs font-bold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none ${
                              isAbn
                                ? 'bg-rose-50 text-rose-700 border-rose-300'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            }`}
                            title="Click to customize Status in the report"
                          >
                            <option value="Normal">Normal</option>
                            <option value="Abnormal">Abnormal</option>
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Unremarkable">Unremarkable</option>
                            <option value="Mild">Mild</option>
                            <option value="Moderate">Moderate</option>
                            <option value="Severe">Severe</option>
                          </select>

                          {/* Quick Snippets Menu */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setActiveSnippetField(activeSnippetField === field.id ? null : field.id)}
                              className="text-[11px] text-slate-500 hover:text-sky-700 bg-white hover:bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
                              title="Insert clinical snippet"
                            >
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <ChevronDown className="w-2.5 h-2.5" />
                            </button>

                            {activeSnippetField === field.id && (
                              <div className="absolute right-0 top-full mt-1 w-60 bg-white border border-slate-200 rounded-lg shadow-xl z-30 p-1.5 space-y-1">
                                <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">
                                  Clinical Snippets
                                </div>
                                {snippets.slice(0, 5).map((s) => (
                                  <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => insertSnippet(field.id, s.text)}
                                    className="w-full text-left px-2 py-1 rounded hover:bg-sky-50 text-xs text-slate-700 block transition-colors"
                                  >
                                    <span className="font-semibold block truncate">{s.title}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">{s.shortcut}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveField(section.id, field.id)}
                            className="text-slate-300 hover:text-rose-600 transition-colors p-0.5"
                            title="Delete row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={field.type === 'textarea' ? 2 : 1}
                        value={textVal}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()} finding...`}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 font-serif leading-relaxed"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}

      {/* BUTTON: + ADD NEW SECTION */}
      <div className="pt-0.5">
        {!isAddingSection ? (
          <button
            type="button"
            onClick={() => setIsAddingSection(true)}
            className="w-full py-2 px-3 bg-white hover:bg-slate-50 border-2 border-dashed border-slate-300 hover:border-sky-400 rounded-xl text-xs font-semibold text-slate-600 hover:text-sky-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <FolderPlus className="w-4 h-4 text-sky-600" />
            <span>+ Add New Section (e.g. Recommendations / Remarks)</span>
          </button>
        ) : (
          <div className="bg-sky-50/70 border border-sky-300 rounded-xl p-3.5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-900 flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-sky-600" /> Create New Report Section
              </span>
              <button
                type="button"
                onClick={() => setIsAddingSection(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Section Title *</label>
              <input
                type="text"
                placeholder="e.g. RECOMMENDATIONS / ADVICE / PELVIS"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingSection(false)}
                className="px-3 py-1 bg-white border border-slate-300 text-slate-600 rounded text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNewSection}
                disabled={!newSectionTitle.trim()}
                className="px-3 py-1 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded text-xs font-bold cursor-pointer"
              >
                Create Section
              </button>
            </div>
          </div>
        )}
      </div>

      {/* IMPRESSION SECTION */}
      <section className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Impression &amp; Diagnosis
          </label>

          {/* User can change Impression Status e.g. Normal or Abnormal */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Status:</span>
            <select
              value={impressionStatus || (suggestions[0]?.toLowerCase().includes('normal') ? 'Normal' : 'Abnormal')}
              onChange={(e) => onImpressionStatusChange && onImpressionStatusChange(e.target.value)}
              className="text-xs font-bold px-2 py-0.5 rounded border border-slate-300 bg-white cursor-pointer"
            >
              <option value="Normal">Normal</option>
              <option value="Abnormal">Abnormal</option>
              <option value="Satisfactory">Satisfactory</option>
              <option value="Inconclusive">Inconclusive</option>
            </select>
          </div>
        </div>

        {/* Suggestion Chips */}
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onImpressionChange(sug)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all text-left ${
                  impression === sug
                    ? 'bg-sky-600 text-white border-sky-600 font-bold shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-sky-50'
                }`}
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        <textarea
          rows={2}
          value={impression}
          onChange={(e) => onImpressionChange(e.target.value)}
          placeholder="Enter clinical impression..."
          className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 font-serif"
        />
      </section>

      {/* DOCTORS & SIGNATURE BLOCK MANAGEMENT */}
      <section className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold text-slate-900">
              Doctors &amp; Signatures
            </h3>
          </div>

          <button
            type="button"
            onClick={() => handleAddDoctor()}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-sky-700 rounded-lg text-xs font-semibold cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Doctor</span>
          </button>
        </div>

        <div className="space-y-2">
          {signatories.map((sig, idx) => (
            <div
              key={sig.id || idx}
              className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs flex items-center justify-between gap-2"
            >
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={sig.name}
                  onChange={(e) => handleSignatoryChange(idx, { name: e.target.value })}
                  placeholder="Doctor Name"
                  className="bg-white border border-slate-300 rounded px-2 py-1 font-bold text-slate-900"
                />
                <input
                  type="text"
                  value={sig.qualifications}
                  onChange={(e) => handleSignatoryChange(idx, { qualifications: e.target.value })}
                  placeholder="Degrees / Qualifications"
                  className="bg-white border border-slate-300 rounded px-2 py-1 font-medium text-slate-800"
                />
              </div>

              {signatories.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveDoctor(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                  title="Remove doctor"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ARRANGE SEQUENCE MODAL */}
      {showReorderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Arrange Headings Sequence
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReorderModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2">
              {template.sections.map((sec, secIdx) => (
                <div key={sec.id} className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-800">{sec.title}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveSectionToPosition(secIdx, secIdx - 1)}
                        disabled={secIdx === 0}
                        className="p-1 bg-white border border-slate-200 rounded text-slate-600 disabled:opacity-30"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSectionToPosition(secIdx, secIdx + 1)}
                        disabled={secIdx === template.sections.length - 1}
                        className="p-1 bg-white border border-slate-200 rounded text-slate-600 disabled:opacity-30"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 pl-2">
                    {sec.fields.map((fld, fldIdx) => (
                      <div
                        key={fld.id}
                        className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-200 text-xs"
                      >
                        <span className="font-medium text-slate-700">{fld.label}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveFieldToPosition(sec.id, fldIdx, fldIdx - 1)}
                            disabled={fldIdx === 0}
                            className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveFieldToPosition(sec.id, fldIdx, fldIdx + 1)}
                            disabled={fldIdx === sec.fields.length - 1}
                            className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowReorderModal(false)}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
