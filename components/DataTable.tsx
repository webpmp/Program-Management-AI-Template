
import React from 'react';
import { ThemeConfig } from '../types';

interface Column<T> {
  header: string;
  accessor: keyof T;
  width?: string; // Tailwind width class, e.g., 'w-48'
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  title: string;
  description: string;
  data: T[];
  columns: Column<T>[];
  onAddRow?: () => void;
  addButtonLabel?: string;
  theme?: ThemeConfig;
}

export const DataTable = <T extends { id: string },>({ 
  title, 
  description, 
  data, 
  columns,
  onAddRow,
  addButtonLabel = "Add Row",
  theme
}: DataTableProps<T>) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        {onAddRow && (
          <button 
            onClick={onAddRow}
            className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 shadow-sm hover:opacity-90"
            style={{ 
              backgroundColor: 'var(--theme-primary)', 
              color: 'var(--theme-on-primary)' 
            }}
          >
            <i className="fas fa-plus text-xs"></i> {addButtonLabel}
          </button>
        )}
      </div>
      {/* Changed overflow-x-auto to overflow-x-hidden to prevent scrollable sections */}
      <div className="overflow-x-hidden overflow-y-visible">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={`px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${col.width || ''}`}
                >
                  <span className="truncate block" title={col.header}>{col.header}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                {columns.map((col, idx) => (
                  <td key={idx} className={`px-6 py-4 text-sm text-slate-600 align-top ${col.width || ''}`}>
                    <div className="relative">
                      {col.render ? col.render(item) : (item[col.accessor] as React.ReactNode)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-slate-400 italic">
                  No data available. Add a row to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
