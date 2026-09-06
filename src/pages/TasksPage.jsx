import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/common/PageHeader';
import { tasksService } from '../services/tasksService';
import { CheckSquare, AlertCircle, RefreshCw, Calendar, User, Briefcase, FolderKanban } from 'lucide-react';

const COLUMNS = ['Pending', 'In Progress', 'Completed'];

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tasksService.getProjectTasks();
      setTasks(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch project tasks from Supabase');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const getTasksForColumn = (columnTitle) => {
    return tasks.filter((t) => {
      if (!t.status) return false;
      return t.status.toLowerCase().trim() === columnTitle.toLowerCase().trim();
    });
  };

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Visual structural display of project task records and workflow status progression."
      >
        <button
          disabled
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-xs cursor-not-allowed"
        >
          <span>Task Actions</span>
        </button>
      </PageHeader>

      {/* Header Controls Bar */}
      <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Task Records
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {tasks.length} total
          </span>
        </div>
        <button
          onClick={fetchTasks}
          disabled={loading}
          title="Refresh tasks"
          aria-label="Refresh tasks"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50/50 p-6 text-center shadow-xs">
          <div className="mx-auto flex max-w-sm flex-col items-center justify-center">
            <AlertCircle className="h-8 w-8 text-rose-500" />
            <h3 className="mt-2 text-sm font-semibold text-slate-800">Unable to load tasks</h3>
            <p className="mt-1 text-xs text-slate-500">{error}</p>
            <button
              onClick={fetchTasks}
              className="mt-4 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs transition"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* 3-Column Task Board Layout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {COLUMNS.map((colTitle) => {
          const colTasks = getTasksForColumn(colTitle);

          return (
            <div
              key={colTitle}
              className="flex flex-col rounded-xl border border-slate-200 bg-slate-100/60 p-4 min-h-[460px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-sm font-semibold text-slate-700">{colTitle}</span>
                <span className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 shadow-2xs">
                  {loading ? '...' : colTasks.length}
                </span>
              </div>

              {/* Column Body */}
              <div className="flex-1 mt-3 space-y-3">
                {loading ? (
                  <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300/80 bg-white/50 p-6 text-center h-48 animate-pulse">
                    <RefreshCw className="h-5 w-5 text-indigo-500 animate-spin" />
                    <p className="mt-2 text-xs text-slate-500">Loading {colTitle}...</p>
                  </div>
                ) : colTasks.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300/80 bg-white/50 p-6 text-center h-48">
                    <CheckSquare className="h-6 w-6 text-slate-300 mb-1" />
                    <p className="text-xs font-medium text-slate-500">No tasks in {colTitle}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Awaiting tasks from Supabase</p>
                  </div>
                ) : (
                  colTasks.map((t, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-xs hover:shadow-sm transition"
                    >
                      {/* Task Name & Status */}
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-slate-900 leading-snug">
                          {t.task || 'Untitled Task'}
                        </h4>
                        {t.status && (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200 whitespace-nowrap">
                            {t.status}
                          </span>
                        )}
                      </div>

                      {/* Project & Client Details */}
                      <div className="mt-2 space-y-1 text-[11px] text-slate-600 border-t border-slate-100 pt-2">
                        {t.project_name && (
                          <div className="flex items-center gap-1.5 truncate">
                            <FolderKanban className="h-3 w-3 text-slate-400 flex-shrink-0" />
                            <span className="font-medium text-slate-700 truncate">{t.project_name}</span>
                          </div>
                        )}
                        {t.client_name && (
                          <div className="flex items-center gap-1.5 truncate">
                            <User className="h-3 w-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{t.client_name}</span>
                          </div>
                        )}
                        {t.service_required && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Briefcase className="h-3 w-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{t.service_required}</span>
                          </div>
                        )}
                      </div>

                      {/* Footer: Assigned To & Deadline */}
                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
                        <span
                          className="rounded bg-slate-50 px-1.5 py-0.5 text-slate-600 truncate max-w-[120px]"
                          title={t.assigned_to || 'Unassigned'}
                        >
                          {t.assigned_to ? `@${t.assigned_to}` : 'Unassigned'}
                        </span>
                        {t.deadline && (
                          <div className="flex items-center gap-1 text-slate-500 font-mono text-[10px]">
                            <Calendar className="h-3 w-3 text-slate-400 flex-shrink-0" />
                            <span>{t.deadline}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
