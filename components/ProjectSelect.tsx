
import React from 'react';
import { Project, ThemeConfig } from '../types';

interface ProjectSelectProps {
  projects: Project[];
  value: string;
  onChange: (val: string) => void;
  theme?: ThemeConfig;
}

export const ProjectSelect: React.FC<ProjectSelectProps> = ({ projects, value, onChange, theme }) => {
  const primaryColor = theme?.primary || '#4f46e5';

  return (
    <div className="relative inline-block group">
      <select 
        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10 appearance-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select Project...</option>
        {projects.map(p => (
          <option key={p.code} value={p.code}>
            {p.name} ({p.code})
          </option>
        ))}
      </select>
      <div className="px-2 py-1 rounded text-xs font-bold border min-w-[3.5rem] text-center transition-all flex items-center justify-center gap-1 group-hover:opacity-80"
           style={value ? {
             backgroundColor: `${primaryColor}15`,
             color: primaryColor,
             borderColor: `${primaryColor}40`
           } : {
             backgroundColor: '#f8fafc',
             color: '#94a3b8',
             borderColor: '#e2e8f0'
           }}>
        {value || 'TBD'}
        <i className="fas fa-caret-down text-[8px] opacity-50"></i>
      </div>
    </div>
  );
};
