
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Project, Milestone, ThemeConfig } from '../types';

interface GanttChartProps {
  projects: Project[];
  milestones: Milestone[];
  theme?: ThemeConfig;
}

export const GanttChart: React.FC<GanttChartProps> = ({ projects, milestones, theme }) => {
  const [visibleProjectIds, setVisibleProjectIds] = useState<string[]>(projects.map(p => p.id));
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Sync visibleProjectIds when projects list changes (e.g., a new project is added)
  useEffect(() => {
    setVisibleProjectIds(prev => {
      const existingIds = projects.map(p => p.id);
      // Keep existing selections but add any new projects that might have been added
      const newIds = existingIds.filter(id => !prev.includes(id));
      if (newIds.length > 0) {
        return [...prev, ...newIds];
      }
      // Also remove any that no longer exist
      return prev.filter(id => existingIds.includes(id));
    });
  }, [projects]);

  // Handle click outside for filter dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProjects = useMemo(() => 
    projects.filter(p => visibleProjectIds.includes(p.id)), 
  [projects, visibleProjectIds]);

  const filteredMilestones = useMemo(() => 
    milestones.filter(m => {
      const p = projects.find(proj => proj.code === m.projectCode);
      return p && visibleProjectIds.includes(p.id);
    }), 
  [milestones, projects, visibleProjectIds]);

  const timelineRange = useMemo(() => {
    const allDates = [
      ...filteredProjects.map(p => p.completionDate).filter(Boolean).map(d => new Date(d).getTime()),
      ...filteredMilestones.map(m => m.dueDate).filter(Boolean).map(d => new Date(d).getTime()),
      new Date().getTime()
    ];

    if (allDates.length === 0) return null;

    const min = Math.min(...allDates);
    const max = Math.max(...allDates);
    const padding = 30 * 24 * 60 * 60 * 1000;
    return {
      start: new Date(min - padding),
      end: new Date(max + padding)
    };
  }, [filteredProjects, filteredMilestones]);

  if (!timelineRange || projects.length === 0) return null;

  const getPos = (dateStr: string) => {
    if (!dateStr) return 0;
    const date = new Date(dateStr).getTime();
    const start = timelineRange.start.getTime();
    const diff = date - start;
    return (diff / (timelineRange.end.getTime() - start)) * 100;
  };

  const months = useMemo(() => {
    const res = [];
    const current = new Date(timelineRange.start);
    current.setDate(1);
    while (current < timelineRange.end) {
      res.push({
        name: current.toLocaleString('default', { month: 'short' }),
        year: current.getFullYear(),
        pos: getPos(current.toISOString())
      });
      current.setMonth(current.getMonth() + 1);
    }
    return res;
  }, [timelineRange]);

  const toggleProject = (id: string) => {
    setVisibleProjectIds(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (visibleProjectIds.length === projects.length) {
      setVisibleProjectIds([]);
    } else {
      setVisibleProjectIds(projects.map(p => p.id));
    }
  };

  const primaryColor = theme?.primary || '#4f46e5';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Program Timeline</h2>
          <p className="text-xs text-slate-500">Visualized project milestones and estimated completion dates.</p>
        </div>
        <div className="relative" ref={filterRef}>
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <i className="fas fa-filter text-[10px]"></i>
            Filter Projects ({visibleProjectIds.length}/{projects.length})
          </button>

          {showFilter && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2">
              <div className="p-2 border-b border-slate-100 flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visibility Control</span>
                <button 
                  onClick={toggleAll}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  {visibleProjectIds.length === projects.length ? 'Hide All' : 'Show All'}
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                {projects.map(p => {
                  const isVisible = visibleProjectIds.includes(p.id);
                  return (
                    <div 
                      key={p.id}
                      onClick={() => toggleProject(p.id)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        isVisible ? 'bg-indigo-50/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isVisible ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300'
                      }`}
                      style={isVisible ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}>
                        {isVisible && <i className="fas fa-check text-[8px]"></i>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs truncate ${isVisible ? 'font-bold text-slate-800' : 'text-slate-500'}`}>{p.name}</div>
                        <div className="text-[9px] font-mono text-slate-400">{p.code}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto p-6">
        <div className="min-w-[800px] relative">
          <div className="flex border-b border-slate-100 pb-2 mb-4 relative h-8">
             <div className="w-48 flex-shrink-0 text-xs font-bold text-slate-400 uppercase tracking-wider">Project</div>
             <div className="flex-1 relative">
                {months.map((m, i) => (
                  <div 
                    key={i} 
                    className="absolute text-[10px] font-bold text-slate-400 border-l border-slate-100 pl-2 h-full"
                    style={{ left: `${m.pos}%` }}
                  >
                    {m.name} '{m.year.toString().slice(-2)}
                  </div>
                ))}
             </div>
          </div>

          <div 
            className="absolute top-0 bottom-0 w-px z-10 opacity-40 pointer-events-none"
            style={{ left: `calc(12rem + ${getPos(new Date().toISOString())}%)`, backgroundColor: 'var(--theme-primary)' }}
          >
            <div className="text-white text-[8px] font-bold px-1 rounded-sm absolute -top-4 -translate-x-1/2 shadow-sm" style={{ backgroundColor: 'var(--theme-primary)' }}>TODAY</div>
          </div>

          <div className="space-y-6">
            {filteredProjects.map(project => {
              const projectMilestones = filteredMilestones.filter(m => m.projectCode === project.code);
              return (
                <div key={project.id} className="flex items-center group animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className="w-48 flex-shrink-0 pr-4">
                    <div className="text-sm font-bold text-slate-700 truncate" title={project.name}>{project.name}</div>
                    <div className="text-[10px] font-mono font-bold" style={{ color: 'var(--theme-code)' }}>{project.code}</div>
                  </div>

                  <div className="flex-1 h-8 relative flex items-center">
                    <div className="absolute inset-y-3 left-0 right-0 bg-slate-100 rounded-full opacity-50"></div>
                    
                    {project.completionDate && (
                      <div 
                        className="absolute inset-y-3 border rounded-full opacity-60"
                        style={{ 
                          left: `0%`, 
                          width: `${getPos(project.completionDate)}%`,
                          backgroundColor: 'var(--theme-gantt-bar)',
                          borderColor: 'var(--theme-primary)'
                        }}
                      ></div>
                    )}

                    {projectMilestones.map(m => (
                      <div 
                        key={m.id}
                        className="absolute top-1/2 -translate-y-1/2 group/ms cursor-help"
                        style={{ left: `${getPos(m.dueDate)}%` }}
                      >
                        <div className={`w-3 h-3 rotate-45 border-2 shadow-sm transition-transform group-hover/ms:scale-150 ${
                          m.status === 'Completed' ? 'opacity-100' : 'opacity-80'
                        }`}
                        style={{ 
                          backgroundColor: m.status === 'Completed' ? 'var(--theme-gantt-ms)' : '#fff', 
                          borderColor: 'var(--theme-gantt-ms)' 
                        }}></div>
                        
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/ms:block z-20">
                          <div className="bg-slate-800 text-white text-[10px] p-2 rounded shadow-xl whitespace-nowrap">
                            <div className="font-bold">{m.name}</div>
                            <div className="opacity-80">{m.dueDate} • {m.status}</div>
                          </div>
                          <div className="w-2 h-2 bg-slate-800 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                        </div>
                      </div>
                    ))}

                    {project.completionDate && (
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 group/comp cursor-help"
                        style={{ left: `${getPos(project.completionDate)}%` }}
                      >
                        <div className="w-4 h-4 border-2 rounded-sm rotate-45 shadow-md flex items-center justify-center transition-transform group-hover/comp:scale-125"
                        style={{ backgroundColor: 'var(--theme-gantt-goal)', borderColor: 'var(--theme-gantt-goal)' }}>
                          <i className="fas fa-flag text-[8px] text-white -rotate-45"></i>
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/comp:block z-20">
                          <div className="bg-slate-900 text-white text-[10px] p-2 rounded shadow-xl whitespace-nowrap">
                            <div className="font-bold">Project Complete</div>
                            <div className="opacity-80">{project.completionDate}</div>
                          </div>
                          <div className="w-2 h-2 bg-slate-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredProjects.length === 0 && (
              <div className="py-12 text-center text-slate-400 italic text-sm">
                No projects selected. Use the filter to show data in the timeline.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/30 flex gap-6">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
            <div className="w-2.5 h-2.5 rotate-45" style={{ backgroundColor: 'var(--theme-gantt-ms)' }}></div> Completed Milestone
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
            <div className="w-2.5 h-2.5 rotate-45 border-2" style={{ borderColor: 'var(--theme-gantt-ms)' }}></div> Scheduled Milestone
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
            <div className="w-3 h-3 rotate-45" style={{ backgroundColor: 'var(--theme-gantt-goal)' }}></div> Project Complete
          </div>
      </div>
    </div>
  );
};
