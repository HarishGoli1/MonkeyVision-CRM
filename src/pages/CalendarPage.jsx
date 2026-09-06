import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/common/PageHeader';
import { projectsService } from '../services/projectsService';
import { tasksService } from '../services/tasksService';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  CheckSquare,
  AlertCircle,
  RefreshCw,
  User,
  Info,
} from 'lucide-react';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function parseDeadlineDate(dateStr) {
  if (!dateStr) return null;
  try {
    const isoMatch = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const y = parseInt(isoMatch[1], 10);
      const m = parseInt(isoMatch[2], 10) - 1;
      const d = parseInt(isoMatch[3], 10);
      const utcDate = new Date(Date.UTC(y, m, d));
      return isNaN(utcDate.getTime()) ? null : new Date(y, m, d);
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

export default function CalendarPage() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  const [projectEvents, setProjectEvents] = useState([]);
  const [taskEvents, setTaskEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [projects, tasks] = await Promise.all([
        projectsService.getProjects(),
        tasksService.getProjectTasks(),
      ]);

      // Project calendar items: Project Name, Client Name, Deadline, Status
      const pe = (projects || [])
        .filter((p) => p.deadline)
        .map((p) => ({
          type: 'project',
          date: parseDeadlineDate(p.deadline),
          rawDeadline: p.deadline,
          projectName: p.project_name || 'Untitled Project',
          clientName: p.client_name || '--',
          status: p.status || '--',
        }))
        .filter((e) => e.date !== null);

      // Task calendar items: Task, Project Name, Client Name, Deadline, Status
      const te = (tasks || [])
        .filter((t) => t.deadline)
        .map((t) => ({
          type: 'task',
          date: parseDeadlineDate(t.deadline),
          rawDeadline: t.deadline,
          taskName: t.task || 'Untitled Task',
          projectName: t.project_name || '--',
          clientName: t.client_name || '--',
          status: t.status || '--',
        }))
        .filter((e) => e.date !== null);

      setProjectEvents(pe);
      setTaskEvents(te);
    } catch (err) {
      setError(err.message || 'Failed to fetch calendar deadlines from Supabase');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const prevMonth = () => {
    setSelectedDay(null);
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    setSelectedDay(null);
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    setSelectedDay(today.getDate());
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth); // 0=Sun
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const getEventsForDay = (dayNum) => {
    const pe = projectEvents.filter(
      (e) =>
        e.date.getFullYear() === viewYear &&
        e.date.getMonth() === viewMonth &&
        e.date.getDate() === dayNum
    );
    const te = taskEvents.filter(
      (e) =>
        e.date.getFullYear() === viewYear &&
        e.date.getMonth() === viewMonth &&
        e.date.getDate() === dayNum
    );
    return { pe, te };
  };

  const totalEvents = projectEvents.length + taskEvents.length;
  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : null;

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Project and task deadlines derived from existing Supabase records."
      >
        <button
          disabled
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-xs cursor-not-allowed"
        >
          <span>Calendar Actions</span>
        </button>
      </PageHeader>

      {/* Calendar Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-slate-800 min-w-[140px] text-center">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={goToToday}
            className="ml-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="flex items-center gap-3 text-[11px] text-slate-500 hidden sm:flex">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-indigo-500" />
              Project Deadline
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-500" />
              Task Deadline
            </span>
          </div>

          <button
            onClick={fetchEvents}
            disabled={loading}
            title="Refresh calendar data"
            aria-label="Refresh calendar data"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50/50 p-5 flex items-center gap-3 shadow-xs">
          <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-slate-800">Unable to load calendar data</p>
            <p className="text-xs text-slate-500">{error}</p>
          </div>
          <button
            onClick={fetchEvents}
            className="ml-auto rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats bar */}
      {!loading && !error && (
        <div className="mb-4 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <FolderKanban className="h-3.5 w-3.5 text-indigo-500" />
            {projectEvents.length} project deadline{projectEvents.length !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1.5">
            <CheckSquare className="h-3.5 w-3.5 text-amber-500" />
            {taskEvents.length} task deadline{taskEvents.length !== 1 ? 's' : ''}
          </span>
          {selectedDay && (
            <span className="ml-auto text-indigo-600 font-medium cursor-pointer hover:underline" onClick={() => setSelectedDay(null)}>
              Clear day selection ({MONTH_NAMES[viewMonth]} {selectedDay})
            </span>
          )}
        </div>
      )}

      {/* Calendar Grid */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/75 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 py-2.5">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[460px]">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="h-7 w-7 text-indigo-600 animate-spin" />
              <p className="text-sm font-medium text-slate-600">Loading deadline events...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[460px]">
            {Array.from({ length: totalCells }).map((_, cellIdx) => {
              const dayNum = cellIdx - firstDay + 1;
              const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
              const isToday =
                isCurrentMonth &&
                dayNum === today.getDate() &&
                viewMonth === today.getMonth() &&
                viewYear === today.getFullYear();

              const isSelected = isCurrentMonth && selectedDay === dayNum;

              const { pe: dayProjects, te: dayTasks } = isCurrentMonth
                ? getEventsForDay(dayNum)
                : { pe: [], te: [] };

              const hasEvents = dayProjects.length > 0 || dayTasks.length > 0;

              return (
                <div
                  key={cellIdx}
                  onClick={() => isCurrentMonth && setSelectedDay(isSelected ? null : dayNum)}
                  className={`p-1.5 min-h-[90px] flex flex-col transition cursor-pointer ${
                    isCurrentMonth ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/40 cursor-default'
                  } ${isSelected ? 'ring-2 ring-indigo-500 ring-inset bg-indigo-50/20' : ''}`}
                >
                  {/* Day header */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-medium inline-flex h-5 w-5 items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-indigo-600 text-white font-bold'
                          : isSelected
                          ? 'bg-indigo-100 text-indigo-700 font-bold'
                          : isCurrentMonth
                          ? 'text-slate-700'
                          : 'text-slate-300'
                      }`}
                    >
                      {isCurrentMonth ? dayNum : ''}
                    </span>
                    {hasEvents && isCurrentMonth && (
                      <span className="text-[10px] font-medium text-slate-400">
                        {dayProjects.length + dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Events preview in cell */}
                  {isCurrentMonth && (
                    <div className="flex flex-col gap-1 overflow-hidden">
                      {dayProjects.map((ev, i) => (
                        <div
                          key={`p-${i}`}
                          title={`Project: ${ev.projectName} | Client: ${ev.clientName} | Status: ${ev.status} | Deadline: ${ev.rawDeadline}`}
                          className="w-full rounded bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 truncate flex items-center justify-between gap-1"
                        >
                          <div className="flex items-center gap-1 min-w-0 truncate">
                            <FolderKanban className="h-2.5 w-2.5 text-indigo-500 flex-shrink-0" />
                            <span className="truncate">{ev.projectName}</span>
                          </div>
                          {ev.status && (
                            <span className="text-[9px] text-indigo-500 font-normal whitespace-nowrap flex-shrink-0">
                              {ev.status}
                            </span>
                          )}
                        </div>
                      ))}
                      {dayTasks.map((ev, i) => (
                        <div
                          key={`t-${i}`}
                          title={`Task: ${ev.taskName} | Project: ${ev.projectName} | Client: ${ev.clientName} | Status: ${ev.status} | Deadline: ${ev.rawDeadline}`}
                          className="w-full rounded bg-amber-50 border border-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 truncate flex items-center justify-between gap-1"
                        >
                          <div className="flex items-center gap-1 min-w-0 truncate">
                            <CheckSquare className="h-2.5 w-2.5 text-amber-500 flex-shrink-0" />
                            <span className="truncate">{ev.taskName}</span>
                          </div>
                          {ev.status && (
                            <span className="text-[9px] text-amber-600 font-normal whitespace-nowrap flex-shrink-0">
                              {ev.status}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state overlay when no events exist at all */}
        {!loading && !error && totalEvents === 0 && (
          <div className="border-t border-slate-100 bg-slate-50/50 p-6 text-center">
            <CalendarIcon className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm font-semibold text-slate-700">No Deadline Events</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              No project or task deadlines found in the Supabase records. Events will appear here once records with deadlines are available.
            </p>
          </div>
        )}
      </div>

      {/* Selected Day Detailed Inspector */}
      {selectedDay && selectedDayEvents && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-800">
                Deadlines for {MONTH_NAMES[viewMonth]} {selectedDay}, {viewYear}
              </h3>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>

          {selectedDayEvents.pe.length === 0 && selectedDayEvents.te.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No project or task deadlines scheduled for this date.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Projects on selected day */}
              {selectedDayEvents.pe.map((item, idx) => (
                <div
                  key={`pe-detail-${idx}`}
                  className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-3.5 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                      <span className="text-xs font-semibold text-slate-900 leading-snug">
                        {item.projectName}
                      </span>
                    </div>
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                      {item.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-indigo-100/60">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3 text-slate-400" />
                      <span>Client: <strong className="text-slate-700">{item.clientName}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                      <CalendarIcon className="h-3 w-3 text-slate-400" />
                      <span>Deadline: {item.rawDeadline}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Tasks on selected day */}
              {selectedDayEvents.te.map((item, idx) => (
                <div
                  key={`te-detail-${idx}`}
                  className="rounded-lg border border-amber-100 bg-amber-50/40 p-3.5 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-amber-600 flex-shrink-0" />
                      <span className="text-xs font-semibold text-slate-900 leading-snug">
                        {item.taskName}
                      </span>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                      {item.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-amber-100/60">
                    <div className="flex items-center gap-1.5">
                      <FolderKanban className="h-3 w-3 text-slate-400" />
                      <span>Project: <strong className="text-slate-700">{item.projectName}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3 text-slate-400" />
                      <span>Client: <strong className="text-slate-700">{item.clientName}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                      <CalendarIcon className="h-3 w-3 text-slate-400" />
                      <span>Deadline: {item.rawDeadline}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
