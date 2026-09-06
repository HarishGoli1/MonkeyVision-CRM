import React from 'react';

export default function PlaceholderCard({ 
  title, 
  subtitle, 
  icon: Icon, 
  badgeText, 
  heightClass = "min-h-[160px]",
  children 
}) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md ${heightClass} flex flex-col justify-between`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {badgeText && (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {badgeText}
          </span>
        )}
      </div>

      <div className="mt-4 flex-1">
        {children || (
          <div className="flex h-full flex-col justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-4 text-center">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Placeholder Area</p>
            <p className="mt-1 text-xs text-slate-400">Content module to be integrated</p>
          </div>
        )}
      </div>
    </div>
  );
}
