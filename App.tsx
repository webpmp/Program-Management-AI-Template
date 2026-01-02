
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { INITIAL_DATA } from './constants';
import { Project, Resource, Deliverable, Milestone, ProgramData, ProjectStatus, ProgramConfig } from './types';
import { DataTable } from './components/DataTable';
import { AgentPanel } from './components/AgentPanel';
import { ProgramSummary } from './components/ProgramSummary';
import { MultiSelect } from './components/MultiSelect';
import { ProjectSelect } from './components/ProjectSelect';
import { GanttChart } from './components/GanttChart';
import { SettingsPage } from './components/SettingsPage';

type SectionId = 'summary' | 'timeline' | 'projects' | 'resources' | 'milestones' | 'deliverables';

// Consistent column widths for stable alignment and preventing horizontal overflow
const COL1_WIDTH = "w-56"; // Name columns (224px)
const COL2_WIDTH = "w-40"; // Unique ID columns (160px)
const REF_COL_WIDTH = "w-32"; // Project Code reference dropdowns (128px)
const DATE_COL_WIDTH = "w-32"; // Date columns (128px)
const STATUS_COL_WIDTH = "w-56"; // Status columns (224px)

const ROLE_PREFIX_MAP: Record<string, string> = {
  'UX Designer': 'UXD',
  'UX Program Manager': 'UXPM',
  'Visual Designer': 'VD',
  'Motion Designer': 'MD',
  'Lead': 'L',
  'Engineer': 'ENG',
  'Design Manager': 'DM',
  'Product Manager': 'PM',
  'QA': 'QA',
  'Agency': 'AGCY',
  'Contractor': 'CON'
};

// Help Modal Component
const HelpModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between" style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-on-primary)' }}>
          <div className="flex items-center gap-3">
            <i className="fas fa-question-circle text-xl"></i>
            <h3 className="text-lg font-bold">PM Instructions & Help</h3>
          </div>
          <button onClick={onClose} className="hover:opacity-70 transition-opacity">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="p-8">
          <ul className="space-y-4">
            <li className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-slate-500">1</div>
              <p className="text-sm text-slate-600 leading-relaxed">Hover over any section to see <strong>reorder controls</strong> (Up/Down arrows) on the left of the section.</p>
            </li>
            <li className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-slate-500">2</div>
              <p className="text-sm text-slate-600 leading-relaxed">Click the icon next to the title or the program name itself to change them instantly.</p>
            </li>
            <li className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-slate-500">3</div>
              <p className="text-sm text-slate-600 leading-relaxed">Update table rows inline. Your focus is preserved during typing for efficient editing.</p>
            </li>
            <li className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-slate-500">4</div>
              <p className="text-sm text-slate-600 leading-relaxed">The <strong>AI Agent</strong> is on the right sidebar. Expand it to ask complex questions about your program data.</p>
            </li>
            <li className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-slate-500">5</div>
              <p className="text-sm text-slate-600 leading-relaxed">Use <strong>Program Settings</strong> in the footer to customize dropdown options, icons, and theme colors.</p>
            </li>
            <li className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-slate-500">6</div>
              <p className="text-sm text-slate-600 leading-relaxed">All date fields feature a <strong>custom-styled Date Picker</strong> for a cohesive aesthetic.</p>
            </li>
            <li className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-slate-500">7</div>
              <p className="text-sm text-slate-600 leading-relaxed">Role codes are <strong>automatically generated</strong> based on the selected Role for each resource.</p>
            </li>
          </ul>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-sm font-bold shadow-lg transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-on-primary)' }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

// Component for editing multiple links
const MultiLinkEditor: React.FC<{
  links: string[];
  onChange: (links: string[]) => void;
}> = ({ links, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);

  const addLink = () => {
    onChange([...links, '']);
  };

  const updateLink = (index: number, val: string) => {
    const newLinks = [...links];
    newLinks[index] = val;
    onChange(newLinks);
  };

  const removeLink = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  if (!isEditing && links.length === 0) {
    return (
      <button 
        onClick={() => { setIsEditing(true); addLink(); }}
        className="text-[10px] font-bold uppercase tracking-tighter hover:opacity-70 transition-opacity"
        style={{ color: 'var(--theme-primary)' }}
      >
        <i className="fas fa-plus mr-1"></i> Add Link
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 pr-2">
      {links.map((link, idx) => (
        <div key={idx} className="flex items-center gap-1 group/link">
          <div className="flex-1 relative">
            <input 
              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-[10px] text-blue-600 underline outline-none transition-all focus:bg-white"
              style={{ borderColor: 'rgba(0,0,0,0.1)' }}
              value={link}
              onChange={(e) => updateLink(idx, e.target.value)}
              placeholder="https://..."
              onFocus={() => setIsEditing(true)}
            />
            {link && (
              <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:opacity-70"
                style={{ color: 'var(--theme-primary)' }}
              >
                <i className="fas fa-external-link-alt text-[9px]"></i>
              </a>
            )}
          </div>
          <button 
            onClick={() => removeLink(idx)}
            className="text-slate-300 hover:text-rose-500 transition-colors p-1"
            title="Remove Link"
          >
            <i className="fas fa-trash-alt text-[9px]"></i>
          </button>
        </div>
      ))}
      <button 
        onClick={addLink}
        className="text-[9px] font-bold uppercase tracking-tighter mt-1 self-start hover:opacity-70 transition-opacity"
        style={{ color: 'var(--theme-primary)' }}
      >
        <i className="fas fa-plus mr-1"></i> Add Another
      </button>
    </div>
  );
};

// Standardized Date Input component for better UI/UX
const DateInput: React.FC<{
  value: string;
  onChange: (val: string) => void;
  className?: string;
}> = ({ value, onChange, className }) => {
  return (
    <div className="relative group/date">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${className} w-full bg-slate-50/50 hover:bg-white border border-slate-200 rounded px-1.5 py-1 text-xs transition-all outline-none cursor-pointer text-slate-600 font-medium`}
      />
    </div>
  );
};

// Simple auto-resizing textarea component for inline status details
const AutoResizingTextarea: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder, className }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${className} overflow-hidden resize-none`}
    />
  );
};

const SectionWrapper: React.FC<{ 
  id: SectionId; 
  children: React.ReactNode; 
  isFirst: boolean; 
  isLast: boolean; 
  onMove: (id: SectionId, dir: 'up' | 'down') => void;
}> = ({ id, children, isFirst, isLast, onMove }) => (
  <div className="relative group/section mb-8">
    {/* Reorder Controls */}
    <div className="absolute -left-10 top-4 flex flex-col gap-1 opacity-0 group-hover/section:opacity-100 transition-opacity">
      <button 
        onClick={() => onMove(id, 'up')}
        disabled={isFirst}
        className={`w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:border-slate-300 transition-all ${isFirst ? 'opacity-30 cursor-not-allowed' : 'shadow-sm'}`}
        title="Move Up"
      >
        <i className="fas fa-chevron-up text-[10px]"></i>
      </button>
      <button 
        onClick={() => onMove(id, 'down')}
        disabled={isLast}
        className={`w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:border-slate-300 transition-all ${isLast ? 'opacity-30 cursor-not-allowed' : 'shadow-sm'}`}
        title="Move Down"
      >
        <i className="fas fa-chevron-down text-[10px]"></i>
      </button>
    </div>
    {children}
  </div>
);

const App: React.FC = () => {
  const [data, setData] = useState<ProgramData>(INITIAL_DATA);
  const [programSummary, setProgramSummary] = useState('');
  const [headerIcon, setHeaderIcon] = useState('fa-layer-group');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [view, setView] = useState<'dashboard' | 'settings'>('dashboard');
  
  // Section ordering state
  const [sectionOrder, setSectionOrder] = useState<SectionId[]>([
    'summary', 
    'timeline', 
    'projects', 
    'resources', 
    'milestones', 
    'deliverables'
  ]);

  const theme = data.config.theme;

  // Dynamically inject theme CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-on-primary', theme.onPrimary);
    root.style.setProperty('--theme-code', theme.code);
    root.style.setProperty('--theme-bold', theme.boldText);
    root.style.setProperty('--theme-gantt-bar', theme.ganttBar);
    root.style.setProperty('--theme-gantt-ms', theme.ganttMilestone);
    root.style.setProperty('--theme-gantt-goal', theme.ganttGoal);
    root.style.setProperty('--theme-status-notstarted', theme.statusNotStarted);
    root.style.setProperty('--theme-status-planning', theme.statusPlanning);
    root.style.setProperty('--theme-status-ontrack', theme.statusOnTrack);
    root.style.setProperty('--theme-status-atrisk', theme.statusAtRisk);
    root.style.setProperty('--theme-status-blocked', theme.statusBlocked);
    root.style.setProperty('--theme-status-completed', theme.statusCompleted);
    root.style.setProperty('--theme-status-cancelled', theme.statusCancelled);
  }, [theme]);

  const moveSection = useCallback((id: SectionId, direction: 'up' | 'down') => {
    setSectionOrder(prev => {
      const currentIndex = prev.indexOf(id);
      const newOrder = [...prev];
      if (direction === 'up' && currentIndex > 0) {
        [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
      } else if (direction === 'down' && currentIndex < newOrder.length - 1) {
        [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      }
      return newOrder;
    });
  }, []);

  const updateProject = useCallback((id: string, field: keyof Project, value: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  }, []);

  const updateResource = useCallback((id: string, field: keyof Resource, value: any) => {
    setData(prev => ({
      ...prev,
      resources: prev.resources.map(r => r.id === id ? { ...r, [field]: value } : r)
    }));
  }, []);

  const updateMilestone = useCallback((id: string, field: keyof Milestone, value: string) => {
    setData(prev => ({
      ...prev,
      milestones: prev.milestones.map(m => m.id === id ? { ...m, [field]: value } : m)
    }));
  }, []);

  const updateDeliverable = useCallback((id: string, field: keyof Deliverable, value: any) => {
    setData(prev => ({
      ...prev,
      deliverables: prev.deliverables.map(d => d.id === id ? { ...d, [field]: value } : d)
    }));
  }, []);

  const updateConfig = useCallback((newConfig: ProgramConfig) => {
    setData(prev => ({ ...prev, config: newConfig }));
    if (!newConfig.headerIcons.includes(headerIcon)) {
      setHeaderIcon(newConfig.headerIcons[0] || 'fa-layer-group');
    }
  }, [headerIcon]);

  const addProject = () => {
    const nextCode = `P${String(data.projects.length + 1).padStart(2, '0')}`;
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: 'New Project',
      code: nextCode,
      description: 'Enter description...',
      completionDate: '',
      status: data.config.projectStatuses[0] || 'NOT STARTED',
      statusDetails: ''
    };
    setData(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
  };

  const generateRoleCode = (role: string, existingResources: Resource[], currentResourceId: string) => {
    const prefix = ROLE_PREFIX_MAP[role] || 'RES';
    const regex = new RegExp(`^${prefix}(\\d+)$`);
    const existingNumbers = existingResources
      .filter(r => r.id !== currentResourceId)
      .map(r => {
        const match = r.roleCode.match(regex);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter((n): n is number => n !== null);
    
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    return `${prefix}${String(nextNumber).padStart(2, '0')}`;
  };

  const addResource = () => {
    const newResource: Resource = {
      id: crypto.randomUUID(),
      name: 'New Resource',
      role: '', 
      roleCode: '', 
      allocation: '100%',
      projectAssignments: []
    };
    setData(prev => ({ ...prev, resources: [...prev.resources, newResource] }));
  };

  const addMilestone = () => {
    const nextCode = `M${String(data.milestones.length + 1).padStart(2, '0')}`;
    const newMilestone: Milestone = {
      id: crypto.randomUUID(),
      name: 'New Milestone',
      code: nextCode,
      projectCode: data.projects[0]?.code || 'P01',
      dueDate: '2026-01-01',
      status: data.config.milestoneStatuses[0] || 'TBD',
      statusDetails: ''
    };
    setData(prev => ({ ...prev, milestones: [...prev.milestones, newMilestone] }));
  };

  const addDeliverable = () => {
    const nextCode = `D${String(data.deliverables.length + 1).padStart(2, '0')}`;
    const newDeliverable: Deliverable = {
      id: crypto.randomUUID(),
      name: 'New Deliverable',
      code: nextCode,
      projectCode: data.projects.length === 1 ? data.projects[0].code : '',
      links: [],
      dueDate: '2026-01-01',
      status: data.config.deliverableStatuses[0] || 'Not Started'
    };
    setData(prev => ({ ...prev, deliverables: [...prev.deliverables, newDeliverable] }));
  };

  const getCommonSelectStyle = () => "text-[10px] font-bold border rounded px-1 py-1 outline-none transition-colors cursor-pointer hover:border-opacity-50";

  const getStatusStyle = (status: ProjectStatus) => {
    const s = status.toUpperCase();
    let color = theme.statusNotStarted;
    if (s.includes('PLANNING')) color = theme.statusPlanning;
    if (s.includes('ON TRACK')) color = theme.statusOnTrack;
    if (s.includes('AT RISK')) color = theme.statusAtRisk;
    if (s.includes('BLOCKED')) color = theme.statusBlocked;
    if (s.includes('COMPLETED')) color = theme.statusCompleted;
    if (s.includes('CANCELLED')) color = theme.statusCancelled;
    
    return {
      backgroundColor: `${color}15`,
      color: color,
      borderColor: `${color}40`
    };
  };

  const getMilestoneStatusStyle = (status: string) => {
    if (status === 'Completed') return getStatusStyle('COMPLETED');
    if (status === 'Scheduled') return getStatusStyle('PLANNING');
    return getStatusStyle('NOT STARTED');
  };

  const getDeliverableStatusStyle = (status: string) => {
    if (status === 'Completed') return getStatusStyle('COMPLETED');
    if (status === 'In Progress') return getStatusStyle('ON TRACK');
    if (status === 'On Hold') return getStatusStyle('AT RISK');
    if (status === 'Review') return getStatusStyle('PLANNING');
    return getStatusStyle('NOT STARTED');
  };

  const codeInputStyle = "font-mono px-1.5 py-1 rounded text-[11px] font-bold border w-16 text-center focus:bg-white outline-none transition-all cursor-text";
  const codeInlineStyle = { backgroundColor: `${theme.code}10`, color: theme.code, borderColor: `${theme.code}20` };

  // Memoized table columns
  const projectColumns = useMemo(() => [
    { 
      header: 'Project Name', 
      accessor: 'name' as const,
      width: COL1_WIDTH,
      render: (p: Project) => (
        <input 
          className="bg-transparent focus:bg-white border-none rounded px-1 w-full font-semibold"
          style={{ color: 'var(--theme-bold)' }}
          value={p.name}
          onChange={(e) => updateProject(p.id, 'name', e.target.value)}
        />
      )
    },
    { 
      header: 'PROJECT CODE', 
      accessor: 'code' as const,
      width: COL2_WIDTH,
      render: (p: Project) => (
        <input 
          className={codeInputStyle}
          style={codeInlineStyle}
          value={p.code}
          onChange={(e) => updateProject(p.id, 'code', e.target.value)}
        />
      )
    },
    { 
      header: 'Description', 
      accessor: 'description' as const,
      width: "w-44",
      render: (p: Project) => (
        <div className="max-w-[40ch]">
          <textarea 
            rows={2}
            maxLength={120}
            className="bg-transparent focus:bg-white border-none rounded px-1 w-full text-[11px] resize-none overflow-hidden leading-tight"
            value={p.description}
            onChange={(e) => updateProject(p.id, 'description', e.target.value)}
            placeholder="Description..."
          />
        </div>
      )
    },
    { 
      header: 'Est. Completion', 
      accessor: 'completionDate' as const,
      width: DATE_COL_WIDTH,
      render: (p: Project) => (
        <DateInput 
          value={p.completionDate}
          onChange={(val) => updateProject(p.id, 'completionDate', val)}
        />
      )
    },
    { 
      header: 'Status', 
      accessor: 'status' as const,
      width: "w-72",
      render: (p: Project) => (
        <div className="flex flex-col gap-1.5">
          <select 
            className={getCommonSelectStyle()}
            style={getStatusStyle(p.status)}
            value={p.status}
            onChange={(e) => updateProject(p.id, 'status', e.target.value)}
          >
            {data.config.projectStatuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <AutoResizingTextarea
            placeholder="Status details..."
            className="bg-transparent focus:bg-white border-none rounded px-1 w-full text-[10px] py-1 leading-normal text-slate-500 italic min-h-[1.5rem]"
            value={p.statusDetails}
            onChange={(val) => updateProject(p.id, 'statusDetails', val)}
          />
        </div>
      )
    },
  ], [data.config.projectStatuses, updateProject, theme]);

  const resourceColumns = useMemo(() => [
    { 
      header: 'Name', 
      accessor: 'name' as const,
      width: COL1_WIDTH,
      render: (r: Resource) => (
        <input 
          className="bg-transparent focus:bg-white border-none rounded px-1 w-full font-medium"
          value={r.name}
          onChange={(e) => updateResource(r.id, 'name', e.target.value)}
        />
      )
    },
    { 
      header: 'Role Code', 
      accessor: 'roleCode' as const,
      width: COL2_WIDTH,
      render: (r: Resource) => (
        <input 
          className={codeInputStyle}
          style={codeInlineStyle}
          value={r.roleCode}
          onChange={(e) => updateResource(r.id, 'roleCode', e.target.value)}
        />
      )
    },
    { 
      header: 'Role', 
      accessor: 'role' as const,
      width: 'w-40',
      render: (r: Resource) => (
        <select 
          className={`${getCommonSelectStyle()} bg-slate-50 text-slate-700 border-slate-200 w-full`}
          value={r.role}
          onChange={(e) => {
            const newRole = e.target.value;
            setData(prev => {
              const updatedResources = prev.resources.map(res => {
                if (res.id === r.id) {
                  const updatedRes = { ...res, role: newRole };
                  if (newRole) {
                    updatedRes.roleCode = generateRoleCode(newRole, prev.resources, r.id);
                  }
                  return updatedRes;
                }
                return res;
              });
              return { ...prev, resources: updatedResources };
            });
          }}
        >
          <option value="">Role...</option>
          {data.config.resourceRoles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      )
    },
    { 
      header: '% Allocation', 
      accessor: 'allocation' as const,
      width: 'w-24', 
      render: (r: Resource) => (
        <input 
          className="bg-transparent focus:bg-white border border-slate-200 rounded px-1 py-1 w-16 text-center text-xs font-bold text-slate-700 outline-none"
          value={r.allocation}
          onChange={(e) => updateResource(r.id, 'allocation', e.target.value)}
          placeholder="100%"
        />
      )
    },
    { 
      header: 'Project Code', 
      accessor: 'projectAssignments' as const,
      width: 'w-56',
      render: (r: Resource) => (
        <MultiSelect 
          options={data.projects.map(p => ({ label: p.name, value: p.code }))}
          selectedValues={r.projectAssignments}
          onChange={(vals) => updateResource(r.id, 'projectAssignments', vals)}
          placeholder="Projects..."
          theme={theme}
        />
      )
    },
  ], [data.config.resourceRoles, data.projects, updateResource, theme]);

  const milestoneColumns = useMemo(() => [
    { 
      header: 'Milestone', 
      accessor: 'name' as const,
      width: COL1_WIDTH,
      render: (m: Milestone) => (
        <input 
          className="bg-transparent focus:bg-white border-none rounded px-1 w-full font-medium"
          value={m.name}
          onChange={(e) => updateMilestone(m.id, 'name', e.target.value)}
          placeholder="e.g. Review"
        />
      )
    },
    { 
      header: 'Milestone Code', 
      accessor: 'code' as const,
      width: COL2_WIDTH,
      render: (m: Milestone) => (
        <input 
          className={codeInputStyle}
          style={codeInlineStyle}
          value={m.code}
          onChange={(e) => updateMilestone(m.id, 'code', e.target.value)}
        />
      )
    },
    { 
      header: 'Project Code', 
      accessor: 'projectCode' as const,
      width: REF_COL_WIDTH,
      render: (m: Milestone) => (
        <ProjectSelect 
          projects={data.projects}
          value={m.projectCode}
          onChange={(val) => updateMilestone(m.id, 'projectCode', val)}
          theme={theme}
        />
      )
    },
    { 
      header: 'Milestone Date', 
      accessor: 'dueDate' as const,
      width: DATE_COL_WIDTH,
      render: (m: Milestone) => (
        <DateInput 
          value={m.dueDate}
          onChange={(val) => updateMilestone(m.id, 'dueDate', val)}
        />
      )
    },
    { 
      header: 'Status', 
      accessor: 'status' as const,
      width: "w-72", // Increased width to accommodate status details
      render: (m: Milestone) => (
        <div className="flex flex-col gap-1.5">
          <select 
            className={getCommonSelectStyle()}
            style={getMilestoneStatusStyle(m.status)}
            value={m.status}
            onChange={(e) => updateMilestone(m.id, 'status', e.target.value)}
          >
            {data.config.milestoneStatuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <AutoResizingTextarea
            placeholder="Status details..."
            className="bg-transparent focus:bg-white border-none rounded px-1 w-full text-[10px] py-1 leading-normal text-slate-500 italic min-h-[1.5rem]"
            value={m.statusDetails}
            onChange={(val) => updateMilestone(m.id, 'statusDetails', val)}
          />
        </div>
      )
    },
  ], [data.config.milestoneStatuses, data.projects, updateMilestone, theme]);

  const deliverableColumns = useMemo(() => [
    { 
      header: 'Deliverable', 
      accessor: 'name' as const,
      width: "w-44", // Reduced name width to make space for wider Code/Ref columns
      render: (d: Deliverable) => (
        <input 
          className="bg-transparent focus:bg-white border-none rounded px-1 w-full font-medium text-xs"
          value={d.name}
          onChange={(e) => updateDeliverable(d.id, 'name', e.target.value)}
        />
      )
    },
    { 
      header: 'Deliverables Code', 
      accessor: 'code' as const,
      width: "w-52", // Increased width to accommodate 'DELIVERABLES CODE' without truncation
      render: (d: Deliverable) => (
        <input 
          className={codeInputStyle}
          style={codeInlineStyle}
          value={d.code}
          onChange={(e) => updateDeliverable(d.id, 'code', e.target.value)}
        />
      )
    },
    { 
      header: 'Project Code', 
      accessor: 'projectCode' as const,
      width: "w-44", // Increased width to accommodate 'PROJECT CODE' without truncation
      render: (d: Deliverable) => (
        <ProjectSelect 
          projects={data.projects}
          value={d.projectCode}
          onChange={(val) => updateDeliverable(d.id, 'projectCode', val)}
          theme={theme}
        />
      )
    },
    { 
      header: 'Links', 
      accessor: 'links' as const,
      width: 'w-[201px]', 
      render: (d: Deliverable) => (
        <MultiLinkEditor 
          links={d.links || []} 
          onChange={(newLinks) => updateDeliverable(d.id, 'links', newLinks)} 
        />
      )
    },
    { 
      header: 'Due Date', 
      accessor: 'dueDate' as const,
      width: "w-28", // Slightly reduced date width to fit overall width
      render: (d: Deliverable) => (
        <DateInput 
          value={d.dueDate}
          onChange={(val) => updateDeliverable(d.id, 'dueDate', val)}
        />
      )
    },
    { 
      header: 'Status', 
      accessor: 'status' as const,
      width: 'w-[214px]', 
      render: (d: Deliverable) => (
        <select 
          className={getCommonSelectStyle()}
          style={getDeliverableStatusStyle(d.status)}
          value={d.status}
          onChange={(e) => updateDeliverable(d.id, 'status', e.target.value)}
        >
          {data.config.deliverableStatuses.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )
    },
  ], [data.config.deliverableStatuses, data.projects, updateDeliverable, theme]);

  const renderSection = (id: SectionId) => {
    const isFirst = sectionOrder[0] === id;
    const isLast = sectionOrder[sectionOrder.length - 1] === id;

    switch (id) {
      case 'summary':
        return (
          <div key={id}>
            <SectionWrapper id={id} isFirst={isFirst} isLast={isLast} onMove={moveSection}>
              <ProgramSummary 
                data={data} 
                summary={programSummary} 
                onSummaryChange={setProgramSummary} 
              />
            </SectionWrapper>
            <div className="flex items-center gap-4 mt-2 mb-10 px-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
              <div className="flex gap-1.5 items-center">
                <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--theme-primary)' }}></div>
                <div className="w-1 h-1 rounded-full bg-slate-200"></div>
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-300 to-transparent"></div>
            </div>
          </div>
        );
      case 'timeline':
        return (
          <SectionWrapper key={id} id={id} isFirst={isFirst} isLast={isLast} onMove={moveSection}>
            <GanttChart 
              projects={data.projects} 
              milestones={data.milestones} 
              theme={theme}
            />
          </SectionWrapper>
        );
      case 'projects':
        return (
          <SectionWrapper key={id} id={id} isFirst={isFirst} isLast={isLast} onMove={moveSection}>
            <DataTable<Project>
              title="Projects"
              description="High-level project tracking with status and estimation."
              data={data.projects}
              onAddRow={addProject}
              addButtonLabel="Add Project"
              columns={projectColumns}
              theme={theme}
            />
          </SectionWrapper>
        );
      case 'resources':
        return (
          <SectionWrapper key={id} id={id} isFirst={isFirst} isLast={isLast} onMove={moveSection}>
            <DataTable<Resource>
              title="Resources"
              description="Team member allocation and project assignments."
              data={data.resources}
              onAddRow={addResource}
              addButtonLabel="Add Resource"
              columns={resourceColumns}
              theme={theme}
            />
          </SectionWrapper>
        );
      case 'milestones':
        return (
          <SectionWrapper key={id} id={id} isFirst={isFirst} isLast={isLast} onMove={moveSection}>
            <DataTable<Milestone>
              title="Milestones"
              description="Important upcoming events for each project (Reviews, Handoffs, etc)."
              data={data.milestones}
              onAddRow={addMilestone}
              addButtonLabel="Add Milestone"
              columns={milestoneColumns}
              theme={theme}
            />
          </SectionWrapper>
        );
      case 'deliverables':
        return (
          <SectionWrapper key={id} id={id} isFirst={isFirst} isLast={isLast} onMove={moveSection}>
            <DataTable<Deliverable>
              title="Deliverables"
              description="Specific project outcomes, links, and due dates."
              data={data.deliverables}
              onAddRow={addDeliverable}
              addButtonLabel="Add Deliverable"
              columns={deliverableColumns}
              theme={theme}
            />
          </SectionWrapper>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex">
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
      
      <div className="flex-1 flex flex-col transition-all duration-300 pr-12 lg:pr-12">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3 relative">
              <button 
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-on-primary)' }}
                title="Change Icon"
              >
                <i className={`fas ${headerIcon} text-lg`}></i>
              </button>
              
              {showIconPicker && (
                <div className="absolute top-12 left-0 bg-white border border-slate-200 rounded-xl shadow-xl p-2 flex flex-wrap max-w-xs gap-2 z-50 animate-in fade-in slide-in-from-top-2">
                  {data.config.headerIcons.map(icon => (
                    <button
                      key={icon}
                      onClick={() => {
                        setHeaderIcon(icon);
                        setShowIconPicker(false);
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-100"
                      style={{ color: headerIcon === icon ? 'var(--theme-primary)' : '#64748b' }}
                    >
                      <i className={`fas ${icon} text-sm`}></i>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-1 group/title">
                <input 
                  className="text-xl font-extrabold text-slate-800 tracking-tight bg-transparent border-none hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 rounded px-1 -ml-1 outline-none transition-all cursor-pointer focus:cursor-text"
                  value={data.programName}
                  onChange={(e) => setData(prev => ({ ...prev, programName: e.target.value }))}
                  placeholder="Enter Program Name..."
                  title="Click to edit Program Name"
                />
                <i className="fas fa-pen text-[10px] text-slate-300 opacity-0 group-hover/title:opacity-100 transition-opacity"></i>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

              <div className="hidden md:flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-tight">Total Projects</span>
                  <span className="text-lg font-bold text-slate-800">{data.projects.length}</span>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-tight">Resources</span>
                  <span className="text-lg font-bold text-slate-800">{data.resources.length}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8 w-full">
          {view === 'settings' ? (
            <SettingsPage 
              config={data.config} 
              onUpdateConfig={updateConfig} 
              onClose={() => setView('dashboard')} 
            />
          ) : (
            <>
              <div className="space-y-2">
                {sectionOrder.map((id) => renderSection(id))}
              </div>

              <div className="flex items-center gap-4 my-12 opacity-50">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--theme-primary)' }}></div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
              </div>
            </>
          )}
        </main>

        <footer className="mt-auto py-12 px-4 border-t border-slate-200 bg-white/50">
          <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setView(view === 'dashboard' ? 'settings' : 'dashboard')}
                className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2"
                style={{ color: view === 'settings' ? 'var(--theme-primary)' : '' }}
              >
                <i className={`fas ${view === 'settings' ? 'fa-chart-pie' : 'fa-cog'}`}></i>
                {view === 'settings' ? 'Back to Dashboard' : 'Program Settings'}
              </button>
              
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>

              <button 
                onClick={() => setShowHelpModal(true)}
                className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-question-circle"></i>
                Help
              </button>
            </div>
            
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              ©2026 Program Management AI Template by Chris Adkins
            </p>
          </div>
        </footer>
      </div>

      <AgentPanel data={data} />
    </div>
  );
};

export default App;
