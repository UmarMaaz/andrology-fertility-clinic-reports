import React, { useState } from 'react';
import { QueueItem, Patient, ReportTemplate } from '../types';
import { Clock, CheckCircle2, Play, UserCheck, AlertCircle, Plus, RefreshCw, X, Trash2 } from 'lucide-react';

interface QueueManagerProps {
  queue: QueueItem[];
  patients: Patient[];
  templates: ReportTemplate[];
  onUpdateQueue: (updatedQueue: QueueItem[]) => void;
  onStartReporting: (patientId: string, testName: string) => void;
}

export const QueueManager: React.FC<QueueManagerProps> = ({
  queue,
  patients,
  templates,
  onUpdateQueue,
  onStartReporting,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [selectedTemplateName, setSelectedTemplateName] = useState(templates[0]?.name || '');

  const updateItemStatus = (id: string, newStatus: QueueItem['status']) => {
    const updated = queue.map((item) => (item.id === id ? { ...item, status: newStatus } : item));
    onUpdateQueue(updated);
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (window.confirm(`Remove ${name} from the queue?`)) {
      onUpdateQueue(queue.filter((q) => q.id !== id));
    }
  };

  const handleAddToQueue = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === selectedPatientId);
    if (!pat) return;

    const highestToken = queue.reduce((max, item) => Math.max(max, item.tokenNumber), 100);
    const newItem: QueueItem = {
      id: `q_${Date.now()}`,
      tokenNumber: highestToken + 1,
      patientId: pat.id,
      patientName: pat.name,
      patientAge: pat.age,
      testName: selectedTemplateName,
      status: 'Waiting',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onUpdateQueue([...queue, newItem]);
    setShowAddModal(false);
  };

  const waitingList = queue.filter((q) => q.status === 'Waiting');
  const inProcedureList = queue.filter((q) => q.status === 'In Procedure');
  const completedList = queue.filter((q) => q.status === 'Completed' || q.status === 'In Reporting');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-600" />
            Ultrasound &amp; Lab Walk-In Queue
          </h2>
          <p className="text-xs text-slate-500">
            Real-time procedure room queue and patient check-in management
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Issue Token / Check In</span>
        </button>
      </div>

      {/* 3-Column Queue Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Waiting Room */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Waiting Room ({waitingList.length})
            </span>
          </div>

          <div className="space-y-2.5">
            {waitingList.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-black font-mono text-sky-700">Token #{item.tokenNumber}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.patientName} ({item.patientAge}y)</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{item.testName}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => updateItemStatus(item.id, 'In Procedure')}
                    className="flex-1 text-center px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold cursor-pointer"
                  >
                    Call into Scanning Room &rarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id, item.patientName)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                    title="Remove token from queue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {waitingList.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">No patients currently waiting.</p>
            )}
          </div>
        </div>

        {/* Column 2: In Ultrasound / Procedure Room */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              In Procedure Room ({inProcedureList.length})
            </span>
          </div>

          <div className="space-y-2.5">
            {inProcedureList.map((item) => (
              <div key={item.id} className="bg-white border-2 border-sky-400 rounded-lg p-3 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-black font-mono text-sky-700">Token #{item.tokenNumber}</span>
                  <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-bold">Scanning</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.patientName} ({item.patientAge}y)</h4>
                  <p className="text-[11px] text-slate-600 font-medium">{item.testName}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateItemStatus(item.id, 'Completed');
                      onStartReporting(item.patientId, item.testName);
                    }}
                    className="flex-1 text-center px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold cursor-pointer"
                  >
                    Open Findings Form &rarr;
                  </button>
                </div>
              </div>
            ))}
            {inProcedureList.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">Procedure room ready for next patient.</p>
            )}
          </div>
        </div>

        {/* Column 3: Completed Today */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Completed ({completedList.length})
            </span>
          </div>

          <div className="space-y-2.5">
            {completedList.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500">Token #{item.tokenNumber}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id, item.patientName)}
                      className="p-0.5 text-slate-300 hover:text-red-500 rounded transition-colors cursor-pointer"
                      title="Clear token"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-slate-800">{item.patientName}</h4>
                <p className="text-[11px] text-slate-500">{item.testName}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Token Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Issue Token &amp; Check In</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddToQueue} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.age}y, {p.mrn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Scheduled Diagnostic Procedure</label>
                <select
                  value={selectedTemplateName}
                  onChange={(e) => setSelectedTemplateName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-600 text-white rounded-lg font-bold"
                >
                  Issue Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
