
import React, { useState, useMemo } from 'react';
import { ProgramData, Project } from '../types';
import { generateProgramSummary, identifyMissingPTG } from '../services/geminiService';
import { marked } from 'marked';
import { PTGModal } from './PTGModal';
import { ProjectSelectionModal } from './ProjectSelectionModal';

interface ProgramSummaryProps {
  data: ProgramData;
  summary: string;
  onSummaryChange: (val: string) => void;
}

export const ProgramSummary: React.FC<ProgramSummaryProps> = ({ data, summary, onSummaryChange }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [originalSummary, setOriginalSummary] = useState('');
  
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showPTGModal, setShowPTGModal] = useState(false);
  const [projectsNeedingPTG, setProjectsNeedingPTG] = useState<Project[]>([]);
  const [activeSelectionIds, setActiveSelectionIds] = useState<string[]>([]);

  const getFormattedDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    });
  };

  const executeFinalSummary = async (ids: string[], ptgContext?: Record<string, string>) => {
    setIsGenerating(true);
    const result = await generateProgramSummary(data, ptgContext, ids);
    const dateStr = getFormattedDate();
    const finalResult = `**As of: ${dateStr}**\n\n${result}`;
    onSummaryChange(finalResult);
    setIsGenerating(false);
    setIsEditing(true);
    // Cleanup
    setActiveSelectionIds([]);
  };

  const handleStartGeneration = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) setOriginalSummary(summary);
    setShowSelectionModal(true);
  };

  const handleSelectionSubmit = async (ids: string[]) => {
    setActiveSelectionIds(ids);
    setShowSelectionModal(false);
    setIsGenerating(true);

    // Identify PTG only for selected projects
    const missingPTGCodes = await identifyMissingPTG(data, ids);
    const projectsToAskFor = data.projects.filter(p => missingPTGCodes.includes(p.code));

    if (projectsToAskFor.length > 0) {
      setProjectsNeedingPTG(projectsToAskFor);
      setShowPTGModal(true);
      setIsGenerating(false);
    } else {
      await executeFinalSummary(ids);
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const renderedMarkdown = useMemo(() => {
    if (!summary) return null;
    try {
      const html = marked.parse(summary);
      return typeof html === 'string' ? html : '';
    } catch (e) {
      return summary;
    }
  }, [summary]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8 transition-all hover:shadow-md">
      {showSelectionModal && (
        <ProjectSelectionModal 
          projects={data.projects}
          onCancel={() => setShowSelectionModal(false)}
          onSubmit={handleSelectionSubmit}
        />
      )}

      {showPTGModal && (
        <PTGModal 
          projects={projectsNeedingPTG} 
          onCancel={() => {
            setShowPTGModal(false);
            executeFinalSummary(activeSelectionIds);
          }} 
          onSubmit={(ptgData) => {
            setShowPTGModal(false);
            executeFinalSummary(activeSelectionIds, ptgData);
          }} 
        />
      )}

      <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4" style={{ backgroundColor: 'rgba(var(--theme-primary-rgb), 0.05)' }}>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Executive Summary</h2>
          <p className="text-xs text-slate-500">A high-level overview of all active projects and health.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopy}
            disabled={!summary}
            className={`px-3 py-1.5 border border-slate-200 bg-white rounded-md text-xs font-semibold transition-all flex items-center gap-2 ${!summary ? 'opacity-50' : 'hover:bg-slate-50 text-slate-600'}`}
          >
            <i className={`fas ${copied ? 'fa-check text-green-500' : 'fa-copy'}`}></i>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="p-6 relative">
        {isEditing ? (
          <textarea
            className="w-full h-64 p-4 bg-white border-2 rounded-xl text-sm text-slate-700 focus:outline-none transition-all leading-relaxed font-mono"
            style={{ borderColor: 'var(--theme-primary)' }}
            value={summary}
            onChange={(e) => onSummaryChange(e.target.value)}
            autoFocus
          />
        ) : (
          <div 
            onClick={() => setIsEditing(true)}
            className="min-h-[7.5rem] p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 cursor-pointer hover:border-indigo-300 transition-all"
          >
            {summary ? (
              <article 
                className="prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-a:text-indigo-600 prose-strong:text-indigo-800"
                style={{ color: 'var(--theme-bold)' }}
                dangerouslySetInnerHTML={{ __html: renderedMarkdown || '' }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-2 text-slate-400">
                <i className="fas fa-pen-fancy text-xl mb-1 opacity-20"></i>
                <span className="italic text-xs">No summary provided. Click here to start writing or use AI below.</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <button 
          onClick={handleStartGeneration}
          disabled={isGenerating}
          className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 hover:opacity-80"
          style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-on-primary)' }}
        >
          {isGenerating ? (
            <><i className="fas fa-circle-notch fa-spin"></i> Analyzing Selection...</>
          ) : (
            <><i className="fas fa-magic"></i> Generate with AI</>
          )}
        </button>

        {isEditing && (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { onSummaryChange(originalSummary); setIsEditing(false); }}
              className="px-4 py-1.5 border border-slate-200 text-slate-600 bg-white rounded-lg text-xs font-bold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md"
              style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-on-primary)' }}
            >
              Submit Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
