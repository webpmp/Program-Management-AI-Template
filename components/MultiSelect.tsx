
import React, { useState, useRef, useEffect } from 'react';
import { ThemeConfig } from '../types';

interface Option {
  label: string; // Project Name
  value: string; // Project Code (P##)
}

interface MultiSelectProps {
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  theme?: ThemeConfig;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ 
  options, 
  selectedValues, 
  onChange,
  placeholder = "Select projects...",
  theme
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (val: string) => {
    const newValues = selectedValues.includes(val)
      ? selectedValues.filter(v => v !== val)
      : [...selectedValues, val];
    onChange(newValues);
  };

  const primaryColor = theme?.primary || '#4f46e5';

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[38px] w-full bg-transparent hover:bg-white border border-slate-200 rounded px-1 py-1 cursor-pointer flex flex-wrap gap-1 items-center transition-colors focus-within:ring-2"
        style={{ borderColor: isOpen ? primaryColor : 'rgba(0,0,0,0.1)' }}
      >
        {selectedValues.length === 0 && (
          <span className="text-xs text-slate-400 px-1">{placeholder}</span>
        )}
        {selectedValues.map(val => (
          <span 
            key={val} 
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border"
            style={{ 
              backgroundColor: `${primaryColor}15`, 
              color: primaryColor, 
              borderColor: `${primaryColor}40` 
            }}
          >
            {val}
            <button 
              onClick={(e) => { e.stopPropagation(); toggleOption(val); }}
              className="hover:opacity-70"
            >
              <i className="fas fa-times scale-75"></i>
            </button>
          </span>
        ))}
        <div className="ml-auto pr-1">
          <i className={`fas fa-chevron-down text-[10px] text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-[100] mt-1 w-full min-w-[220px] bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1">
          <div className="max-h-60 overflow-y-auto">
            {options.map(opt => {
              const isSelected = selectedValues.includes(opt.value);
              return (
                <div 
                  key={opt.value}
                  onClick={() => toggleOption(opt.value)}
                  className={`flex items-center gap-3 px-3 py-2 text-xs cursor-pointer transition-colors ${
                    isSelected ? 'font-semibold' : 'hover:bg-slate-50 text-slate-600'
                  }`}
                  style={isSelected ? { backgroundColor: `${primaryColor}10`, color: primaryColor } : {}}
                >
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                    isSelected ? 'text-white' : 'border-slate-300 bg-white'
                  }`}
                  style={isSelected ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}>
                    {isSelected && <i className="fas fa-check text-[8px]"></i>}
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <span className="truncate pr-2">{opt.label}</span>
                    <span className="text-[9px] opacity-60 font-mono whitespace-nowrap">{opt.value}</span>
                  </div>
                </div>
              );
            })}
            {options.length === 0 && (
              <div className="px-3 py-4 text-center text-slate-400 italic text-xs">
                No projects available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
