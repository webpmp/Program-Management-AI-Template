
import React, { useState } from 'react';
import { ProgramConfig, ThemeConfig } from '../types';

interface SettingsPageProps {
  config: ProgramConfig;
  onUpdateConfig: (newConfig: ProgramConfig) => void;
  onClose: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ config, onUpdateConfig, onClose }) => {
  const [localConfig, setLocalConfig] = useState<ProgramConfig>(config);

  const updateTheme = (key: keyof ThemeConfig, val: string) => {
    const updated = {
      ...localConfig,
      theme: { ...localConfig.theme, [key]: val }
    };
    setLocalConfig(updated);
    onUpdateConfig(updated);
  };

  const addItem = (key: keyof ProgramConfig) => {
    if (key === 'theme') return;
    const promptMsg = key === 'headerIcons' 
      ? "Add new FontAwesome class (e.g., 'fa-heart'):" 
      : `Add new option for ${key}:`;
    const newItem = prompt(promptMsg);
    if (newItem && newItem.trim()) {
      const updated = { ...localConfig, [key]: [...localConfig[key] as string[], newItem.trim()] };
      setLocalConfig(updated);
      onUpdateConfig(updated);
    }
  };

  const removeItem = (key: keyof ProgramConfig, index: number) => {
    if (key === 'theme') return;
    const updatedItems = [...localConfig[key] as string[]];
    updatedItems.splice(index, 1);
    const updated = { ...localConfig, [key]: updatedItems };
    setLocalConfig(updated);
    onUpdateConfig(updated);
  };

  const editItem = (key: keyof ProgramConfig, index: number) => {
    if (key === 'theme') return;
    const current = (localConfig[key] as string[])[index];
    const promptMsg = key === 'headerIcons' 
      ? "Edit FontAwesome class:" 
      : "Edit option:";
    const updatedValue = prompt(promptMsg, current);
    if (updatedValue && updatedValue.trim() && updatedValue !== current) {
      const updatedItems = [...localConfig[key] as string[]];
      updatedItems[index] = updatedValue.trim();
      const updated = { ...localConfig, [key]: updatedItems };
      setLocalConfig(updated);
      onUpdateConfig(updated);
    }
  };

  const ColorPicker = ({ label, themeKey }: { label: string, themeKey: keyof ThemeConfig }) => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5 pr-3">
        <input 
          type="color" 
          value={localConfig.theme[themeKey]}
          onChange={(e) => updateTheme(themeKey, e.target.value)}
          className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
        />
        <span className="text-xs font-mono text-slate-600 uppercase">{localConfig.theme[themeKey]}</span>
      </div>
    </div>
  );

  const Section = ({ title, configKey, icon, isIconGrid }: { title: string, configKey: keyof ProgramConfig, icon: string, isIconGrid?: boolean }) => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: 'var(--theme-primary)' }}>
            <i className={`fas ${icon} text-xs`}></i>
          </div>
          <h3 className="font-bold text-slate-800">{title}</h3>
        </div>
        <button 
          onClick={() => addItem(configKey)}
          className="text-xs font-bold hover:opacity-70 flex items-center gap-1"
          style={{ color: 'var(--theme-primary)' }}
        >
          <i className="fas fa-plus"></i> Add {isIconGrid ? 'Icon' : 'Option'}
        </button>
      </div>
      <div className={`p-4 flex flex-wrap gap-2 ${isIconGrid ? 'gap-3' : ''}`}>
        {(localConfig[configKey] as string[]).map((item, idx) => (
          <div 
            key={idx} 
            className={`group relative flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all ${
              isIconGrid 
                ? 'w-12 h-12 justify-center rounded-xl text-lg' 
                : 'px-3 py-1.5 rounded-lg text-sm'
            }`}
          >
            {isIconGrid ? (
              <i className={`fas ${item} text-slate-700`}></i>
            ) : (
              <span className="font-medium text-slate-700">{item}</span>
            )}
            
            <div className={`flex gap-1 bg-white/90 backdrop-blur-sm p-1 rounded-lg border border-slate-200 shadow-sm transition-opacity opacity-0 group-hover:opacity-100 absolute ${
              isIconGrid ? '-top-2 -right-2' : 'relative ml-1'
            }`}>
              <button onClick={() => editItem(configKey, idx)} className="text-slate-400 hover:text-indigo-600 p-1">
                <i className="fas fa-edit text-[10px]"></i>
              </button>
              <button onClick={() => removeItem(configKey, idx)} className="text-slate-400 hover:text-rose-600 p-1">
                <i className="fas fa-trash text-[10px]"></i>
              </button>
            </div>
          </div>
        ))}
        {(localConfig[configKey] as string[]).length === 0 && (
          <p className="text-xs text-slate-400 italic py-2">No items defined.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Program <span style={{ color: 'var(--theme-primary)' }}>Settings</span></h2>
          <p className="text-sm text-slate-500">Configure colors, global dropdown options, taxonomy, and theme icons.</p>
        </div>
        <button 
          onClick={onClose}
          className="px-4 py-2 text-white rounded-xl text-sm font-bold transition-all shadow-lg flex items-center gap-2"
          style={{ backgroundColor: 'var(--theme-primary)' }}
        >
          <i className="fas fa-check"></i> Done Editing
        </button>
      </div>

      {/* Theme Customization Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: 'var(--theme-primary)' }}>
            <i className="fas fa-palette text-xs"></i>
          </div>
          <h3 className="font-bold text-slate-800">Theme Colors</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b pb-1">Core UI</h4>
            <ColorPicker label="Primary Accent" themeKey="primary" />
            <ColorPicker label="Button Text" themeKey="onPrimary" />
            <ColorPicker label="Bold Text" themeKey="boldText" />
            <ColorPicker label="Code Badges" themeKey="code" />
          </div>
          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b pb-1">Gantt Chart</h4>
            <ColorPicker label="Project Bar" themeKey="ganttBar" />
            <ColorPicker label="Milestone Diamond" themeKey="ganttMilestone" />
            <ColorPicker label="Project Complete Flag" themeKey="ganttGoal" />
          </div>
          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b pb-1">Status Semantic Colors</h4>
            <ColorPicker label="Not Started" themeKey="statusNotStarted" />
            <ColorPicker label="Planning" themeKey="statusPlanning" />
            <ColorPicker label="On Track" themeKey="statusOnTrack" />
            <ColorPicker label="At Risk" themeKey="statusAtRisk" />
            <ColorPicker label="Blocked" themeKey="statusBlocked" />
            <ColorPicker label="Cancelled" themeKey="statusCancelled" />
            <ColorPicker label="Completed" themeKey="statusCompleted" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Project Statuses" configKey="projectStatuses" icon="fa-chart-line" />
        <Section title="Resource Roles" configKey="resourceRoles" icon="fa-users" />
        <Section title="Milestone Statuses" configKey="milestoneStatuses" icon="fa-flag" />
        <Section title="Deliverable Statuses" configKey="deliverableStatuses" icon="fa-box" />
      </div>

      <div className="mt-6">
        <Section title="Theme Icons" configKey="headerIcons" icon="fa-icons" isIconGrid />
      </div>

      <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 mt-12">
        <h4 className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-widest">About Dynamic Settings</h4>
        <p className="text-sm text-slate-600 leading-relaxed">
          Updates made here will immediately reflect throughout the template. 
          Use standard hex codes or the color picker to match your organization's brand.
        </p>
      </div>
    </div>
  );
};
