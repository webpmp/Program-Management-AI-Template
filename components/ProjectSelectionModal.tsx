
import React, { useState } from 'react';
import { Project } from '../types';

interface ProjectSelectionModalProps {
  projects: Project[];
  onSubmit: (selectedIds: string[]) => void;
  onCancel: () => void;
}

export const ProjectSelectionModal: React.FC<ProjectSelectionModalProps> = ({ projects, onSubmit, onCancel }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(projects.map(p => p.id));

  const toggleProject = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === projects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(projects.map(p => p.id));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 text-white" style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-on-primary)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <i className="fas fa-list-check text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold">Select Projects</h3>
              <p className="text-xs opacity-80 uppercase tracking-widest font-semibold">Include in Summary</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Project List</span>
            <button 
              onClick={toggleAll}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {selectedIds.length === projects.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {projects.map((project) => (
              <label 
                key={project.id} 
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:bg-slate-50 ${
                  selectedIds.includes(project.id) ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-100'
                }`}
              >
                <div 
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                    selectedIds.includes(project.id) 
                      ? 'bg-indigo-600 border-indigo-600 text-white' 
                      : 'bg-white border-slate-300'
                  }`}
                >
                  {selectedIds.includes(project.id) && <i className="fas fa-check text-[10px]"></i>}
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={selectedIds.includes(project.id)}
                    onChange={() => toggleProject(project.id)}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-700 truncate">{project.name}</div>
                  <div className="text-[10px] font-mono text-slate-400">{project.code}</div>
                </div>
                <div 
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ 
                    backgroundColor: project.status === 'ON TRACK' ? '#10b98120' : project.status === 'AT RISK' ? '#f59e0b20' : '#e11d4820',
                    color: project.status === 'ON TRACK' ? '#059669' : project.status === 'AT RISK' ? '#d97706' : '#be123c'
                  }}
                >
                  {project.status}
                </div>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={() => onSubmit(selectedIds)}
              className="px-6 py-2 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-on-primary)' }}
            >
              Next Step <i className="fas fa-arrow-right text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
