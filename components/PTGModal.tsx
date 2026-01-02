
import React, { useState } from 'react';
import { Project } from '../types';

interface PTGModalProps {
  projects: Project[];
  onSubmit: (ptgData: Record<string, string>) => void;
  onCancel: () => void;
}

export const PTGModal: React.FC<PTGModalProps> = ({ projects, onSubmit, onCancel }) => {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(projects.map(p => [p.code, '']))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 text-white" style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-on-primary)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <i className="fas fa-road-circle-check text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold">Path to Green Required</h3>
              <p className="text-xs opacity-80 uppercase tracking-widest font-semibold">Missing Recovery Plan Details</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <p className="text-sm text-slate-500 leading-relaxed">
            The AI assistant has identified that the following projects are <span style={{ color: 'var(--theme-status-blocked)', fontWeight: 'bold' }}>At Risk</span> or <span style={{ color: 'var(--theme-status-blocked)', fontWeight: 'bold' }}>Blocked</span>, but a clear recovery plan is missing. Please provide the <strong>Path to Green</strong> for each below:
          </p>

          <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {projects.map((project) => (
              <div key={project.id} className="space-y-2">
                <label className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                    {project.code}: {project.name}
                  </span>
                </label>
                <textarea
                  required
                  placeholder={`What are the specific steps to get ${project.code} back on track?`}
                  className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all min-h-[80px] resize-none"
                  value={values[project.code]}
                  onChange={(e) => setValues(prev => ({ ...prev, [project.code]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Skip & Generate Anyway
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2 hover:opacity-90"
              style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-on-primary)' }}
            >
              Continue to Summary <i className="fas fa-arrow-right text-xs"></i>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
